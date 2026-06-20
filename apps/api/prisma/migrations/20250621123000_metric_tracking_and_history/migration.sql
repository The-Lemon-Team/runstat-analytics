-- CreateEnum
CREATE TYPE "MetricTrackingMode" AS ENUM ('AUTOMATIC', 'MANUAL');

-- CreateEnum
CREATE TYPE "MetricCaptureSource" AS ENUM ('SYNC', 'MANUAL');

-- AlterTable
ALTER TABLE "publications" ADD COLUMN     "metricTrackingMode" "MetricTrackingMode" NOT NULL DEFAULT 'AUTOMATIC';

-- CreateTable
CREATE TABLE "metric_history_entries" (
    "id" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "source" "MetricCaptureSource" NOT NULL,
    "likes" INTEGER NOT NULL,
    "comments" INTEGER NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "likesDelta" INTEGER NOT NULL DEFAULT 0,
    "commentsDelta" INTEGER NOT NULL DEFAULT 0,
    "viewsDelta" INTEGER NOT NULL DEFAULT 0,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metric_history_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "metric_history_entries_publicationId_capturedAt_idx" ON "metric_history_entries"("publicationId", "capturedAt" DESC);

-- AddForeignKey
ALTER TABLE "metric_history_entries" ADD CONSTRAINT "metric_history_entries_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "publications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
