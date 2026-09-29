import { apiClient } from './client';

export interface QuestionOptionItem {
  key?: string;
  label?: string;
  labelHi?: string;
  labelGu?: string;
}

export interface QuestionData {
  id: string;
  code: string;
  version: number;
  displayOrder: number;
  questionText: string;
  questionType: string;
  options: any;
  isRequired: boolean;
  savedResponse: Record<string, any> | null;
  savedAt: string | null;
}

export interface QuestionnaireData {
  assessmentId: string;
  totalQuestions: number;
  completedCount: number;
  isComplete: boolean;
  questions: QuestionData[];
}

export interface SupportOrganizationItem {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  explanation: string;
  locationCity?: string | null;
  locationDistrict?: string | null;
  locationState?: string | null;
}

export interface CuratedVideoItem {
  id: string;
  title: string;
  url: string;
  youtubeId: string;
  language: string;
  category: string;
  displayOrder: number;
}

export interface FeasibilityReportData {
  id?: string;
  assessmentId: string;
  status: string;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string | null;
  downloadedAt?: string | null;

  metadata: {
    reportId?: string;
    assessmentId: string;
    userId: string;
    templateKey: string;
    version: number;
    generatedAt: string;
    businessName: string;
    businessCategory: string;
    location: string;
    assessmentDate: string;
    reportTitle: string;
    aiAdvisorGreeting: string;
  };

  // Section 1: Executive Summary
  executiveSummary: {
    businessName: string;
    location: string;
    assessmentDate: string;
    businessSummary: string;
    targetCustomerSegment: string;
    reportPurpose: string;
    financialViabilitySummary: string;
    demandAndCompetitionSummary: string;
    keyStrengths: string[];
    criticalWatchpoints: string[];
  };

  // Section 2: Market Analysis
  marketAnalysis: {
    businessDescription: string;
    targetCustomerSegments: string[];
    demandDrivers: string[];
    seasonalConsiderations: string[];
    essentialProductCategories: string[];
  };

  // Section 3: Competition Analysis
  competitionAnalysis: {
    methodologyNote: string;
    competitorProfiles: Array<{
      name: string;
      type: string;
      distance: string;
      competitiveOffering: string;
      competitivePressure: string;
      differentiationStrategy: string;
    }>;
  };

  // Section 4: Pricing & Product Strategy
  pricingProductStrategy: {
    pricingApproach: string;
    inventoryMix: Array<{
      category: string;
      turnover: string;
      margin: string;
    }>;
    workingCapitalDiscipline: string;
  };

  // Section 5: Financial Feasibility
  financialFeasibility: {
    projectCost: number | null;
    ownContribution: number | null;
    baseLoanAmount: number | null;
    loanAmount: number | null;
    requiredOwnContribution: number | null;
    shortfall: number | null;
    theoretical10PercentMargin: number | null;
    financingPercentage: number | string | null;
    schemeCode: string;
    schemeName: string;
    annualInterestRate: string;
    totalTenureMonths: number;
    moratoriumMonths: number;
    installmentAmount: number | string | null;
    dscr: number | string | null;
    dscrStatus: string;
    dscrExplanation: string;
    repaymentSchedule: any[];
    isScheduleCalculable: boolean;
    disclaimer: string;
  };

  // Section 6: SWOT Analysis
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };

  // Section 7: Risk Analysis & Mitigation
  riskAnalysis: Array<{
    risk: string;
    likelihood: string;
    impact: string;
    mitigationStrategy: string;
    monitoringIndicator: string;
  }>;

  // Section 8: Infrastructure & Ground Reality
  infrastructureAssessment: {
    roadTransport: string;
    electricity: string;
    water: string;
    internet: string;
    userReportedCompetitors: string;
    seasonalConstraints: string;
    seasonalExplanation: string;
    affectedMonths: string[];
    localDemandLevel: string;
    demandReason: string;
    targetCustomers: string;
    salesChannels: string;
    businessChallenges: string;
    supportRequired: string;
    actionableRecommendations?: Array<{
      facilityKey: string;
      facilityName: string;
      rating: string;
      ratingLabel: string;
      impact: string;
      recommendations: string[];
      priority: 'HIGH' | 'MEDIUM' | 'LOW';
    }>;
  };

  // Section 9: Support Organizations
  supportOrganizations: SupportOrganizationItem[];

  // Section 10: Curated Videos
  curatedVideos: CuratedVideoItem[];

  // Section 11: Action Plan
  actionPlan: Array<{
    step: number;
    title: string;
    duration: string;
    details: string;
  }>;

  // Section 12: Conclusion & Limitations
  conclusionAndLimitations: {
    conclusion: string;
    limitations: string[];
  };
}

export async function getQuestionnaire(assessmentId: string): Promise<QuestionnaireData> {
  return apiClient<QuestionnaireData>(`/assessments/${assessmentId}/questionnaire`);
}

export async function saveQuestionnaireResponses(
  assessmentId: string,
  responses: Array<{ questionCode: string; response: Record<string, any> }>
): Promise<any> {
  return apiClient<any>(`/assessments/${assessmentId}/questionnaire/responses`, {
    method: 'PUT',
    body: JSON.stringify({ responses }),
  });
}

export async function submitQuestionnaire(assessmentId: string): Promise<any> {
  return apiClient<any>(`/assessments/${assessmentId}/questionnaire/submit`, {
    method: 'POST',
  });
}

export async function getFeasibilityReport(
  assessmentId: string
): Promise<FeasibilityReportData> {
  return apiClient<FeasibilityReportData>(
    `/assessments/${assessmentId}/questionnaire/feasibility-report`
  );
}

export async function recordReportDownload(assessmentId: string): Promise<any> {
  return apiClient<any>(
    `/assessments/${assessmentId}/questionnaire/feasibility-report/download`,
    {
      method: 'POST',
    }
  );
}
