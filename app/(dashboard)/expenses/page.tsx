"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Receipt, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { motion } from "framer-motion";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] as any } } };

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  vehicle: { name: string; regNumber: string };
}

const CATEGORIES = ["TOLL", "MAINTENANCE", "INSURANCE", "PARKING", "FINE", "OTHER"];
const categoryColors: Record<string, { color: string }> = {
  TOLL:        { color: "var(--sl-teal)" },
  MAINTENANCE: { color: "var(--sl-orange)" },
  INSURANCE:   { color: "var(--sl-navy)" },
  PARKING:     { color: "var(--status-available)" },
  FINE:        { color: "var(--status-retired)" },
  OTHER:       { color: "var(--muted-foreground)" },
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const fetchExpenses = async () => {
    const res = await fetch("/api/expenses");
    setExpenses(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchExpenses(); }, []);

  const filtered = expenses.filter((e) =>
    e.vehicle.name.toLowerCase().includes(search.toLowerCase()) ||
    e.description.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-6 lg:p-8 space-y-8">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Fleet Expenses</h2>
          <p className="text-sm text-muted-foreground">
            Track operational costs, tolls, and miscellaneous fleet expenditures.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap h-11 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-5 h-5 mr-2" /> Log Expense
          </DialogTrigger>
          <DialogContent className="max-w-lg bg-card border-white/10 p-8 rounded-2xl shadow-2xl">
            <DialogHeader className="mb-6"><DialogTitle className="text-2xl font-bold tracking-tight">Record Expense</DialogTitle></DialogHeader>
            <ExpenseForm onSuccess={() => { setCreateOpen(false); fetchExpenses(); }} />
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div variants={item} className="relative max-w-md group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors group-focus-within:text-white text-muted-foreground" />
        <Input 
          placeholder="Search by description, vehicle, or category..." 
          className="pl-11 h-12 rounded-xl bg-card/50 border-white/10 text-white placeholder:text-muted-foreground/50 focus-visible:ring-primary focus-visible:border-primary transition-all"
          value={search} onChange={(e) => setSearch(e.target.value)} 
        />
      </motion.div>

      <motion.div variants={item} className="premium-card overflow-hidden">
        <Table className="data-table">
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="w-[280px]">Vehicle</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="w-[300px]">Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <span className="text-sm font-medium tracking-widest uppercase">Loading Expenses...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell colSpan={5} className="text-center py-24">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-white/5 border border-white/10">
                    <Receipt className="w-7 h-7 text-primary" />
                  </div>
                  <p className="text-base font-semibold text-white">No expenses recorded</p>
                  <p className="text-sm mt-2 text-muted-foreground max-w-xs mx-auto">
                    Start tracking your miscellaneous fleet expenses.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((e) => {
                const colorToken = categoryColors[e.category]?.color || "var(--muted-foreground)";
                return (
                  <TableRow key={e.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-[15px] text-white">{e.vehicle.name}</span>
                        <span className="text-xs font-medium tracking-wide text-muted-foreground">{e.vehicle.regNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span 
                        className="text-[11px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-md border"
                        style={{ 
                          background: `hsl(${colorToken} / 0.1)`, 
                          color: `hsl(${colorToken})`,
                          borderColor: `hsl(${colorToken} / 0.2)`
                        }}
                      >
                        {e.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[13px] text-white/90 line-clamp-2">{e.description}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-white text-[15px]">{formatCurrency(e.amount)}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-[13px] font-medium tracking-wide text-muted-foreground">
                        {formatDate(e.date)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </motion.div>
    </motion.div>
  );
}
