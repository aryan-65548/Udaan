import React from 'react';
import type { AssessmentStatus, AiStatus } from '../api/assessments';
import { CheckCircle2, Clock, AlertCircle, Sparkles, FileText, Ban } from 'lucide-react';

interface StatusBadgeProps {
  status: AssessmentStatus | AiStatus;
  type?: 'assessment' | 'ai';
}

const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  DRAFT: {
    label: 'Draft',
    className: 'badge-draft',
    icon: <Clock size={12} />,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'badge-in_progress',
    icon: <Clock size={12} />,
  },
  AI_QUESTIONING: {
    label: 'Advisory Interview',
    className: 'badge-ai_questioning',
    icon: <Sparkles size={12} />,
  },
  AI_ANALYZING: {
    label: 'Market & Feasibility Analysis',
    className: 'badge-ai_analyzing',
    icon: <Sparkles size={12} />,
  },
  REPORT_READY: {
    label: 'Feasibility Report Ready',
    className: 'badge-report_ready',
    icon: <FileText size={12} />,
  },
  COMPLETED: {
    label: 'Completed & Certified',
    className: 'badge-completed',
    icon: <CheckCircle2 size={12} />,
  },
  FAILED: {
    label: 'Needs Attention',
    className: 'badge-failed',
    icon: <AlertCircle size={12} />,
  },
  NOT_STARTED: {
    label: 'AI Ready',
    className: 'badge-draft',
    icon: <Clock size={12} />,
  },
  QUESTIONING: {
    label: 'Questioning',
    className: 'badge-ai_questioning',
    icon: <Sparkles size={12} />,
  },
  ANALYZING: {
    label: 'Analyzing',
    className: 'badge-ai_analyzing',
    icon: <Sparkles size={12} />,
  },
  READY: {
    label: 'Ready',
    className: 'badge-report_ready',
    icon: <CheckCircle2 size={12} />,
  },
  ERROR: {
    label: 'AI Error',
    className: 'badge-failed',
    icon: <Ban size={12} />,
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status] || {
    label: status,
    className: 'badge-draft',
    icon: null,
  };

  return (
    <span className={`badge ${config.className}`}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
