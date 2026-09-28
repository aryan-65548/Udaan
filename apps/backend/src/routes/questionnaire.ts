import { Router } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { assessmentIdParamSchema } from '../schemas/assessments';
import { saveQuestionnaireResponsesSchema } from '../schemas/questionnaire';
import { getAuthorizedAssessment } from '../utils/assessments';
import {
  getQuestionnaireWithResponses,
  saveQuestionnaireResponses,
  submitQuestionnaire,
  getFeasibilityReport,
  QuestionnaireValidationError,
} from '../services/questionnaire.service';

const router = Router({ mergeParams: true });

router.use(authenticate);

// GET /api/assessments/:id/questionnaire - Fetch 6 fixed questions with user's saved answers
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = assessmentIdParamSchema.parse(req.params);
    const assessment = await getAuthorizedAssessment(id, req.user!.id, res);
    if (!assessment) return;

    const data = await getQuestionnaireWithResponses(id, req.user!.id);
    return res.json({ data });
  } catch (error) {
    next(error);
  }
});

// GET /api/assessments/:id/questionnaire/responses - Fetch saved questionnaire responses
router.get('/responses', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = assessmentIdParamSchema.parse(req.params);
    const assessment = await getAuthorizedAssessment(id, req.user!.id, res);
    if (!assessment) return;

    const data = await getQuestionnaireWithResponses(id, req.user!.id);
    return res.json({
      data: {
        assessmentId: id,
        completedCount: data.completedCount,
        totalQuestions: data.totalQuestions,
        isComplete: data.isComplete,
        responses: data.questions.map((q) => ({
          questionCode: q.code,
          questionId: q.id,
          response: q.savedResponse,
          savedAt: q.savedAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/assessments/:id/questionnaire/responses - Save or update questionnaire responses
router.put('/responses', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = assessmentIdParamSchema.parse(req.params);
    const assessment = await getAuthorizedAssessment(id, req.user!.id, res);
    if (!assessment) return;

    const { responses } = saveQuestionnaireResponsesSchema.parse(req.body);

    const saved = await saveQuestionnaireResponses(id, req.user!.id, responses);
    return res.json({
      data: {
        assessmentId: id,
        savedCount: saved.length,
        saved,
      },
    });
  } catch (error: any) {
    if (error instanceof QuestionnaireValidationError) {
      return res.status(400).json({
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }
    next(error);
  }
});

// POST /api/assessments/:id/questionnaire/submit - Validate all 6 questions and finalize questionnaire
router.post('/submit', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = assessmentIdParamSchema.parse(req.params);
    const assessment = await getAuthorizedAssessment(id, req.user!.id, res);
    if (!assessment) return;

    const result = await submitQuestionnaire(id, req.user!.id);
    return res.json({ data: result });
  } catch (error: any) {
    if (error instanceof QuestionnaireValidationError) {
      return res.status(400).json({
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }
    next(error);
  }
});

import {
  generateOrGetReport,
  markReportDownloaded,
  ReportEngineError,
} from '../services/report-engine.service';

// GET /api/assessments/:id/questionnaire/feasibility-report - Fetch or generate 12-section report
router.get('/feasibility-report', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = assessmentIdParamSchema.parse(req.params);
    const assessment = await getAuthorizedAssessment(id, req.user!.id, res);
    if (!assessment) return;

    const report = await generateOrGetReport(id, req.user!.id);
    return res.json({ data: report });
  } catch (error: any) {
    if (error instanceof ReportEngineError) {
      return res.status(400).json({
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }
    next(error);
  }
});

// POST /api/assessments/:id/questionnaire/feasibility-report/download - Record PDF download & complete assessment
router.post('/feasibility-report/download', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = assessmentIdParamSchema.parse(req.params);
    const assessment = await getAuthorizedAssessment(id, req.user!.id, res);
    if (!assessment) return;

    const result = await markReportDownloaded(id, req.user!.id);
    return res.json({ data: result });
  } catch (error: any) {
    if (error instanceof ReportEngineError) {
      return res.status(400).json({
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }
    next(error);
  }
});

export default router;
