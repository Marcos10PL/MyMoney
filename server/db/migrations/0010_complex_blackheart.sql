ALTER TABLE "users" ADD COLUMN "mcp_token_hash" text;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_mcp_token_hash_unique" UNIQUE("mcp_token_hash");