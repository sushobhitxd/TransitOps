import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [
    totalVehicles,
    availableVehicles,
    onTripVehicles,
    inShopVehicles,
    retiredVehicles,
    activeTrips,
    pendingTrips,
    completedTrips,
    totalDrivers,
    driversOnDuty,
    recentTrips,
    expiringLicenses,
  ] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: "AVAILABLE" } }),
    prisma.vehicle.count({ where: { status: "ON_TRIP" } }),
    prisma.vehicle.count({ where: { status: "IN_SHOP" } }),
    prisma.vehicle.count({ where: { status: "RETIRED" } }),
    prisma.trip.count({ where: { status: "DISPATCHED" } }),
    prisma.trip.count({ where: { status: "DRAFT" } }),
    prisma.trip.count({ where: { status: "COMPLETED" } }),
    prisma.driver.count(),
    prisma.driver.count({ where: { status: "ON_TRIP" } }),
    prisma.trip.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        vehicle: { select: { name: true, regNumber: true } },
        driver: { select: { name: true } },
      },
    }),
    prisma.driver.findMany({
      where: {
        licenseExpiry: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          gte: new Date(),
        },
      },
      select: { id: true, name: true, licenseExpiry: true, licenseNumber: true },
    }),
  ]);

  const fleetUtilization =
    totalVehicles > 0 ? Math.round((onTripVehicles / totalVehicles) * 100) : 0;

  return NextResponse.json({
    vehicles: {
      total: totalVehicles,
      available: availableVehicles,
      onTrip: onTripVehicles,
      inShop: inShopVehicles,
      retired: retiredVehicles,
    },
    trips: {
      active: activeTrips,
      pending: pendingTrips,
      completed: completedTrips,
    },
    drivers: {
      total: totalDrivers,
      onDuty: driversOnDuty,
    },
    fleetUtilization,
    recentTrips,
    expiringLicenses,
  });
}
