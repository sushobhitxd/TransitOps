import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, differenceInDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, "MMM dd, yyyy");
  } catch {
    return "—";
  }
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number | null | undefined, decimals = 1): string {
  if (n === null || n === undefined) return "—";
  return n.toFixed(decimals);
}

export function daysUntilExpiry(date: string | Date | null | undefined): number | null {
  if (!date) return null;
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return differenceInDays(d, new Date());
  } catch {
    return null;
  }
}

export function isLicenseExpired(date: string | Date | null | undefined): boolean {
  const days = daysUntilExpiry(date);
  return days !== null && days < 0;
}

export function isLicenseExpiringSoon(date: string | Date | null | undefined): boolean {
  const days = daysUntilExpiry(date);
  return days !== null && days >= 0 && days <= 30;
}

export type VehicleStatusColor = "green" | "blue" | "yellow" | "red" | "gray";
export type DriverStatusColor = "green" | "blue" | "yellow" | "red";

export function vehicleStatusColor(status: string): VehicleStatusColor {
  switch (status) {
    case "AVAILABLE": return "green";
    case "ON_TRIP": return "blue";
    case "IN_SHOP": return "yellow";
    case "RETIRED": return "red";
    default: return "gray";
  }
}

export function driverStatusColor(status: string): DriverStatusColor {
  switch (status) {
    case "AVAILABLE": return "green";
    case "ON_TRIP": return "blue";
    case "OFF_DUTY": return "yellow";
    case "SUSPENDED": return "red";
    default: return "yellow";
  }
}

export function tripStatusColor(status: string) {
  switch (status) {
    case "DRAFT": return "gray";
    case "DISPATCHED": return "blue";
    case "COMPLETED": return "green";
    case "CANCELLED": return "red";
    default: return "gray";
  }
}

export function calcFuelEfficiency(distance?: number | null, fuel?: number | null): string {
  if (!distance || !fuel || fuel === 0) return "—";
  return (distance / fuel).toFixed(2) + " km/L";
}
