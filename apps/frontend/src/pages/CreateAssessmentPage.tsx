import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import type { SupportedLanguage } from '../i18n/translations';
import { createAssessment } from '../api/assessments';
import { LocationSelector } from '../components/LocationSelector';
import { CategorySelector } from '../components/CategorySelector';
import { Alert } from '../components/Alert';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

interface CreateAssessmentPageProps {
  onNavigate: (view: string, assessmentId?: string) => void;
}

export const CreateAssessmentPage: React.FC<CreateAssessmentPageProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();

  const [locationId, setLocationId] = useState<string>('');
  const [businessCategoryId, setBusinessCategoryId] = useState<string>('');
  const [advisoryLanguage, setAdvisoryLanguage] = useState<SupportedLanguage>(language);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!locationId) {
      setError('Please select a location (State & District are required).');
      return;
    }

    if (!businessCategoryId) {
      setError('Please choose a business category.');
      return;
    }

    setIsLoading(true);
    try {
      const created = await createAssessment({
        locationId,
        businessCategoryId,
        language: advisoryLanguage,
      });

      onNavigate('workflow', created.id);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize assessment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '20px' }}
        onClick={() => onNavigate('dashboard')}
      >
        <ArrowLeft size={16} />
        <span>{t.dashboard}</span>
      </button>

      <div className="card" style={{ padding: '32px' }}>
        <div style={{ marginBottom: '28px' }}>
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
            <span>New Feasibility Dossier</span>
          </div>
          <h1 style={{ fontSize: '1.65rem', marginBottom: '8px' }}>Start New Business Assessment</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Select your operating geography, business sector, and preferred advisory language. All data is evaluated against local ground conditions.
          </p>
        </div>

        {error && (
          <Alert type="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Location Hierarchy */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.15rem', marginBottom: '4px' }}>
              1. {t.location}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Specify your proposed operational area. Demographics and demand estimates depend on this choice.
            </p>
            <LocationSelector
              value={locationId}
              onChange={(id) => setLocationId(id)}
              disabled={isLoading}
            />
          </div>

          {/* Section 2: Business Category */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.15rem', marginBottom: '4px' }}>
              2. {t.businessCategory}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Choose the enterprise type that best describes your planned micro-venture.
            </p>
            <CategorySelector
              value={businessCategoryId}
              onChange={(id) => setBusinessCategoryId(id)}
              disabled={isLoading}
            />
          </div>

          {/* Section 3: Advisory Language */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.15rem', marginBottom: '4px' }}>
              3. {t.preferredLanguage}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              The language used for your feasibility dossier and reports.
            </p>
            <select
              className="select-control"
              style={{ maxWidth: '320px' }}
              value={advisoryLanguage}
              onChange={(e) => setAdvisoryLanguage(e.target.value as SupportedLanguage)}
              disabled={isLoading}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="gu">ગુજરાતી (Gujarati)</option>
            </select>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              borderTop: '1px solid var(--border-light)',
              paddingTop: '20px',
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onNavigate('dashboard')}
              disabled={isLoading}
            >
              {t.cancel}
            </button>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isLoading || !locationId || !businessCategoryId}
            >
              {isLoading ? (
                <>
                  <div className="spinner" />
                  <span>Creating Assessment...</span>
                </>
              ) : (
                <>
                  <span>Proceed to Assessment</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
