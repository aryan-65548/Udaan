DO $$ BEGIN
 CREATE TYPE "location_type" AS ENUM('STATE', 'DISTRICT', 'BLOCK', 'VILLAGE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "ai_status" AS ENUM('NOT_STARTED', 'QUESTIONING', 'ANALYZING', 'COMPLETED', 'FAILED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "assessment_status" AS ENUM('DRAFT', 'IN_PROGRESS', 'AI_QUESTIONING', 'AI_ANALYZING', 'REPORT_READY', 'COMPLETED', 'FAILED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "input_source" AS ENUM('USER', 'AI', 'SYSTEM');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "input_type" AS ENUM('TEXT', 'NUMBER', 'BOOLEAN', 'SELECT', 'MULTI_SELECT', 'DATE', 'JSON');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(150) NOT NULL,
	"type" "location_type" NOT NULL,
	"parent_id" uuid,
	"state_code" varchar(20),
	"district_code" varchar(20),
	"block_code" varchar(20),
	"village_code" varchar(30),
	"latitude" numeric(9, 6),
	"longitude" numeric(9, 6),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "business_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"parent_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "business_categories_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"business_category_id" uuid NOT NULL,
	"language" varchar(10) DEFAULT 'en' NOT NULL,
	"status" "assessment_status" DEFAULT 'IN_PROGRESS' NOT NULL,
	"ai_status" "ai_status" DEFAULT 'NOT_STARTED' NOT NULL,
	"ai_session_id" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "assessment_inputs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"input_key" varchar(100) NOT NULL,
	"question_text" text,
	"input_type" "input_type" NOT NULL,
	"value_text" text,
	"value_number" numeric(14, 2),
	"value_boolean" boolean,
	"value_json" jsonb,
	"source" "input_source" DEFAULT 'USER' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unq_assessment_input_key" UNIQUE("assessment_id","input_key")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_parent_id_idx" ON "locations" ("parent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_type_idx" ON "locations" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_state_code_idx" ON "locations" ("state_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_district_code_idx" ON "locations" ("district_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_block_code_idx" ON "locations" ("block_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "business_categories_parent_id_idx" ON "business_categories" ("parent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "business_categories_sort_order_idx" ON "business_categories" ("sort_order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "assessments_user_id_idx" ON "assessments" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "assessments_status_idx" ON "assessments" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "assessments_location_id_idx" ON "assessments" ("location_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "assessments_business_category_id_idx" ON "assessments" ("business_category_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "assessment_inputs_assessment_id_idx" ON "assessment_inputs" ("assessment_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "financial_runs" ADD CONSTRAINT "financial_runs_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "locations" ADD CONSTRAINT "locations_parent_id_locations_id_fk" FOREIGN KEY ("parent_id") REFERENCES "locations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "business_categories" ADD CONSTRAINT "business_categories_parent_id_business_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "business_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assessments" ADD CONSTRAINT "assessments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assessments" ADD CONSTRAINT "assessments_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assessments" ADD CONSTRAINT "assessments_business_category_id_business_categories_id_fk" FOREIGN KEY ("business_category_id") REFERENCES "business_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assessment_inputs" ADD CONSTRAINT "assessment_inputs_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
