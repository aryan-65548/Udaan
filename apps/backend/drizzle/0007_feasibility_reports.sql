CREATE TABLE IF NOT EXISTS "support_organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"address" text NOT NULL,
	"phone" text,
	"email" text,
	"website" text,
	"explanation" text NOT NULL,
	"location_state" text,
	"location_district" text,
	"location_city" text,
	"business_category_code" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "curated_videos" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"youtube_id" text NOT NULL,
	"language" text NOT NULL,
	"category" text NOT NULL,
	"display_order" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "report_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"template_key" text NOT NULL UNIQUE,
	"title" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"business_category_code" text,
	"location_context" jsonb,
	"sections_json" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "feasibility_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL REFERENCES "assessments"("id") ON DELETE cascade,
	"user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
	"template_id" text REFERENCES "report_templates"("id"),
	"version" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'GENERATED' NOT NULL,
	"report_snapshot" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"downloaded_at" timestamp
);

CREATE INDEX IF NOT EXISTS "support_orgs_active_idx" ON "support_organizations" ("is_active", "display_order");
CREATE INDEX IF NOT EXISTS "support_orgs_location_idx" ON "support_organizations" ("location_city", "location_district");
CREATE INDEX IF NOT EXISTS "curated_videos_active_idx" ON "curated_videos" ("is_active", "display_order");
CREATE UNIQUE INDEX IF NOT EXISTS "report_templates_key_idx" ON "report_templates" ("template_key");
CREATE INDEX IF NOT EXISTS "report_templates_cat_idx" ON "report_templates" ("business_category_code");
CREATE UNIQUE INDEX IF NOT EXISTS "feasibility_reports_assessment_idx" ON "feasibility_reports" ("assessment_id");
CREATE INDEX IF NOT EXISTS "feasibility_reports_user_idx" ON "feasibility_reports" ("user_id");
