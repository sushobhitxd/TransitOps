import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up duplicate maintenance logs...");
  
  const logs = await prisma.maintenanceLog.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "asc" }
  });

  const seen = new Set();
  const toDelete = [];

  for (const log of logs) {
    const key = `${log.vehicleId}-${log.type}-${log.description}`;
    if (seen.has(key)) {
      toDelete.push(log.id);
    } else {
      seen.add(key);
    }
  }

  if (toDelete.length > 0) {
    const res = await prisma.maintenanceLog.deleteMany({
      where: { id: { in: toDelete } }
    });
    console.log(`Deleted ${res.count} duplicate maintenance logs.`);
  } else {
    console.log("No duplicates found.");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
