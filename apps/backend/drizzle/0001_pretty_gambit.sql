DO $$ BEGIN
 CREATE TYPE "payment_frequency" AS ENUM('MONTHLY', 'QUARTERLY', 'YEARLY');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "financial_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"scheme_config_id" uuid,
	"project_cost" numeric(14, 2) NOT NULL,
	"own_contribution" numeric(14, 2) NOT NULL,
	"loan_amount" numeric(14, 2) NOT NULL,
	"monthly_revenue" numeric(14, 2),
	"monthly_operating_cost" numeric(14, 2),
	"interest_rate" numeric(6, 3) NOT NULL,
	"tenure_months" integer NOT NULL,
	"moratorium_months" integer NOT NULL,
	"payment_frequency" "payment_frequency" NOT NULL,
	"emi" numeric(14, 2),
	"installment_amount" numeric(14, 2),
	"annual_debt_service" numeric(14, 2),
	"dscr" numeric(8, 4),
	"total_interest" numeric(14, 2),
	"total_repayment" numeric(14, 2),
	"calculation_version" varchar(30) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "repayment_schedule_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"financial_run_id" uuid NOT NULL,
	"sequence_number" integer NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"due_date" date NOT NULL,
	"opening_principal" numeric(14, 2) NOT NULL,
	"principal_payment" numeric(14, 2) NOT NULL,
	"interest_payment" numeric(14, 2) NOT NULL,
	"installment_amount" numeric(14, 2) NOT NULL,
	"closing_principal" numeric(14, 2) NOT NULL,
	"is_moratorium" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "repayment_schedule_items_financial_run_id_sequence_number_unique" UNIQUE("financial_run_id","sequence_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scheme_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scheme_code" varchar(50) NOT NULL,
	"scheme_name" varchar(150) NOT NULL,
	"min_project_cost" numeric(14, 2),
	"max_project_cost" numeric(14, 2),
	"financing_percentage" numeric(6, 3),
	"max_loan_amount" numeric(14, 2),
	"interest_rate" numeric(6, 3),
	"tenure_months" integer,
	"moratorium_months" integer,
	"payment_frequency" "payment_frequency",
	"beneficiary_type" varchar(100),
	"income_limit" numeric(14, 2),
	"effective_from" date NOT NULL,
	"effective_to" date,
	"source_name" varchar(200) NOT NULL,
	"source_reference" text NOT NULL,
	"is_active" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "scheme_configs_scheme_code_unique" UNIQUE("scheme_code")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "financial_runs" ADD CONSTRAINT "financial_runs_scheme_config_id_scheme_configs_id_fk" FOREIGN KEY ("scheme_config_id") REFERENCES "scheme_configs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "repayment_schedule_items" ADD CONSTRAINT "repayment_schedule_items_financial_run_id_financial_runs_id_fk" FOREIGN KEY ("financial_run_id") REFERENCES "financial_runs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
