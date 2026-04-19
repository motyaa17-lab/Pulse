-- Private channel invite links (Telegram-style)
ALTER TABLE "ChannelMetadata" ADD COLUMN "inviteSlug" TEXT;
ALTER TABLE "ChannelMetadata" ADD COLUMN "inviteEnabled" BOOLEAN NOT NULL DEFAULT true;

UPDATE "ChannelMetadata" cm
SET
  "inviteSlug" = 'c' || replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
  "inviteEnabled" = true
FROM "Chat" c
WHERE cm."chatId" = c."id"
  AND c."type" = 'CHANNEL'
  AND c."isPrivate" = true
  AND cm."inviteSlug" IS NULL;

CREATE UNIQUE INDEX "ChannelMetadata_inviteSlug_key" ON "ChannelMetadata"("inviteSlug");

UPDATE "ChannelMetadata" cm
SET "inviteEnabled" = false
FROM "Chat" c
WHERE cm."chatId" = c."id"
  AND c."type" = 'CHANNEL'
  AND c."isPrivate" = false;
