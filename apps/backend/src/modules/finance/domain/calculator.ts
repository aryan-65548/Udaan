import Decimal from 'decimal.js';
import { SchemeConfig, FinancialInputs, PaymentFrequency } from '../schemas/finance.schema';

// Set up default decimal precision to avoid runaway decimals, e.g. 20 is sufficient for finance
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export const FINANCE_CALCULATION_VERSION = 'v1';

export type MoratoriumInterestTreatment = 'CAPITALIZE' | 'PAY_CURRENT' | 'UNKNOWN';

export function resolveScheme(projectCost: Decimal): 'MICRO_FINANCE' | 'TERM_LOAN' | 'NOT_ELIGIBLE' {
  if (projectCost.lte(0)) {
    return 'NOT_ELIGIBLE';
  } else if (projectCost.lte(140000)) {
    return 'MICRO_FINANCE';
  } else if (projectCost.gt(140000) && projectCost.lte(5000000)) {
    return 'TERM_LOAN';
  } else {
    return 'NOT_ELIGIBLE';
  }
}

export interface LoanStructure {
  projectCost: Decimal;
  availableMarginCapital: Decimal;
  requiredOwnContribution: Decimal;
  shortfall: Decimal;
  baseLoanAmount: Decimal;
  loanAmount: Decimal;
  theoretical10PercentMargin: Decimal;
  financingPercentage: Decimal;
}

export function calculateLoanStructure(inputs: FinancialInputs, scheme: SchemeConfig): LoanStructure {
  let projectCost: Decimal;
  let availableMarginCapital: Decimal;

  const rawMargin = inputs.ownContribution ?? inputs.availableMarginCapital;
  if (rawMargin !== undefined && rawMargin !== null && rawMargin !== '') {
    availableMarginCapital = new Decimal(rawMargin);
  } else {
    availableMarginCapital = new Decimal(0);
  }

  if (inputs.projectCost !== undefined && inputs.projectCost !== null && inputs.projectCost !== '') {
    projectCost = new Decimal(inputs.projectCost);
  } else if (rawMargin !== undefined && rawMargin !== null && rawMargin !== '') {
    // 10% minimum margin derived calculation when project cost is not explicitly provided
    projectCost = availableMarginCapital.mul(10);
  } else {
    throw new Error('Either projectCost or own contribution must be provided.');
  }

  if (projectCost.lt(0)) {
    throw new Error('Project cost cannot be negative');
  }
  if (availableMarginCapital.lt(0)) {
    throw new Error('Own contribution cannot be negative');
  }

  // Validate limits if defined by the scheme
  if (scheme.minProjectCost !== null && scheme.minProjectCost !== undefined) {
    if (projectCost.lt(scheme.minProjectCost)) {
      throw new Error(`Project cost cannot be less than scheme minimum of ${scheme.minProjectCost}`);
    }
  }

  if (scheme.maxProjectCost !== null && scheme.maxProjectCost !== undefined) {
    if (projectCost.gt(scheme.maxProjectCost)) {
      throw new Error(`Project cost cannot exceed scheme maximum of ${scheme.maxProjectCost}`);
    }
  }

  // Determine loan amount based on scheme financing percentage (default 90%)
  const finPct = scheme.financingPercentage !== null && scheme.financingPercentage !== undefined
    ? new Decimal(scheme.financingPercentage)
    : new Decimal(90);

  const rawBaseLoan = projectCost.mul(finPct).div(100);
  let baseLoanAmount = rawBaseLoan;

  if (scheme.maxLoanAmount !== null && scheme.maxLoanAmount !== undefined) {
    const maxLoan = new Decimal(scheme.maxLoanAmount);
    if (baseLoanAmount.gt(maxLoan)) {
      baseLoanAmount = maxLoan;
    }
  }

  if (baseLoanAmount.lt(0)) {
    baseLoanAmount = new Decimal(0);
  }

  // Actual required own contribution based on final loan
  const requiredOwnContribution = projectCost.minus(baseLoanAmount);

  // Shortfall = required - available
  let shortfall = requiredOwnContribution.minus(availableMarginCapital);
  if (shortfall.lt(0)) {
    shortfall = new Decimal(0);
  }

  const theoretical10PercentMargin = projectCost.mul(0.10);

  return {
    projectCost: projectCost.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
    availableMarginCapital: availableMarginCapital.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
    requiredOwnContribution: requiredOwnContribution.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
    shortfall: shortfall.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
    baseLoanAmount: rawBaseLoan.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
    loanAmount: baseLoanAmount.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
    theoretical10PercentMargin: theoretical10PercentMargin.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
    financingPercentage: finPct.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
  };
}

export function getPeriodsPerYear(frequency: PaymentFrequency): number {
  switch (frequency) {
    case 'MONTHLY': return 12;
    case 'QUARTERLY': return 4;
    case 'YEARLY': return 1;
    default: throw new Error(`Unsupported payment frequency: ${frequency}`);
  }
}

export function calculatePeriodicInstallment(
  principal: Decimal,
  annualInterestRate: Decimal,
  tenureMonths: number,
  frequency: PaymentFrequency
): Decimal {
  if (principal.lte(0)) return new Decimal(0);
  if (tenureMonths <= 0) throw new Error('Tenure must be strictly positive');

  const periodsPerYear = getPeriodsPerYear(frequency);
  const monthsPerPeriod = 12 / periodsPerYear;

  if (tenureMonths % monthsPerPeriod !== 0) {
    throw new Error(`Tenure months (${tenureMonths}) must be a multiple of the payment period length (${monthsPerPeriod} months) for ${frequency} frequency`);
  }

  const totalPeriods = tenureMonths / monthsPerPeriod;

  // If 0 interest rate, simple division
  if (annualInterestRate.lte(0)) {
    return principal.div(totalPeriods).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  }

  // Periodic interest rate = Annual Rate / (100 * periodsPerYear)
  const periodicRate = annualInterestRate.div(100).div(periodsPerYear);

  // Installment = P * r * (1 + r)^n / ((1 + r)^n - 1)
  const onePlusRToN = periodicRate.plus(1).pow(totalPeriods);
  const numerator = principal.mul(periodicRate).mul(onePlusRToN);
  const denominator = onePlusRToN.minus(1);

  return numerator.div(denominator).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

export function calculateEMI(
  principal: Decimal,
  annualInterestRate: Decimal,
  tenureMonths: number
): Decimal {
  return calculatePeriodicInstallment(principal, annualInterestRate, tenureMonths, 'MONTHLY');
}

export interface DSCRResult {
  monthlyProjectedRevenue: Decimal | null;
  monthlyOperatingCosts: Decimal | null;
  monthlyOperatingSurplus: Decimal | null;
  annualOperatingSurplus: Decimal | null;
  annualCashAvailable: Decimal | null;
  annualDebtService: Decimal;
  dscr: Decimal | null;
  status: 'SUFFICIENT' | 'TIGHT' | 'INSUFFICIENT' | 'UNAVAILABLE';
  explanation: string;
}

export function calculateDSCR(
  expectedMonthlyRevenue: Decimal | null,
  expectedMonthlyOperatingCost: Decimal | null,
  periodicInstallment: Decimal,
  frequency: PaymentFrequency
): DSCRResult {
  const periodsPerYear = getPeriodsPerYear(frequency);
  const annualDebtService = periodicInstallment.mul(periodsPerYear).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

  if (expectedMonthlyRevenue === null || expectedMonthlyRevenue === undefined ||
      expectedMonthlyOperatingCost === null || expectedMonthlyOperatingCost === undefined) {
    return {
      monthlyProjectedRevenue: null,
      monthlyOperatingCosts: null,
      monthlyOperatingSurplus: null,
      annualOperatingSurplus: null,
      annualCashAvailable: null,
      annualDebtService,
      dscr: null,
      status: 'UNAVAILABLE',
      explanation: 'DSCR cannot be computed because projected revenue or operating cost inputs are not provided.',
    };
  }

  const rev = expectedMonthlyRevenue.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  const cost = expectedMonthlyOperatingCost.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

  const monthlyOperatingSurplus = rev.minus(cost).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  const annualOperatingSurplus = monthlyOperatingSurplus.mul(12).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  const annualCashAvailable = annualOperatingSurplus;

  let dscr: Decimal | null = null;
  let status: 'SUFFICIENT' | 'TIGHT' | 'INSUFFICIENT' | 'UNAVAILABLE' = 'UNAVAILABLE';
  let explanation = '';

  if (annualDebtService.gt(0)) {
    dscr = annualOperatingSurplus.div(annualDebtService).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    if (dscr.gte(1.5)) {
      status = 'SUFFICIENT';
      explanation = 'Strong debt service coverage: projected operating cash flow comfortably covers scheduled loan repayments with an adequate safety buffer (DSCR >= 1.5).';
    } else if (dscr.gte(1.0)) {
      status = 'TIGHT';
      explanation = 'Moderate debt service coverage: projected operating cash flow meets debt obligations but with a tight margin (1.0 <= DSCR < 1.5).';
    } else {
      status = 'INSUFFICIENT';
      explanation = 'Insufficient debt service coverage: projected operating surplus is less than scheduled debt obligations, posing repayment risk (DSCR < 1.0).';
    }
  } else if (annualOperatingSurplus.gte(0)) {
    explanation = 'No scheduled debt service obligation active for this calculation.';
  } else {
    status = 'INSUFFICIENT';
    explanation = 'Negative operating surplus with zero debt service.';
  }

  return {
    monthlyProjectedRevenue: rev,
    monthlyOperatingCosts: cost,
    monthlyOperatingSurplus,
    annualOperatingSurplus,
    annualCashAvailable,
    annualDebtService,
    dscr,
    status,
    explanation,
  };
}

export interface ScheduleItem {
  sequenceNumber: number;
  openingPrincipal: Decimal;
  principalPayment: Decimal;
  interestPayment: Decimal;
  installmentAmount: Decimal;
  closingPrincipal: Decimal;
  isMoratorium: boolean;
  periodStart?: string;
  periodEnd?: string;
  dueDate?: string;
}

export function generateRepaymentSchedule(
  principal: Decimal,
  annualInterestRate: Decimal,
  tenureMonths: number,
  moratoriumMonths: number,
  frequency: PaymentFrequency,
  moratoriumInterestTreatment: MoratoriumInterestTreatment
): ScheduleItem[] {
  if (moratoriumMonths > 0 && moratoriumInterestTreatment === 'UNKNOWN') {
    throw new Error('Moratorium interest treatment is UNKNOWN. Cannot compute exact repayment schedule.');
  }

  const schedule: ScheduleItem[] = [];
  const periodsPerYear = getPeriodsPerYear(frequency);
  const monthsPerPeriod = 12 / periodsPerYear;

  if (tenureMonths % monthsPerPeriod !== 0) {
    throw new Error(`Tenure months (${tenureMonths}) must be a multiple of the payment period length (${monthsPerPeriod} months) for ${frequency} frequency`);
  }

  if (moratoriumMonths > 0 && moratoriumMonths % monthsPerPeriod !== 0) {
    throw new Error(`Moratorium months (${moratoriumMonths}) must be a multiple of the payment period length (${monthsPerPeriod} months) for ${frequency} frequency`);
  }

  const periodicRate = annualInterestRate.div(100).div(periodsPerYear);
  let currentPrincipal = new Decimal(principal);
  let sequenceNumber = 1;

  // Moratorium periods
  const moratoriumPeriods = moratoriumMonths / monthsPerPeriod;

  for (let i = 0; i < moratoriumPeriods; i++) {
    const interestPayment = currentPrincipal.mul(periodicRate).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    const principalPayment = new Decimal(0);
    let installmentAmount = new Decimal(0);
    let closingPrincipal = currentPrincipal;

    if (moratoriumInterestTreatment === 'CAPITALIZE') {
      closingPrincipal = currentPrincipal.plus(interestPayment);
    } else if (moratoriumInterestTreatment === 'PAY_CURRENT') {
      installmentAmount = interestPayment;
    }

    schedule.push({
      sequenceNumber: sequenceNumber++,
      openingPrincipal: currentPrincipal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      principalPayment: principalPayment.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      interestPayment: interestPayment.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      installmentAmount: installmentAmount.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      closingPrincipal: closingPrincipal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      isMoratorium: true,
    });

    currentPrincipal = closingPrincipal;
  }

  // Active repayment periods
  const repaymentTenureMonths = tenureMonths - (moratoriumMonths);
  if (repaymentTenureMonths <= 0 && currentPrincipal.gt(0)) {
     throw new Error("Moratorium covers entire tenure, cannot amortize loan.");
  }

  const totalRepaymentPeriods = repaymentTenureMonths / monthsPerPeriod;
  const periodicInstallment = calculatePeriodicInstallment(currentPrincipal, annualInterestRate, repaymentTenureMonths, frequency);

  for (let i = 0; i < totalRepaymentPeriods; i++) {
    const isLastPeriod = i === totalRepaymentPeriods - 1;
    const interestPayment = currentPrincipal.mul(periodicRate).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    let principalPayment = periodicInstallment.minus(interestPayment).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    let closingPrincipal = currentPrincipal.minus(principalPayment).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    let finalInstallment = periodicInstallment;

    // Handle exact principal absorption on the final period
    if (isLastPeriod) {
      principalPayment = currentPrincipal;
      finalInstallment = principalPayment.plus(interestPayment);
      closingPrincipal = new Decimal(0);
    }

    schedule.push({
      sequenceNumber: sequenceNumber++,
      openingPrincipal: currentPrincipal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      principalPayment: principalPayment.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      interestPayment: interestPayment.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      installmentAmount: finalInstallment.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      closingPrincipal: closingPrincipal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      isMoratorium: false,
    });

    currentPrincipal = closingPrincipal;
  }

  return schedule;
}

export interface FullFinanceResult {
  loanStructure: LoanStructure;
  annualInterestRate: Decimal;
  quarterlyPeriodicRate: Decimal;
  totalTenureMonths: number;
  moratoriumMonths: number;
  activeRepaymentMonths: number;
  numberOfRepayments: number;
  paymentFrequency: PaymentFrequency;
  moratoriumInterestTreatment: MoratoriumInterestTreatment;
  installmentAmount: Decimal;
  annualDebtService: Decimal;
  dscrResult: DSCRResult;
  schedule: ScheduleItem[];
  totalPrincipal: Decimal;
  totalInterest: Decimal;
  totalRepayment: Decimal;
  isScheduleCalculable: boolean;
  scheduleUnavailableReason?: string;
  calculationVersion: string;
}

export function runFinanceCalculation(inputs: FinancialInputs, scheme: SchemeConfig): FullFinanceResult {
  const loanStructure = calculateLoanStructure(inputs, scheme);

  const annualInterestRate = new Decimal(
    inputs.requestedInterestRate ?? scheme.interestRate ?? 0
  ).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);

  const tenureMonths = inputs.requestedTenureMonths ?? scheme.tenureMonths;
  if (!tenureMonths) {
    throw new Error("Tenure months must be provided either by user or scheme config.");
  }

  const moratoriumMonths = inputs.requestedMoratoriumMonths ?? scheme.moratoriumMonths ?? 0;
  const activeRepaymentMonths = tenureMonths - moratoriumMonths;

  const frequency = inputs.requestedPaymentFrequency ?? scheme.paymentFrequency ?? 'QUARTERLY';
  const periodsPerYear = getPeriodsPerYear(frequency);
  const monthsPerPeriod = 12 / periodsPerYear;
  const numberOfRepayments = activeRepaymentMonths / monthsPerPeriod;
  const quarterlyPeriodicRate = annualInterestRate.div(periodsPerYear).toDecimalPlaces(4, Decimal.ROUND_HALF_UP);

  const rawMoratoriumTreatment = inputs.requestedMoratoriumInterestTreatment ?? scheme.moratoriumInterestTreatment ?? 'UNKNOWN';
  let moratoriumInterestTreatment: MoratoriumInterestTreatment = 'UNKNOWN';
  if (rawMoratoriumTreatment === 'CAPITALIZE' || rawMoratoriumTreatment === 'PAY_CURRENT' || rawMoratoriumTreatment === 'UNKNOWN') {
     moratoriumInterestTreatment = rawMoratoriumTreatment;
  }

  // Handle UNKNOWN moratorium safely without throwing/crashing the whole calculation
  if (moratoriumMonths > 0 && moratoriumInterestTreatment === 'UNKNOWN') {
    const expectedRev = inputs.expectedMonthlyRevenue !== null && inputs.expectedMonthlyRevenue !== undefined
      ? new Decimal(inputs.expectedMonthlyRevenue)
      : null;

    const expectedCost = inputs.expectedMonthlyOperatingCost !== null && inputs.expectedMonthlyOperatingCost !== undefined
      ? new Decimal(inputs.expectedMonthlyOperatingCost)
      : null;

    const dscrResult = calculateDSCR(
      expectedRev,
      expectedCost,
      new Decimal(0),
      frequency
    );

    return {
      loanStructure,
      annualInterestRate,
      quarterlyPeriodicRate,
      totalTenureMonths: tenureMonths,
      moratoriumMonths,
      activeRepaymentMonths,
      numberOfRepayments,
      paymentFrequency: frequency,
      moratoriumInterestTreatment,
      installmentAmount: new Decimal(0),
      annualDebtService: new Decimal(0),
      dscrResult,
      schedule: [],
      totalPrincipal: loanStructure.loanAmount,
      totalInterest: new Decimal(0),
      totalRepayment: loanStructure.loanAmount,
      isScheduleCalculable: false,
      scheduleUnavailableReason: 'Exact repayment schedule calculation requires applicable moratorium interest treatment (CAPITALIZE or PAY_CURRENT). Moratorium duration is noted but exact schedule remains provisional.',
      calculationVersion: FINANCE_CALCULATION_VERSION,
    };
  }

  const schedule = generateRepaymentSchedule(
    loanStructure.loanAmount,
    annualInterestRate,
    tenureMonths,
    moratoriumMonths,
    frequency,
    moratoriumInterestTreatment
  );

  let totalInterest = new Decimal(0);
  let totalRepayment = new Decimal(0);
  let totalPrincipal = new Decimal(0);
  let activeInstallmentAmount = new Decimal(0);

  schedule.forEach(item => {
    totalInterest = totalInterest.plus(item.interestPayment);
    totalRepayment = totalRepayment.plus(item.installmentAmount);
    totalPrincipal = totalPrincipal.plus(item.principalPayment);
    if (!item.isMoratorium && activeInstallmentAmount.eq(0)) {
       activeInstallmentAmount = item.installmentAmount;
    }
  });

  // If no active installments (e.g. loan amount is 0), set activeInstallment to 0
  if (schedule.length > 0 && activeInstallmentAmount.eq(0) && loanStructure.loanAmount.gt(0)) {
     activeInstallmentAmount = schedule[schedule.length - 1].installmentAmount;
  }

  const expectedRev = inputs.expectedMonthlyRevenue !== null && inputs.expectedMonthlyRevenue !== undefined
    ? new Decimal(inputs.expectedMonthlyRevenue)
    : null;

  const expectedCost = inputs.expectedMonthlyOperatingCost !== null && inputs.expectedMonthlyOperatingCost !== undefined
    ? new Decimal(inputs.expectedMonthlyOperatingCost)
    : null;

  const dscrResult = calculateDSCR(
    expectedRev,
    expectedCost,
    activeInstallmentAmount,
    frequency
  );

  const annualDebtService = activeInstallmentAmount.mul(periodsPerYear).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

  return {
    loanStructure,
    annualInterestRate,
    quarterlyPeriodicRate,
    totalTenureMonths: tenureMonths,
    moratoriumMonths,
    activeRepaymentMonths,
    numberOfRepayments,
    paymentFrequency: frequency,
    moratoriumInterestTreatment,
    installmentAmount: activeInstallmentAmount.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
    annualDebtService,
    dscrResult,
    schedule,
    totalPrincipal: totalPrincipal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
    totalInterest: totalInterest.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
    totalRepayment: totalRepayment.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
    isScheduleCalculable: true,
    calculationVersion: FINANCE_CALCULATION_VERSION,
  };
}

