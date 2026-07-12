"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vehicleSchema, type VehicleInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface VehicleFormProps {
  vehicle?: Partial<VehicleInput & { id: string }> | null;
  onSuccess: () => void;
}

export function VehicleForm({ vehicle, onSuccess }: VehicleFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VehicleInput>({
    resolver: zodResolver(vehicleSchema) as any,
    defaultValues: vehicle
      ? {
          regNumber: vehicle.regNumber ?? "",
          name: vehicle.name ?? "",
          type: (vehicle.type as VehicleInput["type"]) ?? "TRUCK",
          maxLoad: vehicle.maxLoad ?? 0,
          odometer: vehicle.odometer ?? 0,
          acquisitionCost: vehicle.acquisitionCost ?? 0,
          region: vehicle.region ?? "",
          make: vehicle.make ?? "",
          notes: vehicle.notes ?? "",
        }
      : { type: "TRUCK", maxLoad: 0, odometer: 0, acquisitionCost: 0 },
  });

  const onSubmit = async (data: VehicleInput) => {
    const url = vehicle?.id ? `/api/vehicles/${vehicle.id}` : "/api/vehicles";
    const method = vehicle?.id ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      toast.success(vehicle?.id ? "Vehicle updated" : "Vehicle registered");
      onSuccess();
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Registration Number *</Label>
          <Input {...register("regNumber")} placeholder="MH-01-AB-1234" />
          {errors.regNumber && <p className="text-xs text-destructive">{errors.regNumber.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Vehicle Name/Model *</Label>
          <Input {...register("name")} placeholder="Tata Ace 2023" />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Type *</Label>
          <Select value={watch("type")} onValueChange={(v) => setValue("type", v as VehicleInput["type"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["TRUCK", "VAN", "CAR", "MOTORCYCLE", "BUS", "TRAILER", "OTHER"].map((t) => (
                <SelectItem key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Max Load Capacity (kg) *</Label>
          <Input type="number" {...register("maxLoad", { valueAsNumber: true })} placeholder="1000" />
          {errors.maxLoad && <p className="text-xs text-destructive">{errors.maxLoad.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Odometer (km)</Label>
          <Input type="number" {...register("odometer", { valueAsNumber: true })} placeholder="0" />
        </div>
        <div className="space-y-1.5">
          <Label>Acquisition Cost (₹)</Label>
          <Input type="number" {...register("acquisitionCost", { valueAsNumber: true })} placeholder="500000" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Make/Brand</Label>
          <Input {...register("make")} placeholder="Tata, Mahindra..." />
        </div>
        <div className="space-y-1.5">
          <Label>Region</Label>
          <Input {...register("region")} placeholder="North, South, Mumbai..." />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Notes</Label>
        <Textarea {...register("notes")} placeholder="Any additional notes..." rows={2} />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
        ) : (
          vehicle?.id ? "Update Vehicle" : "Register Vehicle"
        )}
      </Button>
    </form>
  );
}
