-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "exceptionReason" TEXT,
ADD COLUMN     "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "totalDetentionMinutes" INTEGER NOT NULL DEFAULT 0;
