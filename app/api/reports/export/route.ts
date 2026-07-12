import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          if (val === null || val === undefined) return "";
          const str = String(val);
          return str.includes(",") || str.includes('"')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(",")
    ),
  ];
  return lines.join("\n");
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "trips";

  let csv = "";
  let filename = "";

  if (type === "trips") {
    const trips = await prisma.trip.findMany({
      include: {
        vehicle: { select: { name: true, regNumber: true } },
        driver: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    const rows = trips.map((t) => ({
      ID: t.id,
      Source: t.source,
      Destination: t.destination,
      Vehicle: t.vehicle.name,
      "Reg Number": t.vehicle.regNumber,
      Driver: t.driver.name,
      "Cargo Weight (kg)": t.cargoWeight,
      "Planned Distance (km)": t.plannedDistance,
      "Actual Distance (km)": t.actualDistance ?? "",
      "Fuel Consumed (L)": t.fuelConsumed ?? "",
      Revenue: t.revenue ?? "",
      Status: t.status,
      "Created At": t.createdAt.toISOString(),
      "Completed At": t.completedAt?.toISOString() ?? "",
    }));
    csv = toCSV(rows);
    filename = "trips.csv";
  } else if (type === "vehicles") {
    const vehicles = await prisma.vehicle.findMany();
    const rows = vehicles.map((v) => ({
      ID: v.id,
      "Reg Number": v.regNumber,
      Name: v.name,
      Type: v.type,
      "Max Load (kg)": v.maxLoad,
      "Odometer (km)": v.odometer,
      "Acquisition Cost": v.acquisitionCost,
      Status: v.status,
      Region: v.region ?? "",
    }));
    csv = toCSV(rows);
    filename = "vehicles.csv";
  } else if (type === "fuel") {
    const fuel = await prisma.fuelLog.findMany({
      include: { vehicle: { select: { name: true, regNumber: true } } },
      orderBy: { date: "desc" },
    });
    const rows = fuel.map((f) => ({
      ID: f.id,
      Vehicle: f.vehicle.name,
      "Reg Number": f.vehicle.regNumber,
      "Liters": f.liters,
      "Cost/L": f.costPerLiter,
      "Total Cost": f.totalCost,
      "Odometer (km)": f.odometer,
      Date: f.date.toISOString(),
    }));
    csv = toCSV(rows);
    filename = "fuel_logs.csv";
  } else if (type === "expenses") {
    const expenses = await prisma.expense.findMany({
      include: { vehicle: { select: { name: true, regNumber: true } } },
      orderBy: { date: "desc" },
    });
    const rows = expenses.map((e) => ({
      ID: e.id,
      Vehicle: e.vehicle.name,
      "Reg Number": e.vehicle.regNumber,
      Category: e.category,
      Amount: e.amount,
      Description: e.description,
      Date: e.date.toISOString(),
    }));
    csv = toCSV(rows);
    filename = "expenses.csv";
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
