"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { completeTripSchema, type CompleteTripInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

interface CompleteTripDialogProps {
  trip: { id: string; source: string; destination: string; plannedDistance: number };
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CompleteTripDialog({ trip, open, onClose, onSuccess }: CompleteTripDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompleteTripInput>({
    resolver: zodResolver(completeTripSchema) as any,
    defaultValues: { actualDistance: trip.plannedDistance },
  });

  const onSubmit = async (data: CompleteTripInput) => {
    const res = await fetch(`/api/trips/${trip.id}/complete`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      toast.success("Trip completed! Vehicle and driver are now available.");
      onSuccess();
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Failed to complete trip");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Complete Trip
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm" style={{ color: "hsl(215 20% 60%)" }}>
          {trip.source} → {trip.destination}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Actual Distance (km) *</Label>
            <Input type="number" step="0.1" {...register("actualDistance", { valueAsNumber: true })} />
            {errors.actualDistance && <p className="text-xs text-destructive">{errors.actualDistance.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Fuel Consumed (liters) *</Label>
            <Input type="number" step="0.1" {...register("fuelConsumed", { valueAsNumber: true })} placeholder="45.5" />
            {errors.fuelConsumed && <p className="text-xs text-destructive">{errors.fuelConsumed.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Final Revenue (₹)</Label>
            <Input type="number" {...register("revenue", { valueAsNumber: true })} placeholder="5000" />
          </div>

          <div className="space-y-1.5">
            <Label>Completion Notes</Label>
            <Textarea {...register("notes")} placeholder="Any notes about the trip..." rows={2} />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Completing...</>
              ) : "Complete Trip"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
