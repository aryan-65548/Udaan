import Decimal from 'decimal.js';
import { SchemeConfig, FinancialInputs, PaymentFrequency } from '../schemas/finance.schema';

// Set up default decimal precision to avoid runaway decimals, e.g. 20 is sufficient for finance
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export const FINANCE_CALCULATION_VERSION = 'v1';

export type MoratoriumInterestTreatment = 'CAPITALIZE' | 'PAY_CURRENT' | 'UNKNOWN';

export function resolveScheme(projectCost: Decimal): 'MICRO_FINANCE' | 'TERM_LOAN' | 'NOT_ELIGIBLE' {
  if (projectCost.lte(140000)) {
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
  loanAmount: Decimal;
}

export function calculateLoanStructure(inputs: FinancialInputs, scheme: SchemeConfig): LoanStructure {
  const availableMarginCapital = new Decimal(inputs.availableMarginCapital);
  // Formula: projectCost = availableMarginCapital / 0.10
  const projectCost = availableMarginCapital.mul(10);

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

  // Determine loan amount based on scheme financing percentage
  let baseLoanAmount = new Decimal(0);
  if (scheme.financingPercentage !== null && scheme.financingPercentage !== undefined) {
    // Financing percentage is a percentage (e.g. 90 for 90%)
    baseLoanAmount = projectCost.mul(scheme.financingPercentage).div(100);
  } else {
     baseLoanAmount = projectCost; // Fallback if no financing percentage
  }

  if (scheme.maxLoanAmount !== null && scheme.maxLoanAmount !== undefined) {
    const maxLoan = new Decimal(scheme.maxLoanAmount);
    if (baseLoanAmount.gt(maxLoan)) {
      baseLoanAmount = maxLoan;
    }
  }

  // Actual required own contribution based on final loan
  const requiredOwnContribution = projectCost.minus(baseLoanAmount);

  // Shortfall = required - available
  let shortfall = requiredOwnContribution.minus(availableMarginCapital);
  if (shortfall.lt(0)) {
    shortfall = new Decimal(0);
  }

  return {
    projectCost: projectCost.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
    availableMarginCapital: availableMarginCapital.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
    requiredOwnContribution: requiredOwnContribution.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
    shortfall: shortfall.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
    loanAmount: baseLoanAmount.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
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
  monthlyOperatingSurplus: Decimal | null;
  annualCashAvailable: Decimal | null;
  annualDebtService: Decimal;
  dscr: Decimal | null;
}

export function calculateDSCR(
  expectedMonthlyRevenue: Decimal | null,
  expectedMonthlyOperatingCost: Decimal | null,
  periodicInstallment: Decimal,
  frequency: PaymentFrequency
): DSCRResult {
  const periodsPerYear = getPeriodsPerYear(frequency);
  const annualDebtService = periodicInstallment.mul(periodsPerYear);

  if (expectedMonthlyRevenue === null || expectedMonthlyRevenue === undefined ||
      expectedMonthlyOperatingCost === null || expectedMonthlyOperatingCost === undefined) {
    return {
      monthlyOperatingSurplus: null,
      annualCashAvailable: null,
      annualDebtService,
      dscr: null,
    };
  }

  const rev = expectedMonthlyRevenue;
  const cost = expectedMonthlyOperatingCost;

  const monthlyOperatingSurplus = rev.minus(cost);
  const annualCashAvailable = monthlyOperatingSurplus.mul(12);

  let dscr: Decimal | null = null;

  if (annualDebtService.gt(0)) {
    // DSCR = annual cash available / annual debt service
    dscr = annualCashAvailable.div(annualDebtService).toDecimalPlaces(4, Decimal.ROUND_HALF_UP);
  }

  return {
    monthlyOperatingSurplus,
    annualCashAvailable,
    annualDebtService,
    dscr,
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
      openingPrincipal: currentPrincipal,
      principalPayment: principalPayment,
      interestPayment: interestPayment,
      installmentAmount: installmentAmount,
      closingPrincipal: closingPrincipal,
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

    let principalPayment = periodicInstallment.minus(interestPayment);
    let closingPrincipal = currentPrincipal.minus(principalPayment);
    let finalInstallment = periodicInstallment;

    // Handle rounding on the last period
    if (isLastPeriod) {
      principalPayment = currentPrincipal;
      finalInstallment = principalPayment.plus(interestPayment);
      closingPrincipal = new Decimal(0);
    }

    schedule.push({
      sequenceNumber: sequenceNumber++,
      openingPrincipal: currentPrincipal,
      principalPayment: principalPayment,
      interestPayment: interestPayment,
      installmentAmount: finalInstallment,
      closingPrincipal: closingPrincipal,
      isMoratorium: false,
    });

    currentPrincipal = closingPrincipal;
  }

  return schedule;
}

export interface FullFinanceResult {
  loanStructure: LoanStructure;
  installmentAmount: Decimal;
  dscrResult: DSCRResult;
  schedule: ScheduleItem[];
  totalInterest: Decimal;
  totalRepayment: Decimal;
  calculationVersion: string;
}

export function runFinanceCalculation(inputs: FinancialInputs, scheme: SchemeConfig): FullFinanceResult {
  const loanStructure = calculateLoanStructure(inputs, scheme);

  const annualInterestRate = new Decimal(
    inputs.requestedInterestRate ?? scheme.interestRate ?? 0
  );

  const tenureMonths = inputs.requestedTenureMonths ?? scheme.tenureMonths;
  if (!tenureMonths) {
    throw new Error("Tenure months must be provided either by user or scheme config.");
  }

  const moratoriumMonths = inputs.requestedMoratoriumMonths ?? scheme.moratoriumMonths ?? 0;

  const frequency = inputs.requestedPaymentFrequency ?? scheme.paymentFrequency ?? 'MONTHLY';

  const rawMoratoriumTreatment = inputs.requestedMoratoriumInterestTreatment ?? scheme.moratoriumInterestTreatment ?? 'UNKNOWN';
  let moratoriumInterestTreatment: MoratoriumInterestTreatment = 'UNKNOWN';
  if (rawMoratoriumTreatment === 'CAPITALIZE' || rawMoratoriumTreatment === 'PAY_CURRENT' || rawMoratoriumTreatment === 'UNKNOWN') {
     moratoriumInterestTreatment = rawMoratoriumTreatment;
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
  let activeInstallmentAmount = new Decimal(0);

  schedule.forEach(item => {
    totalInterest = totalInterest.plus(item.interestPayment);
    totalRepayment = totalRepayment.plus(item.installmentAmount);
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

  return {
    loanStructure,
    installmentAmount: activeInstallmentAmount,
    dscrResult,
    schedule,
    totalInterest,
    totalRepayment,
    calculationVersion: FINANCE_CALCULATION_VERSION,
  };
}
