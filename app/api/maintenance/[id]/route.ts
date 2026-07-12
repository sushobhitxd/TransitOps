import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const validStatuses = ["SCHEDULED", "ACTIVE", "COMPLETED", "CLOSED"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const log = await prisma.maintenanceLog.findUnique({ where: { id }, include: { vehicle: true } });
    if (!log) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let vehicleStatusUpdate = {};
    if (status === "COMPLETED" || status === "CLOSED") {
      vehicleStatusUpdate = { status: "AVAILABLE" };
    } else if (status === "ACTIVE") {
      vehicleStatusUpdate = { status: "IN_SHOP" };
    }

    const [updatedLog] = await prisma.$transaction([
      prisma.maintenanceLog.update({
        where: { id },
        data: { status },
        include: { vehicle: true },
      }),
      ...(Object.keys(vehicleStatusUpdate).length > 0 ? [
        prisma.vehicle.update({
          where: { id: log.vehicleId },
          data: vehicleStatusUpdate,
        })
      ] : [])
    ]);

    return NextResponse.json(updatedLog);
  } catch (error) {
    console.error("Maintenance status update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
