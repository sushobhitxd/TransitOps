import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Syncing trips with vehicles and drivers...");
  
  const dispatchedTrips = await prisma.trip.findMany({
    where: { status: "DISPATCHED" },
  });

  console.log(`Found ${dispatchedTrips.length} dispatched trips. Fixing vehicle/driver statuses...`);

  let count = 0;
  for (const trip of dispatchedTrips) {
    await prisma.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: "ON_TRIP" }
    });
    await prisma.driver.update({
      where: { id: trip.driverId },
      data: { status: "ON_TRIP" }
    });
    count++;
  }

  console.log(`Updated ${count} vehicles and drivers to ON_TRIP.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
