CREATE TYPE "public"."bankroll" AS ENUM('live', 'online');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('active', 'completed');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('deposit', 'withdrawal', 'adjustment');--> statement-breakpoint
CREATE TYPE "public"."venue" AS ENUM('casino', 'home', 'online');--> statement-breakpoint
CREATE TABLE "bankroll_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"bankroll" "bankroll" NOT NULL,
	"type" "transaction_type" NOT NULL,
	"amount" integer NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rebuys" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"venue" "venue" NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"stakes_small" integer NOT NULL,
	"stakes_big" integer NOT NULL,
	"buy_in" integer NOT NULL,
	"cash_out" integer,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone,
	"status" "session_status" DEFAULT 'completed' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rebuys" ADD CONSTRAINT "rebuys_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;