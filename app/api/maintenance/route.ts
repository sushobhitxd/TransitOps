import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { maintenanceSchema } from "@/lib/validations";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const vehicleId = searchParams.get("vehicleId");

  const logs = await prisma.maintenanceLog.findMany({
    where: {
      ...(status && { status: status as any }),
      ...(vehicleId && { vehicleId }),
    },
    include: {
      vehicle: { select: { id: true, name: true, regNumber: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(logs);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = maintenanceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { id: parsed.data.vehicleId } });
  if (!vehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  if (vehicle.status === "ON_TRIP") {
    return NextResponse.json(
      { error: "Cannot add maintenance record to a vehicle that is currently On Trip" },
      { status: 400 }
    );
  }

  // BR-09: Atomically create maintenance log + set vehicle to IN_SHOP
  const [log] = await prisma.$transaction([
    prisma.maintenanceLog.create({
      data: {
        ...parsed.data,
        startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : new Date(),
      },
      include: {
        vehicle: { select: { id: true, name: true, regNumber: true } },
      },
    }),
    prisma.vehicle.update({
      where: { id: parsed.data.vehicleId },
      data: { status: "IN_SHOP" },
    }),
  ]);

  return NextResponse.json(log, { status: 201 });
}
