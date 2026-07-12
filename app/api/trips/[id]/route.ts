import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { completeTripSchema } from "@/lib/validations";

// GET /api/trips/[id]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      vehicle: true,
      driver: true,
      fuelLogs: true,
      expenses: true,
    },
  });

  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(trip);
}

// PATCH /api/trips/[id] - generic update (notes, revenue, etc.)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const trip = await prisma.trip.findUnique({ where: { id } });
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let vehicleStatus;
  let driverStatus;
  if (body.status === "DISPATCHED") {
    vehicleStatus = "ON_TRIP";
    driverStatus = "ON_TRIP";
  } else if (body.status === "CANCELLED") {
    vehicleStatus = "AVAILABLE";
    driverStatus = "AVAILABLE";
  }

  const [updated] = await prisma.$transaction([
    prisma.trip.update({
      where: { id },
      data: body,
    }),
    ...(vehicleStatus ? [
      prisma.vehicle.update({ where: { id: trip.vehicleId }, data: { status: vehicleStatus } }),
      prisma.driver.update({ where: { id: trip.driverId }, data: { status: driverStatus } }),
    ] : []),
  ]);

  return NextResponse.json(updated);
}
