import { apiClient } from './client';
import type { LocationItem } from './locations';
import type { BusinessCategoryItem } from './businessCategories';

export type AssessmentStatus =
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'AI_QUESTIONING'
  | 'AI_ANALYZING'
  | 'REPORT_READY'
  | 'COMPLETED'
  | 'FAILED';

export type AiStatus =
  | 'NOT_STARTED'
  | 'QUESTIONING'
  | 'ANALYZING'
  | 'READY'
  | 'ERROR';

export type InputType =
  | 'TEXT'
  | 'NUMBER'
  | 'BOOLEAN'
  | 'SELECT'
  | 'MULTI_SELECT'
  | 'DATE'
  | 'JSON';

export type InputSource = 'USER' | 'AI' | 'SYSTEM';

export interface AssessmentItem {
  id: string;
  userId: string;
  locationId: string;
  businessCategoryId: string;
  language: 'en' | 'hi' | 'gu';
  status: AssessmentStatus;
  aiStatus: AiStatus;
  aiSessionId: string | null;
  locationSelectionMethod?: 'ADMINISTRATIVE' | 'GOOGLE_MAPS';
  countryCode?: string;
  stateName?: string | null;
  districtName?: string | null;
  blockName?: string | null;
  villageName?: string | null;
  formattedAddress?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  googlePlaceId?: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  location?: { id: string; name: string; type?: string } | null;
  businessCategory?: { id: string; name: string; code?: string } | null;
}

export interface FinancialRun {
  id: string;
  assessmentId: string;
  ownContribution: string | null;
  projectCost: string | null;
  loanAmount: string | null;
  interestRate: string | null;
  tenureMonths: number | null;
  moratoriumMonths: number | null;
  paymentFrequency: string | null;
  emi: string | null;
  installmentAmount: string | null;
  annualDebtService: string | null;
  dscr: string | null;
  totalInterest: string | null;
  totalRepayment: string | null;
  createdAt: string;
}

export interface AssessmentDetail extends AssessmentItem {
  location: LocationItem | null;
  businessCategory: BusinessCategoryItem | null;
  latestFinancialRun: FinancialRun | null;
}

export interface AssessmentInputRecord {
  id: string;
  assessmentId: string;
  inputKey: string;
  questionText: string | null;
  inputType: InputType;
  valueText: string | null;
  valueNumber: string | number | null;
  valueBoolean: boolean | null;
  valueJson: unknown;
  source: InputSource;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssessmentPayload {
  locationId: string;
  businessCategoryId: string;
  language?: 'en' | 'hi' | 'gu';
  locationSelectionMethod?: 'ADMINISTRATIVE' | 'GOOGLE_MAPS';
  countryCode?: string;
  stateName?: string | null;
  districtName?: string | null;
  blockName?: string | null;
  villageName?: string | null;
  formattedAddress?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  googlePlaceId?: string | null;
}

export interface UpdateAssessmentPayload {
  locationId?: string;
  businessCategoryId?: string;
  language?: 'en' | 'hi' | 'gu';
  locationSelectionMethod?: 'ADMINISTRATIVE' | 'GOOGLE_MAPS';
  countryCode?: string;
  stateName?: string | null;
  districtName?: string | null;
  blockName?: string | null;
  villageName?: string | null;
  formattedAddress?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  googlePlaceId?: string | null;
}

export interface PutInputPayload {
  questionText?: string | null;
  inputType: InputType;
  valueText?: string | null;
  valueNumber?: number | string | null;
  valueBoolean?: boolean | null;
  valueJson?: unknown;
  source?: InputSource;
}

export interface ProfileInputItem {
  questionText?: string | null;
  inputType?: InputType;
  value: any;
  source?: InputSource;
}

export type PatchProfilePayload = Record<string, string | number | boolean | null | ProfileInputItem>;

export async function createAssessment(payload: CreateAssessmentPayload): Promise<AssessmentItem> {
  return apiClient<AssessmentItem>('/assessments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getAssessments(): Promise<AssessmentItem[]> {
  return apiClient<AssessmentItem[]>('/assessments');
}

export async function getAssessmentById(id: string): Promise<AssessmentDetail> {
  return apiClient<AssessmentDetail>(`/assessments/${id}`);
}

export async function updateAssessment(id: string, payload: UpdateAssessmentPayload): Promise<AssessmentItem> {
  return apiClient<AssessmentItem>(`/assessments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function completeAssessment(id: string): Promise<AssessmentItem> {
  return apiClient<AssessmentItem>(`/assessments/${id}/complete`, {
    method: 'POST',
  });
}

export async function getAssessmentInputs(id: string): Promise<AssessmentInputRecord[]> {
  return apiClient<AssessmentInputRecord[]>(`/assessments/${id}/inputs`);
}

export async function putAssessmentInput(
  id: string,
  inputKey: string,
  payload: PutInputPayload
): Promise<AssessmentInputRecord> {
  return apiClient<AssessmentInputRecord>(`/assessments/${id}/inputs/${encodeURIComponent(inputKey)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function patchProfile(id: string, payload: PatchProfilePayload): Promise<AssessmentInputRecord[]> {
  return apiClient<AssessmentInputRecord[]>(`/assessments/${id}/profile`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
