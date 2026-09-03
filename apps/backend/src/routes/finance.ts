import { Router } from 'express';
import { db } from '../db';
import { financialRuns, repaymentScheduleItems, schemeConfigs } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { getAuthorizedAssessment } from '../utils/assessments';
import { getFinanceInputsForAssessment, runAndPersistFinanceCalculation } from '../services/finance';
import { FinancialInputsSchema } from '../modules/finance/schemas/finance.schema';
import { z } from 'zod';

const router = Router({ mergeParams: true });

router.use(authenticate);

// GET /assessments/:id/finance - Get latest financial run
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const assessmentId = req.params.id;
    const assessment = await getAuthorizedAssessment(assessmentId, req.user!.id, res);
    if (!assessment) return;

    const latestRun = await db
      .select()
      .from(financialRuns)
      .where(eq(financialRuns.assessmentId, assessmentId))
      .orderBy(desc(financialRuns.createdAt))
      .limit(1);

    if (!latestRun.length) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'No financial run found for this assessment',
        },
      });
    }

    const run = latestRun[0];

    const schedule = await db
      .select()
      .from(repaymentScheduleItems)
      .where(eq(repaymentScheduleItems.financialRunId, run.id))
      .orderBy(repaymentScheduleItems.sequenceNumber);

    let scheme = null;
    if (run.schemeConfigId) {
      const schemes = await db
        .select()
        .from(schemeConfigs)
        .where(eq(schemeConfigs.id, run.schemeConfigId))
        .limit(1);
      scheme = schemes[0] || null;
    }

    return res.json({
      data: {
        run,
        schedule,
        scheme,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /assessments/:id/finance/runs - Get run history
router.get('/runs', async (req: AuthenticatedRequest, res, next) => {
  try {
    const assessmentId = req.params.id;
    const assessment = await getAuthorizedAssessment(assessmentId, req.user!.id, res);
    if (!assessment) return;

    const runs = await db
      .select()
      .from(financialRuns)
      .where(eq(financialRuns.assessmentId, assessmentId))
      .orderBy(desc(financialRuns.createdAt));

    return res.json({ data: runs });
  } catch (error) {
    next(error);
  }
});

// POST /assessments/:id/finance/calculate - Run and persist
router.post('/calculate', async (req: AuthenticatedRequest, res, next) => {
  try {
    const assessmentId = req.params.id;
    const assessment = await getAuthorizedAssessment(assessmentId, req.user!.id, res);
    if (!assessment) return;

    // 1. Fetch raw inputs from assessment_inputs table
    const rawInputs = await getFinanceInputsForAssessment(assessmentId);

    // 2. Validate using Zod schema to ensure required fields like availableMarginCapital are present
    const parseResult = FinancialInputsSchema.safeParse(rawInputs);
    
    if (!parseResult.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid or missing finance inputs',
          details: parseResult.error.format(),
        },
      });
    }

    const validInputs = parseResult.data;

    // 3. Orchestrate calculation and persistence
    const result = await runAndPersistFinanceCalculation(assessmentId, validInputs);

    return res.status(201).json({ data: result });
  } catch (error) {
    next(error);
  }
});

// Validation schema for incoming finance inputs
const UpdateFinanceInputsSchema = z.object({
  available_margin_capital: z.number().nonnegative().optional(),
  expected_monthly_revenue: z.number().nonnegative().optional(),
  expected_monthly_operating_cost: z.number().nonnegative().optional(),
  requested_tenure_months: z.number().int().positive().optional(),
  requested_interest_rate: z.number().nonnegative().optional(),
  requested_moratorium_months: z.number().int().nonnegative().optional(),
  requested_moratorium_interest_treatment: z.enum(['CAPITALIZE', 'PAY_CURRENT', 'UNKNOWN']).optional(),
  requested_payment_frequency: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']).optional(),
}).strict(); // strict() rejects unknown fields

// PUT /assessments/:id/finance/inputs - Upsert finance inputs
router.put('/inputs', async (req: AuthenticatedRequest, res, next) => {
  try {
    const assessmentId = req.params.id;
    const assessment = await getAuthorizedAssessment(assessmentId, req.user!.id, res);
    if (!assessment) return;

    // Validate body
    const parseResult = UpdateFinanceInputsSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid finance inputs',
          details: parseResult.error.format(),
        }
      });
    }

    const data = parseResult.data;
    const { assessmentInputs } = await import('../db/schema');
    const updatedRecords = [];

    for (const [key, val] of Object.entries(data)) {
      if (val === undefined || val === null) continue;

      let inputType: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'JSON' = 'TEXT';
      let valueText: string | null = null;
      let valueNumber: string | null = null;
      let valueBoolean: boolean | null = null;

      if (typeof val === 'number') {
        inputType = 'NUMBER';
        valueNumber = String(val); // Always store exact zero correctly
      } else if (typeof val === 'boolean') {
        inputType = 'BOOLEAN';
        valueBoolean = val;
      } else if (typeof val === 'string') {
        inputType = 'TEXT';
        valueText = val;
      }

      const record = await db
        .insert(assessmentInputs)
        .values({
          assessmentId,
          inputKey: key,
          inputType,
          valueText,
          valueNumber,
          valueBoolean,
          source: 'USER',
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [assessmentInputs.assessmentId, assessmentInputs.inputKey],
          set: {
            inputType,
            valueText,
            valueNumber,
            valueBoolean,
            updatedAt: new Date(),
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
