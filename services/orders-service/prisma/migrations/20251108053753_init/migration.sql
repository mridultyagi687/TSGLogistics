-- CreateEnum
CREATE TYPE "LoadStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'BOOKED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'AT_STOP', 'COMPLETED', 'EXCEPTION');

-- CreateTable
CREATE TABLE "LoadOrder" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "referenceCode" TEXT NOT NULL,
    "pickup" JSONB NOT NULL,
    "drop" JSONB NOT NULL,
    "cargoType" TEXT NOT NULL,
    "cargoValue" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "slaHours" INTEGER NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "status" "LoadStatus" NOT NULL DEFAULT 'DRAFT',
    "priceQuoteBand" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoadOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "loadId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "driverId" TEXT,
    "status" "TripStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripStop" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "plannedArrival" TIMESTAMP(3) NOT NULL,
    "plannedDeparture" TIMESTAMP(3) NOT NULL,
    "actualArrival" TIMESTAMP(3),
    "actualDeparture" TIMESTAMP(3),
    "detentionMinutes" INTEGER,
    "address" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripStop_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "LoadOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripStop" ADD CONSTRAINT "TripStop_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
