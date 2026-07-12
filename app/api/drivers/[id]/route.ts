import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { driverSchema } from "@/lib/validations";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const driver = await prisma.driver.findUnique({
    where: { id },
    include: {
      trips: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!driver) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(driver);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const driver = await prisma.driver.findUnique({ where: { id } });
  if (!driver) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = driverSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.licenseExpiry) {
    data.licenseExpiry = new Date(parsed.data.licenseExpiry as string);
  }

  const updated = await prisma.driver.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const driver = await prisma.driver.findUnique({ where: { id } });
  if (!driver) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (driver.status === "ON_TRIP") {
    return NextResponse.json(
      { error: "Cannot delete a driver currently On Trip" },
      { status: 400 }
    );
  }

  await prisma.driver.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
