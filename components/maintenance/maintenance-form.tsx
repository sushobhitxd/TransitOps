"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { maintenanceSchema } from "@/lib/validations";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Vehicle {
  id: string; name: string; regNumber: string; status: string;
}

const MAINTENANCE_TYPES = [
  "Oil Change", "Tire Rotation", "Brake Service", "Engine Repair",
  "Transmission Service", "Coolant Flush", "Air Filter", "Inspection",
  "Electrical Repair", "Body Work", "Other",
];

type FormValues = z.infer<typeof maintenanceSchema>;

export function MaintenanceForm({ onSuccess }: { onSuccess: () => void }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(maintenanceSchema) as any,
    defaultValues: { cost: 0 },
  });

  useEffect(() => {
    fetch("/api/vehicles")
      .then((r) => r.json())
      .then((data) => setVehicles(data.filter((v: Vehicle) => v.status !== "ON_TRIP")));
  }, []);

  const onSubmit = async (data: FormValues) => {
    const res = await fetch("/api/maintenance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      toast.success("Maintenance record created. Vehicle is now In Shop.");
      onSuccess();
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Failed to create maintenance record");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Vehicle *</Label>
        <Select onValueChange={(v) => setValue("vehicleId", v as string)}>
          <SelectTrigger>
            <SelectValue placeholder="Select vehicle..." />
          </SelectTrigger>
          <SelectContent>
            {vehicles.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.name} ({v.regNumber}) — {v.status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.vehicleId && <p className="text-xs text-destructive">{errors.vehicleId.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Maintenance Type *</Label>
          <Select onValueChange={(v) => setValue("type", v as string)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent>
              {MAINTENANCE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Estimated Cost (₹)</Label>
          <Input type="number" {...register("cost", { valueAsNumber: true })} placeholder="0" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Description *</Label>
        <Textarea {...register("description")} placeholder="Describe the maintenance work..." rows={2} />
        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Technician Name</Label>
          <Input {...register("technicianName")} placeholder="John Singh" />
        </div>
        <div className="space-y-1.5">
          <Label>Start Date</Label>
          <Input type="date" {...register("startDate")} />
        </div>
      </div>

      <div className="p-3 rounded-lg text-xs" style={{ background: "hsl(38 92% 50% / 0.1)", border: "1px solid hsl(38 92% 50% / 0.2)", color: "hsl(38 92% 60%)" }}>
        ⚠️ Creating this record will automatically set the vehicle status to <strong>In Shop</strong> and remove it from dispatch selection.
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
        ) : "Create Maintenance Record"}
      </Button>
    </form>
  );
}
