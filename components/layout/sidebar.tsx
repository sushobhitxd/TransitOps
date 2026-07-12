"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard, Truck, Users, Navigation, Wrench,
  Fuel, Receipt, BarChart3, LogOut, ChevronRight, Menu, X, Zap,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/vehicles", icon: Truck, label: "Vehicles" },
  { href: "/drivers", icon: Users, label: "Drivers" },
  { href: "/trips", icon: Navigation, label: "Trips" },
  { href: "/maintenance", icon: Wrench, label: "Maintenance" },
  { href: "/fuel", icon: Fuel, label: "Fuel Logs" },
  { href: "/expenses", icon: Receipt, label: "Expenses" },
  { href: "/reports", icon: BarChart3, label: "Reports" },
];

const roleLabels: Record<string, string> = {
  FLEET_MANAGER: "Fleet Manager",
  DISPATCHER: "Dispatcher",
  SAFETY_OFFICER: "Safety Officer",
  FINANCIAL_ANALYST: "Financial Analyst",
  ADMIN: "Admin",
};

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 flex flex-col sidebar transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: "hsl(var(--border))" }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, hsl(239 84% 67%), hsl(271 91% 65%))" }}>
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm leading-none">TransitOps</div>
            <div className="text-xs mt-0.5" style={{ color: "hsl(215 20% 50%)" }}>Fleet Platform</div>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto lg:hidden" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("sidebar-item", isActive && "active")}
                onClick={onClose}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-3 h-3 opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t" style={{ borderColor: "hsl(var(--border))" }}>
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg"
            style={{ background: "hsl(var(--secondary))" }}>
            <Avatar className="w-8 h-8">
              <AvatarImage src={session?.user?.image ?? ""} />
              <AvatarFallback className="text-xs" style={{ background: "hsl(239 84% 67%)" }}>
                {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{session?.user?.name ?? "User"}</div>
              <div className="text-xs truncate" style={{ color: "hsl(215 20% 50%)" }}>
                {roleLabels[session?.user?.role ?? ""] ?? session?.user?.role}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 flex-shrink-0"
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const pageName = navItems.find(
    (i) => pathname === i.href || (i.href !== "/" && pathname.startsWith(i.href))
  )?.label ?? "Dashboard";

  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 px-6 h-14 border-b page-header-gradient"
      style={{ borderColor: "hsl(var(--border))" }}>
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="w-5 h-5" />
      </Button>
      <h1 className="text-sm font-semibold">{pageName}</h1>
    </header>
  );
}
