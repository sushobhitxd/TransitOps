import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { completeTripSchema } from "@/lib/validations";

// PATCH /api/trips/[id]/complete - BR-07
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const parsed = completeTripSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const trip = await prisma.trip.findUnique({ where: { id } });
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  if (trip.status !== "DISPATCHED") {
    return NextResponse.json(
      { error: `Cannot complete a trip with status: ${trip.status}` },
      { status: 400 }
    );
  }

  const { actualDistance, fuelConsumed, revenue, notes } = parsed.data;

  // BR-07: Atomic completion
  const [updatedTrip] = await prisma.$transaction([
    prisma.trip.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        actualDistance,
        fuelConsumed,
        revenue: revenue ?? trip.revenue,
        notes: notes ?? trip.notes,
      },
      include: { vehicle: true, driver: true },
    }),
    // Update vehicle odometer + status
    prisma.vehicle.update({
      where: { id: trip.vehicleId },
      data: {
        status: "AVAILABLE",
        odometer: { increment: actualDistance },
      },
    }),
    prisma.driver.update({
      where: { id: trip.driverId },
      data: { status: "AVAILABLE" },
    }),
  ]);

  // Auto-create fuel log from trip completion
  if (fuelConsumed > 0) {
    await prisma.fuelLog.create({
      data: {
        vehicleId: trip.vehicleId,
        tripId: trip.id,
        liters: fuelConsumed,
        costPerLiter: 0, // Will be updated manually if needed
        totalCost: 0,
        odometer: (await prisma.vehicle.findUnique({ where: { id: trip.vehicleId } }))?.odometer ?? 0,
        date: new Date(),
      },
    });
  }

  return NextResponse.json(updatedTrip);
}
