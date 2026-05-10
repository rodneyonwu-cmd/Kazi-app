-- Lounge feature tables
-- Verified-provider community: threads, replies, votes, polls, group memberships, bookmarks.

CREATE TABLE "LoungeThread" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "roleType" TEXT,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoungeThread_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LoungeThread_scope_createdAt_idx" ON "LoungeThread"("scope", "createdAt");
CREATE INDEX "LoungeThread_authorId_idx" ON "LoungeThread"("authorId");

CREATE TABLE "LoungeReply" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoungeReply_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LoungeReply_threadId_createdAt_idx" ON "LoungeReply"("threadId", "createdAt");

ALTER TABLE "LoungeReply"
    ADD CONSTRAINT "LoungeReply_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "LoungeThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "LoungeVote" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoungeVote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LoungeVote_threadId_userId_key" ON "LoungeVote"("threadId", "userId");
CREATE INDEX "LoungeVote_threadId_idx" ON "LoungeVote"("threadId");

ALTER TABLE "LoungeVote"
    ADD CONSTRAINT "LoungeVote_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "LoungeThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "LoungeReplyVote" (
    "id" TEXT NOT NULL,
    "replyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoungeReplyVote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LoungeReplyVote_replyId_userId_key" ON "LoungeReplyVote"("replyId", "userId");

ALTER TABLE "LoungeReplyVote"
    ADD CONSTRAINT "LoungeReplyVote_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "LoungeReply"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "LoungePoll" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "closesAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoungePoll_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LoungePoll_threadId_key" ON "LoungePoll"("threadId");

ALTER TABLE "LoungePoll"
    ADD CONSTRAINT "LoungePoll_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "LoungeThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "LoungePollOption" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "LoungePollOption_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LoungePollOption_pollId_order_idx" ON "LoungePollOption"("pollId", "order");

ALTER TABLE "LoungePollOption"
    ADD CONSTRAINT "LoungePollOption_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "LoungePoll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "LoungePollVote" (
    "id" TEXT NOT NULL,
    "pollOptionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoungePollVote_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LoungePollVote_pollOptionId_idx" ON "LoungePollVote"("pollOptionId");
CREATE INDEX "LoungePollVote_userId_idx" ON "LoungePollVote"("userId");

ALTER TABLE "LoungePollVote"
    ADD CONSTRAINT "LoungePollVote_pollOptionId_fkey" FOREIGN KEY ("pollOptionId") REFERENCES "LoungePollOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "LoungeGroupMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoungeGroupMembership_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LoungeGroupMembership_userId_groupId_key" ON "LoungeGroupMembership"("userId", "groupId");
CREATE INDEX "LoungeGroupMembership_groupId_idx" ON "LoungeGroupMembership"("groupId");

CREATE TABLE "LoungeBookmark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoungeBookmark_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LoungeBookmark_userId_threadId_key" ON "LoungeBookmark"("userId", "threadId");
CREATE INDEX "LoungeBookmark_userId_idx" ON "LoungeBookmark"("userId");

ALTER TABLE "LoungeBookmark"
    ADD CONSTRAINT "LoungeBookmark_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "LoungeThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
