CREATE TABLE "packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"service_type" text NOT NULL,
	"package_type" text DEFAULT 'Reguler' NOT NULL,
	"itinerary" text DEFAULT '' NOT NULL,
	"base_price" integer,
	"duration_days" integer,
	"status" text DEFAULT 'Draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
