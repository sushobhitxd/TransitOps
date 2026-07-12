import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PATCH /api/trips/[id]/dispatch - BR-06
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { vehicle: true, driver: true },
  });

  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  if (trip.status !== "DRAFT") {
    return NextResponse.json(
      { error: `Cannot dispatch a trip with status: ${trip.status}` },
      { status: 400 }
    );
  }

  // Re-validate business rules at dispatch time
  if (trip.vehicle.status !== "AVAILABLE") {
    return NextResponse.json(
      { error: `Vehicle is no longer available (status: ${trip.vehicle.status})` },
      { status: 400 }
    );
  }
  if (trip.driver.status !== "AVAILABLE") {
    return NextResponse.json(
      { error: `Driver is no longer available (status: ${trip.driver.status})` },
      { status: 400 }
    );
  }
  if (new Date(trip.driver.licenseExpiry) < new Date()) {
    return NextResponse.json(
      { error: "Driver license has expired" },
      { status: 400 }
    );
  }

  // BR-06: Atomic update — trip, vehicle, driver
  const [updatedTrip] = await prisma.$transaction([
    prisma.trip.update({
      where: { id },
      data: { status: "DISPATCHED", dispatchedAt: new Date() },
      include: { vehicle: true, driver: true },
    }),
    prisma.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: "ON_TRIP" },
    }),
    prisma.driver.update({
      where: { id: trip.driverId },
      data: { status: "ON_TRIP" },
    }),
  ]);

  return NextResponse.json(updatedTrip);
}
