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
  availableMarginCapital: z.union([z.string(), z.number()]),
  expectedMonthlyRevenue: z.union([z.string(), z.number()]).optional().nullable(),
  expectedMonthlyOperatingCost: z.union([z.string(), z.number()]).optional().nullable(),
  // For scenarios where the user specifies tenure/interest, but typically they come from scheme
  requestedTenureMonths: z.number().int().positive().optional().nullable(),
  requestedInterestRate: z.union([z.string(), z.number()]).optional().nullable(),
  requestedMoratoriumMonths: z.number().int().nonnegative().optional().nullable(),
  requestedMoratoriumInterestTreatment: z.enum(['CAPITALIZE', 'PAY_CURRENT', 'UNKNOWN']).optional().nullable(),
  requestedPaymentFrequency: PaymentFrequencySchema.optional().nullable(),
});

export type FinancialInputs = z.infer<typeof FinancialInputsSchema>;
