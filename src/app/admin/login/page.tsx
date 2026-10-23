"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BRAND_NAME } from "@/lib/config/brand";
import { ShieldCheck, Lock, Mail, ArrowRight, RotateCw, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@trucktrust.in");
  const [password, setPassword] = useState("TruckTrust@Admin2026");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "अवैध एडमिन क्रेडेन्शियल (Invalid admin credentials)");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/admin/analytics");
        }, 600);
      }
    } catch {
      setError("लॉगिन करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा. (Server error logging in)");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    setEmail("admin@trucktrust.in");
    setPassword("TruckTrust@Admin2026");
    setTimeout(() => {
      handleSubmit();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[var(--cream)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background Indian Truck Art Motif */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 mb-4 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {BRAND_NAME} • Admin & Operations Console
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--ink)] tracking-tight font-[family-name:var(--font-display)]">
            प्रशासक लॉगिन (Admin Portal)
          </h1>
          <p className="mt-2 text-sm text-[var(--warm-gray-600)]">
            महाराष्ट्र राज्य ग्रामीण मालवाहतूक नियमन आणि पडताळणी कक्ष
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 shadow-md rounded-xl border border-[var(--warm-gray-200)] sm:px-10">
            {/* Quick Demo Autofill Notice */}
            <div className="mb-6 p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start justify-between gap-3 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-950">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>डेमो एडमिन खात्याची माहिती (Seeded Admin):</span>
                </div>
                <p className="font-mono text-[11px] text-amber-800">
                  ईमेल: <strong>admin@trucktrust.in</strong><br />
                  पासवर्ड: <strong>TruckTrust@Admin2026</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-xs shrink-0 transition shadow-xs"
              >
                1-Click Login
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3 text-sm text-red-700">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-300 flex items-center gap-3 text-sm text-emerald-800">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>लॉगिन यशस्वी! डॅशबोर्ड उघडत आहे...</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[var(--warm-gray-700)] uppercase tracking-wider mb-1.5">
                  प्रशासक ईमेल (Admin Email)
                </label>
                <div className="relative rounded-lg border border-[var(--warm-gray-300)] focus-within:border-[var(--teal-deep)] focus-within:ring-1 focus-within:ring-[var(--teal-deep)] overflow-hidden">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--warm-gray-400)]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@trucktrust.in"
                    className="w-full pl-10 pr-4 py-3 text-sm text-[var(--ink)] focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--warm-gray-700)] uppercase tracking-wider mb-1.5">
                  पासवर्ड (Password)
                </label>
                <div className="relative rounded-lg border border-[var(--warm-gray-300)] focus-within:border-[var(--teal-deep)] focus-within:ring-1 focus-within:ring-[var(--teal-deep)] overflow-hidden">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--warm-gray-400)]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-3 text-sm text-[var(--ink)] focus:outline-none font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg font-bold text-white bg-[var(--teal-deep)] hover:bg-[#0b3836] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm text-sm"
              >
                {loading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>प्रशासक पडताळणी चालू आहे...</span>
                  </>
                ) : (
                  <>
                    <span>प्रशासक म्हणून लॉगिन करा (Sign In to Admin Console)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-[var(--warm-gray-200)] text-center space-y-3">
              <p className="text-xs text-[var(--warm-gray-500)]">
                मोबाईल ओटीपी द्वारे लॉगिन करायचे आहे?
              </p>
              <Link
                href="/?role=admin"
                className="inline-block text-xs font-bold text-[var(--teal-deep)] hover:underline"
              >
                ← मुख्य पृष्ठावर जा (Use Mobile 9820098200 with OTP 123456)
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
