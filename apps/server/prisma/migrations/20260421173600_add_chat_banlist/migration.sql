-- CreateTable
CREATE TABLE "ChatBannedUser" (
    "chatId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actorId" TEXT,
    "reason" TEXT,
    "bannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatBannedUser_pkey" PRIMARY KEY ("chatId","userId")
);

-- CreateIndex
CREATE INDEX "ChatBannedUser_chatId_bannedAt_idx" ON "ChatBannedUser"("chatId", "bannedAt" DESC);

-- CreateIndex
CREATE INDEX "ChatBannedUser_userId_idx" ON "ChatBannedUser"("userId");

-- AddForeignKey
ALTER TABLE "ChatBannedUser" ADD CONSTRAINT "ChatBannedUser_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatBannedUser" ADD CONSTRAINT "ChatBannedUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatBannedUser" ADD CONSTRAINT "ChatBannedUser_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
