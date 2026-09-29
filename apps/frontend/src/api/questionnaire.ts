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
    reportGeneratedDate?: string;
    reportStatus?: string;
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
    pricingPillars?: Array<{
      pillarNumber?: number;
      title: string;
      approach?: string;
      recommendedApproach?: string;
      whyItMatters?: string;
    }>;
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
    schemeLoanCap?: number | null;
    finalEligibleLoan?: number | null;
    maximumSchemeFinancing?: number | null;
    loanAmount: number | null;
    requiredOwnContribution: number | null;
    shortfall: number | null;
    actualContributionPercentage?: number | null;
    minimumContributionPercentage?: number | null;
    requestedFundingGap?: number | null;
    isEligibleMargin?: boolean;
    marginStatusMessage?: string;
    theoretical10PercentMargin: number | null;
    financingPercentage: number | string | null;
    schemeCode: string;
    schemeName: string;
    annualInterestRate: string;
    totalTenureMonths: number;
    moratoriumMonths: number;
    activeRepaymentMonths?: number;
    activeRepaymentPeriodMonths?: number;
    activeRepaymentsCount?: number;
    paymentFrequency?: string;
    repaymentFrequency?: string;
    moratoriumInterestTreatment?: string;
    installmentAmount: number | string | null;
    annualDebtService?: number | string | null;
    totalInterest?: number | string | null;
    totalRepayment?: number | string | null;
    totalRepaymentAmount?: number | string | null;
    dscr: number | string | null;
    dscrStatus: string;
    dscrExplanation: string;
    dscrIsIllustrative?: boolean;
    hasRevenueInputs?: boolean;
    monthlyProjectedRevenue?: number;
    monthlyOperatingCost?: number;
    monthlyOperatingSurplus?: number;
    annualCashAvailable?: number;
    demoCashFlow?: {
      monthlyRevenue: number;
      monthlyOperatingCost: number;
      monthlyOperatingSurplus: number;
      annualCashAvailable: number;
      annualDebtService: number;
    };
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
    whyItMatters?: string;
    likelihood: string;
    impact: string;
    mitigationStrategy: string;
    mitigationPoints?: string[];
    monitoringIndicator: string;
    monitoringPoints?: string[];
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
      priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'High' | 'Medium' | 'Low';
    }>;
  };

  // Section 8.5 / 9: Other Government Schemes & Support
  otherGovernmentSchemes?: Array<{
    schemeCode?: string;
    schemeName: string;
    agency?: string;
    department?: string;
    purpose: string;
    assistanceType: string;
    eligibilityConditions: string;
    currentAssessmentStatus?: string;
    assessmentStatus?: string;
    statusLabel?: string;
    eligibilityExplanation?: string;
    why?: string;
    officialUrl: string;
    lastVerifiedDate?: string;
    lastVerified?: string;
  }>;

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
