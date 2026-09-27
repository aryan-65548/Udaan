import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  type AssessmentDetail,
  type AssessmentInputRecord,
  getAssessmentById,
  updateAssessment,
  getAssessmentInputs,
  putAssessmentInput,
  patchProfile,
  completeAssessment,
  type InputType,
} from '../api/assessments';
import {
  type ValidationTaskRecord,
  getValidationTasks,
  updateValidationTask,
  type ValidationStatus,
} from '../api/validation';
import { Stepper, type AssessmentStep } from '../components/Stepper';
import { StatusBadge } from '../components/StatusBadge';
import { Alert } from '../components/Alert';
import { ValidationCard } from '../components/ValidationCard';
import { DynamicInputRenderer } from '../components/DynamicInputRenderer';
import { LocationSelector } from '../components/LocationSelector';
import { CategorySelector } from '../components/CategorySelector';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Plus,
} from 'lucide-react';

interface AssessmentWorkflowPageProps {
  assessmentId: string;
  onNavigate: (view: string, assessmentId?: string) => void;
}

export const AssessmentWorkflowPage: React.FC<AssessmentWorkflowPageProps> = ({
  assessmentId,
  onNavigate,
}) => {
  const { t } = useLanguage();

  const [currentStep, setCurrentStep] = useState<AssessmentStep>('basic');
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [inputs, setInputs] = useState<AssessmentInputRecord[]>([]);
  const [validationTasks, setValidationTasks] = useState<ValidationTaskRecord[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completionNotice, setCompletionNotice] = useState<{
    type: 'success' | 'warning' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Profile Form state
  const [profileForm, setProfileForm] = useState<{
    previousExperience: string;
    hasLand: boolean | null;
    hasShop: boolean | null;
    hasRoom: boolean | null;
    hasEquipment: boolean | null;
    expectedWorkingHours: number | '';
    hasKnownCustomers: boolean | null;
  }>({
    previousExperience: '',
    hasLand: null,
    hasShop: null,
    hasRoom: null,
    hasEquipment: null,
    expectedWorkingHours: '',
    hasKnownCustomers: null,
  });

  // Basic Info Form state
  const [basicLocationId, setBasicLocationId] = useState('');
  const [basicCategoryId, setBasicCategoryId] = useState('');
  const [basicLanguage, setBasicLanguage] = useState<'en' | 'hi' | 'gu'>('en');

  // New Custom Input Form state
  const [newCustomKey, setNewCustomKey] = useState('');
  const [newCustomQuestion, setNewCustomQuestion] = useState('');
  const [newCustomType, setNewCustomType] = useState<InputType>('TEXT');
  const [showAddCustomInput, setShowAddCustomInput] = useState(false);

  // Load all assessment data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [detail, inputList, vTasks] = await Promise.all([
        getAssessmentById(assessmentId),
        getAssessmentInputs(assessmentId),
        getValidationTasks(assessmentId),
      ]);

      setAssessment(detail);
      setInputs(inputList);
      setValidationTasks(vTasks);

      // Pre-fill basic details
      setBasicLocationId(detail.locationId);
      setBasicCategoryId(detail.businessCategoryId);
      setBasicLanguage(detail.language);

      // Populate profile state from inputs
      const inputMap = new Map(inputList.map((i) => [i.inputKey, i]));

      const getVal = (snake: string, camel: string) => inputMap.get(snake) || inputMap.get(camel);

      const pExp = getVal('previous_experience', 'previousExperience');
      const pLand = getVal('has_land', 'hasLand');
      const pShop = getVal('has_shop', 'hasShop');
      const pRoom = getVal('has_room', 'hasRoom');
      const pEquip = getVal('has_equipment', 'hasEquipment');
      const pHours = getVal('expected_working_hours', 'expectedWorkingHours');
      const pCust = getVal('has_known_customers', 'hasKnownCustomers');

      setProfileForm({
        previousExperience: pExp?.valueText || '',
        hasLand: pLand?.valueBoolean !== null && pLand?.valueBoolean !== undefined ? pLand.valueBoolean : null,
        hasShop: pShop?.valueBoolean !== null && pShop?.valueBoolean !== undefined ? pShop.valueBoolean : null,
        hasRoom: pRoom?.valueBoolean !== null && pRoom?.valueBoolean !== undefined ? pRoom.valueBoolean : null,
        hasEquipment: pEquip?.valueBoolean !== null && pEquip?.valueBoolean !== undefined ? pEquip.valueBoolean : null,
        expectedWorkingHours:
          pHours?.valueNumber !== null && pHours?.valueNumber !== undefined ? Number(pHours.valueNumber) : '',
        hasKnownCustomers: pCust?.valueBoolean !== null && pCust?.valueBoolean !== undefined ? pCust.valueBoolean : null,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load assessment details');
    } finally {
      setIsLoading(false);
    }
  }, [assessmentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Flash message helper
  const showSavedMessage = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 3500);
  };

  // Step 1: Save Basic Info
  const handleSaveBasic = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const updated = await updateAssessment(assessmentId, {
        locationId: basicLocationId,
        businessCategoryId: basicCategoryId,
        language: basicLanguage,
      });
      setAssessment((prev) => (prev ? { ...prev, ...updated } : null));
      showSavedMessage('Basic details updated successfully');
      setCurrentStep('profile');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update basic details');
    } finally {
      setIsSaving(false);
    }
  };

  // Step 2: Save Profile
  const handleSaveProfile = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    try {
      // Build structured payload adhering to patchProfileInputsSchema & ProfileInputItem
      const payload: Record<string, any> = {
        previousExperience: {
          questionText: t.previousExperienceTitle,
          inputType: 'TEXT',
          value: profileForm.previousExperience,
          source: 'USER',
        },
        hasLand: {
          questionText: t.hasLandTitle,
          inputType: 'BOOLEAN',
          value: profileForm.hasLand ?? false,
          source: 'USER',
        },
        hasShop: {
          questionText: t.hasShopTitle,
          inputType: 'BOOLEAN',
          value: profileForm.hasShop ?? false,
          source: 'USER',
        },
        hasRoom: {
          questionText: t.hasRoomTitle,
          inputType: 'BOOLEAN',
          value: profileForm.hasRoom ?? false,
          source: 'USER',
        },
        hasEquipment: {
          questionText: t.hasEquipmentTitle,
          inputType: 'BOOLEAN',
          value: profileForm.hasEquipment ?? false,
          source: 'USER',
        },
        expectedWorkingHours: {
          questionText: t.workingHoursTitle,
          inputType: 'NUMBER',
          value: Number(profileForm.expectedWorkingHours || 0),
          source: 'USER',
        },
        hasKnownCustomers: {
          questionText: t.knownCustomersTitle,
          inputType: 'BOOLEAN',
          value: profileForm.hasKnownCustomers ?? false,
          source: 'USER',
        },
      };

      const updatedInputs = await patchProfile(assessmentId, payload);
      setInputs((prev) => {
        const map = new Map(prev.map((i) => [i.inputKey, i]));
        for (const item of updatedInputs) {
          map.set(item.inputKey, item);
        }
        return Array.from(map.values());
      });

      showSavedMessage('Entrepreneur profile saved successfully');
      setCurrentStep('inputs');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Step 3: Save / Update Single Assessment Input
  const handleSaveInput = async (
    key: string,
    inputType: InputType,
    payload: any,
    questionText?: string | null
  ) => {
    setIsSaving(true);
    try {
      const res = await putAssessmentInput(assessmentId, key, {
        questionText: questionText || key,
        inputType,
        valueText: payload.valueText,
        valueNumber: payload.valueNumber,
        valueBoolean: payload.valueBoolean,
        valueJson: payload.valueJson,
        source: 'USER',
      });

      setInputs((prev) => {
        const next = [...prev];
        const idx = next.findIndex((i) => i.inputKey === key);
        if (idx >= 0) {
          next[idx] = res;
        } else {
          next.push(res);
        }
        return next;
      });

      showSavedMessage(`Saved "${key}"`);
    } catch (err: any) {
      setErrorMsg(err.message || `Failed to save input ${key}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Add custom input
  const handleAddCustomInput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomKey.trim()) return;

    const formattedKey = newCustomKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    await handleSaveInput(
      formattedKey,
      newCustomType,
      {
        valueText: newCustomType === 'TEXT' ? '' : undefined,
        valueNumber: newCustomType === 'NUMBER' ? 0 : undefined,
        valueBoolean: newCustomType === 'BOOLEAN' ? false : undefined,
      },
      newCustomQuestion.trim() || newCustomKey.trim()
    );

    setNewCustomKey('');
    setNewCustomQuestion('');
    setShowAddCustomInput(false);
  };

  // Step 4: Update Validation Task
  const handleUpdateTask = async (taskId: string, status: ValidationStatus, notes: string | null) => {
    try {
      const updated = await updateValidationTask(assessmentId, taskId, {
        status,
        notes,
      });

      setValidationTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      showSavedMessage('Ground verification task updated');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update validation task');
    }
  };

  // Step 5: Complete Assessment
  const handleCompleteAssessment = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    setCompletionNotice(null);

    try {
      const completed = await completeAssessment(assessmentId);
      setAssessment((prev) => (prev ? { ...prev, ...completed } : null));
      setCompletionNotice({
        type: 'success',
        message: 'Assessment completed and certified successfully! Feasibility report has been generated.',
      });
    } catch (err: any) {
      if (err.code === 'VALIDATION_INCOMPLETE') {
        setCompletionNotice({
          type: 'warning',
          message:
            'Cannot complete assessment yet: You must verify or skip all 6 ground verification tasks before finalizing.',
        });
      } else if (err.code === 'INVALID_STATE_TRANSITION') {
        // Backend state machine requires REPORT_READY before transition to COMPLETED
        setCompletionNotice({
          type: 'info',
          message:
            `Feasibility Review in Progress: The assessment is currently in status "${assessment?.status || 'IN_PROGRESS'}". Under platform state rules, completion is certified once AI feasibility analysis is run and REPORT_READY is reached. All your inputs and ground validations are safely stored and verified!`,
        });
      } else {
        setErrorMsg(err.message || 'Failed to complete assessment');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Validation status summary
  const pendingTasksCount = validationTasks.filter((t) => t.status === 'PENDING').length;
  const completedTasksCount = validationTasks.filter((t) => t.status === 'COMPLETED').length;
  const skippedTasksCount = validationTasks.filter((t) => t.status === 'SKIPPED').length;

  if (isLoading) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center' }}>
        <div className="spinner" style={{ width: '32px', height: '32px', marginBottom: '12px' }} />
        <div style={{ color: 'var(--text-muted)' }}>Loading assessment workflow...</div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div>
        <Alert type="error" title="Assessment Not Found">
          {errorMsg || 'Unable to retrieve the requested assessment.'}
        </Alert>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => onNavigate('dashboard')}
        >
          <ArrowLeft size={16} />
          <span>Return to Dashboard</span>
        </button>
      </div>
    );
  }

  // Pre-filter custom inputs (excluding the standard profile ones)
  const profileKeys = new Set([
    'previousExperience',
    'previous_experience',
    'hasLand',
    'has_land',
    'hasShop',
    'has_shop',
    'hasRoom',
    'has_room',
    'hasEquipment',
    'has_equipment',
    'expectedWorkingHours',
    'expected_working_hours',
    'hasKnownCustomers',
    'has_known_customers',
  ]);

  const customInputs = inputs.filter((i) => !profileKeys.has(i.inputKey));

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '60px' }}>
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
            title="Reload data"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Stepper Navigation */}
      <Stepper
        currentStep={currentStep}
        onStepChange={(step) => setCurrentStep(step)}
        completedSteps={{
          basic: Boolean(assessment.locationId && assessment.businessCategoryId),
          profile: profileForm.hasLand !== null && profileForm.expectedWorkingHours !== '',
          inputs: customInputs.length > 0,
          validation: pendingTasksCount === 0 && validationTasks.length > 0,
          review: assessment.status === 'COMPLETED',
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

      {/* STEP 1: BASIC DETAILS */}
      {currentStep === 'basic' && (
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '6px' }}>1. Basic Assessment Setup</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Confirm or update the enterprise location, business category, and advisory language.
            </p>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label className="form-label">Location Hierarchy</label>
            <LocationSelector
              value={basicLocationId}
              onChange={(id) => setBasicLocationId(id)}
              disabled={isSaving}
            />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label className="form-label">Business Category</label>
            <CategorySelector
              value={basicCategoryId}
              onChange={(id) => setBasicCategoryId(id)}
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
              <span>{isSaving ? t.saving : 'Save & Continue to Profile'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: ENTREPRENEUR PROFILE */}
      {currentStep === 'profile' && (
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '6px' }}>2. Entrepreneur & Asset Profile</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              These 7 core inputs are analyzed to derive your operational readiness and own-contribution assessment.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveProfile();
            }}
          >
            {/* Field 1: Previous Experience */}
            <div className="form-group">
              <label className="form-label">{t.previousExperienceTitle}</label>
              <div className="form-helper" style={{ marginBottom: '6px' }}>
                {t.previousExperienceDesc}
              </div>
              <textarea
                className="textarea-control"
                value={profileForm.previousExperience}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, previousExperience: e.target.value }))
                }
                placeholder="e.g. 4 years managing local dairy and cattle feed sales..."
                rows={2}
                disabled={isSaving}
              />
            </div>

            {/* Field 2: Has Land */}
            <div className="form-group">
              <label className="form-label">{t.hasLandTitle}</label>
              <div className="form-helper" style={{ marginBottom: '6px' }}>
                {t.hasLandDesc}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${profileForm.hasLand === true ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setProfileForm((prev) => ({ ...prev, hasLand: true }))}
                  disabled={isSaving}
                >
                  {t.yes}
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${profileForm.hasLand === false ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setProfileForm((prev) => ({ ...prev, hasLand: false }))}
                  disabled={isSaving}
                >
                  {t.no}
                </button>
              </div>
            </div>

            {/* Field 3: Has Shop */}
            <div className="form-group">
              <label className="form-label">{t.hasShopTitle}</label>
              <div className="form-helper" style={{ marginBottom: '6px' }}>
                {t.hasShopDesc}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${profileForm.hasShop === true ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setProfileForm((prev) => ({ ...prev, hasShop: true }))}
                  disabled={isSaving}
                >
                  {t.yes}
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${profileForm.hasShop === false ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setProfileForm((prev) => ({ ...prev, hasShop: false }))}
                  disabled={isSaving}
                >
                  {t.no}
                </button>
              </div>
            </div>

            {/* Field 4: Has Room */}
            <div className="form-group">
              <label className="form-label">{t.hasRoomTitle}</label>
              <div className="form-helper" style={{ marginBottom: '6px' }}>
                {t.hasRoomDesc}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${profileForm.hasRoom === true ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setProfileForm((prev) => ({ ...prev, hasRoom: true }))}
                  disabled={isSaving}
                >
                  {t.yes}
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${profileForm.hasRoom === false ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setProfileForm((prev) => ({ ...prev, hasRoom: false }))}
                  disabled={isSaving}
                >
                  {t.no}
                </button>
              </div>
            </div>

            {/* Field 5: Has Equipment */}
            <div className="form-group">
              <label className="form-label">{t.hasEquipmentTitle}</label>
              <div className="form-helper" style={{ marginBottom: '6px' }}>
                {t.hasEquipmentDesc}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${profileForm.hasEquipment === true ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setProfileForm((prev) => ({ ...prev, hasEquipment: true }))}
                  disabled={isSaving}
                >
                  {t.yes}
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${profileForm.hasEquipment === false ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setProfileForm((prev) => ({ ...prev, hasEquipment: false }))}
                  disabled={isSaving}
                >
                  {t.no}
                </button>
              </div>
            </div>

            {/* Field 6: Expected Working Hours */}
            <div className="form-group">
              <label className="form-label">{t.workingHoursTitle}</label>
              <div className="form-helper" style={{ marginBottom: '6px' }}>
                {t.workingHoursDesc}
              </div>
              <div style={{ maxWidth: '240px' }}>
                <input
                  type="number"
                  className="input-control"
                  value={profileForm.expectedWorkingHours}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      expectedWorkingHours: e.target.value === '' ? '' : Number(e.target.value),
                    }))
                  }
                  placeholder="e.g. 8"
                  min={1}
                  max={24}
                  disabled={isSaving}
                />
              </div>
            </div>

            {/* Field 7: Has Known Customers */}
            <div className="form-group">
              <label className="form-label">{t.knownCustomersTitle}</label>
              <div className="form-helper" style={{ marginBottom: '6px' }}>
                {t.knownCustomersDesc}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${profileForm.hasKnownCustomers === true ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setProfileForm((prev) => ({ ...prev, hasKnownCustomers: true }))}
                  disabled={isSaving}
                >
                  {t.yes}
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${profileForm.hasKnownCustomers === false ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setProfileForm((prev) => ({ ...prev, hasKnownCustomers: false }))}
                  disabled={isSaving}
                >
                  {t.no}
                </button>
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

              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                <Save size={16} />
                <span>{isSaving ? t.saving : 'Save & Continue to Inputs'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 3: BUSINESS INPUTS (DYNAMIC RENDERER) */}
      {currentStep === 'inputs' && (
        <div className="card" style={{ padding: '28px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '6px' }}>3. Dynamic Business Inputs</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Key enterprise operational details persisted through the assessment input service.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowAddCustomInput(!showAddCustomInput)}
            >
              <Plus size={16} />
              <span>{showAddCustomInput ? 'Close Form' : 'Add Custom Field'}</span>
            </button>
          </div>

          {/* Add custom input form modal/drawer */}
          {showAddCustomInput && (
            <div
              style={{
                background: 'var(--bg-subtle)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '24px',
                border: '1px solid var(--border-light)',
              }}
            >
              <h4 style={{ marginBottom: '12px' }}>Add New Assessment Input</h4>
              <form onSubmit={handleAddCustomInput}>
                <div className="grid-3" style={{ marginBottom: '12px' }}>
                  <div>
                    <label className="form-label">Key (Identifier)</label>
                    <input
                      type="text"
                      className="input-control"
                      value={newCustomKey}
                      onChange={(e) => setNewCustomKey(e.target.value)}
                      placeholder="e.g. target_monthly_sales"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Display Question / Label</label>
                    <input
                      type="text"
                      className="input-control"
                      value={newCustomQuestion}
                      onChange={(e) => setNewCustomQuestion(e.target.value)}
                      placeholder="e.g. Target monthly sales (units)"
                    />
                  </div>

                  <div>
                    <label className="form-label">Input Type</label>
                    <select
                      className="select-control"
                      value={newCustomType}
                      onChange={(e) => setNewCustomType(e.target.value as InputType)}
                    >
                      <option value="TEXT">TEXT</option>
                      <option value="NUMBER">NUMBER</option>
                      <option value="BOOLEAN">BOOLEAN</option>
                      <option value="DATE">DATE</option>
                      <option value="SELECT">SELECT</option>
                      <option value="MULTI_SELECT">MULTI_SELECT</option>
                      <option value="JSON">JSON</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowAddCustomInput(false)}
                  >
                    {t.cancel}
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving}>
                    Save Field
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Pre-configured Recommended Business Inputs if none exist */}
          {customInputs.length === 0 && (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '24px',
              }}
            >
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                You have not added any custom business parameters yet. You can initialize the recommended business inputs or proceed directly.
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() =>
                    handleSaveInput(
                      'initial_own_capital',
                      'NUMBER',
                      { valueNumber: 50000 },
                      'Initial own capital available for investment (₹)'
                    )
                  }
                  disabled={isSaving}
                >
                  + Add "Initial Own Capital (₹)"
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() =>
                    handleSaveInput(
                      'target_monthly_turnover',
                      'NUMBER',
                      { valueNumber: 75000 },
                      'Estimated monthly gross revenue (₹)'
                    )
                  }
                  disabled={isSaving}
                >
                  + Add "Estimated Monthly Revenue (₹)"
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() =>
                    handleSaveInput(
                      'primary_customer_base',
                      'TEXT',
                      { valueText: 'Local retail buyers and weekly haat' },
                      'Primary customer segment and target market'
                    )
                  }
                  disabled={isSaving}
                >
                  + Add "Primary Customer Segment"
                </button>
              </div>
            </div>
          )}

          {/* Render All Custom Assessment Inputs */}
          {customInputs.map((input) => (
            <div
              key={input.inputKey}
              style={{
                padding: '16px',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '16px',
                background: 'var(--bg-surface)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {input.questionText || input.inputKey}
                  </span>
                  <span
                    style={{
                      marginLeft: '8px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: 'var(--bg-subtle)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {input.inputType}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  key: <code>{input.inputKey}</code>
                </span>
              </div>

              <DynamicInputRenderer
                inputKey={input.inputKey}
                questionText={input.questionText}
                inputType={input.inputType}
                value={{
                  valueText: input.valueText,
                  valueNumber: input.valueNumber,
                  valueBoolean: input.valueBoolean,
                  valueJson: input.valueJson,
                }}
                onChange={(payload) =>
                  handleSaveInput(input.inputKey, input.inputType, payload, input.questionText)
                }
                disabled={isSaving}
              />
            </div>
          ))}

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
              onClick={() => setCurrentStep('profile')}
              disabled={isSaving}
            >
              <ArrowLeft size={16} />
              <span>{t.back}</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setCurrentStep('validation')}
              disabled={isSaving}
            >
              <span>Continue to Ground Verification</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: FIELD VALIDATION */}
      {currentStep === 'validation' && (
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ marginBottom: '24px' }}>
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
              <ShieldCheck size={16} />
              <span>{t.fieldValidation}</span>
            </div>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '6px' }}>{t.validationTitle}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {t.validationSubtitle}
            </p>
          </div>

          {/* Validation Progress Indicator */}
          <div
            style={{
              background: 'var(--bg-subtle)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Status Summary:</span>
              <span style={{ color: 'var(--brand-green)', fontWeight: 600, fontSize: '0.9rem' }}>
                ✓ {completedTasksCount} {t.statusCompleted}
              </span>
              <span style={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>
                — {skippedTasksCount} {t.statusSkipped}
              </span>
              <span style={{ color: '#d97706', fontWeight: 600, fontSize: '0.9rem' }}>
                ○ {pendingTasksCount} {t.statusPending}
              </span>
            </div>

            {pendingTasksCount === 0 ? (
              <span style={{ color: 'var(--brand-green)', fontWeight: 700, fontSize: '0.85rem' }}>
                ✓ All items addressed!
              </span>
            ) : (
              <span style={{ color: '#d97706', fontSize: '0.85rem' }}>
                * {pendingTasksCount} item(s) pending verification
              </span>
            )}
          </div>

          {/* Validation Checklist Items */}
          <div>
            {validationTasks.map((task) => (
              <ValidationCard
                key={task.id}
                task={task}
                onUpdate={(status, notes) => handleUpdateTask(task.id, status, notes)}
                disabled={isSaving}
              />
            ))}
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
              onClick={() => setCurrentStep('inputs')}
              disabled={isSaving}
            >
              <ArrowLeft size={16} />
              <span>{t.back}</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setCurrentStep('review')}
              disabled={isSaving}
            >
              <span>Continue to Summary</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: REVIEW / SUMMARY & COMPLETION */}
      {currentStep === 'review' && (
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '6px' }}>{t.reviewAndComplete}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Verify all entered business parameters, assets, and ground truth tasks before finalizing.
            </p>
          </div>

          {completionNotice && (
            <Alert type={completionNotice.type} className="mb-4">
              {completionNotice.message}
            </Alert>
          )}

          {/* Dossier Summary Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
            {/* Overview */}
            <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ marginBottom: '10px', color: 'var(--brand-green)' }}>1. Enterprise Identity</h4>
              <div className="grid-2" style={{ fontSize: '0.9rem' }}>
                <div>
                  <strong>Assessment ID:</strong> {assessment.id}
                </div>
                <div>
                  <strong>Status:</strong> <StatusBadge status={assessment.status} />
                </div>
                <div>
                  <strong>Business Category:</strong> {assessment.businessCategory?.name || 'Assigned'}
                </div>
                <div>
                  <strong>Advisory Language:</strong> {assessment.language.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Profile */}
            <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ marginBottom: '10px', color: 'var(--brand-green)' }}>2. Resource & Asset Profile</h4>
              <div className="grid-2" style={{ fontSize: '0.9rem' }}>
                <div>
                  <strong>Past Experience:</strong> {profileForm.previousExperience || 'Not specified'}
                </div>
                <div>
                  <strong>Working Hours / Day:</strong> {profileForm.expectedWorkingHours || '0'} hrs
                </div>
                <div>
                  <strong>Land Access:</strong> {profileForm.hasLand ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>Commercial Shop:</strong> {profileForm.hasShop ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>Storage Room:</strong> {profileForm.hasRoom ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>Machinery On-Hand:</strong> {profileForm.hasEquipment ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>Identified Buyers:</strong> {profileForm.hasKnownCustomers ? 'Yes' : 'No'}
                </div>
              </div>
            </div>

            {/* Ground Verification */}
            <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ marginBottom: '10px', color: 'var(--brand-green)' }}>3. Ground Truth Verification</h4>
              <div style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                {pendingTasksCount === 0 ? (
                  <span style={{ color: 'var(--brand-green)', fontWeight: 600 }}>
                    ✓ All 6 ground reality checks addressed ({completedTasksCount} verified, {skippedTasksCount} skipped)
                  </span>
                ) : (
                  <span style={{ color: '#d97706', fontWeight: 600 }}>
                    ⚠ {pendingTasksCount} ground reality task(s) are still pending.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Complete Assessment Action */}
          <div
            style={{
              background: assessment.status === 'COMPLETED' ? 'var(--brand-green-light)' : 'var(--bg-page)',
              border: `1px solid ${assessment.status === 'COMPLETED' ? 'var(--brand-green-border)' : 'var(--border-light)'}`,
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
            }}
          >
            {assessment.status === 'COMPLETED' ? (
              <div>
                <CheckCircle2 size={40} color="var(--brand-green)" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ color: 'var(--brand-green)', marginBottom: '8px' }}>
                  Assessment Fully Certified & Completed!
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Completed at {assessment.completedAt ? new Date(assessment.completedAt).toLocaleString() : 'Done'}
                </p>
              </div>
            ) : (
              <div>
                <h3 style={{ marginBottom: '8px' }}>Submit & Finalize Feasibility</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto 20px' }}>
                  Click below to submit your completed assessment. The platform verifies all ground tasks and transitions the assessment state.
                </p>

                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={handleCompleteAssessment}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="spinner" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={20} />
                      <span>{t.completeAssessment}</span>
                    </>
                  )}
                </button>
              </div>
            )}
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
              onClick={() => setCurrentStep('validation')}
              disabled={isSaving}
            >
              <ArrowLeft size={16} />
              <span>Back to Ground Verification</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
