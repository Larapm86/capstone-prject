CREATE TABLE "user_profile" (
	"user_id" text PRIMARY KEY NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "craving" ADD COLUMN "triggers" text[];--> statement-breakpoint
ALTER TABLE "craving" ADD COLUMN "emotion" text;--> statement-breakpoint
ALTER TABLE "craving" ADD COLUMN "familiar" text;--> statement-breakpoint
ALTER TABLE "craving" ADD COLUMN "mind_saying" text;--> statement-breakpoint
ALTER TABLE "craving" ADD COLUMN "needs" text[];--> statement-breakpoint
ALTER TABLE "craving" ADD COLUMN "choice" text;--> statement-breakpoint
ALTER TABLE "craving" ADD COLUMN "before_during_after" text;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "craving_user_id_created_at_idx" ON "craving" USING btree ("user_id","created_at");