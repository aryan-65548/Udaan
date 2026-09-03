import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  boolean,
  jsonb,
  timestamp,
  pgEnum,
  unique,
  index,
} from 'drizzle-orm/pg-core';
import { assessments } from './assessments';

export const inputTypeEnum = pgEnum('input_type', [
  'TEXT',
  'NUMBER',
  'BOOLEAN',
  'SELECT',
  'MULTI_SELECT',
  'DATE',
  'JSON',
]);

export const inputSourceEnum = pgEnum('input_source', [
  'USER',
  'AI',
  'SYSTEM',
]);

export const assessmentInputs = pgTable(
  'assessment_inputs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    assessmentId: uuid('assessment_id')
      .notNull()
      .references(() => assessments.id, { onDelete: 'cascade' }),
    inputKey: varchar('input_key', { length: 100 }).notNull(),
    questionText: text('question_text'),
    inputType: inputTypeEnum('input_type').notNull(),
    valueText: text('value_text'),
    valueNumber: decimal('value_number', { precision: 14, scale: 2 }),
    valueBoolean: boolean('value_boolean'),
    valueJson: jsonb('value_json'),
    source: inputSourceEnum('source').notNull().default('USER'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    assessmentIdIdx: index('assessment_inputs_assessment_id_idx').on(table.assessmentId),
    unqAssessmentKey: unique('unq_assessment_input_key').on(table.assessmentId, table.inputKey),
  })
);
