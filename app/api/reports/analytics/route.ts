import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const toNumber = (value: unknown) => {
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (value === null || value === undefined) return 0;
  if (typeof value === "object" && "toString" in value) {
    const parsed = Number((value as { toString: () => string }).toString());
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

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
      (sum, t) => sum + toNumber(t.actualDistance),
      0
    );
    const totalFuel = v.trips.reduce(
      (sum, t) => sum + toNumber(t.fuelConsumed),
      0
    ) + v.fuelLogs.reduce((sum, f) => sum + toNumber(f.liters), 0);

    const fuelCost = v.fuelLogs.reduce((sum, f) => sum + toNumber(f.totalCost), 0);
    const maintenanceCost = v.maintenanceLogs.reduce(
      (sum, m) => sum + toNumber(m.cost),
      0
    );
    const otherExpenses = v.expenses.reduce((sum, e) => sum + toNumber(e.amount), 0);
    const totalCost = fuelCost + maintenanceCost + otherExpenses;

    const totalRevenue = v.trips.reduce(
      (sum, t) => sum + toNumber(t.revenue),
      0
    );

    const roi =
      toNumber(v.acquisitionCost) > 0
        ? (totalRevenue - (maintenanceCost + fuelCost)) / toNumber(v.acquisitionCost)
        : 0;

    const fuelEfficiency = totalFuel > 0 ? totalDistance / totalFuel : 0;

    const tripsCompleted = v.trips.length;

    return {
      id: v.id,
      name: v.name,
      regNumber: v.regNumber,
      type: v.type,
      status: v.status,
      acquisitionCost: toNumber(v.acquisitionCost),
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

  const serializedMonthlyTrips = monthlyTrips.map((item) => ({
    month: item.month,
    count: Number(item.count),
    revenue: toNumber(item.revenue),
  }));

  const totalCost = analytics.reduce((sum, item) => sum + item.totalCost, 0);
  const totalRevenue = analytics.reduce((sum, item) => sum + item.totalRevenue, 0);
  const averageFuelEfficiency = analytics.length > 0
    ? analytics.reduce((sum, item) => sum + item.fuelEfficiency, 0) / analytics.length
    : 0;
  const averageRoi = analytics.length > 0
    ? analytics.reduce((sum, item) => sum + item.roi, 0) / analytics.length
    : 0;

  const expenseBreakdown = vehicles.reduce<Record<string, number>>((acc, vehicle) => {
    vehicle.expenses.forEach((expense) => {
      const category = expense.category || "Other";
      acc[category] = (acc[category] || 0) + toNumber(expense.amount);
    });
    return acc;
  }, {});

  return NextResponse.json({
    fleetUtilization: vehicles.length > 0 ? Math.round((vehicles.filter((vehicle) => vehicle.status === "ON_TRIP").length / vehicles.length) * 100) : 0,
    fuelEfficiency: parseFloat(averageFuelEfficiency.toFixed(2)),
    totalCost: parseFloat(totalCost.toFixed(2)),
    revenue: parseFloat(totalRevenue.toFixed(2)),
    roi: parseFloat(averageRoi.toFixed(2)),
    expensesByCategory: Object.entries(expenseBreakdown)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value),
    monthlyCosts: [],
    vehicles: analytics,
    monthlyTrips: serializedMonthlyTrips,
  });
}
