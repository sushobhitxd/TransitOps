"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, BarChart3, TrendingUp, TrendingDown, Target, Zap, ActivitySquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from "recharts";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] as any } } };

interface ReportData {
  fleetUtilization: number;
  fuelEfficiency: number;
  totalCost: number;
  revenue: number;
  roi: number;
  expensesByCategory: Array<{ name: string; value: number }>;
  monthlyCosts: Array<{ month: string; fuel: number; maintenance: number; other: number }>;
}

function StatCard({ label, value, trend, icon: Icon, prefix = "" }: { label: string; value: number; trend: number; icon: React.ElementType; prefix?: string }) {
  const isPositive = trend >= 0;
  return (
    <div className="premium-card p-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">{label}</p>
          <p className="text-3xl font-bold tracking-tight text-white mb-2">
            {prefix}{formatNumber(value, prefix === "₹" ? 2 : 1)}
          </p>
          <div className={`flex items-center gap-1.5 text-xs font-semibold ${isPositive ? "text-status-available" : "text-status-retired"}`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(trend)}% vs last month
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports/analytics")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleExport = () => {
    window.open("/api/reports/export", "_blank");
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <span className="text-sm font-bold tracking-widest uppercase text-muted-foreground">Generating Reports...</span>
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-6 lg:p-8 space-y-8">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Executive Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Financial overview, fleet performance, and operational ROI.
          </p>
        </div>
        <Button 
          onClick={handleExport}
          className="h-11 px-6 rounded-xl shadow-lg shadow-white/5 transition-all hover:shadow-white/10 text-sm font-bold bg-white text-black hover:bg-white/90"
        >
          <Download className="w-5 h-5 mr-2" /> Export CSV Report
        </Button>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Fleet ROI" value={data.roi} trend={5.2} icon={Target} prefix="₹" />
        <StatCard label="Total Operational Cost" value={data.totalCost} trend={-2.1} icon={ActivitySquare} prefix="₹" />
        <StatCard label="Avg Fuel Efficiency" value={data.fuelEfficiency} trend={1.4} icon={Zap} />
        <StatCard label="Fleet Utilization" value={data.fleetUtilization} trend={8.5} icon={BarChart3} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2 premium-card p-6">
          <div className="mb-6 pb-4 border-b border-white/5">
            <h3 className="font-bold text-[15px] tracking-wide text-white">Monthly Operational Costs</h3>
          </div>
          <div className="h-[350px] w-full">
            {data.monthlyCosts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthlyCosts} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--sl-teal))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--sl-teal))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorMaint" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--sl-orange))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--sl-orange))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
                    itemStyle={{ color: 'hsl(var(--foreground))' }} 
                    formatter={(val: number) => formatCurrency(val)} 
                  />
                  <Area type="monotone" dataKey="maintenance" stackId="1" stroke="hsl(var(--sl-orange))" fill="url(#colorMaint)" strokeWidth={3} />
                  <Area type="monotone" dataKey="fuel" stackId="1" stroke="hsl(var(--sl-teal))" fill="url(#colorFuel)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm font-medium text-muted-foreground">Insufficient data for cost history</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={item} className="premium-card p-6">
          <div className="mb-6 pb-4 border-b border-white/5">
            <h3 className="font-bold text-[15px] tracking-wide text-white">Expense Distribution</h3>
          </div>
          <div className="h-[350px] w-full">
            {data.expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.expensesByCategory} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted) / 0.5)' }} 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }} 
                    formatter={(val: number) => formatCurrency(val)} 
                  />
                  <Bar dataKey="value" fill="hsl(var(--sl-peach))" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm font-medium text-muted-foreground">No expenses logged yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

