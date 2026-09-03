import { db } from '../db';
import { assessmentInputs, schemeConfigs, financialRuns, repaymentScheduleItems } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
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
      if (input.inputKey === 'available_margin_capital') result.availableMarginCapital = val;
      else if (input.inputKey === 'expected_monthly_revenue') result.expectedMonthlyRevenue = val;
      else if (input.inputKey === 'expected_monthly_operating_cost') result.expectedMonthlyOperatingCost = val;
      else if (input.inputKey === 'requested_tenure_months') result.requestedTenureMonths = Number(val);
      else if (input.inputKey === 'requested_interest_rate') result.requestedInterestRate = val;
      else if (input.inputKey === 'requested_moratorium_months') result.requestedMoratoriumMonths = Number(val);
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
  // 1. Resolve scheme
  const availableMarginCapital = new Decimal(inputs.availableMarginCapital);
  const projectCost = availableMarginCapital.mul(10);
  
  const schemeCode = resolveScheme(projectCost);
  
  if (schemeCode === 'NOT_ELIGIBLE') {
    return {
      status: 'NOT_ELIGIBLE',
      projectCost: projectCost.toNumber(),
      message: 'Project cost exceeds maximum eligible amount'
    };
  }

  // 2. Fetch scheme config
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

  // 3. Convert scheme DB entity to domain SchemeConfig without losing string precision
  const schemeConfigDomain = {
    ...scheme,
    minProjectCost: scheme.minProjectCost ?? null,
    maxProjectCost: scheme.maxProjectCost ?? null,
    financingPercentage: scheme.financingPercentage ?? null,
    maxLoanAmount: scheme.maxLoanAmount ?? null,
    interestRate: scheme.interestRate ?? null,
  };

  // 4. Run deterministic calculation
  const result = runFinanceCalculation(inputs, schemeConfigDomain);

  // 5. Persist run and schedule in transaction
  return await db.transaction(async (tx) => {
    const [run] = await tx.insert(financialRuns).values({
      assessmentId,
      schemeConfigId: scheme.id,
      projectCost: String(result.loanStructure.projectCost),
      ownContribution: String(result.loanStructure.requiredOwnContribution),
      loanAmount: String(result.loanStructure.loanAmount),
      monthlyRevenue: inputs.expectedMonthlyRevenue !== undefined && inputs.expectedMonthlyRevenue !== null ? String(inputs.expectedMonthlyRevenue) : null,
      monthlyOperatingCost: inputs.expectedMonthlyOperatingCost !== undefined && inputs.expectedMonthlyOperatingCost !== null ? String(inputs.expectedMonthlyOperatingCost) : null,
      interestRate: String(scheme.interestRate),
      tenureMonths: scheme.tenureMonths!,
      moratoriumMonths: scheme.moratoriumMonths!,
      paymentFrequency: scheme.paymentFrequency!,
      emi: null, // Depending on if frequency is MONTHLY, otherwise installmentAmount covers it
      installmentAmount: String(result.installmentAmount),
      annualDebtService: result.dscrResult.annualDebtService ? String(result.dscrResult.annualDebtService) : null,
      dscr: result.dscrResult.dscr ? String(result.dscrResult.dscr) : null,
      totalInterest: String(result.totalInterest),
      totalRepayment: String(result.totalRepayment),
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
      financeResult: result,
      schemeCode,
    };
  });
}
