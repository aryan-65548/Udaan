import { Router, Response } from 'express';
import { db } from '../db';
import {
  assessments,
  locations,
  businessCategories,
  assessmentInputs,
  financialRuns,
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
    const userAssessments = await db
      .select()
      .from(assessments)
      .where(eq(assessments.userId, req.user!.id))
      .orderBy(desc(assessments.createdAt));

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

    const updated = await db
      .update(assessments)
      .set({
        status: 'COMPLETED',
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(assessments.id, id))
      .returning();

    return res.json({ data: updated[0] });
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

    const values = {
      assessmentId: id,
      inputKey,
      questionText: data.questionText ?? null,
      inputType: data.inputType,
      valueText: data.valueText ?? null,
      valueNumber: data.valueNumber !== undefined && data.valueNumber !== null ? String(data.valueNumber) : null,
      valueBoolean: data.valueBoolean ?? null,
      valueJson: data.valueJson ?? null,
      source: data.source,
      updatedAt: new Date(),
    };

    const inserted = await db
      .insert(assessmentInputs)
      .values(values)
      .onConflictDoUpdate({
        target: [assessmentInputs.assessmentId, assessmentInputs.inputKey],
        set: {
          questionText: values.questionText,
          inputType: values.inputType,
          valueText: values.valueText,
          valueNumber: values.valueNumber,
          valueBoolean: values.valueBoolean,
          valueJson: values.valueJson,
          source: values.source,
          updatedAt: values.updatedAt,
        },
      })
      .returning();

    return res.json({ data: inserted[0] });
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

    const inputs = await db
      .select()
      .from(assessmentInputs)
      .where(eq(assessmentInputs.assessmentId, id));

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

    type InputType = 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'SELECT' | 'MULTI_SELECT' | 'DATE' | 'JSON';
    type InputSource = 'USER' | 'AI' | 'SYSTEM';

    for (const [key, rawVal] of Object.entries(profileData)) {
      let inputType: InputType = 'TEXT';
      let valueText: string | null = null;
      let valueNumber: string | null = null;
      let valueBoolean: boolean | null = null;
      let valueJson: unknown = null;
      let questionText: string | null = null;
      let source: InputSource = 'USER';

      if (rawVal !== null && typeof rawVal === 'object' && 'value' in rawVal) {
        questionText = rawVal.questionText ?? null;
        source = (rawVal.source as InputSource) ?? 'USER';
        const v = rawVal.value;
        if (typeof v === 'number') {
          inputType = (rawVal.inputType as InputType) ?? 'NUMBER';
          valueNumber = String(v);
        } else if (typeof v === 'boolean') {
          inputType = (rawVal.inputType as InputType) ?? 'BOOLEAN';
          valueBoolean = v;
        } else if (typeof v === 'string') {
          inputType = (rawVal.inputType as InputType) ?? 'TEXT';
          valueText = v;
        } else {
          inputType = (rawVal.inputType as InputType) ?? 'JSON';
          valueJson = v;
        }
      } else if (typeof rawVal === 'number') {
        inputType = 'NUMBER';
        valueNumber = String(rawVal);
      } else if (typeof rawVal === 'boolean') {
        inputType = 'BOOLEAN';
        valueBoolean = rawVal;
      } else if (typeof rawVal === 'string') {
        inputType = 'TEXT';
        valueText = rawVal;
      }

      const values = {
        assessmentId: id,
        inputKey: key,
        questionText,
        inputType,
        valueText,
        valueNumber,
        valueBoolean,
        valueJson,
        source,
        updatedAt: new Date(),
      };

      const record = await db
        .insert(assessmentInputs)
        .values(values)
        .onConflictDoUpdate({
          target: [assessmentInputs.assessmentId, assessmentInputs.inputKey],
          set: {
            questionText: values.questionText,
            inputType: values.inputType,
            valueText: values.valueText,
            valueNumber: values.valueNumber,
            valueBoolean: values.valueBoolean,
            valueJson: values.valueJson,
            source: values.source,
            updatedAt: values.updatedAt,
          },
        })
        .returning();

      updatedRecords.push(record[0]);
    }

    return res.json({ data: updatedRecords });
  } catch (error) {
    next(error);
  }
});

export default router;
