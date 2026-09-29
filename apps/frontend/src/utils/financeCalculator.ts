export interface FundingBreakdown {
  projectCost: number;
  totalProjectCost: number;
  ownContribution: number;
  requiredOwnContribution: number;
  requiredContribution: number;
  maximumEligibleLoan: number;
  actualLoanRequirement: number;
  eligibleLoanAmount: number;
  shortfall: number;
  contributionShortfall: number;
  excessContribution: number;
  actualContributionPercentage: number;
  isMarginCompliant: boolean;
  meetsMinimumRequirement: boolean;
  fundingStatusMessage: string;
}

/**
 * Single source of truth calculation function for project funding breakdown.
 * Consumed identically by FeasibilityReportView, PDF Generator, and Dashboard.
 */
export function calculateFundingBreakdown(
  totalProjectCost: number,
  ownContribution: number,
  financingPercentage: number = 90
): FundingBreakdown {
  const cost = Math.max(0, Number(totalProjectCost) || 0);
  const own = Math.max(0, Number(ownContribution) || 0);
  const finPct = Number(financingPercentage) || 90;

  const requiredContribution = Math.round((cost * (100 - finPct)) / 100);
  const maximumEligibleLoan = Math.round((cost * finPct) / 100);
  const actualLoanRequirement = Math.max(0, cost - own);
  const eligibleLoanAmount = Math.min(actualLoanRequirement, maximumEligibleLoan);
  const contributionShortfall = Math.max(0, requiredContribution - own);
  const excessContribution = Math.max(0, own - requiredContribution);
  const actualContributionPercentage = cost > 0
    ? Math.round((own / cost) * 10000) / 100
    : 0;

  const isMarginCompliant = contributionShortfall === 0;
  const fundingStatusMessage = isMarginCompliant
    ? '✓ Meets 10% Minimum Own Contribution Requirement'
    : `Contribution requirement not yet met — Margin Shortfall of ₹${contributionShortfall.toLocaleString('en-IN')}`;

  return {
    projectCost: cost,
    totalProjectCost: cost,
    ownContribution: own,
    requiredOwnContribution: requiredContribution,
    requiredContribution,
    maximumEligibleLoan,
    actualLoanRequirement,
    eligibleLoanAmount,
    shortfall: contributionShortfall,
    contributionShortfall,
    excessContribution,
    actualContributionPercentage,
    isMarginCompliant,
    meetsMinimumRequirement: isMarginCompliant,
    fundingStatusMessage,
  };
}

export function formatIndianCurrency(val: number | null | undefined, prefix: string = '₹'): string {
  if (val === null || val === undefined || isNaN(Number(val))) {
    return 'Awaiting Inputs';
  }
  return `${prefix}${Math.round(Number(val)).toLocaleString('en-IN')}`;
}

