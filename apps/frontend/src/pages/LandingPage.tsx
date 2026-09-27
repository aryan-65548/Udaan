import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, MapPin, Calculator, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing-page" style={{ padding: '20px 0' }}>
      {/* Hero Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '48px 32px',
          color: 'white',
          textAlign: 'center',
          boxShadow: 'var(--shadow-xl)',
          marginBottom: '40px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '20px',
          }}
        >
          <ShieldCheck size={16} />
          {t.tagline}
        </div>

        <h1
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
            color: 'white',
            fontWeight: 800,
            maxWidth: '800px',
            margin: '0 auto 16px',
            lineHeight: 1.2,
          }}
        >
          {t.heroHeadline}
        </h1>

        <p
          style={{
            fontSize: '1.1rem',
            color: '#d1fae5',
            maxWidth: '680px',
            margin: '0 auto 32px',
            lineHeight: 1.6,
          }}
        >
          {t.heroSubheadline}
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-lg"
            style={{
              background: '#f59e0b',
              color: '#78350f',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
            }}
            onClick={() => onNavigate(isAuthenticated ? 'create' : 'register')}
          >
            <span>{t.startAssessment}</span>
            <ArrowRight size={20} />
          </button>

          {!isAuthenticated && (
            <button
              type="button"
              className="btn btn-secondary btn-lg"
              style={{ background: 'rgba(255,255,255,0.9)', color: '#064e3b', fontWeight: 600 }}
              onClick={() => onNavigate('login')}
            >
              {t.login}
            </button>
          )}
        </div>
      </div>

      {/* 3 Pillars of Evidence Before Borrowing */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.75rem', marginBottom: '8px' }}>
          {t.howItWorksTitle}
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '32px' }}>
          {t.aboutUdaanDesc}
        </p>

        <div className="grid-3">
          <div className="card card-hover">
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'var(--brand-green-light)',
                color: 'var(--brand-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <MapPin size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{t.step1Title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              {t.step1Desc}
            </p>
          </div>

          <div className="card card-hover">
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'var(--accent-saffron-light)',
                color: 'var(--accent-saffron)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <CheckCircle2 size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{t.step2Title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              {t.step2Desc}
            </p>
          </div>

          <div className="card card-hover">
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'var(--info-light)',
                color: 'var(--info)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <Calculator size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{t.step3Title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              {t.step3Desc}
            </p>
          </div>
        </div>
      </div>

      {/* Rural Entrepreneur Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(to right, #f8fafc, #edfaf2)',
          border: '1px solid var(--brand-green-border)',
          padding: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-green)', fontWeight: 700, marginBottom: '6px' }}>
            <TrendingUp size={20} />
            <span>{t.tagline}</span>
          </div>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>{t.startFirstAssessment}</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: 0 }}>
            {t.heroSubheadline}
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={() => onNavigate(isAuthenticated ? 'create' : 'register')}
        >
          <span>{t.startAssessment}</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
