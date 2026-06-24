-- AlterTable
ALTER TABLE "publications" ADD COLUMN "subscriberSourceId" TEXT;

-- CreateTable
CREATE TABLE "publication_channel_attachments" (
    "id" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "subscriberSourceId" TEXT NOT NULL,
    "attachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "publication_channel_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "publications_subscriberSourceId_idx" ON "publications"("subscriberSourceId");

-- CreateIndex
CREATE INDEX "publication_channel_attachments_subscriberSourceId_attachedAt_idx" ON "publication_channel_attachments"("subscriberSourceId", "attachedAt" DESC);

-- CreateIndex
CREATE INDEX "publication_channel_attachments_publicationId_attachedAt_idx" ON "publication_channel_attachments"("publicationId", "attachedAt" DESC);

-- AddForeignKey
ALTER TABLE "publications" ADD CONSTRAINT "publications_subscriberSourceId_fkey" FOREIGN KEY ("subscriberSourceId") REFERENCES "subscriber_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_channel_attachments" ADD CONSTRAINT "publication_channel_attachments_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "publications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_channel_attachments" ADD CONSTRAINT "publication_channel_attachments_subscriberSourceId_fkey" FOREIGN KEY ("subscriberSourceId") REFERENCES "subscriber_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
