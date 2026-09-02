import {
  pgTable,
  uuid,
  varchar,
  decimal,
  timestamp,
  pgEnum,
  index,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';

export const locationTypeEnum = pgEnum('location_type', ['STATE', 'DISTRICT', 'BLOCK', 'VILLAGE']);

export const locations = pgTable('locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 150 }).notNull(),
  type: locationTypeEnum('type').notNull(),
  parentId: uuid('parent_id').references((): AnyPgColumn => locations.id),
  stateCode: varchar('state_code', { length: 20 }),
  districtCode: varchar('district_code', { length: 20 }),
  blockCode: varchar('block_code', { length: 20 }),
  villageCode: varchar('village_code', { length: 30 }),
  latitude: decimal('latitude', { precision: 9, scale: 6 }),
  longitude: decimal('longitude', { precision: 9, scale: 6 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  parentIdIdx: index('locations_parent_id_idx').on(table.parentId),
  typeIdx: index('locations_type_idx').on(table.type),
  stateCodeIdx: index('locations_state_code_idx').on(table.stateCode),
  districtCodeIdx: index('locations_district_code_idx').on(table.districtCode),
  blockCodeIdx: index('locations_block_code_idx').on(table.blockCode),
}));
