"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Download, TrendingUp, Fuel, DollarSign, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface VehicleAnalytics {
  id: string;
  name: string;
  regNumber: string;
  type: string;
  status: string;
  acquisitionCost: number;
  totalDistance: number;
  totalFuel: number;
  fuelEfficiency: number;
  fuelCost: number;
  maintenanceCost: number;
  otherExpenses: number;
  totalCost: number;
  totalRevenue: number;
  roi: number;
  tripsCompleted: number;
}

interface AnalyticsData {
  vehicles: VehicleAnalytics[];
  monthlyTrips: Array<{ month: string; count: number; revenue: number }>;
}

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#3b82f6", "#ec4899", "#14b8a6"];

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string; color: string;
}) {
  return (
    <div className="rounded-xl p-4 border" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div>
          <p className="text-xs" style={{ color: "hsl(215 20% 55%)" }}>{label}</p>
          <p className="font-bold text-lg">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports/analytics")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleExport = (type: string) => {
    window.location.href = `/api/reports/export?type=${type}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!data) return <p className="text-center py-16" style={{ color: "hsl(215 20% 50%)" }}>Failed to load analytics</p>;

  const totalRevenue = data.vehicles.reduce((s, v) => s + v.totalRevenue, 0);
  const totalCost = data.vehicles.reduce((s, v) => s + v.totalCost, 0);
  const totalDistance = data.vehicles.reduce((s, v) => s + v.totalDistance, 0);
  const avgFuelEff = data.vehicles.filter((v) => v.fuelEfficiency > 0);
  const avgEfficiency = avgFuelEff.length > 0
    ? avgFuelEff.reduce((s, v) => s + v.fuelEfficiency, 0) / avgFuelEff.length
    : 0;

  const costBreakdown = data.vehicles.reduce(
    (acc, v) => ({
      fuel: acc.fuel + v.fuelCost,
      maintenance: acc.maintenance + v.maintenanceCost,
      other: acc.other + v.otherExpenses,
    }),
    { fuel: 0, maintenance: 0, other: 0 }
  );

  const pieData = [
    { name: "Fuel", value: costBreakdown.fuel },
    { name: "Maintenance", value: costBreakdown.maintenance },
    { name: "Other", value: costBreakdown.other },
  ].filter((d) => d.value > 0);

  const tooltipStyle = {
    background: "hsl(222 47% 11%)",
    border: "1px solid hsl(222 47% 18%)",
    borderRadius: "8px",
    color: "hsl(213 31% 91%)",
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Revenue" value={formatCurrency(totalRevenue)} color="#6366f1" />
        <StatCard icon={DollarSign} label="Total Costs" value={formatCurrency(totalCost)} color="#f59e0b" />
        <StatCard icon={TrendingUp} label="Total Distance" value={`${formatNumber(totalDistance, 0)} km`} color="#22c55e" />
        <StatCard icon={Fuel} label="Avg Fuel Efficiency" value={`${formatNumber(avgEfficiency, 2)} km/L`} color="#3b82f6" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly trips/revenue */}
        <div className="lg:col-span-2 rounded-xl border p-5" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
          <h3 className="text-sm font-semibold mb-4">Monthly Trip Activity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.monthlyTrips}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 47% 18%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(215 20% 55%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(215 20% 55%)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="count" name="Trips" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cost breakdown pie */}
        <div className="rounded-xl border p-5" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
          <h3 className="text-sm font-semibold mb-4">Cost Breakdown</h3>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-48" style={{ color: "hsl(215 20% 50%)" }}>
              <p className="text-sm">No cost data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  dataKey="value" nameKey="name" paddingAngle={3}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Fuel Efficiency chart */}
      <div className="rounded-xl border p-5" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
        <h3 className="text-sm font-semibold mb-4">Fuel Efficiency by Vehicle (km/L)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.vehicles.filter((v) => v.fuelEfficiency > 0)}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 47% 18%)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v} km/L`} />
            <Bar dataKey="fuelEfficiency" name="km/L" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ROI table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ background: "hsl(var(--card))" }}>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="w-4 h-4" style={{ color: "hsl(239 84% 70%)" }} />
            Vehicle ROI & Operational Cost Analysis
          </h3>
          <div className="flex gap-2">
            {["trips", "vehicles", "fuel", "expenses"].map((type) => (
              <Button key={type} size="sm" variant="outline" className="h-7 text-xs gap-1"
                onClick={() => handleExport(type)}>
                <Download className="w-3 h-3" />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        <Table className="data-table">
          <TableHeader>
            <TableRow style={{ background: "hsl(var(--secondary))" }}>
              <TableHead>Vehicle</TableHead>
              <TableHead>Trips</TableHead>
              <TableHead>Distance</TableHead>
              <TableHead>Fuel Efficiency</TableHead>
              <TableHead>Total Cost</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>ROI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10" style={{ color: "hsl(215 20% 50%)" }}>
                  No vehicle data yet
                </TableCell>
              </TableRow>
            ) : data.vehicles.map((v) => (
              <TableRow key={v.id}>
                <TableCell>
                  <div className="font-medium text-sm">{v.name}</div>
                  <div className="text-xs" style={{ color: "hsl(215 20% 55%)" }}>{v.regNumber}</div>
                </TableCell>
                <TableCell className="text-sm">{v.tripsCompleted}</TableCell>
                <TableCell className="text-sm">{formatNumber(v.totalDistance, 0)} km</TableCell>
                <TableCell className="text-sm">
                  {v.fuelEfficiency > 0 ? `${v.fuelEfficiency} km/L` : "—"}
                </TableCell>
                <TableCell className="text-sm">{formatCurrency(v.totalCost)}</TableCell>
                <TableCell className="text-sm">{formatCurrency(v.totalRevenue)}</TableCell>
                <TableCell>
                  <span className={`text-sm font-medium ${v.roi >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {v.roi > 0 ? "+" : ""}{v.roi}%
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
