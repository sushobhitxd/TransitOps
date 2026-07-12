import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { driverSchema } from "@/lib/validations";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const drivers = await prisma.driver.findMany({
    where: {
      ...(status && { status: status as any }),
    },
    include: {
      _count: { select: { trips: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(drivers);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = driverSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.driver.findUnique({
    where: { licenseNumber: parsed.data.licenseNumber },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Driver with this license number already exists" },
      { status: 409 }
    );
  }

  const driver = await prisma.driver.create({
    data: {
      ...parsed.data,
      licenseExpiry: new Date(parsed.data.licenseExpiry),
    },
  });
  return NextResponse.json(driver, { status: 201 });
}
