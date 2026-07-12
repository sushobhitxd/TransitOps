"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Wrench, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { MaintenanceForm } from "@/components/maintenance/maintenance-form";
import { CloseMaintenanceDialog } from "@/components/maintenance/close-maintenance-dialog";

interface MaintenanceLog {
  id: string;
  type: string;
  description: string;
  cost: number;
  status: string;
  startDate: string;
  endDate?: string;
  technicianName?: string;
  vehicle: { id: string; name: string; regNumber: string };
}

export default function MaintenancePage() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [closeLog, setCloseLog] = useState<MaintenanceLog | null>(null);

  const fetchLogs = async () => {
    const res = await fetch("/api/maintenance");
    const data = await res.json();
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const filtered = logs.filter((l) =>
    l.vehicle.name.toLowerCase().includes(search.toLowerCase()) ||
    l.type.toLowerCase().includes(search.toLowerCase())
  );

  const active = filtered.filter((l) => l.status === "ACTIVE");
  const closed = filtered.filter((l) => l.status === "CLOSED");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Maintenance Logs</h2>
          <p className="text-xs mt-0.5" style={{ color: "hsl(215 20% 55%)" }}>
            {active.length} active · {closed.length} closed
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger render={<Button size="sm" className="gap-2" />}>
            <Plus className="w-4 h-4" /> Log Maintenance
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Maintenance Record</DialogTitle>
            </DialogHeader>
            <MaintenanceForm onSuccess={() => { setCreateOpen(false); fetchLogs(); }} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(215 20% 55%)" }} />
        <Input placeholder="Search maintenance logs..." className="pl-9 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Active */}
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-amber-400" />
          Active Maintenance ({active.length})
        </h3>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
          <Table className="data-table">
            <TableHeader>
              <TableRow style={{ background: "hsl(var(--secondary))" }}>
                <TableHead>Vehicle</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8" style={{ color: "hsl(215 20% 50%)" }}>Loading...</TableCell></TableRow>
              ) : active.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <CheckCircle2 className="w-7 h-7 mx-auto mb-2 text-green-500" />
                    <p className="text-sm" style={{ color: "hsl(215 20% 50%)" }}>No active maintenance</p>
                  </TableCell>
                </TableRow>
              ) : active.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{log.vehicle.name}</div>
                      <div className="text-xs" style={{ color: "hsl(215 20% 55%)" }}>{log.vehicle.regNumber}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{log.type}</TableCell>
                  <TableCell className="text-sm max-w-48 truncate">{log.description}</TableCell>
                  <TableCell className="text-sm">{log.technicianName ?? "—"}</TableCell>
                  <TableCell className="text-sm">{formatDate(log.startDate)}</TableCell>
                  <TableCell className="text-sm">{formatCurrency(log.cost)}</TableCell>
                  <TableCell><StatusBadge status={log.status} /></TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" className="h-7 text-xs"
                      onClick={() => setCloseLog(log)}>
                      Close
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Closed */}
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          Closed Maintenance ({closed.length})
        </h3>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
          <Table className="data-table">
            <TableHeader>
              <TableRow style={{ background: "hsl(var(--secondary))" }}>
                <TableHead>Vehicle</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Final Cost</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {closed.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6" style={{ color: "hsl(215 20% 50%)" }}>
                    No closed maintenance records
                  </TableCell>
                </TableRow>
              ) : closed.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="font-medium text-sm">{log.vehicle.name}</div>
                    <div className="text-xs" style={{ color: "hsl(215 20% 55%)" }}>{log.vehicle.regNumber}</div>
                  </TableCell>
                  <TableCell className="text-sm">{log.type}</TableCell>
                  <TableCell className="text-sm">
                    {formatDate(log.startDate)} → {formatDate(log.endDate)}
                  </TableCell>
                  <TableCell className="text-sm">{formatCurrency(log.cost)}</TableCell>
                  <TableCell><StatusBadge status={log.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {closeLog && (
        <CloseMaintenanceDialog
          log={closeLog}
          open={!!closeLog}
          onClose={() => setCloseLog(null)}
          onSuccess={() => { setCloseLog(null); fetchLogs(); }}
        />
      )}
    </div>
  );
}
