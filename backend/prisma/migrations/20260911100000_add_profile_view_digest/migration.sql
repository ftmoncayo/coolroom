-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "lastViewerDigestAt" TIMESTAMP(3);

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'PROFILE_VIEW_DIGEST';

-- AlterEnum
ALTER TYPE "NotificationTargetType" ADD VALUE 'PROFILE_VIEW_DIGEST';
