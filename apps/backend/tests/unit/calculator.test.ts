import Decimal from 'decimal.js';
import {
  calculateLoanStructure,
  calculatePeriodicInstallment,
  calculateEMI,
  calculateDSCR,
  generateRepaymentSchedule,
  runFinanceCalculation,
  FINANCE_CALCULATION_VERSION,
  resolveScheme
} from '../../src/modules/finance/domain/calculator';
import { FinancialInputsSchema } from '../../src/modules/finance/schemas/finance.schema';

describe('Finance Calculator Domain', () => {
  describe('A. Deterministic Scheme Routing (resolveScheme)', () => {
    it('routes ₹0 to NOT_ELIGIBLE (invalid / no positive loan)', () => {
      expect(resolveScheme(new Decimal(0))).toBe('NOT_ELIGIBLE');
      expect(resolveScheme(new Decimal(-1000))).toBe('NOT_ELIGIBLE');
    });

    it('routes ₹1,39,999 to MICRO_FINANCE', () => {
      expect(resolveScheme(new Decimal(139999))).toBe('MICRO_FINANCE');
    });

    it('routes ₹1,40,000 boundary to MICRO_FINANCE', () => {
      expect(resolveScheme(new Decimal(140000))).toBe('MICRO_FINANCE');
    });

    it('routes ₹1,40,001 boundary to TERM_LOAN', () => {
      expect(resolveScheme(new Decimal(140001))).toBe('TERM_LOAN');
    });

    it('routes ₹50,00,000 boundary to TERM_LOAN', () => {
      expect(resolveScheme(new Decimal(5000000))).toBe('TERM_LOAN');
    });

    it('routes ₹50,00,001 boundary to NOT_ELIGIBLE', () => {
      expect(resolveScheme(new Decimal(5000001))).toBe('NOT_ELIGIBLE');
      expect(resolveScheme(new Decimal(10000000))).toBe('NOT_ELIGIBLE');
    });
  });

  describe('B. Loan Calculations & Scheme Loan Caps (calculateLoanStructure)', () => {
    it('Micro Finance: Project Cost = ₹1,40,000, Base Loan = ₹1,26,000, Final Loan = ₹1,25,000, Required Contribution = ₹15,000', () => {
      const result = calculateLoanStructure(
        { projectCost: 140000, ownContribution: 14000 },
        { schemeCode: 'MICRO_FINANCE', schemeName: 'Micro Finance', financingPercentage: 90, maxLoanAmount: 125000 }
      );
      expect(result.projectCost.toNumber()).toBe(140000);
      expect(result.baseLoanAmount.toNumber()).toBe(126000); // 90% of 140k
      expect(result.loanAmount.toNumber()).toBe(125000); // Capped at 125k
      expect(result.requiredOwnContribution.toNumber()).toBe(15000); // 140k - 125k
      expect(result.availableMarginCapital.toNumber()).toBe(14000);
      expect(result.shortfall.toNumber()).toBe(1000); // 15k - 14k
    });

    it('Micro Finance with higher own contribution: Project Cost = ₹1,40,000, Own Contribution = ₹20,000 -> Shortfall = ₹0', () => {
      const result = calculateLoanStructure(
        { projectCost: 140000, ownContribution: 20000 },
        { schemeCode: 'MICRO_FINANCE', schemeName: 'Micro Finance', financingPercentage: 90, maxLoanAmount: 125000 }
      );
      expect(result.loanAmount.toNumber()).toBe(125000);
      expect(result.requiredOwnContribution.toNumber()).toBe(15000);
      expect(result.availableMarginCapital.toNumber()).toBe(20000);
      expect(result.shortfall.toNumber()).toBe(0);
    });

    it('Term Loan: Project Cost = ₹10,00,000, Base Loan = ₹9,00,000, Final Loan = ₹9,00,000, Required Contribution = ₹1,00,000', () => {
      const result = calculateLoanStructure(
        { projectCost: 1000000, ownContribution: 100000 },
        { schemeCode: 'TERM_LOAN', schemeName: 'Term Loan', financingPercentage: 90, maxLoanAmount: 4500000 }
      );
      expect(result.projectCost.toNumber()).toBe(1000000);
      expect(result.baseLoanAmount.toNumber()).toBe(900000);
      expect(result.loanAmount.toNumber()).toBe(900000);
      expect(result.requiredOwnContribution.toNumber()).toBe(100000);
      expect(result.shortfall.toNumber()).toBe(0);
    });

    it('Term Loan capping: Project Cost = ₹55,00,000, Base Loan = ₹49,50,000, Capped Loan = ₹45,00,000', () => {
      const result = calculateLoanStructure(
        { projectCost: 5500000, ownContribution: 550000 },
        { schemeCode: 'TERM_LOAN', schemeName: 'Term Loan', financingPercentage: 90, maxLoanAmount: 4500000 }
      );
      expect(result.loanAmount.toNumber()).toBe(4500000);
      expect(result.requiredOwnContribution.toNumber()).toBe(1000000); // 55L - 45L
      expect(result.shortfall.toNumber()).toBe(450000); // 10L req - 5.5L margin
    });

    it('preserves legacy fallback to 10x margin when projectCost is omitted', () => {
      const result = calculateLoanStructure(
        { availableMarginCapital: 14000 },
        { schemeCode: 'MICRO_FINANCE', schemeName: 'Micro Finance', financingPercentage: 90, maxLoanAmount: 125000 }
      );
      expect(result.projectCost.toNumber()).toBe(140000);
      expect(result.loanAmount.toNumber()).toBe(125000);
      expect(result.requiredOwnContribution.toNumber()).toBe(15000);
      expect(result.shortfall.toNumber()).toBe(1000);
    });
  });

  describe('C. Contribution Shortfall Invariants', () => {
    it('shortfall is never negative when contribution exceeds required', () => {
      const result = calculateLoanStructure(
        { projectCost: 100000, ownContribution: 50000 },
        { schemeCode: 'MICRO_FINANCE', schemeName: 'Micro', financingPercentage: 90, maxLoanAmount: 125000 }
      );
      expect(result.requiredOwnContribution.toNumber()).toBe(10000);
      expect(result.shortfall.toNumber()).toBe(0);
      expect(result.availableMarginCapital.toNumber()).toBe(50000);
    });

    it('shortfall is exactly zero when contribution equals required', () => {
      const result = calculateLoanStructure(
        { projectCost: 100000, ownContribution: 10000 },
        { schemeCode: 'MICRO_FINANCE', schemeName: 'Micro', financingPercentage: 90, maxLoanAmount: 125000 }
      );
      expect(result.requiredOwnContribution.toNumber()).toBe(10000);
      expect(result.shortfall.toNumber()).toBe(0);
    });
  });

  describe('D. Financial Inputs & Cash Savings Validation Schema', () => {
    it('accepts ownContribution equal to availableCashFunds', () => {
      const parsed = FinancialInputsSchema.safeParse({
        ownContribution: 25000,
        availableCashFunds: 25000,
        projectCost: 200000,
      });
      expect(parsed.success).toBe(true);
    });

    it('accepts ownContribution below availableCashFunds', () => {
      const parsed = FinancialInputsSchema.safeParse({
        ownContribution: 10000,
        availableCashFunds: 25000,
        projectCost: 100000,
      });
      expect(parsed.success).toBe(true);
    });

    it('rejects ownContribution greater than availableCashFunds', () => {
      const parsed = FinancialInputsSchema.safeParse({
        ownContribution: 30000,
        availableCashFunds: 25000,
        projectCost: 100000,
      });
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.issues[0].message).toContain('cannot exceed declared available');
      }
    });

    it('rejects negative cash savings, own contribution, and project cost', () => {
      expect(FinancialInputsSchema.safeParse({ availableCashFunds: -500 }).success).toBe(false);
      expect(FinancialInputsSchema.safeParse({ ownContribution: -100 }).success).toBe(false);
      expect(FinancialInputsSchema.safeParse({ projectCost: -10000 }).success).toBe(false);
      expect(FinancialInputsSchema.safeParse({ projectCost: 0 }).success).toBe(false);
    });

    it('handles zero own contribution explicitly', () => {
      const parsed = FinancialInputsSchema.safeParse({
        ownContribution: 0,
        projectCost: 100000,
      });
      expect(parsed.success).toBe(true);
    });
  });

  describe('E. Periodic Interest and Quarterly Installment Calculations', () => {
    it('calculates quarterly periodic rate for Micro Finance (6.5% / 4 = 1.625%)', () => {
      // 12 total quarters tenure
      const installment = calculatePeriodicInstallment(new Decimal(125000), new Decimal(6.5), 36, 'QUARTERLY');
      expect(installment.toNumber()).toBeCloseTo(11549.42, 2);
    });

    it('calculates quarterly periodic rate for Term Loan (8% / 4 = 2.0%)', () => {
      // 84 months = 28 quarters
      const installment = calculatePeriodicInstallment(new Decimal(900000), new Decimal(8), 84, 'QUARTERLY');
      expect(installment.toNumber()).toBeCloseTo(42290.70, 2);
    });

    it('calculates standard monthly installment (calculateEMI wrapper)', () => {
      const emi = calculateEMI(new Decimal(100000), new Decimal(8), 84);
      expect(emi.toNumber()).toBeCloseTo(1558.62, 2);
    });

    it('handles zero interest rate', () => {
      const installment = calculatePeriodicInstallment(new Decimal(8400), new Decimal(0), 84, 'MONTHLY');
      expect(installment.toNumber()).toBe(100);
    });

    it('returns zero for zero principal', () => {
      const installment = calculatePeriodicInstallment(new Decimal(0), new Decimal(8), 84, 'MONTHLY');
      expect(installment.toNumber()).toBe(0);
    });
  });

  describe('F. Repayment Schedule & Moratorium', () => {
    it('Micro Finance: 36 mo tenure, 3 mo moratorium (1 quarter) -> 11 active quarters', () => {
      const schedule = generateRepaymentSchedule(
        new Decimal(125000),
        new Decimal(6.5),
        36,
        3,
        'QUARTERLY',
        'PAY_CURRENT'
      );
      // 36 months / 3 = 12 total periods
      expect(schedule.length).toBe(12);
      expect(schedule[0].isMoratorium).toBe(true);
      expect(schedule[0].principalPayment.toNumber()).toBe(0);
      expect(schedule[1].isMoratorium).toBe(false);
      expect(schedule[11].closingPrincipal.toNumber()).toBe(0);

      // Reconcile total principal payments to original loan
      const totalPrincipalRepaid = schedule.reduce(
        (sum, item) => sum.plus(item.principalPayment),
        new Decimal(0)
      );
      expect(totalPrincipalRepaid.toNumber()).toBeCloseTo(125000, 2);
    });

    it('Term Loan: 84 mo tenure, 6 mo moratorium (2 quarters) -> 26 active quarters', () => {
      const schedule = generateRepaymentSchedule(
        new Decimal(900000),
        new Decimal(8),
        84,
        6,
        'QUARTERLY',
        'PAY_CURRENT'
      );
      // 84 months / 3 = 28 total periods
      expect(schedule.length).toBe(28);
      expect(schedule[0].isMoratorium).toBe(true);
      expect(schedule[1].isMoratorium).toBe(true);
      expect(schedule[2].isMoratorium).toBe(false);
      expect(schedule[27].closingPrincipal.toNumber()).toBe(0);

      const totalPrincipalRepaid = schedule.reduce(
        (sum, item) => sum.plus(item.principalPayment),
        new Decimal(0)
      );
      expect(totalPrincipalRepaid.toNumber()).toBeCloseTo(900000, 2);
    });

    it('handles moratorium with CAPITALIZE treatment', () => {
      const schedule = generateRepaymentSchedule(
        new Decimal(100000),
        new Decimal(12),
        24,
        6,
        'MONTHLY',
        'CAPITALIZE'
      );
      expect(schedule[0].isMoratorium).toBe(true);
      expect(schedule[0].installmentAmount.toNumber()).toBe(0);
      expect(schedule[0].closingPrincipal.toNumber()).toBe(101000);
      expect(schedule[23].closingPrincipal.toNumber()).toBe(0);
    });

    it('safely handles UNKNOWN moratorium in runFinanceCalculation without crashing', () => {
      const inputs = {
        projectCost: 140000,
        ownContribution: 14000,
        requestedMoratoriumInterestTreatment: 'UNKNOWN' as const,
      };

      const scheme = {
        schemeCode: 'MICRO_FINANCE',
        schemeName: 'Micro Finance Scheme',
        financingPercentage: 90,
        maxLoanAmount: 125000,
        interestRate: 6.5,
        tenureMonths: 36,
        moratoriumMonths: 3,
        paymentFrequency: 'QUARTERLY' as const,
        moratoriumInterestTreatment: 'UNKNOWN' as const,
      };

      const result = runFinanceCalculation(inputs, scheme);
      expect(result.isScheduleCalculable).toBe(false);
      expect(result.scheduleUnavailableReason).toContain('moratorium interest treatment');
      expect(result.loanStructure.loanAmount.toNumber()).toBe(125000);
      expect(result.schedule).toHaveLength(0);
    });
  });

  describe('G. Feasibility & DSCR Calculation', () => {
    it('calculates valid DSCR > 1', () => {
      const res = calculateDSCR(new Decimal(10000), new Decimal(2000), new Decimal(2000), 'MONTHLY');
      expect(res.dscr?.toNumber()).toBe(4);
    });

    it('calculates valid DSCR < 1', () => {
      const res = calculateDSCR(new Decimal(3000), new Decimal(2000), new Decimal(2000), 'MONTHLY');
      expect(res.dscr?.toNumber()).toBe(0.5);
    });

    it('returns null if income or operating cost is missing (not fabricated)', () => {
      expect(calculateDSCR(null, new Decimal(2000), new Decimal(2000), 'MONTHLY').dscr).toBeNull();
      expect(calculateDSCR(new Decimal(10000), null, new Decimal(2000), 'MONTHLY').dscr).toBeNull();
      expect(calculateDSCR(null, null, new Decimal(2000), 'MONTHLY').dscr).toBeNull();
    });

    it('returns null if debt service is 0', () => {
      const res = calculateDSCR(new Decimal(10000), new Decimal(2000), new Decimal(0), 'MONTHLY');
      expect(res.dscr).toBeNull();
    });
  });
});

