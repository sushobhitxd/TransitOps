"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, Users, AlertTriangle } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { formatDate, daysUntilExpiry, isLicenseExpired, isLicenseExpiringSoon } from "@/lib/utils";
import { DriverForm } from "@/components/drivers/driver-form";

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiry: string;
  contactNumber: string;
  email?: string;
  safetyScore: number;
  status: string;
  _count?: { trips: number };
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDriver, setEditDriver] = useState<Driver | null>(null);

  const fetchDrivers = async () => {
    const res = await fetch("/api/drivers");
    const data = await res.json();
    setDrivers(data);
    setLoading(false);
  };

  useEffect(() => { fetchDrivers(); }, []);

  const filtered = drivers.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/drivers/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Driver removed");
      fetchDrivers();
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Failed to delete");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Driver Management</h2>
          <p className="text-xs mt-0.5" style={{ color: "hsl(215 20% 55%)" }}>
            {drivers.length} total drivers
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditDriver(null); }}>
          <DialogTrigger render={<Button size="sm" className="gap-2" />}>
            <Plus className="w-4 h-4" /> Add Driver
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editDriver ? "Edit Driver" : "Register Driver"}</DialogTitle>
            </DialogHeader>
            <DriverForm
              driver={editDriver}
              onSuccess={() => { setDialogOpen(false); setEditDriver(null); fetchDrivers(); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(215 20% 55%)" }} />
          <Input placeholder="Search by name or license..." className="pl-9 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "ALL")}>
          <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="ON_TRIP">On Trip</SelectItem>
            <SelectItem value="OFF_DUTY">Off Duty</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
        <Table className="data-table">
          <TableHeader>
            <TableRow style={{ background: "hsl(var(--secondary))" }}>
              <TableHead>Driver</TableHead>
              <TableHead>License</TableHead>
              <TableHead>License Expiry</TableHead>
              <TableHead>Safety Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Trips</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-12" style={{ color: "hsl(215 20% 50%)" }}>Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <Users className="w-8 h-8 mx-auto mb-2" style={{ color: "hsl(215 20% 40%)" }} />
                  <p className="text-sm" style={{ color: "hsl(215 20% 50%)" }}>No drivers found</p>
                </TableCell>
              </TableRow>
            ) : filtered.map((d) => {
              const expired = isLicenseExpired(d.licenseExpiry);
              const expiringSoon = isLicenseExpiringSoon(d.licenseExpiry);
              const days = daysUntilExpiry(d.licenseExpiry);
              return (
                <TableRow key={d.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{d.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: "hsl(215 20% 55%)" }}>{d.contactNumber}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{d.licenseNumber}</div>
                    <div className="text-xs" style={{ color: "hsl(215 20% 55%)" }}>Cat. {d.licenseCategory}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {(expired || expiringSoon) && (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      )}
                      <div>
                        <div className={`text-sm ${expired ? "text-red-400" : expiringSoon ? "text-amber-400" : ""}`}>
                          {formatDate(d.licenseExpiry)}
                        </div>
                        {days !== null && (
                          <div className="text-xs" style={{ color: "hsl(215 20% 55%)" }}>
                            {expired ? "Expired" : `${days}d left`}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={d.safetyScore} className="w-16 h-1.5" />
                      <span className="text-xs">{d.safetyScore}</span>
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={d.status} /></TableCell>
                  <TableCell className="text-sm">{d._count?.trips ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="w-7 h-7"
                        onClick={() => { setEditDriver(d); setDialogOpen(true); }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger render={<Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" />}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Driver?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove <strong>{d.name}</strong>. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(d.id)} className="bg-destructive text-destructive-foreground">
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
