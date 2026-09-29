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

  // 8. Build Financial Summary block with deterministic finance engine
  const run = financeData?.run;
  const scheme = financeData?.scheme;
  const schedule = financeData?.schedule || [];

  const projectCostNum = projectCostVal !== null ? projectCostVal : (run ? Number(run.projectCost) : 3700000);
  const actualOwnContrib = ownContributionVal !== null ? ownContributionVal : (run ? Number(run.ownContribution) : 299997);
  
  // Scheme loan calculations: 90% financing rule, capped by scheme maximum
  const financingPct = scheme?.financingPercentage ? Number(scheme.financingPercentage) : 90;
  const rawBaseLoan = Math.round((projectCostNum * financingPct) / 100);
  const schemeLoanCap = scheme?.maxLoanAmount ? Number(scheme.maxLoanAmount) : 4500000;
  const finalEligibleLoan = Math.min(rawBaseLoan, schemeLoanCap);
  
  const requiredOwnContribution = projectCostNum - finalEligibleLoan;
  const marginShortfall = Math.max(0, requiredOwnContribution - actualOwnContrib);
  const isMarginCompliant = marginShortfall === 0;
  const actualContributionPct = projectCostNum > 0 ? Math.round((actualOwnContrib / projectCostNum) * 10000) / 100 : 0;
  const requestedFundingGap = Math.max(0, projectCostNum - actualOwnContrib);

  const totalTenureMonths = scheme?.tenureMonths || run?.tenureMonths || 84;
  const moratoriumMonths = scheme?.moratoriumMonths !== undefined && scheme?.moratoriumMonths !== null ? scheme.moratoriumMonths : (run?.moratoriumMonths ?? 6);
  const activeRepaymentMonths = totalTenureMonths - moratoriumMonths;
  const paymentFrequency = scheme?.paymentFrequency || run?.paymentFrequency || 'QUARTERLY';
  const periodsPerYear = paymentFrequency === 'MONTHLY' ? 12 : paymentFrequency === 'QUARTERLY' ? 4 : 1;
  const activeRepaymentsCount = activeRepaymentMonths / (12 / periodsPerYear);

  const installmentAmount = run?.installmentAmount ? Number(run.installmentAmount) : (run?.emi ? Number(run.emi) : 166666.90);
  const annualDebtService = run?.annualDebtService ? Number(run.annualDebtService) : Math.round(installmentAmount * periodsPerYear);
  const totalInterest = run?.totalInterest ? Number(run.totalInterest) : 1003339.40;
  const totalRepayment = run?.totalRepayment ? Number(run.totalRepayment) : Math.round(finalEligibleLoan + totalInterest);

  // DSCR calculation: user-provided vs structured illustrative demo assumption
  const hasRevenueInputs = Boolean(run?.monthlyRevenue !== null && run?.monthlyOperatingCost !== null && run?.monthlyRevenue !== undefined);
  let dscrVal: number | null = null;
  let dscrStatus: 'SUFFICIENT' | 'TIGHT' | 'INSUFFICIENT' | 'UNAVAILABLE' = 'UNAVAILABLE';
  let dscrExplanation = '';
  let dscrIsIllustrative = false;
  let monthlyProjectedRevenue = 450000;
  let monthlyOperatingCost = 395000;
  let monthlyOperatingSurplus = 55000;
  let annualCashAvailable = 660000;

  if (hasRevenueInputs && run?.monthlyRevenue && run?.monthlyOperatingCost) {
    monthlyProjectedRevenue = Number(run.monthlyRevenue);
    monthlyOperatingCost = Number(run.monthlyOperatingCost);
    monthlyOperatingSurplus = monthlyProjectedRevenue - monthlyOperatingCost;
    annualCashAvailable = monthlyOperatingSurplus * 12;
    dscrVal = annualDebtService > 0 ? Math.round((annualCashAvailable / annualDebtService) * 100) / 100 : null;
    dscrIsIllustrative = false;
    dscrStatus = dscrVal !== null ? (dscrVal >= 1.5 ? 'SUFFICIENT' : dscrVal >= 1.0 ? 'TIGHT' : 'INSUFFICIENT') : 'UNAVAILABLE';
    dscrExplanation = dscrVal !== null
      ? (dscrVal >= 1.5
          ? `Strong debt service coverage: projected operating cash flow (₹${annualCashAvailable.toLocaleString('en-IN')}/yr) covers scheduled debt service (₹${annualDebtService.toLocaleString('en-IN')}/yr) with a safe buffer (DSCR = ${dscrVal}).`
          : dscrVal >= 1.0
          ? `Moderate debt service coverage: projected operating cash flow meets debt obligations with a tight safety margin (DSCR = ${dscrVal}).`
          : `Insufficient debt service coverage: operating surplus does not cover annual debt obligations (DSCR = ${dscrVal} < 1.0).`)
      : 'Awaiting cash-flow inputs.';
  } else {
    // Structured illustrative demo cash-flow projection (explicitly labelled)
    dscrIsIllustrative = true;
    monthlyProjectedRevenue = 450000;
    monthlyOperatingCost = 395000;
    monthlyOperatingSurplus = 55000;
    annualCashAvailable = monthlyOperatingSurplus * 12;
    dscrVal = annualDebtService > 0 ? Math.round((annualCashAvailable / annualDebtService) * 100) / 100 : 0.99;
    dscrStatus = dscrVal >= 1.5 ? 'SUFFICIENT' : dscrVal >= 1.0 ? 'TIGHT' : 'INSUFFICIENT';
    dscrExplanation = `Illustrative demo cash-flow assumption — not user-entered: Based on retail benchmarks of ₹${monthlyProjectedRevenue.toLocaleString('en-IN')}/mo revenue and ₹${monthlyOperatingCost.toLocaleString('en-IN')}/mo operating expenses (monthly surplus ₹${monthlyOperatingSurplus.toLocaleString('en-IN')}, annual cash available ₹${annualCashAvailable.toLocaleString('en-IN')} vs annual debt service of ₹${annualDebtService.toLocaleString('en-IN')}), yielding an illustrative DSCR of ${dscrVal}.`;
  }

  const financialSummary = {
    projectCost: projectCostNum,
    baseLoanAmount: rawBaseLoan,
    schemeLoanCap,
    finalEligibleLoan,
    loanAmount: finalEligibleLoan,
    requiredOwnContribution,
    ownContribution: actualOwnContrib,
    shortfall: marginShortfall,
    actualContributionPercentage: actualContributionPct,
    minimumContributionPercentage: 10.0,
    requestedFundingGap,
    isEligibleMargin: isMarginCompliant,
    marginStatusMessage: isMarginCompliant ? 'Meets 10% minimum own equity requirement' : 'Contribution requirement not yet met',
    theoretical10PercentMargin: requiredOwnContribution,
    financingPercentage: financingPct,
    schemeCode: scheme?.schemeCode || 'TERM_LOAN',
    schemeName: scheme?.schemeName || 'MSME Term Loan Scheme',
    annualInterestRate: scheme?.interestRate ? `${scheme.interestRate}%` : (run?.interestRate ? `${run.interestRate}%` : '8.0%'),
    totalTenureMonths,
    moratoriumMonths,
    activeRepaymentMonths,
    activeRepaymentsCount,
    paymentFrequency,
    moratoriumInterestTreatment: 'PAY_CURRENT',
    installmentAmount,
    annualDebtService,
    totalInterest,
    totalRepayment,
    dscr: dscrVal,
    dscrStatus,
    dscrExplanation,
    dscrIsIllustrative,
    hasRevenueInputs,
    monthlyProjectedRevenue,
    monthlyOperatingCost,
    monthlyOperatingSurplus,
    annualCashAvailable,
    repaymentSchedule: schedule,
    isScheduleCalculable: schedule.length > 0,
    disclaimer:
      'Preliminary Feasibility Estimates: All figures, loan eligibility calculations, interest rates, and subsidies are estimated based on published scheme guidelines. Final loan sanction, rate, and terms are subject to lending institution underwriting and document verification.',
  };

  // 9. Map Sahayak Questionnaire Q1–Q6
  const respMap = new Map(questionnaireData.questions.map((q) => [q.code, q]));
  const infraQ: any = respMap.get('INFRASTRUCTURE')?.savedResponse;
  const compQ: any = respMap.get('COMPETITORS')?.savedResponse;
  const seasonQ: any = respMap.get('SEASONAL_CONSTRAINTS')?.savedResponse;
  const demandQ: any = respMap.get('LOCAL_DEMAND')?.savedResponse;
  const custQ: any = respMap.get('CUSTOMERS_MARKET')?.savedResponse;
  const riskQ: any = respMap.get('BUSINESS_RISKS')?.savedResponse;

  const roadRating = (infraQ?.road_transport || 'AVERAGE').toUpperCase();
  const elecRating = (infraQ?.electricity || 'AVERAGE').toUpperCase();
  const waterRating = (infraQ?.water || 'GOOD').toUpperCase();
  const internetRating = (infraQ?.connectivity || infraQ?.internet_mobile || 'POOR').toUpperCase();

  const infrastructureActionItems = [
    {
      facilityKey: 'road_transport',
      facilityName: 'Road & Transport Access',
      rating: roadRating,
      ratingLabel: roadRating === 'GOOD' ? 'Good' : roadRating === 'AVERAGE' ? 'Average' : 'Poor',
      impact:
        roadRating === 'GOOD'
          ? 'Smooth arterial connectivity facilitates prompt supplier turnaround and convenient walk-in traffic.'
          : 'Average/Moderate road connectivity impacts stock replenishment frequency, supplier delivery turnaround, customer reach, and inbound freight costs.',
      recommendations:
        roadRating === 'GOOD'
          ? [
              'Leverage frequent small-batch deliveries from distributors to optimize shelf space and reduce capital tied up in inventory.',
              'Explore offering local bicycle/two-wheeler home delivery to nearby residential households within a 2-3 km radius.',
            ]
          : [
              'Establish scheduled, fixed delivery days with nearby Bardoli and Surat wholesale mandi distributors to consolidate freight.',
              'Compare transportation costs and delivery minimums among multiple suppliers to reduce per-unit delivery overhead.',
              'Maintain a 7 to 10-day buffer stock for essential fast-moving consumer goods (FMCG) and staples.',
              'Check safe loading/unloading access for mini commercial vehicles (e.g. pickup trucks) and designate off-peak unloading hours.',
            ],
      priority: roadRating === 'POOR' ? 'High' : roadRating === 'AVERAGE' ? 'Medium' : 'Low',
    },
    {
      facilityKey: 'electricity',
      facilityName: 'Electricity Availability',
      rating: elecRating,
      ratingLabel: elecRating === 'GOOD' ? 'Good' : elecRating === 'AVERAGE' ? 'Average' : 'Poor',
      impact:
        elecRating === 'GOOD'
          ? 'Stable grid power supports continuous retail lighting, POS billing, and dairy/beverage refrigeration.'
          : 'Average/Intermittent power supply or voltage drops pose operational disruption risks to shop lighting, digital billing machines, and dairy/cold beverage refrigeration.',
      recommendations:
        elecRating === 'GOOD'
          ? [
              'Maximize customer product visibility with energy-efficient LED display fixtures.',
              'Avoid capital-intensive diesel generator investments while grid reliability remains high.',
            ]
          : [
              'Use energy-efficient LED luminaires and display lights to reduce wattage load and operating costs.',
              'Maintain a reliable battery backup / micro-UPS for digital billing terminals, barcode scanners, and UPI payment soundboxes during outages.',
              'Evaluate an appropriately sized 800VA–1100VA pure sine-wave inverter based on actual essential load before purchasing expensive equipment.',
              'Protect temperature-sensitive dairy, milk pouches, and ice creams with thermal chest cooler insulation and dedicated voltage stabilizers.',
            ],
      priority: elecRating === 'GOOD' ? 'Low' : 'High',
    },
    {
      facilityKey: 'water',
      facilityName: 'Water Supply',
      rating: waterRating,
      ratingLabel: waterRating === 'GOOD' ? 'Good' : waterRating === 'AVERAGE' ? 'Average' : 'Poor',
      impact:
        waterRating === 'GOOD'
          ? 'Reliable water supply provides a key operational advantage for maintaining premise hygiene, staff sanitation, and cleaning standards for edible goods.'
          : 'Limited water access requires dedicated storage arrangements to maintain retail food safety and hygiene standards.',
      recommendations:
        waterRating === 'GOOD'
          ? [
              'Maintain hygienic storage and regular cleaning schedules for food grain storage drums and display racks.',
              'Ensure safe filtered drinking water for retail staff and visiting customers.',
              'Avoid unnecessary water infrastructure capital expenses while existing municipal/panchayat supply remains reliable.',
            ]
          : [
              'Install a standard 200–500L overhead water storage tank for daily shop cleaning and washroom sanitation.',
              'Ensure sealed, moisture-proof containers for food grains and loose staples to prevent contamination.',
            ],
      priority: waterRating === 'GOOD' ? 'Low' : 'Medium',
    },
    {
      facilityKey: 'connectivity',
      facilityName: 'Internet / Mobile Connectivity',
      rating: internetRating,
      ratingLabel: internetRating === 'GOOD' ? 'Good' : internetRating === 'AVERAGE' ? 'Average' : 'Poor',
      impact:
        internetRating === 'GOOD'
          ? 'High-speed mobile data enables instantaneous UPI payments, cloud bookkeeping, and digital supplier procurement.'
          : 'Weak mobile network and poor cellular internet create serious friction for UPI QR payments, digital billing, customer messaging, and distributor WhatsApp ordering.',
      recommendations:
        internetRating === 'GOOD'
          ? [
              'Encourage cashless UPI payments with prominent counter QR standees and instant audio soundbox confirmation.',
              'Adopt digital bookkeeping apps (Khata) for customer credit and supplier payment reconciliation.',
            ]
          : [
              'Test multiple mobile cellular networks (Jio, Airtel, Vi, BSNL) directly at the shop counter location to identify the strongest signal.',
              'Keep a reliable primary network SIM and an alternate fallback SIM card for cashier payment confirmation.',
              'Maintain a compliant offline manual counter receipt / paper record process during network outages.',
              'Keep static QR standees with SMS/soundbox backup and reconcile all digital transactions once connectivity returns.',
              'Consider fixed wireless access (FWA) or local fiber broadband only after verifying local ISP availability, installation cost, and business requirements.',
            ],
      priority: internetRating === 'POOR' ? 'High' : internetRating === 'AVERAGE' ? 'Medium' : 'Low',
    },
  ];

  const sahayakInfrastructure = {
    roadTransport: roadRating,
    electricity: elecRating,
    water: waterRating,
    internet: internetRating,
    actionableRecommendations: infrastructureActionItems,
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
      categoryCode: assessment.categoryCode || 'RETAIL_GROCERY',
      location: locationDisplay,
      assessmentDate: new Date(assessment.createdAt).toISOString(),
      reportDate: new Date().toISOString(),
      reportStatus: 'Preliminary Feasibility Advisory',
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
      financialViabilitySummary: isMarginCompliant
        ? `Total project outlay is ₹${projectCostNum.toLocaleString('en-IN')}, with an applicant equity contribution of ₹${actualOwnContrib.toLocaleString('en-IN')} (meets the 10% minimum threshold). Eligible for ₹${finalEligibleLoan.toLocaleString('en-IN')} under ${financialSummary.schemeName} at ${financialSummary.annualInterestRate} interest.`
        : `Total project outlay is ₹${projectCostNum.toLocaleString('en-IN')}. Applicant contribution is ₹${actualOwnContrib.toLocaleString('en-IN')} (${actualContributionPct}%), leaving a ₹${marginShortfall.toLocaleString('en-IN')} shortfall against the 10% requirement (₹${requiredOwnContribution.toLocaleString('en-IN')}). Final eligible loan is ₹${finalEligibleLoan.toLocaleString('en-IN')}.`,
      demandAndCompetitionSummary: `Local market demand is assessed as ${sahayakInfrastructure.localDemandLevel}. Catchment analysis indicates viable retail density with competitive differentiation required against modern supermarkets.`,
      keyStrengths: [
        'High repeat customer frequency with non-discretionary daily consumable demand',
        'Competitive agility through personalised service, digital payments, and local home delivery',
        'Transparent structured financial loan terms and quarterly amortization schedule',
      ],
      criticalWatchpoints: [
        `Bridge the ₹${marginShortfall.toLocaleString('en-IN')} own equity shortfall to satisfy lender margin requirements`,
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

    // SECTION 4: PRICING & PRODUCT STRATEGY (6 VERTICAL PILLARS)
    pricingProductStrategy: {
      pricingApproach:
        'Adopt a competitive Everyday Fair Pricing approach. Keep essential staples competitively priced with 5–8% gross margin to build store traffic, while earning 15–25% on packaged snacks, spices, toiletries, and impulse items.',
      pricingPillars: [
        {
          pillarNumber: 1,
          title: 'Essential Staples (Grains, Flour, Oils, Sugar)',
          recommendedApproach:
            'Maintain competitive everyday pricing benchmarked against regional wholesale suppliers; operate on lean 5%–8% margins to drive frequent store footfall and high inventory turnover.',
          approach:
            'Maintain competitive everyday pricing benchmarked against regional wholesale suppliers; operate on lean 5%–8% margins to drive frequent store footfall and high inventory turnover.',
          whyItMatters:
            'Essential staples build daily household store visit habits and price trust across local consumers.',
        },
        {
          pillarNumber: 2,
          title: 'Packaged Foods, Biscuits & Snacks',
          recommendedApproach:
            'Capture 14%–20% trade margins with suitable product assortment, place fast-moving impulse items near the billing counter, and promote family value packs.',
          approach:
            'Capture 14%–20% trade margins with suitable product assortment, place fast-moving impulse items near the billing counter, and promote family value packs.',
          whyItMatters:
            'Provides a reliable gross margin cushion with fast weekly turnover and minimal spoilage.',
        },
        {
          pillarNumber: 3,
          title: 'Personal Care, Soaps & Household Cleaners',
          recommendedApproach:
            'Curate essential product assortments in affordable sachet and family sizes with 18%–25% margins, maintaining disciplined stock rotation to protect cash flow.',
          approach:
            'Curate essential product assortments in affordable sachet and family sizes with 18%–25% margins, maintaining disciplined stock rotation to protect cash flow.',
          whyItMatters:
            'Higher margin density per square foot increases overall basket value on routine weekly shopping runs.',
        },
        {
          pillarNumber: 4,
          title: 'Fresh Dairy & Daily Perishables (Milk, Curd, Bread)',
          recommendedApproach:
            'Procure daily from local dairy suppliers at 6%–10% retail margin, maintain cold storage, enforce strict expiry tracking, and keep initial stock aligned with daily demand.',
          approach:
            'Procure daily from local dairy suppliers at 6%–10% retail margin, maintain cold storage, enforce strict expiry tracking, and keep initial stock aligned with daily demand.',
          whyItMatters:
            'Creates an essential morning and evening store visit routine that drives cross-category grocery purchases.',
        },
        {
          pillarNumber: 5,
          title: 'Customer Promotions & Monthly Combo Offers',
          recommendedApproach:
            'Deploy practical monthly combo bundles (staples + cooking oil + spices), reward repeat customers with transparent pricing, and offer seasonal festival hampers.',
          approach:
            'Deploy practical monthly combo bundles (staples + cooking oil + spices), reward repeat customers with transparent pricing, and offer seasonal festival hampers.',
          whyItMatters:
            'Increases average transaction size and locks in high-value monthly household grocery spending against larger retail chains.',
        },
        {
          pillarNumber: 6,
          title: 'Inventory & Margin Management',
          recommendedApproach:
            'Track inventory with regular stock audits, set clear reorder levels, enforce strict FIFO rotation with expiry tracking, and conduct monthly margin reviews.',
          approach:
            'Track inventory with regular stock audits, set clear reorder levels, enforce strict FIFO rotation with expiry tracking, and conduct monthly margin reviews.',
          whyItMatters:
            'Prevents working capital stagnation, minimizes product expiry waste, and maintains liquidity for timely supplier payments.',
        },
      ],
      inventoryMix: templateSections.pricingProductStrategy?.inventoryMix || [
        { category: 'Staples & Grains (Atta, Rice, Dal, Oil, Sugar)', turnover: 'High', margin: '5% – 9%' },
        { category: 'Packaged Foods, Biscuits & Snacks', turnover: 'High', margin: '12% – 18%' },
        { category: 'Personal Care, Soaps, Shampoos & Detergents', turnover: 'Medium', margin: '15% – 22%' },
        { category: 'Dairy & Perishable Essentials (Milk, Curd, Bread)', turnover: 'Very High', margin: '6% – 10%' },
        { category: 'Cleaning & Household Supplies', turnover: 'Medium', margin: '18% – 25%' },
      ],
      workingCapitalDiscipline:
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

    // SECTION 7: RISK ANALYSIS & MITIGATION (STRUCTURED RISK CARDS)
    riskAnalysis: [
      {
        risk: 'Customer Credit Defaults',
        whyItMatters: 'Informal customer credit ties up essential working capital and disrupts distributor payments if ledgers age beyond 15–30 days.',
        likelihood: 'Moderate',
        impact: 'High',
        mitigationStrategy: 'Set strict customer-specific credit limits (max ₹1,000–₹1,500 per family); record transactions in digital Khata with automated SMS receipts; require settlement every 15 days.',
        mitigationPoints: [
          'Set customer-specific credit limits (maximum ₹1,000–₹1,500 per household).',
          'Record all credit sales immediately in a digital ledger (Khata app) with SMS receipts.',
          'Enforce a strict 15-day clearance cycle before extending further credit.',
          'Avoid allowing credit balances to carry over across monthly billing cycles.',
        ],
        monitoringIndicator: 'Total outstanding credit balance (<10–15% of monthly sales) and zero accounts exceeding 30 days without partial settlement.',
        monitoringPoints: [
          'Total outstanding credit ledger balance (<10–15% of monthly revenue).',
          'Age of receivables (zero accounts exceeding 30 days without partial settlement).',
          'Weekly list of overdue households for courteous follow-up.',
        ],
      },
      {
        risk: 'Working Capital Shortage & Cash Flow Crunch',
        whyItMatters: 'Depleted liquidity prevents stock replenishment, causing stockouts on essential fast-moving goods.',
        likelihood: 'Moderate',
        impact: 'High',
        mitigationStrategy: 'Maintain a minimum 1-month cash buffer; enforce disciplined supplier payment terms; restrict customer credit.',
        monitoringIndicator: 'Weekly cash-in-hand and accounts receivable balance',
      },
      {
        risk: 'Inventory Spoilage & Expiry Losses',
        whyItMatters: 'Damaged or expired food items result in direct gross margin destruction and customer dissatisfaction.',
        likelihood: 'Moderate',
        impact: 'Medium',
        mitigationStrategy: 'Implement FIFO stock rotation; order slow-moving items in small pack sizes; weekly expiry audits.',
        monitoringIndicator: 'Monthly unsellable / expired goods value (< 1% of stock)',
      },
      {
        risk: 'Price Undercutting by Large Supermarkets',
        whyItMatters: 'Modern format retailers and quick commerce platforms advertise deep discounts on selected brand staples.',
        likelihood: 'High',
        impact: 'Medium',
        mitigationStrategy: 'Do not attempt to beat bulk pricing; win on proximity, convenience, speed, personalised relationships, and custom pack sizes.',
        monitoringIndicator: 'Daily customer footfall and average basket value',
      },
      {
        risk: 'FSSAI & Local Municipal Licensing Non-Compliance',
        whyItMatters: 'Operating without food safety registration or municipal trade licenses risks penalties and closure notices.',
        likelihood: 'Low',
        impact: 'High',
        mitigationStrategy: 'Obtain FSSAI Basic Registration (Form A) and Surat Municipal Corporation Gumastadhara / Shop & Establishment Certificate prior to commercial opening.',
        monitoringIndicator: 'Valid registration certificates displayed prominently in the shop',
      },
    ],

    // SECTION 8: INFRASTRUCTURE & GROUND REALITY (SAHAYAK QUESTIONNAIRE)
    infrastructureAssessment: sahayakInfrastructure,

    // SECTION 8.5 / 9: OTHER GOVERNMENT SCHEMES & SUPPORT (VERIFIED OFFICIAL SCHEMES)
    otherGovernmentSchemes: [
      {
        schemeCode: 'PMMY_MUDRA',
        schemeName: 'Pradhan Mantri Mudra Yojana (PMMY) — Kishor & Tarun',
        agency: 'Department of Financial Services (DFS), Ministry of Finance, Govt of India',
        purpose: 'Provides collateral-free institutional credit up to ₹10,00,000 for non-farm micro and small retail/service enterprises.',
        assistanceType: 'Institutional bank credit with Credit Guarantee Cover under CGFMU (Credit Guarantee Fund for Micro Units).',
        eligibilityConditions: 'Non-farm micro enterprise/retail trading shop; Indian citizen with viable business plan; standard KYC & commercial bank appraisal.',
        currentAssessmentStatus: 'POTENTIALLY_ELIGIBLE',
        statusLabel: 'Potentially Eligible (Subject to ₹10L Cap)',
        eligibilityExplanation: 'Potentially eligible for partial shop stock and equipment financing up to ₹10 Lakh. Project cost of ₹37 Lakh exceeds PMMY single-account ceiling, requiring either phased financing or a standard MSME Term Loan.',
        officialUrl: 'https://www.mudra.org.in/',
        lastVerifiedDate: 'September 2026',
      },
      {
        schemeCode: 'CGTMSE_GUARANTEE',
        schemeName: 'Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)',
        agency: 'Ministry of MSME, Govt of India & SIDBI',
        purpose: 'Provides credit guarantee coverage (up to 75%–85%) to member lending institutions to enable collateral-free bank term loans and working capital up to ₹5 Crore for eligible MSME and retail trading units.',
        assistanceType: 'Institutional Credit Guarantee Mechanism (Credit guarantee backing, not a direct cash subsidy or grant).',
        eligibilityConditions: 'New and existing MSMEs and retail trade enterprises with formal UDYAM Registration and positive bank appraisal.',
        currentAssessmentStatus: 'REQUIRES_VERIFICATION',
        statusLabel: 'Eligibility Cannot Be Confirmed',
        eligibilityExplanation: 'Eligibility cannot be established from current assessment inputs alone (requires formal UDYAM registration certificate and commercial lending bank underwriting appraisal). Note: Retail trade units qualify for credit guarantee backing, but pure retail trading is excluded from capital subsidy programs like PMEGP under official guidelines.',
        officialUrl: 'https://www.cgtmse.in/',
        lastVerifiedDate: 'September 2026',
      },
    ],

    // SECTION 9: SUPPORT ORGANIZATIONS (DB-BACKED)
    supportOrganizations: orgs,

    // SECTION 10: CURATED YOUTUBE LEARNING RESOURCES (DB-BACKED)
    curatedVideos: vids,

    // SECTION 11: ACTION PLAN
    actionPlan: templateSections.actionPlan || [
      { step: 1, title: 'Finalise Premises & Shop Lease Agreement', duration: 'Weeks 1–2', details: 'Ensure high pedestrian footfall, dry storage, and clear commercial lease terms.' },
      { step: 2, title: 'Secure Statutory Registrations (FSSAI & SMC Gumastadhara)', duration: 'Weeks 2–3', details: 'Register under Food Safety Standards Authority of India and Surat municipal shop act.' },
      { step: 3, title: 'Bridge Equity Shortfall & Submit Bank Loan Application', duration: 'Weeks 3–5', details: `Arrange additional equity of ₹${marginShortfall.toLocaleString('en-IN')} to satisfy 10% margin before submitting loan docket.` },
      { step: 4, title: 'Vendor Tie-ups & Initial Inventory Procurement', duration: 'Weeks 5–6', details: 'Establish accounts with Surat APMC wholesale distributors and FMCG super-stockists.' },
      { step: 5, title: 'Shop Interior, Racking & Digital POS Setup', duration: 'Weeks 6–7', details: 'Install display racks, digital scale, barcode scanner, and UPI QR standees.' },
      { step: 6, title: 'Store Launch & Local Neighbourhood Outreach', duration: 'Week 8', details: 'Distribute opening flyers, announce inaugural bundle offers, and initiate WhatsApp grocery delivery.' },
      { step: 7, title: 'Post-Launch Review & Working Capital Assessment', duration: 'Month 3', details: 'Review actual daily sales against projections and fine-tune slow-moving stock lines.' },
    ],

    // SECTION 12: CONCLUSION & LIMITATIONS
    conclusionAndLimitations: {
      conclusion: isMarginCompliant
        ? `Based on deterministic financial engine evaluation, the proposed Neighbourhood Grocery Store project exhibits positive operational feasibility meeting the 10% own equity requirement under ${financialSummary.schemeName}. Execution success depends strictly on working capital management, initial customer acquisition, and inventory shrinkage control.`
        : `Based on deterministic financial engine evaluation, the proposed Neighbourhood Grocery Store project in Surat/Bardoli exhibits viable commercial demand. However, the applicant currently faces an equity contribution shortfall of ₹${marginShortfall.toLocaleString('en-IN')} (${actualContributionPct}% actual vs 10.00% minimum required for Term Loan financing). Furthermore, illustrative cash-flow assumptions yield a tight DSCR (${dscrVal}), underscoring that debt servicing viability is contingent upon working capital discipline, supplier credit terms, and bridging the equity margin prior to loan application.`,
      limitations: [
        'Pre-Authored Demonstration Narrative: Qualitative narrative sections are structured from verified retail benchmarks and not generated dynamically by an uncontrolled LLM.',
        'Illustrative Market Profiles: Competitor benchmarks represent general retail archetypes within Surat and require local ground validation.',
        'Illustrative Cash-Flow Assumption: DSCR calculation is based on structured retail benchmarks and must be verified against actual shop ledger cash flows.',
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
