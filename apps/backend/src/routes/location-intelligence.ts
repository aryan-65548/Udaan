import { Router } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { assessmentIdParamSchema } from '../schemas/assessments';
import { getAuthorizedAssessment } from '../utils/assessments';
import { LocationIntelligenceService } from '../services/location-intelligence';
import z from 'zod';

const router = Router({ mergeParams: true });

router.use(authenticate);

const querySchema = z.object({
  radius: z.coerce.number().optional(),
});

// GET /api/assessments/:id/location-intelligence
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = assessmentIdParamSchema.parse(req.params);
    const query = querySchema.parse(req.query);
    
    const assessment = await getAuthorizedAssessment(id, req.user!.id, res);
    if (!assessment) return; // response already sent in helper

    const context = await LocationIntelligenceService.generateContext(id, query.radius);

    return res.json({ data: context });
  } catch (error) {
    next(error);
  }
});

export default router;
