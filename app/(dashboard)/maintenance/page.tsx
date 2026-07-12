"use client";

import { useEffect, useState } from "react";
import { Plus, Wrench, Settings, CheckCircle2, Clock, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { MaintenanceForm } from "@/components/maintenance/maintenance-form";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] as any } } };

interface MaintenanceLog {
  id: string;
  description: string;
  date: string;
  cost: number;
  status: "SCHEDULED" | "ACTIVE" | "COMPLETED";
  vehicle: { name: string; regNumber: string };
}

const statusConfig = {
  SCHEDULED: { title: "Scheduled", icon: Clock, color: "var(--muted-foreground)" },
  ACTIVE: { title: "In Shop", icon: Settings, color: "var(--sl-orange)" },
  COMPLETED: { title: "Completed", icon: CheckCircle2, color: "var(--status-available)" },
};

export default function MaintenancePage() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchLogs = async () => {
    const res = await fetch("/api/maintenance");
    setLogs(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/maintenance/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Maintenance marked as ${newStatus}`);
        fetchLogs();
      } else {
        toast.error("Failed to update status");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const columns = ["SCHEDULED", "ACTIVE", "COMPLETED"] as const;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-6 lg:p-8 h-[calc(100vh-5rem)] flex flex-col">
      <motion.div variants={item} className="flex items-center justify-between mb-8 flex-shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Maintenance Board</h2>
          <p className="text-sm text-muted-foreground">
            Track vehicle repairs, routine servicing, and fleet health visually.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap h-11 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-5 h-5 mr-2" /> Log Maintenance
          </DialogTrigger>
          <DialogContent className="max-w-lg bg-card border-white/10 p-8 rounded-2xl shadow-2xl">
            <DialogHeader className="mb-6"><DialogTitle className="text-2xl font-bold tracking-tight">Schedule Service</DialogTitle></DialogHeader>
            <MaintenanceForm onSuccess={() => { setCreateOpen(false); fetchLogs(); }} />
          </DialogContent>
        </Dialog>
      </motion.div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-sm font-medium tracking-widest uppercase text-muted-foreground">Loading Board...</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6 overflow-x-auto pb-4">
          {columns.map((col) => {
            const columnLogs = logs.filter((l) => l.status === col);
            const conf = statusConfig[col];
            return (
              <div key={col} className="flex-1 min-w-[320px] flex flex-col bg-white/[0.02] rounded-[24px] border border-white/5 p-4 relative overflow-hidden">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5 px-2">
                  <div className="flex items-center gap-2">
                    <conf.icon className="w-5 h-5" style={{ color: `hsl(${conf.color})` }} />
                    <h3 className="font-bold text-[15px] tracking-wide text-white">{conf.title}</h3>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-white/5 text-white">
                    {columnLogs.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                  {columnLogs.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-xl">
                      <p className="text-sm font-medium text-muted-foreground">No tasks</p>
                    </div>
                  ) : (
                    columnLogs.map((log) => (
                      <motion.div key={log.id} variants={item} className="p-4 rounded-xl bg-card border border-white/10 hover:border-white/20 transition-all group">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-sm font-bold text-white mb-0.5">{log.vehicle.name}</p>
                            <p className="text-[11px] font-medium tracking-widest uppercase" style={{ color: `hsl(${conf.color})` }}>
                              {log.vehicle.regNumber}
                            </p>
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                            <Wrench className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
                          </div>
                        </div>
                        
                        <p className="text-[13px] text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                          {log.description}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <span className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
                            {formatDate(log.date)}
                          </span>
                          
                          {col === "SCHEDULED" && (
                            <Button 
                              size="sm" variant="ghost" 
                              className="h-7 text-xs font-semibold hover:bg-white/10 hover:text-white px-2 gap-1.5"
                              disabled={actionLoading === log.id}
                              onClick={() => updateStatus(log.id, "ACTIVE")}
                            >
                              {actionLoading === log.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Start"}
                              <ArrowRight className="w-3 h-3" />
                            </Button>
                          )}
                          {col === "ACTIVE" && (
                            <Button 
                              size="sm" variant="ghost" 
                              className="h-7 text-xs font-semibold text-status-available hover:bg-status-available/20 hover:text-status-available px-2 gap-1.5"
                              disabled={actionLoading === log.id}
                              onClick={() => updateStatus(log.id, "COMPLETED")}
                            >
                              {actionLoading === log.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Complete"}
                              <CheckCircle2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
