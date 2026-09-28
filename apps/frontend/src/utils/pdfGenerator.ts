import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { FeasibilityReportData } from '../api/questionnaire';

export function generateFeasibilityReportPdf(report: FeasibilityReportData): void {
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
    if (val === null || val === undefined || isNaN(Number(val))) return 'Not Available';
    return `Rs. ${Number(val).toLocaleString('en-IN')}`;
  };

  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - 18) {
      doc.addPage();
      cursorY = margin;
      return true;
    }
    return false;
  };

  const renderSectionHeader = (number: number, title: string) => {
    checkPageBreak(16);
    doc.setFillColor(headerBlue[0], headerBlue[1], headerBlue[2]);
    doc.roundedRect(margin, cursorY, contentWidth, 8, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`SECTION ${number}: ${title.toUpperCase()}`, margin + 4, cursorY + 5.5);
    cursorY += 12;
  };

  // ==========================================
  // COVER / DOCUMENT HEADER
  // ==========================================
  doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.rect(0, 0, pageWidth, 42, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(accentTeal[0], accentTeal[1], accentTeal[2]);
  doc.text('UDAAN — EVIDENCE BEFORE BORROWING', margin, 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text('BUSINESS FEASIBILITY & ADVISORY INTELLIGENCE REPORT', margin, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(
    `Assessment ID: ${report.assessmentId}  |  Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}  |  Category: ${report.metadata.businessCategory}`,
    margin,
    29
  );
  doc.text(
    `Proposed Location: ${report.metadata.location}`,
    margin,
    35
  );

  cursorY = 48;

  // AI Advisory Greeting Box
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.roundedRect(margin, cursorY, contentWidth, 14, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, cursorY, contentWidth, 14, 2, 2, 'S');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  const greetingLines = doc.splitTextToSize(report.metadata.aiAdvisorGreeting, contentWidth - 8);
  doc.text(greetingLines, margin + 4, cursorY + 5.5);
  cursorY += 20;

  // ==========================================
  // SECTION 1: EXECUTIVE SUMMARY
  // ==========================================
  renderSectionHeader(1, 'Executive Summary');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);

  const execSummary = report.executiveSummary;
  const execLines = doc.splitTextToSize(execSummary.businessSummary, contentWidth);
  doc.text(execLines, margin, cursorY);
  cursorY += execLines.length * 4.5 + 4;

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: { fillColor: headerBlue as any, textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
    bodyStyles: { fontSize: 8, textColor: textDark as any },
    head: [['Parameter', 'Assessment Viability Summary']],
    body: [
      ['Proposed Business', execSummary.businessName],
      ['Location Context', execSummary.location],
      ['Target Customers', execSummary.targetCustomerSegment],
      ['Financial Viability', execSummary.financialViabilitySummary],
      ['Market & Competition', execSummary.demandAndCompetitionSummary],
    ],
  });
  cursorY = (doc as any).lastAutoTable.finalY + 8;

  // ==========================================
  // SECTION 2: MARKET ANALYSIS
  // ==========================================
  renderSectionHeader(2, 'Business Idea & Local Market Analysis');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Business Description:', margin, cursorY);
  cursorY += 4.5;

  doc.setFont('helvetica', 'normal');
  const mktDesc = doc.splitTextToSize(report.marketAnalysis.businessDescription, contentWidth);
  doc.text(mktDesc, margin, cursorY);
  cursorY += mktDesc.length * 4.5 + 4;

  const targetList = report.marketAnalysis.targetCustomerSegments.map((s, idx) => [`${idx + 1}. ${s}`]);
  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'plain',
    bodyStyles: { fontSize: 8, textColor: textDark as any },
    head: [['Core Target Customer Groups:']],
    headStyles: { fontStyle: 'bold', fontSize: 8.5, textColor: headerBlue as any },
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
  cursorY += compNote.length * 4 + 4;

  const compBody = report.competitionAnalysis.competitorProfiles.map((c) => [
    c.name,
    c.type,
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
  // SECTION 4: PRICING & PRODUCT STRATEGY
  // ==========================================
  renderSectionHeader(4, 'Pricing & Product Strategy');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  const priceApp = doc.splitTextToSize(report.pricingProductStrategy.pricingApproach, contentWidth);
  doc.text(priceApp, margin, cursorY);
  cursorY += priceApp.length * 4.5 + 4;

  const invBody = report.pricingProductStrategy.inventoryMix.map((i) => [i.category, i.turnover, i.margin]);
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
  // SECTION 5: FINANCIAL FEASIBILITY
  // ==========================================
  renderSectionHeader(5, 'Financial Feasibility & Scheme Structure');
  const fin = report.financialFeasibility;

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: { fillColor: headerBlue as any, textColor: 255, fontSize: 8.5 },
    bodyStyles: { fontSize: 8, textColor: textDark as any },
    head: [['Financial Metric', 'Value', 'Financial Metric', 'Value']],
    body: [
      ['Total Project Cost', formatCurrency(fin.projectCost), 'Selected Scheme', fin.schemeName],
      ['Applicant Own Contribution', formatCurrency(fin.ownContribution), 'Financing Percentage', `${fin.financingPercentage || 90}%`],
      ['Loan Requirement', formatCurrency(fin.baseLoanAmount), 'Annual Interest Rate', fin.annualInterestRate || '9.5%'],
      ['Required Margin Money', formatCurrency(fin.requiredOwnContribution), 'Repayment Tenure', `${fin.totalTenureMonths} Months`],
      ['Margin Shortfall / Surplus', formatCurrency(fin.shortfall), 'Moratorium Period', `${fin.moratoriumMonths} Months`],
      ['Estimated Installment (EMI)', formatCurrency(fin.installmentAmount as any), 'DSCR Capacity Status', fin.dscrStatus || 'SUFFICIENT'],
    ],
  });
  cursorY = (doc as any).lastAutoTable.finalY + 4;

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
    headStyles: { fillColor: headerBlue as any, textColor: 255, fontSize: 8.5 },
    bodyStyles: { fontSize: 7.5, textColor: textDark as any },
    head: [['Strengths (Internal)', 'Weaknesses (Internal)']],
    body: [
      [
        report.swotAnalysis.strengths.map((s) => `• ${s}`).join('\n\n'),
        report.swotAnalysis.weaknesses.map((w) => `• ${w}`).join('\n\n'),
      ],
    ],
  });
  cursorY = (doc as any).lastAutoTable.finalY + 2;

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: { fillColor: headerBlue as any, textColor: 255, fontSize: 8.5 },
    bodyStyles: { fontSize: 7.5, textColor: textDark as any },
    head: [['Opportunities (External)', 'Threats (External)']],
    body: [
      [
        report.swotAnalysis.opportunities.map((o) => `• ${o}`).join('\n\n'),
        report.swotAnalysis.threats.map((t) => `• ${t}`).join('\n\n'),
      ],
    ],
  });
  cursorY = (doc as any).lastAutoTable.finalY + 8;

  // ==========================================
  // SECTION 7: RISK ANALYSIS & MITIGATION
  // ==========================================
  renderSectionHeader(7, 'Risk Analysis & Mitigation Framework');
  const riskBody = report.riskAnalysis.map((r) => [
    r.risk,
    r.likelihood,
    r.impact,
    r.mitigationStrategy,
    r.monitoringIndicator,
  ]);

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'striped',
    headStyles: { fillColor: headerBlue as any, textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: textDark as any },
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
    head: [['Parameter', 'Sahayak Ground Reality Response']],
    body: [
      ['Road & Transport Access', infra.roadTransport],
      ['Electricity Availability', infra.electricity],
      ['Water Availability', infra.water],
      ['Internet & Mobile Connectivity', infra.internet],
      ['Nearby Competitors (Reported)', infra.userReportedCompetitors],
      ['Seasonal Constraints', `${infra.seasonalConstraints} ${infra.seasonalExplanation ? `— ${infra.seasonalExplanation}` : ''}`],
      ['Demand Assessment', `${infra.localDemandLevel} (${infra.demandReason})`],
      ['Target Customers & Channels', `${infra.targetCustomers} | Channels: ${infra.salesChannels}`],
      ['Key Challenges & Support', `${infra.businessChallenges} | Needed: ${infra.supportRequired}`],
    ],
  });
  cursorY = (doc as any).lastAutoTable.finalY + 8;

  // ==========================================
  // SECTION 9: SUPPORT ORGANIZATIONS
  // ==========================================
  renderSectionHeader(9, 'Local Support Organization Recommendations (Surat)');
  const orgBody = report.supportOrganizations.map((o) => [
    o.name,
    o.category,
    `${o.address}\nPhone: ${o.phone || 'N/A'}\nEmail: ${o.email || 'N/A'}\nWeb: ${o.website || 'N/A'}`,
    o.explanation,
  ]);

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'striped',
    headStyles: { fillColor: headerBlue as any, textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: textDark as any },
    head: [['Organization Name', 'Category', 'Contact Details & Address', 'Advisory Guidance']],
    body: orgBody,
  });
  cursorY = (doc as any).lastAutoTable.finalY + 3;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
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
    v.category,
    v.url,
  ]);

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: { fillColor: headerBlue as any, textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: textDark as any },
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
    headStyles: { fillColor: headerBlue as any, textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: textDark as any },
    head: [['Stage', 'Milestone Title', 'Duration', 'Action Details']],
    body: planBody,
  });
  cursorY = (doc as any).lastAutoTable.finalY + 8;

  // ==========================================
  // SECTION 12: CONCLUSION & LIMITATIONS
  // ==========================================
  renderSectionHeader(12, 'Conclusion & Advisory Disclaimers');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
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
    headStyles: { fontStyle: 'bold', fontSize: 8, textColor: headerBlue as any },
    bodyStyles: { fontSize: 7, textColor: textMuted as any },
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

  // Save / Download PDF
  const filename = `UDAAN_Feasibility_Report_${report.assessmentId}.pdf`;
  doc.save(filename);
}
