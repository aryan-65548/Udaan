import { db } from '../db';
import {
  assessments,
  assessmentInputs,
  locations,
  businessCategories,
  supportOrganizations,
  curatedVideos,
  reportTemplates,
  feasibilityReports,
} from '../db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { getLatestFinancialRun } from './finance';
import { getQuestionnaireWithResponses } from './questionnaire.service';
import { ensureQuestionnaireSeeded } from './questionnaire.service';
import { seedReportResources } from '../db/seeds/reports';

export class ReportEngineError extends Error {
  code: string;
  constructor(message: string, code: string = 'REPORT_ERROR') {
    super(message);
    this.name = 'ReportEngineError';
    this.code = code;
  }
}

/**
 * Ensures support organizations, videos, and templates are seeded.
 */
async function ensureReportResourcesSeeded() {
  const orgs = await db.select().from(supportOrganizations).limit(1);
  if (orgs.length === 0) {
    await seedReportResources(db);
  }
}

/**
 * Assembles and persists the 12-section Feasibility Report.
 */
export async function generateOrGetReport(assessmentId: string, userId: string) {
  await ensureQuestionnaireSeeded();
  await ensureReportResourcesSeeded();

  // 1. Fetch assessment with joins
  const [assessment] = await db
    .select({
      id: assessments.id,
      userId: assessments.userId,
      locationId: assessments.locationId,
      businessCategoryId: assessments.businessCategoryId,
      language: assessments.language,
      status: assessments.status,
      aiStatus: assessments.aiStatus,
      locationSelectionMethod: assessments.locationSelectionMethod,
      stateName: assessments.stateName,
      districtName: assessments.districtName,
      blockName: assessments.blockName,
      villageName: assessments.villageName,
      formattedAddress: assessments.formattedAddress,
      latitude: assessments.latitude,
      longitude: assessments.longitude,
      googlePlaceId: assessments.googlePlaceId,
      createdAt: assessments.createdAt,
      updatedAt: assessments.updatedAt,
      completedAt: assessments.completedAt,
      locationName: locations.name,
      locationType: locations.type,
      categoryName: businessCategories.name,
      categoryCode: businessCategories.code,
    })
    .from(assessments)
    .leftJoin(locations, eq(assessments.locationId, locations.id))
    .leftJoin(businessCategories, eq(assessments.businessCategoryId, businessCategories.id))
    .where(and(eq(assessments.id, assessmentId), eq(assessments.userId, userId)));

  if (!assessment) {
    throw new ReportEngineError('Assessment not found or access denied', 'NOT_FOUND');
  }

  // Check if a saved report already exists
  const existingReports = await db
    .select()
    .from(feasibilityReports)
    .where(eq(feasibilityReports.assessmentId, assessmentId))
    .limit(1);

  if (existingReports.length > 0) {
    const existing = existingReports[0];
    // Return existing saved report if status is COMPLETED
    if (existing.status === 'COMPLETED' || existing.downloadedAt) {
      return {
        id: existing.id,
        assessmentId: existing.assessmentId,
        status: existing.status,
        version: existing.version,
        createdAt: existing.createdAt,
        updatedAt: existing.updatedAt,
        completedAt: existing.completedAt,
        downloadedAt: existing.downloadedAt,
        ...((existing.reportSnapshot as any) || {}),
      };
    }
  }

  // 2. Fetch assessment inputs
  const rawInputs = await db
    .select()
    .from(assessmentInputs)
    .where(eq(assessmentInputs.assessmentId, assessmentId));

  const inputMap = new Map(rawInputs.map((i) => [i.inputKey, i]));

  // 3. Fetch latest financial calculation results from the financial engine
  let financeData = null;
  try {
    financeData = await getLatestFinancialRun(assessmentId);
  } catch {
    // Financial run may be optional or incomplete
  }

  // 4. Fetch questionnaire responses (Sahayak Q1–Q6)
  const questionnaireData = await getQuestionnaireWithResponses(assessmentId, userId);

  // 5. Fetch Support Organizations & Curated Videos from DB
  const orgs = await db
    .select()
    .from(supportOrganizations)
    .where(eq(supportOrganizations.isActive, true))
    .orderBy(asc(supportOrganizations.displayOrder));

  const vids = await db
    .select()
    .from(curatedVideos)
    .where(eq(curatedVideos.isActive, true))
    .orderBy(asc(curatedVideos.displayOrder));

  // 6. Fetch Report Template
  const templates = await db
    .select()
    .from(reportTemplates)
    .where(eq(reportTemplates.templateKey, 'template_grocery_retail_surat_v1'))
    .limit(1);

  const template = templates[0];
  const templateSections: any = template?.sectionsJson || {};

  // 7. Resolve location display text
  const locationDisplay =
    assessment.formattedAddress ||
    [
      assessment.villageName || assessment.locationName,
      assessment.blockName,
      assessment.districtName,
      assessment.stateName || 'Gujarat',
    ]
      .filter(Boolean)
      .join(', ') ||
    'Adajan / City Light area, Surat, Gujarat';

  const businessIdeaText = inputMap.get('business_idea')?.valueText || 'Neighbourhood grocery and daily essentials store.';
  const availableFundsVal = inputMap.get('available_cash_funds')?.valueNumber ? Number(inputMap.get('available_cash_funds')!.valueNumber) : null;
  const projectCostVal = inputMap.get('project_cost')?.valueNumber
    ? Number(inputMap.get('project_cost')!.valueNumber)
    : (financeData?.run ? Number(financeData.run.projectCost) : null);
  const ownContributionVal = inputMap.get('own_contribution')?.valueNumber
    ? Number(inputMap.get('own_contribution')!.valueNumber)
    : (financeData?.run ? Number(financeData.run.ownContribution) : null);

  // 8. Build Financial Summary block safely
  const run = financeData?.run;
  const scheme = financeData?.scheme;

  const financialSummary = {
    projectCost: projectCostVal,
    ownContribution: ownContributionVal,
    baseLoanAmount: (projectCostVal !== null && ownContributionVal !== null)
      ? projectCostVal - ownContributionVal
      : (run ? Number(run.loanAmount) : null),
    loanAmount: run ? Number(run.loanAmount) : null,
    requiredOwnContribution: ownContributionVal,
    shortfall: 0,
    theoretical10PercentMargin: projectCostVal ? projectCostVal * 0.1 : null,
    financingPercentage: scheme?.financingPercentage
      ? Number(scheme.financingPercentage)
      : (run?.loanAmount && projectCostVal ? (Number(run.loanAmount) / projectCostVal) * 100 : null),
    schemeCode: scheme?.schemeCode || 'MUDRA_SHISHU_KISHOR',
    schemeName: scheme?.schemeName || 'Pradhan Mantri Mudra Yojana (PMMY)',
    annualInterestRate: scheme?.interestRate ? `${scheme.interestRate}%` : (run?.interestRate ? `${run.interestRate}%` : '9.5%'),
    totalTenureMonths: scheme?.tenureMonths || run?.tenureMonths || 60,
    moratoriumMonths: scheme?.moratoriumMonths || run?.moratoriumMonths || 0,
    installmentAmount: run?.installmentAmount ? Number(run.installmentAmount) : (run?.emi ? Number(run.emi) : null),
    dscr: run?.dscr ? Number(run.dscr) : null,
    dscrStatus: run?.dscr ? (Number(run.dscr) >= 1.5 ? 'SUFFICIENT' : 'TIGHT') : 'UNAVAILABLE',
    dscrExplanation: 'Debt Service Coverage Ratio calculated from projected cash flows.',
    repaymentSchedule: financeData?.schedule || [],
    isScheduleCalculable: (financeData?.schedule?.length || 0) > 0,
    disclaimer:
      'Preliminary Feasibility Estimates: All figures, loan eligibility calculations, interest rates, and subsidies are estimated based on scheme guidelines. Final loan sanction, rate, and terms are subject to lending institution underwriting and document verification.',
  };

  // 9. Map Sahayak Questionnaire Q1–Q6
  const respMap = new Map(questionnaireData.questions.map((q) => [q.code, q]));
  const infraQ: any = respMap.get('INFRASTRUCTURE')?.savedResponse;
  const compQ: any = respMap.get('COMPETITORS')?.savedResponse;
  const seasonQ: any = respMap.get('SEASONAL_CONSTRAINTS')?.savedResponse;
  const demandQ: any = respMap.get('LOCAL_DEMAND')?.savedResponse;
  const custQ: any = respMap.get('CUSTOMERS_MARKET')?.savedResponse;
  const riskQ: any = respMap.get('BUSINESS_RISKS')?.savedResponse;

  const sahayakInfrastructure = {
    roadTransport: infraQ?.road_transport || 'Requires local verification',
    electricity: infraQ?.electricity || 'Requires local verification',
    water: infraQ?.water || 'Requires local verification',
    internet: infraQ?.connectivity || infraQ?.internet_mobile || 'Requires local verification',
    userReportedCompetitors: compQ?.hasNoCompetitors
      ? 'No direct nearby competitors identified by applicant.'
      : Array.isArray(compQ?.competitors) && compQ.competitors.length > 0
      ? compQ.competitors.map((c: any) => `${c.name || 'Competitor'} (${c.distance || 'nearby'})`).join(', ')
      : 'Not provided',
    seasonalConstraints: seasonQ?.constraints?.join(', ') || 'No significant constraints reported',
    seasonalExplanation: seasonQ?.explanation || '',
    affectedMonths: seasonQ?.affectedMonths || [],
    localDemandLevel: demandQ?.demandLevel || 'Moderate',
    demandReason: demandQ?.rationale || demandQ?.demandReason || 'Essential daily staples required by local residents.',
    targetCustomers: custQ?.customerGroups?.join(', ') || 'Local residential households',
    salesChannels: custQ?.salesChannels || 'Direct counter retail and local delivery',
    businessChallenges: riskQ?.challenges?.join(', ') || 'Working capital and competitive pricing',
    supportRequired: riskQ?.supportNeeded || 'Working capital finance and supplier tie-ups',
  };

  // 10. Assemble complete 12 sections
  const reportPayload = {
    metadata: {
      reportId: existingReports[0]?.id || undefined,
      assessmentId,
      userId,
      templateKey: template?.templateKey || 'template_grocery_retail_surat_v1',
      version: 1,
      generatedAt: new Date().toISOString(),
      businessName: 'Neighbourhood Grocery Retail (Kirana Store)',
      businessCategory: assessment.categoryName || 'Grocery Retail',
      location: locationDisplay,
      assessmentDate: new Date(assessment.createdAt).toISOString(),
      reportTitle: 'Business Feasibility & Advisory Intelligence Report',
      aiAdvisorGreeting:
        "Namaste! Here is your comprehensive business feasibility and financial viability advisory report for your proposed Kirana / Grocery Store in Surat, synthesized from your assessment data, local market parameters, and verified government financing schemes.",
    },

    // SECTION 1: EXECUTIVE SUMMARY
    executiveSummary: {
      businessName: 'Neighbourhood Grocery Store / Kirana Store',
      location: locationDisplay,
      assessmentDate: new Date(assessment.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      businessSummary:
        businessIdeaText ||
        'Establishment of a retail grocery store catering to daily staple needs, FMCG items, dairy, and household goods for local families.',
      targetCustomerSegment: sahayakInfrastructure.targetCustomers,
      reportPurpose:
        'To evaluate commercial viability, financial feasibility, debt service capacity, and operational risk factors prior to borrowing.',
      financialViabilitySummary: `Total estimated project outlay is ₹${(projectCostVal || 0).toLocaleString('en-IN')}, with an own equity contribution of ₹${(ownContributionVal || 0).toLocaleString('en-IN')}. Eligible for ${financialSummary.schemeName} financing at an estimated ${financialSummary.annualInterestRate} interest rate.`,
      demandAndCompetitionSummary: `Local market demand is assessed as ${sahayakInfrastructure.localDemandLevel}. Catchment analysis indicates viable retail density with competitive differentiation required against modern supermarkets.`,
      keyStrengths: [
        'High repeat customer frequency with non-discretionary daily consumable demand',
        'Competitive agility through personalised service, digital payments, and local home delivery',
        'Favourable debt coverage ratio supporting timely loan servicing',
      ],
      criticalWatchpoints: [
        'Strict working capital and credit ledger discipline (limit credit sales to <15% of turnover)',
        'Inventory loss prevention through rigorous First-In, First-Out (FIFO) stock rotation',
        'Timely statutory compliance with FSSAI registration and local municipal shop permits',
      ],
    },

    // SECTION 2: BUSINESS IDEA & LOCAL MARKET ANALYSIS
    marketAnalysis: {
      businessDescription:
        templateSections.marketAnalysis?.businessDescription ||
        'A neighbourhood grocery store (kirana) provides essential daily staples, packaged consumer food, dairy, hygiene items, and household necessities directly to residents within a 1–2 km immediate catchment area.',
      targetCustomerSegments: templateSections.marketAnalysis?.targetCustomerSegments || [
        'Nearby residential households needing daily and weekly grocery items',
        'Local apartment dwellers valuing doorstep convenience and emergency purchases',
        'Local commercial establishments and workers requiring instant snacks, beverages, and daily items',
      ],
      demandDrivers: templateSections.marketAnalysis?.demandDrivers || [
        'Consistent daily household consumption insulated from economic slowdowns',
        'Preference for proximate shopping, immediate physical inspection, and personalised credit trust',
        'Growth in local residential housing density in suburban semi-urban pockets',
      ],
      seasonalConsiderations: templateSections.marketAnalysis?.seasonalConsiderations || [
        'Monsoon season requires damp-proof dry storage for pulses, flours, and salt',
        'Festival seasons (Diwali, Uttarayan, Navratri) drive surges in specialty cooking items, dry fruits, and sweets',
        'Summer months increase demand for cold beverages, dairy, and packaged refreshments',
      ],
      essentialProductCategories: [
        'Grains, Flours, Pulses, Edible Oils, and Spices',
        'Packaged Foods, Biscuits, Teas, and Beverages',
        'Personal Hygiene, Soaps, Detergents, and Cleaning Supplies',
        'Fresh Dairy, Bakery, and Fast-Moving Perishables',
      ],
    },

    // SECTION 3: LOCAL COMPETITION ANALYSIS (5–10 KM RADIUS)
    competitionAnalysis: {
      methodologyNote:
        templateSections.competitionAnalysis?.methodologyNote ||
        'Competitor evaluation focuses on a 5–10 km radius around Adajan / City Light area, Surat. Competitor entries represent illustrative profiles and general local retail dynamics rather than verified proprietary merchant data.',
      competitorProfiles: templateSections.competitionAnalysis?.competitorProfiles || [],
    },

    // SECTION 4: PRICING & PRODUCT STRATEGY
    pricingProductStrategy: {
      pricingApproach:
        templateSections.pricingProductStrategy?.pricingApproach ||
        'Adopt a competitive Everyday Fair Pricing approach. Keep essential staples competitively priced with 5–8% gross margin to build store traffic, while earning 15–25% on packaged snacks, spices, toiletries, and impulse items.',
      inventoryMix: templateSections.pricingProductStrategy?.inventoryMix || [],
      workingCapitalDiscipline:
        templateSections.pricingProductStrategy?.workingCapitalDiscipline ||
        'Limit credit sales to no more than 10–15% of monthly revenue. Rotate stock on a strict First-In, First-Out (FIFO) basis to avoid expiry and rodent loss.',
    },

    // SECTION 5: FINANCIAL FEASIBILITY (REAL ENGINE)
    financialFeasibility: financialSummary,

    // SECTION 6: SWOT ANALYSIS
    swotAnalysis: {
      strengths: templateSections.swotAnalysis?.strengths || [],
      weaknesses: templateSections.swotAnalysis?.weaknesses || [],
      opportunities: templateSections.swotAnalysis?.opportunities || [],
      threats: templateSections.swotAnalysis?.threats || [],
    },

    // SECTION 7: RISK ANALYSIS & MITIGATION
    riskAnalysis: templateSections.riskAnalysis || [],

    // SECTION 8: INFRASTRUCTURE & GROUND REALITY (SAHAYAK QUESTIONNAIRE)
    infrastructureAssessment: sahayakInfrastructure,

    // SECTION 9: SUPPORT ORGANIZATIONS (DB-BACKED)
    supportOrganizations: orgs,

    // SECTION 10: CURATED YOUTUBE LEARNING RESOURCES (DB-BACKED)
    curatedVideos: vids,

    // SECTION 11: ACTION PLAN
    actionPlan: templateSections.actionPlan || [],

    // SECTION 12: CONCLUSION & LIMITATIONS
    conclusionAndLimitations: {
      conclusion: `Based on deterministic financial calculations and ground reality inputs, the proposed Neighbourhood Grocery Store project exhibits positive operational feasibility with adequate debt service coverage under ${financialSummary.schemeName}. Execution success depends strictly on working capital management, initial customer acquisition, and inventory shrinkage control.`,
      limitations: [
        'Pre-Authored Demonstration Narrative: Qualitative narrative sections are structured from verified retail benchmarks and not generated dynamically by an uncontrolled LLM.',
        'Illustrative Market Profiles: Competitor benchmarks represent general retail archetypes within Surat and require local ground validation.',
        'Non-Binding NGO Resources: Listed support organizations are independent public/community bodies; inclusion does not constitute a guaranteed subsidy or formal sponsorship.',
        'Preliminary Financing Indicators: Scheme metrics and interest rates reflect published guidelines and do not constitute a formal loan sanction.',
      ],
    },
  };

  // 11. Persist or update snapshot in feasibility_reports
  const [savedReport] = await db
    .insert(feasibilityReports)
    .values({
      assessmentId,
      userId,
      templateId: template?.id || 'tmpl_grocery_surat_v1',
      version: 1,
      status: 'GENERATED',
      reportSnapshot: reportPayload,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: feasibilityReports.assessmentId,
      set: {
        reportSnapshot: reportPayload,
        updatedAt: new Date(),
      },
    })
    .returning();

  return {
    id: savedReport.id,
    assessmentId: savedReport.assessmentId,
    status: savedReport.status,
    version: savedReport.version,
    createdAt: savedReport.createdAt,
    updatedAt: savedReport.updatedAt,
    completedAt: savedReport.completedAt,
    downloadedAt: savedReport.downloadedAt,
    ...reportPayload,
  };
}

/**
 * Marks report as downloaded and transitions assessment to COMPLETED.
 */
export async function markReportDownloaded(assessmentId: string, userId: string) {
  const [assessment] = await db
    .select()
    .from(assessments)
    .where(and(eq(assessments.id, assessmentId), eq(assessments.userId, userId)));

  if (!assessment) {
    throw new ReportEngineError('Assessment not found or access denied', 'NOT_FOUND');
  }

  const now = new Date();

  // Update feasibility report record
  const [updatedReport] = await db
    .update(feasibilityReports)
    .set({
      status: 'COMPLETED',
      downloadedAt: now,
      completedAt: now,
      updatedAt: now,
    })
    .where(eq(feasibilityReports.assessmentId, assessmentId))
    .returning();

  // Update assessment status to COMPLETED
  await db
    .update(assessments)
    .set({
      status: 'COMPLETED',
      completedAt: now,
      updatedAt: now,
    })
    .where(eq(assessments.id, assessmentId));

  return {
    assessmentId,
    status: 'COMPLETED',
    downloadedAt: now.toISOString(),
    completedAt: now.toISOString(),
    message: 'Report download acknowledged and assessment marked COMPLETED.',
  };
}
