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
  Truck,
  Zap,
  Droplets,
  Wifi,
} from 'lucide-react';

import { getFeasibilityReport } from '../api/questionnaire';
import { resolvePricingPillars } from '../utils/pricingPillars';
import { ReportGenerationLoading } from './ReportGenerationLoading';

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
          background: '#0b132b',
          minHeight: '100vh',
          padding: '40px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ReportGenerationLoading
          language={language}
          isComplete={Boolean(report)}
          error={loadError}
          onRetry={fetchReport}
          onCancel={() => onNavigate('dashboard')}
          onFinished={() => setIsLoading(false)}
          minDurationMs={0}
        />
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
        padding: '24px 20px 80px',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ maxWidth: '1480px', width: '100%', margin: '0 auto' }}>
        {/* Top Control Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '24px',
            padding: '18px 24px',
            background: 'rgba(28, 37, 65, 0.75)',
            backdropFilter: 'blur(12px)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
          }}
        >
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#94a3b8',
              padding: '8px 18px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.88rem',
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            <ArrowLeft size={16} />
            <span>{t.dashboard}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {downloadSuccess && (
              <span
                style={{
                  color: '#06d6a0',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                  background: 'rgba(6, 214, 160, 0.1)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(6, 214, 160, 0.3)',
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
                padding: '11px 24px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: isDownloading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(6, 214, 160, 0.35)',
                transition: 'all 0.2s ease',
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
                  <span>{t.downloadPdfBtn || 'Download Advisory Report (PDF)'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Report Hero / Header Banner - No Technical UUIDs */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1c2541 0%, #0f172a 100%)',
            border: '1px solid rgba(6, 214, 160, 0.3)',
            borderRadius: '24px',
            padding: '36px 36px',
            marginBottom: '28px',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.35)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '260px',
              height: '260px',
              background: 'radial-gradient(circle, rgba(6, 214, 160, 0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
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
              }}
            >
              <Sparkles size={14} />
              <span>Sahayak — Business Feasibility Advisory</span>
            </div>

            <span
              style={{
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '0.78rem',
                fontWeight: 700,
              }}
            >
              {metadata.reportStatus || 'Preliminary Feasibility Advisory'}
            </span>
          </div>

          <h1
            style={{
              fontSize: '2.1rem',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.25,
              marginBottom: '14px',
            }}
          >
            {t.reportHeaderTitle || metadata.reportTitle}
          </h1>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '20px',
              fontSize: '0.9rem',
              color: '#94a3b8',
              marginBottom: '20px',
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
                <strong>Assessment Date:</strong>{' '}
                {new Date(metadata.assessmentDate).toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'gu' ? 'gu-IN' : 'en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} color="#06d6a0" />
              <span>
                <strong>Report Generated:</strong>{' '}
                {metadata.reportGeneratedDate
                  ? new Date(metadata.reportGeneratedDate).toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'gu' ? 'gu-IN' : 'en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'gu' ? 'gu-IN' : 'en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.94rem', lineHeight: 1.6, color: '#cbd5e1', maxWidth: '950px', margin: 0 }}>
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
            borderRadius: '14px',
            padding: '8px 12px',
            marginBottom: '28px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            gap: '8px',
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
                  fontSize: '0.82rem',
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
          {/* SECTION 1: EXECUTIVE SUMMARY */}
          <div
            id="report-sec-exec"
            style={{
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              padding: '36px 36px',
              boxShadow: '0 10px 30px rgba(11, 19, 43, 0.08)',
              overflow: 'hidden',
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
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#0b132b' }}>
                {t.section1Nav || 'Section 1: Executive Summary'}
              </h2>
            </div>

            <p style={{ fontSize: '0.98rem', lineHeight: 1.65, color: '#334155', marginBottom: '20px' }}>
              {executiveSummary.businessSummary}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '16px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '18px',
                  borderRadius: '12px',
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
                  padding: '18px',
                  borderRadius: '12px',
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
              <div
                style={{
                  background: 'rgba(6, 214, 160, 0.08)',
                  border: '1px solid rgba(6, 214, 160, 0.3)',
                  padding: '20px',
                  borderRadius: '12px',
                }}
              >
                <div
                  style={{
                    color: '#059669',
                    fontWeight: 700,
                    fontSize: '0.92rem',
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
                  padding: '20px',
                  borderRadius: '12px',
                }}
              >
                <div
                  style={{
                    color: '#dc2626',
                    fontWeight: 700,
                    fontSize: '0.92rem',
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

          {/* SECTION 2: BUSINESS IDEA & LOCAL MARKET ANALYSIS */}
          <div
            id="report-sec-market"
            style={{
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              padding: '36px 36px',
              boxShadow: '0 10px 30px rgba(11, 19, 43, 0.08)',
              overflow: 'hidden',
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
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#0b132b' }}>
                {t.section2Nav || 'Section 2: Business Idea & Local Market Analysis'}
              </h2>
            </div>

            <p style={{ fontSize: '0.96rem', lineHeight: 1.65, color: '#334155', marginBottom: '20px' }}>
              {marketAnalysis.businessDescription}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.92rem', color: '#0b132b', marginBottom: '12px', fontWeight: 700 }}>
                  {t.targetCustomerSegmentsLabel || 'Target Customer Segments'}
                </h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.88rem', lineHeight: 1.6, color: '#475569' }}>
                  {marketAnalysis.targetCustomerSegments.map((seg, idx) => (
                    <li key={idx}>{formatLabel(seg, language)}</li>
                  ))}
                </ul>
              </div>

              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.92rem', color: '#0b132b', marginBottom: '12px', fontWeight: 700 }}>
                  {t.demandDriversLabel || 'Local Demand Drivers'}
                </h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.88rem', lineHeight: 1.6, color: '#475569' }}>
                  {marketAnalysis.demandDrivers.map((d, idx) => (
                    <li key={idx}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* SECTION 3: COMPETITION ANALYSIS */}
          <div
            id="report-sec-comp"
            style={{
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              padding: '36px 36px',
              boxShadow: '0 10px 30px rgba(11, 19, 43, 0.08)',
              overflow: 'hidden',
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
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#0b132b' }}>
                {t.section3Nav || 'Section 3: Local Competition Analysis (5–10 km Radius)'}
              </h2>
            </div>

            <div
              style={{
                background: '#f1f5f9',
                borderLeft: '4px solid #64748b',
                padding: '12px 18px',
                borderRadius: '0 8px 8px 0',
                fontSize: '0.86rem',
                color: '#475569',
                marginBottom: '20px',
              }}
            >
              {competitionAnalysis.methodologyNote}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#0b132b', color: '#ffffff', textAlign: 'left' }}>
                    <th style={{ padding: '12px 14px' }}>Competitor Profile</th>
                    <th style={{ padding: '12px 14px' }}>Format / Distance</th>
                    <th style={{ padding: '12px 14px' }}>Competitive Offering</th>
                    <th style={{ padding: '12px 14px' }}>{t.differentiationStrategyLabel || 'Differentiation Strategy'}</th>
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
                      <td style={{ padding: '14px', fontWeight: 600, color: '#0f172a' }}>
                        {comp.name}
                      </td>
                      <td style={{ padding: '14px', color: '#64748b' }}>
                        {formatLabel(comp.type, language)} — {comp.distance}
                      </td>
                      <td style={{ padding: '14px', color: '#334155' }}>{comp.competitiveOffering}</td>
                      <td style={{ padding: '14px', color: '#059669', fontWeight: 600 }}>
                        {comp.differentiationStrategy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 4: PRICING & PRODUCT STRATEGY (6 VERTICAL PILLARS) */}
          <div
            id="report-sec-pricing"
            style={{
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              padding: '36px 36px',
              boxShadow: '0 10px 30px rgba(11, 19, 43, 0.08)',
              overflow: 'hidden',
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
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#0b132b' }}>
                {t.section4Nav || 'Section 4: Pricing & Product Category Strategy'}
              </h2>
            </div>

            <p style={{ fontSize: '0.96rem', lineHeight: 1.65, color: '#334155', marginBottom: '24px' }}>
              {pricingProductStrategy.pricingApproach}
            </p>

            {/* 6 Structured Vertical Pillars */}
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0b132b', marginBottom: '16px' }}>
                {language === 'hi'
                  ? 'रणनीतिक उत्पाद एवं मूल्य निर्धारण स्तंभ (6 श्रेणियां)'
                  : language === 'gu'
                  ? 'વ્યૂહાત્મક ઉત્પાદન અને ભાવ નિર્ધારણ સ્તંભો (6 શ્રેણીઓ)'
                  : 'Strategic Category Execution (6 Pillars)'}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
                {resolvePricingPillars(pricingProductStrategy.pricingPillars, language).map((pillar, pIdx) => (
                  <div
                    key={pIdx}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '0.94rem',
                          color: '#0b132b',
                          marginBottom: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <span
                          style={{
                            background: '#0b132b',
                            color: '#06d6a0',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {pillar.pillarNumber || pIdx + 1}
                        </span>
                        <span>{pillar.title.replace(/^\d+\.\s*/, '')}</span>
                      </div>
                      <div
                        style={{
                          fontSize: '0.88rem',
                          color: '#1e293b',
                          lineHeight: 1.55,
                          marginBottom: '12px',
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '10px 12px',
                        }}
                      >
                        <strong
                          style={{
                            color: '#0b132b',
                            display: 'block',
                            marginBottom: '3px',
                            fontSize: '0.82rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.03em',
                          }}
                        >
                          {language === 'hi'
                            ? 'अनुशंसित दृष्टिकोण (Recommended Approach):'
                            : language === 'gu'
                            ? 'ભલામણ કરેલ અભિગમ (Recommended Approach):'
                            : 'Recommended Approach:'}
                        </strong>
                        <span>{pillar.recommendedApproach || pillar.approach}</span>
                      </div>
                    </div>
                    {pillar.whyItMatters && (
                      <div
                        style={{
                          fontSize: '0.83rem',
                          color: '#065f46',
                          background: 'rgba(6, 214, 160, 0.1)',
                          border: '1px solid rgba(6, 214, 160, 0.25)',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          lineHeight: 1.45,
                        }}
                      >
                        <strong
                          style={{
                            display: 'block',
                            marginBottom: '2px',
                            fontSize: '0.78rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.03em',
                            color: '#047857',
                          }}
                        >
                          {language === 'hi'
                            ? 'व्यावसायिक महत्व (Why It Matters):'
                            : language === 'gu'
                            ? 'વ્યવસાયિક મહત્વ (Why It Matters):'
                            : 'Why it matters:'}
                        </strong>
                        <span>{pillar.whyItMatters}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Inventory Mix Table */}
            <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#0b132b', color: '#ffffff', textAlign: 'left' }}>
                    <th style={{ padding: '12px 14px' }}>Product Category</th>
                    <th style={{ padding: '12px 14px' }}>{t.turnoverVelocityLabel || 'Turnover Velocity'}</th>
                    <th style={{ padding: '12px 14px' }}>{t.grossMarginRangeLabel || 'Target Gross Margin Range'}</th>
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
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>{formatLabel(inv.category, language)}</td>
                      <td style={{ padding: '12px 14px', color: '#059669', fontWeight: 600 }}>
                        {inv.turnover}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#1e293b' }}>{inv.margin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '16px 20px',
                borderRadius: '10px',
                fontSize: '0.9rem',
                color: '#334155',
              }}
            >
              <strong>{t.workingCapitalDisciplineLabel || 'Working Capital & Credit Discipline'}:</strong>{' '}
              {pricingProductStrategy.workingCapitalDiscipline}
            </div>
          </div>

          {/* SECTION 5: FINANCIAL FEASIBILITY (REAL BACKEND ENGINE & DETERMINISTIC CALCULATIONS) */}
          <div
            id="report-sec-finance"
            style={{
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              padding: '36px 36px',
              boxShadow: '0 10px 30px rgba(11, 19, 43, 0.08)',
              overflow: 'hidden',
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
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Coins size={22} color="#059669" />
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#0b132b' }}>
                  {t.section5Nav || 'Section 5: Financial Feasibility & Scheme Structure'}
                </h2>
              </div>
              <span
                style={{
                  background: 'rgba(6, 214, 160, 0.15)',
                  color: '#059669',
                  padding: '6px 14px',
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
              >
                Deterministic Financial Engine (Single Source of Truth)
              </span>
            </div>

            {/* Financial Summary & Breakdown Table */}
            <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#0b132b', color: '#ffffff', textAlign: 'left' }}>
                    <th style={{ padding: '12px 14px' }}>Financial Feasibility Metric</th>
                    <th style={{ padding: '12px 14px' }}>Value</th>
                    <th style={{ padding: '12px 14px' }}>Scheme Parameter / Rule</th>
                    <th style={{ padding: '12px 14px' }}>Specification Detail</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>Total Project Cost</td>
                    <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0b132b', fontSize: '1rem' }}>
                      ₹{(projectCost || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#64748b' }}>Financing Scheme</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0b132b' }}>
                      {financialFeasibility.schemeName || 'Term Loan Scheme'}
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#334155' }}>Maximum Scheme Financing</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#2563eb' }}>
                      ₹{(financialFeasibility.maximumSchemeFinancing || Math.round(projectCost * 0.9)).toLocaleString('en-IN')} (90%)
                    </td>
                    <td style={{ padding: '12px 14px', color: '#64748b' }}>Scheme Loan Cap</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a' }}>
                      ₹{(financialFeasibility.schemeLoanCap || 4500000).toLocaleString('en-IN')}
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#059669' }}>Final Eligible Loan</td>
                    <td style={{ padding: '12px 14px', fontWeight: 800, color: '#059669', fontSize: '1.05rem' }}>
                      ₹{(financialFeasibility.finalEligibleLoan || financialFeasibility.baseLoanAmount || 3330000).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#64748b' }}>Annual Interest Rate</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a' }}>
                      {financialFeasibility.annualInterestRate || '8.0%'} (Fixed)
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#334155' }}>Required Own Contribution (10%)</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0b132b' }}>
                      ₹{(financialFeasibility.requiredOwnContribution || 370000).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#64748b' }}>Repayment Frequency</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a' }}>
                      {financialFeasibility.repaymentFrequency || 'Quarterly'}
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#334155' }}>Applicant's Own Contribution</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: isMarginCompliant ? '#059669' : '#d97706' }}>
                      ₹{(ownContribution || 0).toLocaleString('en-IN')} ({financialFeasibility.actualContributionPercentage || 8.11}%)
                    </td>
                    <td style={{ padding: '12px 14px', color: '#64748b' }}>Tenure & Moratorium</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a' }}>
                      {financialFeasibility.totalTenureMonths || 84} Mo Total ({financialFeasibility.moratoriumMonths || 6} Mo Moratorium)
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: isMarginCompliant ? '#059669' : '#dc2626' }}>
                      Contribution Shortfall
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 800, color: isMarginCompliant ? '#059669' : '#dc2626' }}>
                      {(shortfall ?? 0) > 0 ? `₹${(shortfall ?? 0).toLocaleString('en-IN')}` : '₹0 (Requirement Met)'}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#64748b' }}>Active Repayment Periods</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a' }}>
                      {financialFeasibility.activeRepaymentsCount || 26} Quarterly Installments ({financialFeasibility.activeRepaymentPeriodMonths || 78} Months)
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#64748b' }}>Requested Funding Gap</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#64748b' }}>
                      ₹{(financialFeasibility.requestedFundingGap || 3400003).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#64748b' }}>Quarterly Installment</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#7c3aed' }}>
                      ₹{Number(financialFeasibility.installmentAmount || 166667).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Own Contribution Alert Badge */}
            <div
              style={{
                marginBottom: '28px',
                background: isMarginCompliant ? 'rgba(6, 214, 160, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                border: `1px solid ${isMarginCompliant ? 'rgba(6, 214, 160, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                padding: '18px 22px',
                borderRadius: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isMarginCompliant ? (
                    <CheckCircle2 size={20} color="#059669" />
                  ) : (
                    <AlertTriangle size={20} color="#dc2626" />
                  )}
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: isMarginCompliant ? '#059669' : '#dc2626' }}>
                    {isMarginCompliant
                      ? '✓ Meets 10% Minimum Own Contribution Requirement'
                      : `Contribution requirement not yet met — Margin Shortfall of ₹${(shortfall ?? 0).toLocaleString('en-IN')}`}
                  </span>
                </div>
                <span style={{ fontSize: '0.84rem', color: '#64748b' }}>
                  Required (10%): ₹{(financialFeasibility.requiredOwnContribution || 370000).toLocaleString('en-IN')} | Actual: ₹{(ownContribution || 0).toLocaleString('en-IN')} ({financialFeasibility.actualContributionPercentage || 8.11}%)
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: '#475569', lineHeight: 1.5 }}>
                {isMarginCompliant
                  ? 'The applicant satisfies the institutional margin requirements.'
                  : `The applicant currently provides ₹${(ownContribution || 0).toLocaleString('en-IN')} (~${financialFeasibility.actualContributionPercentage || 8.11}%), leaving a ₹${(shortfall || 70003).toLocaleString('en-IN')} shortfall before the full 90% scheme loan (₹33,30,000) can be disbursed by the lending institution.`}
              </p>
            </div>

            {/* VISUAL 1: FUNDING STRUCTURE CHART */}
            <div style={{ marginBottom: '32px', background: '#f8fafc', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0b132b' }}>
                  Visual 1: Project Outlay & Funding Composition
                </h4>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Deterministic Values</span>
              </div>

              {/* Stacked Horizontal Visualization Bar */}
              <div style={{ height: '36px', display: 'flex', borderRadius: '8px', overflow: 'hidden', background: '#e2e8f0', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)', marginBottom: '12px' }}>
                <div
                  style={{
                    width: '90%',
                    background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                  title="Final Eligible Bank Loan (90%): ₹33,30,000"
                >
                  Eligible Bank Loan (90%): ₹{(financialFeasibility.finalEligibleLoan || 3330000).toLocaleString('en-IN')}
                </div>
                <div
                  style={{
                    width: '8.11%',
                    background: '#06d6a0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#064e3b',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                  title="Actual Own Contribution: ₹2,99,997 (8.11%)"
                >
                  Own: 8.1%
                </div>
                <div
                  style={{
                    width: '1.89%',
                    background: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                  }}
                  title="Shortfall: ₹70,003 (1.89%)"
                >
                  !
                </div>
              </div>

              {/* Legend & Breakdown Chips */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '12px' }}>
                <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb' }} />
                    Eligible Scheme Loan (90%)
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>
                    ₹{(financialFeasibility.finalEligibleLoan || 3330000).toLocaleString('en-IN')}
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#059669' }} />
                    Required Contribution (10%)
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                    ₹{(financialFeasibility.requiredOwnContribution || 370000).toLocaleString('en-IN')}
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#06d6a0' }} />
                    Actual Contribution ({financialFeasibility.actualContributionPercentage || 8.11}%)
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    ₹{(ownContribution || 299997).toLocaleString('en-IN')}
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                    Contribution Shortfall
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#dc2626', marginTop: '2px' }}>
                    ₹{(shortfall || 70003).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* DSCR & CASH FLOW CAPACITY SECTION */}
            <div style={{ marginBottom: '28px', background: '#f8fafc', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0b132b' }}>
                  Debt Service Coverage Ratio (DSCR) & Cash Flow Capacity
                </h4>
                {financialFeasibility.dscrIsIllustrative && (
                  <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 700 }}>
                    Illustrative demo cash-flow assumption — not user-entered
                  </span>
                )}
              </div>

              {financialFeasibility.demoCashFlow ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>Monthly Revenue (Demo Benchmark)</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0b132b', marginTop: '2px' }}>
                        ₹{financialFeasibility.demoCashFlow.monthlyRevenue.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>Monthly Operating Costs</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0b132b', marginTop: '2px' }}>
                        ₹{financialFeasibility.demoCashFlow.monthlyOperatingCost.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>Annual Cash Available (Surplus × 12)</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
                        ₹{financialFeasibility.demoCashFlow.annualCashAvailable.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>Annual Debt Service (Installment × 4)</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#2563eb', marginTop: '2px' }}>
                        ₹{financialFeasibility.demoCashFlow.annualDebtService.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>Calculated DSCR</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: financialFeasibility.dscr && Number(financialFeasibility.dscr) >= 1.25 ? '#059669' : '#d97706', marginTop: '2px' }}>
                        {financialFeasibility.dscr !== null ? `${financialFeasibility.dscr}x` : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
                    <strong>Advisory Explanation:</strong> {financialFeasibility.dscrExplanation}
                  </p>
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b', lineHeight: 1.5 }}>
                  {financialFeasibility.dscrExplanation || 'Awaiting actual operating revenue and cost inputs from the entrepreneur.'}
                </p>
              )}
            </div>

            {/* VISUAL 2: REPAYMENT SCHEDULE & AMORTIZATION OVERVIEW */}
            {financialFeasibility.repaymentSchedule && financialFeasibility.repaymentSchedule.length > 0 ? (
              <div style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0b132b' }}>
                      Visual 2: Repayment Amortization Schedule (28 Periods: 2 Moratorium + 26 Active)
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Quarterly installments reconciled to ₹0.00 closing principal
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowFullSchedule(!showFullSchedule)}
                    style={{
                      background: '#ffffff',
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
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    }}
                  >
                    {showFullSchedule ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    <span>{showFullSchedule ? (t.hideScheduleBtn || 'Hide Full Schedule Table') : `View Full Schedule Table (${financialFeasibility.repaymentSchedule.length} Quarters)`}</span>
                  </button>
                </div>

                {/* Schedule Summary Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>Quarterly Installment (Q3–Q28)</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#7c3aed' }}>
                      ₹{Number(financialFeasibility.installmentAmount || 166667).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>Moratorium Interest (Q1–Q2)</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#2563eb' }}>
                      ₹{Number(financialFeasibility.repaymentSchedule[0]?.interestPayment || 66600).toLocaleString('en-IN')} / quarter
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>Total Repayment Over 84 Mo</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#059669' }}>
                      ₹{financialFeasibility.totalRepaymentAmount ? Number(financialFeasibility.totalRepaymentAmount).toLocaleString('en-IN') : '₹44,66,540'}
                    </div>
                  </div>
                </div>

                {showFullSchedule && (
                  <div style={{ marginTop: '14px', overflowX: 'auto', maxHeight: '420px', overflowY: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                      <thead style={{ position: 'sticky', top: 0, background: '#0b132b', color: '#ffffff' }}>
                        <tr>
                          <th style={{ padding: '10px' }}>Quarter #</th>
                          <th style={{ padding: '10px' }}>Stage</th>
                          <th style={{ padding: '10px' }}>Opening Balance</th>
                          <th style={{ padding: '10px' }}>Principal Repaid</th>
                          <th style={{ padding: '10px' }}>Interest</th>
                          <th style={{ padding: '10px' }}>Installment Amount</th>
                          <th style={{ padding: '10px' }}>Closing Principal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {financialFeasibility.repaymentSchedule.map((item: any, idx: number) => {
                          const isMoratorium = item.isMoratorium || idx < 2;
                          return (
                            <tr
                              key={idx}
                              style={{
                                borderBottom: '1px solid #e2e8f0',
                                textAlign: 'center',
                                background: isMoratorium ? '#fef3c7' : (idx % 2 === 0 ? '#ffffff' : '#f8fafc'),
                              }}
                            >
                              <td style={{ padding: '8px', fontWeight: 600 }}>Q{item.sequenceNumber}</td>
                              <td style={{ padding: '8px', fontSize: '0.75rem', fontWeight: 700, color: isMoratorium ? '#b45309' : '#059669' }}>
                                {isMoratorium ? 'Moratorium' : 'Active Repayment'}
                              </td>
                              <td style={{ padding: '8px' }}>₹{Number(item.openingPrincipal).toLocaleString('en-IN')}</td>
                              <td style={{ padding: '8px' }}>₹{Number(item.principalPayment).toLocaleString('en-IN')}</td>
                              <td style={{ padding: '8px' }}>₹{Number(item.interestPayment).toLocaleString('en-IN')}</td>
                              <td style={{ padding: '8px', fontWeight: 700, color: '#0b132b' }}>₹{Number(item.installmentAmount).toLocaleString('en-IN')}</td>
                              <td style={{ padding: '8px', fontWeight: idx === financialFeasibility.repaymentSchedule.length - 1 ? 800 : 400, color: idx === financialFeasibility.repaymentSchedule.length - 1 ? '#059669' : '#0f172a' }}>
                                ₹{Number(item.closingPrincipal).toLocaleString('en-IN')}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '14px 18px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.88rem', color: '#64748b' }}>
                ℹ️ <strong>Amortization Schedule:</strong> Repayment schedule requires confirmed moratorium-interest treatment.
              </div>
            )}

            {/* Disclaimer */}
            <div
              style={{
                marginTop: '24px',
                padding: '14px 18px',
                background: '#fef3c7',
                borderLeft: '4px solid #f59e0b',
                color: '#92400e',
                fontSize: '0.82rem',
                lineHeight: 1.55,
                borderRadius: '0 8px 8px 0',
              }}
            >
              <strong>{t.disclaimerLabel || 'Financial Disclaimer'}:</strong> {financialFeasibility.disclaimer}
            </div>
          </div>

          {/* SECTION 6: SWOT ANALYSIS */}
          <div
            id="report-sec-swot"
            style={{
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              padding: '36px 36px',
              boxShadow: '0 10px 30px rgba(11, 19, 43, 0.08)',
              overflow: 'hidden',
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
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#0b132b' }}>
                {t.section6Nav || 'Section 6: SWOT Analysis'}
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '20px', borderRadius: '12px' }}>
                <h4 style={{ color: '#047857', fontWeight: 700, fontSize: '0.95rem', marginBottom: '12px' }}>
                  {t.swotStrengthsLabel || 'Strengths (Internal)'}
                </h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.88rem', lineHeight: 1.6, color: '#064e3b' }}>
                  {swotAnalysis.strengths.map((s, i) => (
                    <li key={i}>{formatLabel(s, language)}</li>
                  ))}
                </ul>
              </div>

              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '20px', borderRadius: '12px' }}>
                <h4 style={{ color: '#b45309', fontWeight: 700, fontSize: '0.95rem', marginBottom: '12px' }}>
                  {t.swotWeaknessesLabel || 'Weaknesses (Internal)'}
                </h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.88rem', lineHeight: 1.6, color: '#78350f' }}>
                  {swotAnalysis.weaknesses.map((w, i) => (
                    <li key={i}>{formatLabel(w, language)}</li>
                  ))}
                </ul>
              </div>

              <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', padding: '20px', borderRadius: '12px' }}>
                <h4 style={{ color: '#0f766e', fontWeight: 700, fontSize: '0.95rem', marginBottom: '12px' }}>
                  {t.swotOpportunitiesLabel || 'Opportunities (External)'}
                </h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.88rem', lineHeight: 1.6, color: '#134e4a' }}>
                  {swotAnalysis.opportunities.map((o, i) => (
                    <li key={i}>{formatLabel(o, language)}</li>
                  ))}
                </ul>
              </div>

              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '20px', borderRadius: '12px' }}>
                <h4 style={{ color: '#b91c1c', fontWeight: 700, fontSize: '0.95rem', marginBottom: '12px' }}>
                  {t.swotThreatsLabel || 'Threats (External)'}
                </h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.88rem', lineHeight: 1.6, color: '#7f1d1d' }}>
                  {swotAnalysis.threats.map((th, i) => (
                    <li key={i}>{formatLabel(th, language)}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* SECTION 7: RISK ANALYSIS & MITIGATION */}
          <div
            id="report-sec-risks"
            style={{
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              padding: '36px 36px',
              boxShadow: '0 10px 30px rgba(11, 19, 43, 0.08)',
              overflow: 'hidden',
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
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#0b132b' }}>
                {t.section7Nav || 'Section 7: Risk Analysis & Mitigation Framework'}
              </h2>
            </div>

            {/* Special Highlight Card: Customer Credit Defaults */}
            <div
              style={{
                marginBottom: '24px',
                background: '#fff7ed',
                border: '1px solid #fdba74',
                borderRadius: '14px',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={20} color="#ea580c" />
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: '#c2410c' }}>
                    Key Operational Risk: Customer Credit Defaults
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ background: '#fed7aa', color: '#9a3412', padding: '2px 8px', borderRadius: '10px', fontSize: '0.74rem', fontWeight: 700 }}>
                    Likelihood: Moderate
                  </span>
                  <span style={{ background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: '10px', fontSize: '0.74rem', fontWeight: 700 }}>
                    Impact: High
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.88rem', color: '#7c2d12', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                <strong>Why it matters:</strong> Uncontrolled customer credit books lock up retail working capital, drain cash buffers needed for debt service, and create systemic default risks in rural communities.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #fed7aa' }}>
                  <strong style={{ fontSize: '0.82rem', color: '#059669', display: 'block', marginBottom: '6px' }}>
                    Actionable Mitigation Protocols:
                  </strong>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.82rem', lineHeight: 1.5, color: '#334155' }}>
                    <li>Set strict household-specific credit limits (₹500–₹1,500 max).</li>
                    <li>Digitally record all ledger credit transactions immediately.</li>
                    <li>Enforce a mandatory 15-day settlement cycle before new credit.</li>
                    <li>Never allow outstanding credit to grow indefinitely.</li>
                  </ul>
                </div>

                <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #fed7aa' }}>
                  <strong style={{ fontSize: '0.82rem', color: '#2563eb', display: 'block', marginBottom: '6px' }}>
                    Monitoring & Control Indicators:
                  </strong>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.82rem', lineHeight: 1.5, color: '#334155' }}>
                    <li>Total outstanding receivables as a % of monthly sales (&lt;10%).</li>
                    <li>Ageing analysis of overdue accounts exceeding 30 days.</li>
                    <li>Weekly count of flagged overdue household accounts.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* General Risk Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ background: '#0b132b', color: '#ffffff', textAlign: 'left' }}>
                    <th style={{ padding: '12px 14px' }}>{t.riskFactorLabel || 'Risk Factor'}</th>
                    <th style={{ padding: '12px 14px' }}>{t.likelihoodImpactLabel || 'Likelihood / Impact'}</th>
                    <th style={{ padding: '12px 14px' }}>{t.mitigationStrategyLabel || 'Mitigation Strategy'}</th>
                    <th style={{ padding: '12px 14px' }}>{t.monitoringIndicatorLabel || 'Monitoring Indicator'}</th>
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
                      <td style={{ padding: '14px', fontWeight: 600, color: '#0f172a' }}>
                        {formatLabel(r.risk, language)}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span
                          style={{
                            background: r.impact === 'High' ? '#fee2e2' : '#fef3c7',
                            color: r.impact === 'High' ? '#dc2626' : '#d97706',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                          }}
                        >
                          {r.likelihood} / {r.impact}
                        </span>
                      </td>
                      <td style={{ padding: '14px', color: '#334155' }}>{r.mitigationStrategy}</td>
                      <td style={{ padding: '14px', color: '#059669', fontSize: '0.82rem' }}>
                        {r.monitoringIndicator}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 8: INFRASTRUCTURE & GROUND REALITY */}
          <div
            id="report-sec-infra"
            style={{
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              padding: '36px 36px',
              boxShadow: '0 10px 30px rgba(11, 19, 43, 0.08)',
              overflow: 'hidden',
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
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#0b132b' }}>
                {t.section8Nav || 'Section 8: Infrastructure & Ground Reality Assessment (Sahayak)'}
              </h2>
            </div>

            {/* Top Ratings Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Truck size={22} color="var(--brand-green)" />
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Road & Transport</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
                    {formatLabel(infrastructureAssessment.roadTransport, language)}
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Zap size={22} color="#f59e0b" />
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Electricity Availability</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
                    {formatLabel(infrastructureAssessment.electricity, language)}
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Droplets size={22} color="#3b82f6" />
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Water Supply</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
                    {formatLabel(infrastructureAssessment.water, language)}
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Wifi size={22} color="#8b5cf6" />
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Internet / Mobile</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
                    {formatLabel(infrastructureAssessment.internet, language)}
                  </div>
                </div>
              </div>
            </div>

            {/* Findings & Recommended Actions */}
            <div style={{ marginTop: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#0b132b', marginBottom: '16px' }}>
                {t.infrastructureFindingsTitle || 'Infrastructure Findings & Recommended Actions'}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {infraActionItems.map((item: any) => (
                  <div
                    key={item.facilityKey}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0b132b' }}>
                          {item.facilityName}
                        </span>
                        <span
                          style={{
                            background: item.priority === 'High' ? '#fee2e2' : item.priority === 'Medium' ? '#fef3c7' : '#ecfdf5',
                            color: item.priority === 'High' ? '#dc2626' : item.priority === 'Medium' ? '#d97706' : '#047857',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                          }}
                        >
                          {item.priority} Priority
                        </span>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px' }}>
                        <strong>User Rating:</strong> {item.ratingLabel}
                      </div>

                      <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.5, marginBottom: '10px' }}>
                        <strong>{t.businessImpactLabel || 'Business Impact'}:</strong> {item.impact}
                      </p>

                      <div>
                        <strong style={{ fontSize: '0.82rem', color: '#059669', display: 'block', marginBottom: '4px' }}>
                          {t.recommendedActionsLabel || 'Recommended Actions'}:
                        </strong>
                        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.8rem', lineHeight: 1.5, color: '#475569' }}>
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
          </div>

          {/* SECTION: OTHER GOVERNMENT SCHEMES & SUPPORT */}
          <div
            style={{
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              padding: '36px 36px',
              boxShadow: '0 10px 30px rgba(11, 19, 43, 0.08)',
              overflow: 'hidden',
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
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building2 size={22} color="#0b132b" />
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#0b132b' }}>
                  Other Government Schemes & Support Mechanisms
                </h2>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Verified Official Government Sources
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              {(report.otherGovernmentSchemes || [
                {
                  schemeName: 'Pradhan Mantri Mudra Yojana (PMMY) – Kishor / Tarun',
                  department: 'Department of Financial Services, Ministry of Finance, Government of India',
                  purpose: 'Provides collateral-free institutional credit for micro/small retail enterprises up to ₹10 Lakhs.',
                  assistanceType: 'Refinance and collateral-free micro credit through Member Lending Institutions (MLIs)',
                  eligibilityConditions: 'Non-farm, non-corporate micro/small enterprises; creditworthy business proposal; KYC and banking compliance.',
                  assessmentStatus: 'Potentially eligible for micro-retail credit within ₹10 Lakhs cap.',
                  why: 'The applicant is establishing a micro-retail enterprise in Gujarat. While the ₹37 Lakhs project outlay exceeds the single PMMY ceiling, the working capital/equipment portion up to ₹10L is eligible for collateral-free Mudra credit.',
                  officialUrl: 'https://www.mudra.org.in',
                  lastVerified: 'September 2026',
                },
                {
                  schemeName: 'Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)',
                  department: 'Ministry of MSME, Govt of India & SIDBI',
                  purpose: 'Enables collateral-free credit delivery to micro and small enterprises by guaranteeing institutional term loans and working capital.',
                  assistanceType: 'Credit guarantee cover (75% to 85% coverage up to ₹500 Lakhs) to lending institutions.',
                  eligibilityConditions: 'New or existing Micro and Small Enterprises engaged in retail trade, services, or manufacturing with valid Udyam Registration.',
                  assessmentStatus: 'Potentially eligible for MLI institutional credit guarantee.',
                  why: 'Retail trade enterprises with MSME Udyam registration qualify for CGTMSE coverage under participating scheduled commercial and rural banks.',
                  officialUrl: 'https://www.cgtmse.in',
                  lastVerified: 'September 2026',
                },
              ]).map((gov, gIdx) => (
                <div
                  key={gIdx}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0b132b' }}>
                        {gov.schemeName}
                      </h4>
                      <span
                        style={{
                          background: 'rgba(6, 214, 160, 0.12)',
                          color: '#059669',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {gov.assessmentStatus}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '10px' }}>
                      <strong>Agency:</strong> {gov.department}
                    </div>

                    <p style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.5, marginBottom: '10px' }}>
                      <strong>Purpose & Assistance:</strong> {gov.purpose} ({gov.assistanceType})
                    </p>

                    <div style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, marginBottom: '12px' }}>
                      <strong>Advisory Assessment:</strong> {gov.why}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Verified: {gov.lastVerified}</span>
                    <a
                      href={gov.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#2563eb',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      <span>Official Portal</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic', background: '#f1f5f9', padding: '12px 16px', borderRadius: '8px' }}>
              Note: Standalone grocery retail businesses have specific trading restrictions under PMEGP; therefore PMEGP is not automatically presented as a direct grant without verified secondary processing activities.
            </div>
          </div>

          {/* SECTION 9: SUPPORT ORGANIZATIONS */}
          <div
            id="report-sec-ngos"
            style={{
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              padding: '36px 36px',
              boxShadow: '0 10px 30px rgba(11, 19, 43, 0.08)',
              overflow: 'hidden',
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
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#0b132b' }}>
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

          {/* SECTION 10: CURATED YOUTUBE RESOURCES */}
          <div
            id="report-sec-videos"
            style={{
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              padding: '36px 36px',
              boxShadow: '0 10px 30px rgba(11, 19, 43, 0.08)',
              overflow: 'hidden',
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
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#0b132b' }}>
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

          {/* SECTION 11: ACTION PLAN */}
          <div
            id="report-sec-action"
            style={{
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              padding: '36px 36px',
              boxShadow: '0 10px 30px rgba(11, 19, 43, 0.08)',
              overflow: 'hidden',
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
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#0b132b' }}>
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
                    padding: '16px 20px',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background: '#0b132b',
                      color: '#06d6a0',
                      fontWeight: 800,
                      fontSize: '0.88rem',
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
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0b132b' }}>
                        {act.title}
                      </div>
                      <span
                        style={{
                          background: '#e0f2fe',
                          color: '#0369a1',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                        }}
                      >
                        {act.duration}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.86rem', color: '#475569', margin: '4px 0 0', lineHeight: 1.5 }}>
                      {act.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 12: CONCLUSION & ADVISORY DISCLAIMERS */}
          <div
            id="report-sec-conclusion"
            style={{
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              padding: '36px 36px',
              boxShadow: '0 10px 30px rgba(11, 19, 43, 0.08)',
              overflow: 'hidden',
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
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#0b132b' }}>
                {t.section12Nav || 'Section 12: Conclusion & Advisory Disclaimers'}
              </h2>
            </div>

            <p style={{ fontSize: '0.96rem', lineHeight: 1.65, color: '#1e293b', fontWeight: 500, marginBottom: '20px' }}>
              {conclusionAndLimitations.conclusion}
            </p>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '18px 22px',
                borderRadius: '12px',
              }}
            >
              <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                {t.limitationsTitle || 'Demonstration Methodology Limitations:'}
              </h4>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.55 }}>
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
              borderRadius: '24px',
              padding: '36px',
              textAlign: 'center',
              boxShadow: '0 12px 28px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(6, 214, 160, 0.15)',
                color: '#06d6a0',
                marginBottom: '12px',
              }}
            >
              <Bot size={26} />
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
              {language === 'hi'
                ? 'क्या आप इस रिपोर्ट के बारे में कुछ और पूछना चाहते हैं?'
                : language === 'gu'
                ? 'શું તમને આ રિપોર્ટ વિશે વધુ પ્રશ્નો છે?'
                : 'Have more questions about your report?'}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', maxWidth: '540px', margin: '0 auto 20px', lineHeight: 1.5 }}>
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
                padding: '11px 26px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.9rem',
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

