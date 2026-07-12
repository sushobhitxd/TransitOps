"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Fuel, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fuelLogSchema, type FuelLogInput } from "@/lib/validations";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { formatDate, formatCurrency, formatNumber } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface FuelLog {
  id: string;
  liters: number;
  costPerLiter: number;
  totalCost: number;
  odometer: number;
  date: string;
  station?: string;
  vehicle: { name: string; regNumber: string };
  trip?: { source: string; destination: string } | null;
}

interface Vehicle {
  id: string; name: string; regNumber: string;
}

function FuelForm({ onSuccess }: { onSuccess: () => void }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FuelLogInput>({
    resolver: zodResolver(fuelLogSchema),
  });
  const liters = watch("liters");
  const costPerLiter = watch("costPerLiter");

  useEffect(() => {
    fetch("/api/vehicles").then((r) => r.json()).then(setVehicles);
  }, []);

  const onSubmit = async (data: FuelLogInput) => {
    const res = await fetch("/api/fuel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) { toast.success("Fuel log recorded"); onSuccess(); }
    else { const e = await res.json(); toast.error(e.error ?? "Failed"); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Vehicle *</Label>
        <Select onValueChange={(v) => setValue("vehicleId", v as string)}>
          <SelectTrigger><SelectValue placeholder="Select vehicle..." /></SelectTrigger>
          <SelectContent>
            {vehicles.map((v) => <SelectItem key={v.id} value={v.id}>{v.name} ({v.regNumber})</SelectItem>)}
          </SelectContent>
        </Select>
        {errors.vehicleId && <p className="text-xs text-destructive">{errors.vehicleId.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Liters *</Label>
          <Input type="number" step="0.1" {...register("liters", { valueAsNumber: true })} placeholder="45.5" />
          {errors.liters && <p className="text-xs text-destructive">{errors.liters.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Cost per Liter (₹) *</Label>
          <Input type="number" step="0.01" {...register("costPerLiter", { valueAsNumber: true })} placeholder="104.50" />
          {errors.costPerLiter && <p className="text-xs text-destructive">{errors.costPerLiter.message}</p>}
        </div>
      </div>
      {liters && costPerLiter && (
        <div className="text-sm p-2 rounded-lg" style={{ background: "hsl(239 84% 67% / 0.1)", color: "hsl(239 84% 80%)" }}>
          Total Cost: {formatCurrency(liters * costPerLiter)}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Odometer (km) *</Label>
          <Input type="number" {...register("odometer", { valueAsNumber: true })} placeholder="12500" />
          {errors.odometer && <p className="text-xs text-destructive">{errors.odometer.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Date</Label>
          <Input type="date" {...register("date")} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Station/Location</Label>
        <Input {...register("station")} placeholder="HP Petrol Station, Pune..." />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Recording...</> : "Record Fuel Log"}
      </Button>
    </form>
  );
}

export default function FuelPage() {
  const [logs, setLogs] = useState<FuelLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

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

  const totalCost = logs.reduce((sum, l) => sum + l.totalCost, 0);
  const totalLiters = logs.reduce((sum, l) => sum + l.liters, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Fuel Logs</h2>
          <p className="text-xs mt-0.5" style={{ color: "hsl(215 20% 55%)" }}>
            {formatNumber(totalLiters, 1)} L total · {formatCurrency(totalCost)} spent
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button size="sm" className="gap-2" />}>
            <Plus className="w-4 h-4" /> Log Fuel
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Record Fuel Log</DialogTitle></DialogHeader>
            <FuelForm onSuccess={() => { setOpen(false); fetchLogs(); }} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(215 20% 55%)" }} />
        <Input placeholder="Search by vehicle..." className="pl-9 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
        <Table className="data-table">
          <TableHeader>
            <TableRow style={{ background: "hsl(var(--secondary))" }}>
              <TableHead>Vehicle</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Liters</TableHead>
              <TableHead>Cost/L</TableHead>
              <TableHead>Total Cost</TableHead>
              <TableHead>Odometer</TableHead>
              <TableHead>Station</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8" style={{ color: "hsl(215 20% 50%)" }}>Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <Fuel className="w-8 h-8 mx-auto mb-2" style={{ color: "hsl(215 20% 40%)" }} />
                  <p className="text-sm" style={{ color: "hsl(215 20% 50%)" }}>No fuel logs yet</p>
                </TableCell>
              </TableRow>
            ) : filtered.map((l) => (
              <TableRow key={l.id}>
                <TableCell>
                  <div className="font-medium text-sm">{l.vehicle.name}</div>
                  <div className="text-xs" style={{ color: "hsl(215 20% 55%)" }}>{l.vehicle.regNumber}</div>
                </TableCell>
                <TableCell className="text-sm">{formatDate(l.date)}</TableCell>
                <TableCell className="text-sm">{formatNumber(l.liters, 1)} L</TableCell>
                <TableCell className="text-sm">₹{l.costPerLiter.toFixed(2)}</TableCell>
                <TableCell className="text-sm font-medium">{formatCurrency(l.totalCost)}</TableCell>
                <TableCell className="text-sm">{formatNumber(l.odometer, 0)} km</TableCell>
                <TableCell className="text-sm">{l.station ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
