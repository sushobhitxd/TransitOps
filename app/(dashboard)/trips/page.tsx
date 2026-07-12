"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Navigation, ArrowRight, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatNumber, formatDate } from "@/lib/utils";
import { TripForm } from "@/components/trips/trip-form";
import { CompleteTripDialog } from "@/components/trips/complete-trip-dialog";
import { motion } from "framer-motion";
import { toast } from "sonner";


const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] as any } } };

interface Trip {
  id: string;
  source: string;
  destination: string;
  cargoWeight: number;
  plannedDistance: number;
  status: string;
  vehicle: { name: string; regNumber: string };
  driver: { name: string };
  createdAt: string;
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [actionData, setActionData] = useState<{ id: string; type: "DISPATCH" | "COMPLETE" | "CANCEL" } | null>(null);

  const fetchTrips = async () => {
    const res = await fetch("/api/trips");
    setTrips(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchTrips(); }, []);

  const handleAction = async (id: string, action: "DISPATCH" | "CANCEL") => {
    try {
      const res = await fetch(`/api/trips/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: action === "DISPATCH" ? "DISPATCHED" : "CANCELLED" 
        }),
      });
      if (res.ok) {
        toast.success(`Trip ${action.toLowerCase()}ed successfully`);
        fetchTrips();
      } else {
        const err = await res.json();
        toast.error(err.error || "Action failed");
      }
    } catch {
      toast.error("Network error");
    }
  };
  const filtered = trips.filter((t) =>
    t.source.toLowerCase().includes(search.toLowerCase()) ||
    t.destination.toLowerCase().includes(search.toLowerCase()) ||
    t.vehicle.regNumber.toLowerCase().includes(search.toLowerCase()) ||
    t.driver.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-6 lg:p-8 space-y-8">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Trip Dispatch</h2>
          <p className="text-sm text-muted-foreground">
            Manage dispatch workflows, monitor active routes, and finalize logistics.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap h-11 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-5 h-5 mr-2" /> Create Trip
          </DialogTrigger>
          <DialogContent className="max-w-xl bg-card border-white/10 p-8 rounded-2xl shadow-2xl">
            <DialogHeader className="mb-6"><DialogTitle className="text-2xl font-bold tracking-tight">Draft New Trip</DialogTitle></DialogHeader>
            <TripForm onSuccess={() => { setCreateOpen(false); fetchTrips(); }} />
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div variants={item} className="relative max-w-md group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors group-focus-within:text-white text-muted-foreground" />
        <Input 
          placeholder="Search locations, vehicles, or drivers..." 
          className="pl-11 h-12 rounded-xl bg-card/50 border-white/10 text-white placeholder:text-muted-foreground/50 focus-visible:ring-primary focus-visible:border-primary transition-all"
          value={search} onChange={(e) => setSearch(e.target.value)} 
        />
      </motion.div>

      <motion.div variants={item} className="premium-card overflow-hidden">
        <Table className="data-table">
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="w-[300px]">Route</TableHead>
              <TableHead>Assignment</TableHead>
              <TableHead>Logistics</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <span className="text-sm font-medium tracking-widest uppercase">Loading Dispatches...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell colSpan={5} className="text-center py-24">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-white/5 border border-white/10">
                    <Navigation className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="text-base font-semibold text-white">No active trips</p>
                  <p className="text-sm mt-2 text-muted-foreground max-w-xs mx-auto">
                    Create a new trip draft to begin the dispatch workflow.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((t) => (
                <TableRow key={t.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-[15px] font-bold text-white">
                        <MapPin className="w-4 h-4 text-primary shrink-0" />
                        <span className="truncate max-w-[120px]" title={t.source}>{t.source}</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[120px]" title={t.destination}>{t.destination}</span>
                      </div>
                      <div className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground pl-6">
                        Created {formatDate(t.createdAt)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="text-[13px] font-bold text-white">{t.vehicle.name} <span className="text-muted-foreground font-medium ml-1">({t.vehicle.regNumber})</span></div>
                      <div className="text-[13px] text-muted-foreground">{t.driver.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-[13px] font-semibold text-white/90">
                      <div>{formatNumber(t.cargoWeight, 0)} kg cargo</div>
                      <div className="text-muted-foreground">{formatNumber(t.plannedDistance, 0)} km est.</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={t.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {t.status === "DRAFT" && (
                        <>
                          <Button size="sm" variant="outline" className="h-8 rounded-lg bg-white/5 border-white/10 hover:bg-white/10 text-white" onClick={() => handleAction(t.id, "DISPATCH")}>
                            Dispatch
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 rounded-lg bg-status-retired/10 text-status-retired border-status-retired/20 hover:bg-status-retired/20" onClick={() => handleAction(t.id, "CANCEL")}>
                            Cancel
                          </Button>
                        </>
                      )}
                      {t.status === "DISPATCHED" && (
                        <Button size="sm" className="h-8 rounded-lg bg-status-available/20 text-status-available hover:bg-status-available/30" onClick={() => setActionData({ id: t.id, type: "COMPLETE" })}>
                          Complete
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      {actionData?.type === "COMPLETE" && (
        <CompleteTripDialog 
          trip={trips.find(t => t.id === actionData.id)!} 
          open 
          onClose={() => setActionData(null)} 
          onSuccess={() => { setActionData(null); fetchTrips(); }} 
        />
      )}
    </motion.div>
  );
}
