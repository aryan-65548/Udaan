import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  unique,
  index,
} from 'drizzle-orm/pg-core';
import { assessments } from './assessments';
import { users } from './users';

export const questionnaireQuestions = pgTable(
  'questionnaire_questions',
  {
    id: varchar('id', { length: 100 }).primaryKey(),
    code: varchar('code', { length: 100 }).notNull().unique(),
    version: integer('version').notNull().default(1),
    displayOrder: integer('display_order').notNull(),
    questionText: text('question_text').notNull(),
    questionType: varchar('question_type', { length: 50 }).notNull(),
    options: jsonb('options'),
    isRequired: boolean('is_required').notNull().default(true),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    displayOrderIdx: index('questionnaire_questions_order_idx').on(table.displayOrder),
    codeIdx: index('questionnaire_questions_code_idx').on(table.code),
  })
);

export const questionnaireResponses = pgTable(
  'questionnaire_responses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    assessmentId: uuid('assessment_id')
      .notNull()
      .references(() => assessments.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    questionId: varchar('question_id', { length: 100 })
      .notNull()
      .references(() => questionnaireQuestions.id),
    questionCode: varchar('question_code', { length: 100 }).notNull(),
    questionnaireVersion: integer('questionnaire_version').notNull().default(1),
    responseJson: jsonb('response_json').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    assessmentIdIdx: index('questionnaire_responses_assessment_id_idx').on(table.assessmentId),
    userIdIdx: index('questionnaire_responses_user_id_idx').on(table.userId),
    unqAssessmentQuestion: unique('unq_assessment_question_response').on(
      table.assessmentId,
      table.questionCode
    ),
  })
);
