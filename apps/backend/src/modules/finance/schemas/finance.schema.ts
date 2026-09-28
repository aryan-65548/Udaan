import { z } from 'zod';

export const PaymentFrequencySchema = z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']);
export type PaymentFrequency = z.infer<typeof PaymentFrequencySchema>;

// Scheme configuration input validation
export const SchemeConfigSchema = z.object({
  id: z.string().uuid().optional(),
  schemeCode: z.string().min(1),
  schemeName: z.string().min(1),
  minProjectCost: z.union([z.string(), z.number()]).optional().nullable(),
  maxProjectCost: z.union([z.string(), z.number()]).optional().nullable(),
  financingPercentage: z.union([z.string(), z.number()]).optional().nullable(),
  maxLoanAmount: z.union([z.string(), z.number()]).optional().nullable(),
  interestRate: z.union([z.string(), z.number()]).optional().nullable(), // Annual interest rate in percentage (e.g. 8.5)
  tenureMonths: z.number().int().positive().optional().nullable(),
  moratoriumMonths: z.number().int().nonnegative().optional().nullable(),
  moratoriumInterestTreatment: z.enum(['CAPITALIZE', 'PAY_CURRENT', 'UNKNOWN']).optional().nullable(),
  paymentFrequency: PaymentFrequencySchema.optional().nullable(),
});

export type SchemeConfig = z.infer<typeof SchemeConfigSchema>;

// Financial inputs from user/assessment
export const FinancialInputsSchema = z.object({
  availableMarginCapital: z.union([z.string(), z.number()]).optional().nullable(),
  ownContribution: z.union([z.string(), z.number()]).optional().nullable(),
  projectCost: z.union([z.string(), z.number()]).optional().nullable(),
  availableCashFunds: z.union([z.string(), z.number()]).optional().nullable(),
  expectedMonthlyRevenue: z.union([z.string(), z.number()]).optional().nullable(),
  expectedMonthlyOperatingCost: z.union([z.string(), z.number()]).optional().nullable(),
  // For scenarios where the user specifies tenure/interest, but typically they come from scheme
  requestedTenureMonths: z.number().int().positive().optional().nullable(),
  requestedInterestRate: z.union([z.string(), z.number()]).optional().nullable(),
  requestedMoratoriumMonths: z.number().int().nonnegative().optional().nullable(),
  requestedMoratoriumInterestTreatment: z.enum(['CAPITALIZE', 'PAY_CURRENT', 'UNKNOWN']).optional().nullable(),
  requestedPaymentFrequency: PaymentFrequencySchema.optional().nullable(),
}).superRefine((data, ctx) => {
  const margin = data.ownContribution ?? data.availableMarginCapital;
  const project = data.projectCost;

  if ((margin === undefined || margin === null || margin === '') &&
      (project === undefined || project === null || project === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Either own contribution (available margin capital) or total project cost must be provided.',
      path: ['ownContribution'],
    });
  }

  // Validate non-negative numbers
  if (margin !== undefined && margin !== null && margin !== '') {
    const num = Number(margin);
    if (isNaN(num) || !isFinite(num) || num < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Own contribution must be a valid non-negative number',
        path: ['ownContribution'],
      });
    }
  }

  if (project !== undefined && project !== null && project !== '') {
    const num = Number(project);
    if (isNaN(num) || !isFinite(num) || num <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Project cost must be a positive number greater than 0',
        path: ['projectCost'],
      });
    }
  }

  if (data.availableCashFunds !== undefined && data.availableCashFunds !== null && data.availableCashFunds !== '') {
    const num = Number(data.availableCashFunds);
    if (isNaN(num) || !isFinite(num) || num < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Available cash savings must be a valid non-negative number',
        path: ['availableCashFunds'],
      });
    }
  }

  if (data.expectedMonthlyRevenue !== undefined && data.expectedMonthlyRevenue !== null && data.expectedMonthlyRevenue !== '') {
    const num = Number(data.expectedMonthlyRevenue);
    if (isNaN(num) || !isFinite(num) || num < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Expected monthly revenue must be a valid non-negative number',
        path: ['expectedMonthlyRevenue'],
      });
    }
  }

  if (data.expectedMonthlyOperatingCost !== undefined && data.expectedMonthlyOperatingCost !== null && data.expectedMonthlyOperatingCost !== '') {
    const num = Number(data.expectedMonthlyOperatingCost);
    if (isNaN(num) || !isFinite(num) || num < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Expected monthly operating cost must be a valid non-negative number',
        path: ['expectedMonthlyOperatingCost'],
      });
    }
  }

  // Validate own contribution does not exceed project cost when both provided
  if (margin !== undefined && margin !== null && margin !== '' &&
      project !== undefined && project !== null && project !== '') {
    const numMargin = Number(margin);
    const numProject = Number(project);
    if (!isNaN(numMargin) && !isNaN(numProject) && numMargin > numProject) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Own contribution (₹${numMargin}) cannot exceed total project cost (₹${numProject})`,
        path: ['ownContribution'],
      });
    }
  }

  // Validate own contribution does not exceed available cash funds when both provided
  if (margin !== undefined && margin !== null && margin !== '' &&
      data.availableCashFunds !== undefined && data.availableCashFunds !== null && data.availableCashFunds !== '') {
    const numMargin = Number(margin);
    const numFunds = Number(data.availableCashFunds);
    if (!isNaN(numMargin) && !isNaN(numFunds) && numMargin > numFunds) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Own contribution (₹${numMargin}) cannot exceed declared available cash savings (₹${numFunds})`,
        path: ['ownContribution'],
      });
    }
  }
});

export type FinancialInputs = z.infer<typeof FinancialInputsSchema>;
