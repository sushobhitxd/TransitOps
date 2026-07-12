import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vehicles = await prisma.vehicle.findMany({
    include: {
      trips: {
        where: { status: "COMPLETED" },
        select: {
          actualDistance: true,
          fuelConsumed: true,
          revenue: true,
        },
      },
      maintenanceLogs: {
        select: { cost: true, status: true },
      },
      fuelLogs: {
        select: { totalCost: true, liters: true },
      },
      expenses: {
        select: { amount: true, category: true },
      },
    },
  });

  const analytics = vehicles.map((v) => {
    const totalDistance = v.trips.reduce(
      (sum, t) => sum + (t.actualDistance ?? 0),
      0
    );
    const totalFuel = v.trips.reduce(
      (sum, t) => sum + (t.fuelConsumed ?? 0),
      0
    ) + v.fuelLogs.reduce((sum, f) => sum + f.liters, 0);

    const fuelCost = v.fuelLogs.reduce((sum, f) => sum + f.totalCost, 0);
    const maintenanceCost = v.maintenanceLogs.reduce(
      (sum, m) => sum + m.cost,
      0
    );
    const otherExpenses = v.expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalCost = fuelCost + maintenanceCost + otherExpenses;

    const totalRevenue = v.trips.reduce(
      (sum, t) => sum + (t.revenue ?? 0),
      0
    );

    const roi =
      v.acquisitionCost > 0
        ? (totalRevenue - (maintenanceCost + fuelCost)) / v.acquisitionCost
        : 0;

    const fuelEfficiency =
      totalFuel > 0 ? totalDistance / totalFuel : 0;

    const tripsCompleted = v.trips.length;

    return {
      id: v.id,
      name: v.name,
      regNumber: v.regNumber,
      type: v.type,
      status: v.status,
      acquisitionCost: v.acquisitionCost,
      totalDistance,
      totalFuel,
      fuelEfficiency: parseFloat(fuelEfficiency.toFixed(2)),
      fuelCost: parseFloat(fuelCost.toFixed(2)),
      maintenanceCost: parseFloat(maintenanceCost.toFixed(2)),
      otherExpenses: parseFloat(otherExpenses.toFixed(2)),
      totalCost: parseFloat(totalCost.toFixed(2)),
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      roi: parseFloat((roi * 100).toFixed(2)),
      tripsCompleted,
    };
  });

  // Monthly trip data for charts
  const monthlyTrips = await prisma.$queryRaw<
    Array<{ month: string; count: number; revenue: number }>
  >`
    SELECT 
      TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon') as month,
      COUNT(*) as count,
      COALESCE(SUM(revenue), 0) as revenue
    FROM trips
    WHERE status = 'COMPLETED'
      AND "createdAt" >= NOW() - INTERVAL '6 months'
    GROUP BY DATE_TRUNC('month', "createdAt")
    ORDER BY DATE_TRUNC('month', "createdAt")
  `;

  return NextResponse.json({ vehicles: analytics, monthlyTrips });
}
