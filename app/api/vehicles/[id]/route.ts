import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { vehicleSchema } from "@/lib/validations";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      trips: { orderBy: { createdAt: "desc" }, take: 10 },
      maintenanceLogs: { orderBy: { createdAt: "desc" }, take: 10 },
      fuelLogs: { orderBy: { date: "desc" }, take: 10 },
      expenses: { orderBy: { date: "desc" }, take: 10 },
    },
  });

  if (!vehicle) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(vehicle);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // Allow partial update of status or full schema
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // If only updating status
  if (body.status && Object.keys(body).length === 1) {
    const updated = await prisma.vehicle.update({
      where: { id },
      data: { status: body.status },
    });
    return NextResponse.json(updated);
  }

  const parsed = vehicleSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.vehicle.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (vehicle.status === "ON_TRIP") {
    return NextResponse.json(
      { error: "Cannot delete a vehicle that is currently On Trip" },
      { status: 400 }
    );
  }

  await prisma.vehicle.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
