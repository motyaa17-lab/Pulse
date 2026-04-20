-- Add moderation fields to User
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "mutedUntil" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "mutedReason" TEXT,
  ADD COLUMN IF NOT EXISTS "bannedUntil" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "bannedReason" TEXT;

-- Create enum for moderation action type (Postgres)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ModerationActionType') THEN
    CREATE TYPE "ModerationActionType" AS ENUM (
      'BAN_USER',
      'UNBAN_USER',
      'MUTE_USER',
      'UNMUTE_USER',
      'DELETE_MESSAGE',
      'CLOSE_REPORT',
      'REOPEN_REPORT',
      'NOTE_REPORT'
    );
  END IF;
END
$$;

-- Create ModerationAction table
CREATE TABLE IF NOT EXISTS "ModerationAction" (
  "id" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "targetUserId" TEXT,
  "reportId" TEXT,
  "messageId" TEXT,
  "actionType" "ModerationActionType" NOT NULL,
  "reason" TEXT,
  "metaJson" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ModerationAction_pkey" PRIMARY KEY ("id")
);

-- Foreign keys
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ModerationAction_actorId_fkey'
  ) THEN
    ALTER TABLE "ModerationAction"
      ADD CONSTRAINT "ModerationAction_actorId_fkey"
      FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ModerationAction_targetUserId_fkey'
  ) THEN
    ALTER TABLE "ModerationAction"
      ADD CONSTRAINT "ModerationAction_targetUserId_fkey"
      FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ModerationAction_reportId_fkey'
  ) THEN
    ALTER TABLE "ModerationAction"
      ADD CONSTRAINT "ModerationAction_reportId_fkey"
      FOREIGN KEY ("reportId") REFERENCES "MessageReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ModerationAction_messageId_fkey'
  ) THEN
    ALTER TABLE "ModerationAction"
      ADD CONSTRAINT "ModerationAction_messageId_fkey"
      FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

-- Indexes
CREATE INDEX IF NOT EXISTS "ModerationAction_actorId_createdAt_idx"
  ON "ModerationAction"("actorId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "ModerationAction_targetUserId_createdAt_idx"
  ON "ModerationAction"("targetUserId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "ModerationAction_reportId_idx"
  ON "ModerationAction"("reportId");
CREATE INDEX IF NOT EXISTS "ModerationAction_messageId_idx"
  ON "ModerationAction"("messageId");

