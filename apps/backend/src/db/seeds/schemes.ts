import { schemeConfigs } from '../schema/finance';
import crypto from 'crypto';

export const initialSchemeConfigs = [
  {
    id: crypto.randomUUID(),
    schemeCode: 'MICRO_FINANCE',
    schemeName: 'Micro Finance Scheme',
    maxProjectCost: '140000.00',
    financingPercentage: '90.000',
    maxLoanAmount: '125000.00',
    interestRate: '6.500',
    tenureMonths: 36,
    moratoriumMonths: 3,
    paymentFrequency: 'QUARTERLY' as const,
    effectiveFrom: new Date('2026-01-01'),
    sourceName: 'System Default',
    sourceReference: 'Hackathon Specification - Micro Finance',
    isActive: true,
  },
  {
    id: crypto.randomUUID(),
    schemeCode: 'TERM_LOAN',
    schemeName: 'Term Loan Scheme',
    minProjectCost: '140001.00',
    maxProjectCost: '5000000.00',
    financingPercentage: '90.000',
    maxLoanAmount: '4500000.00',
    interestRate: '8.000',
    tenureMonths: 84,
    moratoriumMonths: 6,
    paymentFrequency: 'QUARTERLY' as const,
    effectiveFrom: new Date('2026-01-01'),
    sourceName: 'System Default',
    sourceReference: 'Hackathon Specification - Term Loan',
    isActive: true,
  }
];

export async function seedSchemes(db: any) {
  for (const config of initialSchemeConfigs) {
    await db.insert(schemeConfigs).values(config).onConflictDoNothing({ target: schemeConfigs.schemeCode });
  }
}
