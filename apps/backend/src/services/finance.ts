import { db } from '../db';
import { assessmentInputs, schemeConfigs, financialRuns, repaymentScheduleItems } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { FinancialInputs } from '../modules/finance/schemas/finance.schema';
import { 
  resolveScheme, 
  runFinanceCalculation, 
  FINANCE_CALCULATION_VERSION 
} from '../modules/finance/domain/calculator';
import Decimal from 'decimal.js';

export async function getFinanceInputsForAssessment(assessmentId: string): Promise<Partial<FinancialInputs>> {
  const inputs = await db
    .select()
    .from(assessmentInputs)
    .where(eq(assessmentInputs.assessmentId, assessmentId));

  const result: Partial<FinancialInputs> = {};

  for (const input of inputs) {
    if (input.valueNumber !== null && input.valueNumber !== undefined) {
      const val = input.valueNumber;
      // Canonicalize own contribution aliases
      if (input.inputKey === 'own_contribution' || input.inputKey === 'available_margin_capital' || input.inputKey === 'initial_own_capital') {
        result.ownContribution = val;
        result.availableMarginCapital = val;
      } else if (input.inputKey === 'project_cost' || input.inputKey === 'estimated_total_project_cost' || input.inputKey === 'estimated_project_cost') {
        result.projectCost = val;
      } else if (input.inputKey === 'available_cash_funds' || input.inputKey === 'cash_savings') {
        result.availableCashFunds = val;
      } else if (input.inputKey === 'expected_monthly_revenue') {
        result.expectedMonthlyRevenue = val;
      } else if (input.inputKey === 'expected_monthly_operating_cost') {
        result.expectedMonthlyOperatingCost = val;
      } else if (input.inputKey === 'requested_tenure_months') {
        result.requestedTenureMonths = Number(val);
      } else if (input.inputKey === 'requested_interest_rate') {
        result.requestedInterestRate = val;
      } else if (input.inputKey === 'requested_moratorium_months') {
        result.requestedMoratoriumMonths = Number(val);
      }
    }
    if (input.valueText !== null && input.valueText !== undefined) {
      if (input.inputKey === 'requested_moratorium_interest_treatment') {
        result.requestedMoratoriumInterestTreatment = input.valueText as any;
      } else if (input.inputKey === 'requested_payment_frequency') {
        result.requestedPaymentFrequency = input.valueText as any;
      }
    }
  }

  return result;
}

export async function runAndPersistFinanceCalculation(assessmentId: string, inputs: FinancialInputs) {
  // 1. Determine project cost
  let projectCost: Decimal;
  const rawMargin = inputs.ownContribution ?? inputs.availableMarginCapital;

  if (inputs.projectCost !== undefined && inputs.projectCost !== null && inputs.projectCost !== '') {
    projectCost = new Decimal(inputs.projectCost);
  } else if (rawMargin !== undefined && rawMargin !== null && rawMargin !== '') {
    // 10% minimum margin derived project cost
    projectCost = new Decimal(rawMargin).mul(10);
  } else {
    throw new Error('Either projectCost or own contribution must be provided.');
  }

  // 2. Resolve scheme
  const schemeCode = resolveScheme(projectCost);
  
  if (schemeCode === 'NOT_ELIGIBLE') {
    return {
      status: 'NOT_ELIGIBLE',
      projectCost: projectCost.toNumber(),
      message: projectCost.gt(5000000)
        ? 'Project cost exceeds the maximum eligible limit of ₹50,00,000 for government financing schemes.'
        : 'Project cost must be greater than ₹0 to be eligible for financing.',
    };
  }

  // 3. Fetch scheme config from DB
  const [scheme] = await db
    .select()
    .from(schemeConfigs)
    .where(
      and(
        eq(schemeConfigs.schemeCode, schemeCode),
        eq(schemeConfigs.isActive, true)
      )
    )
    .limit(1);

  if (!scheme) {
    throw new Error(`Active scheme configuration not found for code: ${schemeCode}`);
  }

  // 4. Convert scheme DB entity to domain SchemeConfig without losing string precision
  const schemeConfigDomain = {
    ...scheme,
    minProjectCost: scheme.minProjectCost ?? null,
    maxProjectCost: scheme.maxProjectCost ?? null,
    financingPercentage: scheme.financingPercentage ?? null,
    maxLoanAmount: scheme.maxLoanAmount ?? null,
    interestRate: scheme.interestRate ?? null,
  };

  // 5. Run deterministic calculation
  const result = runFinanceCalculation(inputs, schemeConfigDomain);

  // 6. Persist run and schedule in transaction
  return await db.transaction(async (tx) => {
    const [run] = await tx.insert(financialRuns).values({
      assessmentId,
      schemeConfigId: scheme.id,
      projectCost: String(result.loanStructure.projectCost),
      ownContribution: String(result.loanStructure.availableMarginCapital),
      loanAmount: String(result.loanStructure.loanAmount),
      monthlyRevenue: inputs.expectedMonthlyRevenue !== undefined && inputs.expectedMonthlyRevenue !== null ? String(inputs.expectedMonthlyRevenue) : null,
      monthlyOperatingCost: inputs.expectedMonthlyOperatingCost !== undefined && inputs.expectedMonthlyOperatingCost !== null ? String(inputs.expectedMonthlyOperatingCost) : null,
      interestRate: String(scheme.interestRate),
      tenureMonths: scheme.tenureMonths!,
      moratoriumMonths: scheme.moratoriumMonths!,
      paymentFrequency: scheme.paymentFrequency!,
      emi: null,
      installmentAmount: result.isScheduleCalculable ? String(result.installmentAmount) : null,
      annualDebtService: result.dscrResult.annualDebtService ? String(result.dscrResult.annualDebtService) : null,
      dscr: result.dscrResult.dscr ? String(result.dscrResult.dscr) : null,
      totalInterest: result.isScheduleCalculable ? String(result.totalInterest) : null,
      totalRepayment: result.isScheduleCalculable ? String(result.totalRepayment) : null,
      calculationVersion: result.calculationVersion,
    }).returning();

    if (result.schedule.length > 0) {
      // Calculate chronological dates based on run start date and frequency
      const runDate = new Date();
      let currentPeriodStartDate = new Date(runDate);
      const monthsPerPeriod = scheme.paymentFrequency === 'YEARLY' ? 12 : (scheme.paymentFrequency === 'QUARTERLY' ? 3 : 1);

      const scheduleRows = result.schedule.map(item => {
        const periodStartStr = currentPeriodStartDate.toISOString().split('T')[0];
        
        // advance end date by monthsPerPeriod
        const currentPeriodEndDate = new Date(currentPeriodStartDate);
        currentPeriodEndDate.setUTCMonth(currentPeriodEndDate.getUTCMonth() + monthsPerPeriod);
        const periodEndStr = currentPeriodEndDate.toISOString().split('T')[0];
        
        currentPeriodStartDate = new Date(currentPeriodEndDate); // next period starts when this one ends

        return {
          financialRunId: run.id,
          sequenceNumber: item.sequenceNumber,
          periodStart: periodStartStr,
          periodEnd: periodEndStr,
          dueDate: periodEndStr, // due date is at end of period
          openingPrincipal: String(item.openingPrincipal),
          principalPayment: String(item.principalPayment),
          interestPayment: String(item.interestPayment),
          installmentAmount: String(item.installmentAmount),
          closingPrincipal: String(item.closingPrincipal),
          isMoratorium: item.isMoratorium,
        };
      });
      await tx.insert(repaymentScheduleItems).values(scheduleRows);

      // Attach generated dates to the returned schedule for the API response
      result.schedule = result.schedule.map((item, index) => ({
        ...item,
        periodStart: scheduleRows[index].periodStart,
        periodEnd: scheduleRows[index].periodEnd,
        dueDate: scheduleRows[index].dueDate,
      }));
    }

    return {
      status: 'SUCCESS',
      runId: run.id,
      schemeCode,
      schemeName: scheme.schemeName,
      financeResult: result,
    };
  });
}

export async function getLatestFinancialRun(assessmentId: string) {
  const latestRun = await db
    .select()
    .from(financialRuns)
    .where(eq(financialRuns.assessmentId, assessmentId))
    .orderBy(desc(financialRuns.createdAt))
    .limit(1);

  if (!latestRun.length) {
    return null;
  }

  const run = latestRun[0];

  const schedule = await db
    .select()
    .from(repaymentScheduleItems)
    .where(eq(repaymentScheduleItems.financialRunId, run.id))
    .orderBy(repaymentScheduleItems.sequenceNumber);

  let scheme = null;
  if (run.schemeConfigId) {
    const schemes = await db
      .select()
      .from(schemeConfigs)
      .where(eq(schemeConfigs.id, run.schemeConfigId))
      .limit(1);
    scheme = schemes[0] || null;
  }

  return {
    run,
    schedule,
    scheme,
  };
}
