import { apiClient } from './client';

export interface LoanStructureResult {
  projectCost: number | string;
  availableMarginCapital: number | string;
  requiredOwnContribution: number | string;
  shortfall: number | string;
  baseLoanAmount: number | string;
  loanAmount: number | string;
  theoretical10PercentMargin: number | string;
  financingPercentage: number | string;
}

export interface RepaymentScheduleItem {
  sequenceNumber: number;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  openingPrincipal: string;
  principalPayment: string;
  interestPayment: string;
  installmentAmount: string;
  closingPrincipal: string;
  isMoratorium: boolean;
}

export interface DSCRResult {
  monthlyProjectedRevenue?: number | string | null;
  monthlyOperatingCosts?: number | string | null;
  monthlyOperatingSurplus: number | string | null;
  annualOperatingSurplus?: number | string | null;
  annualCashAvailable: number | string | null;
  annualDebtService: number | string;
  dscr: number | string | null;
  status?: 'SUFFICIENT' | 'TIGHT' | 'INSUFFICIENT' | 'UNAVAILABLE';
  explanation?: string;
}

export interface FullFinanceResult {
  loanStructure: LoanStructureResult;
  annualInterestRate?: number | string;
  quarterlyPeriodicRate?: number | string;
  totalTenureMonths?: number;
  moratoriumMonths?: number;
  activeRepaymentMonths?: number;
  numberOfRepayments?: number;
  paymentFrequency?: string;
  moratoriumInterestTreatment?: string;
  installmentAmount: number | string;
  annualDebtService?: number | string;
  dscrResult: DSCRResult;
  schedule: RepaymentScheduleItem[];
  totalPrincipal?: number | string;
  totalInterest: number | string;
  totalRepayment: number | string;
  isScheduleCalculable: boolean;
  scheduleUnavailableReason?: string;
  calculationVersion: string;
}

export interface CalculateFinanceResponse {
  status: 'SUCCESS' | 'NOT_ELIGIBLE';
  runId?: string;
  schemeCode?: string;
  schemeName?: string;
  financeResult?: FullFinanceResult;
  projectCost?: number;
  message?: string;
}

export interface SchemeItem {
  id: string;
  schemeCode: string;
  schemeName: string;
  minProjectCost?: string | null;
  maxProjectCost?: string | null;
  financingPercentage?: string | null;
  maxLoanAmount?: string | null;
  interestRate?: string | null;
  tenureMonths?: number | null;
  moratoriumMonths?: number | null;
  paymentFrequency?: string | null;
}

export interface GetFinanceResponse {
  run: any;
  schedule: RepaymentScheduleItem[];
  scheme: SchemeItem | null;
}

export async function calculateFinance(
  assessmentId: string,
  payload?: {
    project_cost?: number;
    own_contribution?: number;
    available_margin_capital?: number;
    available_cash_funds?: number;
    expected_monthly_revenue?: number;
    expected_monthly_operating_cost?: number;
    requested_moratorium_interest_treatment?: 'CAPITALIZE' | 'PAY_CURRENT' | 'UNKNOWN';
    requested_payment_frequency?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  }
): Promise<CalculateFinanceResponse> {
  return apiClient<CalculateFinanceResponse>(`/assessments/${assessmentId}/finance/calculate`, {
    method: 'POST',
    body: payload ? JSON.stringify(payload) : undefined,
  });
}

export async function getLatestFinance(assessmentId: string): Promise<GetFinanceResponse> {
  return apiClient<GetFinanceResponse>(`/assessments/${assessmentId}/finance`);
}

export async function getFinanceRuns(assessmentId: string): Promise<any[]> {
  return apiClient<any[]>(`/assessments/${assessmentId}/finance/runs`);
}

export async function updateFinanceInputs(
  assessmentId: string,
  payload: Record<string, any>
): Promise<any[]> {
  return apiClient<any[]>(`/assessments/${assessmentId}/finance/inputs`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
