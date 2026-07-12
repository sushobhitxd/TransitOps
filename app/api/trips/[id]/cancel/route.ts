import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PATCH /api/trips/[id]/cancel - BR-08
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const trip = await prisma.trip.findUnique({ where: { id } });
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  if (!["DRAFT", "DISPATCHED"].includes(trip.status)) {
    return NextResponse.json(
      { error: `Cannot cancel a trip with status: ${trip.status}` },
      { status: 400 }
    );
  }

  // BR-08: If trip was dispatched, restore vehicle and driver
  if (trip.status === "DISPATCHED") {
    await prisma.$transaction([
      prisma.trip.update({ where: { id }, data: { status: "CANCELLED" } }),
      prisma.vehicle.update({ where: { id: trip.vehicleId }, data: { status: "AVAILABLE" } }),
      prisma.driver.update({ where: { id: trip.driverId }, data: { status: "AVAILABLE" } }),
    ]);
  } else {
    await prisma.trip.update({ where: { id }, data: { status: "CANCELLED" } });
  }

  const updatedTrip = await prisma.trip.findUnique({ where: { id } });
  return NextResponse.json(updatedTrip);
}
