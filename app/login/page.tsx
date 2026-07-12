"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Truck, Globe, Lock, Mail, Loader2 } from "lucide-react";

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

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, hsl(239 84% 20%) 0%, hsl(222 47% 8%) 50%, hsl(271 70% 20%) 100%)"
        }}
      >
        {/* Decorative circles */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full opacity-10"
          style={{ background: "hsl(239 84% 67%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full opacity-10"
          style={{ background: "hsl(271 91% 65%)", filter: "blur(60px)" }} />

        <div className="relative z-10 flex flex-col justify-center p-16">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "hsl(239 84% 67%)" }}>
              <Truck className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">TransitOps</span>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Smart Transport<br />
            <span style={{ color: "hsl(239 84% 80%)" }}>Operations Platform</span>
          </h1>
          <p className="text-lg mb-10" style={{ color: "hsl(215 20% 70%)" }}>
            Manage your entire fleet lifecycle — from vehicle registration and driver management to dispatch, maintenance, and analytics.
          </p>

          <div className="space-y-4">
            {[
              { icon: "🚛", text: "Real-time fleet tracking & status" },
              { icon: "👨‍✈️", text: "Driver compliance & license monitoring" },
              { icon: "📊", text: "Operational cost & ROI analytics" },
              { icon: "🔧", text: "Automated maintenance workflows" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span style={{ color: "hsl(215 20% 75%)" }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-8"
        style={{ background: "hsl(222 47% 8%)" }}>
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "hsl(239 84% 67%)" }}>
              <Truck className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">TransitOps</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
            <p style={{ color: "hsl(215 20% 55%)" }}>Sign in to your account to continue</p>
          </div>

          {/* Google OAuth */}
          <Button
            variant="outline"
            className="w-full mb-6 h-11"
            onClick={handleGoogle}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Globe className="w-4 h-4 mr-2" />
            )}
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: "hsl(var(--border))" }} />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3" style={{ background: "hsl(222 47% 8%)", color: "hsl(215 20% 55%)" }}>
                or continue with email
              </span>
            </div>
          </div>

          {/* Credentials form */}
          <form onSubmit={handleCredentials} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "hsl(215 20% 55%)" }} />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  className="pl-10 h-11"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "hsl(215 20% 55%)" }} />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-11"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 rounded-lg" style={{ background: "hsl(239 84% 67% / 0.08)", border: "1px solid hsl(239 84% 67% / 0.2)" }}>
            <p className="text-xs font-medium mb-2" style={{ color: "hsl(239 84% 80%)" }}>Demo Accounts</p>
            <div className="space-y-1">
              {[
                { email: "fleet@demo.com", role: "Fleet Manager" },
                { email: "dispatch@demo.com", role: "Dispatcher" },
                { email: "safety@demo.com", role: "Safety Officer" },
                { email: "finance@demo.com", role: "Financial Analyst" },
              ].map((acc) => (
                <div key={acc.email} className="flex justify-between text-xs"
                  style={{ color: "hsl(215 20% 65%)" }}>
                  <span>{acc.email}</span>
                  <span style={{ color: "hsl(239 84% 75%)" }}>{acc.role}</span>
                </div>
              ))}
            </div>
            <p className="text-xs mt-2" style={{ color: "hsl(215 20% 50%)" }}>
              Password: <code className="text-xs" style={{ color: "hsl(239 84% 80%)" }}>demo1234</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
