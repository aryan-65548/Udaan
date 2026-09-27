import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { type AssessmentItem, getAssessments } from '../api/assessments';
import { StatusBadge } from '../components/StatusBadge';
import { Alert } from '../components/Alert';
import {
  FileSpreadsheet,
  PlusCircle,
  ArrowRight,
  ArrowLeft,
  Calendar,
  MapPin,
  RefreshCw,
  Globe,
} from 'lucide-react';

interface PreviousAssessmentsPageProps {
  onNavigate: (view: string, assessmentId?: string) => void;
}

export const PreviousAssessmentsPage: React.FC<PreviousAssessmentsPageProps> = ({ onNavigate }) => {
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
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigate('dashboard')}
            title={t.dashboard}
          >
            <ArrowLeft size={16} />
            <span>{t.dashboard}</span>
          </button>
          <div>
            <h1 style={{ fontSize: '1.6rem', marginBottom: '2px' }}>{t.previousAssessmentsTitle}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {t.previousAssessmentsSubtitle}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={fetchAssessments}
            disabled={isLoading}
            title={t.refresh}
          >
            <RefreshCw size={16} className={isLoading ? 'spinner' : ''} />
            <span>{t.refresh}</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onNavigate('create')}
          >
            <PlusCircle size={16} />
            <span>{t.newAssessment}</span>
          </button>
        </div>
      </div>

      {error && (
        <Alert type="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Content */}
      {isLoading ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <div className="spinner" style={{ width: '32px', height: '32px', marginBottom: '12px' }} />
          <div style={{ color: 'var(--text-muted)' }}>{t.loading}</div>
        </div>
      ) : assessments.length === 0 ? (
        <div className="empty-state card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div className="empty-icon" style={{ margin: '0 auto 16px' }}>
            <FileSpreadsheet size={36} color="var(--brand-green)" />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{t.noPreviousAssessments}</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 24px' }}>
            {t.startFirstAssessment}
          </p>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={() => onNavigate('create')}
          >
            <PlusCircle size={20} />
            <span>{t.newAssessment}</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {t.myAssessments} ({assessments.length})
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '16px',
            }}
          >
            {assessments.map((a) => (
              <div
                key={a.id}
                className="card card-hover"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '20px',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
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
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <Globe size={12} />
                      {languageLabel[a.language] || a.language}
                    </span>
                  </div>

                  <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '8px', color: 'var(--text-main)' }}>
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

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <Calendar size={13} />
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
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
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
        </div>
      )}
    </div>
  );
};
