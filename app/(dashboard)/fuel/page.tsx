"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Droplet, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { formatNumber, formatCurrency, formatDate } from "@/lib/utils";
import { FuelForm } from "@/components/fuel/fuel-form";
import { motion } from "framer-motion";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] } } };

interface FuelLog {
  id: string;
  liters: number;
  cost: number;
  date: string;
  vehicle: { name: string; regNumber: string };
  trip?: { source: string; destination: string } | null;
}

export default function FuelPage() {
  const [logs, setLogs] = useState<FuelLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const fetchLogs = async () => {
    const res = await fetch("/api/fuel");
    setLogs(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const filtered = logs.filter((l) =>
    l.vehicle.name.toLowerCase().includes(search.toLowerCase()) ||
    l.vehicle.regNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-6 lg:p-8 space-y-8">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Fuel Logs</h2>
          <p className="text-sm text-muted-foreground">
            Monitor fleet fuel consumption, track expenses, and identify inefficiencies.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap h-11 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-5 h-5 mr-2" /> Log Fuel
          </DialogTrigger>
          <DialogContent className="max-w-lg bg-card border-white/10 p-8 rounded-2xl shadow-2xl">
            <DialogHeader className="mb-6"><DialogTitle className="text-2xl font-bold tracking-tight">Record Refueling</DialogTitle></DialogHeader>
            <FuelForm onSuccess={() => { setCreateOpen(false); fetchLogs(); }} />
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div variants={item} className="relative max-w-md group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors group-focus-within:text-white text-muted-foreground" />
        <Input 
          placeholder="Search by vehicle name or registration..." 
          className="pl-11 h-12 rounded-xl bg-card/50 border-white/10 text-white placeholder:text-muted-foreground/50 focus-visible:ring-primary focus-visible:border-primary transition-all"
          value={search} onChange={(e) => setSearch(e.target.value)} 
        />
      </motion.div>

      <motion.div variants={item} className="premium-card overflow-hidden">
        <Table className="data-table">
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="w-[280px]">Vehicle</TableHead>
              <TableHead>Linked Trip</TableHead>
              <TableHead>Volume</TableHead>
              <TableHead>Total Cost</TableHead>
              <TableHead className="text-right">Date Recorded</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <span className="text-sm font-medium tracking-widest uppercase">Loading Logs...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell colSpan={5} className="text-center py-24">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-white/5 border border-white/10">
                    <Droplet className="w-7 h-7 text-primary" />
                  </div>
                  <p className="text-base font-semibold text-white">No fuel logs found</p>
                  <p className="text-sm mt-2 text-muted-foreground max-w-xs mx-auto">
                    Start tracking your fleet's fuel consumption.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((l) => (
                <TableRow key={l.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <Droplet className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white text-[15px] truncate">{l.vehicle.name}</p>
                        <p className="text-xs font-medium tracking-wide text-muted-foreground mt-0.5">{l.vehicle.regNumber}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {l.trip ? (
                      <div className="flex items-center gap-2 text-[13px] font-semibold text-white/90">
                        <span className="truncate max-w-[100px] block">{l.trip.source}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[100px] block">{l.trip.destination}</span>
                      </div>
                    ) : (
                      <span className="text-[13px] font-medium text-muted-foreground">General Maintenance</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-white/90">{formatNumber(l.liters, 2)} L</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-primary">{formatCurrency(l.cost)}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-[13px] font-medium tracking-wide text-muted-foreground">
                      {formatDate(l.date)}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>
    </motion.div>
  );
}
