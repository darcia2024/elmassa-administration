CREATE TABLE "booking_statuses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"stage" text DEFAULT 'Booking' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"payment_impact" text DEFAULT '' NOT NULL,
	"document_impact" text DEFAULT '' NOT NULL,
	"owner_role" text DEFAULT 'Admin Operasional' NOT NULL,
	"mode" text DEFAULT 'Aktif' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text DEFAULT 'Wisata' NOT NULL,
	"default_duration" text DEFAULT '' NOT NULL,
	"document_template" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'Aktif' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"role" text DEFAULT 'Sales' NOT NULL,
	"branch" text DEFAULT 'Bekasi' NOT NULL,
	"status" text DEFAULT 'Aktif' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bank_accounts" ADD COLUMN "is_primary" boolean DEFAULT false NOT NULL;