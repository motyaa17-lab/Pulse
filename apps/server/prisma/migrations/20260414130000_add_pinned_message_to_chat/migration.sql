-- Add per-chat pinned message (MVP: one message per chat).
-- Written to be safe to run against an already-existing schema (Railway/prod-like DB).
ALTER TABLE "Chat" ADD COLUMN IF NOT EXISTS "pinnedMessageId" TEXT;
ALTER TABLE "Chat" ADD COLUMN IF NOT EXISTS "pinnedByUserId" TEXT;
ALTER TABLE "Chat" ADD COLUMN IF NOT EXISTS "pinnedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "Chat_pinnedMessageId_key" ON "Chat"("pinnedMessageId");

DO $$
BEGIN
  ALTER TABLE "Chat"
  ADD CONSTRAINT "Chat_pinnedMessageId_fkey"
  FOREIGN KEY ("pinnedMessageId") REFERENCES "Message"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "Chat"
  ADD CONSTRAINT "Chat_pinnedByUserId_fkey"
  FOREIGN KEY ("pinnedByUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

