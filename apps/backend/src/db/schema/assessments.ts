import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { locations } from './locations';
import { businessCategories } from './business-categories';

export const assessmentStatusEnum = pgEnum('assessment_status', [
  'DRAFT',
  'IN_PROGRESS',
  'AI_QUESTIONING',
  'AI_ANALYZING',
  'REPORT_READY',
  'COMPLETED',
  'FAILED',
]);

export const aiStatusEnum = pgEnum('ai_status', [
  'NOT_STARTED',
  'QUESTIONING',
  'ANALYZING',
  'COMPLETED',
  'FAILED',
]);

export const assessments = pgTable(
  'assessments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    locationId: uuid('location_id')
      .notNull()
      .references(() => locations.id),
    businessCategoryId: uuid('business_category_id')
      .notNull()
      .references(() => businessCategories.id),
    language: varchar('language', { length: 10 }).notNull().default('en'),
    status: assessmentStatusEnum('status').notNull().default('IN_PROGRESS'),
    aiStatus: aiStatusEnum('ai_status').notNull().default('NOT_STARTED'),
    aiSessionId: varchar('ai_session_id', { length: 100 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => ({
    userIdIdx: index('assessments_user_id_idx').on(table.userId),
    statusIdx: index('assessments_status_idx').on(table.status),
    locationIdIdx: index('assessments_location_id_idx').on(table.locationId),
    businessCategoryIdIdx: index('assessments_business_category_id_idx').on(table.businessCategoryId),
  })
);
