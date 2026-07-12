"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function FuelForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Dummy submit for hackathon
    setTimeout(() => {
      setLoading(false);
      toast.success("Fuel logged successfully");
      onSuccess();
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Vehicle Registration</label>
        <Input required placeholder="Enter vehicle reg..." className="bg-white/5 border-white/10 text-white" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Liters</label>
        <Input required type="number" step="0.1" placeholder="0.0" className="bg-white/5 border-white/10 text-white" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Cost (Total)</label>
        <Input required type="number" step="0.01" placeholder="0.00" className="bg-white/5 border-white/10 text-white" />
      </div>
      <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl mt-4">
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Fuel Log"}
      </Button>
    </form>
  );
}
