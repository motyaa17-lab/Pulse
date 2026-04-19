-- Group invite links and Telegram-like member-invite permissions
ALTER TABLE "GroupMetadata" ADD COLUMN "inviteSlug" TEXT;
ALTER TABLE "GroupMetadata" ADD COLUMN "inviteEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "GroupMetadata" ADD COLUMN "onlyAdminsCanAddMembers" BOOLEAN NOT NULL DEFAULT false;

UPDATE "GroupMetadata"
SET "inviteSlug" = 'g' || replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
WHERE "inviteSlug" IS NULL;

CREATE UNIQUE INDEX "GroupMetadata_inviteSlug_key" ON "GroupMetadata"("inviteSlug");
