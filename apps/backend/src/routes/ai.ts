import { Router } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { assessmentIdParamSchema } from '../schemas/assessments';
import { getAuthorizedAssessment } from '../utils/assessments';
import { AiGatewayService } from '../services/ai-gateway';
import { aiMessageSchema, aiResponseSchema } from '../modules/ai-gateway/schemas/ai.schema';
import { db } from '../db';
import { assessments } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router({ mergeParams: true });

router.use(authenticate);

// POST /api/assessments/:id/ai/start
router.post('/start', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = assessmentIdParamSchema.parse(req.params);
    const assessment = await getAuthorizedAssessment(id, req.user!.id, res);
    if (!assessment) return; // Response handled by helper

    // Verify state
    if (assessment.aiStatus === 'COMPLETED') {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'AI session already completed' } });
    }

    // Call external service
    const aiResponse = await AiGatewayService.startSession(id, req.user!.id);
    
    // Validate output
    const validated = aiResponseSchema.parse(aiResponse);

    // Update assessment AI status
    await db.update(assessments)
      .set({ aiStatus: 'QUESTIONING', aiSessionId: validated.sessionId, updatedAt: new Date() })
      .where(eq(assessments.id, id));

    return res.json({ data: validated });
  } catch (error: any) {
    console.error('AI Gateway start error:', error.message);
    next(error);
  }
});

// POST /api/assessments/:id/ai/message
router.post('/message', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = assessmentIdParamSchema.parse(req.params);
    const assessment = await getAuthorizedAssessment(id, req.user!.id, res);
    if (!assessment) return;

    if (assessment.aiStatus !== 'QUESTIONING' && assessment.aiStatus !== 'ANALYZING') {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'AI session not active' } });
    }

    const { content } = aiMessageSchema.parse(req.body);

    const aiResponse = await AiGatewayService.sendMessage(id, req.user!.id, content);
    
    const validated = aiResponseSchema.parse(aiResponse);

    if (validated.status === 'COMPLETED') {
      await db.update(assessments)
        .set({ aiStatus: 'COMPLETED', updatedAt: new Date() })
        .where(eq(assessments.id, id));
    }

    return res.json({ data: validated });
  } catch (error: any) {
    console.error('AI Gateway message error:', error.message);
    next(error);
  }
});

// GET /api/assessments/:id/report
router.get('/report', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = assessmentIdParamSchema.parse(req.params);
    const assessment = await getAuthorizedAssessment(id, req.user!.id, res);
    if (!assessment) return;

    if (assessment.aiStatus !== 'COMPLETED') {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Report is not ready yet' } });
    }

    const reportResponse = await AiGatewayService.getReport(id);

    return res.json({ data: reportResponse });
  } catch (error: any) {
    console.error('AI Gateway report error:', error.message);
    next(error);
  }
});

export default router;
