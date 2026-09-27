ALTER TABLE "users" ADD COLUMN "google_id" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "business_name" varchar(200);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "business_category" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "operating_state" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "operating_district" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "experience_level" varchar(50);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "business_background" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_google_id_idx" ON "users" ("google_id");