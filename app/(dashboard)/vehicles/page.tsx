"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Truck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { VehicleForm } from "@/components/vehicles/vehicle-form";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] as any } }
};

interface Vehicle {
  id: string;
  name: string;
  regNumber: string;
  type: string;
  maxLoad: number;
  odometer: number;
  acquisitionCost: number;
  status: string;
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const fetchVehicles = async () => {
    const res = await fetch("/api/vehicles");
    const data = await res.json();
    setVehicles(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const filtered = vehicles.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.regNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-6 lg:p-8 space-y-8">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Fleet Registry</h2>
          <p className="text-sm text-muted-foreground">
            Manage your transport assets, monitor status, and register new vehicles.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap h-11 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-5 h-5 mr-2" /> Add Vehicle
          </DialogTrigger>
          <DialogContent className="max-w-lg bg-card border-white/10 p-8 rounded-2xl shadow-2xl">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold tracking-tight">Register Vehicle</DialogTitle>
            </DialogHeader>
            <VehicleForm onSuccess={() => { setCreateOpen(false); fetchVehicles(); }} />
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div variants={item} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors group-focus-within:text-white text-muted-foreground" />
          <Input 
            placeholder="Search by name or registration..." 
            className="pl-11 h-12 rounded-xl bg-card/50 border-white/10 text-white placeholder:text-muted-foreground/50 focus-visible:ring-primary focus-visible:border-primary transition-all"
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
      </motion.div>

      <motion.div variants={item} className="premium-card overflow-hidden">
        <Table className="data-table">
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="w-[300px]">Vehicle</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Max Load</TableHead>
              <TableHead>Odometer</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <span className="text-sm font-medium tracking-widest uppercase">Loading Registry...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell colSpan={6} className="text-center py-24">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-white/5 border border-white/10">
                    <Truck className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="text-base font-semibold text-white">No vehicles found</p>
                  <p className="text-sm mt-2 text-muted-foreground max-w-xs mx-auto">
                    We couldn't find any vehicles matching your search. Try adjusting your filters.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((v) => (
                <TableRow key={v.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <Truck className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white text-[15px] truncate">{v.name}</p>
                        <p className="text-xs font-medium tracking-wide text-muted-foreground mt-0.5">{v.regNumber}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold tracking-wide px-2.5 py-1 rounded-md bg-white/5 text-white/90 border border-white/10">
                      {v.type}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-white/90">{formatNumber(v.maxLoad, 0)} kg</TableCell>
                  <TableCell className="font-semibold text-white/90">{formatNumber(v.odometer, 0)} km</TableCell>
                  <TableCell className="font-semibold text-white/90">{formatCurrency(v.acquisitionCost)}</TableCell>
                  <TableCell className="text-right">
                    <StatusBadge status={v.status} />
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
