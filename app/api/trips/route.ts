import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { tripSchema } from "@/lib/validations";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const trips = await prisma.trip.findMany({
    where: { ...(status && { status: status as any }) },
    include: {
      vehicle: { select: { id: true, name: true, regNumber: true, type: true } },
      driver: { select: { id: true, name: true, licenseNumber: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(trips);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = tripSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { vehicleId, driverId, cargoWeight } = parsed.data;

  // BR-02: Vehicle must be Available
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  if (vehicle.status !== "AVAILABLE") {
    return NextResponse.json(
      { error: `Vehicle is currently ${vehicle.status} and cannot be assigned to a trip` },
      { status: 400 }
    );
  }

  // BR-05: Cargo weight ≤ max load
  if (cargoWeight > vehicle.maxLoad) {
    return NextResponse.json(
      {
        error: `Cargo weight (${cargoWeight} kg) exceeds vehicle maximum load capacity (${vehicle.maxLoad} kg)`,
      },
      { status: 400 }
    );
  }

  // BR-03, BR-04: Driver must be Available with valid license
  const driver = await prisma.driver.findUnique({ where: { id: driverId } });
  if (!driver) return NextResponse.json({ error: "Driver not found" }, { status: 404 });
  if (driver.status !== "AVAILABLE") {
    return NextResponse.json(
      { error: `Driver is currently ${driver.status} and cannot be assigned to a trip` },
      { status: 400 }
    );
  }
  if (new Date(driver.licenseExpiry) < new Date()) {
    return NextResponse.json(
      { error: "Driver's license has expired. Cannot assign to trip." },
      { status: 400 }
    );
  }

  const trip = await prisma.trip.create({
    data: parsed.data,
    include: {
      vehicle: { select: { id: true, name: true, regNumber: true } },
      driver: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(trip, { status: 201 });
}
