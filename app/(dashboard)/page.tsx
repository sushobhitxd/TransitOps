"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Truck, Users, Navigation, Wrench, TrendingUp,
  AlertTriangle, CheckCircle2, Clock, Activity,
  ArrowRight,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatNumber } from "@/lib/utils";

interface DashboardData {
  vehicles: {
    total: number; available: number; onTrip: number; inShop: number; retired: number;
  };
  trips: { active: number; pending: number; completed: number };
  drivers: { total: number; onDuty: number };
  fleetUtilization: number;
  recentTrips: Array<{
    id: string; source: string; destination: string; status: string;
    vehicle: { name: string; regNumber: string };
    driver: { name: string };
    createdAt: string;
  }>;
  expiringLicenses: Array<{
    id: string; name: string; licenseExpiry: string; licenseNumber: string;
  }>;
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  sub?: string;
  color: string;
  href?: string;
}) {
  const content = (
    <div className="kpi-card group cursor-pointer">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: "hsl(215 20% 55%)" }}>{label}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {sub && <p className="text-xs mt-1" style={{ color: "hsl(215 20% 55%)" }}>{sub}</p>}
        </div>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}20` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const kpis = [
    { icon: Truck, label: "Total Vehicles", value: data.vehicles.total, sub: `${data.vehicles.retired} retired`, color: "#6366f1", href: "/vehicles" },
    { icon: CheckCircle2, label: "Available Vehicles", value: data.vehicles.available, sub: "ready for dispatch", color: "#22c55e", href: "/vehicles?status=AVAILABLE" },
    { icon: Navigation, label: "Vehicles On Trip", value: data.vehicles.onTrip, sub: "currently active", color: "#3b82f6", href: "/vehicles?status=ON_TRIP" },
    { icon: Wrench, label: "In Maintenance", value: data.vehicles.inShop, sub: "in shop", color: "#f59e0b", href: "/maintenance" },
    { icon: Activity, label: "Active Trips", value: data.trips.active, sub: "dispatched", color: "#3b82f6", href: "/trips?status=DISPATCHED" },
    { icon: Clock, label: "Pending Trips", value: data.trips.pending, sub: "draft trips", color: "#8b5cf6", href: "/trips?status=DRAFT" },
    { icon: Users, label: "Drivers On Duty", value: data.drivers.onDuty, sub: `of ${data.drivers.total} total`, color: "#06b6d4", href: "/drivers" },
    { icon: TrendingUp, label: "Fleet Utilization", value: `${data.fleetUtilization}%`, sub: "vehicles active", color: "#f59e0b" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Trips */}
        <div className="lg:col-span-2 rounded-xl border p-5"
          style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Recent Trips</h2>
            <Link href="/trips" className="text-xs flex items-center gap-1 hover:opacity-80"
              style={{ color: "hsl(239 84% 70%)" }}>
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {data.recentTrips.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "hsl(215 20% 50%)" }}>No trips yet</p>
            ) : data.recentTrips.map((trip) => (
              <Link key={trip.id} href={`/trips/${trip.id}`}>
                <div className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-secondary/50">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "hsl(239 84% 67% / 0.15)" }}>
                    <Navigation className="w-4 h-4" style={{ color: "hsl(239 84% 70%)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {trip.source} → {trip.destination}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "hsl(215 20% 55%)" }}>
                      {trip.vehicle.regNumber} · {trip.driver.name} · {formatDate(trip.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={trip.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Expiring Licenses */}
        <div className="rounded-xl border p-5"
          style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="font-semibold text-sm">Expiring Licenses</h2>
          </div>
          {data.expiringLicenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-xs" style={{ color: "hsl(215 20% 55%)" }}>All licenses are valid</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.expiringLicenses.map((d) => (
                <Link key={d.id} href={`/drivers/${d.id}`}>
                  <div className="flex items-center gap-3 p-2.5 rounded-lg"
                    style={{ background: "hsl(38 92% 50% / 0.08)", border: "1px solid hsl(38 92% 50% / 0.2)" }}>
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{d.name}</p>
                      <p className="text-xs" style={{ color: "hsl(215 20% 55%)" }}>
                        Expires {formatDate(d.licenseExpiry)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
