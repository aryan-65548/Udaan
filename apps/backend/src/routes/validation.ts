import { Router } from 'express';
import { db } from '../db';
import { validationTasks } from '../db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { getAuthorizedAssessment } from './assessments';
import { assessmentIdParamSchema } from '../schemas/assessments';
import {
  validationTaskIdParamSchema,
  updateValidationTaskSchema,
  DEFAULT_VALIDATION_TASKS,
} from '../schemas/validation';

const router = Router();

// All validation endpoints require authentication
router.use(authenticate);

// GET /:id/validation - Retrieve validation tasks for an assessment (seeds standard checklist if none exist)
router.get('/:id/validation', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = assessmentIdParamSchema.parse(req.params);
    const assessment = await getAuthorizedAssessment(id, req.user!.id, res);
    if (!assessment) return;

    let tasks = await db
      .select()
      .from(validationTasks)
      .where(eq(validationTasks.assessmentId, id))
      .orderBy(asc(validationTasks.createdAt));

    if (tasks.length === 0) {
      // Deterministically seed standard checklist
      await db
        .insert(validationTasks)
        .values(
          DEFAULT_VALIDATION_TASKS.map((t) => ({
            assessmentId: id,
            taskKey: t.taskKey,
            taskText: t.taskText,
            status: 'PENDING' as const,
          }))
        )
        .onConflictDoNothing();

      tasks = await db
        .select()
        .from(validationTasks)
        .where(eq(validationTasks.assessmentId, id))
        .orderBy(asc(validationTasks.createdAt));
    }

    return res.json({ data: tasks });
  } catch (error) {
    next(error);
  }
});

// PATCH /:id/validation/:taskId - Update a validation task status and notes
router.patch('/:id/validation/:taskId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id, taskId } = validationTaskIdParamSchema.parse(req.params);

    const assessment = await getAuthorizedAssessment(id, req.user!.id, res);
    if (!assessment) return;

    const data = updateValidationTaskSchema.parse(req.body);

    const [task] = await db
      .select()
      .from(validationTasks)
      .where(
        and(
          eq(validationTasks.id, taskId),
          eq(validationTasks.assessmentId, id)
        )
      )
      .limit(1);

    if (!task) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Validation task not found for this assessment',
        },
      });
    }

    let completedAt = task.completedAt;
    if (data.status === 'COMPLETED') {
      completedAt = new Date();
    } else if (data.status === 'PENDING' || data.status === 'SKIPPED') {
      completedAt = null;
    }

    const updated = await db
      .update(validationTasks)
      .set({
        ...(data.status !== undefined && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
        completedAt,
        updatedAt: new Date(),
      })
      .where(eq(validationTasks.id, taskId))
      .returning();

    return res.json({ data: updated[0] });
  } catch (error) {
    next(error);
  }
});

export default router;
