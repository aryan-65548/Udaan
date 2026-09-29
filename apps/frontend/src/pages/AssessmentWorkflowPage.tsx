import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  type AssessmentDetail,
  getAssessmentById,
  updateAssessment,
  getAssessmentInputs,
  putAssessmentInput,
} from '../api/assessments';
import {
  calculateFinance,
  getLatestFinance,
  type CalculateFinanceResponse,
} from '../api/finance';
import { Stepper, type AssessmentStep } from '../components/Stepper';
import { StatusBadge } from '../components/StatusBadge';
import { Alert } from '../components/Alert';
import { LocationSelector } from '../components/LocationSelector';
import { CategorySelector } from '../components/CategorySelector';
import { FinancialReportBreakdown } from '../components/FinancialReportBreakdown';
import { SahayakQuestionnaire } from '../components/SahayakQuestionnaire';
import { FeasibilityReportView } from '../components/FeasibilityReportView';
import { getFeasibilityReport, type FeasibilityReportData } from '../api/questionnaire';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  RefreshCw,
  Edit,
  Lightbulb,
  Coins,
  MapPin,
  Briefcase,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface AssessmentWorkflowPageProps {
  assessmentId: string;
  onNavigate: (view: string, assessmentId?: string) => void;
}

export const AssessmentWorkflowPage: React.FC<AssessmentWorkflowPageProps> = ({
  assessmentId,
  onNavigate,
}) => {
  const { language, t } = useLanguage();

  const [currentStep, setCurrentStep] = useState<AssessmentStep>('basic');
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submissionComplete, setSubmissionComplete] = useState(false);

  // Step 1: Basic Info Form State
  const [basicLocationId, setBasicLocationId] = useState('');
  const [basicCategoryId, setBasicCategoryId] = useState('');
  const [customCategoryText, setCustomCategoryText] = useState('');
  const [basicLanguage, setBasicLanguage] = useState<'en' | 'hi' | 'gu'>('en');
  const [locationExtraDetails, setLocationExtraDetails] = useState<{
    locationSelectionMethod?: 'ADMINISTRATIVE' | 'GOOGLE_MAPS';
    formattedAddress?: string;
    latitude?: number;
    longitude?: number;
    googlePlaceId?: string;
    stateName?: string;
    districtName?: string;
    blockName?: string;
    villageName?: string;
  } | null>(null);

  // Step 2: Business Idea & Resources Form State
  const [businessIdea, setBusinessIdea] = useState('');
  const [selectedResources, setSelectedResources] = useState<{
    hasLand: boolean;
    hasShop: boolean;
    hasMachinery: boolean;
    hasTools: boolean;
    hasInfrastructure: boolean;
    hasSavings: boolean;
    hasOther: boolean;
    hasNone: boolean;
  }>({
    hasLand: false,
    hasShop: false,
    hasMachinery: false,
    hasTools: false,
    hasInfrastructure: false,
    hasSavings: false,
    hasOther: false,
    hasNone: false,
  });
  const [otherResourceDesc, setOtherResourceDesc] = useState('');
  const [availableFunds, setAvailableFunds] = useState<number | ''>('');

  // Step 3: Financial Contribution Form State
  const [projectCost, setProjectCost] = useState<number | ''>('');
  const [ownContribution, setOwnContribution] = useState<number | ''>('');
  const [savedFinance, setSavedFinance] = useState<CalculateFinanceResponse | null>(null);
  const [isCalculatingFinance, setIsCalculatingFinance] = useState(false);
  const [feasibilityReport, setFeasibilityReport] = useState<FeasibilityReportData | null>(null);

  // Load all assessment data from real backend
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [detail, inputList] = await Promise.all([
        getAssessmentById(assessmentId),
        getAssessmentInputs(assessmentId),
      ]);

      setAssessment(detail);
      setBasicLocationId(detail.locationId);
      setBasicCategoryId(detail.businessCategoryId);
      setBasicLanguage(detail.language);

      if (detail.status === 'COMPLETED') {
        setSubmissionComplete(true);
      }

      const inputMap = new Map(inputList.map((i) => [i.inputKey, i]));

      // Populate Business Idea
      const ideaVal = inputMap.get('business_idea')?.valueText || '';
      setBusinessIdea(ideaVal);

      // Populate Custom Category
      const customCat = inputMap.get('custom_business_category')?.valueText || '';
      setCustomCategoryText(customCat);

      // Populate Resources
      const rLand = inputMap.get('has_land')?.valueBoolean ?? false;
      const rShop = inputMap.get('has_shop')?.valueBoolean ?? false;
      const rMach = inputMap.get('has_equipment')?.valueBoolean ?? false;
      const rTools = inputMap.get('has_tools')?.valueBoolean ?? false;
      const rInfra = inputMap.get('has_room')?.valueBoolean ?? false;
      const rSavings = inputMap.get('has_savings')?.valueBoolean ?? false;
      const rOther = inputMap.get('has_other_resources')?.valueBoolean ?? false;
      const rNone = inputMap.get('has_no_resources')?.valueBoolean ?? false;

      setSelectedResources({
        hasLand: rLand,
        hasShop: rShop,
        hasMachinery: rMach,
        hasTools: rTools,
        hasInfrastructure: rInfra,
        hasSavings: rSavings,
        hasOther: rOther,
        hasNone: rNone,
      });

      const oDesc = inputMap.get('other_resources_desc')?.valueText || '';
      setOtherResourceDesc(oDesc);

      const aFunds = inputMap.get('available_cash_funds')?.valueNumber;
      if (aFunds !== null && aFunds !== undefined && aFunds !== '') {
        setAvailableFunds(Number(aFunds));
      }

      // Populate Project Cost
      const pCost =
        inputMap.get('project_cost')?.valueNumber ??
        inputMap.get('estimated_project_cost')?.valueNumber;
      if (pCost !== null && pCost !== undefined && pCost !== '') {
        setProjectCost(Number(pCost));
      }

      // Populate Financial Contribution (own funds to invest)
      const ownCap =
        inputMap.get('own_contribution')?.valueNumber ??
        inputMap.get('initial_own_capital')?.valueNumber ??
        inputMap.get('available_margin_capital')?.valueNumber;
      if (ownCap !== null && ownCap !== undefined && ownCap !== '') {
        setOwnContribution(Number(ownCap));
      }

      // Load latest persisted finance run if available
      try {
        const fin = await getLatestFinance(assessmentId);
        if (fin?.run) {
          const tenure = fin.scheme?.tenureMonths || 0;
          const mor = fin.scheme?.moratoriumMonths || 0;
          const activeMonths = tenure - mor;
          const activeRepayments = activeMonths > 0 ? activeMonths / 3 : 0;
          const periodicRate = fin.scheme?.interestRate ? (Number(fin.scheme.interestRate) / 4).toFixed(4) : undefined;

          setSavedFinance({
            status: 'SUCCESS',
            runId: fin.run.id,
            schemeCode: fin.scheme?.schemeCode,
            schemeName: fin.scheme?.schemeName,
            financeResult: {
              loanStructure: {
                projectCost: fin.run.projectCost,
                availableMarginCapital: fin.run.marginContribution,
                requiredOwnContribution: fin.run.requiredOwnContribution,
                shortfall: fin.run.shortfall,
                baseLoanAmount: fin.run.baseLoanAmount,
                loanAmount: fin.run.loanAmount,
                theoretical10PercentMargin: fin.run.theoretical10PercentMargin,
                financingPercentage: fin.run.financingPercentage,
              },
              annualInterestRate: fin.scheme?.interestRate ?? undefined,
              quarterlyPeriodicRate: periodicRate,
              totalTenureMonths: tenure,
              moratoriumMonths: mor,
              activeRepaymentMonths: activeMonths,
              numberOfRepayments: activeRepayments,
              paymentFrequency: fin.scheme?.paymentFrequency || 'QUARTERLY',
              moratoriumInterestTreatment: fin.run.moratoriumInterestTreatment,
              installmentAmount: fin.run.installmentAmount,
              annualDebtService: fin.run.annualDebtService,
              totalPrincipal: fin.run.loanAmount,
              totalInterest: fin.run.totalInterest,
              totalRepayment: fin.run.totalRepayment,
              isScheduleCalculable: fin.run.isScheduleCalculable,
              schedule: fin.schedule || [],
              dscrResult: {
                monthlyOperatingSurplus: fin.run.monthlyOperatingSurplus,
                annualOperatingSurplus: fin.run.annualCashAvailable,
                annualCashAvailable: fin.run.annualCashAvailable,
                annualDebtService: fin.run.annualDebtService,
                dscr: fin.run.dscr,
              },
              calculationVersion: fin.run.calculationVersion,
            },
          });
        }
      } catch {
        // Finance run not yet computed
      }

      // Check if feasibility report or questionnaire is active
      if (
        detail.status === 'REPORT_READY' ||
        detail.status === 'COMPLETED' ||
        detail.aiStatus === 'READY'
      ) {
        try {
          const rpt = await getFeasibilityReport(assessmentId);
          setFeasibilityReport(rpt);
          setCurrentStep('report');
          setSubmissionComplete(true);
        } catch {
          // Report not yet generated
        }
      } else if (
        detail.status === 'AI_QUESTIONING' ||
        detail.aiStatus === 'QUESTIONING'
      ) {
        setCurrentStep('sahayak');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load assessment details');
    } finally {
      setIsLoading(false);
    }
  }, [assessmentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showSavedMessage = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 3500);
  };

  // Step 1: Save Basic Details
  const handleSaveBasic = async () => {
    if (!basicLocationId) {
      setErrorMsg(t.selectDistrict + ' / ' + t.selectState + ' (' + t.required + ')');
      return;
    }
    if (!basicCategoryId) {
      setErrorMsg(t.selectCategory + ' (' + t.required + ')');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    try {
      await updateAssessment(assessmentId, {
        locationId: basicLocationId,
        businessCategoryId: basicCategoryId,
        language: basicLanguage,
        ...(locationExtraDetails && {
          locationSelectionMethod: locationExtraDetails.locationSelectionMethod,
          stateName: locationExtraDetails.stateName,
          districtName: locationExtraDetails.districtName,
          blockName: locationExtraDetails.blockName,
          villageName: locationExtraDetails.villageName,
          formattedAddress: locationExtraDetails.formattedAddress,
          latitude: locationExtraDetails.latitude,
          longitude: locationExtraDetails.longitude,
          googlePlaceId: locationExtraDetails.googlePlaceId,
        }),
      });
      const reloaded = await getAssessmentById(assessmentId);
      setAssessment(reloaded);

      if (customCategoryText.trim()) {
        await putAssessmentInput(assessmentId, 'custom_business_category', {
          questionText: t.customCategoryLabel,
          inputType: 'TEXT',
          valueText: customCategoryText.trim(),
          source: 'USER',
        });
      }

      showSavedMessage(t.saved);
      setCurrentStep('idea');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update basic setup');
    } finally {
      setIsSaving(false);
    }
  };

  // Step 2: Save Idea & Resources
  const handleSaveIdeaAndResources = async () => {
    if (!businessIdea.trim()) {
      setErrorMsg(t.businessIdeaRequired);
      return;
    }

    if (availableFunds !== '') {
      const numFunds = Number(availableFunds);
      if (isNaN(numFunds) || !isFinite(numFunds) || numFunds < 0) {
        setErrorMsg(t.invalidAmountError);
        return;
      }
    }

    setIsSaving(true);
    setErrorMsg(null);
    try {
      await Promise.all([
        putAssessmentInput(assessmentId, 'business_idea', {
          questionText: t.businessIdeaTitle,
          inputType: 'TEXT',
          valueText: businessIdea.trim(),
          source: 'USER',
        }),
        putAssessmentInput(assessmentId, 'has_land', {
          questionText: t.resourceLand,
          inputType: 'BOOLEAN',
          valueBoolean: selectedResources.hasLand,
          source: 'USER',
        }),
        putAssessmentInput(assessmentId, 'has_shop', {
          questionText: t.resourceShop,
          inputType: 'BOOLEAN',
          valueBoolean: selectedResources.hasShop,
          source: 'USER',
        }),
        putAssessmentInput(assessmentId, 'has_equipment', {
          questionText: t.resourceMachinery,
          inputType: 'BOOLEAN',
          valueBoolean: selectedResources.hasMachinery,
          source: 'USER',
        }),
        putAssessmentInput(assessmentId, 'has_tools', {
          questionText: t.resourceTools,
          inputType: 'BOOLEAN',
          valueBoolean: selectedResources.hasTools,
          source: 'USER',
        }),
        putAssessmentInput(assessmentId, 'has_room', {
          questionText: t.resourceInfrastructure,
          inputType: 'BOOLEAN',
          valueBoolean: selectedResources.hasInfrastructure,
          source: 'USER',
        }),
        putAssessmentInput(assessmentId, 'has_savings', {
          questionText: t.resourceSavings,
          inputType: 'BOOLEAN',
          valueBoolean: selectedResources.hasSavings,
          source: 'USER',
        }),
        putAssessmentInput(assessmentId, 'has_other_resources', {
          questionText: t.resourceOther,
          inputType: 'BOOLEAN',
          valueBoolean: selectedResources.hasOther,
          source: 'USER',
        }),
        putAssessmentInput(assessmentId, 'has_no_resources', {
          questionText: t.resourceNone,
          inputType: 'BOOLEAN',
          valueBoolean: selectedResources.hasNone,
          source: 'USER',
        }),
        putAssessmentInput(assessmentId, 'other_resources_desc', {
          questionText: t.resourceOther,
          inputType: 'TEXT',
          valueText: selectedResources.hasOther ? otherResourceDesc.trim() : '',
          source: 'USER',
        }),
        putAssessmentInput(assessmentId, 'available_cash_funds', {
          questionText: t.availableFundsTitle,
          inputType: 'NUMBER',
          valueNumber: availableFunds !== '' ? Number(availableFunds) : null,
          source: 'USER',
        }),
      ]);

      showSavedMessage(t.saved);
      setCurrentStep('finance');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save business idea and resources');
    } finally {
      setIsSaving(false);
    }
  };

  // Step 3: Save Financial Contribution & Calculate Scheme
  const handleSaveFinance = async () => {
    if (projectCost === '') {
      setErrorMsg(t.projectCostRequired);
      return;
    }

    const numProjectCost = Number(projectCost);
    if (isNaN(numProjectCost) || !isFinite(numProjectCost) || numProjectCost <= 0) {
      setErrorMsg(t.negativeProjectCostError);
      return;
    }

    if (ownContribution === '') {
      setErrorMsg(t.ownContributionRequired);
      return;
    }

    const numContrib = Number(ownContribution);
    if (isNaN(numContrib) || !isFinite(numContrib) || numContrib < 0) {
      setErrorMsg(t.negativeContributionError);
      return;
    }

    // Validate own contribution does not exceed declared available funds
    if (availableFunds !== '' && availableFunds !== null && availableFunds !== undefined) {
      const numAvailable = Number(availableFunds);
      if (!isNaN(numAvailable) && isFinite(numAvailable) && numContrib > numAvailable) {
        setErrorMsg(`${t.contributionExceedsFundsError} (₹${numAvailable.toLocaleString('en-IN')})`);
        return;
      }
    }

    setIsSaving(true);
    setIsCalculatingFinance(true);
    setErrorMsg(null);
    try {
      await Promise.all([
        putAssessmentInput(assessmentId, 'project_cost', {
          questionText: t.projectCostTitle,
          inputType: 'NUMBER',
          valueNumber: numProjectCost,
          source: 'USER',
        }),
        putAssessmentInput(assessmentId, 'estimated_project_cost', {
          questionText: t.projectCostTitle,
          inputType: 'NUMBER',
          valueNumber: numProjectCost,
          source: 'USER',
        }),
        putAssessmentInput(assessmentId, 'own_contribution', {
          questionText: t.ownContributionTitle,
          inputType: 'NUMBER',
          valueNumber: numContrib,
          source: 'USER',
        }),
        putAssessmentInput(assessmentId, 'initial_own_capital', {
          questionText: t.ownContributionTitle,
          inputType: 'NUMBER',
          valueNumber: numContrib,
          source: 'USER',
        }),
        putAssessmentInput(assessmentId, 'available_margin_capital', {
          questionText: t.ownContributionTitle,
          inputType: 'NUMBER',
          valueNumber: numContrib,
          source: 'USER',
        }),
      ]);

      const finRes = await calculateFinance(assessmentId, {
        project_cost: numProjectCost,
        own_contribution: numContrib,
        available_margin_capital: numContrib,
        available_cash_funds: availableFunds !== '' ? Number(availableFunds) : undefined,
      });

      setSavedFinance(finRes);
      showSavedMessage(t.saved);
      setCurrentStep('review');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save financial parameters and calculate scheme');
    } finally {
      setIsSaving(false);
      setIsCalculatingFinance(false);
    }
  };

  // Step 4: Final Submit Assessment -> transitions to Sahayak Questionnaire
  const handleSubmitAssessment = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    try {
      // Reload fresh assessment details
      const reloaded = await getAssessmentById(assessmentId);
      setAssessment(reloaded);
      setCurrentStep('sahayak');
      showSavedMessage('Assessment inputs saved successfully. Opening Sahayak advisory questionnaire.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to prepare questionnaire');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResourceToggle = (key: keyof typeof selectedResources) => {
    setSelectedResources((prev) => {
      if (key === 'hasNone') {
        const nextVal = !prev.hasNone;
        if (nextVal) {
          return {
            hasLand: false,
            hasShop: false,
            hasMachinery: false,
            hasTools: false,
            hasInfrastructure: false,
            hasSavings: false,
            hasOther: false,
            hasNone: true,
          };
        }
        return { ...prev, hasNone: false };
      } else {
        return {
          ...prev,
          [key]: !prev[key],
          hasNone: false,
        };
      }
    });
  };

  if (isLoading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <div className="spinner" style={{ width: '32px', height: '32px', marginBottom: '12px' }} />
        <div style={{ color: 'var(--text-muted)' }}>{t.loading}</div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto' }}>
        <Alert type="error" title="Assessment Not Found">
          {errorMsg || 'Unable to retrieve the requested assessment.'}
        </Alert>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => onNavigate('dashboard')}
          style={{ marginTop: '16px' }}
        >
          <ArrowLeft size={16} />
          <span>{t.returnToDashboard}</span>
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onNavigate('dashboard')}
        >
          <ArrowLeft size={16} />
          <span>{t.dashboard}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StatusBadge status={assessment.status} />
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={loadData}
            title={t.refresh}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Stepper Navigation */}
      <Stepper
        currentStep={currentStep}
        onStepChange={async (step) => {
          setCurrentStep(step);
          if (step === 'report' && !feasibilityReport) {
            try {
              const rpt = await getFeasibilityReport(assessmentId);
              setFeasibilityReport(rpt);
            } catch {
              // FeasibilityReportView will manage self-fetch and retry
            }
          }
        }}
        completedSteps={{
          basic: Boolean(assessment.locationId && assessment.businessCategoryId),
          idea: Boolean(businessIdea.trim()),
          finance: ownContribution !== '' && projectCost !== '',
          review: currentStep === 'sahayak' || currentStep === 'report' || submissionComplete,
          sahayak: currentStep === 'report' || submissionComplete,
          report: currentStep === 'report' && Boolean(feasibilityReport),
        }}
      />

      {/* Alerts */}
      {errorMsg && (
        <Alert type="error" className="mb-4">
          {errorMsg}
        </Alert>
      )}

      {saveSuccessMsg && (
        <Alert type="success" className="mb-4">
          {saveSuccessMsg}
        </Alert>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: BASIC SETUP */}
      {/* ========================================================================= */}
      {currentStep === 'basic' && (
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '6px' }}>{t.basicDetailsTitle}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {t.basicDetailsSubtitle}
            </p>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label className="form-label">{t.location}</label>
            <LocationSelector
              value={basicLocationId}
              onChange={(id, _locObj, extra) => {
                setBasicLocationId(id);
                if (extra) {
                  setLocationExtraDetails(extra);
                }
              }}
              disabled={isSaving}
            />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label className="form-label">{t.businessCategory}</label>
            <CategorySelector
              value={basicCategoryId}
              onChange={(id) => setBasicCategoryId(id)}
              customCategory={customCategoryText}
              onCustomCategoryChange={(text) => setCustomCategoryText(text)}
              disabled={isSaving}
            />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label className="form-label">{t.preferredLanguage}</label>
            <select
              className="select-control"
              style={{ maxWidth: '300px' }}
              value={basicLanguage}
              onChange={(e) => setBasicLanguage(e.target.value as any)}
              disabled={isSaving}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="gu">ગુજરાતી (Gujarati)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveBasic}
              disabled={isSaving || !basicLocationId || !basicCategoryId}
            >
              <Save size={16} />
              <span>{isSaving ? t.saving : t.next}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: BUSINESS IDEA & AVAILABLE RESOURCES */}
      {/* ========================================================================= */}
      {currentStep === 'idea' && (
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-green)', marginBottom: '4px' }}>
              <Lightbulb size={18} />
              <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
                Step 2 of 4
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '6px' }}>{t.businessIdeaTitle}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {t.businessIdeaSubtitle}
            </p>
          </div>

          {/* Business Idea Multiline Field */}
          <div className="form-group" style={{ marginBottom: '28px' }}>
            <textarea
              className="textarea-control"
              rows={4}
              value={businessIdea}
              onChange={(e) => setBusinessIdea(e.target.value)}
              placeholder={t.businessIdeaPlaceholder}
              disabled={isSaving}
              required
            />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              {t.businessIdeaExamples}
            </div>
          </div>

          {/* Available Resources Question */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '6px', color: 'var(--text-main)' }}>
              {t.availableResourcesTitle}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
              {t.availableResourcesSubtitle}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { key: 'hasLand' as const, label: t.resourceLand },
                { key: 'hasShop' as const, label: t.resourceShop },
                { key: 'hasMachinery' as const, label: t.resourceMachinery },
                { key: 'hasTools' as const, label: t.resourceTools },
                { key: 'hasInfrastructure' as const, label: t.resourceInfrastructure },
                { key: 'hasSavings' as const, label: t.resourceSavings },
                { key: 'hasOther' as const, label: t.resourceOther },
                { key: 'hasNone' as const, label: t.resourceNone },
              ].map((res) => {
                const checked = selectedResources[res.key];
                return (
                  <label
                    key={res.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${checked ? 'var(--brand-green)' : 'var(--border-light)'}`,
                      background: checked ? 'var(--brand-green-light)' : 'var(--bg-surface)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleResourceToggle(res.key)}
                      disabled={isSaving}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--brand-green)' }}
                    />
                    <span style={{ fontSize: '0.9rem', fontWeight: checked ? 600 : 400 }}>
                      {res.label}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* If Other Resource is selected, show description field */}
            {selectedResources.hasOther && (
              <div style={{ marginTop: '14px' }}>
                <textarea
                  className="textarea-control"
                  rows={2}
                  value={otherResourceDesc}
                  onChange={(e) => setOtherResourceDesc(e.target.value)}
                  placeholder={t.otherResourcePlaceholder}
                  disabled={isSaving}
                />
              </div>
            )}
          </div>

          {/* Available Monetary Funds (₹) */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">{t.availableFundsTitle}</label>
            <div className="form-helper" style={{ marginBottom: '6px' }}>
              {t.availableFundsSubtitle}
            </div>
            <div style={{ maxWidth: '280px' }}>
              <input
                type="number"
                className="input-control"
                value={availableFunds}
                onChange={(e) =>
                  setAvailableFunds(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))
                }
                placeholder={t.availableFundsPlaceholder}
                min={0}
                disabled={isSaving}
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--border-light)',
              paddingTop: '20px',
              marginTop: '32px',
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCurrentStep('basic')}
              disabled={isSaving}
            >
              <ArrowLeft size={16} />
              <span>{t.back}</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveIdeaAndResources}
              disabled={isSaving || !businessIdea.trim()}
            >
              <Save size={16} />
              <span>{isSaving ? t.saving : t.next}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: FINANCIAL CONTRIBUTION & PROJECT COST */}
      {/* ========================================================================= */}
      {currentStep === 'finance' && (() => {
        const numOwnContrib = ownContribution === '' ? 0 : Number(ownContribution);
        const numProjectCost = projectCost === '' ? 0 : Number(projectCost);
        const isContributionExceeded =
          availableFunds !== '' &&
          availableFunds !== null &&
          availableFunds !== undefined &&
          !isNaN(Number(availableFunds)) &&
          isFinite(Number(availableFunds)) &&
          numOwnContrib > Number(availableFunds);

        return (
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-green)', marginBottom: '4px' }}>
                <Coins size={18} />
                <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  Step 3 of 4
                </span>
              </div>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '6px' }}>{t.stepFinance}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {t.ownContributionSubtitle}
              </p>
            </div>

            {/* 1. Proposed Project Cost Field */}
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>
                {t.projectCostTitle} <span className="required">*</span>
              </label>
              <div className="form-helper" style={{ marginBottom: '6px' }}>
                {t.projectCostSubtitle}
              </div>
              <div style={{ maxWidth: '340px', position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                  }}
                >
                  ₹
                </span>
                <input
                  type="number"
                  className="input-control"
                  style={{ paddingLeft: '32px' }}
                  value={projectCost}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setProjectCost('');
                    } else {
                      const parsed = Number(val);
                      setProjectCost(parsed < 0 ? 0 : parsed);
                    }
                  }}
                  placeholder={t.projectCostPlaceholder}
                  min={0}
                  disabled={isSaving}
                  required
                />
              </div>
              {numProjectCost > 5000000 && (
                <div
                  style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#dc2626',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <AlertCircle size={15} />
                  <span>{t.notEligibleProjectCostError}</span>
                </div>
              )}
            </div>

            {/* 2. Own Contribution Amount Field */}
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>
                {t.ownContributionTitle} <span className="required">*</span>
              </label>
              <div className="form-helper" style={{ marginBottom: '6px' }}>
                {t.ownContributionSubtitle}
              </div>
              <div style={{ maxWidth: '340px', position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                  }}
                >
                  ₹
                </span>
                <input
                  type="number"
                  className="input-control"
                  style={{ paddingLeft: '32px' }}
                  value={ownContribution}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setOwnContribution('');
                    } else {
                      const parsed = Number(val);
                      setOwnContribution(parsed < 0 ? 0 : parsed);
                    }
                  }}
                  placeholder={t.ownContributionPlaceholder}
                  min={0}
                  disabled={isSaving}
                  required
                />
              </div>

              {isContributionExceeded && (
                <div
                  style={{
                    marginTop: '10px',
                    padding: '8px 14px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#dc2626',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <AlertCircle size={15} />
                  <span>
                    {t.contributionExceedsFundsError} (₹{Number(availableFunds).toLocaleString('en-IN')})
                  </span>
                </div>
              )}

              <div
                style={{
                  marginTop: '8px',
                  padding: '10px 14px',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                {t.ownContributionNote}
              </div>
            </div>

            {/* 6-Section Authoritative Financial Feasibility Engine */}
            <div style={{ marginTop: '24px' }}>
              <FinancialReportBreakdown
                financeData={savedFinance}
                isLoading={isCalculatingFinance}
                userEnteredProjectCost={projectCost}
                userEnteredOwnContribution={ownContribution}
                availableFunds={availableFunds}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--border-light)',
                paddingTop: '20px',
                marginTop: '32px',
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCurrentStep('idea')}
                disabled={isSaving}
              >
                <ArrowLeft size={16} />
                <span>{t.back}</span>
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveFinance}
                disabled={isSaving || ownContribution === '' || projectCost === '' || isContributionExceeded || numProjectCost > 5000000}
              >
                <Save size={16} />
                <span>{isSaving ? t.saving : t.next}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* STEP 4: REVIEW & SUBMIT */}
      {/* ========================================================================= */}
      {currentStep === 'review' && (
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '6px' }}>{t.reviewTitle}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {t.reviewSubtitle}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
            {/* 1. Setup Summary */}
            <div style={{ background: 'var(--bg-subtle)', padding: '18px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, color: 'var(--brand-green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} />
                  <span>{t.summaryIdentity}</span>
                </h4>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setCurrentStep('basic')}
                >
                  <Edit size={12} />
                  <span>{t.edit}</span>
                </button>
              </div>

              <div className="grid-2" style={{ fontSize: '0.9rem', gap: '8px' }}>
                <div>
                  <strong>{t.createdOn}:</strong> {new Date(assessment.createdAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'gu' ? 'gu-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div>
                  <strong>{t.status}:</strong> <StatusBadge status={assessment.status} />
                </div>
                <div>
                  <strong>{t.businessCategory}:</strong> {customCategoryText || assessment.businessCategory?.name || 'Selected'}
                </div>
                <div>
                  <strong>{t.preferredLanguage}:</strong> {assessment.language.toUpperCase()}
                </div>
              </div>
            </div>

            {/* 2. Business Idea Summary */}
            <div style={{ background: 'var(--bg-subtle)', padding: '18px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, color: 'var(--brand-green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lightbulb size={16} />
                  <span>{t.summaryIdea}</span>
                </h4>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setCurrentStep('idea')}
                >
                  <Edit size={12} />
                  <span>{t.edit}</span>
                </button>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.5 }}>
                {businessIdea || 'Not specified'}
              </p>
            </div>

            {/* 3. Available Resources Summary */}
            <div style={{ background: 'var(--bg-subtle)', padding: '18px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, color: 'var(--brand-green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Briefcase size={16} />
                  <span>{t.summaryResources}</span>
                </h4>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setCurrentStep('idea')}
                >
                  <Edit size={12} />
                  <span>{t.edit}</span>
                </button>
              </div>

              {/* Vertical list of selected resources */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', marginBottom: '14px' }}>
                {selectedResources.hasLand && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                    <CheckCircle2 size={16} color="var(--brand-green)" style={{ flexShrink: 0 }} />
                    <span>{t.resourceLand}</span>
                  </div>
                )}
                {selectedResources.hasShop && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                    <CheckCircle2 size={16} color="var(--brand-green)" style={{ flexShrink: 0 }} />
                    <span>{t.resourceShop}</span>
                  </div>
                )}
                {selectedResources.hasMachinery && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                    <CheckCircle2 size={16} color="var(--brand-green)" style={{ flexShrink: 0 }} />
                    <span>{t.resourceMachinery}</span>
                  </div>
                )}
                {selectedResources.hasTools && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                    <CheckCircle2 size={16} color="var(--brand-green)" style={{ flexShrink: 0 }} />
                    <span>{t.resourceTools}</span>
                  </div>
                )}
                {selectedResources.hasInfrastructure && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                    <CheckCircle2 size={16} color="var(--brand-green)" style={{ flexShrink: 0 }} />
                    <span>{t.resourceInfrastructure}</span>
                  </div>
                )}
                {selectedResources.hasSavings && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                    <CheckCircle2 size={16} color="var(--brand-green)" style={{ flexShrink: 0 }} />
                    <span>{t.resourceSavings}</span>
                  </div>
                )}
                {selectedResources.hasOther && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                    <CheckCircle2 size={16} color="var(--brand-green)" style={{ flexShrink: 0 }} />
                    <span>{t.resourceOther}: {otherResourceDesc}</span>
                  </div>
                )}
                {selectedResources.hasNone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                    <span style={{ fontSize: '0.85rem' }}>ℹ️ {t.resourceNone}</span>
                  </div>
                )}
              </div>

              {/* Separately and clearly displayed monetary funds / cash savings */}
              {availableFunds !== '' && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '10px 14px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {t.availableFundsTitle}
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-green)' }}>
                    ₹{Number(availableFunds).toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>

            {/* 4. Financial Feasibility & Scheme Report */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, color: 'var(--brand-green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Coins size={16} />
                  <span>{t.summaryFinance}</span>
                </h4>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setCurrentStep('finance')}
                >
                  <Edit size={12} />
                  <span>{t.edit}</span>
                </button>
              </div>

              <FinancialReportBreakdown
                financeData={savedFinance}
                userEnteredProjectCost={projectCost}
                userEnteredOwnContribution={ownContribution}
                availableFunds={availableFunds}
              />
            </div>
          </div>

          {/* Submission Action to Sahayak Questionnaire */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(30, 77, 43, 0.05) 0%, rgba(200, 90, 23, 0.05) 100%)',
              border: '1px solid var(--border-light)',
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
            }}
          >
            <h3 style={{ color: 'var(--brand-green)', marginBottom: '8px', fontSize: '1.2rem' }}>
              {t.submitAssessmentBtn || 'Submit Feasibility Assessment'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '18px', maxWidth: '540px', margin: '0 auto 18px' }}>
              Your financial estimates and scheme eligibility are ready. Click below to proceed to Sahayak, where we will ask 6 quick questions about your local business environment before generating the final report.
            </p>
            <div>
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={handleSubmitAssessment}
                disabled={isSaving}
                style={{ padding: '12px 28px', fontSize: '1rem', fontWeight: 600 }}
              >
                {isSaving ? (
                  <>
                    <div className="spinner" />
                    <span>{t.saving || 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <ArrowRight size={18} />
                    <span>Proceed to Sahayak Advisory (6 Questions)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              borderTop: '1px solid var(--border-light)',
              paddingTop: '20px',
              marginTop: '32px',
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCurrentStep('finance')}
              disabled={isSaving}
            >
              <ArrowLeft size={16} />
              <span>{t.back}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: SAHAYAK BUSINESS CONTEXT QUESTIONNAIRE (6 QUESTIONS)             */}
      {/* ========================================================================= */}
      {currentStep === 'sahayak' && (
        <SahayakQuestionnaire
          assessmentId={assessmentId}
          onComplete={(report) => {
            if (report) {
              setFeasibilityReport(report);
            }
            setSubmissionComplete(true);
            setCurrentStep('report');
            showSavedMessage('Sahayak questionnaire completed! Feasibility report generated successfully.');
          }}
          onSaveAndExit={() => onNavigate('dashboard')}
          onBackToAssessment={() => setCurrentStep('review')}
        />
      )}

      {/* ========================================================================= */}
      {/* STEP 6: COMPREHENSIVE FEASIBILITY REPORT                                 */}
      {/* ========================================================================= */}
      {currentStep === 'report' && (
        <FeasibilityReportView
          assessmentId={assessmentId}
          report={feasibilityReport}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
};

