import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { closeMaintenanceSchema } from "@/lib/validations";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = closeMaintenanceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const log = await prisma.maintenanceLog.findUnique({
    where: { id },
    include: { vehicle: true },
  });
  if (!log) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (log.status === "CLOSED") {
    return NextResponse.json({ error: "Maintenance record is already closed" }, { status: 400 });
  }

  // BR-10: Close maintenance + restore vehicle to AVAILABLE (unless RETIRED)
  const newVehicleStatus = log.vehicle.status === "RETIRED" ? "RETIRED" : "AVAILABLE";

  const [updatedLog] = await prisma.$transaction([
    prisma.maintenanceLog.update({
      where: { id },
      data: {
        status: "CLOSED",
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : new Date(),
        cost: parsed.data.cost,
        notes: parsed.data.notes ?? log.notes,
      },
      include: { vehicle: true },
    }),
    prisma.vehicle.update({
      where: { id: log.vehicleId },
      data: { status: newVehicleStatus },
    }),
  ]);

  return NextResponse.json(updatedLog);
}
