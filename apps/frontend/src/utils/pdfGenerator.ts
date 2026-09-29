import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { FeasibilityReportData } from '../api/questionnaire';
import { formatLabel, formatTagsList } from './formatters';
import { resolvePricingPillars } from './pricingPillars';
import { calculateFundingBreakdown, formatIndianCurrency } from './financeCalculator';

export function generateFeasibilityReportPdf(report: FeasibilityReportData, lang: 'en' | 'hi' | 'gu' = 'en'): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  // Colors
  const primaryNavy = [11, 19, 43]; // #0b132b
  const accentTeal = [6, 214, 160]; // #06d6a0
  const headerBlue = [28, 37, 65]; // #1c2541
  const textDark = [30, 41, 59]; // #1e293b
  const textMuted = [100, 116, 139]; // #64748b
  const bgLight = [248, 250, 252]; // #f8fafc

  const formatCurrency = (val: number | null | undefined): string => {
    return formatIndianCurrency(val);
  };

  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - 18) {
      doc.addPage();
      cursorY = margin;
      return true;
    }
    return false;
  };

  const renderSectionHeader = (number: number | string, title: string) => {
    checkPageBreak(16);
    doc.setFillColor(headerBlue[0], headerBlue[1], headerBlue[2]);
    doc.roundedRect(margin, cursorY, contentWidth, 8, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`SECTION ${number}: ${title.toUpperCase()}`, margin + 4, cursorY + 5.5);
    cursorY += 12;
  };

  // ==========================================
  // COVER / DOCUMENT HEADER - NO TECHNICAL ASSESSMENT ID
  // ==========================================
  doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.rect(0, 0, pageWidth, 42, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(accentTeal[0], accentTeal[1], accentTeal[2]);
  doc.text('UDAAN — EVIDENCE BEFORE BORROWING', margin, 13);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('BUSINESS FEASIBILITY & ADVISORY INTELLIGENCE REPORT', margin, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(
    `Business Category: ${formatLabel(report.metadata.businessCategory, lang)}  |  Location: ${report.metadata.location}`,
    margin,
    27
  );

  const assessmentDateStr = new Date(report.metadata.assessmentDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const generatedDateStr = report.metadata.reportGeneratedDate
    ? new Date(report.metadata.reportGeneratedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  doc.text(
    `Assessment Date: ${assessmentDateStr}  |  Report Date: ${generatedDateStr}  |  Status: ${report.metadata.reportStatus || 'Preliminary Feasibility Advisory'}`,
    margin,
    33
  );

  cursorY = 46;

  // Advisory Greeting Box
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.roundedRect(margin, cursorY, contentWidth, 14, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, cursorY, contentWidth, 14, 2, 2, 'S');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  const greetingLines = doc.splitTextToSize(report.metadata.aiAdvisorGreeting, contentWidth - 8);
  doc.text(greetingLines, margin + 4, cursorY + 5.5);
  cursorY += 18;

  // ==========================================
  // SECTION 1: EXECUTIVE SUMMARY
  // ==========================================
  renderSectionHeader(1, 'Executive Summary');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);

  const execSummary = report.executiveSummary;
  const execLines = doc.splitTextToSize(execSummary.businessSummary, contentWidth);
  doc.text(execLines, margin, cursorY);
  cursorY += execLines.length * 4 + 4;

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: { fillColor: headerBlue as any, textColor: 255, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: textDark as any },
    head: [['Parameter', 'Assessment Viability Summary']],
    body: [
      ['Proposed Business', execSummary.businessName],
      ['Location Context', execSummary.location],
      ['Target Customers', formatTagsList(execSummary.targetCustomerSegment, lang)],
      ['Financial Viability', execSummary.financialViabilitySummary],
      ['Market & Competition', execSummary.demandAndCompetitionSummary],
    ],
  });
  cursorY = (doc as any).lastAutoTable.finalY + 6;

  // ==========================================
  // SECTION 2: MARKET ANALYSIS
  // ==========================================
  renderSectionHeader(2, 'Business Idea & Local Market Analysis');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Business Description:', margin, cursorY);
  cursorY += 4;

  doc.setFont('helvetica', 'normal');
  const mktDesc = doc.splitTextToSize(report.marketAnalysis.businessDescription, contentWidth);
  doc.text(mktDesc, margin, cursorY);
  cursorY += mktDesc.length * 4 + 4;

  const targetList = report.marketAnalysis.targetCustomerSegments.map((s, idx) => [`${idx + 1}. ${formatLabel(s, lang)}`]);
  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'plain',
    bodyStyles: { fontSize: 7.5, textColor: textDark as any },
    head: [['Core Target Customer Groups:']],
    headStyles: { fontStyle: 'bold', fontSize: 8, textColor: headerBlue as any },
    body: targetList,
  });
  cursorY = (doc as any).lastAutoTable.finalY + 6;

  // ==========================================
  // SECTION 3: COMPETITION ANALYSIS
  // ==========================================
  renderSectionHeader(3, 'Local Competition Analysis (5–10 km Radius)');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  const compNote = doc.splitTextToSize(report.competitionAnalysis.methodologyNote, contentWidth);
  doc.text(compNote, margin, cursorY);
  cursorY += compNote.length * 3.5 + 4;

  const compBody = report.competitionAnalysis.competitorProfiles.map((c) => [
    c.name,
    formatLabel(c.type, lang),
    c.distance,
    c.competitiveOffering,
    c.differentiationStrategy,
  ]);

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'striped',
    headStyles: { fillColor: headerBlue as any, textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: textDark as any },
    head: [['Competitor Profile', 'Type', 'Distance', 'Competitive Offering', 'Differentiation Strategy']],
    body: compBody,
  });
  cursorY = (doc as any).lastAutoTable.finalY + 8;

  // ==========================================
  // SECTION 4: PRICING & PRODUCT STRATEGY (6 PILLARS)
  // ==========================================
  renderSectionHeader(4, 'Pricing & Product Strategy');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  const priceApp = doc.splitTextToSize(report.pricingProductStrategy.pricingApproach, contentWidth);
  doc.text(priceApp, margin, cursorY);
  cursorY += priceApp.length * 4 + 4;

  const pillars = resolvePricingPillars(report.pricingProductStrategy.pricingPillars, lang);

  const tableHeaders =
    lang === 'hi'
      ? [['स्तंभ (श्रेणी)', 'अनुशंसित दृष्टिकोण', 'व्यावसायिक महत्व']]
      : lang === 'gu'
      ? [['સ્તંભ (શ્રેણી)', 'ભલામણ કરેલ અભિગમ', 'વ્યવસાયિક મહત્વ']]
      : [['Strategic Category Pillar', 'Recommended Strategic Approach', 'Why It Matters']];

  const pillarBody: string[][] = pillars.map((p) => [
    p.title || '',
    p.recommendedApproach || p.approach || '',
    p.whyItMatters || '',
  ]);
  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: { fillColor: headerBlue as any, textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7, textColor: textDark as any },
    head: tableHeaders as any,
    body: pillarBody as any,
  });
  cursorY = (doc as any).lastAutoTable.finalY + 6;

  const invBody = report.pricingProductStrategy.inventoryMix.map((i) => [formatLabel(i.category, lang), i.turnover, i.margin]);
  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: { fillColor: headerBlue as any, textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: textDark as any },
    head: [['Product Category', 'Turnover Velocity', 'Target Margin Range']],
    body: invBody,
  });
  cursorY = (doc as any).lastAutoTable.finalY + 8;

  // ==========================================
  // SECTION 5: FINANCIAL FEASIBILITY & DETERMINISTIC ENGINE
  // ==========================================
  renderSectionHeader(5, 'Financial Feasibility & Scheme Structure');
  const fin = report.financialFeasibility;
  const projectCost = fin.projectCost || 3500000;
  const ownContribution = fin.ownContribution || 300000;
  const funding = calculateFundingBreakdown(projectCost, ownContribution);

  // --- Visual 1 & 2: Funding Composition Stacked Bar & Margin Visual ---
  checkPageBreak(32);
  
  // Card background
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.roundedRect(margin, cursorY, contentWidth, 26, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, cursorY, contentWidth, 26, 2, 2, 'S');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(headerBlue[0], headerBlue[1], headerBlue[2]);
  doc.text('Financing Composition (Configured Demo Baseline: 90% Loan / 10% Own Contribution)', margin + 4, cursorY + 5);

  // Stacked Bar
  const barY = cursorY + 8;
  const barHeight = 6;
  const barWidth = contentWidth - 8;
  const barX = margin + 4;

  // Background bar
  doc.setFillColor(226, 232, 240);
  doc.roundedRect(barX, barY, barWidth, barHeight, 1.5, 1.5, 'F');

  const ownWidth = Math.max(2, (funding.actualContributionPercentage / 100) * barWidth);
  const loanPct = (funding.eligibleLoanAmount / funding.totalProjectCost) * 100;
  const loanWidth = Math.max(2, (loanPct / 100) * barWidth);

  // Own contribution segment (Teal)
  doc.setFillColor(accentTeal[0], accentTeal[1], accentTeal[2]);
  doc.roundedRect(barX, barY, ownWidth, barHeight, 1.5, 1.5, 'F');

  // Eligible Loan segment (Navy)
  doc.setFillColor(headerBlue[0], headerBlue[1], headerBlue[2]);
  doc.rect(barX + ownWidth, barY, Math.min(barWidth - ownWidth, loanWidth), barHeight, 'F');

  // Shortfall segment if any (Amber)
  if (funding.contributionShortfall > 0) {
    const shortfallWidth = Math.max(0, barWidth - ownWidth - loanWidth);
    if (shortfallWidth > 0) {
      doc.setFillColor(245, 158, 11);
      doc.rect(barX + ownWidth + loanWidth, barY, shortfallWidth, barHeight, 'F');
    }
  }

  // Legend & Metrics beneath bar
  doc.setFontSize(6.8);
  doc.setFont('helvetica', 'bold');
  
  // Own Contribution label
  doc.setTextColor(6, 120, 90);
  doc.text(`● Own Contribution: ${formatCurrency(funding.ownContribution)} (${funding.actualContributionPercentage}%)`, barX, barY + 11);

  // Bank Loan label
  doc.setTextColor(headerBlue[0], headerBlue[1], headerBlue[2]);
  doc.text(`● Eligible Bank Loan: ${formatCurrency(funding.eligibleLoanAmount)} (${loanPct.toFixed(1)}%)`, barX + (barWidth * 0.40), barY + 11);

  // Status Badge / Text
  if (funding.meetsMinimumRequirement) {
    doc.setTextColor(6, 120, 90);
    doc.text(`✓ Minimum 10% Requirement Met (Excess: ${formatCurrency(funding.excessContribution)})`, barX, barY + 15);
  } else {
    doc.setTextColor(180, 83, 9);
    doc.text(`⚠ Minimum 10% Margin Not Met — Funding Gap / Shortfall: ${formatCurrency(funding.contributionShortfall)}`, barX, barY + 15);
  }

  cursorY += 30;

  // Parameters Table
  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: { fillColor: headerBlue as any, textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7.2, textColor: textDark as any },
    head: [['Financial Feasibility Parameter', 'Value', 'Scheme Specification', 'Detail']],
    body: [
      ['Total Project Cost', formatCurrency(funding.totalProjectCost), 'Selected Financing Scheme', fin.schemeName || 'Term Loan Scheme'],
      ['Maximum Eligible Bank Loan (90%)', formatCurrency(funding.maximumEligibleLoan), 'Scheme Loan Cap', formatCurrency(fin.schemeLoanCap || 4500000)],
      ['Actual Loan Requirement', formatCurrency(funding.actualLoanRequirement), 'Annual Interest Rate', `${fin.annualInterestRate || '8.0%'} (Fixed)`],
      ['Final Eligible Bank Loan', formatCurrency(funding.eligibleLoanAmount), 'Repayment Frequency', fin.repaymentFrequency || 'Quarterly'],
      ['Required 10% Minimum Margin', formatCurrency(funding.requiredContribution), 'Tenure & Moratorium', `${fin.totalTenureMonths || 84} Mo Total (${fin.moratoriumMonths || 6} Mo Moratorium)`],
      ['Applicant Own Contribution', `${formatCurrency(funding.ownContribution)} (${funding.actualContributionPercentage}%)`, 'Active Repayment Installments', `${fin.activeRepaymentsCount || 26} Periods (${fin.activeRepaymentPeriodMonths || 78} Mo)`],
      [
        'Margin Requirement Status',
        funding.meetsMinimumRequirement
          ? `Compliant (10%+ Satisfied)`
          : `Requirement Not Met (Shortfall: ${formatCurrency(funding.contributionShortfall)})`,
        'Quarterly Installment (Q3–Q28)',
        formatCurrency(Number(fin.installmentAmount) || 166667),
      ],
    ],
  });
  cursorY = (doc as any).lastAutoTable.finalY + 6;

  // DSCR capacity breakdown
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(headerBlue[0], headerBlue[1], headerBlue[2]);
  doc.text('Debt Service Coverage Ratio (DSCR) & Cash Flow Capacity:', margin, cursorY);
  cursorY += 4.5;

  if (fin.demoCashFlow) {
    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: { fillColor: headerBlue as any, textColor: 255, fontSize: 7.5 },
      bodyStyles: { fontSize: 7, textColor: textDark as any },
      head: [['Benchmark Metric', 'Illustrative Demo Value', 'Annual Impact', 'Calculated DSCR']],
      body: [
        [
          `Monthly Revenue: ${formatCurrency(fin.demoCashFlow.monthlyRevenue)}\nMonthly Cost: ${formatCurrency(fin.demoCashFlow.monthlyOperatingCost)}`,
          `Monthly Surplus: ${formatCurrency(fin.demoCashFlow.monthlyOperatingSurplus)}`,
          `Annual Cash Available: ${formatCurrency(fin.demoCashFlow.annualCashAvailable)}\nAnnual Debt Service: ${formatCurrency(fin.demoCashFlow.annualDebtService)}`,
          `${fin.dscr !== null ? `${fin.dscr}x (${fin.dscrStatus})` : 'DSCR unavailable — cash-flow inputs required'}`,
        ],
      ],
    });
    cursorY = (doc as any).lastAutoTable.finalY + 4;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  const dscrExp = doc.splitTextToSize(`Advisory Explanation: ${fin.dscrExplanation}`, contentWidth);
  doc.text(dscrExp, margin, cursorY);
  cursorY += dscrExp.length * 3.5 + 4;

  // Full Amortization Schedule Table
  if (fin.repaymentSchedule && fin.repaymentSchedule.length > 0) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(headerBlue[0], headerBlue[1], headerBlue[2]);
    doc.text(`Amortization Schedule (${fin.repaymentSchedule.length} Periods: ${fin.moratoriumMonths ? Math.round(fin.moratoriumMonths / 3) : 2} Moratorium + ${fin.activeRepaymentsCount || 26} Active Repayment):`, margin, cursorY);
    cursorY += 4.5;

    const schedBody = fin.repaymentSchedule.map((item: any) => {
      const isMoratorium = item.isMoratorium;
      return [
        `Q${item.sequenceNumber}`,
        isMoratorium ? 'Moratorium' : 'Active Repayment',
        formatCurrency(item.openingPrincipal),
        formatCurrency(item.principalPayment),
        formatCurrency(item.interestPayment),
        formatCurrency(item.installmentAmount),
        formatCurrency(item.closingPrincipal),
      ];
    });

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      theme: 'striped',
      headStyles: { fillColor: headerBlue as any, textColor: 255, fontSize: 7 },
      bodyStyles: { fontSize: 6.5, textColor: textDark as any },
      head: [['Quarter', 'Stage', 'Opening Principal', 'Principal Repaid', 'Interest', 'Installment', 'Closing Balance']],
      body: schedBody,
    });
    cursorY = (doc as any).lastAutoTable.finalY + 6;
  }

  // Disclaimer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  const finDisc = doc.splitTextToSize(fin.disclaimer, contentWidth);
  doc.text(finDisc, margin, cursorY);
  cursorY += finDisc.length * 3.5 + 6;

  // ==========================================
  // SECTION 6: SWOT ANALYSIS
  // ==========================================
  renderSectionHeader(6, 'SWOT Analysis');
  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: { fillColor: headerBlue as any, textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7, textColor: textDark as any },
    head: [['Strengths (Internal)', 'Weaknesses (Internal)']],
    body: [
      [
        report.swotAnalysis.strengths.map((s) => `• ${formatLabel(s, lang)}`).join('\n\n'),
        report.swotAnalysis.weaknesses.map((w) => `• ${formatLabel(w, lang)}`).join('\n\n'),
      ],
    ],
  });
  cursorY = (doc as any).lastAutoTable.finalY + 2;

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: { fillColor: headerBlue as any, textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7, textColor: textDark as any },
    head: [['Opportunities (External)', 'Threats (External)']],
    body: [
      [
        report.swotAnalysis.opportunities.map((o) => `• ${formatLabel(o, lang)}`).join('\n\n'),
        report.swotAnalysis.threats.map((t) => `• ${formatLabel(t, lang)}`).join('\n\n'),
      ],
    ],
  });
  cursorY = (doc as any).lastAutoTable.finalY + 8;

  // ==========================================
  // SECTION 7: RISK ANALYSIS & MITIGATION
  // ==========================================
  renderSectionHeader(7, 'Risk Analysis & Mitigation Framework');

  // Customer Credit Defaults Highlight Box
  checkPageBreak(25);
  doc.setFillColor(255, 247, 237); // orange light
  doc.roundedRect(margin, cursorY, contentWidth, 24, 1.5, 1.5, 'F');
  doc.setDrawColor(253, 186, 116);
  doc.roundedRect(margin, cursorY, contentWidth, 24, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(194, 65, 12);
  doc.text('CRITICAL OPERATIONAL RISK: CUSTOMER CREDIT DEFAULTS (Likelihood: Moderate | Impact: High)', margin + 3, cursorY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  const credWhy = doc.splitTextToSize(
    'Why it matters: Uncontrolled credit books lock up retail working capital, drain cash buffers, and jeopardize debt service.',
    contentWidth - 6
  );
  doc.text(credWhy, margin + 3, cursorY + 8.5);

  const credMit = doc.splitTextToSize(
    'Mitigation & Control: Set household limits (Rs. 500-1,500), enforce 15-day settlement cycles, record transactions digitally, monitor overdue receivables weekly.',
    contentWidth - 6
  );
  doc.text(credMit, margin + 3, cursorY + 16);
  cursorY += 28;

  const riskBody = report.riskAnalysis.map((r) => [
    formatLabel(r.risk, lang),
    r.likelihood,
    r.impact,
    r.mitigationStrategy,
    r.monitoringIndicator,
  ]);

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'striped',
    headStyles: { fillColor: headerBlue as any, textColor: 255, fontSize: 7.5 },
    bodyStyles: { fontSize: 7, textColor: textDark as any },
    head: [['Risk Factor', 'Likelihood', 'Impact', 'Mitigation Strategy', 'Monitoring Indicator']],
    body: riskBody,
  });
  cursorY = (doc as any).lastAutoTable.finalY + 8;

  // ==========================================
  // SECTION 8: INFRASTRUCTURE & GROUND REALITY (SAHAYAK)
  // ==========================================
  renderSectionHeader(8, 'Infrastructure & Ground Reality Assessment');
  const infra = report.infrastructureAssessment;
  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: { fillColor: headerBlue as any, textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: textDark as any },
    head: [['Parameter', 'User Ground Reality Response']],
    body: [
      ['Road & Transport Access', formatLabel(infra.roadTransport, lang)],
      ['Electricity Availability', formatLabel(infra.electricity, lang)],
      ['Water Availability', formatLabel(infra.water, lang)],
      ['Internet & Mobile Connectivity', formatLabel(infra.internet, lang)],
      ['Nearby Competitors (Reported)', infra.userReportedCompetitors],
      ['Seasonal Constraints', `${formatTagsList(infra.seasonalConstraints, lang)} ${infra.seasonalExplanation ? `— ${infra.seasonalExplanation}` : ''}`],
      ['Demand Assessment', `${formatLabel(infra.localDemandLevel, lang)} (${infra.demandReason})`],
      ['Target Customers & Channels', `${formatTagsList(infra.targetCustomers, lang)} | Channels: ${infra.salesChannels}`],
      ['Key Challenges & Support', `${formatTagsList(infra.businessChallenges, lang)} | Needed: ${infra.supportRequired}`],
    ],
  });
  cursorY = (doc as any).lastAutoTable.finalY + 6;

  // Subsection 8B: Actionable Infrastructure Recommendations
  if (infra.actionableRecommendations && infra.actionableRecommendations.length > 0) {
    checkPageBreak(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(headerBlue[0], headerBlue[1], headerBlue[2]);
    doc.text('Infrastructure Findings & Recommended Actions:', margin, cursorY);
    cursorY += 4;

    const actionBody = infra.actionableRecommendations.map((item: any) => [
      item.facilityName,
      item.ratingLabel,
      item.impact,
      item.recommendations.map((r: string) => `• ${r}`).join('\n'),
      item.priority,
    ]);

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: { fillColor: headerBlue as any, textColor: 255, fontSize: 7 },
      bodyStyles: { fontSize: 6.5, textColor: textDark as any },
      head: [['Facility', 'Rating', 'Operational Impact', 'Recommended Actions', 'Priority']],
      body: actionBody,
    });
    cursorY = (doc as any).lastAutoTable.finalY + 8;
  }

  // ==========================================
  // SECTION: OTHER GOVERNMENT SCHEMES & SUPPORT
  // ==========================================
  renderSectionHeader('8B', 'Other Government Schemes & Support Mechanisms');
  const govSchemes = report.otherGovernmentSchemes || [
    {
      schemeName: 'Pradhan Mantri Mudra Yojana (PMMY) – Kishor / Tarun',
      department: 'Department of Financial Services, Ministry of Finance, Government of India',
      purpose: 'Collateral-free micro-credit for micro/small trade & retail up to Rs. 10 Lakhs.',
      assistanceType: 'Refinance & collateral-free micro credit through Member Lending Institutions (MLIs)',
      eligibilityConditions: 'Non-farm, non-corporate micro enterprises with valid KYC and bank proposal.',
      assessmentStatus: 'Potentially eligible for micro-retail credit within Rs. 10 Lakhs ceiling.',
      why: 'Micro-retail enterprise in Gujarat qualifies for working capital/equipment credit under PMMY.',
      officialUrl: 'https://www.mudra.org.in',
      lastVerified: 'September 2026',
    },
    {
      schemeName: 'Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)',
      department: 'Ministry of MSME, Government of India & SIDBI',
      purpose: 'Provides collateral-free institutional credit guarantee coverage up to Rs. 500 Lakhs.',
      assistanceType: 'Credit guarantee cover (75% to 85% coverage) to lending institutions.',
      eligibilityConditions: 'Micro and Small Enterprises with valid MSME Udyam registration.',
      assessmentStatus: 'Potentially eligible for MLI credit guarantee coverage.',
      why: 'Retail trade enterprises with Udyam registration qualify for CGTMSE cover from participating banks.',
      officialUrl: 'https://www.cgtmse.in',
      lastVerified: 'September 2026',
    },
  ];

  const govBody: string[][] = govSchemes.map((g: any) => [
    g.schemeName || '',
    g.department || g.agency || '',
    `${g.purpose || ''}\n\nAssistance: ${g.assistanceType || ''}`,
    `${g.assessmentStatus || g.statusLabel || ''}\n\n${g.why || g.eligibilityExplanation || ''}\n\nPortal: ${g.officialUrl || ''} (Verified ${g.lastVerified || g.lastVerifiedDate || 'September 2026'})`,
  ]);

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: { fillColor: headerBlue as any, textColor: 255, fontSize: 7.5 },
    bodyStyles: { fontSize: 6.8, textColor: textDark as any },
    head: [['Scheme Name', 'Government Agency', 'Purpose & Assistance Type', 'Advisory Assessment & Source']],
    body: govBody as any,
  });
  cursorY = (doc as any).lastAutoTable.finalY + 8;

  // ==========================================
  // SECTION 9: SUPPORT ORGANIZATIONS
  // ==========================================
  renderSectionHeader(9, 'Local Support Organization Recommendations (Surat)');
  const orgBody = report.supportOrganizations.map((o) => [
    o.name,
    formatLabel(o.category, lang),
    `${o.address}\nPhone: ${o.phone || 'N/A'}\nEmail: ${o.email || 'N/A'}\nWeb: ${o.website || 'N/A'}`,
    o.explanation,
  ]);

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'striped',
    headStyles: { fillColor: headerBlue as any, textColor: 255, fontSize: 7.5 },
    bodyStyles: { fontSize: 7, textColor: textDark as any },
    head: [['Organization Name', 'Category', 'Contact Details & Address', 'Advisory Guidance']],
    body: orgBody,
  });
  cursorY = (doc as any).lastAutoTable.finalY + 3;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    'Disclaimer: Please independently verify current contact details, eligibility, services, and availability before visiting or sharing personal documents.',
    margin,
    cursorY
  );
  cursorY += 8;

  // ==========================================
  // SECTION 10: CURATED YOUTUBE RESOURCES
  // ==========================================
  renderSectionHeader(10, 'Curated Learning Resources');
  const vidBody = report.curatedVideos.map((v) => [
    v.title,
    v.language,
    formatLabel(v.category, lang),
    v.url,
  ]);

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: { fillColor: headerBlue as any, textColor: 255, fontSize: 7.5 },
    bodyStyles: { fontSize: 7, textColor: textDark as any },
    head: [['Resource Title', 'Language', 'Focus Category', 'YouTube Link']],
    body: vidBody,
  });
  cursorY = (doc as any).lastAutoTable.finalY + 8;

  // ==========================================
  // SECTION 11: ACTION PLAN
  // ==========================================
  renderSectionHeader(11, 'Implementation Action Plan');
  const planBody = report.actionPlan.map((p) => [
    `Step ${p.step}`,
    p.title,
    p.duration,
    p.details,
  ]);

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'striped',
    headStyles: { fillColor: headerBlue as any, textColor: 255, fontSize: 7.5 },
    bodyStyles: { fontSize: 7, textColor: textDark as any },
    head: [['Stage', 'Milestone Title', 'Duration', 'Action Details']],
    body: planBody,
  });
  cursorY = (doc as any).lastAutoTable.finalY + 8;

  // ==========================================
  // SECTION 12: CONCLUSION & LIMITATIONS
  // ==========================================
  renderSectionHeader(12, 'Conclusion & Advisory Disclaimers');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  const concLines = doc.splitTextToSize(report.conclusionAndLimitations.conclusion, contentWidth);
  doc.text(concLines, margin, cursorY);
  cursorY += concLines.length * 4 + 4;

  const limList = report.conclusionAndLimitations.limitations.map((l, idx) => [`${idx + 1}. ${l}`]);
  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'plain',
    head: [['Methodology Limitations & Declarations:']],
    headStyles: { fontStyle: 'bold', fontSize: 7.5, textColor: headerBlue as any },
    bodyStyles: { fontSize: 6.8, textColor: textMuted as any },
    body: limList,
  });

  // ==========================================
  // FOOTER WITH PAGE NUMBERS ON ALL PAGES
  // ==========================================
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);
    doc.text(
      `UDAAN Rural Business Feasibility Platform — Confidential Advisory Document`,
      margin,
      pageHeight - 6
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin - 18,
      pageHeight - 6
    );
  }

  // Save / Download PDF with clean user-facing name
  const filename = `UDAAN_Business_Feasibility_Report.pdf`;
  doc.save(filename);
}

