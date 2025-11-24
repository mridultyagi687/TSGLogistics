import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedLoads() {
  const loadOneId = "load-demo-001";
  const loadTwoId = "load-demo-002";
  const assignmentId = "assignment-demo-001";

  const loadOne = await prisma.loadOrder.upsert({
    where: { id: loadOneId },
    update: {
      orgId: "org-demo",
      referenceCode: "MVP-LOAD-001",
      pickup: {
        line1: "TSG Warehouse",
        city: "Delhi",
        state: "DL",
        postalCode: "110001",
        country: "IN",
        latitude: 28.6139,
        longitude: 77.209
      } as Prisma.JsonObject,
      drop: {
        line1: "Retail Hub",
        city: "Mumbai",
        state: "MH",
        postalCode: "400001",
        country: "IN",
        latitude: 19.076,
        longitude: 72.8777
      } as Prisma.JsonObject,
      cargoType: "FMCG",
      cargoValue: new Prisma.Decimal(125000),
      slaHours: 36,
      vehicleType: "32FT",
      status: "PUBLISHED",
      priceQuoteBand: {
        min: 45000,
        max: 52000,
        currency: "INR",
        confidence: 0.7
      } as Prisma.JsonObject,
      assignmentId,
      assignmentStatus: "ACCEPTED",
      assignmentMetadata: {
        vendorId: "vendor-demo-001",
        etaHours: 34
      } as Prisma.JsonObject,
      assignmentLockedAt: new Date()
    },
    create: {
      id: loadOneId,
      orgId: "org-demo",
      referenceCode: "MVP-LOAD-001",
      pickup: {
        line1: "TSG Warehouse",
        city: "Delhi",
        state: "DL",
        postalCode: "110001",
        country: "IN",
        latitude: 28.6139,
        longitude: 77.209
      } as Prisma.JsonObject,
      drop: {
        line1: "Retail Hub",
        city: "Mumbai",
        state: "MH",
        postalCode: "400001",
        country: "IN",
        latitude: 19.076,
        longitude: 72.8777
      } as Prisma.JsonObject,
      cargoType: "FMCG",
      cargoValue: new Prisma.Decimal(125000),
      slaHours: 36,
      vehicleType: "32FT",
      status: "PUBLISHED",
      priceQuoteBand: {
        min: 45000,
        max: 52000,
        currency: "INR",
        confidence: 0.7
      } as Prisma.JsonObject,
      assignmentId,
      assignmentStatus: "ACCEPTED",
      assignmentMetadata: {
        vendorId: "vendor-demo-001",
        etaHours: 34
      } as Prisma.JsonObject,
      assignmentLockedAt: new Date()
    }
  });

  await prisma.loadOrder.upsert({
    where: { id: loadTwoId },
    update: {
      orgId: "org-demo",
      referenceCode: "MVP-LOAD-002",
      pickup: {
        line1: "Factory A",
        city: "Pune",
        state: "MH",
        postalCode: "411001",
        country: "IN"
      } as Prisma.JsonObject,
      drop: {
        line1: "Warehouse B",
        city: "Jaipur",
        state: "RJ",
        postalCode: "302001",
        country: "IN"
      } as Prisma.JsonObject,
      cargoType: "Auto Parts",
      cargoValue: new Prisma.Decimal(98000),
      slaHours: 48,
      vehicleType: "TAURUS",
      status: "PUBLISHED",
      priceQuoteBand: {
        min: 38000,
        max: 42000,
        currency: "INR",
        confidence: 0.6
      } as Prisma.JsonObject,
      assignmentId: null,
      assignmentStatus: "SOURCING",
      assignmentMetadata: Prisma.DbNull,
      assignmentLockedAt: new Date()
    },
    create: {
      id: loadTwoId,
      orgId: "org-demo",
      referenceCode: "MVP-LOAD-002",
      pickup: {
        line1: "Factory A",
        city: "Pune",
        state: "MH",
        postalCode: "411001",
        country: "IN"
      } as Prisma.JsonObject,
      drop: {
        line1: "Warehouse B",
        city: "Jaipur",
        state: "RJ",
        postalCode: "302001",
        country: "IN"
      } as Prisma.JsonObject,
      cargoType: "Auto Parts",
      cargoValue: new Prisma.Decimal(98000),
      slaHours: 48,
      vehicleType: "TAURUS",
      status: "PUBLISHED",
      priceQuoteBand: {
        min: 38000,
        max: 42000,
        currency: "INR",
        confidence: 0.6
      } as Prisma.JsonObject,
      assignmentId: null,
      assignmentStatus: "SOURCING",
      assignmentMetadata: Prisma.DbNull,
      assignmentLockedAt: new Date()
    }
  });
}

async function main() {
  await seedLoads();
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
