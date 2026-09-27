import { db } from '../db';
import { assessments } from '../db/schema';
import { eq } from 'drizzle-orm';
import { AssessmentStatus, AiStatus } from '../types/assessment-context';

export class InvalidStateTransitionError extends Error {
  constructor(public readonly from: AssessmentStatus, public readonly to: AssessmentStatus) {
    super(`Invalid assessment status transition from ${from} to ${to}`);
    this.name = 'InvalidStateTransitionError';
  }
}

export class AssessmentNotFoundError extends Error {
  constructor(message = 'Assessment not found') {
    super(message);
    this.name = 'AssessmentNotFoundError';
  }
}

/**
 * Explicit map of permitted assessment status transitions.
 * Supports the AI flow: IN_PROGRESS -> AI_QUESTIONING -> AI_ANALYZING -> REPORT_READY / COMPLETED,
 * specific retries from FAILED, and treats COMPLETED as terminal.
 */
const VALID_ASSESSMENT_TRANSITIONS: Record<AssessmentStatus, readonly AssessmentStatus[]> = {
  DRAFT: ['IN_PROGRESS', 'FAILED'],
  IN_PROGRESS: ['AI_QUESTIONING', 'FAILED'],
  AI_QUESTIONING: ['AI_ANALYZING', 'IN_PROGRESS', 'FAILED'],
  AI_ANALYZING: ['REPORT_READY', 'AI_QUESTIONING', 'FAILED'],
  REPORT_READY: ['COMPLETED', 'AI_QUESTIONING', 'FAILED'],
  FAILED: ['AI_QUESTIONING', 'IN_PROGRESS'],
  COMPLETED: [],
};

/**
 * Validates whether transitioning from currentStatus to targetStatus is allowed.
 */
export function isValidAssessmentStatusTransition(
  from: AssessmentStatus,
  to: AssessmentStatus
): boolean {
  if (from === to) return true;
  return VALID_ASSESSMENT_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Controls transition of an assessment to a new status with validation against allowed state transitions.
 */
export async function transitionAssessmentStatus(
  assessmentId: string,
  targetStatus: AssessmentStatus,
  options?: {
    completedAt?: Date;
    aiStatus?: AiStatus;
  }
) {
  const [current] = await db
    .select({ id: assessments.id, status: assessments.status })
    .from(assessments)
    .where(eq(assessments.id, assessmentId))
    .limit(1);

  if (!current) {
    throw new AssessmentNotFoundError();
  }

  if (!isValidAssessmentStatusTransition(current.status, targetStatus)) {
    throw new InvalidStateTransitionError(current.status, targetStatus);
  }

  const [updated] = await db
    .update(assessments)
    .set({
      status: targetStatus,
      ...(options?.aiStatus && { aiStatus: options.aiStatus }),
      ...(options?.completedAt !== undefined && { completedAt: options.completedAt }),
      updatedAt: new Date(),
    })
    .where(eq(assessments.id, assessmentId))
    .returning();

  return updated;
}

/**
 * Records an AI session ID and optional AI status on an assessment.
 */
export async function updateAISession(
  assessmentId: string,
  aiSessionId: string,
  aiStatus?: AiStatus
) {
  const [updated] = await db
    .update(assessments)
    .set({
      aiSessionId,
      ...(aiStatus && { aiStatus }),
      updatedAt: new Date(),
    })
    .where(eq(assessments.id, assessmentId))
    .returning();

  if (!updated) {
    throw new AssessmentNotFoundError();
  }

  return updated;
}

/**
 * Updates AI status on an assessment.
 */
export async function updateAIStatus(
  assessmentId: string,
  aiStatus: AiStatus
) {
  const [updated] = await db
    .update(assessments)
    .set({
      aiStatus,
      updatedAt: new Date(),
    })
    .where(eq(assessments.id, assessmentId))
    .returning();

  if (!updated) {
    throw new AssessmentNotFoundError();
  }

  return updated;
}

/**
 * Directly updates assessment status through controlled transition validation.
 */
export async function updateAssessmentStatus(
  assessmentId: string,
  status: AssessmentStatus
) {
  return transitionAssessmentStatus(assessmentId, status);
}
