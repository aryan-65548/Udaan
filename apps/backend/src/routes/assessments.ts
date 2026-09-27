import { Router, Response } from 'express';
import {
  upsertAssessmentInput,
  getAssessmentInputs,
} from '../services/assessment-input.service';
import {
  transitionAssessmentStatus,
  InvalidStateTransitionError,
} from '../services/assessment-state.service';
import { InputType } from '../types/assessment-context';
import { db } from '../db';
import {
  assessments,
  locations,
  businessCategories,
  assessmentInputs,
  financialRuns,
  validationTasks,
} from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import {
  assessmentIdParamSchema,
  inputKeyParamSchema,
  createAssessmentSchema,
  updateAssessmentSchema,
  putAssessmentInputSchema,
  patchProfileInputsSchema,
} from '../schemas/assessments';

const router = Router();

// All assessment endpoints require authentication
router.use(authenticate);

import { getAuthorizedAssessment } from '../utils/assessments';

// POST /assessments - Create new assessment
router.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = createAssessmentSchema.parse(req.body);

    // Verify location exists
    const locationResult = await db
      .select({ id: locations.id })
      .from(locations)
      .where(eq(locations.id, data.locationId))
      .limit(1);

    if (!locationResult.length) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Referenced location does not exist',
        },
      });
    }

    // Verify business category exists
    const categoryResult = await db
      .select({ id: businessCategories.id })
      .from(businessCategories)
      .where(eq(businessCategories.id, data.businessCategoryId))
      .limit(1);

    if (!categoryResult.length) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Referenced business category does not exist',
        },
      });
    }

    const inserted = await db
      .insert(assessments)
      .values({
        userId: req.user!.id,
        locationId: data.locationId,
        businessCategoryId: data.businessCategoryId,
        language: data.language,
        status: 'IN_PROGRESS',
        aiStatus: 'NOT_STARTED',
      })
      .returning();

    return res.status(201).json({ data: inserted[0] });
  } catch (error) {
    next(error);
  }
});

// GET /assessments - List user's assessments
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const rawList = await db
      .select({
        id: assessments.id,
        userId: assessments.userId,
        locationId: assessments.locationId,
        businessCategoryId: assessments.businessCategoryId,
        language: assessments.language,
        status: assessments.status,
        aiStatus: assessments.aiStatus,
        aiSessionId: assessments.aiSessionId,
        createdAt: assessments.createdAt,
        updatedAt: assessments.updatedAt,
        completedAt: assessments.completedAt,
        locationName: locations.name,
        locationType: locations.type,
        categoryName: businessCategories.name,
        categoryCode: businessCategories.code,
      })
      .from(assessments)
      .leftJoin(locations, eq(assessments.locationId, locations.id))
      .leftJoin(businessCategories, eq(assessments.businessCategoryId, businessCategories.id))
      .where(eq(assessments.userId, req.user!.id))
      .orderBy(desc(assessments.createdAt));

    const userAssessments = rawList.map((item: any) => {
      const formatted: Record<string, any> = { ...item };
      delete formatted.locationName;
      delete formatted.locationType;
      delete formatted.categoryName;
      delete formatted.categoryCode;

      if (item.locationName) {
        formatted.location = { id: item.locationId, name: item.locationName, type: item.locationType };
      }
      if (item.categoryName) {
        formatted.businessCategory = { id: item.businessCategoryId, name: item.categoryName, code: item.categoryCode };
      }
      return formatted;
    });

    return res.json({ data: userAssessments });
  } catch (error) {
    next(error);
  }
});

// GET /assessments/:id - Get assessment details
router.get('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = assessmentIdParamSchema.parse(req.params);
    const assessment = await getAuthorizedAssessment(id, req.user!.id, res);
    if (!assessment) return;

    // Fetch related location and business category
    const [location] = await db
      .select()
      .from(locations)
      .where(eq(locations.id, assessment.locationId))
      .limit(1);

    const [category] = await db
      .select()
      .from(businessCategories)
      .where(eq(businessCategories.id, assessment.businessCategoryId))
      .limit(1);

    // Fetch latest financial run if any
    const latestFinance = await db
      .select()
      .from(financialRuns)
      .where(eq(financialRuns.assessmentId, assessment.id))
      .orderBy(desc(financialRuns.createdAt))
      .limit(1);

    return res.json({
      data: {
        ...assessment,
        location: location || null,
        businessCategory: category || null,
        latestFinancialRun: latestFinance[0] || null,
      },
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /assessments/:id - Update assessment fixed attributes
router.patch('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = assessmentIdParamSchema.parse(req.params);
    const assessment = await getAuthorizedAssessment(id, req.user!.id, res);
    if (!assessment) return;

    const data = updateAssessmentSchema.parse(req.body);

    if (data.locationId) {
      const locationResult = await db
        .select({ id: locations.id })
        .from(locations)
        .where(eq(locations.id, data.locationId))
        .limit(1);

      if (!locationResult.length) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Referenced location does not exist',
          },
        });
      }
    }

    if (data.businessCategoryId) {
      const categoryResult = await db
        .select({ id: businessCategories.id })
        .from(businessCategories)
        .where(eq(businessCategories.id, data.businessCategoryId))
        .limit(1);

      if (!categoryResult.length) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Referenced business category does not exist',
          },
        });
      }
    }

    const updated = await db
      .update(assessments)
      .set({
        ...(data.locationId !== undefined && { locationId: data.locationId }),
        ...(data.businessCategoryId !== undefined && { businessCategoryId: data.businessCategoryId }),
        ...(data.language !== undefined && { language: data.language }),
        updatedAt: new Date(),
      })
      .where(eq(assessments.id, id))
      .returning();

    return res.json({ data: updated[0] });
  } catch (error) {
    next(error);
  }
});

// POST /assessments/:id/complete - Mark assessment complete
router.post('/:id/complete', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = assessmentIdParamSchema.parse(req.params);
    const assessment = await getAuthorizedAssessment(id, req.user!.id, res);
    if (!assessment) return;

    // Validation rule: An assessment cannot be COMPLETED if any validation tasks are PENDING.
    // If validation tasks exist, all of them must be either COMPLETED or SKIPPED.
    const tasks = await db
      .select({ id: validationTasks.id, status: validationTasks.status })
      .from(validationTasks)
      .where(eq(validationTasks.assessmentId, id));

    const hasPending = tasks.some((t) => t.status === 'PENDING');
    if (hasPending) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_INCOMPLETE',
          message: 'Cannot complete assessment: one or more validation tasks are pending',
        },
      });
    }

    try {
      const updated = await transitionAssessmentStatus(id, 'COMPLETED', {
        completedAt: new Date(),
      });

      return res.json({ data: updated });
    } catch (err) {
      if (err instanceof InvalidStateTransitionError) {
        return res.status(400).json({
          error: {
            code: 'INVALID_STATE_TRANSITION',
            message: err.message,
          },
        });
      }
      throw err;
    }
  } catch (error) {
    next(error);
  }
});

// PUT /assessments/:id/inputs/:inputKey - Upsert single assessment input
router.put('/:id/inputs/:inputKey', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id, inputKey } = inputKeyParamSchema.parse(req.params);
    const assessment = await getAuthorizedAssessment(id, req.user!.id, res);
    if (!assessment) return;

    const data = putAssessmentInputSchema.parse(req.body);

    const inserted = await upsertAssessmentInput(id, inputKey, {
      questionText: data.questionText,
      inputType: data.inputType,
      valueText: data.valueText,
      valueNumber: data.valueNumber,
      valueBoolean: data.valueBoolean,
      valueJson: data.valueJson,
      source: 'USER',
    });

    return res.json({ data: inserted });
  } catch (error) {
    next(error);
  }
});

// GET /assessments/:id/inputs - Retrieve all inputs for assessment
router.get('/:id/inputs', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = assessmentIdParamSchema.parse(req.params);
    const assessment = await getAuthorizedAssessment(id, req.user!.id, res);
    if (!assessment) return;

    const inputs = await getAssessmentInputs(id);

    return res.json({ data: inputs });
  } catch (error) {
    next(error);
  }
});

// PATCH /assessments/:id/profile - Batch update profile inputs
router.patch('/:id/profile', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = assessmentIdParamSchema.parse(req.params);
    const assessment = await getAuthorizedAssessment(id, req.user!.id, res);
    if (!assessment) return;

    const profileData = patchProfileInputsSchema.parse(req.body);
    const updatedRecords = [];

    type ProfileInputType = InputType;

    for (const [key, rawVal] of Object.entries(profileData)) {
      let inputType: ProfileInputType = 'TEXT';
      let valueText: string | null = null;
      let valueNumber: string | number | null = null;
      let valueBoolean: boolean | null = null;
      let valueJson: unknown = null;
      let questionText: string | null = null;

      if (rawVal !== null && typeof rawVal === 'object' && 'value' in rawVal) {
        questionText = rawVal.questionText ?? null;
        const v = rawVal.value;
        if (rawVal.inputType) {
          inputType = rawVal.inputType as ProfileInputType;
          if (inputType === 'NUMBER') {
            valueNumber = v;
          } else if (inputType === 'BOOLEAN') {
            valueBoolean = Boolean(v);
          } else if (inputType === 'TEXT' || inputType === 'SELECT' || inputType === 'DATE') {
            valueText = String(v);
          } else {
            valueJson = v;
          }
        } else {
          // Infer inputType from value if omitted
          if (typeof v === 'number') {
            inputType = 'NUMBER';
            valueNumber = v;
          } else if (typeof v === 'boolean') {
            inputType = 'BOOLEAN';
            valueBoolean = v;
          } else if (typeof v === 'string') {
            inputType = 'TEXT';
            valueText = v;
          } else {
            inputType = 'JSON';
            valueJson = v;
          }
        }
      } else if (typeof rawVal === 'number') {
        inputType = 'NUMBER';
        valueNumber = rawVal;
      } else if (typeof rawVal === 'boolean') {
        inputType = 'BOOLEAN';
        valueBoolean = rawVal;
      } else if (typeof rawVal === 'string') {
        inputType = 'TEXT';
        valueText = rawVal;
      } else if (rawVal !== null && typeof rawVal === 'object') {
        inputType = 'JSON';
        valueJson = rawVal;
      }

      const record = await upsertAssessmentInput(id, key, {
        questionText,
        inputType,
        valueText,
        valueNumber,
        valueBoolean,
        valueJson,
        source: 'USER',
      });

      updatedRecords.push(record);
    }

    return res.json({ data: updatedRecords });
  } catch (error) {
    next(error);
  }
});

export default router;
