import { z } from 'zod';

export const PaymentFrequencySchema = z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']);
export type PaymentFrequency = z.infer<typeof PaymentFrequencySchema>;

// Scheme configuration input validation
export const SchemeConfigSchema = z.object({
  id: z.string().uuid().optional(),
  schemeCode: z.string().min(1),
  schemeName: z.string().min(1),
  minProjectCost: z.number().nonnegative().optional().nullable(),
  maxProjectCost: z.number().nonnegative().optional().nullable(),
  financingPercentage: z.number().min(0).max(100).optional().nullable(),
  maxLoanAmount: z.number().nonnegative().optional().nullable(),
  interestRate: z.number().nonnegative().optional().nullable(), // Annual interest rate in percentage (e.g. 8.5)
  tenureMonths: z.number().int().positive().optional().nullable(),
  moratoriumMonths: z.number().int().nonnegative().optional().nullable(),
  moratoriumInterestTreatment: z.enum(['CAPITALIZE', 'PAY_CURRENT', 'UNKNOWN']).optional().nullable(),
  paymentFrequency: PaymentFrequencySchema.optional().nullable(),
});

export type SchemeConfig = z.infer<typeof SchemeConfigSchema>;

// Financial inputs from user/assessment
export const FinancialInputsSchema = z.object({
  availableMarginCapital: z.number().nonnegative(),
  expectedMonthlyRevenue: z.number().nonnegative().optional().nullable(),
  expectedMonthlyOperatingCost: z.number().nonnegative().optional().nullable(),
  // For scenarios where the user specifies tenure/interest, but typically they come from scheme
  requestedTenureMonths: z.number().int().positive().optional().nullable(),
  requestedInterestRate: z.number().nonnegative().optional().nullable(),
  requestedMoratoriumMonths: z.number().int().nonnegative().optional().nullable(),
  requestedMoratoriumInterestTreatment: z.enum(['CAPITALIZE', 'PAY_CURRENT', 'UNKNOWN']).optional().nullable(),
  requestedPaymentFrequency: PaymentFrequencySchema.optional().nullable(),
});

export type FinancialInputs = z.infer<typeof FinancialInputsSchema>;
