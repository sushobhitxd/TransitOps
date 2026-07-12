import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { fuelLogSchema } from "@/lib/validations";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const vehicleId = searchParams.get("vehicleId");

  const logs = await prisma.fuelLog.findMany({
    where: { ...(vehicleId && { vehicleId }) },
    include: {
      vehicle: { select: { id: true, name: true, regNumber: true } },
      trip: { select: { id: true, source: true, destination: true } },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(logs);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = fuelLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const totalCost = parsed.data.liters * parsed.data.costPerLiter;

  const log = await prisma.fuelLog.create({
    data: {
      ...parsed.data,
      totalCost,
      tripId: parsed.data.tripId || null,
      date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
    },
    include: {
      vehicle: { select: { id: true, name: true, regNumber: true } },
    },
  });

  return NextResponse.json(log, { status: 201 });
}
