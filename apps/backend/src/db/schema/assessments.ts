import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
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

    // Unified Location Details (Administrative or Google Maps)
    locationSelectionMethod: varchar('location_selection_method', { length: 30 })
      .notNull()
      .default('ADMINISTRATIVE'),
    countryCode: varchar('country_code', { length: 10 }).notNull().default('IN'),
    stateName: varchar('state_name', { length: 150 }),
    districtName: varchar('district_name', { length: 150 }),
    blockName: varchar('block_name', { length: 150 }),
    villageName: varchar('village_name', { length: 150 }),
    formattedAddress: text('formatted_address'),
    latitude: decimal('latitude', { precision: 10, scale: 7 }),
    longitude: decimal('longitude', { precision: 10, scale: 7 }),
    googlePlaceId: varchar('google_place_id', { length: 255 }),

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
