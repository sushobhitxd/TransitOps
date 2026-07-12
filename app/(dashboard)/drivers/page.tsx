"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Users, ShieldAlert, Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/utils";
import { DriverForm } from "@/components/drivers/driver-form";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] } }
};

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiry: string;
  contactNumber: string;
  safetyScore: number;
  status: string;
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const fetchDrivers = async () => {
    const res = await fetch("/api/drivers");
    setDrivers(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const filtered = drivers.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.licenseNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-6 lg:p-8 space-y-8">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Driver Personnel</h2>
          <p className="text-sm text-muted-foreground">
            Manage your driving staff, monitor safety scores, and track license validities.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap h-11 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-5 h-5 mr-2" /> Add Driver
          </DialogTrigger>
          <DialogContent className="max-w-lg bg-card border-white/10 p-8 rounded-2xl shadow-2xl">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold tracking-tight">Onboard Driver</DialogTitle>
            </DialogHeader>
            <DriverForm onSuccess={() => { setCreateOpen(false); fetchDrivers(); }} />
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div variants={item} className="relative max-w-md group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors group-focus-within:text-white text-muted-foreground" />
        <Input 
          placeholder="Search by name or license..." 
          className="pl-11 h-12 rounded-xl bg-card/50 border-white/10 text-white placeholder:text-muted-foreground/50 focus-visible:ring-primary focus-visible:border-primary transition-all"
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
      </motion.div>

      <motion.div variants={item} className="premium-card overflow-hidden">
        <Table className="data-table">
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="w-[300px]">Driver</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>License Info</TableHead>
              <TableHead>Safety Score</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <span className="text-sm font-medium tracking-widest uppercase">Loading Roster...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell colSpan={5} className="text-center py-24">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-white/5 border border-white/10">
                    <Users className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="text-base font-semibold text-white">No drivers found</p>
                  <p className="text-sm mt-2 text-muted-foreground max-w-xs mx-auto">
                    No drivers match your current search criteria.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((d) => {
                const isExpired = new Date(d.licenseExpiry) < new Date();
                const scoreColor = d.safetyScore >= 90 ? "text-status-available" : d.safetyScore >= 70 ? "text-status-in-shop" : "text-status-retired";
                
                return (
                  <TableRow key={d.id} className="border-white/5 hover:bg-white/5 transition-colors group cursor-pointer">
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Avatar className="w-10 h-10 border border-white/10 rounded-xl">
                          <AvatarFallback className="bg-white/5 text-primary text-sm font-bold rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            {d.name.split(' ').map(n => n[0]).join('').substring(0,2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-bold text-white text-[15px] truncate">{d.name}</p>
                          <p className="text-xs font-medium tracking-wide text-muted-foreground mt-0.5">ID: {d.id.substring(0,8)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-white/90">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-medium">{d.contactNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold tracking-wide px-2 py-0.5 rounded border border-white/10 bg-white/5 text-white/90">
                            {d.licenseCategory}
                          </span>
                          <span className="text-sm font-medium text-white/90">{d.licenseNumber}</span>
                        </div>
                        <div className={`text-xs font-medium flex items-center gap-1.5 ${isExpired ? "text-status-retired" : "text-muted-foreground"}`}>
                          {isExpired && <ShieldAlert className="w-3.5 h-3.5" />}
                          Expires {formatDate(d.licenseExpiry)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 relative flex items-center justify-center">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-white/10"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none" stroke="currentColor" strokeWidth="3"
                            />
                            <path
                              className={scoreColor}
                              strokeDasharray={`${d.safetyScore}, 100`}
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none" stroke="currentColor" strokeWidth="3"
                            />
                          </svg>
                          <span className={`absolute text-[11px] font-bold ${scoreColor}`}>{d.safetyScore}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <StatusBadge status={d.status} />
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
