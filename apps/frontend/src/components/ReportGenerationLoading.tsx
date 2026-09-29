import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Coins, Lightbulb, CheckCircle2, AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import type { SupportedLanguage } from '../i18n/translations';

interface ReportGenerationLoadingProps {
  language?: SupportedLanguage;
  isComplete: boolean;
  error?: string | null;
  onRetry?: () => void;
  onCancel?: () => void;
  onFinished: () => void;
  minDurationMs?: number;
}

interface StepInfo {
  title: Record<SupportedLanguage, string>;
  subtitle: Record<SupportedLanguage, string>;
}

const STEPS: StepInfo[] = [
  {
    title: {
      en: 'Analyzing your business information...',
      hi: 'आपकी व्यावसायिक जानकारी का विश्लेषण किया जा रहा है...',
      gu: 'તમારી વ્યવસાય માહિતીનું વિશ્લેષણ કરવામાં આવી રહ્યું છે...',
    },
    subtitle: {
      en: 'Reviewing location parameters, sector demand dynamics, and asset readiness.',
      hi: 'स्थान मानदंड, क्षेत्र की मांग और परिसंपत्ति तत्परता की समीक्षा की जा रही है।',
      gu: 'સ્થાન પરિમાણો, ક્ષેત્રની માંગ અને સંપત્તિની તૈયારીની સમીક્ષા થઈ રહી છે.',
    },
  },
  {
    title: {
      en: 'Evaluating financial feasibility and government schemes...',
      hi: 'वित्तीय व्यवहार्यता और सरकारी योजनाओं का मूल्यांकन किया जा रहा है...',
      gu: 'નાણાકીય શક્યતા અને સરકારી યોજનાઓનું મૂલ્યાંકન કરવામાં આવી રહ્યું છે...',
    },
    subtitle: {
      en: 'Computing project outlay, 10% own equity rule, EMI schedules, and credit limits.',
      hi: 'परियोजना लागत, 10% स्वयं का अंशदान नियम, ईएमआई अनुसूची और ऋण सीमा की गणना हो रही है।',
      gu: 'પ્રોજેક્ટ ખર્ચ, 10% પોતાના મૂડી નિયમ, EMI સમયપત્રક અને ધિરાણ મર્યાદા ગણાઈ રહી છે.',
    },
  },
  {
    title: {
      en: 'Preparing your personalized feasibility report...',
      hi: 'आपकी व्यक्तिगत व्यवहार्यता रिपोर्ट तैयार की जा रही है...',
      gu: 'તમારો વ્યક્તિગત શક્યતા રિપોર્ટ તૈયાર કરવામાં આવી રહ્યો છે...',
    },
    subtitle: {
      en: 'Assembling 12-section advisory dossier, SWOT matrix, and actionable risk safeguards.',
      hi: '12-खंडीय सलाहकार रिपोर्ट, स्वाट मैट्रिक्स और जोखिम निवारण कार्ययोजना संकलित हो रही है।',
      gu: '12-વિભાગીય સલાહકાર દસ્તાવેજ, સ્વોટ મેટ્રિક્સ અને જોખમ નિવારણ યોજના તૈયાર થઈ રહી છે.',
    },
  },
];

export const ReportGenerationLoading: React.FC<ReportGenerationLoadingProps> = ({
  language = 'en',
  isComplete,
  error = null,
  onRetry,
  onCancel,
  onFinished,
  minDurationMs = 1800,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(10);
  const startTimeRef = useRef<number>(Date.now());
  const hasFinishedRef = useRef<boolean>(false);

  useEffect(() => {
    startTimeRef.current = Date.now();
    hasFinishedRef.current = false;

    // Phase 1 timer -> Phase 2 (at ~600ms)
    const t1 = setTimeout(() => {
      setCurrentStepIdx(1);
      setProgressPercent(45);
    }, 600);

    // Phase 2 timer -> Phase 3 (at ~1250ms)
    const t2 = setTimeout(() => {
      setCurrentStepIdx(2);
      setProgressPercent(82);
    }, 1250);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Monitor when both min duration AND backend response are satisfied
  useEffect(() => {
    if (error || hasFinishedRef.current) return;

    if (isComplete) {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, minDurationMs - elapsed);

      const finishTimer = setTimeout(() => {
        setProgressPercent(100);
        setCurrentStepIdx(2);

        const transitionTimer = setTimeout(() => {
          if (!hasFinishedRef.current) {
            hasFinishedRef.current = true;
            onFinished();
          }
        }, 300);

        return () => clearTimeout(transitionTimer);
      }, remaining);

      return () => clearTimeout(finishTimer);
    }
  }, [isComplete, error, minDurationMs, onFinished]);

  if (error) {
    return (
      <div
        style={{
          maxWidth: '680px',
          margin: '50px auto',
          padding: '36px 32px',
          background: 'linear-gradient(145deg, #1c2541, #0b132b)',
          borderRadius: '24px',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.4)',
          textAlign: 'center',
          color: '#ffffff',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '2px solid rgba(239, 68, 68, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: '#ef4444',
          }}
        >
          <AlertTriangle size={32} />
        </div>

        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '10px', color: '#f8fafc' }}>
          {language === 'hi'
            ? 'रिपोर्ट निर्माण में त्रुटि'
            : language === 'gu'
            ? 'રિપોર્ટ બનાવવામાં ભૂલ'
            : 'Report Generation Error'}
        </h3>

        <p style={{ color: '#cbd5e1', fontSize: '0.94rem', lineHeight: 1.6, marginBottom: '28px' }}>
          {error}
        </p>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 24px',
                borderRadius: '10px',
                fontWeight: 700,
              }}
            >
              <RefreshCw size={16} />
              <span>
                {language === 'hi'
                  ? 'पुनः प्रयास करें'
                  : language === 'gu'
                  ? 'ફરી પ્રયાસ કરો'
                  : 'Retry Generation'}
              </span>
            </button>
          )}

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 22px',
                borderRadius: '10px',
                fontWeight: 600,
              }}
            >
              <ArrowLeft size={16} />
              <span>
                {language === 'hi'
                  ? 'डैशबोर्ड पर वापस जाएं'
                  : language === 'gu'
                  ? 'ડેશબોર્ડ પર પાછા જાઓ'
                  : 'Return to Dashboard'}
              </span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const activeStep = STEPS[currentStepIdx] || STEPS[0];

  return (
    <div
      style={{
        maxWidth: '720px',
        width: '92%',
        margin: '60px auto',
        padding: '44px 36px',
        background: 'linear-gradient(145deg, #1c2541 0%, #0b132b 100%)',
        borderRadius: '24px',
        border: '1px solid rgba(6, 214, 160, 0.35)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
        textAlign: 'center',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Background glow effects */}
      <div
        style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '240px',
          height: '240px',
          background: 'radial-gradient(circle, rgba(6, 214, 160, 0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-60px',
          left: '-60px',
          width: '240px',
          height: '240px',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Animated Pulse Icon */}
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: '24px' }}>
        <div
          style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(6, 214, 160, 0.2) 0%, rgba(28, 37, 65, 0.8) 100%)',
            border: '2px solid rgba(6, 214, 160, 0.6)',
            boxShadow: '0 0 30px rgba(6, 214, 160, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#06d6a0',
          }}
        >
          {currentStepIdx === 0 && <Lightbulb size={36} className="pulse" />}
          {currentStepIdx === 1 && <Coins size={36} className="pulse" />}
          {currentStepIdx === 2 && <Sparkles size={36} className="pulse" />}
        </div>
      </div>

      {/* Title & Sequential Dynamic Messages */}
      <h2
        style={{
          fontSize: '1.45rem',
          fontWeight: 800,
          color: '#ffffff',
          marginBottom: '10px',
          lineHeight: 1.35,
          minHeight: '40px',
          transition: 'all 0.3s ease',
        }}
      >
        {activeStep.title[language] || activeStep.title.en}
      </h2>

      <p
        style={{
          color: '#94a3b8',
          fontSize: '0.94rem',
          lineHeight: 1.6,
          maxWidth: '560px',
          margin: '0 auto 30px',
          minHeight: '46px',
          transition: 'all 0.3s ease',
        }}
      >
        {activeStep.subtitle[language] || activeStep.subtitle.en}
      </p>

      {/* Progress Bar Container */}
      <div style={{ marginBottom: '32px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#06d6a0',
            marginBottom: '8px',
          }}
        >
          <span>UDAAN Feasibility Assessment Engine</span>
          <span>{progressPercent}%</span>
        </div>

        <div
          style={{
            width: '100%',
            height: '10px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #06d6a0 0%, #38bdf8 100%)',
              borderRadius: '10px',
              transition: 'width 0.4s ease-out',
              boxShadow: '0 0 12px rgba(6, 214, 160, 0.6)',
            }}
          />
        </div>
      </div>

      {/* Sequential Milestone Steps Indicator */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          textAlign: 'left',
          background: 'rgba(11, 19, 43, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '16px 18px',
        }}
      >
        {STEPS.map((_, idx) => {
          const isDone = idx < currentStepIdx || (idx === 2 && progressPercent === 100);
          const isCurrent = idx === currentStepIdx && progressPercent < 100;

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: isDone || isCurrent ? 1 : 0.45,
                transition: 'all 0.3s ease',
              }}
            >
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: isDone
                    ? '#06d6a0'
                    : isCurrent
                    ? 'rgba(6, 214, 160, 0.2)'
                    : 'rgba(255, 255, 255, 0.1)',
                  color: isDone ? '#0b132b' : '#06d6a0',
                  border: `1.5px solid ${isDone || isCurrent ? '#06d6a0' : 'rgba(255, 255, 255, 0.2)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {isDone ? <CheckCircle2 size={14} /> : idx + 1}
              </div>

              <span
                style={{
                  fontSize: '0.76rem',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isDone ? '#06d6a0' : isCurrent ? '#ffffff' : '#94a3b8',
                  lineHeight: 1.25,
                }}
              >
                {idx === 0 && (language === 'hi' ? 'व्यापार विश्लेषण' : language === 'gu' ? 'વ્યવસાય વિશ્લેષણ' : 'Business Audit')}
                {idx === 1 && (language === 'hi' ? 'वित्तीय गणना' : language === 'gu' ? 'નાણાકીય ગણતરી' : 'Finance Feasibility')}
                {idx === 2 && (language === 'hi' ? 'रिपोर्ट संकलन' : language === 'gu' ? 'રિપોર્ટ સંકલન' : 'Report Dossier')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
