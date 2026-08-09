ALTER TYPE "public"."transaction_type" ADD VALUE 'investment_buy';--> statement-breakpoint
ALTER TYPE "public"."transaction_type" ADD VALUE 'investment_sell';--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "asset_id" uuid;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "quantity" numeric(15, 6);--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "transactions_asset_id_idx" ON "transactions" USING btree ("asset_id");