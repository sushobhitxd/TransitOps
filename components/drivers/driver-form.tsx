"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { driverSchema, type DriverInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface DriverFormProps {
  driver?: (Partial<DriverInput> & { id?: string }) | null;
  onSuccess: () => void;
}

export function DriverForm({ driver, onSuccess }: DriverFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DriverInput>({
    resolver: zodResolver(driverSchema) as any,
    defaultValues: driver
      ? {
          name: driver.name ?? "",
          licenseNumber: driver.licenseNumber ?? "",
          licenseCategory: driver.licenseCategory ?? "B",
          licenseExpiry: driver.licenseExpiry
            ? format(new Date(driver.licenseExpiry as string), "yyyy-MM-dd")
            : "",
          contactNumber: driver.contactNumber ?? "",
          email: driver.email ?? "",
          safetyScore: driver.safetyScore ?? 100,
          notes: driver.notes ?? "",
        }
      : { licenseCategory: "B", safetyScore: 100 },
  });

  const onSubmit = async (data: DriverInput) => {
    const url = (driver as { id?: string })?.id ? `/api/drivers/${(driver as { id?: string }).id}` : "/api/drivers";
    const method = (driver as { id?: string })?.id ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      toast.success((driver as { id?: string })?.id ? "Driver updated" : "Driver registered");
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
          <Label>Full Name *</Label>
          <Input {...register("name")} placeholder="Alex Johnson" />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Contact Number *</Label>
          <Input {...register("contactNumber")} placeholder="+91 98765 43210" />
          {errors.contactNumber && <p className="text-xs text-destructive">{errors.contactNumber.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Email (optional)</Label>
        <Input {...register("email")} type="email" placeholder="alex@example.com" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>License Number *</Label>
          <Input {...register("licenseNumber")} placeholder="MH-0120230012345" />
          {errors.licenseNumber && <p className="text-xs text-destructive">{errors.licenseNumber.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>License Category *</Label>
          <Input {...register("licenseCategory")} placeholder="B, C, D, EC..." />
          {errors.licenseCategory && <p className="text-xs text-destructive">{errors.licenseCategory.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>License Expiry Date *</Label>
          <Input type="date" {...register("licenseExpiry")} />
          {errors.licenseExpiry && <p className="text-xs text-destructive">{errors.licenseExpiry.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Safety Score (0-100)</Label>
          <Input type="number" min={0} max={100} {...register("safetyScore", { valueAsNumber: true })} />
          {errors.safetyScore && <p className="text-xs text-destructive">{errors.safetyScore.message}</p>}
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
          (driver as { id?: string })?.id ? "Update Driver" : "Register Driver"
        )}
      </Button>
    </form>
  );
}
