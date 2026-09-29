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
    it('Micro Finance: Project Cost = ₹1,40,000, Max Loan = ₹1,25,000, Own Contribution = ₹14,000', () => {
      const result = calculateLoanStructure(
        { projectCost: 140000, ownContribution: 14000 },
        { schemeCode: 'MICRO_FINANCE', schemeName: 'Micro Finance', financingPercentage: 90, maxLoanAmount: 125000 }
      );
      expect(result.projectCost.toNumber()).toBe(140000);
      expect(result.maximumEligibleLoan.toNumber()).toBe(125000); // 90% is 126k, capped at 125k
      expect(result.actualLoanRequirement.toNumber()).toBe(126000); // 140k - 14k
      expect(result.loanAmount.toNumber()).toBe(125000); // MIN(126k, 125k) = 125k
      expect(result.requiredOwnContribution.toNumber()).toBe(14000); // 10% of 140k
      expect(result.availableMarginCapital.toNumber()).toBe(14000);
      expect(result.shortfall.toNumber()).toBe(0);
      expect(result.meetsMinimumRequirement).toBe(true);
    });

    it('Micro Finance with higher own contribution: Project Cost = ₹1,40,000, Own Contribution = ₹20,000 -> Eligible Loan = ₹1,20,000', () => {
      const result = calculateLoanStructure(
        { projectCost: 140000, ownContribution: 20000 },
        { schemeCode: 'MICRO_FINANCE', schemeName: 'Micro Finance', financingPercentage: 90, maxLoanAmount: 125000 }
      );
      expect(result.actualLoanRequirement.toNumber()).toBe(120000); // 140k - 20k
      expect(result.loanAmount.toNumber()).toBe(120000); // MIN(120k, 125k) = 120k
      expect(result.requiredOwnContribution.toNumber()).toBe(14000);
      expect(result.availableMarginCapital.toNumber()).toBe(20000);
      expect(result.excessContribution.toNumber()).toBe(6000);
      expect(result.shortfall.toNumber()).toBe(0);
      expect(result.meetsMinimumRequirement).toBe(true);
    });

    it('Term Loan: Project Cost = ₹10,00,000, Base Loan = ₹9,00,000, Final Loan = ₹9,00,000, Required Contribution = ₹1,00,000', () => {
      const result = calculateLoanStructure(
        { projectCost: 1000000, ownContribution: 100000 },
        { schemeCode: 'TERM_LOAN', schemeName: 'Term Loan', financingPercentage: 90, maxLoanAmount: 4500000 }
      );
      expect(result.projectCost.toNumber()).toBe(1000000);
      expect(result.maximumEligibleLoan.toNumber()).toBe(900000);
      expect(result.loanAmount.toNumber()).toBe(900000);
      expect(result.requiredOwnContribution.toNumber()).toBe(100000);
      expect(result.shortfall.toNumber()).toBe(0);
      expect(result.meetsMinimumRequirement).toBe(true);
    });

    it('Term Loan capping: Project Cost = ₹55,00,000, Max Loan Cap = ₹45,00,000, Own Contribution = ₹5,50,000', () => {
      const result = calculateLoanStructure(
        { projectCost: 5500000, ownContribution: 550000 },
        { schemeCode: 'TERM_LOAN', schemeName: 'Term Loan', financingPercentage: 90, maxLoanAmount: 4500000 }
      );
      expect(result.maximumEligibleLoan.toNumber()).toBe(4500000);
      expect(result.actualLoanRequirement.toNumber()).toBe(4950000); // 55L - 5.5L
      expect(result.loanAmount.toNumber()).toBe(4500000); // Capped at 45L
      expect(result.requiredOwnContribution.toNumber()).toBe(550000); // 10% of 55L
      expect(result.shortfall.toNumber()).toBe(0);
      expect(result.meetsMinimumRequirement).toBe(true);
    });

    it('preserves legacy fallback to 10x margin when projectCost is omitted', () => {
      const result = calculateLoanStructure(
        { availableMarginCapital: 14000 },
        { schemeCode: 'MICRO_FINANCE', schemeName: 'Micro Finance', financingPercentage: 90, maxLoanAmount: 125000 }
      );
      expect(result.projectCost.toNumber()).toBe(140000);
      expect(result.loanAmount.toNumber()).toBe(125000);
      expect(result.requiredOwnContribution.toNumber()).toBe(14000);
      expect(result.shortfall.toNumber()).toBe(0);
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

  describe('H. Scenario A — Term Loan Demo Scenario (₹35,00,000 / ₹3,00,000)', () => {
    it('accurately validates loan structure, ₹50,000 shortfall, 8.57% actual contribution, and ₹0.00 closing principal', () => {
      const inputs = {
        projectCost: 3500000,
        ownContribution: 300000,
        requestedMoratoriumInterestTreatment: 'PAY_CURRENT' as const,
      };

      const scheme = {
        schemeCode: 'TERM_LOAN',
        schemeName: 'Term Loan Scheme',
        financingPercentage: 90,
        maxLoanAmount: 4500000,
        interestRate: 8.0,
        tenureMonths: 84,
        moratoriumMonths: 6,
        paymentFrequency: 'QUARTERLY' as const,
        moratoriumInterestTreatment: 'PAY_CURRENT' as const,
      };

      const result = runFinanceCalculation(inputs, scheme);

      // 1. Total Project Cost
      expect(result.loanStructure.projectCost.toNumber()).toBe(3500000);
      // 2. 90% Maximum Eligible Loan = ₹31,50,000
      expect(result.loanStructure.maximumEligibleLoan.toNumber()).toBe(3150000);
      // 3. Actual Loan Requirement = ₹35,00,000 - ₹3,00,000 = ₹32,00,000
      expect(result.loanStructure.actualLoanRequirement.toNumber()).toBe(3200000);
      // 4. Eligible Bank Loan = MIN(₹32,00,000, ₹31,50,000) = ₹31,50,000
      expect(result.loanStructure.loanAmount.toNumber()).toBe(3150000);
      // 5. Required Own Contribution = ₹35,00,000 * 10% = ₹3,50,000
      expect(result.loanStructure.requiredOwnContribution.toNumber()).toBe(350000);
      // 6. Actual Own Contribution = ₹3,00,000
      expect(result.loanStructure.availableMarginCapital.toNumber()).toBe(300000);
      // 7. Funding Gap / Contribution Shortfall = ₹3,50,000 - ₹3,00,000 = ₹50,000
      expect(result.loanStructure.shortfall.toNumber()).toBe(50000);
      // 8. Actual Contribution Percentage = (3,00,000 / 35,00,000) * 100 = 8.57%
      expect(result.loanStructure.actualContributionPercentage.toNumber()).toBeCloseTo(8.57, 2);
      // 9. Minimum 10% requirement NOT met
      expect(result.loanStructure.actualContributionPercentage.toNumber() < 10).toBe(true);
      expect(result.loanStructure.meetsMinimumRequirement).toBe(false);

      // 10. Scheme tenure & active repayment counts
      // 84 total months, 6 moratorium months -> 78 active months -> 26 active quarterly periods
      // Total schedule length = 28 periods (2 moratorium + 26 active repayments)
      expect(result.isScheduleCalculable).toBe(true);
      expect(result.schedule).toHaveLength(28);

      const moratoriumRows = result.schedule.filter((r) => r.isMoratorium);
      const activeRows = result.schedule.filter((r) => !r.isMoratorium);
      expect(moratoriumRows).toHaveLength(2);
      expect(activeRows).toHaveLength(26);

      // 11. Moratorium interest payments = ₹31,50,000 * 2.0% = ₹63,000 per quarter
      expect(moratoriumRows[0].interestPayment.toNumber()).toBe(63000);
      expect(moratoriumRows[0].principalPayment.toNumber()).toBe(0);
      expect(moratoriumRows[0].installmentAmount.toNumber()).toBe(63000);

      // 12. Active quarterly installment based on ₹31,50,000
      expect(activeRows[0].installmentAmount.toNumber()).toBeGreaterThan(0);

      // 13. Final closing principal is exactly ₹0.00 after reconciliation
      const finalRow = result.schedule[result.schedule.length - 1];
      expect(finalRow.closingPrincipal.toNumber()).toBe(0);

      // 14. Total principal repaid reconciles exactly to ₹31,50,000
      const totalPrincipalRepaid = result.schedule.reduce(
        (sum, item) => sum.plus(item.principalPayment),
        new Decimal(0)
      );
      expect(totalPrincipalRepaid.toNumber()).toBeCloseTo(3150000, 2);
    });
  });

  describe('I. Scenario B — Microfinance Demo Scenario (₹1,20,000 / ₹14,000)', () => {
    it('accurately validates loan structure, ₹0 shortfall, 11.67% actual contribution, ₹2,000 excess, and ₹0.00 closing principal', () => {
      const inputs = {
        projectCost: 120000,
        ownContribution: 14000,
        requestedMoratoriumInterestTreatment: 'PAY_CURRENT' as const,
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
        moratoriumInterestTreatment: 'PAY_CURRENT' as const,
      };

      const result = runFinanceCalculation(inputs, scheme);

      // 1. Total Project Cost = ₹1,20,000
      expect(result.loanStructure.projectCost.toNumber()).toBe(120000);
      // 2. Required 10% Contribution = ₹12,000
      expect(result.loanStructure.requiredOwnContribution.toNumber()).toBe(12000);
      // 3. Maximum Eligible 90% Loan = ₹1,08,000
      expect(result.loanStructure.maximumEligibleLoan.toNumber()).toBe(108000);
      // 4. Actual Loan Requirement = ₹1,20,000 - ₹14,000 = ₹1,06,000
      expect(result.loanStructure.actualLoanRequirement.toNumber()).toBe(106000);
      // 5. Eligible Loan Amount = MIN(₹1,06,000, ₹1,08,000) = ₹1,06,000
      expect(result.loanStructure.loanAmount.toNumber()).toBe(106000);
      // 6. Contribution Shortfall = ₹0
      expect(result.loanStructure.shortfall.toNumber()).toBe(0);
      // 7. Excess Contribution Above Minimum = ₹14,000 - ₹12,000 = ₹2,000
      expect(result.loanStructure.excessContribution.toNumber()).toBe(2000);
      // 8. Actual Contribution Percentage = (14,000 / 1,20,000) * 100 = 11.67%
      expect(result.loanStructure.actualContributionPercentage.toNumber()).toBeCloseTo(11.67, 2);
      // 9. Minimum 10% requirement IS met
      expect(result.loanStructure.actualContributionPercentage.toNumber() >= 10).toBe(true);
      expect(result.loanStructure.meetsMinimumRequirement).toBe(true);

      // 10. Schedule: 36 months total, 3 months moratorium (1 quarter) -> 11 active quarters (12 periods total)
      expect(result.isScheduleCalculable).toBe(true);
      expect(result.schedule).toHaveLength(12);
      expect(result.schedule[0].isMoratorium).toBe(true);
      expect(result.schedule[1].isMoratorium).toBe(false);

      // 11. Final closing principal reconciles to exactly ₹0.00
      const finalRow = result.schedule[result.schedule.length - 1];
      expect(finalRow.closingPrincipal.toNumber()).toBe(0);

      // 12. Total principal repaid reconciles exactly to ₹1,06,000
      const totalPrincipalRepaid = result.schedule.reduce(
        (sum, item) => sum.plus(item.principalPayment),
        new Decimal(0)
      );
      expect(totalPrincipalRepaid.toNumber()).toBeCloseTo(106000, 2);
    });
  });

  describe('J. Additional Threshold and DSCR Invariant Tests', () => {
    it('Own contribution exactly equal to 10% -> 0 shortfall, 0 excess, requirement met', () => {
      const result = calculateLoanStructure(
        { projectCost: 200000, ownContribution: 20000 },
        { schemeCode: 'MICRO_FINANCE', schemeName: 'Micro', financingPercentage: 90, maxLoanAmount: 200000 }
      );
      expect(result.requiredOwnContribution.toNumber()).toBe(20000);
      expect(result.actualContributionPercentage.toNumber()).toBe(10);
      expect(result.shortfall.toNumber()).toBe(0);
      expect(result.excessContribution.toNumber()).toBe(0);
      expect(result.meetsMinimumRequirement).toBe(true);
      expect(result.loanAmount.toNumber()).toBe(180000);
    });

    it('Own contribution greater than 10% (e.g. 25%) -> 0 shortfall, excess calculated, eligible loan equals actual requirement', () => {
      const result = calculateLoanStructure(
        { projectCost: 1000000, ownContribution: 250000 },
        { schemeCode: 'TERM_LOAN', schemeName: 'Term Loan', financingPercentage: 90, maxLoanAmount: 4500000 }
      );
      expect(result.requiredOwnContribution.toNumber()).toBe(100000);
      expect(result.actualContributionPercentage.toNumber()).toBe(25);
      expect(result.shortfall.toNumber()).toBe(0);
      expect(result.excessContribution.toNumber()).toBe(150000);
      expect(result.actualLoanRequirement.toNumber()).toBe(750000);
      expect(result.maximumEligibleLoan.toNumber()).toBe(900000);
      expect(result.loanAmount.toNumber()).toBe(750000); // Capped by actual requirement
      expect(result.meetsMinimumRequirement).toBe(true);
    });

    it('DSCR is null / unavailable when revenue or operating cost inputs are missing', () => {
      const dscrMissingRev = calculateDSCR(null, new Decimal(39500), new Decimal(5000), 'MONTHLY');
      expect(dscrMissingRev.dscr).toBeNull();
      expect(dscrMissingRev.status).toBe('UNAVAILABLE');

      const dscrMissingCost = calculateDSCR(new Decimal(45000), null, new Decimal(5000), 'MONTHLY');
      expect(dscrMissingCost.dscr).toBeNull();
      expect(dscrMissingCost.status).toBe('UNAVAILABLE');

      const dscrMissingBoth = calculateDSCR(null, null, new Decimal(5000), 'MONTHLY');
      expect(dscrMissingBoth.dscr).toBeNull();
      expect(dscrMissingBoth.status).toBe('UNAVAILABLE');
    });
  });
});

