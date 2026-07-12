"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard, Truck, Users, Navigation, Wrench,
  Fuel, Receipt, BarChart3, LogOut, ChevronRight, Menu, X, Link as LinkIcon, ShieldCheck
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/vehicles", icon: Truck, label: "Fleet" },
  { href: "/drivers", icon: Users, label: "Drivers" },
  { href: "/trips", icon: Navigation, label: "Trips" },
  { href: "/maintenance", icon: Wrench, label: "Maintenance" },
  { href: "/fuel", icon: Fuel, label: "Fuel Logs" },
  { href: "/expenses", icon: Receipt, label: "Expenses" },
  { href: "/reports", icon: BarChart3, label: "Analytics" },
  { href: "/team", icon: ShieldCheck, label: "Team", roles: ["ADMIN"] },
];

const roleLabels: Record<string, string> = {
  FLEET_MANAGER: "Fleet Manager",
  DISPATCHER: "Dispatcher",
  SAFETY_OFFICER: "Safety Officer",
  FINANCIAL_ANALYST: "Financial Analyst",
  ADMIN: "Administrator",
};

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[280px] flex flex-col sidebar transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] shadow-2xl shadow-black/50",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
          <Logo className="[&_span.text-foreground]:text-white" />
          <Button variant="ghost" size="icon" className="ml-auto lg:hidden text-muted-foreground hover:text-white" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {navItems.map((navItem) => {
            if (navItem.roles && (!session?.user?.role || !navItem.roles.includes(session.user.role as string))) {
              return null;
            }
            const isActive = pathname === navItem.href || (navItem.href !== "/" && pathname.startsWith(navItem.href));
            return (
              <Link
                key={navItem.href}
                href={navItem.href}
                className={cn("sidebar-item group", isActive && "active")}
                onClick={onClose}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                  isActive ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground group-hover:bg-white/10 group-hover:text-white"
                )}>
                  <navItem.icon className="w-4 h-4" />
                </div>
                <span className={cn("flex-1 text-[13px] tracking-wide", isActive ? "text-white" : "group-hover:text-white")}>
                  {navItem.label}
                </span>
                {isActive && <ChevronRight className="w-4 h-4 opacity-100 text-primary" />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/5 bg-gradient-to-t from-black/20 to-transparent">
          <div className="flex items-center gap-3 px-3 py-3 rounded-[14px] bg-white/5 border border-white/5 transition-all hover:bg-white/10">
            <Avatar className="w-10 h-10 border border-white/10 shadow-sm">
              <AvatarImage src={session?.user?.image ?? ""} />
              <AvatarFallback className="text-xs font-bold text-primary-foreground" style={{ background: "linear-gradient(135deg, hsl(var(--sl-orange)), hsl(var(--sl-peach)))" }}>
                {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-white truncate">{session?.user?.name ?? "User"}</div>
              <div className="text-[11px] truncate mt-0.5 tracking-wide" style={{ color: "hsl(var(--sl-sand))" }}>
                {roleLabels[session?.user?.role ?? ""] ?? session?.user?.role}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 flex-shrink-0 text-muted-foreground hover:text-white hover:bg-white/10"
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
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
    <header className="sticky top-0 z-20 flex items-center justify-between px-8 h-20 bg-background/80 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center gap-5">
        <Button variant="ghost" size="icon" className="lg:hidden text-muted-foreground hover:text-white" onClick={onMenuClick}>
          <Menu className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold tracking-tight text-white">{pageName}</h1>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
      </div>
    </header>
  );
}
