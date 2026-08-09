CREATE TABLE "asset_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" uuid NOT NULL,
	"value" numeric(15, 2) NOT NULL,
	"date" date NOT NULL,
	CONSTRAINT "asset_snapshots_asset_date_unique" UNIQUE("asset_id","date")
);
--> statement-breakpoint
ALTER TABLE "asset_snapshots" ADD CONSTRAINT "asset_snapshots_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "asset_snapshots_asset_id_idx" ON "asset_snapshots" USING btree ("asset_id");