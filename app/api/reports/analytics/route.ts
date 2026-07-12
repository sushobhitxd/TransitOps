import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch all vehicles with their related costs
  const vehicles = await prisma.vehicle.findMany({
    include: {
      trips: {
        where: { status: "COMPLETED" },
        select: { actualDistance: true, fuelConsumed: true, revenue: true },
      },
      maintenanceLogs: { select: { cost: true, status: true } },
      fuelLogs: { select: { totalCost: true, liters: true } },
      expenses: { select: { amount: true, category: true } },
    },
  });

  let totalCost = 0;
  let revenue = 0;
  let totalDistance = 0;
  let totalFuel = 0;
  let totalAcquisition = 0;
  
  const categoryMap: Record<string, number> = {};
  let onTrip = 0;

  vehicles.forEach((v) => {
    if (v.status === "ON_TRIP") onTrip++;
    totalAcquisition += v.acquisitionCost || 0;

    const vRevenue = v.trips.reduce((s, t) => s + (t.revenue || 0), 0);
    revenue += vRevenue;

    totalDistance += v.trips.reduce((s, t) => s + (t.actualDistance || 0), 0);
    totalFuel += v.fuelLogs.reduce((s, f) => s + f.liters, 0) + v.trips.reduce((s, t) => s + (t.fuelConsumed || 0), 0);

    const fCost = v.fuelLogs.reduce((s, f) => s + f.totalCost, 0);
    const mCost = v.maintenanceLogs.reduce((s, m) => s + m.cost, 0);
    const eCost = v.expenses.reduce((s, e) => s + e.amount, 0);
    totalCost += fCost + mCost + eCost;

    v.expenses.forEach(e => {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
    });
  });

  const fleetUtilization = vehicles.length > 0 ? (onTrip / vehicles.length) * 100 : 0;
  const fuelEfficiency = totalFuel > 0 ? totalDistance / totalFuel : 0;
  const roi = totalAcquisition > 0 ? ((revenue - totalCost) / totalAcquisition) * 100 : 0;

  const expensesByCategory = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  // For monthly costs, a raw query is easiest
  const monthlyFuel = await prisma.$queryRaw<Array<{ month: string; amount: number }>>`
    SELECT TO_CHAR(DATE_TRUNC('month', "date"), 'Mon') as month, COALESCE(SUM("totalCost"), 0) as amount
    FROM fuel_logs WHERE "date" >= NOW() - INTERVAL '6 months' GROUP BY DATE_TRUNC('month', "date")
  `;
  const monthlyMaint = await prisma.$queryRaw<Array<{ month: string; amount: number }>>`
    SELECT TO_CHAR(DATE_TRUNC('month', "startDate"), 'Mon') as month, COALESCE(SUM(cost), 0) as amount
    FROM maintenance_logs WHERE "startDate" >= NOW() - INTERVAL '6 months' GROUP BY DATE_TRUNC('month', "startDate")
  `;
  const monthlyExp = await prisma.$queryRaw<Array<{ month: string; amount: number }>>`
    SELECT TO_CHAR(DATE_TRUNC('month', "date"), 'Mon') as month, COALESCE(SUM(amount), 0) as amount
    FROM expenses WHERE "date" >= NOW() - INTERVAL '6 months' GROUP BY DATE_TRUNC('month', "date")
  `;

  // Merge monthly
  const monthMap: Record<string, { month: string; fuel: number; maintenance: number; other: number }> = {};
  
  // Initialize last 6 months so it has a baseline
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const m = d.toLocaleString('en-US', { month: 'short' });
    monthMap[m] = { month: m, fuel: 0, maintenance: 0, other: 0 };
  }

  monthlyFuel.forEach(m => { if (monthMap[m.month]) monthMap[m.month].fuel += Number(m.amount); });
  monthlyMaint.forEach(m => { if (monthMap[m.month]) monthMap[m.month].maintenance += Number(m.amount); });
  monthlyExp.forEach(m => { if (monthMap[m.month]) monthMap[m.month].other += Number(m.amount); });

  return NextResponse.json({
    fleetUtilization: Math.round(fleetUtilization),
    fuelEfficiency: parseFloat(fuelEfficiency.toFixed(2)),
    totalCost,
    revenue,
    roi: parseFloat(roi.toFixed(2)),
    expensesByCategory,
    monthlyCosts: Object.values(monthMap)
  });
}
