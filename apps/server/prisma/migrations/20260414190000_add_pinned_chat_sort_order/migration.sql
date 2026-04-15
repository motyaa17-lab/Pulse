-- Add per-user ordering for pinned chats.
ALTER TABLE "PinnedChat"
  ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- Backfill existing pins with a stable order (oldest pin first).
WITH ranked AS (
  SELECT
    "userId",
    "chatId",
    ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "pinnedAt" ASC, "chatId" ASC) - 1 AS rn
  FROM "PinnedChat"
)
UPDATE "PinnedChat" pc
SET "sortOrder" = ranked.rn
FROM ranked
WHERE pc."userId" = ranked."userId" AND pc."chatId" = ranked."chatId";

