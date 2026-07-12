import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { vehicleSchema } from "@/lib/validations";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const region = searchParams.get("region");

  const vehicles = await prisma.vehicle.findMany({
    where: {
      ...(status && { status: status as any }),
      ...(type && { type: type as any }),
      ...(region && { region }),
    },
    include: {
      _count: { select: { trips: true, maintenanceLogs: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(vehicles);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = vehicleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Check unique regNumber
  const existing = await prisma.vehicle.findUnique({
    where: { regNumber: parsed.data.regNumber },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Vehicle with this registration number already exists" },
      { status: 409 }
    );
  }

  const vehicle = await prisma.vehicle.create({ data: parsed.data });
  return NextResponse.json(vehicle, { status: 201 });
}
