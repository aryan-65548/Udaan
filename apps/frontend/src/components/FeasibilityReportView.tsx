import React, { useState, useEffect, useCallback } from 'react';
import type { FeasibilityReportData } from '../api/questionnaire';
import { recordReportDownload } from '../api/questionnaire';
import { generateFeasibilityReportPdf } from '../utils/pdfGenerator';
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
          Generating Feasibility Intelligence Report
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto' }}>
          Sahayak is assembling your deterministic financial projections, local market benchmarks, and operational risk assessment.
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
          {loadError ? 'Feasibility Report Unavailable' : 'Report Snapshot Not Available'}
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.5 }}>
          {loadError || 'The feasibility report has not been generated for this assessment. Please ensure that the assessment setup, financial inputs, and Sahayak questionnaire are completed.'}
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
              <span>Generate / Refresh Report</span>
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onNavigate('dashboard')}
            style={{ padding: '10px 20px' }}
          >
            <ArrowLeft size={16} />
            <span>Return to Dashboard</span>
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
      // 1. Generate and download PDF on client
      generateFeasibilityReportPdf(report);

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
    { id: 'exec', label: '1. Executive Summary' },
    { id: 'market', label: '2. Market Analysis' },
    { id: 'comp', label: '3. Competition' },
    { id: 'pricing', label: '4. Pricing & Products' },
    { id: 'finance', label: '5. Financial Feasibility' },
    { id: 'swot', label: '6. SWOT Analysis' },
    { id: 'risks', label: '7. Risks & Mitigation' },
    { id: 'infra', label: '8. Infrastructure' },
    { id: 'ngos', label: '9. Support Organizations' },
    { id: 'videos', label: '10. Learning Resources' },
    { id: 'action', label: '11. Action Plan' },
    { id: 'conclusion', label: '12. Conclusion' },
  ];

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(`report-sec-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const projectCost = financialFeasibility?.projectCost || 0;
  const ownContribution = financialFeasibility?.ownContribution || 0;
  const loanAmount = financialFeasibility?.baseLoanAmount || Math.max(0, projectCost - ownContribution);
  const ownPercent = projectCost > 0 ? Math.round((ownContribution / projectCost) * 100) : 10;
  const loanPercent = Math.max(0, 100 - ownPercent);

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
            <span>Dashboard</span>
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
                <span>PDF Downloaded & Assessment Marked Complete!</span>
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
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span>Download Complete Report (PDF)</span>
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
          {/* Subtle Glow Orb */}
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
            {metadata.reportTitle}
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
                <strong>Category:</strong> {metadata.businessCategory}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16} color="#06d6a0" />
              <span>
                <strong>Location:</strong> {metadata.location}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} color="#06d6a0" />
              <span>
                <strong>Assessment Date:</strong>{' '}
                {new Date(metadata.assessmentDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* AI Advisor Conversational Greeting Box */}
          <div
            style={{
              background: 'rgba(11, 19, 43, 0.6)',
              borderLeft: '4px solid #06d6a0',
              padding: '16px 20px',
              borderRadius: '0 10px 10px 0',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              color: '#e2e8f0',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <Bot size={22} color="#06d6a0" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, color: '#06d6a0', marginBottom: '2px' }}>
                Sahayak Advisor Synthesis
              </div>
              <div>{metadata.aiAdvisorGreeting}</div>
            </div>
          </div>
        </div>

        {/* Sticky Table of Contents Quick Nav */}
        <div
          style={{
            position: 'sticky',
            top: '12px',
            zIndex: 40,
            background: 'rgba(28, 37, 65, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '8px 12px',
            marginBottom: '28px',
            display: 'flex',
            overflowX: 'auto',
            gap: '8px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          }}
        >
          {sectionsNav.map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => scrollToSection(sec.id)}
              style={{
                background: activeTab === sec.id ? '#06d6a0' : 'transparent',
                color: activeTab === sec.id ? '#0b132b' : '#94a3b8',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: activeTab === sec.id ? 700 : 500,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {sec.label}
            </button>
          ))}
        </div>

        {/* Main 12 Report Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
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
                Section 1: Executive Summary
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
                  Target Customers
                </div>
                <div style={{ fontSize: '0.92rem', color: '#0f172a', fontWeight: 600 }}>
                  {executiveSummary.targetCustomerSegment}
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
                  Financial Viability Snapshot
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
                  <span>Key Commercial Strengths</span>
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
                  <span>Critical Watchpoints</span>
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
                Section 2: Business Idea & Local Market Analysis
              </h2>
            </div>

            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#334155', marginBottom: '20px' }}>
              {marketAnalysis.businessDescription}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {/* Target Customer Segments */}
              <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#0b132b', marginBottom: '10px' }}>
                  Target Customer Segments
                </h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.86rem', lineHeight: 1.55, color: '#475569' }}>
                  {marketAnalysis.targetCustomerSegments.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>

              {/* Demand Drivers */}
              <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#0b132b', marginBottom: '10px' }}>
                  Local Demand Drivers
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
                Section 3: Local Competition Analysis (5–10 km Radius)
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
                    <th style={{ padding: '10px 12px' }}>Differentiation Strategy</th>
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
                        <div>{comp.type}</div>
                        <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>
                          {comp.distance}
                        </div>
                      </td>
                      <td style={{ padding: '12px', color: '#334155' }}>{comp.competitiveOffering}</td>
                      <td style={{ padding: '12px', color: '#059669', fontWeight: 500 }}>
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
                Section 4: Pricing & Product Strategy
              </h2>
            </div>

            <p style={{ fontSize: '0.94rem', lineHeight: 1.6, color: '#334155', marginBottom: '20px' }}>
              {pricingProductStrategy.pricingApproach}
            </p>

            <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#0b132b', color: '#ffffff', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>Product Category</th>
                    <th style={{ padding: '10px 12px' }}>Turnover Velocity</th>
                    <th style={{ padding: '10px 12px' }}>Target Gross Margin Range</th>
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
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{inv.category}</td>
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
              <strong>Working Capital & Credit Discipline:</strong>{' '}
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
                  Section 5: Financial Feasibility & Scheme Structure
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
                Deterministic Engine Results
              </span>
            </div>

            {/* Financial KPI Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '14px',
                marginBottom: '24px',
              }}
            >
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Total Project Outlay
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0b132b', marginTop: '4px' }}>
                  ₹{(projectCost || 0).toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Own Equity Contribution
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                  ₹{(ownContribution || 0).toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Required Bank Loan
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
                  ₹{(loanAmount || 0).toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Estimated Monthly EMI
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#7c3aed', marginTop: '4px' }}>
                  {financialFeasibility.installmentAmount
                    ? `₹${Number(financialFeasibility.installmentAmount).toLocaleString('en-IN')}`
                    : 'Calculated at Bank'}
                </div>
              </div>
            </div>

            {/* Visual Contribution Breakdown Bar */}
            <div style={{ marginBottom: '24px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
                <span>Own Equity: {ownPercent}% (₹{ownContribution.toLocaleString('en-IN')})</span>
                <span>Bank Loan: {loanPercent}% (₹{loanAmount.toLocaleString('en-IN')})</span>
              </div>
              <div style={{ height: '14px', display: 'flex', borderRadius: '7px', overflow: 'hidden' }}>
                <div style={{ width: `${ownPercent}%`, background: '#06d6a0' }} />
                <div style={{ width: `${loanPercent}%`, background: '#2563eb' }} />
              </div>
            </div>

            {/* Scheme Details Table */}
            <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px', fontWeight: 600, color: '#64748b', width: '30%' }}>Applicable Scheme</td>
                    <td style={{ padding: '10px', fontWeight: 700, color: '#0b132b' }}>{financialFeasibility.schemeName}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <td style={{ padding: '10px', fontWeight: 600, color: '#64748b' }}>Annual Interest Rate</td>
                    <td style={{ padding: '10px', color: '#0f172a' }}>{financialFeasibility.annualInterestRate || '9.5%'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px', fontWeight: 600, color: '#64748b' }}>Tenure & Moratorium</td>
                    <td style={{ padding: '10px', color: '#0f172a' }}>
                      {financialFeasibility.totalTenureMonths} Months ({financialFeasibility.moratoriumMonths} Months Moratorium)
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <td style={{ padding: '10px', fontWeight: 600, color: '#64748b' }}>DSCR Debt Service Status</td>
                    <td style={{ padding: '10px', color: '#059669', fontWeight: 700 }}>
                      {financialFeasibility.dscrStatus} ({financialFeasibility.dscrExplanation})
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Repayment Schedule Toggle */}
            {financialFeasibility.repaymentSchedule?.length > 0 && (
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
                  <span>{showFullSchedule ? 'Hide Full Amortization Schedule' : 'View Full Amortization Schedule'}</span>
                </button>

                {showFullSchedule && (
                  <div style={{ marginTop: '14px', overflowX: 'auto', maxHeight: '360px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                      <thead style={{ position: 'sticky', top: 0, background: '#0b132b', color: '#ffffff' }}>
                        <tr>
                          <th style={{ padding: '8px' }}>Period</th>
                          <th style={{ padding: '8px' }}>Opening Balance</th>
                          <th style={{ padding: '8px' }}>Principal</th>
                          <th style={{ padding: '8px' }}>Interest</th>
                          <th style={{ padding: '8px' }}>Installment</th>
                          <th style={{ padding: '8px' }}>Closing Balance</th>
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
              <strong>Financial Disclaimer:</strong> {financialFeasibility.disclaimer}
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
                Section 6: SWOT Analysis
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {/* Strengths */}
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '18px', borderRadius: '10px' }}>
                <h4 style={{ color: '#047857', fontWeight: 700, fontSize: '0.95rem', marginBottom: '10px' }}>
                  Strengths (Internal)
                </h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.86rem', lineHeight: 1.6, color: '#064e3b' }}>
                  {swotAnalysis.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '18px', borderRadius: '10px' }}>
                <h4 style={{ color: '#b45309', fontWeight: 700, fontSize: '0.95rem', marginBottom: '10px' }}>
                  Weaknesses (Internal)
                </h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.86rem', lineHeight: 1.6, color: '#78350f' }}>
                  {swotAnalysis.weaknesses.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>

              {/* Opportunities */}
              <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', padding: '18px', borderRadius: '10px' }}>
                <h4 style={{ color: '#0f766e', fontWeight: 700, fontSize: '0.95rem', marginBottom: '10px' }}>
                  Opportunities (External)
                </h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.86rem', lineHeight: 1.6, color: '#134e4a' }}>
                  {swotAnalysis.opportunities.map((o, i) => (
                    <li key={i}>{o}</li>
                  ))}
                </ul>
              </div>

              {/* Threats */}
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '18px', borderRadius: '10px' }}>
                <h4 style={{ color: '#b91c1c', fontWeight: 700, fontSize: '0.95rem', marginBottom: '10px' }}>
                  Threats (External)
                </h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.86rem', lineHeight: 1.6, color: '#7f1d1d' }}>
                  {swotAnalysis.threats.map((t, i) => (
                    <li key={i}>{t}</li>
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
                Section 7: Risk Analysis & Mitigation Framework
              </h2>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: '#0b132b', color: '#ffffff', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>Risk Factor</th>
                    <th style={{ padding: '10px 12px' }}>Likelihood / Impact</th>
                    <th style={{ padding: '10px 12px' }}>Mitigation Strategy</th>
                    <th style={{ padding: '10px 12px' }}>Monitoring Indicator</th>
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
                      <td style={{ padding: '12px', fontWeight: 600, color: '#0f172a' }}>{r.risk}</td>
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
                Section 8: Infrastructure & Ground Reality Assessment (Sahayak)
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>Road & Transport Access</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
                  {infrastructureAssessment.roadTransport}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>Electricity Availability</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
                  {infrastructureAssessment.electricity}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>Water Supply</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
                  {infrastructureAssessment.water}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>Internet / Mobile Connectivity</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
                  {infrastructureAssessment.internet}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.86rem' }}>
                <strong>Applicant Identified Competitors:</strong> {infrastructureAssessment.userReportedCompetitors}
              </div>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.86rem' }}>
                <strong>Seasonal Constraints:</strong> {infrastructureAssessment.seasonalConstraints} {infrastructureAssessment.seasonalExplanation}
              </div>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.86rem' }}>
                <strong>Local Demand Level:</strong> {infrastructureAssessment.localDemandLevel} — {infrastructureAssessment.demandReason}
              </div>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.86rem' }}>
                <strong>Anticipated Challenges:</strong> {infrastructureAssessment.businessChallenges} (Needed: {infrastructureAssessment.supportRequired})
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
                  Section 9: Local Support Organization Recommendations (Surat)
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
                      {org.category}
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
                  Section 10: Curated Learning Resources
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
                          // Fallback if thumbnail unavailable
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
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{vid.category}</span>
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
                Section 11: Step-by-Step Action Plan
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
                Section 12: Conclusion & Advisory Disclaimers
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
                Demonstration Methodology Limitations:
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

          {/* ========================================================================= */}
          {/* POST-REPORT INTERACTION: SAHAYAK CHAT TEASER (COMING SOON) */}
          {/* ========================================================================= */}
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
              Have more questions about your report?
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 20px', lineHeight: 1.5 }}>
              Ask Sahayak will allow you to query your financial calculations, explore supplier alternatives, and get instant guidance on loan applications.
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
              <span>Ask Sahayak about this report (Coming Soon)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
