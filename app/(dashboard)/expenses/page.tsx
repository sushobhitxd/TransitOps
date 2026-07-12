"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Receipt, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseSchema, type ExpenseInput } from "@/lib/validations";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  vehicle: { name: string; regNumber: string };
  trip?: { source: string; destination: string } | null;
}

interface Vehicle { id: string; name: string; regNumber: string; }

const CATEGORIES = ["TOLL", "MAINTENANCE", "INSURANCE", "PARKING", "FINE", "OTHER"];

function ExpenseForm({ onSuccess }: { onSuccess: () => void }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { category: "OTHER" },
  });

  useEffect(() => {
    fetch("/api/vehicles").then((r) => r.json()).then(setVehicles);
  }, []);

  const onSubmit = async (data: ExpenseInput) => {
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) { toast.success("Expense recorded"); onSuccess(); }
    else { const e = await res.json(); toast.error(e.error ?? "Failed"); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Vehicle *</Label>
        <Select onValueChange={(v) => setValue("vehicleId", v as string)}>
          <SelectTrigger><SelectValue placeholder="Select vehicle..." /></SelectTrigger>
          <SelectContent>
            {vehicles.map((v) => <SelectItem key={v.id} value={v.id}>{v.name} ({v.regNumber})</SelectItem>)}
          </SelectContent>
        </Select>
        {errors.vehicleId && <p className="text-xs text-destructive">{errors.vehicleId.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Category *</Label>
          <Select defaultValue="OTHER" onValueChange={(v) => setValue("category", v as ExpenseInput["category"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Amount (₹) *</Label>
          <Input type="number" step="0.01" {...register("amount", { valueAsNumber: true })} placeholder="500" />
          {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Description *</Label>
        <Textarea {...register("description")} placeholder="NH-48 toll, Parking at warehouse..." rows={2} />
        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Date</Label>
        <Input type="date" {...register("date")} />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Recording...</> : "Record Expense"}
      </Button>
    </form>
  );
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const fetchExpenses = async () => {
    const res = await fetch("/api/expenses");
    setExpenses(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchExpenses(); }, []);

  const filtered = expenses.filter((e) =>
    e.vehicle.name.toLowerCase().includes(search.toLowerCase()) ||
    e.description.toLowerCase().includes(search.toLowerCase())
  );

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryColors: Record<string, string> = {
    TOLL: "hsl(217 91% 60%)",
    MAINTENANCE: "hsl(38 92% 50%)",
    INSURANCE: "hsl(271 91% 65%)",
    PARKING: "hsl(142 71% 45%)",
    FINE: "hsl(0 84% 60%)",
    OTHER: "hsl(215 20% 55%)",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Expenses</h2>
          <p className="text-xs mt-0.5" style={{ color: "hsl(215 20% 55%)" }}>
            {expenses.length} records · {formatCurrency(total)} total
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button size="sm" className="gap-2" />}>
            <Plus className="w-4 h-4" /> Add Expense
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Record Expense</DialogTitle></DialogHeader>
            <ExpenseForm onSuccess={() => { setOpen(false); fetchExpenses(); }} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(215 20% 55%)" }} />
        <Input placeholder="Search expenses..." className="pl-9 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
        <Table className="data-table">
          <TableHeader>
            <TableRow style={{ background: "hsl(var(--secondary))" }}>
              <TableHead>Vehicle</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8" style={{ color: "hsl(215 20% 50%)" }}>Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <Receipt className="w-8 h-8 mx-auto mb-2" style={{ color: "hsl(215 20% 40%)" }} />
                  <p className="text-sm" style={{ color: "hsl(215 20% 50%)" }}>No expenses recorded</p>
                </TableCell>
              </TableRow>
            ) : filtered.map((e) => (
              <TableRow key={e.id}>
                <TableCell>
                  <div className="font-medium text-sm">{e.vehicle.name}</div>
                  <div className="text-xs" style={{ color: "hsl(215 20% 55%)" }}>{e.vehicle.regNumber}</div>
                </TableCell>
                <TableCell>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: `${categoryColors[e.category]}20`, color: categoryColors[e.category], border: `1px solid ${categoryColors[e.category]}40` }}>
                    {e.category}
                  </span>
                </TableCell>
                <TableCell className="text-sm max-w-48 truncate">{e.description}</TableCell>
                <TableCell className="text-sm font-medium">{formatCurrency(e.amount)}</TableCell>
                <TableCell className="text-sm">{formatDate(e.date)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
