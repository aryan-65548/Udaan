CREATE TABLE IF NOT EXISTS "questionnaire_questions" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"code" varchar(100) NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"display_order" integer NOT NULL,
	"question_text" text NOT NULL,
	"question_type" varchar(50) NOT NULL,
	"options" jsonb,
	"is_required" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "questionnaire_questions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "questionnaire_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"question_id" varchar(100) NOT NULL,
	"question_code" varchar(100) NOT NULL,
	"questionnaire_version" integer DEFAULT 1 NOT NULL,
	"response_json" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unq_assessment_question_response" UNIQUE("assessment_id","question_code")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "questionnaire_questions_order_idx" ON "questionnaire_questions" ("display_order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "questionnaire_questions_code_idx" ON "questionnaire_questions" ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "questionnaire_responses_assessment_id_idx" ON "questionnaire_responses" ("assessment_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "questionnaire_responses_user_id_idx" ON "questionnaire_responses" ("user_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "questionnaire_responses" ADD CONSTRAINT "questionnaire_responses_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "questionnaire_responses" ADD CONSTRAINT "questionnaire_responses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "questionnaire_responses" ADD CONSTRAINT "questionnaire_responses_question_id_questionnaire_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "questionnaire_questions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
