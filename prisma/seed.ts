import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding TransitOps database...");

  const hashedPassword = await bcrypt.hash("demo1234", 12);

  // Create demo users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "fleet@demo.com" },
      update: {},
      create: { email: "fleet@demo.com", password: hashedPassword, name: "Fleet Manager", role: "FLEET_MANAGER" },
    }),
    prisma.user.upsert({
      where: { email: "dispatch@demo.com" },
      update: {},
      create: { email: "dispatch@demo.com", password: hashedPassword, name: "Dispatcher Sam", role: "DISPATCHER" },
    }),
    prisma.user.upsert({
      where: { email: "safety@demo.com" },
      update: {},
      create: { email: "safety@demo.com", password: hashedPassword, name: "Safety Officer Rita", role: "SAFETY_OFFICER" },
    }),
    prisma.user.upsert({
      where: { email: "finance@demo.com" },
      update: {},
      create: { email: "finance@demo.com", password: hashedPassword, name: "Finance Analyst Priya", role: "FINANCIAL_ANALYST" },
    }),
  ]);
  console.log(`✅ Created ${users.length} users`);

  // Create vehicles
  const vehicles = await Promise.all([
    prisma.vehicle.upsert({
      where: { regNumber: "MH-01-AB-1001" },
      update: {},
      create: {
        regNumber: "MH-01-AB-1001", name: "Tata Ace Van-01", type: "VAN",
        maxLoad: 750, odometer: 45320, acquisitionCost: 850000,
        status: "AVAILABLE", region: "West",
      },
    }),
    prisma.vehicle.upsert({
      where: { regNumber: "MH-02-BC-2002" },
      update: {},
      create: {
        regNumber: "MH-02-BC-2002", name: "Ashok Leyland Truck-05", type: "TRUCK",
        maxLoad: 5000, odometer: 128450, acquisitionCost: 2500000,
        status: "AVAILABLE", region: "West",
      },
    }),
    prisma.vehicle.upsert({
      where: { regNumber: "DL-01-CD-3003" },
      update: {},
      create: {
        regNumber: "DL-01-CD-3003", name: "Eicher Truck-12", type: "TRUCK",
        maxLoad: 8000, odometer: 234000, acquisitionCost: 3200000,
        status: "IN_SHOP", region: "North",
      },
    }),
    prisma.vehicle.upsert({
      where: { regNumber: "KA-05-EF-4004" },
      update: {},
      create: {
        regNumber: "KA-05-EF-4004", name: "Mahindra Bolero-03", type: "CAR",
        maxLoad: 800, odometer: 67890, acquisitionCost: 1200000,
        status: "AVAILABLE", region: "South",
      },
    }),
    prisma.vehicle.upsert({
      where: { regNumber: "GJ-01-GH-5005" },
      update: {},
      create: {
        regNumber: "GJ-01-GH-5005", name: "Bus-Express-01", type: "BUS",
        maxLoad: 2000, odometer: 189000, acquisitionCost: 4500000,
        status: "AVAILABLE", region: "West",
      },
    }),
    prisma.vehicle.upsert({
      where: { regNumber: "RJ-14-IJ-6006" },
      update: {},
      create: {
        regNumber: "RJ-14-IJ-6006", name: "Old Van-07", type: "VAN",
        maxLoad: 500, odometer: 345000, acquisitionCost: 600000,
        status: "RETIRED", region: "North",
      },
    }),
  ]);
  console.log(`✅ Created ${vehicles.length} vehicles`);

  // Create drivers
  const drivers = await Promise.all([
    prisma.driver.upsert({
      where: { licenseNumber: "MH0120230012345" },
      update: {},
      create: {
        name: "Alex Kumar", licenseNumber: "MH0120230012345", licenseCategory: "EC",
        licenseExpiry: new Date("2027-06-30"), contactNumber: "+91 98765 43210",
        email: "alex@transops.com", safetyScore: 92, status: "AVAILABLE",
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: "DL0220240056789" },
      update: {},
      create: {
        name: "Ravi Sharma", licenseNumber: "DL0220240056789", licenseCategory: "HMV",
        licenseExpiry: new Date("2025-12-31"), contactNumber: "+91 87654 32109",
        safetyScore: 85, status: "AVAILABLE",
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: "KA0520221098765" },
      update: {},
      create: {
        name: "Suresh Pillai", licenseNumber: "KA0520221098765", licenseCategory: "LMV",
        licenseExpiry: new Date("2026-01-15"), contactNumber: "+91 76543 21098",
        safetyScore: 78, status: "OFF_DUTY",
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: "MH0120231234567" },
      update: {},
      create: {
        name: "Priya Nair", licenseNumber: "MH0120231234567", licenseCategory: "B",
        licenseExpiry: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // expires in 20 days
        contactNumber: "+91 65432 10987",
        safetyScore: 95, status: "AVAILABLE",
      },
    }),
  ]);
  console.log(`✅ Created ${drivers.length} drivers`);

  // Create a completed trip
  const vehicle1 = vehicles[0];
  const vehicle2 = vehicles[1];
  const driver1 = drivers[0];

  const completedTrip = await prisma.trip.create({
    data: {
      source: "Mumbai", destination: "Pune",
      vehicleId: vehicle1.id, driverId: driver1.id,
      cargoWeight: 450, plannedDistance: 149, actualDistance: 152,
      fuelConsumed: 18.5, revenue: 8500,
      status: "COMPLETED",
      dispatchedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  // Draft trip
  await prisma.trip.create({
    data: {
      source: "Pune", destination: "Nashik",
      vehicleId: vehicle2.id, driverId: drivers[1].id,
      cargoWeight: 2000, plannedDistance: 210,
      revenue: 15000, status: "DRAFT",
    },
  });

  console.log(`✅ Created sample trips`);

  // Maintenance record for In Shop vehicle
  await prisma.maintenanceLog.create({
    data: {
      vehicleId: vehicles[2].id,
      type: "Engine Repair",
      description: "Major engine overhaul required after breakdown",
      cost: 85000,
      technicianName: "Rajesh Auto Works",
      status: "ACTIVE",
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  // Closed maintenance
  await prisma.maintenanceLog.create({
    data: {
      vehicleId: vehicle1.id,
      type: "Oil Change",
      description: "Regular oil change at 45000 km",
      cost: 3500,
      technicianName: "Quick Service Center",
      status: "CLOSED",
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`✅ Created maintenance records`);

  // Fuel logs
  await prisma.fuelLog.create({
    data: {
      vehicleId: vehicle1.id,
      tripId: completedTrip.id,
      liters: 18.5,
      costPerLiter: 104.5,
      totalCost: 18.5 * 104.5,
      odometer: vehicle1.odometer,
      station: "HP Petrol Station, Mumbai",
    },
  });

  await prisma.fuelLog.create({
    data: {
      vehicleId: vehicle2.id,
      liters: 45,
      costPerLiter: 102,
      totalCost: 45 * 102,
      odometer: vehicle2.odometer,
      station: "BPCL Bharat Petroleum, Pune",
    },
  });

  console.log(`✅ Created fuel logs`);

  // Expenses
  await prisma.expense.create({
    data: {
      vehicleId: vehicle1.id,
      tripId: completedTrip.id,
      category: "TOLL",
      amount: 285,
      description: "Mumbai-Pune Expressway toll",
    },
  });

  await prisma.expense.create({
    data: {
      vehicleId: vehicle2.id,
      category: "INSURANCE",
      amount: 45000,
      description: "Annual comprehensive insurance premium",
    },
  });

  console.log(`✅ Created expenses`);
  console.log("\n🎉 Seed complete! Login with any of these accounts:");
  console.log("   fleet@demo.com / dispatch@demo.com / safety@demo.com / finance@demo.com");
  console.log("   Password: demo1234");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
