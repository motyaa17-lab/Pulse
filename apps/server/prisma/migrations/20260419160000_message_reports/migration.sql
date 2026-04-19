CREATE TYPE "ReportSource" AS ENUM ('USER', 'AUTOMATED');
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'CLOSED');

CREATE TABLE "MessageReport" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "reporterId" TEXT,
    "source" "ReportSource" NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "flags" TEXT NOT NULL DEFAULT '',
    "note" TEXT,
    "textSnapshot" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageReport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MessageReport_messageId_idx" ON "MessageReport"("messageId");
CREATE INDEX "MessageReport_status_createdAt_idx" ON "MessageReport"("status", "createdAt" DESC);
CREATE INDEX "MessageReport_chatId_createdAt_idx" ON "MessageReport"("chatId", "createdAt" DESC);

ALTER TABLE "MessageReport" ADD CONSTRAINT "MessageReport_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MessageReport" ADD CONSTRAINT "MessageReport_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MessageReport" ADD CONSTRAINT "MessageReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
