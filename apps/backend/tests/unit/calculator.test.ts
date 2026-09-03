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

describe('Finance Calculator Domain', () => {
  describe('resolveScheme', () => {
    it('routes correctly based on project cost boundaries', () => {
      expect(resolveScheme(new Decimal(139999))).toBe('MICRO_FINANCE');
      expect(resolveScheme(new Decimal(140000))).toBe('MICRO_FINANCE');
      expect(resolveScheme(new Decimal(140001))).toBe('TERM_LOAN');
      expect(resolveScheme(new Decimal(5000000))).toBe('TERM_LOAN');
      expect(resolveScheme(new Decimal(5000001))).toBe('NOT_ELIGIBLE');
    });
  });

  describe('calculateLoanStructure', () => {
    it('scales margin to project cost 10x correctly', () => {
      const cases = [
        { margin: 10000, expectedProject: 100000 },
        { margin: 14000, expectedProject: 140000 },
        { margin: 100000, expectedProject: 1000000 },
        { margin: 500000, expectedProject: 5000000 },
      ];

      cases.forEach(c => {
        const result = calculateLoanStructure(
          { availableMarginCapital: c.margin },
          { schemeCode: 'TEST', schemeName: 'TEST' }
        );
        expect(result.projectCost.toNumber()).toBe(c.expectedProject);
        expect(result.availableMarginCapital.toNumber()).toBe(c.margin);
      });
    });

    it('calculates Micro Finance 90% without capping', () => {
      const result = calculateLoanStructure(
        { availableMarginCapital: 10000 }, // project = 100,000
        { schemeCode: 'MICRO', schemeName: 'Micro', financingPercentage: 90, maxLoanAmount: 125000 }
      );
      expect(result.loanAmount.toNumber()).toBe(90000); // 90% of 100k
      expect(result.requiredOwnContribution.toNumber()).toBe(10000); // 100k - 90k
      expect(result.shortfall.toNumber()).toBe(0);
    });

    it('caps Micro Finance at 1.25L and exposes shortfall', () => {
      const result = calculateLoanStructure(
        { availableMarginCapital: 14000 }, // project = 140,000
        { schemeCode: 'MICRO', schemeName: 'Micro', financingPercentage: 90, maxLoanAmount: 125000 }
      );
      // 90% of 140k = 126,000. Capped at 125,000.
      expect(result.loanAmount.toNumber()).toBe(125000);
      expect(result.requiredOwnContribution.toNumber()).toBe(15000); // 140k - 125k
      expect(result.shortfall.toNumber()).toBe(1000); // 15k required - 14k margin
    });

    it('calculates Term Loan 90% and caps at 45L', () => {
      const normalResult = calculateLoanStructure(
        { availableMarginCapital: 100000 }, // project = 10L
        { schemeCode: 'TERM', schemeName: 'Term', financingPercentage: 90, maxLoanAmount: 4500000 }
      );
      expect(normalResult.loanAmount.toNumber()).toBe(900000); // 90% of 10L

      const cappedResult = calculateLoanStructure(
        { availableMarginCapital: 550000 }, // project = 55L
        { schemeCode: 'TERM', schemeName: 'Term', financingPercentage: 90, maxLoanAmount: 4500000 }
      );
      // 90% of 55L = 49.5L. Capped at 45L.
      expect(cappedResult.loanAmount.toNumber()).toBe(4500000);
      expect(cappedResult.requiredOwnContribution.toNumber()).toBe(1000000); // 55L - 45L
      expect(cappedResult.shortfall.toNumber()).toBe(450000); // 10L req - 5.5L margin
    });

    it('enforces scheme project cost min/max limits', () => {
      expect(() =>
        calculateLoanStructure(
          { availableMarginCapital: 10000 }, // 100,000
          { schemeCode: 'TERM', schemeName: 'Term', minProjectCost: 140001 }
        )
      ).toThrowError(/less than scheme minimum/);

      expect(() =>
        calculateLoanStructure(
          { availableMarginCapital: 600000 }, // 6,000,000
          { schemeCode: 'TERM', schemeName: 'Term', maxProjectCost: 5000000 }
        )
      ).toThrowError(/exceed scheme maximum/);
    });
  });

  describe('calculatePeriodicInstallment', () => {
    it('calculates standard monthly installment', () => {
      const installment = calculatePeriodicInstallment(new Decimal(100000), new Decimal(8), 84, 'MONTHLY');
      expect(installment.toNumber()).toBeCloseTo(1558.62, 2);
    });

    it('handles quarterly periodic rate correctly (Micro Finance spec)', () => {
      const installment = calculatePeriodicInstallment(new Decimal(125000), new Decimal(6.5), 36, 'QUARTERLY');
      // 12 quarters. 6.5% / 4 = 1.625% per quarter.
      // Expected: ~11545 per quarter
      expect(installment.toNumber()).toBeCloseTo(11549.42, 2);
    });

    it('handles zero interest rate', () => {
      const installment = calculatePeriodicInstallment(new Decimal(8400), new Decimal(0), 84, 'MONTHLY');
      expect(installment.toNumber()).toBe(100);
    });

    it('returns zero for zero principal', () => {
      const installment = calculatePeriodicInstallment(new Decimal(0), new Decimal(8), 84, 'MONTHLY');
      expect(installment.toNumber()).toBe(0);
    });

    it('calculateEMI wrapper works', () => {
       const emi = calculateEMI(new Decimal(100000), new Decimal(8), 84);
       expect(emi.toNumber()).toBeCloseTo(1558.62, 2);
    });

    it('rejects partial periods for installment calculation', () => {
      expect(() => calculatePeriodicInstallment(new Decimal(100000), new Decimal(8), 14, 'QUARTERLY')).toThrowError(/multiple/);
      expect(() => calculatePeriodicInstallment(new Decimal(100000), new Decimal(8), 20, 'YEARLY')).toThrowError(/multiple/);
    });
  });

  describe('calculateDSCR', () => {
    it('calculates correct DSCR > 1', () => {
      const res = calculateDSCR(new Decimal(10000), new Decimal(2000), new Decimal(2000), 'MONTHLY');
      expect(res.dscr?.toNumber()).toBe(4);
    });

    it('calculates correct DSCR < 1', () => {
      const res = calculateDSCR(new Decimal(3000), new Decimal(2000), new Decimal(2000), 'MONTHLY');
      expect(res.dscr?.toNumber()).toBe(0.5);
    });

    it('returns null for missing revenue', () => {
      const res = calculateDSCR(null, new Decimal(2000), new Decimal(2000), 'MONTHLY');
      expect(res.dscr).toBeNull();
    });

    it('returns null for missing operating cost', () => {
      const res = calculateDSCR(new Decimal(10000), null, new Decimal(2000), 'MONTHLY');
      expect(res.dscr).toBeNull();
    });

    it('returns null if both are missing', () => {
      const res = calculateDSCR(null, null, new Decimal(2000), 'MONTHLY');
      expect(res.dscr).toBeNull();
    });

    it('preserves legitimate zero values for revenue', () => {
      const res = calculateDSCR(new Decimal(0), new Decimal(2000), new Decimal(2000), 'MONTHLY');
      expect(res.dscr).not.toBeNull();
      expect(res.monthlyOperatingSurplus?.toNumber()).toBe(-2000);
      expect(res.dscr?.toNumber()).toBe(-1);
    });

    it('preserves legitimate zero values for operating cost', () => {
      const res = calculateDSCR(new Decimal(10000), new Decimal(0), new Decimal(2000), 'MONTHLY');
      expect(res.dscr).not.toBeNull();
      expect(res.monthlyOperatingSurplus?.toNumber()).toBe(10000);
      expect(res.dscr?.toNumber()).toBe(5);
    });

    it('returns null if debt service is 0', () => {
      const res = calculateDSCR(new Decimal(10000), new Decimal(2000), new Decimal(0), 'MONTHLY');
      expect(res.dscr).toBeNull();
    });
  });

  describe('generateRepaymentSchedule', () => {
    it('generates a schedule that reaches zero principal', () => {
      const schedule = generateRepaymentSchedule(
        new Decimal(100000),
        new Decimal(8),
        12, // 1 year
        0,  // no moratorium
        'MONTHLY',
        'UNKNOWN'
      );

      expect(schedule.length).toBe(12);
      expect(schedule[11].closingPrincipal.toNumber()).toBe(0);
    });

    it('handles moratorium periods with CAPITALIZE treatment', () => {
      const schedule = generateRepaymentSchedule(
        new Decimal(100000),
        new Decimal(12),
        24,
        6,
        'MONTHLY',
        'CAPITALIZE'
      );

      expect(schedule[0].isMoratorium).toBe(true);
      expect(schedule[0].principalPayment.toNumber()).toBe(0);
      expect(schedule[0].installmentAmount.toNumber()).toBe(0);
      expect(schedule[0].closingPrincipal.toNumber()).toBe(101000);
      expect(schedule[23].closingPrincipal.toNumber()).toBe(0);
    });

    it('handles moratorium periods with PAY_CURRENT treatment', () => {
      const schedule = generateRepaymentSchedule(
        new Decimal(100000),
        new Decimal(12),
        24,
        6,
        'MONTHLY',
        'PAY_CURRENT'
      );

      expect(schedule[0].isMoratorium).toBe(true);
      expect(schedule[0].principalPayment.toNumber()).toBe(0);
      expect(schedule[0].installmentAmount.toNumber()).toBe(1000);
      expect(schedule[0].closingPrincipal.toNumber()).toBe(100000);
      expect(schedule[23].closingPrincipal.toNumber()).toBe(0);
    });

    it('throws if moratorium treatment is UNKNOWN', () => {
      expect(() =>
        generateRepaymentSchedule(
          new Decimal(100000),
          new Decimal(12),
          24,
          6,
          'MONTHLY',
          'UNKNOWN'
        )
      ).toThrowError(/UNKNOWN/);
    });

    it('handles quarterly payment frequency correctly (valid 12-month tenure)', () => {
       const schedule = generateRepaymentSchedule(
        new Decimal(100000),
        new Decimal(12),
        12,
        0,
        'QUARTERLY',
        'CAPITALIZE'
      );
      expect(schedule.length).toBe(4);
      expect(schedule[0].interestPayment.toNumber()).toBe(3000);
      expect(schedule[3].closingPrincipal.toNumber()).toBe(0);
    });

    it('processes Term Loan specific configuration (6mo moratorium, quarterly)', () => {
       const schedule = generateRepaymentSchedule(
        new Decimal(4500000), // 45L
        new Decimal(8), // 8%
        84, // 84 months
        6, // 6 mo moratorium (2 quarters)
        'QUARTERLY',
        'PAY_CURRENT' // assuming PAY_CURRENT
      );
      // 84 total months / 3 = 28 periods.
      expect(schedule.length).toBe(28);
      // Moratorium first period: 45L * (8%/4) = 90k interest
      expect(schedule[0].isMoratorium).toBe(true);
      expect(schedule[0].interestPayment.toNumber()).toBe(90000);
      expect(schedule[27].closingPrincipal.toNumber()).toBe(0);
    });

    it('handles yearly payment frequency correctly (valid 12-month tenure)', () => {
       const schedule = generateRepaymentSchedule(
        new Decimal(100000),
        new Decimal(12),
        12,
        0,
        'YEARLY',
        'UNKNOWN'
      );
      expect(schedule.length).toBe(1);
    });

    it('validates 12-month monthly tenure', () => {
      expect(() => generateRepaymentSchedule(new Decimal(1000), new Decimal(10), 12, 0, 'MONTHLY', 'UNKNOWN')).not.toThrow();
    });

    it('rejects 14-month quarterly tenure', () => {
      expect(() => generateRepaymentSchedule(new Decimal(1000), new Decimal(10), 14, 0, 'QUARTERLY', 'UNKNOWN')).toThrowError(/multiple/);
    });

    it('rejects 20-month yearly tenure', () => {
      expect(() => generateRepaymentSchedule(new Decimal(1000), new Decimal(10), 20, 0, 'YEARLY', 'UNKNOWN')).toThrowError(/multiple/);
    });

    it('rejects 5-month quarterly moratorium', () => {
      expect(() => generateRepaymentSchedule(new Decimal(1000), new Decimal(10), 12, 5, 'QUARTERLY', 'CAPITALIZE')).toThrowError(/multiple/);
    });

    it('validates 6-month quarterly moratorium', () => {
      expect(() => generateRepaymentSchedule(new Decimal(1000), new Decimal(10), 12, 6, 'QUARTERLY', 'CAPITALIZE')).not.toThrow();
    });

    it('validates 12-month yearly moratorium', () => {
      expect(() => generateRepaymentSchedule(new Decimal(1000), new Decimal(10), 24, 12, 'YEARLY', 'CAPITALIZE')).not.toThrow();
    });
  });

  describe('runFinanceCalculation orchestrator', () => {
    it('runs the full end-to-end flow correctly and assigns calculationVersion', () => {
      const inputs = {
        availableMarginCapital: 100000, // 10L project cost
        expectedMonthlyRevenue: 75000,
        expectedMonthlyOperatingCost: 50000
      };

      const scheme = {
        schemeCode: 'TERM_LOAN',
        schemeName: 'Term Loan Scheme',
        minProjectCost: 140001,
        maxProjectCost: 5000000,
        financingPercentage: 90,
        maxLoanAmount: 4500000,
        interestRate: 8,
        tenureMonths: 84,
        moratoriumMonths: 6,
        paymentFrequency: 'QUARTERLY' as const,
        moratoriumInterestTreatment: 'CAPITALIZE' as const
      };

      const result = runFinanceCalculation(inputs, scheme);

      // loanAmount = 90% of 10L = 9,00,000
      expect(result.loanStructure.loanAmount.toNumber()).toBe(900000);
      expect(result.schedule.length).toBe(28);
      expect(result.dscrResult.annualCashAvailable?.toNumber()).toBe(300000);
      expect(result.calculationVersion).toBe(FINANCE_CALCULATION_VERSION);
    });
  });
});
