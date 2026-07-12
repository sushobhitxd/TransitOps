"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { closeMaintenanceSchema } from "@/lib/validations";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

interface CloseMaintenanceDialogProps {
  log: { id: string; type: string; vehicle: { name: string; regNumber: string } };
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type FormValues = z.infer<typeof closeMaintenanceSchema>;

export function CloseMaintenanceDialog({ log, open, onClose, onSuccess }: CloseMaintenanceDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(closeMaintenanceSchema) as any,
    defaultValues: { cost: 0 },
  });

  const onSubmit = async (data: FormValues) => {
    const res = await fetch(`/api/maintenance/${log.id}/close`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      toast.success("Maintenance closed. Vehicle is now Available.");
      onSuccess();
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Failed to close maintenance");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Close Maintenance
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm" style={{ color: "hsl(215 20% 60%)" }}>
          {log.type} — {log.vehicle.name} ({log.vehicle.regNumber})
        </p>

        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Final Cost (₹) *</Label>
            <Input type="number" step="0.01" {...register("cost", { valueAsNumber: true })} placeholder="2500" />
            {errors.cost && <p className="text-xs text-destructive">{errors.cost.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>End Date</Label>
            <Input type="date" {...register("endDate")} />
          </div>

          <div className="space-y-1.5">
            <Label>Closing Notes</Label>
            <Textarea {...register("notes")} placeholder="Work completed, parts replaced..." rows={2} />
          </div>

          <div className="p-3 rounded-lg text-xs" style={{ background: "hsl(142 71% 45% / 0.1)", border: "1px solid hsl(142 71% 45% / 0.2)", color: "hsl(142 71% 55%)" }}>
            ✓ Closing this record will restore the vehicle to <strong>Available</strong> status (unless retired).
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Closing...</> : "Close Maintenance"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
