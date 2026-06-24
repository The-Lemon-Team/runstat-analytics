-- CreateEnum
CREATE TYPE "SubscriberTrackingMode" AS ENUM ('AUTOMATIC', 'MANUAL');

-- CreateEnum
CREATE TYPE "SubscriberCaptureSource" AS ENUM ('SYNC', 'MANUAL');

-- AlterTable
ALTER TABLE "subscriber_sources" ADD COLUMN "profileUrl" TEXT;
ALTER TABLE "subscriber_sources" ADD COLUMN "trackingMode" "SubscriberTrackingMode" NOT NULL DEFAULT 'AUTOMATIC';

-- AlterTable
ALTER TABLE "subscriber_snapshots" ADD COLUMN "captureSource" "SubscriberCaptureSource" NOT NULL DEFAULT 'SYNC';
