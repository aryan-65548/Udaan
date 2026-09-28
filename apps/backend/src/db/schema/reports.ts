import { pgTable, text, timestamp, boolean, integer, jsonb, uuid, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { assessments } from './assessments';
import { users } from './users';

export const supportOrganizations = pgTable(
  'support_organizations',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    category: text('category').notNull(),
    address: text('address').notNull(),
    phone: text('phone'),
    email: text('email'),
    website: text('website'),
    explanation: text('explanation').notNull(),
    locationState: text('location_state'),
    locationDistrict: text('location_district'),
    locationCity: text('location_city'),
    businessCategoryCode: text('business_category_code'),
    isActive: boolean('is_active').default(true).notNull(),
    displayOrder: integer('display_order').default(1).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    activeIdx: index('support_orgs_active_idx').on(table.isActive, table.displayOrder),
    locationIdx: index('support_orgs_location_idx').on(table.locationCity, table.locationDistrict),
  })
);

export const curatedVideos = pgTable(
  'curated_videos',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    url: text('url').notNull(),
    youtubeId: text('youtube_id').notNull(),
    language: text('language').notNull(), // 'English', 'Hindi', 'Gujarati'
    category: text('category').notNull(),
    displayOrder: integer('display_order').default(1).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    activeIdx: index('curated_videos_active_idx').on(table.isActive, table.displayOrder),
  })
);

export const reportTemplates = pgTable(
  'report_templates',
  {
    id: text('id').primaryKey(),
    templateKey: text('template_key').notNull().unique(),
    title: text('title').notNull(),
    version: integer('version').default(1).notNull(),
    businessCategoryCode: text('business_category_code'),
    locationContext: jsonb('location_context'),
    sectionsJson: jsonb('sections_json').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    templateKeyIdx: uniqueIndex('report_templates_key_idx').on(table.templateKey),
    categoryIdx: index('report_templates_cat_idx').on(table.businessCategoryCode),
  })
);

export const feasibilityReports = pgTable(
  'feasibility_reports',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    assessmentId: uuid('assessment_id')
      .notNull()
      .references(() => assessments.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    templateId: text('template_id').references(() => reportTemplates.id),
    version: integer('version').default(1).notNull(),
    status: text('status').default('GENERATED').notNull(), // 'GENERATED', 'COMPLETED'
    reportSnapshot: jsonb('report_snapshot').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
    downloadedAt: timestamp('downloaded_at'),
  },
  (table) => ({
    assessmentIdx: uniqueIndex('feasibility_reports_assessment_idx').on(table.assessmentId),
    userIdx: index('feasibility_reports_user_idx').on(table.userId),
  })
);
