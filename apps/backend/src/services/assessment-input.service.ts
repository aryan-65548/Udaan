import { db } from '../db';
import { assessmentInputs } from '../db/schema';
import { eq } from 'drizzle-orm';
import { InputType, InputSource } from '../types/assessment-context';

export interface UpsertAssessmentInputData {
  questionText?: string | null;
  inputType: InputType;
  valueText?: string | null;
  valueNumber?: number | string | null;
  valueBoolean?: boolean | null;
  valueJson?: unknown | null;
  source?: InputSource;
}

/**
 * Upserts a single assessment input for the given assessmentId and inputKey.
 * Enforces normalization of values across appropriate database columns.
 */
export async function upsertAssessmentInput(
  assessmentId: string,
  inputKey: string,
  data: UpsertAssessmentInputData
) {
  const values = {
    assessmentId,
    inputKey,
    questionText: data.questionText ?? null,
    inputType: data.inputType,
    valueText: data.valueText ?? null,
    valueNumber:
      data.valueNumber !== undefined && data.valueNumber !== null
        ? String(data.valueNumber)
        : null,
    valueBoolean: data.valueBoolean ?? null,
    valueJson: data.valueJson ?? null,
    source: data.source ?? 'USER',
    updatedAt: new Date(),
  };

  const [record] = await db
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

  return record;
}

/**
 * Retrieves all normalized assessment inputs for a given assessmentId.
 */
export async function getAssessmentInputs(assessmentId: string) {
  return db
    .select()
    .from(assessmentInputs)
    .where(eq(assessmentInputs.assessmentId, assessmentId));
}
