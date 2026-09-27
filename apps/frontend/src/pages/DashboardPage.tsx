import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { type AssessmentItem, getAssessments } from '../api/assessments';
import { StatusBadge } from '../components/StatusBadge';
import { Alert } from '../components/Alert';
import { PlusCircle, ArrowRight, RefreshCw, FileSpreadsheet, Calendar, Globe } from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (view: string, assessmentId?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

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
    <div className="dashboard-page">
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>
            Welcome, {user?.name || 'Entrepreneur'} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Review, continue, or start business feasibility assessments before taking any loan.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={fetchAssessments}
            disabled={isLoading}
            title="Refresh list"
          >
            <RefreshCw size={16} className={isLoading ? 'spinner' : ''} />
            <span className="hide-mobile">Refresh</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onNavigate('create')}
          >
            <PlusCircle size={18} />
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
        <div style={{ padding: '48px 0', textAlign: 'center' }}>
          <div className="spinner" style={{ width: '32px', height: '32px', marginBottom: '12px' }} />
          <div style={{ color: 'var(--text-muted)' }}>Loading your business assessments...</div>
        </div>
      ) : assessments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <FileSpreadsheet size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{t.noAssessmentsYet}</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 24px' }}>
            {t.startFirstAssessment}
          </p>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={() => onNavigate('create')}
          >
            <PlusCircle size={20} />
            <span>{t.startAssessment}</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
            {t.myAssessments} ({assessments.length})
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
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

                  <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '6px', color: 'var(--text-main)' }}>
                    Assessment #{a.id.slice(0, 8)}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <Calendar size={13} />
                      <span>{t.createdOn}: {new Date(a.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      {t.lastUpdated}: {new Date(a.updatedAt).toLocaleString()}
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
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {a.status === 'COMPLETED' ? 'Completed' : 'Draft / In Progress'}
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
