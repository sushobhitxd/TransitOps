import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { expenseSchema } from "@/lib/validations";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const vehicleId = searchParams.get("vehicleId");
  const category = searchParams.get("category");

  const expenses = await prisma.expense.findMany({
    where: {
      ...(vehicleId && { vehicleId }),
      ...(category && { category: category as any }),
    },
    include: {
      vehicle: { select: { id: true, name: true, regNumber: true } },
      trip: { select: { id: true, source: true, destination: true } },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(expenses);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = expenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const expense = await prisma.expense.create({
    data: {
      ...parsed.data,
      tripId: parsed.data.tripId || null,
      date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
    },
    include: {
      vehicle: { select: { id: true, name: true, regNumber: true } },
    },
  });

  return NextResponse.json(expense, { status: 201 });
}
