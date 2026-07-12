import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const labelMap: Record<string, string> = {
  AVAILABLE: "Available",
  ON_TRIP: "On Trip",
  IN_SHOP: "In Shop",
  RETIRED: "Retired",
  OFF_DUTY: "Off Duty",
  SUSPENDED: "Suspended",
  DRAFT: "Draft",
  DISPATCHED: "Dispatched",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  ACTIVE: "Active",
  CLOSED: "Closed",
};

const classMap: Record<string, string> = {
  AVAILABLE: "status-available",
  ON_TRIP: "status-on-trip",
  IN_SHOP: "status-in-shop",
  RETIRED: "status-retired",
  OFF_DUTY: "status-off-duty",
  SUSPENDED: "status-suspended",
  DRAFT: "status-draft",
  DISPATCHED: "status-dispatched",
  COMPLETED: "status-completed",
  CANCELLED: "status-cancelled",
  ACTIVE: "status-on-trip",
  CLOSED: "status-completed",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        classMap[status] ?? "status-draft",
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 opacity-70 bg-current" />
      {labelMap[status] ?? status}
    </span>
  );
}
