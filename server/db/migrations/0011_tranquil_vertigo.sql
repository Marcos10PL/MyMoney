CREATE TYPE "public"."allocation_mode" AS ENUM('value', 'cost');--> statement-breakpoint
ALTER TABLE "portfolio_assets" ADD COLUMN "allocation_mode" "allocation_mode" DEFAULT 'value' NOT NULL;