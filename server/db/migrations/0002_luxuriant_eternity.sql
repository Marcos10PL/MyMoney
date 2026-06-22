ALTER TABLE "transactions" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_name_unique" UNIQUE("name");