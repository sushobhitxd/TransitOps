"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { VehicleForm } from "@/components/vehicles/vehicle-form";

interface Vehicle {
  id: string;
  regNumber: string;
  name: string;
  type: string;
  maxLoad: number;
  odometer: number;
  acquisitionCost: number;
  status: string;
  region?: string;
  _count?: { trips: number; maintenanceLogs: number };
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);

  const fetchVehicles = async () => {
    const res = await fetch("/api/vehicles");
    const data = await res.json();
    setVehicles(data);
    setLoading(false);
  };

  useEffect(() => { fetchVehicles(); }, []);

  const filtered = vehicles.filter((v) => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.regNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Vehicle deleted");
      fetchVehicles();
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Failed to delete");
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    const res = await fetch(`/api/vehicles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success("Status updated");
      fetchVehicles();
    } else {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Vehicle Registry</h2>
          <p className="text-xs mt-0.5" style={{ color: "hsl(215 20% 55%)" }}>
            {vehicles.length} total vehicles
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditVehicle(null); }}>
          <DialogTrigger render={<Button size="sm" className="gap-2" />}>
            <Plus className="w-4 h-4" /> Add Vehicle
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editVehicle ? "Edit Vehicle" : "Register Vehicle"}</DialogTitle>
            </DialogHeader>
            <VehicleForm
              vehicle={editVehicle as any}
              onSuccess={() => { setDialogOpen(false); setEditVehicle(null); fetchVehicles(); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(215 20% 55%)" }} />
          <Input
            placeholder="Search by name or reg number..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "ALL")}>
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="ON_TRIP">On Trip</SelectItem>
            <SelectItem value="IN_SHOP">In Shop</SelectItem>
            <SelectItem value="RETIRED">Retired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden"
        style={{ borderColor: "hsl(var(--border))" }}>
        <Table className="data-table">
          <TableHeader>
            <TableRow style={{ background: "hsl(var(--secondary))" }}>
              <TableHead>Vehicle</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Max Load</TableHead>
              <TableHead>Odometer</TableHead>
              <TableHead>Acq. Cost</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Region</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12" style={{ color: "hsl(215 20% 50%)" }}>
                  Loading...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <Truck className="w-8 h-8 mx-auto mb-2" style={{ color: "hsl(215 20% 40%)" }} />
                  <p className="text-sm" style={{ color: "hsl(215 20% 50%)" }}>No vehicles found</p>
                </TableCell>
              </TableRow>
            ) : filtered.map((v) => (
              <TableRow key={v.id}>
                <TableCell>
                  <div>
                    <div className="font-medium text-sm">{v.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "hsl(215 20% 55%)" }}>{v.regNumber}</div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{v.type}</TableCell>
                <TableCell className="text-sm">{formatNumber(v.maxLoad, 0)} kg</TableCell>
                <TableCell className="text-sm">{formatNumber(v.odometer, 0)} km</TableCell>
                <TableCell className="text-sm">{formatCurrency(v.acquisitionCost)}</TableCell>
                <TableCell>
                  <Select value={v.status} onValueChange={(val) => handleStatusChange(v.id, val ?? v.status)}>
                    <SelectTrigger className="h-auto p-0 border-0 bg-transparent w-auto">
                      <StatusBadge status={v.status} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Available</SelectItem>
                      <SelectItem value="IN_SHOP">In Shop</SelectItem>
                      <SelectItem value="RETIRED">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-sm">{v.region ?? "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost" size="icon" className="w-7 h-7"
                      onClick={() => { setEditVehicle(v); setDialogOpen(true); }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger render={<Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" />}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Vehicle?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete <strong>{v.name}</strong> ({v.regNumber}). This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(v.id)} className="bg-destructive text-destructive-foreground">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
