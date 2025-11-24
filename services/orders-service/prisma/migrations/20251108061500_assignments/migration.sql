-- CreateEnum
CREATE TYPE "LoadAssignmentStatus" AS ENUM ('UNASSIGNED', 'SOURCING', 'OFFERED', 'ACCEPTED', 'DECLINED', 'CANCELLED');

-- AlterTable
ALTER TABLE "LoadOrder"
ADD COLUMN     "assignmentId" TEXT,
ADD COLUMN     "assignmentStatus" "LoadAssignmentStatus" NOT NULL DEFAULT 'UNASSIGNED',
ADD COLUMN     "assignmentMetadata" JSONB,
ADD COLUMN     "assignmentLockedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Trip"
ADD COLUMN     "assignmentId" TEXT;

