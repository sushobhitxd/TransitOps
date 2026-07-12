"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Truck, Users, Navigation, Wrench, TrendingUp,
  AlertTriangle, CheckCircle2, Clock, Activity,
  ArrowRight, ActivitySquare, LayoutGrid
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatNumber } from "@/lib/utils";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] as any } },
};

interface DashboardData {
  vehicles: { total: number; available: number; onTrip: number; inShop: number; retired: number; };
  trips: { active: number; pending: number; completed: number };
  drivers: { total: number; onDuty: number };
  fleetUtilization: number;
  recentTrips: Array<{ id: string; source: string; destination: string; status: string; vehicle: { name: string; regNumber: string }; driver: { name: string }; createdAt: string; }>;
  expiringLicenses: Array<{ id: string; name: string; licenseExpiry: string; licenseNumber: string; }>;
}

function KpiCard({ icon: Icon, label, value, sub, color, href }: { icon: React.ElementType; label: string; value: number | string; sub?: string; color: string; href?: string; }) {
  const content = (
    <div className="kpi-card group cursor-pointer bg-card border border-white/5 relative h-full flex flex-col justify-between">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1 pr-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">{label}</p>
          <p className="text-4xl font-bold tracking-tight text-white mb-2">{value}</p>
          {sub && <p className="text-xs font-medium text-muted-foreground/80">{sub}</p>}
        </div>
        <div className="kpi-icon-wrapper w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${color}20, ${color}10)`, border: `1px solid ${color}30` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href} className="block h-full">{content}</Link> : content;
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
      <div className="space-y-8 p-6 lg:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[140px] rounded-2xl bg-white/5" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-[400px] rounded-2xl bg-white/5" />
          <Skeleton className="h-[400px] rounded-2xl bg-white/5" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const primaryKPIs = [
    { icon: ActivitySquare, label: "Fleet Utilization", value: `${data.fleetUtilization}%`, sub: "vehicles active on trips", color: "hsl(var(--sl-teal))" },
    { icon: Truck, label: "Total Fleet", value: data.vehicles.total, sub: `${data.vehicles.available} available for dispatch`, color: "hsl(var(--sl-orange))", href: "/vehicles" },
    { icon: Navigation, label: "Active Trips", value: data.trips.active, sub: "currently en route", color: "hsl(var(--sl-peach))", href: "/trips?status=DISPATCHED" },
    { icon: Users, label: "Drivers On Duty", value: data.drivers.onDuty, sub: `of ${data.drivers.total} total drivers`, color: "hsl(var(--sl-sand))", href: "/drivers" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-6 lg:p-8 space-y-8">
      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {primaryKPIs.map((kpi) => (
          <motion.div key={kpi.label} variants={item} className="h-full">
            <KpiCard {...kpi} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Trips */}
        <motion.div variants={item} className="lg:col-span-2 premium-card p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
            <h3 className="font-bold text-[15px] tracking-wide flex items-center gap-2 text-white">
              <LayoutGrid className="w-4 h-4 text-primary" />
              Recent Dispatches
            </h3>
            <Link href="/trips" className="text-xs font-semibold uppercase tracking-widest transition-colors hover:text-primary text-muted-foreground flex items-center gap-1.5">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="space-y-2">
            {data.recentTrips.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-white/5 border border-white/10">
                  <Navigation className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-white">No active trips</p>
                <p className="text-xs mt-1.5 text-muted-foreground max-w-[200px]">Create and dispatch your first trip from the Trips dashboard.</p>
              </div>
            ) : data.recentTrips.map((trip) => (
              <Link key={trip.id} href={`/trips/${trip.id}`} className="block group">
                <div className="flex items-center gap-4 p-4 rounded-xl border border-transparent transition-all group-hover:bg-white/5 group-hover:border-white/10">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/5 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate mb-1">
                      {trip.source} <span className="text-muted-foreground font-medium mx-1">→</span> {trip.destination}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground/80 flex items-center gap-2">
                      <span className="text-white/70">{trip.vehicle.regNumber}</span>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span className="text-white/70">{trip.driver.name}</span>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      {formatDate(trip.createdAt)}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <StatusBadge status={trip.status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Action Panel */}
        <motion.div variants={item} className="flex flex-col gap-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Link href="/maintenance" className="premium-card p-5 group flex flex-col items-center justify-center text-center transition-all hover:bg-white/5">
              <Wrench className="w-6 h-6 text-status-in-shop mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-2xl font-bold text-white mb-1">{data.vehicles.inShop}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">In Shop</p>
            </Link>
            <Link href="/trips?status=DRAFT" className="premium-card p-5 group flex flex-col items-center justify-center text-center transition-all hover:bg-white/5">
              <Clock className="w-6 h-6 text-muted-foreground mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-2xl font-bold text-white mb-1">{data.trips.pending}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Drafts</p>
            </Link>
          </div>

          {/* Expiring Licenses */}
          <div className="premium-card p-6 flex-1">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
              <AlertTriangle className="w-4 h-4 text-status-in-shop" />
              <h3 className="font-bold text-[15px] tracking-wide text-white">License Alerts</h3>
            </div>
            
            {data.expiringLicenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center h-[200px]">
                <CheckCircle2 className="w-10 h-10 mb-4 text-status-available/50" />
                <p className="text-sm font-semibold text-white">All Clear</p>
                <p className="text-xs mt-1.5 text-muted-foreground">All driver licenses are currently valid.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.expiringLicenses.map((d) => (
                  <Link key={d.id} href={`/drivers/${d.id}`} className="block">
                    <div className="flex items-center gap-3 p-3.5 rounded-xl border transition-all hover:bg-white/5 bg-status-in-shop/5 border-status-in-shop/10 hover:border-status-in-shop/30 group">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-status-in-shop/10 group-hover:bg-status-in-shop/20">
                        <AlertTriangle className="w-4 h-4 text-status-in-shop" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-white truncate">{d.name}</p>
                        <p className="text-xs font-medium text-status-in-shop/80">
                          Expires {formatDate(d.licenseExpiry)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
