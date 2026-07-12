"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Navigation, MapPin, User, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatNumber, formatCurrency } from "@/lib/utils";
import { TripForm } from "@/components/trips/trip-form";
import { CompleteTripDialog } from "@/components/trips/complete-trip-dialog";

interface Trip {
  id: string;
  source: string;
  destination: string;
  status: string;
  cargoWeight: number;
  plannedDistance: number;
  actualDistance?: number;
  fuelConsumed?: number;
  revenue?: number;
  createdAt: string;
  dispatchedAt?: string;
  completedAt?: string;
  vehicle: { id: string; name: string; regNumber: string; type: string };
  driver: { id: string; name: string; licenseNumber: string };
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [completeTrip, setCompleteTrip] = useState<Trip | null>(null);

  const fetchTrips = async () => {
    const res = await fetch("/api/trips");
    const data = await res.json();
    setTrips(data);
    setLoading(false);
  };

  useEffect(() => { fetchTrips(); }, []);

  const handleAction = async (id: string, action: "dispatch" | "cancel") => {
    const res = await fetch(`/api/trips/${id}/${action}`, { method: "PATCH" });
    if (res.ok) {
      toast.success(action === "dispatch" ? "Trip dispatched!" : "Trip cancelled");
      fetchTrips();
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Action failed");
    }
  };

  const grouped = {
    DRAFT: trips.filter((t) => t.status === "DRAFT"),
    DISPATCHED: trips.filter((t) => t.status === "DISPATCHED"),
    COMPLETED: trips.filter((t) => t.status === "COMPLETED"),
    CANCELLED: trips.filter((t) => t.status === "CANCELLED"),
  };

  const TripCard = ({ trip }: { trip: Trip }) => (
    <div className="rounded-xl border p-4 space-y-3 transition-colors hover:border-primary/30"
      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "hsl(239 84% 67% / 0.15)" }}>
            <Navigation className="w-4 h-4" style={{ color: "hsl(239 84% 70%)" }} />
          </div>
          <div>
            <div className="font-medium text-sm flex items-center gap-1.5">
              <MapPin className="w-3 h-3 opacity-50" />
              {trip.source}
              <span style={{ color: "hsl(215 20% 50%)" }}>→</span>
              {trip.destination}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "hsl(215 20% 55%)" }}>
              {formatDate(trip.createdAt)}
            </div>
          </div>
        </div>
        <StatusBadge status={trip.status} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5" style={{ color: "hsl(215 20% 60%)" }}>
          <Truck className="w-3 h-3" />
          {trip.vehicle.name} ({trip.vehicle.regNumber})
        </div>
        <div className="flex items-center gap-1.5" style={{ color: "hsl(215 20% 60%)" }}>
          <User className="w-3 h-3" />
          {trip.driver.name}
        </div>
        <div style={{ color: "hsl(215 20% 60%)" }}>
          <span className="text-foreground font-medium">{formatNumber(trip.cargoWeight, 0)} kg</span> cargo
        </div>
        <div style={{ color: "hsl(215 20% 60%)" }}>
          <span className="text-foreground font-medium">{formatNumber(trip.plannedDistance, 0)} km</span> planned
        </div>
        {trip.actualDistance && (
          <div style={{ color: "hsl(215 20% 60%)" }}>
            <span className="text-foreground font-medium">{formatNumber(trip.actualDistance, 0)} km</span> actual
          </div>
        )}
        {trip.fuelConsumed && (
          <div style={{ color: "hsl(215 20% 60%)" }}>
            <span className="text-foreground font-medium">{formatNumber(trip.fuelConsumed, 1)} L</span> fuel
          </div>
        )}
      </div>

      {/* Actions */}
      {trip.status === "DRAFT" && (
        <div className="flex gap-2 pt-1">
          <Button size="sm" className="flex-1 h-7 text-xs" onClick={() => handleAction(trip.id, "dispatch")}>
            Dispatch
          </Button>
          <Button size="sm" variant="outline" className="flex-1 h-7 text-xs"
            onClick={() => handleAction(trip.id, "cancel")}>
            Cancel
          </Button>
        </div>
      )}
      {trip.status === "DISPATCHED" && (
        <div className="flex gap-2 pt-1">
          <Button size="sm" className="flex-1 h-7 text-xs" onClick={() => setCompleteTrip(trip)}>
            Complete Trip
          </Button>
          <Button size="sm" variant="outline" className="flex-1 h-7 text-xs"
            onClick={() => handleAction(trip.id, "cancel")}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Trip Management</h2>
          <p className="text-xs mt-0.5" style={{ color: "hsl(215 20% 55%)" }}>
            {trips.length} total trips
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger render={<Button size="sm" className="gap-2" />}>
            <Plus className="w-4 h-4" /> Create Trip
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Trip</DialogTitle>
            </DialogHeader>
            <TripForm onSuccess={() => { setCreateOpen(false); fetchTrips(); }} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="DRAFT">
        <TabsList>
          <TabsTrigger value="DRAFT">Draft ({grouped.DRAFT.length})</TabsTrigger>
          <TabsTrigger value="DISPATCHED">Dispatched ({grouped.DISPATCHED.length})</TabsTrigger>
          <TabsTrigger value="COMPLETED">Completed ({grouped.COMPLETED.length})</TabsTrigger>
          <TabsTrigger value="CANCELLED">Cancelled ({grouped.CANCELLED.length})</TabsTrigger>
        </TabsList>

        {(["DRAFT", "DISPATCHED", "COMPLETED", "CANCELLED"] as const).map((status) => (
          <TabsContent key={status} value={status} className="mt-4">
            {loading ? (
              <p className="text-center py-12" style={{ color: "hsl(215 20% 50%)" }}>Loading...</p>
            ) : grouped[status].length === 0 ? (
              <div className="text-center py-16">
                <Navigation className="w-10 h-10 mx-auto mb-3" style={{ color: "hsl(215 20% 35%)" }} />
                <p className="text-sm" style={{ color: "hsl(215 20% 50%)" }}>No {status.toLowerCase()} trips</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {grouped[status].map((trip) => <TripCard key={trip.id} trip={trip} />)}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Complete Trip Dialog */}
      {completeTrip && (
        <CompleteTripDialog
          trip={completeTrip}
          open={!!completeTrip}
          onClose={() => setCompleteTrip(null)}
          onSuccess={() => { setCompleteTrip(null); fetchTrips(); }}
        />
      )}
    </div>
  );
}
