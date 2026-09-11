import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  unique,
  index,
} from 'drizzle-orm/pg-core';
import { assessments } from './assessments';

export const validationTaskStatusEnum = pgEnum('validation_task_status', [
  'PENDING',
  'COMPLETED',
  'SKIPPED',
]);

export const validationTasks = pgTable(
  'validation_tasks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    assessmentId: uuid('assessment_id')
      .notNull()
      .references(() => assessments.id, { onDelete: 'cascade' }),
    taskKey: varchar('task_key', { length: 100 }).notNull(),
    taskText: text('task_text').notNull(),
    status: validationTaskStatusEnum('status').notNull().default('PENDING'),
    notes: text('notes'),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    assessmentIdIdx: index('validation_tasks_assessment_id_idx').on(table.assessmentId),
    statusIdx: index('validation_tasks_status_idx').on(table.status),
    unqAssessmentTaskKey: unique('unq_validation_task_assessment_key').on(table.assessmentId, table.taskKey),
  })
);
