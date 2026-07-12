"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Globe, Lock, Mail, Loader2, Link as LinkIcon,
  PackageSearch, Activity, ShieldCheck, Map
} from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/logo";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Invalid email or password");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch {
      toast.error("Google sign-in failed");
      setGoogleLoading(false);
    }
  };

  const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] } }
  };

  return (
    <div className="min-h-screen flex bg-background selection:bg-primary/30 selection:text-white">
      {/* ─── LEFT PANEL: Brand Showcase ─── */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] relative overflow-hidden bg-card">
        {/* Abstract Supply Link Branding Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full animate-pulse-ring"
            style={{ background: "radial-gradient(circle, hsl(var(--sl-teal) / 0.15), transparent 70%)" }} />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full animate-float-delayed"
            style={{ background: "radial-gradient(circle, hsl(var(--sl-orange) / 0.1), transparent 70%)" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[200px] -rotate-45"
            style={{ background: "linear-gradient(90deg, transparent, hsl(var(--sl-sand) / 0.03), transparent)" }} />
        </div>

        {/* Content Wrapper */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-20 w-full h-full">
          
          <motion.div initial="hidden" animate="show" variants={stagger} className="flex items-center gap-4">
            <motion.div variants={fadeUp}>
              <Logo className="scale-125 origin-left [&_span.text-foreground]:text-white" />
            </motion.div>
          </motion.div>

          <motion.div initial="hidden" animate="show" variants={stagger} className="my-auto py-12 max-w-2xl">
            <motion.p variants={fadeUp} className="text-sm font-semibold tracking-[0.2em] uppercase mb-6"
              style={{ color: "hsl(var(--sl-orange))" }}>
              Global Solutions for Optimized Supply Chains
            </motion.p>
            <motion.h1 variants={fadeUp} className="text-5xl xl:text-7xl font-bold text-white leading-[1.1] mb-8 tracking-tight">
              Smart Logistics<br />
              <span style={{ color: "hsl(var(--sl-sand))" }}>for your business.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg leading-relaxed max-w-lg mb-12"
              style={{ color: "hsl(var(--muted-foreground))" }}>
              SupplyLink provides global logistics solutions, helping businesses worldwide optimize their supply chains with real-time tracking and seamless integration.
            </motion.p>

            <motion.div variants={stagger} className="grid grid-cols-2 gap-4">
              {[
                { icon: PackageSearch, title: "Asset Tracking" },
                { icon: Map, title: "Intelligent Routing" },
                { icon: Activity, title: "Live Analytics" },
                { icon: ShieldCheck, title: "Compliance" },
              ].map((f) => (
                <motion.div key={f.title} variants={fadeUp} className="flex items-center gap-4 p-4 rounded-2xl glass-overlay border border-white/5 transition-all hover:bg-white/5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5">
                    <f.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-white tracking-wide">{f.title}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Footer content removed per user request */}
        </div>
      </div>

      {/* ─── RIGHT PANEL: Form ─── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-background">
        
        {/* Subtle background glow for right side */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.03] pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent 60%)" }} />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          className="w-full max-w-[420px] relative z-10"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-12 lg:hidden">
            <Logo />
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-2 text-white">Sign In</h2>
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              Secure access to your enterprise dashboard
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full h-12 text-sm font-semibold rounded-xl bg-card hover:bg-card/80 border-white/10 text-white transition-all hover:border-white/20 mb-8"
            onClick={handleGoogle}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 mr-3 animate-spin" />
            ) : (
              <Globe className="w-4 h-4 mr-3 text-muted-foreground" />
            )}
            Continue with Single Sign-On
          </Button>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
            <div className="relative flex justify-center">
              <span className="px-4 text-xs font-medium uppercase tracking-widest bg-background" style={{ color: "hsl(var(--muted-foreground))" }}>
                Corporate Login
              </span>
            </div>
          </div>

          <form onSubmit={handleCredentials} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Work Email</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors group-focus-within:text-white"
                  style={{ color: "hsl(var(--muted-foreground))" }} />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@supplylink.com"
                  className="pl-11 h-12 rounded-xl bg-card border-white/10 text-white placeholder:text-muted-foreground/50 focus-visible:ring-primary focus-visible:border-primary transition-all"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors group-focus-within:text-white"
                  style={{ color: "hsl(var(--muted-foreground))" }} />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-11 h-12 rounded-xl bg-card border-white/10 text-white placeholder:text-muted-foreground/50 focus-visible:ring-primary focus-visible:border-primary transition-all"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-sm font-bold rounded-xl mt-4 shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:-translate-y-0.5"
              disabled={loading}
              style={{
                background: loading ? undefined : "linear-gradient(135deg, hsl(var(--sl-orange)), hsl(var(--sl-peach)))",
                color: "hsl(0 0% 10%)"
              }}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Authenticating...</>
              ) : (
                "Access Dashboard"
              )}
            </Button>
          </form>

          {/* Quick Access Demo */}
          <div className="mt-12">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>
              Demo Environments
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { email: "admin@demo.com", label: "Admin" },
                { email: "fleet@demo.com", label: "Fleet" },
                { email: "dispatch@demo.com", label: "Dispatch" },
                { email: "safety@demo.com", label: "Safety" },
              ].map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  className="flex flex-col items-start p-3 rounded-xl bg-card/50 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all text-left group"
                  onClick={() => setForm({ email: acc.email, password: "demo1234" })}
                >
                  <span className="text-xs font-bold text-white group-hover:text-primary transition-colors">{acc.label}</span>
                  <span className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>{acc.email}</span>
                </button>
              ))}
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
