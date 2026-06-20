-- CreateTable
CREATE TABLE "subscriber_sources" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "Provider" NOT NULL,
    "externalId" TEXT NOT NULL,
    "handle" TEXT,
    "title" TEXT,
    "pollInput" TEXT NOT NULL,
    "subscriberCount" INTEGER,
    "lastChangedAt" TIMESTAMP(3),
    "lastCheckedAt" TIMESTAMP(3),
    "oauthConnectionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriber_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriber_snapshots" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "delta" INTEGER NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriber_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriber_sources_oauthConnectionId_key" ON "subscriber_sources"("oauthConnectionId");

-- CreateIndex
CREATE INDEX "subscriber_sources_userId_idx" ON "subscriber_sources"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriber_sources_userId_provider_externalId_key" ON "subscriber_sources"("userId", "provider", "externalId");

-- CreateIndex
CREATE INDEX "subscriber_snapshots_sourceId_capturedAt_idx" ON "subscriber_snapshots"("sourceId", "capturedAt" DESC);

-- AddForeignKey
ALTER TABLE "subscriber_sources" ADD CONSTRAINT "subscriber_sources_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriber_sources" ADD CONSTRAINT "subscriber_sources_oauthConnectionId_fkey" FOREIGN KEY ("oauthConnectionId") REFERENCES "oauth_connections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriber_snapshots" ADD CONSTRAINT "subscriber_snapshots_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "subscriber_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
