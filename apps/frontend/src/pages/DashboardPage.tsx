import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { type AssessmentItem, getAssessments } from '../api/assessments';
import { StatusBadge } from '../components/StatusBadge';
import { Alert } from '../components/Alert';
import {
  PlusCircle,
  ArrowRight,
  FileSpreadsheet,
  Calendar,
  Globe,
  HelpCircle,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (view: string, assessmentId?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssessments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAssessments();
      setAssessments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load assessments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const languageLabel: Record<string, string> = {
    en: 'English',
    hi: 'हिंदी',
    gu: 'ગુજરાતી',
  };

  return (
    <div className="dashboard-page" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.08) 0%, rgba(16, 185, 129, 0.03) 100%)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--brand-green)',
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '6px',
            }}
          >
            <Sparkles size={16} />
            <span>{t.tagline}</span>
          </div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '8px', color: 'var(--text-main)' }}>
            {t.welcomeUser}, {user?.name || 'Entrepreneur'} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
            {t.dashboardSubtitle}
          </p>
        </div>

        {/* The single primary Start New Assessment button on main dashboard */}
        <div>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={() => onNavigate('create')}
            style={{ boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)' }}
          >
            <PlusCircle size={20} />
            <span>{t.newAssessment}</span>
          </button>
        </div>
      </div>

      {error && (
        <Alert type="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* PRIMARY USER OPTIONS */}
      <div style={{ marginBottom: '36px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>
          {t.quickActions}
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
          }}
        >
          {/* 1. Start New Assessment */}
          <div
            className="card card-hover"
            onClick={() => onNavigate('create')}
            style={{
              padding: '22px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: '1px solid rgba(5, 150, 105, 0.25)',
              background: 'linear-gradient(145deg, rgba(5, 150, 105, 0.05) 0%, rgba(255, 255, 255, 1) 100%)',
            }}
          >
            <div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(5, 150, 105, 0.12)',
                  color: 'var(--brand-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                }}
              >
                <PlusCircle size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '6px', color: 'var(--text-main)' }}>
                {t.startNewAssessmentCardTitle}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                {t.startNewAssessmentCardDesc}
              </p>
            </div>

            <div
              style={{
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--brand-green)',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              <span>{t.startAssessment}</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* 2. View Previous Assessments */}
          <div
            className="card card-hover"
            onClick={() => onNavigate('assessments')}
            style={{
              padding: '22px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'var(--bg-subtle)',
                  color: 'var(--brand-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                }}
              >
                <FileSpreadsheet size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '6px', color: 'var(--text-main)' }}>
                {t.previousAssessmentsCardTitle}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                {t.previousAssessmentsCardDesc}
              </p>
            </div>

            <div
              style={{
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--brand-green)',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              <span>{t.viewPreviousAssessments}</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* 3. Help & Advisory Guide */}
          <div
            className="card card-hover"
            onClick={() => onNavigate('help')}
            style={{
              padding: '22px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'var(--bg-subtle)',
                  color: 'var(--brand-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                }}
              >
                <HelpCircle size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '6px', color: 'var(--text-main)' }}>
                {t.helpCardTitle}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                {t.helpCardDesc}
              </p>
            </div>

            <div
              style={{
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--brand-green)',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              <span>{t.help}</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* UDAAN MISSION & VISION SECTION */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          marginBottom: '36px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Sparkles size={20} color="var(--brand-green)" />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            {t.missionVisionTitle}
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              padding: '18px 20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.06) 0%, rgba(5, 150, 105, 0.02) 100%)',
              border: '1px solid rgba(5, 150, 105, 0.2)',
            }}
          >
            <div style={{ fontWeight: 800, color: 'var(--brand-green)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              🎯 {language === 'hi' ? 'हमारा मिशन (Mission)' : language === 'gu' ? 'અમારું મિશન (Mission)' : 'Our Mission'}
            </div>
            <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.55, color: 'var(--text-main)' }}>
              {t.udaanMission}
            </p>
          </div>

          <div
            style={{
              padding: '18px 20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.06) 0%, rgba(37, 99, 235, 0.02) 100%)',
              border: '1px solid rgba(37, 99, 235, 0.2)',
            }}
          >
            <div style={{ fontWeight: 800, color: '#2563eb', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              🌟 {language === 'hi' ? 'हमारा विजन (Vision)' : language === 'gu' ? 'અમારું વિઝન (Vision)' : 'Our Vision'}
            </div>
            <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.55, color: 'var(--text-main)' }}>
              {t.udaanVision}
            </p>
          </div>
        </div>

        {/* 6 Core Principles & Objectives */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px' }}>
            {t.coreObjectivesTitle}
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '12px',
            }}
          >
            {[
              t.objective1,
              t.objective2,
              t.objective3,
              t.objective4,
              t.objective5,
              t.objective6,
            ].map((objText, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.86rem',
                  lineHeight: 1.45,
                  color: '#334155',
                }}
              >
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(5, 150, 105, 0.15)', color: 'var(--brand-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0, marginTop: '2px' }}>
                  ✓
                </div>
                <span>{objText}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT ASSESSMENTS SECTION */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {t.recentAssessments}
          </h2>

          {assessments.length > 0 && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('assessments')}
            >
              <span>{t.viewAllAssessments}</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>

        {isLoading ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <div className="spinner" style={{ width: '28px', height: '28px', marginBottom: '10px' }} />
            <div style={{ color: 'var(--text-muted)' }}>{t.loading}</div>
          </div>
        ) : assessments.length === 0 ? (
          <div className="empty-state card" style={{ padding: '36px 20px', textAlign: 'center' }}>
            <div className="empty-icon" style={{ margin: '0 auto 12px' }}>
              <FileSpreadsheet size={32} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '6px' }}>{t.noAssessmentsYet}</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 18px', fontSize: '0.9rem' }}>
              {t.startFirstAssessment}
            </p>
            {/* Note: This button is inside the empty state component only, consistent with spec */}
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigate('create')}
            >
              <PlusCircle size={16} />
              <span>{t.startAssessment}</span>
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '16px',
            }}
          >
            {assessments.slice(0, 4).map((a) => (
              <div
                key={a.id}
                className="card card-hover"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '18px',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                    }}
                  >
                    <StatusBadge status={a.status} />
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        background: 'var(--bg-subtle)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <Globe size={12} />
                      {languageLabel[a.language] || a.language}
                    </span>
                  </div>

                  <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '8px', color: 'var(--text-main)' }}>
                    {a.businessCategory?.name || t.newAssessment}
                  </div>

                  {a.location && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '8px',
                      }}
                    >
                      <MapPin size={14} color="var(--brand-green)" style={{ flexShrink: 0 }} />
                      <span>
                        <strong>{t.operatingLocation}:</strong> {a.location.name}
                      </span>
                    </div>
                  )}

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={12} />
                      <span>
                        <strong>{t.createdOn}:</strong> {new Date(a.createdAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'gu' ? 'gu-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    borderTop: '1px solid var(--border-light)',
                    paddingTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {a.status === 'COMPLETED' ? t.statusCompleted : t.statusInProgress}
                  </span>

                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => onNavigate('workflow', a.id)}
                  >
                    <span>{a.status === 'COMPLETED' ? t.viewAssessment : t.continueAssessment}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
