import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedVendors() {
  const vendorId = "vendor-demo-001";
  const assignmentId = "assignment-demo-001";
  const orgId = "org-demo";
  const loadId = "load-demo-001";
  const tripId = "trip-demo-001";

  await prisma.vendor.upsert({
    where: { id: vendorId },
    update: {
      orgId,
      name: "Sharma Logistics",
      services: ["fuel", "maintenance"],
      rating: 4.6,
      address: {
        line1: "Plot 21, Transport Nagar",
        city: "Delhi",
        state: "DL",
        postalCode: "110037",
        country: "IN"
      } as Prisma.JsonObject,
      contactPhone: "+91-9876543210"
    },
    create: {
      id: vendorId,
      orgId,
      name: "Sharma Logistics",
      services: ["fuel", "maintenance"],
      rating: 4.6,
      address: {
        line1: "Plot 21, Transport Nagar",
        city: "Delhi",
        state: "DL",
        postalCode: "110037",
        country: "IN"
      } as Prisma.JsonObject,
      contactPhone: "+91-9876543210"
    }
  });

  await prisma.vendorCapability.deleteMany({ where: { vendorId } });
  await prisma.vendorCapability.createMany({
    data: [
      {
        id: "capability-demo-001",
        vendorId,
        payload: {
          fleetTypes: ["32FT", "TAURUS"],
          routeCoverage: ["DELHI-MUMBAI", "DELHI-PUNE"],
          maxPayloadKg: 28000
        } as Prisma.JsonObject
      },
      {
        id: "capability-demo-002",
        vendorId,
        payload: {
          compliance: ["FASTAG", "EWAY"],
          avgAcceptanceMinutes: 18
        } as Prisma.JsonObject
      }
    ]
  });

  await prisma.assignment.upsert({
    where: { id: assignmentId },
    update: {
      orgId,
      vendorId,
      loadId,
      tripId,
      status: "ACCEPTED",
      score: 0.86,
      metadata: {
        acceptedAt: new Date().toISOString(),
        pricing: {
          quote: 48500,
          currency: "INR"
        }
      } as Prisma.JsonObject
    },
    create: {
      id: assignmentId,
      orgId,
      vendorId,
      loadId,
      tripId,
      status: "ACCEPTED",
      score: 0.86,
      metadata: {
        acceptedAt: new Date().toISOString(),
        pricing: {
          quote: 48500,
          currency: "INR"
        }
      } as Prisma.JsonObject
    }
  });

  await prisma.assignmentEvent.deleteMany({ where: { assignmentId } });
  await prisma.assignmentEvent.createMany({
    data: [
      {
        id: "assignment-event-demo-001",
        assignmentId,
        type: "CREATED",
        payload: {
          source: "seed-script"
        } as Prisma.JsonObject
      },
      {
        id: "assignment-event-demo-002",
        assignmentId,
        type: "OFFERED",
        payload: {
          offerSentAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        } as Prisma.JsonObject
      },
      {
        id: "assignment-event-demo-003",
        assignmentId,
        type: "ACCEPTED",
        payload: {
          acceptedBy: vendorId,
          acceptedAt: new Date().toISOString()
        } as Prisma.JsonObject
      }
    ]
  });

  const secondAssignmentId = "assignment-demo-002";
  await prisma.assignment.upsert({
    where: { id: secondAssignmentId },
    update: {
      orgId,
      vendorId,
      loadId: "load-demo-002",
      status: "OFFERED",
      score: 0.74,
      metadata: {
        etaHours: 40
      } as Prisma.JsonObject
    },
    create: {
      id: secondAssignmentId,
      orgId,
      vendorId,
      loadId: "load-demo-002",
      status: "OFFERED",
      score: 0.74,
      metadata: {
        etaHours: 40
      } as Prisma.JsonObject
    }
  });
}

async function main() {
  await seedVendors();
}

main()
  .catch((error) => {
    console.error("Vendor seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
