"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tripSchema, type TripInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";

interface Vehicle {
  id: string; name: string; regNumber: string; maxLoad: number; status: string;
}
interface Driver {
  id: string; name: string; licenseNumber: string; licenseExpiry: string; status: string; safetyScore: number;
}

export function TripForm({ onSuccess }: { onSuccess: () => void }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [cargoWarning, setCargoWarning] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TripInput>({
    resolver: zodResolver(tripSchema) as any,
    defaultValues: { revenue: 0 },
  });

  useEffect(() => {
    fetch("/api/vehicles?status=AVAILABLE").then((r) => r.json()).then(setVehicles);
    fetch("/api/drivers?status=AVAILABLE").then((r) => r.json()).then(setDrivers);
  }, []);

  const selectedVehicleId = watch("vehicleId");
  const cargoWeight = watch("cargoWeight");

  useEffect(() => {
    if (selectedVehicleId && cargoWeight) {
      const vehicle = vehicles.find((v) => v.id === selectedVehicleId);
      if (vehicle && cargoWeight > vehicle.maxLoad) {
        setCargoWarning(`⚠️ Cargo weight (${cargoWeight} kg) exceeds max load (${vehicle.maxLoad} kg)`);
      } else {
        setCargoWarning("");
      }
    }
  }, [selectedVehicleId, cargoWeight, vehicles]);

  const onSubmit = async (data: TripInput) => {
    const res = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      toast.success("Trip created successfully");
      onSuccess();
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Failed to create trip");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Source *</Label>
          <Input {...register("source")} placeholder="Mumbai" />
          {errors.source && <p className="text-xs text-destructive">{errors.source.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Destination *</Label>
          <Input {...register("destination")} placeholder="Pune" />
          {errors.destination && <p className="text-xs text-destructive">{errors.destination.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Vehicle * (Available only)</Label>
        <Select onValueChange={(v) => setValue("vehicleId", v as string)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a vehicle..." />
          </SelectTrigger>
          <SelectContent>
            {vehicles.length === 0 ? (
              <SelectItem value="_none" disabled>No available vehicles</SelectItem>
            ) : vehicles.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.name} ({v.regNumber}) — Max: {v.maxLoad} kg
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.vehicleId && <p className="text-xs text-destructive">{errors.vehicleId.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Driver * (Available only)</Label>
        <Select onValueChange={(v) => setValue("driverId", v as string)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a driver..." />
          </SelectTrigger>
          <SelectContent>
            {drivers.length === 0 ? (
              <SelectItem value="_none" disabled>No available drivers</SelectItem>
            ) : drivers.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name} — {d.licenseNumber}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.driverId && <p className="text-xs text-destructive">{errors.driverId.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Cargo Weight (kg) *</Label>
          <Input type="number" step="0.1" {...register("cargoWeight", { valueAsNumber: true })} placeholder="450" />
          {errors.cargoWeight && <p className="text-xs text-destructive">{errors.cargoWeight.message}</p>}
          {cargoWarning && (
            <div className="flex items-center gap-1.5 text-xs text-amber-400">
              <AlertCircle className="w-3 h-3" />
              {cargoWarning}
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Planned Distance (km) *</Label>
          <Input type="number" step="0.1" {...register("plannedDistance", { valueAsNumber: true })} placeholder="150" />
          {errors.plannedDistance && <p className="text-xs text-destructive">{errors.plannedDistance.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Expected Revenue (₹)</Label>
        <Input type="number" {...register("revenue", { valueAsNumber: true })} placeholder="5000" />
      </div>

      <div className="space-y-1.5">
        <Label>Notes</Label>
        <Textarea {...register("notes")} placeholder="Trip notes..." rows={2} />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
        ) : "Create Trip"}
      </Button>
    </form>
  );
}
