import React, { useState, useEffect, useCallback } from 'react';
import {
  type QuestionnaireData,
  getQuestionnaire,
  saveQuestionnaireResponses,
  submitQuestionnaire,
  getFeasibilityReport,
  type FeasibilityReportData,
} from '../api/questionnaire';
import {
  Bot,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  Sparkles,
  Zap,
  Droplets,
  Truck,
  Wifi,
} from 'lucide-react';

interface SahayakQuestionnaireProps {
  assessmentId: string;
  onComplete: (report?: FeasibilityReportData) => void;
  onSaveAndExit?: () => void;
  onBackToAssessment?: () => void;
}

export const SahayakQuestionnaire: React.FC<SahayakQuestionnaireProps> = ({
  assessmentId,
  onComplete,
  onSaveAndExit,
  onBackToAssessment,
}) => {
  const [data, setData] = useState<QuestionnaireData | null>(null);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Load active questionnaire and previously saved responses
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await getQuestionnaire(assessmentId);
      setData(res);

      const initialAnswers: Record<string, any> = {};
      res.questions.forEach((q) => {
        if (q.savedResponse) {
          initialAnswers[q.code] = q.savedResponse;
        }
      });
      setAnswers(initialAnswers);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load Sahayak questionnaire');
    } finally {
      setIsLoading(false);
    }
  }, [assessmentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleSaveCurrent = async (advance: boolean = false) => {
    if (!data) return;
    const currentQuestion = data.questions[activeQuestionIdx];
    const currentAnswer = answers[currentQuestion.code];

    if (!currentAnswer || Object.keys(currentAnswer).length === 0) {
      if (advance) {
        setErrorMessage('Please provide an answer before continuing.');
      }
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    try {
      await saveQuestionnaireResponses(assessmentId, [
        {
          questionCode: currentQuestion.code,
          response: currentAnswer,
        },
      ]);
      showToast('Progress saved successfully');
      if (advance && activeQuestionIdx < data.questions.length - 1) {
        setActiveQuestionIdx((prev) => prev + 1);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save answer');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!data) return;

    // Validate all 6 questions are present in local state
    const missing: number[] = [];
    data.questions.forEach((q, idx) => {
      const ans = answers[q.code];
      if (!ans || Object.keys(ans).length === 0) {
        missing.push(idx + 1);
      }
    });

    if (missing.length > 0) {
      setErrorMessage(`Please complete question(s): ${missing.join(', ')} before final submission.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      // Save all answers in batch first
      const payload = Object.entries(answers).map(([code, response]) => ({
        questionCode: code,
        response,
      }));
      await saveQuestionnaireResponses(assessmentId, payload);
      const res = await submitQuestionnaire(assessmentId);
      showToast('Sahayak questionnaire submitted successfully!');
      let reportData = res?.feasibilityReport;
      if (!reportData) {
        try {
          reportData = await getFeasibilityReport(assessmentId);
        } catch {
          // Handled by FeasibilityReportView self-fetch
        }
      }
      onComplete(reportData);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit questionnaire');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="spinner" style={{ width: '36px', height: '36px', margin: '0 auto 16px' }} />
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Loading Sahayak advisory questionnaire...
        </div>
      </div>
    );
  }

  if (!data || data.questions.length === 0) {
    return (
      <div className="card" style={{ padding: '32px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <AlertCircle size={36} color="#dc2626" style={{ margin: '0 auto 12px' }} />
        <h3 style={{ marginBottom: '8px' }}>Questionnaire Unavailable</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
          {errorMessage || 'Unable to retrieve active questionnaire questions for this assessment.'}
        </p>
        <button type="button" className="btn btn-primary" onClick={loadData} style={{ minWidth: '120px' }}>
          Retry
        </button>
      </div>
    );
  }

  const currentQ = data.questions[activeQuestionIdx];
  const isLastQuestion = activeQuestionIdx === data.questions.length - 1;

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Sahayak Brand Header Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 28px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: '-10px',
            top: '-10px',
            opacity: 0.08,
            pointerEvents: 'none',
          }}
        >
          <Bot size={180} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(52, 211, 153, 0.4)',
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Step 5: Business Context Advisory
            </div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: '#ffffff' }}>
              Sahayak — Let's understand your business environment
            </h2>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5, maxWidth: '640px' }}>
          These 6 structured questions help assess your local utilities, customer demand, competitor landscape, and operational risks before generating your comprehensive feasibility report.
        </p>

        {/* 6-Step Progress Bar */}
        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {data.questions.map((q, idx) => {
            const isAns = Boolean(answers[q.code] && Object.keys(answers[q.code]).length > 0);
            const isAct = idx === activeQuestionIdx;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  handleSaveCurrent(false);
                  setActiveQuestionIdx(idx);
                }}
                style={{
                  flex: 1,
                  height: '34px',
                  borderRadius: '6px',
                  border: isAct ? '2px solid #34d399' : '1px solid rgba(255, 255, 255, 0.15)',
                  background: isAct ? 'rgba(52, 211, 153, 0.25)' : isAns ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  color: isAct ? '#34d399' : isAns ? '#a7f3d0' : '#94a3b8',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {isAns && !isAct ? <CheckCircle2 size={14} color="#34d399" /> : `Q${idx + 1}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error and Success Alerts */}
      {errorMessage && (
        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-sm)',
            color: '#dc2626',
            fontSize: '0.88rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {successToast && (
        <div
          style={{
            padding: '10px 16px',
            background: 'var(--brand-green-light)',
            border: '1px solid var(--brand-green-border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--brand-green)',
            fontSize: '0.88rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Active Question Card */}
      <div
        className="card"
        style={{
          padding: '28px',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-light)',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span
            style={{
              background: 'var(--bg-subtle)',
              color: 'var(--text-secondary)',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            Question {activeQuestionIdx + 1} of 6
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {currentQ.isRequired ? 'Required' : 'Optional'}
          </span>
        </div>

        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '20px', lineHeight: 1.4 }}>
          {currentQ.questionText}
        </h3>

        {/* QUESTION 1: LOCAL INFRASTRUCTURE */}
        {currentQ.code === 'INFRASTRUCTURE' && (
          <QuestionInfrastructure
            options={currentQ.options}
            value={answers['INFRASTRUCTURE'] || {}}
            onChange={(val) => setAnswers((prev) => ({ ...prev, INFRASTRUCTURE: val }))}
          />
        )}

        {/* QUESTION 2: NEARBY COMPETITORS */}
        {currentQ.code === 'COMPETITORS' && (
          <QuestionCompetitors
            options={currentQ.options}
            value={answers['COMPETITORS'] || { hasNoCompetitors: false, competitors: [] }}
            onChange={(val) => setAnswers((prev) => ({ ...prev, COMPETITORS: val }))}
          />
        )}

        {/* QUESTION 3: SEASONAL AND ENVIRONMENTAL CONSTRAINTS */}
        {currentQ.code === 'SEASONAL_CONSTRAINTS' && (
          <QuestionSeasonalConstraints
            options={currentQ.options}
            value={answers['SEASONAL_CONSTRAINTS'] || { constraints: [], affectedMonths: [], explanation: '' }}
            onChange={(val) => setAnswers((prev) => ({ ...prev, SEASONAL_CONSTRAINTS: val }))}
          />
        )}

        {/* QUESTION 4: LOCAL DEMAND */}
        {currentQ.code === 'LOCAL_DEMAND' && (
          <QuestionLocalDemand
            options={currentQ.options}
            value={answers['LOCAL_DEMAND'] || { demandLevel: '', rationale: '' }}
            onChange={(val) => setAnswers((prev) => ({ ...prev, LOCAL_DEMAND: val }))}
          />
        )}

        {/* QUESTION 5: CUSTOMERS AND MARKET ACCESS */}
        {currentQ.code === 'CUSTOMERS_MARKET' && (
          <QuestionCustomersMarket
            options={currentQ.options}
            value={answers['CUSTOMERS_MARKET'] || { customerGroups: [], salesChannels: '' }}
            onChange={(val) => setAnswers((prev) => ({ ...prev, CUSTOMERS_MARKET: val }))}
          />
        )}

        {/* QUESTION 6: BUSINESS RISKS AND SUPPORT */}
        {currentQ.code === 'BUSINESS_RISKS' && (
          <QuestionBusinessRisks
            options={currentQ.options}
            value={answers['BUSINESS_RISKS'] || { challenges: [], supportNeeded: '' }}
            onChange={(val) => setAnswers((prev) => ({ ...prev, BUSINESS_RISKS: val }))}
          />
        )}
      </div>

      {/* Navigation Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          {activeQuestionIdx > 0 ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                handleSaveCurrent(false);
                setActiveQuestionIdx((prev) => prev - 1);
              }}
              disabled={isSaving || isSubmitting}
            >
              <ArrowLeft size={16} />
              <span>Previous</span>
            </button>
          ) : (
            onBackToAssessment && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onBackToAssessment}
                disabled={isSaving || isSubmitting}
              >
                <ArrowLeft size={16} />
                <span>Back to Setup</span>
              </button>
            )
          )}

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleSaveCurrent(false)}
            disabled={isSaving || isSubmitting}
            title="Save your current progress"
          >
            <Save size={16} />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          {onSaveAndExit && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={async () => {
                await handleSaveCurrent(false);
                onSaveAndExit();
              }}
              disabled={isSaving || isSubmitting}
              title="Save answers and return to dashboard"
            >
              <span>Save & Exit</span>
            </button>
          )}
        </div>

        <div>
          {!isLastQuestion ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleSaveCurrent(true)}
              disabled={isSaving || isSubmitting}
            >
              <span>Next Question</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={handleFinalSubmit}
              disabled={isSaving || isSubmitting}
              style={{ background: 'var(--brand-green)' }}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" />
                  <span>Generating Feasibility Report...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Submit & Generate Feasibility Report</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ========================================================================= */
/* QUESTION 1 COMPONENT: LOCAL INFRASTRUCTURE */
/* ========================================================================= */
const QuestionInfrastructure: React.FC<{
  options: any;
  value: Record<string, string>;
  onChange: (val: Record<string, string>) => void;
}> = ({ options, value, onChange }) => {
  const facilities = options?.facilities || [
    { key: 'road_transport', label: 'Road and transport access' },
    { key: 'electricity', label: 'Electricity availability' },
    { key: 'water', label: 'Water availability' },
    { key: 'connectivity', label: 'Internet/mobile connectivity' },
  ];

  const ratings = options?.ratings || [
    { key: 'GOOD', label: 'Good' },
    { key: 'AVERAGE', label: 'Average' },
    { key: 'POOR', label: 'Poor' },
    { key: 'NOT_AVAILABLE', label: 'Not Available' },
  ];

  const getIcon = (key: string) => {
    switch (key) {
      case 'road_transport':
        return <Truck size={18} color="var(--brand-green)" />;
      case 'electricity':
        return <Zap size={18} color="#f59e0b" />;
      case 'water':
        return <Droplets size={18} color="#3b82f6" />;
      case 'connectivity':
        return <Wifi size={18} color="#8b5cf6" />;
      default:
        return <Zap size={18} />;
    }
  };

  const setFacilityRating = (facKey: string, ratingKey: string) => {
    onChange({
      ...value,
      [facKey]: ratingKey,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {facilities.map((fac: any) => {
        const currentRating = value[fac.key];
        return (
          <div
            key={fac.key}
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              {getIcon(fac.key)}
              <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                {fac.label}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
              {ratings.map((r: any) => {
                const isSelected = currentRating === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setFacilityRating(fac.key, r.key)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '2px solid var(--brand-green)' : '1px solid var(--border-light)',
                      background: isSelected ? 'var(--brand-green-light)' : 'var(--bg-surface)',
                      color: isSelected ? 'var(--brand-green)' : 'var(--text-secondary)',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ========================================================================= */
/* QUESTION 2 COMPONENT: NEARBY COMPETITORS */
/* ========================================================================= */
interface CompetitorItem {
  name: string;
  distance?: string;
  distanceValue?: number | null;
  distanceUnit?: 'm' | 'km';
  description?: string;
}

const QuestionCompetitors: React.FC<{
  options: any;
  value: { hasNoCompetitors?: boolean; competitors?: CompetitorItem[] };
  onChange: (val: any) => void;
}> = ({ options, value, onChange }) => {
  const hasNo = Boolean(value.hasNoCompetitors);
  const list = value.competitors || [];

  const handleToggleNoCompetitors = () => {
    if (!hasNo) {
      onChange({ hasNoCompetitors: true, competitors: [] });
    } else {
      onChange({
        hasNoCompetitors: false,
        competitors: [{ name: '', distanceValue: 500, distanceUnit: 'm', distance: '500 m', description: '' }],
      });
    }
  };

  const handleAddCompetitor = () => {
    onChange({
      hasNoCompetitors: false,
      competitors: [...list, { name: '', distanceValue: null, distanceUnit: 'm', distance: '', description: '' }],
    });
  };

  const handleUpdateCompetitor = (idx: number, field: string, val: any) => {
    const updated = [...list];
    const item = { ...updated[idx], [field]: val };

    // Synchronize distance string with numeric value and unit
    if (field === 'distanceValue' || field === 'distanceUnit') {
      const dVal = field === 'distanceValue' ? val : (item.distanceValue ?? null);
      const dUnit = field === 'distanceUnit' ? val : (item.distanceUnit || 'm');
      if (dVal !== '' && dVal !== null && dVal !== undefined && !isNaN(dVal)) {
        item.distance = `${dVal} ${dUnit}`;
      } else {
        item.distance = '';
      }
    }

    updated[idx] = item;
    onChange({ ...value, competitors: updated });
  };

  const handleRemoveCompetitor = (idx: number) => {
    const updated = list.filter((_, i) => i !== idx);
    onChange({ ...value, competitors: updated });
  };

  return (
    <div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.45 }}>
        {options?.helperText ||
          'List existing local competitors or select "I am not aware of any nearby competitors". Google Maps listing is not required.'}
      </div>

      {/* Explicit No Competitors Checkbox */}
      <div
        onClick={handleToggleNoCompetitors}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 16px',
          background: hasNo ? 'var(--brand-green-light)' : 'var(--bg-subtle)',
          border: `1px solid ${hasNo ? 'var(--brand-green-border)' : 'var(--border-light)'}`,
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          marginBottom: '20px',
        }}
      >
        <input
          type="checkbox"
          checked={hasNo}
          onChange={handleToggleNoCompetitors}
          style={{ width: '18px', height: '18px', accentColor: 'var(--brand-green)', cursor: 'pointer' }}
        />
        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: hasNo ? 'var(--brand-green)' : 'var(--text-main)' }}>
          {options?.noCompetitorsLabel || 'I am not aware of any nearby competitors'}
        </span>
      </div>

      {/* Competitor list when hasNo is false */}
      {!hasNo && (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
            {list.map((comp, idx) => {
              const currentUnit = comp.distanceUnit || (comp.distance?.toLowerCase().includes('km') ? 'km' : 'm');
              const currentVal =
                comp.distanceValue !== undefined && comp.distanceValue !== null
                  ? comp.distanceValue
                  : (comp.distance ? parseFloat(comp.distance) || '' : '');

              return (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--brand-green)' }}>
                      Competitor #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCompetitor(idx)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#dc2626',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.8rem',
                      }}
                    >
                      <Trash2 size={14} />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                        Competitor Name / Business Type <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="input-control"
                        value={comp.name}
                        onChange={(e) => handleUpdateCompetitor(idx, 'name', e.target.value)}
                        placeholder="e.g. Ramesh General Store, Local Kirana"
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                        Approximate Distance
                      </label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          className="input-control"
                          style={{ flex: 1 }}
                          value={currentVal}
                          onChange={(e) => {
                            const val = e.target.value === '' ? null : Math.max(0, parseFloat(e.target.value) || 0);
                            handleUpdateCompetitor(idx, 'distanceValue', val);
                          }}
                          placeholder="e.g. 500 or 2"
                        />
                        <select
                          className="select-control"
                          style={{ width: '80px', padding: '8px 10px', background: 'var(--bg-surface)' }}
                          value={currentUnit}
                          onChange={(e) => handleUpdateCompetitor(idx, 'distanceUnit', e.target.value as 'm' | 'km')}
                        >
                          <option value="m">m (meters)</option>
                          <option value="km">km</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Short Description / Key Offerings (Optional)
                    </label>
                    <input
                      type="text"
                      className="input-control"
                      value={comp.description || ''}
                      onChange={(e) => handleUpdateCompetitor(idx, 'description', e.target.value)}
                      placeholder="e.g. Sells packaged snacks; open only in evenings"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleAddCompetitor}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} />
            <span>Add Another Competitor</span>
          </button>
        </div>
      )}
    </div>
  );
};

/* ========================================================================= */
/* QUESTION 3 COMPONENT: SEASONAL AND ENVIRONMENTAL CONSTRAINTS */
/* ========================================================================= */
const QuestionSeasonalConstraints: React.FC<{
  options: any;
  value: { constraints?: string[]; affectedMonths?: string[]; explanation?: string };
  onChange: (val: any) => void;
}> = ({ options, value, onChange }) => {
  const choices = options?.choices || [];
  const allMonths = options?.months || [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const selectedConstraints = value.constraints || [];
  const selectedMonths = value.affectedMonths || [];

  const handleToggleConstraint = (key: string) => {
    let next: string[];
    if (key === 'no_constraints') {
      next = selectedConstraints.includes('no_constraints') ? [] : ['no_constraints'];
    } else {
      const filtered = selectedConstraints.filter((c) => c !== 'no_constraints');
      if (filtered.includes(key)) {
        next = filtered.filter((c) => c !== key);
      } else {
        next = [...filtered, key];
      }
    }
    onChange({ ...value, constraints: next });
  };

  const handleToggleMonth = (m: string) => {
    const next = selectedMonths.includes(m)
      ? selectedMonths.filter((item) => item !== m)
      : [...selectedMonths, m];
    onChange({ ...value, affectedMonths: next });
  };

  return (
    <div>
      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '10px' }}>
        Select all applicable seasonal factors:
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        {choices.map((c: any) => {
          const isSel = selectedConstraints.includes(c.key);
          return (
            <div
              key={c.key}
              onClick={() => handleToggleConstraint(c.key)}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                border: isSel ? '2px solid var(--brand-green)' : '1px solid var(--border-light)',
                background: isSel ? 'var(--brand-green-light)' : 'var(--bg-subtle)',
                color: isSel ? 'var(--brand-green)' : 'var(--text-main)',
                fontWeight: isSel ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
            >
              <input
                type="checkbox"
                checked={isSel}
                onChange={() => handleToggleConstraint(c.key)}
                style={{ accentColor: 'var(--brand-green)', cursor: 'pointer' }}
              />
              <span>{c.label}</span>
            </div>
          );
        })}
      </div>

      {/* Affected Months Picker */}
      {!selectedConstraints.includes('no_constraints') && selectedConstraints.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>
            Which months are most affected? (Optional)
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {allMonths.map((m: string) => {
              const isM = selectedMonths.includes(m);
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleToggleMonth(m)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '16px',
                    border: isM ? '1px solid var(--brand-green)' : '1px solid var(--border-light)',
                    background: isM ? 'var(--brand-green-light)' : 'var(--bg-surface)',
                    color: isM ? 'var(--brand-green)' : 'var(--text-secondary)',
                    fontSize: '0.78rem',
                    fontWeight: isM ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {m.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
          Short optional explanation:
        </label>
        <textarea
          className="input-control"
          rows={2}
          value={value.explanation || ''}
          onChange={(e) => onChange({ ...value, explanation: e.target.value })}
          placeholder="e.g. Sales increase during festival months, but monsoon reduces foot traffic in July."
        />
      </div>
    </div>
  );
};

/* ========================================================================= */
/* QUESTION 4 COMPONENT: LOCAL DEMAND */
/* ========================================================================= */
const QuestionLocalDemand: React.FC<{
  options: any;
  value: { demandLevel?: string; rationale?: string };
  onChange: (val: any) => void;
}> = ({ options, value, onChange }) => {
  const choices = options?.choices || [
    { key: 'HIGH', label: 'High' },
    { key: 'MODERATE', label: 'Moderate' },
    { key: 'LOW', label: 'Low' },
    { key: 'NOT_SURE', label: 'Not Sure' },
  ];

  return (
    <div>
      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '10px' }}>
        Expected level of local demand:
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {choices.map((c: any) => {
          const isSel = value.demandLevel === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => onChange({ ...value, demandLevel: c.key })}
              style={{
                padding: '16px 14px',
                borderRadius: 'var(--radius-md)',
                border: isSel ? '2px solid var(--brand-green)' : '1px solid var(--border-light)',
                background: isSel ? 'var(--brand-green-light)' : 'var(--bg-subtle)',
                color: isSel ? 'var(--brand-green)' : 'var(--text-main)',
                fontWeight: isSel ? 700 : 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      <div>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
          {options?.followUpQuestion || 'What makes you think customers in this area will need your product or service? (Optional)'}
        </label>
        <textarea
          className="input-control"
          rows={3}
          value={value.rationale || ''}
          onChange={(e) => onChange({ ...value, rationale: e.target.value })}
          placeholder="e.g. Nearest shop is 5km away; local residents currently travel to the weekly market."
        />
      </div>
    </div>
  );
};

/* ========================================================================= */
/* QUESTION 5 COMPONENT: CUSTOMERS AND MARKET ACCESS */
/* ========================================================================= */
const QuestionCustomersMarket: React.FC<{
  options: any;
  value: { customerGroups?: string[]; salesChannels?: string };
  onChange: (val: any) => void;
}> = ({ options, value, onChange }) => {
  const customerGroups = options?.customerGroups || [];
  const selected = value.customerGroups || [];

  const handleToggleGroup = (key: string) => {
    const next = selected.includes(key)
      ? selected.filter((k) => k !== key)
      : [...selected, key];
    onChange({ ...value, customerGroups: next });
  };

  return (
    <div>
      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '10px' }}>
        Who are your expected customer segments? (Select all that apply):
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        {customerGroups.map((g: any) => {
          const isSel = selected.includes(g.key);
          return (
            <div
              key={g.key}
              onClick={() => handleToggleGroup(g.key)}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                border: isSel ? '2px solid var(--brand-green)' : '1px solid var(--border-light)',
                background: isSel ? 'var(--brand-green-light)' : 'var(--bg-subtle)',
                color: isSel ? 'var(--brand-green)' : 'var(--text-main)',
                fontWeight: isSel ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
            >
              <input
                type="checkbox"
                checked={isSel}
                onChange={() => handleToggleGroup(g.key)}
                style={{ accentColor: 'var(--brand-green)', cursor: 'pointer' }}
              />
              <span>{g.label}</span>
            </div>
          );
        })}
      </div>

      <div>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
          {options?.salesChannelPrompt || 'Describe your planned sales and distribution channels (Optional):'}
        </label>
        <textarea
          className="input-control"
          rows={3}
          value={value.salesChannels || ''}
          onChange={(e) => onChange({ ...value, salesChannels: e.target.value })}
          placeholder="e.g. Direct counter retail, weekly village haat stall, delivery on order via phone."
        />
      </div>
    </div>
  );
};

/* ========================================================================= */
/* QUESTION 6 COMPONENT: BUSINESS RISKS AND SUPPORT */
/* ========================================================================= */
const QuestionBusinessRisks: React.FC<{
  options: any;
  value: { challenges?: string[]; supportNeeded?: string };
  onChange: (val: any) => void;
}> = ({ options, value, onChange }) => {
  const challenges = options?.challenges || [];
  const selected = value.challenges || [];

  const handleToggleChallenge = (key: string) => {
    let next: string[];
    if (key === 'not_sure') {
      next = selected.includes('not_sure') ? [] : ['not_sure'];
    } else {
      const filtered = selected.filter((k) => k !== 'not_sure');
      if (filtered.includes(key)) {
        next = filtered.filter((k) => k !== key);
      } else {
        next = [...filtered, key];
      }
    }
    onChange({ ...value, challenges: next });
  };

  return (
    <div>
      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '10px' }}>
        What are the main challenges you expect? (Select all that apply):
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        {challenges.map((c: any) => {
          const isSel = selected.includes(c.key);
          return (
            <div
              key={c.key}
              onClick={() => handleToggleChallenge(c.key)}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                border: isSel ? '2px solid var(--brand-green)' : '1px solid var(--border-light)',
                background: isSel ? 'var(--brand-green-light)' : 'var(--bg-subtle)',
                color: isSel ? 'var(--brand-green)' : 'var(--text-main)',
                fontWeight: isSel ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
            >
              <input
                type="checkbox"
                checked={isSel}
                onChange={() => handleToggleChallenge(c.key)}
                style={{ accentColor: 'var(--brand-green)', cursor: 'pointer' }}
              />
              <span>{c.label}</span>
            </div>
          );
        })}
      </div>

      <div>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
          {options?.supportPrompt || 'What specific support, training, or resources would help you overcome these challenges? (Optional):'}
        </label>
        <textarea
          className="input-control"
          rows={3}
          value={value.supportNeeded || ''}
          onChange={(e) => onChange({ ...value, supportNeeded: e.target.value })}
          placeholder="e.g. Technical training on machinery maintenance, linkage with wholesale grain suppliers."
        />
      </div>
    </div>
  );
};
