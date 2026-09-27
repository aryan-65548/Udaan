import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  HelpCircle,
  ArrowLeft,
  CheckCircle2,
  Lightbulb,
  FileCheck,
  ChevronDown,
  ChevronUp,
  MapPin,
  Briefcase,
  Coins,
  ShieldAlert,
} from 'lucide-react';

interface HelpPageProps {
  onNavigate: (view: string) => void;
}

export const HelpPage: React.FC<HelpPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: '16px' }}
          onClick={() => onNavigate('dashboard')}
        >
          <ArrowLeft size={16} />
          <span>{t.dashboard}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--brand-green)', marginBottom: '6px' }}>
          <HelpCircle size={24} />
          <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.85rem' }}>
            UDAAN Guidance Center
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>{t.helpTitle}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          {t.helpSubtitle}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Section 1: What is UDAAN & Why it exists */}
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Lightbulb size={20} color="var(--brand-green)" />
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{t.aboutUdaanTitle}</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '20px' }}>
            {t.aboutUdaanDesc}
          </p>

          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '8px' }}>
            {t.whyUdaanTitle}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
            {t.whyUdaanDesc}
          </p>
        </div>

        {/* Section 2: How UDAAN Works */}
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <FileCheck size={20} color="var(--brand-green)" />
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{t.howItWorksTitle}</h2>
          </div>

          <div className="grid-2" style={{ gap: '16px' }}>
            <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--brand-green)', marginBottom: '6px' }}>
                <MapPin size={16} />
                <span>{t.step1Title}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                {t.step1Desc}
              </p>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--brand-green)', marginBottom: '6px' }}>
                <Briefcase size={16} />
                <span>{t.step2Title}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                {t.step2Desc}
              </p>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--brand-green)', marginBottom: '6px' }}>
                <Coins size={16} />
                <span>{t.step3Title}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                {t.step3Desc}
              </p>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--brand-green)', marginBottom: '6px' }}>
                <CheckCircle2 size={16} />
                <span>{t.step4Title}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                {t.step4Desc}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Financial Guidance & Advisory Warning */}
        <div className="card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '14px' }}>{t.financialGuidanceTitle}</h2>

          <div style={{ background: 'var(--bg-subtle)', padding: '18px', borderRadius: 'var(--radius-md)', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--brand-green)', marginBottom: '6px' }}>
              {t.ownContributionVsLoanTitle}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {t.ownContributionVsLoanDesc}
            </p>
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <ShieldAlert size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, color: '#92400e', marginBottom: '4px', fontSize: '0.9rem' }}>
                {t.loanWarningTitle}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#78350f', margin: 0, lineHeight: 1.5 }}>
                {t.loanWarningDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: What to Prepare */}
        <div className="card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>{t.whatToPrepareTitle}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[t.prepItem1, t.prepItem2, t.prepItem3, t.prepItem4].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle2 size={18} color="var(--brand-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: FAQs */}
        <div className="card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>{t.faqsTitle}</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { q: t.faq1Q, a: t.faq1A },
              { q: t.faq2Q, a: t.faq2A },
              { q: t.faq3Q, a: t.faq3A },
              { q: t.faq4Q, a: t.faq4A },
              { q: t.faq5Q, a: t.faq5A },
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  style={{
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      background: isOpen ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                      border: 'none',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      color: 'var(--text-main)',
                    }}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: '14px 18px',
                        background: 'var(--bg-surface)',
                        borderTop: '1px solid var(--border-light)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem',
                        lineHeight: 1.6,
                      }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
