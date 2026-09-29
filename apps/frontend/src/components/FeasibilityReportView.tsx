import React, { useState, useEffect, useCallback } from 'react';
import type { FeasibilityReportData } from '../api/questionnaire';
import { recordReportDownload } from '../api/questionnaire';
import { generateFeasibilityReportPdf } from '../utils/pdfGenerator';
import { useLanguage } from '../context/LanguageContext';
import { formatLabel, formatTagsList } from '../utils/formatters';
import {
  Download,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Phone,
  Mail,
  Globe,
  ExternalLink,
  Play,
  TrendingUp,
  Sparkles,
  ShieldAlert,
  Coins,
  MapPin,
  Calendar,
  Layers,
  FileText,
  Clock,
  ChevronDown,
  ChevronUp,
  Bot,
  HelpCircle,
  AlertCircle,
  Truck,
  Zap,
  Droplets,
  Wifi,
} from 'lucide-react';

import { getFeasibilityReport } from '../api/questionnaire';

interface FeasibilityReportViewProps {
  report?: FeasibilityReportData | null;
  assessmentId?: string;
  onNavigate: (view: string, assessmentId?: string) => void;
}

export const FeasibilityReportView: React.FC<FeasibilityReportViewProps> = ({
  report: initialReport = null,
  assessmentId,
  onNavigate,
}) => {
  const { language, t } = useLanguage();
  const [report, setReport] = useState<FeasibilityReportData | null>(initialReport);
  const [isLoading, setIsLoading] = useState<boolean>(!initialReport && Boolean(assessmentId));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('exec');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    if (!assessmentId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getFeasibilityReport(assessmentId);
      setReport(data);
    } catch (err: any) {
      setLoadError(err.message || 'Failed to retrieve or generate feasibility report');
    } finally {
      setIsLoading(false);
    }
  }, [assessmentId]);

  useEffect(() => {
    if (initialReport) {
      setReport(initialReport);
      setIsLoading(false);
    } else if (assessmentId) {
      fetchReport();
    }
  }, [initialReport, assessmentId, fetchReport]);

  if (isLoading) {
    return (
      <div
        style={{
          maxWidth: '700px',
          margin: '80px auto',
          padding: '48px 32px',
          background: 'linear-gradient(145deg, #0b132b, #1c2541)',
          borderRadius: '20px',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          textAlign: 'center',
          color: '#ffffff',
        }}
      >
        <div className="spinner" style={{ width: '48px', height: '48px', margin: '0 auto 20px', borderColor: 'rgba(56, 189, 248, 0.3)', borderTopColor: '#38bdf8' }} />
        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
          {language === 'hi'
            ? 'व्यापार व्यवहार्यता रिपोर्ट तैयार की जा रही है...'
            : language === 'gu'
            ? 'બિઝનેસ શક્યતા રિપોર્ટ તૈયાર થઈ રહ્યો છે...'
            : 'Generating Feasibility Intelligence Report...'}
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto' }}>
          {language === 'hi'
            ? 'सहायक वित्तीय अनुमानों, स्थानीय बाजार मानकों और परिचालन जोखिमों का विश्लेषण कर रहा है।'
            : language === 'gu'
            ? 'સહાયક નાણાકીય અંદાજો, સ્થાનિક બજાર પરિમાણો અને જોખમોનું વિશ્લેષણ કરી રહ્યું છે.'
            : 'Sahayak is assembling your deterministic financial projections, local market benchmarks, and operational risk assessment.'}
        </p>
      </div>
    );
  }

  if (!report) {
    return (
      <div
        style={{
          maxWidth: '650px',
          margin: '60px auto',
          padding: '40px 32px',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
          textAlign: 'center',
          border: '1px solid #e2e8f0',
        }}
      >
        <AlertTriangle size={48} color="#f59e0b" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '1.4rem', color: '#1e293b', marginBottom: '8px', fontWeight: 700 }}>
          {loadError
            ? (language === 'hi' ? 'रिपोर्ट उपलब्ध नहीं है' : language === 'gu' ? 'રિપોર્ટ ઉપલબ્ધ નથી' : 'Feasibility Report Unavailable')
            : (language === 'hi' ? 'रिपोर्ट स्नैपशॉट नहीं मिला' : language === 'gu' ? 'રિપોર્ટ સ્નેપશોટ મળ્યો નથી' : 'Report Snapshot Not Available')}
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.5 }}>
          {loadError || (language === 'hi'
            ? 'इस मूल्यांकन के लिए रिपोर्ट अभी उत्पन्न नहीं हुई है। कृपया सुनिश्चित करें कि मूल्यांकन सेटअप, वित्तीय विवरण और सहायक प्रश्नावली पूरी हो गई हैं।'
            : language === 'gu'
            ? 'આ મૂલ્યાંકન માટે રિપોર્ટ હજી જનરેટ થયો નથી. કૃપા કરીને ખાતરી કરો કે સેટઅપ, નાણાકીય વિગતો અને સહાયક પ્રશ્નાવલી પૂર્ણ છે.'
            : 'The feasibility report has not been generated for this assessment. Please ensure that the assessment setup, financial inputs, and Sahayak questionnaire are completed.')}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {assessmentId && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={fetchReport}
              style={{ padding: '10px 20px' }}
            >
              <Sparkles size={16} />
              <span>{language === 'hi' ? 'रिपोर्ट तैयार करें / रीफ्रेश करें' : language === 'gu' ? 'રિપોર્ટ જનરેટ કરો / તાજું કરો' : 'Generate / Refresh Report'}</span>
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onNavigate('dashboard')}
            style={{ padding: '10px 20px' }}
          >
            <ArrowLeft size={16} />
            <span>{t.returnToDashboard}</span>
          </button>
        </div>
      </div>
    );
  }

  const {
    metadata,
    executiveSummary,
    marketAnalysis,
    competitionAnalysis,
    pricingProductStrategy,
    financialFeasibility,
    swotAnalysis,
    riskAnalysis,
    infrastructureAssessment,
    supportOrganizations = [],
    curatedVideos = [],
    actionPlan = [],
    conclusionAndLimitations,
  } = report;

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    try {
      // 1. Generate and download PDF on client with current language
      generateFeasibilityReportPdf(report, language);

      // 2. Notify backend to record download and mark assessment COMPLETED
      await recordReportDownload(report.assessmentId);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err: any) {
      setDownloadError(err.message || 'Failed to download PDF report');
    } finally {
      setIsDownloading(false);
    }
  };

  const sectionsNav = [
    { id: 'exec', label: t.section1Nav || '1. Executive Summary' },
    { id: 'market', label: t.section2Nav || '2. Market Analysis' },
    { id: 'comp', label: t.section3Nav || '3. Competition' },
    { id: 'pricing', label: t.section4Nav || '4. Pricing & Products' },
    { id: 'finance', label: t.section5Nav || '5. Financial Feasibility' },
    { id: 'swot', label: t.section6Nav || '6. SWOT Analysis' },
    { id: 'risks', label: t.section7Nav || '7. Risks & Mitigation' },
    { id: 'infra', label: t.section8Nav || '8. Infrastructure' },
    { id: 'ngos', label: t.section9Nav || '9. Support Organizations' },
    { id: 'videos', label: t.section10Nav || '10. Learning Resources' },
    { id: 'action', label: t.section11Nav || '11. Action Plan' },
    { id: 'conclusion', label: t.section12Nav || '12. Conclusion' },
  ];

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(`report-sec-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Financial reconciliation & 10% own contribution checks
  const projectCost = financialFeasibility?.projectCost || 0;
  const ownContribution = financialFeasibility?.ownContribution || 0;
  const required10Percent = financialFeasibility?.requiredOwnContribution !== undefined && financialFeasibility?.requiredOwnContribution !== null
    ? financialFeasibility.requiredOwnContribution
    : Math.round(projectCost * 0.10);
  const shortfall = financialFeasibility?.shortfall !== undefined
    ? financialFeasibility.shortfall
    : Math.max(0, required10Percent - ownContribution);
  const isMarginCompliant = shortfall === 0;
  const loanAmount = financialFeasibility?.baseLoanAmount || Math.max(0, projectCost - ownContribution);
  const ownPercent = projectCost > 0 ? Math.round((ownContribution / projectCost) * 100) : (isMarginCompliant ? 10 : 0);
  const loanPercent = Math.max(0, 100 - ownPercent);

  // Safe fallback for infrastructure recommendations
  const infraActionItems = infrastructureAssessment?.actionableRecommendations || [
    {
      facilityKey: 'road_transport',
      facilityName: 'Road & Transport Access',
      rating: infrastructureAssessment?.roadTransport || 'AVERAGE',
      ratingLabel: formatLabel(infrastructureAssessment?.roadTransport || 'AVERAGE', language),
      impact: 'Stock replenishment frequency, delivery turnaround, customer reach, and transport costs depend on road quality.',
      recommendations: [
        'Establish scheduled delivery days with nearby Bardoli and Surat wholesale distributors.',
        'Compare transport costs and delivery minimums across suppliers to optimize logistics.',
        'Maintain a 7 to 10-day buffer stock for essential fast-moving consumer items.',
        'Ensure safe loading/unloading space and set designated off-peak delivery hours.',
      ],
      priority: 'Medium',
    },
    {
      facilityKey: 'electricity',
      facilityName: 'Electricity Availability',
      rating: infrastructureAssessment?.electricity || 'AVERAGE',
      ratingLabel: formatLabel(infrastructureAssessment?.electricity || 'AVERAGE', language),
      impact: 'Power reliability directly impacts shop lighting, billing terminals, digital payments, and refrigeration.',
      recommendations: [
        'Use energy-efficient LED luminaires to minimize operating load and power bills.',
        'Maintain a reliable battery backup / micro-UPS for digital POS billing and UPI payment machines.',
        'Evaluate an appropriately sized 800VA–1100VA pure sine-wave inverter based on actual essential load.',
        'Protect temperature-sensitive dairy, milk pouches, and cold items with thermal cooler insulation.',
      ],
      priority: 'High',
    },
    {
      facilityKey: 'water',
      facilityName: 'Water Supply',
      rating: infrastructureAssessment?.water || 'GOOD',
      ratingLabel: formatLabel(infrastructureAssessment?.water || 'GOOD', language),
      impact: 'Good water access provides an operational advantage for shop sanitization and hygiene standards.',
      recommendations: [
        'Maintain regular daily cleaning routines for display racks, floors, and storage drums.',
        'Ensure safe, filtered drinking water for retail staff and customers.',
        'Avoid unnecessary water capital expenditure while existing municipal/panchayat supply remains reliable.',
      ],
      priority: 'Low',
    },
    {
      facilityKey: 'connectivity',
      facilityName: 'Internet / Mobile Connectivity',
      rating: infrastructureAssessment?.internet || 'POOR',
      ratingLabel: formatLabel(infrastructureAssessment?.internet || 'POOR', language),
      impact: 'Weak mobile network creates friction for instant UPI payments, digital billing, and online ordering.',
      recommendations: [
        'Test multiple cellular networks (Jio, Airtel, Vi, BSNL) at the specific shop counter location.',
        'Keep a reliable primary network and an alternate fallback SIM card for cashier payment confirmation.',
        'Maintain a compliant offline manual transaction record / paper billing process during network downtime.',
        'Keep static QR standees with SMS/soundbox backup and reconcile transactions daily when connectivity resumes.',
        'Consider fixed broadband or fixed wireless access (FWA) only after assessing local feasibility and costs.',
      ],
      priority: 'High',
    },
  ];

  return (
    <div
      style={{
        background: '#0b132b',
        color: '#f8fafc',
        minHeight: '100vh',
        padding: '24px 16px 80px',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Top Control Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '24px',
            padding: '16px 20px',
            background: 'rgba(28, 37, 65, 0.7)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#94a3b8',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.88rem',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            <ArrowLeft size={16} />
            <span>{t.dashboard}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {downloadSuccess && (
              <span
                style={{
                  color: '#06d6a0',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={16} />
                <span>{t.pdfSuccessNotice || 'PDF Report downloaded successfully!'}</span>
              </span>
            )}

            {downloadError && (
              <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>{downloadError}</span>
            )}

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              style={{
                background: 'linear-gradient(135deg, #06d6a0 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '10px 22px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: isDownloading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(6, 214, 160, 0.35)',
                transition: 'transform 0.15s ease',
              }}
            >
              {isDownloading ? (
                <>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #ffffff',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  <span>{t.downloadingPdfBtn || 'Generating PDF...'}</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span>{t.downloadPdfBtn || 'Download Complete Report (PDF)'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Report Hero / Header Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1c2541 0%, #0f172a 100%)',
            border: '1px solid rgba(6, 214, 160, 0.3)',
            borderRadius: '16px',
            padding: '36px 32px',
            marginBottom: '28px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '240px',
              height: '240px',
              background: 'radial-gradient(circle, rgba(6, 214, 160, 0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(6, 214, 160, 0.15)',
              border: '1px solid rgba(6, 214, 160, 0.4)',
              color: '#06d6a0',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '16px',
            }}
          >
            <Sparkles size={14} />
            <span>Sahayak — Business Feasibility Intelligence</span>
          </div>

          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.25,
              marginBottom: '12px',
            }}
          >
            {t.reportHeaderTitle || metadata.reportTitle}
          </h1>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '18px',
              fontSize: '0.9rem',
              color: '#94a3b8',
              marginBottom: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={16} color="#06d6a0" />
              <span>
                <strong>{t.businessCategory}:</strong> {formatLabel(metadata.businessCategory, language)}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16} color="#06d6a0" />
              <span>
                <strong>{t.locationLabel}:</strong> {metadata.location}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} color="#06d6a0" />
              <span>
                <strong>{t.dateCreated}:</strong>{' '}
                {new Date(metadata.assessmentDate).toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'gu' ? 'gu-IN' : 'en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: '#cbd5e1', maxWidth: '850px', margin: 0 }}>
            {metadata.aiAdvisorGreeting}
          </p>
        </div>

        {/* Sticky Section Navigation Bar */}
        <div
          style={{
            position: 'sticky',
            top: '12px',
            zIndex: 30,
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
            padding: '8px',
            marginBottom: '28px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
          }}
        >
          {sectionsNav.map((sec) => {
            const isAct = activeTab === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollToSection(sec.id)}
                style={{
                  background: isAct ? 'rgba(6, 214, 160, 0.2)' : 'transparent',
                  color: isAct ? '#06d6a0' : '#94a3b8',
                  border: isAct ? '1px solid #06d6a0' : '1px solid transparent',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '0.8rem',
                  fontWeight: isAct ? 700 : 500,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {sec.label}
              </button>
            );
          })}
        </div>

        {/* 12 Sections Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* ========================================================================= */}
          {/* SECTION 1: EXECUTIVE SUMMARY */}
          {/* ========================================================================= */}
          <div
            id="report-sec-exec"
            style={{
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '14px',
              padding: '28px',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div
              style={{
                borderBottom: '2px solid #f1f5f9',
                paddingBottom: '14px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <FileText size={22} color="#0b132b" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0b132b' }}>
                {t.section1Nav || 'Section 1: Executive Summary'}
              </h2>
            </div>

            <p style={{ fontSize: '0.98rem', lineHeight: 1.65, color: '#334155', marginBottom: '20px' }}>
              {executiveSummary.businessSummary}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '16px',
                  borderRadius: '10px',
                }}
              >
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                  {t.targetCustomerSegmentsLabel || 'Target Customers'}
                </div>
                <div style={{ fontSize: '0.92rem', color: '#0f172a', fontWeight: 600 }}>
                  {formatTagsList(executiveSummary.targetCustomerSegment, language)}
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '16px',
                  borderRadius: '10px',
                }}
              >
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                  {t.financialViabilitySnapshotLabel || 'Financial Viability Snapshot'}
                </div>
                <div style={{ fontSize: '0.92rem', color: '#0f172a' }}>
                  {executiveSummary.financialViabilitySummary}
                </div>
              </div>
            </div>

            {/* Strengths & Watchpoints Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              <div
                style={{
                  background: 'rgba(6, 214, 160, 0.08)',
                  border: '1px solid rgba(6, 214, 160, 0.3)',
                  padding: '18px',
                  borderRadius: '10px',
                }}
              >
                <div
                  style={{
                    color: '#059669',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{t.keyStrengthsLabel || 'Key Commercial Strengths'}</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.88rem', lineHeight: 1.6, color: '#1e293b' }}>
                  {executiveSummary.keyStrengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.06)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  padding: '18px',
                  borderRadius: '10px',
                }}
              >
                <div
                  style={{
                    color: '#dc2626',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <ShieldAlert size={16} />
                  <span>{t.criticalWatchpointsLabel || 'Critical Watchpoints'}</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.88rem', lineHeight: 1.6, color: '#1e293b' }}>
                  {executiveSummary.criticalWatchpoints.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 2: BUSINESS IDEA & LOCAL MARKET ANALYSIS */}
          {/* ========================================================================= */}
          <div
            id="report-sec-market"
            style={{
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '14px',
              padding: '28px',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div
              style={{
                borderBottom: '2px solid #f1f5f9',
                paddingBottom: '14px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <TrendingUp size={22} color="#0b132b" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0b132b' }}>
                {t.section2Nav || 'Section 2: Business Idea & Local Market Analysis'}
              </h2>
            </div>

            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#334155', marginBottom: '20px' }}>
              {marketAnalysis.businessDescription}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {/* Target Customer Segments */}
              <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#0b132b', marginBottom: '10px', fontWeight: 700 }}>
                  {t.targetCustomerSegmentsLabel || 'Target Customer Segments'}
                </h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.86rem', lineHeight: 1.55, color: '#475569' }}>
                  {marketAnalysis.targetCustomerSegments.map((seg, idx) => (
                    <li key={idx}>{formatLabel(seg, language)}</li>
                  ))}
                </ul>
              </div>

              {/* Demand Drivers */}
              <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#0b132b', marginBottom: '10px', fontWeight: 700 }}>
                  {t.demandDriversLabel || 'Local Demand Drivers'}
                </h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.86rem', lineHeight: 1.55, color: '#475569' }}>
                  {marketAnalysis.demandDrivers.map((d, idx) => (
                    <li key={idx}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 3: COMPETITION ANALYSIS (5–10 KM RADIUS) */}
          {/* ========================================================================= */}
          <div
            id="report-sec-comp"
            style={{
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '14px',
              padding: '28px',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div
              style={{
                borderBottom: '2px solid #f1f5f9',
                paddingBottom: '14px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Layers size={22} color="#0b132b" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0b132b' }}>
                {t.section3Nav || 'Section 3: Local Competition Analysis (5–10 km Radius)'}
              </h2>
            </div>

            <div
              style={{
                background: '#f1f5f9',
                borderLeft: '4px solid #64748b',
                padding: '12px 16px',
                borderRadius: '0 8px 8px 0',
                fontSize: '0.84rem',
                color: '#475569',
                marginBottom: '20px',
              }}
            >
              {competitionAnalysis.methodologyNote}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#0b132b', color: '#ffffff', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>Competitor Profile</th>
                    <th style={{ padding: '10px 12px' }}>Format / Distance</th>
                    <th style={{ padding: '10px 12px' }}>Competitive Offering</th>
                    <th style={{ padding: '10px 12px' }}>{t.differentiationStrategyLabel || 'Differentiation Strategy'}</th>
                  </tr>
                </thead>
                <tbody>
                  {competitionAnalysis.competitorProfiles.map((comp, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid #e2e8f0',
                        background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                      }}
                    >
                      <td style={{ padding: '12px', fontWeight: 600, color: '#0f172a' }}>
                        {comp.name}
                      </td>
                      <td style={{ padding: '12px', color: '#64748b' }}>
                        {formatLabel(comp.type, language)} — {comp.distance}
                      </td>
                      <td style={{ padding: '12px', color: '#334155' }}>{comp.competitiveOffering}</td>
                      <td style={{ padding: '12px', color: '#059669', fontWeight: 600 }}>
                        {comp.differentiationStrategy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 4: PRICING & PRODUCT STRATEGY */}
          {/* ========================================================================= */}
          <div
            id="report-sec-pricing"
            style={{
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '14px',
              padding: '28px',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div
              style={{
                borderBottom: '2px solid #f1f5f9',
                paddingBottom: '14px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Coins size={22} color="#0b132b" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0b132b' }}>
                {t.section4Nav || 'Section 4: Pricing & Product Category Strategy'}
              </h2>
            </div>

            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#334155', marginBottom: '20px' }}>
              {pricingProductStrategy.pricingApproach}
            </p>

            <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#0b132b', color: '#ffffff', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>Product Category</th>
                    <th style={{ padding: '10px 12px' }}>{t.turnoverVelocityLabel || 'Turnover Velocity'}</th>
                    <th style={{ padding: '10px 12px' }}>{t.grossMarginRangeLabel || 'Target Gross Margin Range'}</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingProductStrategy.inventoryMix.map((inv, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid #e2e8f0',
                        background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                      }}
                    >
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{formatLabel(inv.category, language)}</td>
                      <td style={{ padding: '10px 12px', color: '#059669', fontWeight: 600 }}>
                        {inv.turnover}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#1e293b' }}>{inv.margin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '14px 18px',
                borderRadius: '8px',
                fontSize: '0.88rem',
                color: '#334155',
              }}
            >
              <strong>{t.workingCapitalDisciplineLabel || 'Working Capital & Credit Discipline'}:</strong>{' '}
              {pricingProductStrategy.workingCapitalDiscipline}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 5: FINANCIAL FEASIBILITY (REAL BACKEND ENGINE) */}
          {/* ========================================================================= */}
          <div
            id="report-sec-finance"
            style={{
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '14px',
              padding: '28px',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div
              style={{
                borderBottom: '2px solid #f1f5f9',
                paddingBottom: '14px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Coins size={22} color="#059669" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0b132b' }}>
                  {t.section5Nav || 'Section 5: Financial Feasibility & Scheme Structure'}
                </h2>
              </div>
              <span
                style={{
                  background: 'rgba(6, 214, 160, 0.15)',
                  color: '#059669',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                }}
              >
                Deterministic Financial Engine
              </span>
            </div>

            {/* Financial KPI Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '14px',
                marginBottom: '20px',
              }}
            >
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  {t.totalOutlayLabel || 'Total Project Outlay'}
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0b132b', marginTop: '4px' }}>
                  ₹{(projectCost || 0).toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  {t.ownEquityLabel || 'Own Equity Contribution'}
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: isMarginCompliant ? '#059669' : '#d97706', marginTop: '4px' }}>
                  ₹{(ownContribution || 0).toLocaleString('en-IN')}
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, marginLeft: '6px' }}>
                    ({ownPercent}%)
                  </span>
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  {t.bankLoanLabel || 'Required Bank Loan'}
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
                  ₹{(loanAmount || 0).toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  {t.monthlyEmiLabel || 'Estimated Monthly EMI'}
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#7c3aed', marginTop: '4px' }}>
                  {financialFeasibility.installmentAmount
                    ? `₹${Number(financialFeasibility.installmentAmount).toLocaleString('en-IN')}`
                    : (financialFeasibility.repaymentSchedule?.length > 0
                        ? `₹${Number(financialFeasibility.repaymentSchedule[0].installmentAmount).toLocaleString('en-IN')}`
                        : 'Calculated at Bank')}
                </div>
              </div>
            </div>

            {/* 10% Own Contribution Rule Enforcement Badge & Breakdown */}
            <div
              style={{
                marginBottom: '24px',
                background: isMarginCompliant ? 'rgba(6, 214, 160, 0.08)' : 'rgba(245, 158, 11, 0.1)',
                border: `1px solid ${isMarginCompliant ? 'rgba(6, 214, 160, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                padding: '16px',
                borderRadius: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isMarginCompliant ? (
                    <CheckCircle2 size={18} color="#059669" />
                  ) : (
                    <AlertCircle size={18} color="#d97706" />
                  )}
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isMarginCompliant ? '#059669' : '#b45309' }}>
                    {isMarginCompliant
                      ? (t.marginCompliantBadge || '✓ Meets 10% Minimum Own Equity Requirement')
                      : (t.marginShortfallAlert || `⚠️ Minimum Own Contribution Shortfall: ₹${(shortfall ?? 0).toLocaleString('en-IN')}`)}
                  </span>
                </div>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Minimum 10% Required: ₹{(required10Percent || 0).toLocaleString('en-IN')} | Actual Provided: ₹{(ownContribution || 0).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ height: '12px', display: 'flex', borderRadius: '6px', overflow: 'hidden', background: '#e2e8f0', marginTop: '8px' }}>
                <div style={{ width: `${Math.min(100, ownPercent)}%`, background: isMarginCompliant ? '#06d6a0' : '#f59e0b' }} />
                <div style={{ width: `${loanPercent}%`, background: '#2563eb' }} />
              </div>
            </div>

            {/* Scheme Details Table */}
            <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px', fontWeight: 600, color: '#64748b', width: '30%' }}>{t.applicableScheme || 'Applicable Scheme'}</td>
                    <td style={{ padding: '10px', fontWeight: 700, color: '#0b132b' }}>{financialFeasibility.schemeName}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <td style={{ padding: '10px', fontWeight: 600, color: '#64748b' }}>{t.interestRateLabel || 'Annual Interest Rate'}</td>
                    <td style={{ padding: '10px', color: '#0f172a' }}>{financialFeasibility.annualInterestRate || '9.5% (Bank Estimated)'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px', fontWeight: 600, color: '#64748b' }}>{t.tenureMoratoriumLabel || 'Tenure & Moratorium'}</td>
                    <td style={{ padding: '10px', color: '#0f172a' }}>
                      {financialFeasibility.totalTenureMonths} Months ({financialFeasibility.moratoriumMonths} Months Moratorium)
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <td style={{ padding: '10px', fontWeight: 600, color: '#64748b' }}>{t.dscrStatusLabel || 'DSCR Debt Service Status'}</td>
                    <td style={{ padding: '10px', color: financialFeasibility.dscr !== null ? '#059669' : '#64748b', fontWeight: 700 }}>
                      {financialFeasibility.dscr !== null ? (
                        <span>
                          {financialFeasibility.dscr} — {formatLabel(financialFeasibility.dscrStatus, language)} ({financialFeasibility.dscrExplanation})
                        </span>
                      ) : (
                        <span style={{ color: '#64748b', fontStyle: 'italic' }}>
                          Awaiting required financial inputs: {financialFeasibility.dscrExplanation}
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Repayment Schedule */}
            {financialFeasibility.repaymentSchedule && financialFeasibility.repaymentSchedule.length > 0 ? (
              <div style={{ marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowFullSchedule(!showFullSchedule)}
                  style={{
                    background: 'transparent',
                    border: '1px solid #cbd5e1',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#0b132b',
                  }}
                >
                  {showFullSchedule ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  <span>{showFullSchedule ? (t.hideScheduleBtn || 'Hide Full Amortization Schedule') : (t.showScheduleBtn || 'View Full Amortization Schedule')}</span>
                </button>

                {showFullSchedule && (
                  <div style={{ marginTop: '14px', overflowX: 'auto', maxHeight: '360px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                      <thead style={{ position: 'sticky', top: 0, background: '#0b132b', color: '#ffffff' }}>
                        <tr>
                          <th style={{ padding: '8px' }}>{t.periodLabel || 'Period'}</th>
                          <th style={{ padding: '8px' }}>{t.openingPrincipalLabel || 'Opening Balance'}</th>
                          <th style={{ padding: '8px' }}>{t.principalPaymentLabel || 'Principal'}</th>
                          <th style={{ padding: '8px' }}>{t.interestPaymentLabel || 'Interest'}</th>
                          <th style={{ padding: '8px' }}>{t.installmentAmountLabel || 'Installment'}</th>
                          <th style={{ padding: '8px' }}>{t.closingPrincipalLabel || 'Closing Balance'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {financialFeasibility.repaymentSchedule.map((item: any, idx: number) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>
                            <td style={{ padding: '6px' }}>{item.sequenceNumber}</td>
                            <td style={{ padding: '6px' }}>₹{Number(item.openingPrincipal).toLocaleString('en-IN')}</td>
                            <td style={{ padding: '6px' }}>₹{Number(item.principalPayment).toLocaleString('en-IN')}</td>
                            <td style={{ padding: '6px' }}>₹{Number(item.interestPayment).toLocaleString('en-IN')}</td>
                            <td style={{ padding: '6px', fontWeight: 600 }}>₹{Number(item.installmentAmount).toLocaleString('en-IN')}</td>
                            <td style={{ padding: '6px' }}>₹{Number(item.closingPrincipal).toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                ℹ️ <strong>Amortization Schedule:</strong> Awaiting complete loan parameter inputs to compute periodic schedule.
              </div>
            )}

            {/* Disclaimer */}
            <div
              style={{
                marginTop: '20px',
                padding: '12px 16px',
                background: '#fef3c7',
                borderLeft: '4px solid #f59e0b',
                color: '#92400e',
                fontSize: '0.78rem',
                lineHeight: 1.5,
                borderRadius: '0 8px 8px 0',
              }}
            >
              <strong>{t.disclaimerLabel || 'Financial Disclaimer'}:</strong> {financialFeasibility.disclaimer}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 6: SWOT ANALYSIS */}
          {/* ========================================================================= */}
          <div
            id="report-sec-swot"
            style={{
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '14px',
              padding: '28px',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div
              style={{
                borderBottom: '2px solid #f1f5f9',
                paddingBottom: '14px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Sparkles size={22} color="#0b132b" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0b132b' }}>
                {t.section6Nav || 'Section 6: SWOT Analysis'}
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {/* Strengths */}
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '18px', borderRadius: '10px' }}>
                <h4 style={{ color: '#047857', fontWeight: 700, fontSize: '0.95rem', marginBottom: '10px' }}>
                  {t.swotStrengthsLabel || 'Strengths (Internal)'}
                </h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.86rem', lineHeight: 1.6, color: '#064e3b' }}>
                  {swotAnalysis.strengths.map((s, i) => (
                    <li key={i}>{formatLabel(s, language)}</li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '18px', borderRadius: '10px' }}>
                <h4 style={{ color: '#b45309', fontWeight: 700, fontSize: '0.95rem', marginBottom: '10px' }}>
                  {t.swotWeaknessesLabel || 'Weaknesses (Internal)'}
                </h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.86rem', lineHeight: 1.6, color: '#78350f' }}>
                  {swotAnalysis.weaknesses.map((w, i) => (
                    <li key={i}>{formatLabel(w, language)}</li>
                  ))}
                </ul>
              </div>

              {/* Opportunities */}
              <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', padding: '18px', borderRadius: '10px' }}>
                <h4 style={{ color: '#0f766e', fontWeight: 700, fontSize: '0.95rem', marginBottom: '10px' }}>
                  {t.swotOpportunitiesLabel || 'Opportunities (External)'}
                </h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.86rem', lineHeight: 1.6, color: '#134e4a' }}>
                  {swotAnalysis.opportunities.map((o, i) => (
                    <li key={i}>{formatLabel(o, language)}</li>
                  ))}
                </ul>
              </div>

              {/* Threats */}
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '18px', borderRadius: '10px' }}>
                <h4 style={{ color: '#b91c1c', fontWeight: 700, fontSize: '0.95rem', marginBottom: '10px' }}>
                  {t.swotThreatsLabel || 'Threats (External)'}
                </h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.86rem', lineHeight: 1.6, color: '#7f1d1d' }}>
                  {swotAnalysis.threats.map((th, i) => (
                    <li key={i}>{formatLabel(th, language)}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 7: RISK ANALYSIS & MITIGATION */}
          {/* ========================================================================= */}
          <div
            id="report-sec-risks"
            style={{
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '14px',
              padding: '28px',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div
              style={{
                borderBottom: '2px solid #f1f5f9',
                paddingBottom: '14px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <ShieldAlert size={22} color="#0b132b" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0b132b' }}>
                {t.section7Nav || 'Section 7: Risk Analysis & Mitigation Framework'}
              </h2>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: '#0b132b', color: '#ffffff', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>{t.riskFactorLabel || 'Risk Factor'}</th>
                    <th style={{ padding: '10px 12px' }}>{t.likelihoodImpactLabel || 'Likelihood / Impact'}</th>
                    <th style={{ padding: '10px 12px' }}>{t.mitigationStrategyLabel || 'Mitigation Strategy'}</th>
                    <th style={{ padding: '10px 12px' }}>{t.monitoringIndicatorLabel || 'Monitoring Indicator'}</th>
                  </tr>
                </thead>
                <tbody>
                  {riskAnalysis.map((r, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid #e2e8f0',
                        background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                      }}
                    >
                      <td style={{ padding: '12px', fontWeight: 600, color: '#0f172a' }}>
                        {formatLabel(r.risk, language)}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            background: r.impact === 'High' ? '#fee2e2' : '#fef3c7',
                            color: r.impact === 'High' ? '#dc2626' : '#d97706',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                          }}
                        >
                          {r.likelihood} / {r.impact}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#334155' }}>{r.mitigationStrategy}</td>
                      <td style={{ padding: '12px', color: '#059669', fontSize: '0.8rem' }}>
                        {r.monitoringIndicator}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 8: INFRASTRUCTURE & GROUND REALITY (SAHAYAK QUESTIONNAIRE) */}
          {/* ========================================================================= */}
          <div
            id="report-sec-infra"
            style={{
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '14px',
              padding: '28px',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div
              style={{
                borderBottom: '2px solid #f1f5f9',
                paddingBottom: '14px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <MapPin size={22} color="#0b132b" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0b132b' }}>
                {t.section8Nav || 'Section 8: Infrastructure & Ground Reality Assessment (Sahayak)'}
              </h2>
            </div>

            {/* Top Ratings Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Truck size={20} color="var(--brand-green)" />
                <div>
                  <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>Road & Transport</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
                    {formatLabel(infrastructureAssessment.roadTransport, language)}
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Zap size={20} color="#f59e0b" />
                <div>
                  <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>Electricity Availability</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
                    {formatLabel(infrastructureAssessment.electricity, language)}
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Droplets size={20} color="#3b82f6" />
                <div>
                  <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>Water Supply</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
                    {formatLabel(infrastructureAssessment.water, language)}
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Wifi size={20} color="#8b5cf6" />
                <div>
                  <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>Internet / Mobile</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
                    {formatLabel(infrastructureAssessment.internet, language)}
                  </div>
                </div>
              </div>
            </div>

            {/* SUBSECTION: Infrastructure Findings & Recommended Actions */}
            <div style={{ marginTop: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#0b132b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{t.infrastructureFindingsTitle || 'Infrastructure Findings & Recommended Actions'}</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {infraActionItems.map((item: any) => (
                  <div
                    key={item.facilityKey}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0b132b' }}>
                          {item.facilityName}
                        </span>
                        <span
                          style={{
                            background: item.priority === 'High' ? '#fee2e2' : item.priority === 'Medium' ? '#fef3c7' : '#ecfdf5',
                            color: item.priority === 'High' ? '#dc2626' : item.priority === 'Medium' ? '#d97706' : '#047857',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                          }}
                        >
                          {item.priority} Priority
                        </span>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '8px' }}>
                        <strong>User Rating:</strong> {item.ratingLabel}
                      </div>

                      <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.45, marginBottom: '10px' }}>
                        <strong>{t.businessImpactLabel || 'Business Impact'}:</strong> {item.impact}
                      </p>

                      <div>
                        <strong style={{ fontSize: '0.8rem', color: '#059669', display: 'block', marginBottom: '4px' }}>
                          {t.recommendedActionsLabel || 'Recommended Actions'}:
                        </strong>
                        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.78rem', lineHeight: 1.5, color: '#475569' }}>
                          {item.recommendations.map((rec: string, rIdx: number) => (
                            <li key={rIdx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ground Context Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.86rem' }}>
                <strong>Reported Competitors:</strong> {infrastructureAssessment.userReportedCompetitors}
              </div>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.86rem' }}>
                <strong>Seasonal Constraints:</strong> {formatTagsList(infrastructureAssessment.seasonalConstraints, language)} {infrastructureAssessment.seasonalExplanation}
              </div>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.86rem' }}>
                <strong>Local Demand Level:</strong> {formatLabel(infrastructureAssessment.localDemandLevel, language)} — {infrastructureAssessment.demandReason}
              </div>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.86rem' }}>
                <strong>Anticipated Challenges:</strong> {formatTagsList(infrastructureAssessment.businessChallenges, language)} (Needed: {infrastructureAssessment.supportRequired})
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 9: SUPPORT ORGANIZATIONS (DB-BACKED SURAT DEMO) */}
          {/* ========================================================================= */}
          <div
            id="report-sec-ngos"
            style={{
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '14px',
              padding: '28px',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div
              style={{
                borderBottom: '2px solid #f1f5f9',
                paddingBottom: '14px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building2 size={22} color="#0b132b" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0b132b' }}>
                  {t.section9Nav || 'Section 9: Local Support Organization Recommendations (Surat)'}
                </h2>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Surat local support options</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px', marginBottom: '18px' }}>
              {supportOrganizations.map((org) => (
                <div
                  key={org.id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div
                      style={{
                        background: 'rgba(6, 214, 160, 0.12)',
                        color: '#059669',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        width: 'fit-content',
                        marginBottom: '8px',
                      }}
                    >
                      {formatLabel(org.category, language)}
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b132b', marginBottom: '8px' }}>
                      {org.name}
                    </h3>

                    <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.55, marginBottom: '14px' }}>
                      {org.explanation}
                    </p>

                    <div style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                        <MapPin size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span>{org.address}</span>
                      </div>
                      {org.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={14} />
                          <a href={`tel:${org.phone}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                            {org.phone}
                          </a>
                        </div>
                      )}
                      {org.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Mail size={14} />
                          <a href={`mailto:${org.email}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                            {org.email}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {org.website && (
                    <a
                      href={org.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        background: '#0b132b',
                        color: '#ffffff',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      <Globe size={14} />
                      <span>Visit Official Website</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              ))}
            </div>

            <div style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic', textAlign: 'center' }}>
              Disclaimer: Please independently verify current contact details, eligibility, services, and availability before visiting or sharing personal documents.
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 10: CURATED YOUTUBE LEARNING RESOURCES (DB-BACKED) */}
          {/* ========================================================================= */}
          <div
            id="report-sec-videos"
            style={{
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '14px',
              padding: '28px',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div
              style={{
                borderBottom: '2px solid #f1f5f9',
                paddingBottom: '14px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Play size={22} color="#ef4444" fill="#ef4444" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0b132b' }}>
                  {t.section10Nav || 'Section 10: Curated Learning Resources'}
                </h2>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Curated Retail Guides</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
              {curatedVideos.map((vid) => (
                <div
                  key={vid.id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  {/* Embedded Iframe or Video Preview */}
                  {activeVideoId === vid.id ? (
                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${vid.youtubeId}?autoplay=1`}
                        title={vid.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          border: 'none',
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        position: 'relative',
                        paddingBottom: '56.25%',
                        height: 0,
                        background: '#0f172a',
                        cursor: 'pointer',
                      }}
                      onClick={() => setActiveVideoId(vid.id)}
                    >
                      <img
                        src={`https://img.youtube.com/vi/${vid.youtubeId}/hqdefault.jpg`}
                        alt={vid.title}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          opacity: 0.85,
                        }}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            background: 'rgba(239, 68, 68, 0.9)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                          }}
                        >
                          <Play size={22} fill="#ffffff" style={{ marginLeft: '3px' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          background: vid.language === 'English' ? '#dbeafe' : '#fef3c7',
                          color: vid.language === 'English' ? '#1d4ed8' : '#b45309',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        {vid.language}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatLabel(vid.category, language)}</span>
                    </div>

                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0b132b', margin: 0, lineHeight: 1.4 }}>
                      {vid.title}
                    </h4>

                    <a
                      href={vid.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        background: '#ef4444',
                        color: '#ffffff',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        marginTop: '6px',
                      }}
                    >
                      <Play size={13} fill="#ffffff" />
                      <span>Watch on YouTube</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 11: ACTION PLAN */}
          {/* ========================================================================= */}
          <div
            id="report-sec-action"
            style={{
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '14px',
              padding: '28px',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div
              style={{
                borderBottom: '2px solid #f1f5f9',
                paddingBottom: '14px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Clock size={22} color="#0b132b" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0b132b' }}>
                {t.section11Nav || 'Section 11: Step-by-Step Action Plan'}
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {actionPlan.map((act) => (
                <div
                  key={act.step}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    padding: '14px 18px',
                    background: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: '#0b132b',
                      color: '#06d6a0',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    {act.step}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0b132b' }}>
                        {act.title}
                      </div>
                      <span
                        style={{
                          background: '#e0f2fe',
                          color: '#0369a1',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        {act.duration}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: '4px 0 0', lineHeight: 1.5 }}>
                      {act.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 12: CONCLUSION & LIMITATIONS */}
          {/* ========================================================================= */}
          <div
            id="report-sec-conclusion"
            style={{
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '14px',
              padding: '28px',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div
              style={{
                borderBottom: '2px solid #f1f5f9',
                paddingBottom: '14px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <HelpCircle size={22} color="#0b132b" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0b132b' }}>
                {t.section12Nav || 'Section 12: Conclusion & Advisory Disclaimers'}
              </h2>
            </div>

            <p style={{ fontSize: '0.95rem', lineHeight: 1.65, color: '#1e293b', fontWeight: 500, marginBottom: '20px' }}>
              {conclusionAndLimitations.conclusion}
            </p>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '16px 20px',
                borderRadius: '10px',
              }}
            >
              <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                {t.limitationsTitle || 'Demonstration Methodology Limitations:'}
              </h4>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>
                {conclusionAndLimitations.limitations.map((lim, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>
                    {lim}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* POST-REPORT INTERACTION: SAHAYAK CHAT TEASER (COMING SOON) */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1c2541 0%, #0f172a 100%)',
              border: '1px solid rgba(6, 214, 160, 0.25)',
              borderRadius: '14px',
              padding: '28px',
              textAlign: 'center',
              boxShadow: '0 12px 28px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(6, 214, 160, 0.15)',
                color: '#06d6a0',
                marginBottom: '12px',
              }}
            >
              <Bot size={24} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
              {language === 'hi'
                ? 'क्या आप इस रिपोर्ट के बारे में कुछ और पूछना चाहते हैं?'
                : language === 'gu'
                ? 'શું તમને આ રિપોર્ટ વિશે વધુ પ્રશ્નો છે?'
                : 'Have more questions about your report?'}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 20px', lineHeight: 1.5 }}>
              {language === 'hi'
                ? 'सहायक चैट सहायक आपको वित्तीय गणनाओं, आपूर्तिकर्ता विकल्पों और ऋण आवेदनों पर सीधा मार्गदर्शन प्रदान करेगा।'
                : language === 'gu'
                ? 'સહાયક ચેટ સહાયક તમને નાણાકીય ગણતરીઓ, સપ્લાયર્સ અને લોન અરજીઓ પર સીધું માર્ગદર્શન આપશે.'
                : 'Ask Sahayak will allow you to query your financial calculations, explore supplier alternatives, and get instant guidance on loan applications.'}
            </p>

            <button
              type="button"
              disabled
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#94a3b8',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '10px 24px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'not-allowed',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Bot size={16} />
              <span>
                {language === 'hi'
                  ? 'सहायक से इस रिपोर्ट के बारे में पूछें (शीघ्र उपलब्ध)'
                  : language === 'gu'
                  ? 'સહાયકને આ રિપોર્ટ વિશે પૂછો (ટૂંક સમયમાં ઉપલબ્ધ)'
                  : 'Ask Sahayak about this report (Coming Soon)'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
