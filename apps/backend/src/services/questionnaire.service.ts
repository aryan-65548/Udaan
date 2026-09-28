import { db } from '../db';
import {
  questionnaireQuestions,
  questionnaireResponses,
  assessments,
  locations,
  businessCategories,
  assessmentInputs,
  financialRuns,
  schemeConfigs,
} from '../db/schema';
import { eq, and, asc, desc } from 'drizzle-orm';
import { seedQuestionnaireQuestions, initialQuestions } from '../db/seeds/questionnaire';
import {
  infrastructureResponseSchema,
  competitorsResponseSchema,
  seasonalConstraintsResponseSchema,
  localDemandResponseSchema,
  customersMarketResponseSchema,
  businessRisksResponseSchema,
} from '../schemas/questionnaire';
import { transitionAssessmentStatus } from './assessment-state.service';
import { getLatestFinancialRun } from './finance';
import { generateOrGetReport } from './report-engine.service';

export class QuestionnaireValidationError extends Error {
  constructor(message: string, public readonly code: string = 'VALIDATION_ERROR') {
    super(message);
    this.name = 'QuestionnaireValidationError';
  }
}

/**
 * Ensures active questionnaire questions are seeded in the database.
 */
export async function ensureQuestionnaireSeeded() {
  const existing = await db
    .select({ count: questionnaireQuestions.id })
    .from(questionnaireQuestions)
    .limit(1);

  if (existing.length === 0) {
    await seedQuestionnaireQuestions(db);
  }
}

/**
 * Validates a single question's structured answer against its specific schema.
 */
export function validateQuestionResponse(questionCode: string, responseJson: Record<string, any>) {
  switch (questionCode) {
    case 'INFRASTRUCTURE':
      return infrastructureResponseSchema.parse(responseJson);
    case 'COMPETITORS':
      return competitorsResponseSchema.parse(responseJson);
    case 'SEASONAL_CONSTRAINTS':
      return seasonalConstraintsResponseSchema.parse(responseJson);
    case 'LOCAL_DEMAND':
      return localDemandResponseSchema.parse(responseJson);
    case 'CUSTOMERS_MARKET':
      return customersMarketResponseSchema.parse(responseJson);
    case 'BUSINESS_RISKS':
      return businessRisksResponseSchema.parse(responseJson);
    default:
      throw new QuestionnaireValidationError(`Unknown question code: ${questionCode}`);
  }
}

/**
 * Fetches the 6 active questionnaire questions along with previously saved responses for this assessment.
 */
export async function getQuestionnaireWithResponses(assessmentId: string, userId: string) {
  await ensureQuestionnaireSeeded();

  // Fetch all active questions ordered by display order
  const questions = await db
    .select()
    .from(questionnaireQuestions)
    .where(eq(questionnaireQuestions.isActive, true))
    .orderBy(asc(questionnaireQuestions.displayOrder));

  // Fetch saved responses for this assessment and user
  const savedResponses = await db
    .select()
    .from(questionnaireResponses)
    .where(
      and(
        eq(questionnaireResponses.assessmentId, assessmentId),
        eq(questionnaireResponses.userId, userId)
      )
    );

  const responseMap = new Map(savedResponses.map((r) => [r.questionCode, r]));

  const questionnaire = questions.map((q) => {
    const saved = responseMap.get(q.code);
    return {
      id: q.id,
      code: q.code,
      version: q.version,
      displayOrder: q.displayOrder,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options,
      isRequired: q.isRequired,
      savedResponse: saved ? saved.responseJson : null,
      savedAt: saved ? saved.updatedAt : null,
    };
  });

  return {
    assessmentId,
    totalQuestions: questions.length,
    completedCount: savedResponses.length,
    isComplete: questions.length > 0 && savedResponses.length >= questions.length,
    questions: questionnaire,
  };
}

/**
 * Saves or updates questionnaire responses for an assessment.
 */
export async function saveQuestionnaireResponses(
  assessmentId: string,
  userId: string,
  responses: Array<{ questionCode: string; response: Record<string, any> }>
) {
  await ensureQuestionnaireSeeded();

  // Verify questions exist
  const questions = await db
    .select()
    .from(questionnaireQuestions)
    .where(eq(questionnaireQuestions.isActive, true));

  const questionMap = new Map(questions.map((q) => [q.code, q]));

  const savedList = [];

  for (const item of responses) {
    const q = questionMap.get(item.questionCode);
    if (!q) {
      throw new QuestionnaireValidationError(`Question code ${item.questionCode} is not recognized.`);
    }

    // Validate structured response
    try {
      validateQuestionResponse(item.questionCode, item.response);
    } catch (err: any) {
      throw new QuestionnaireValidationError(
        `Invalid response format for question ${item.questionCode}: ${err.message}`
      );
    }

    // Upsert response
    const [saved] = await db
      .insert(questionnaireResponses)
      .values({
        assessmentId,
        userId,
        questionId: q.id,
        questionCode: item.questionCode,
        questionnaireVersion: q.version,
        responseJson: item.response,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [questionnaireResponses.assessmentId, questionnaireResponses.questionCode],
        set: {
          responseJson: item.response,
          questionnaireVersion: q.version,
          updatedAt: new Date(),
        },
      })
      .returning();

    savedList.push(saved);
  }

  // Update assessment status to AI_QUESTIONING if it's currently IN_PROGRESS
  const [assessment] = await db
    .select({ status: assessments.status })
    .from(assessments)
    .where(eq(assessments.id, assessmentId));

  if (assessment && (assessment.status === 'IN_PROGRESS' || assessment.status === 'DRAFT')) {
    try {
      await transitionAssessmentStatus(assessmentId, 'AI_QUESTIONING', {
        aiStatus: 'QUESTIONING',
      });
    } catch {
      // Ignore transition error if state machine already in desired or forward status
    }
  }

  return savedList;
}

/**
 * Validates that all 6 required questions have been answered and completes the questionnaire.
 */
export async function submitQuestionnaire(assessmentId: string, userId: string) {
  const qData = await getQuestionnaireWithResponses(assessmentId, userId);

  const missingQuestions: string[] = [];

  for (const q of qData.questions) {
    if (q.isRequired && (!q.savedResponse || Object.keys(q.savedResponse).length === 0)) {
      missingQuestions.push(q.questionText);
    }
  }

  if (missingQuestions.length > 0) {
    throw new QuestionnaireValidationError(
      `Cannot submit questionnaire: ${missingQuestions.length} required question(s) remain unanswered.`,
      'INCOMPLETE_QUESTIONNAIRE'
    );
  }

  // Transition assessment to REPORT_READY and aiStatus to COMPLETED
  let updatedAssessment;
  try {
    // Check current status
    const [current] = await db
      .select({ status: assessments.status })
      .from(assessments)
      .where(eq(assessments.id, assessmentId));

    if (current?.status === 'AI_QUESTIONING') {
      // Move to AI_ANALYZING then REPORT_READY
      await transitionAssessmentStatus(assessmentId, 'AI_ANALYZING', { aiStatus: 'ANALYZING' });
      updatedAssessment = await transitionAssessmentStatus(assessmentId, 'REPORT_READY', {
        aiStatus: 'COMPLETED',
      });
    } else if (current?.status === 'AI_ANALYZING') {
      updatedAssessment = await transitionAssessmentStatus(assessmentId, 'REPORT_READY', {
        aiStatus: 'COMPLETED',
      });
    } else {
      // If already REPORT_READY or COMPLETED, return current
      [updatedAssessment] = await db
        .select()
        .from(assessments)
        .where(eq(assessments.id, assessmentId));
    }
  } catch (err: any) {
    // If state machine transition throws, fetch current record
    [updatedAssessment] = await db
      .select()
      .from(assessments)
      .where(eq(assessments.id, assessmentId));
  }

  // Automatically generate or retrieve the persistent report snapshot
  let reportSnapshot = null;
  try {
    reportSnapshot = await generateOrGetReport(assessmentId, userId);
  } catch (err: any) {
    console.warn('Feasibility report generation warning during submitQuestionnaire:', err.message);
  }

  return {
    assessmentId,
    status: updatedAssessment?.status || 'REPORT_READY',
    aiStatus: updatedAssessment?.aiStatus || 'COMPLETED',
    message: 'Sahayak business context questionnaire successfully submitted and verified.',
    feasibilityReport: reportSnapshot,
  };
}

export async function getFeasibilityReport(assessmentId: string, userId: string) {
  return generateOrGetReport(assessmentId, userId);
}
