ALTER TABLE "assessments" ADD COLUMN IF NOT EXISTS "location_selection_method" varchar(30) DEFAULT 'ADMINISTRATIVE' NOT NULL;
--> statement-breakpoint
ALTER TABLE "assessments" ADD COLUMN IF NOT EXISTS "country_code" varchar(10) DEFAULT 'IN' NOT NULL;
--> statement-breakpoint
ALTER TABLE "assessments" ADD COLUMN IF NOT EXISTS "state_name" varchar(150);
--> statement-breakpoint
ALTER TABLE "assessments" ADD COLUMN IF NOT EXISTS "district_name" varchar(150);
--> statement-breakpoint
ALTER TABLE "assessments" ADD COLUMN IF NOT EXISTS "block_name" varchar(150);
--> statement-breakpoint
ALTER TABLE "assessments" ADD COLUMN IF NOT EXISTS "village_name" varchar(150);
--> statement-breakpoint
ALTER TABLE "assessments" ADD COLUMN IF NOT EXISTS "formatted_address" text;
--> statement-breakpoint
ALTER TABLE "assessments" ADD COLUMN IF NOT EXISTS "latitude" numeric(10, 7);
--> statement-breakpoint
ALTER TABLE "assessments" ADD COLUMN IF NOT EXISTS "longitude" numeric(10, 7);
--> statement-breakpoint
ALTER TABLE "assessments" ADD COLUMN IF NOT EXISTS "google_place_id" varchar(255);
