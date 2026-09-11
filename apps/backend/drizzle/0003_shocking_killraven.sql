DO $$ BEGIN
 CREATE TYPE "validation_task_status" AS ENUM('PENDING', 'COMPLETED', 'SKIPPED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "validation_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"task_key" varchar(100) NOT NULL,
	"task_text" text NOT NULL,
	"status" "validation_task_status" DEFAULT 'PENDING' NOT NULL,
	"notes" text,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unq_validation_task_assessment_key" UNIQUE("assessment_id","task_key")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "validation_tasks_assessment_id_idx" ON "validation_tasks" ("assessment_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "validation_tasks_status_idx" ON "validation_tasks" ("status");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "validation_tasks" ADD CONSTRAINT "validation_tasks_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
