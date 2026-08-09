CREATE TABLE "asset_accounts" (
	"asset_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	CONSTRAINT "asset_accounts_asset_id_account_id_pk" PRIMARY KEY("asset_id","account_id")
);
--> statement-breakpoint
ALTER TABLE "assets" DROP CONSTRAINT "assets_account_id_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "asset_accounts" ADD CONSTRAINT "asset_accounts_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_accounts" ADD CONSTRAINT "asset_accounts_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "asset_accounts_asset_id_idx" ON "asset_accounts" USING btree ("asset_id");--> statement-breakpoint
ALTER TABLE "assets" DROP COLUMN "account_id";