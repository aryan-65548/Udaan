import React from 'react';
import { Check, User, MapPin, ListPlus, ShieldCheck, FileCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export type AssessmentStep = 'basic' | 'profile' | 'inputs' | 'validation' | 'review';

interface StepperProps {
  currentStep: AssessmentStep;
  onStepChange: (step: AssessmentStep) => void;
  completedSteps?: Partial<Record<AssessmentStep, boolean>>;
}

export const Stepper: React.FC<StepperProps> = ({
  currentStep,
  onStepChange,
  completedSteps = {},
}) => {
  const { t } = useLanguage();

  const steps: Array<{
    id: AssessmentStep;
    label: string;
    icon: React.ReactNode;
  }> = [
    { id: 'basic', label: t.stepBasicDetails, icon: <MapPin size={16} /> },
    { id: 'profile', label: t.stepProfile, icon: <User size={16} /> },
    { id: 'inputs', label: t.stepInputs, icon: <ListPlus size={16} /> },
    { id: 'validation', label: t.stepValidation, icon: <ShieldCheck size={16} /> },
    { id: 'review', label: t.stepReview, icon: <FileCheck size={16} /> },
  ];

  return (
    <div className="stepper-container">
      <div className="stepper-track">
        {steps.map((step, idx) => {
          const isActive = currentStep === step.id;
          const isCompleted = completedSteps[step.id] || false;

          return (
            <div
              key={step.id}
              className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => onStepChange(step.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onStepChange(step.id)}
            >
              <div className="step-circle">
                {isCompleted && !isActive ? <Check size={18} /> : idx + 1}
              </div>
              <span className="step-label">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
