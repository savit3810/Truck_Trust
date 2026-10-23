"use client";

import React, { useState, useEffect } from "react";
import { SupportedLocale, BRAND_NAME, BRAND_TAGLINE_MR, BRAND_TAGLINE_HI, BRAND_TAGLINE } from "@/lib/config/brand";
import { getDictionary } from "@/i18n/config";
import { UserRole } from "@/features/auth/models/user.model";
import { ShieldCheck, Truck, Store, ArrowRight, RotateCw, CheckCircle2, AlertCircle, Users, Sparkles } from "lucide-react";

export function AuthCard() {
  const [locale, setLocale] = useState<SupportedLocale>("mr");
  const [selectedRole, setSelectedRole] = useState<UserRole>("entrepreneur");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [district, setDistrict] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [step, setStep] = useState<"role" | "phone" | "otp" | "authenticated">("role");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [userData, setUserData] = useState<{ phone: string; name?: string; role: string; district?: string; isVerified: boolean; isNewUser?: boolean } | null>(null);

  const t = getDictionary(locale);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      setError("कृपया वैध १०-अंकी मोबाईल नंबर टाका (Please enter a valid 10-digit mobile number)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, purpose: "login" }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || t.common.error);
      } else {
        const receivedOtp = data.devOtp || "123456";
        setDevOtp(receivedOtp);
        setOtp(receivedOtp); // Pre-fill for instant seamless test login!
        setStep("otp");
        setResendCooldown(30);
      }
    } catch {
      setError(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    const cleanOtp = otp.trim() || "123456";

    if (cleanOtp.length !== 6) {
      setError(t.common.enterOtp);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanPhone,
          otp: cleanOtp,
          role: selectedRole,
          name: fullName.trim() || undefined,
          district: district.trim() || undefined,
          language: locale,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || t.auth.invalidOtp);
      } else {
        setUserData(data.user);
        setStep("authenticated");

        // Automatically navigate to user's personalized dashboard
        const destination = "/dashboard";

        setTimeout(() => {
          window.location.href = destination;
        }, 1500);
      }
    } catch {
      setError(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const getTagline = () => {
    if (locale === "mr") return BRAND_TAGLINE_MR;
    if (locale === "hi") return BRAND_TAGLINE_HI;
    return BRAND_TAGLINE;
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-sm border border-[var(--warm-gray-200)] overflow-hidden">
      {/* Indian Truck Art Top Border Accent */}
      <div className="truck-border-top h-1.5 w-full" />

      {/* Language Selector Bar */}
      <div className="bg-[var(--warm-gray-50)] px-6 py-3 border-b border-[var(--warm-gray-200)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--warm-gray-700)] uppercase tracking-wider">भाषा / Language:</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white p-1 rounded border border-[var(--warm-gray-200)]">
          {(["mr", "hi", "en"] as SupportedLocale[]).map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setLocale(loc)}
              className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                locale === loc
                  ? "bg-[var(--teal-deep)] text-white"
                  : "text-[var(--warm-gray-700)] hover:bg-[var(--warm-gray-100)]"
              }`}
            >
              {loc === "mr" ? "मराठी" : loc === "hi" ? "हिन्दी" : "English"}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {/* Brand Banner */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[var(--cream)] border border-[var(--warm-gray-200)] text-[var(--teal-deep)] mb-3">
            <ShieldCheck className="w-4 h-4 text-[var(--marigold)]" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {BRAND_NAME} • {t.common.verified}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] tracking-tight font-[family-name:var(--font-display)]">
            {t.auth.loginTitle}
          </h1>
          <p className="text-sm text-[var(--warm-gray-700)] mt-1.5 leading-relaxed font-[family-name:var(--font-body)]">
            {getTagline()}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded bg-red-50 border border-red-200 flex items-start gap-3 text-sm text-[var(--chili)]">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Role Selection */}
        {step === "role" && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-[var(--warm-gray-800)] uppercase tracking-wide">
              {t.auth.roleSelectionTitle}
            </h2>
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole("entrepreneur");
                  setStep("phone");
                }}
                className="flex items-start gap-4 p-4 rounded border-2 border-[var(--warm-gray-200)] hover:border-[var(--teal-deep)] hover:bg-[var(--warm-gray-50)] text-left transition-all group"
              >
                <div className="p-2.5 rounded bg-[var(--warm-gray-100)] group-hover:bg-[var(--teal-deep)] group-hover:text-white transition-colors">
                  <Store className="w-6 h-6 text-[var(--teal-deep)] group-hover:text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[var(--ink)] text-base group-hover:text-[var(--teal-deep)]">
                    {t.roles.entrepreneur}
                  </div>
                  <div className="text-xs text-[var(--warm-gray-700)] mt-1">
                    {t.roles.entrepreneurDesc}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-[var(--warm-gray-400)] group-hover:text-[var(--teal-deep)] self-center" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole("driver");
                  setStep("phone");
                }}
                className="flex items-start gap-4 p-4 rounded border-2 border-[var(--warm-gray-200)] hover:border-[var(--marigold)] hover:bg-[var(--warm-gray-50)] text-left transition-all group"
              >
                <div className="p-2.5 rounded bg-[var(--warm-gray-100)] group-hover:bg-[var(--marigold)] group-hover:text-black transition-colors">
                  <Truck className="w-6 h-6 text-[var(--ink)]" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[var(--ink)] text-base group-hover:text-[var(--marigold)]">
                    {t.roles.driver}
                  </div>
                  <div className="text-xs text-[var(--warm-gray-700)] mt-1">
                    {t.roles.driverDesc}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-[var(--warm-gray-400)] group-hover:text-[var(--marigold)] self-center" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole("truck_mitra");
                  setStep("phone");
                }}
                className="flex items-start gap-4 p-4 rounded border-2 border-[var(--warm-gray-200)] hover:border-emerald-600 hover:bg-emerald-50/20 text-left transition-all group"
              >
                <div className="p-2.5 rounded bg-[var(--warm-gray-100)] group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Users className="w-6 h-6 text-emerald-700 group-hover:text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[var(--ink)] text-base group-hover:text-emerald-700">
                    ट्रक मित्र (Truck Mitra / Rural Agent)
                  </div>
                  <div className="text-xs text-[var(--warm-gray-700)] mt-1">
                    गावचे सायबर कॅफे, VLE किंवा कृषी सेवा केंद्र (शेतकऱ्यांसाठी बुकिंग करा व कमिशन मिळवा)
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-[var(--warm-gray-400)] group-hover:text-emerald-600 self-center" />
              </button>
            </div>

            {/* Admin Portal Quick Link */}
            <div className="pt-2 border-t border-[var(--warm-gray-200)] flex items-center justify-between text-xs">
              <span className="text-[var(--warm-gray-600)]">प्लॅटफॉर्म व्यवस्थापक आहात?</span>
              <a
                href="/admin/login"
                className="font-bold text-[var(--teal-deep)] hover:underline inline-flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>प्रशासक लॉगिन (Admin Login) →</span>
              </a>
            </div>
          </div>
        )}

        {/* STEP 2: Phone Input */}
        {step === "phone" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="flex items-center justify-between text-xs text-[var(--warm-gray-700)]">
              <span>निवडलेली भूमिका (Selected Role):</span>
              <button
                type="button"
                onClick={() => setStep("role")}
                className="text-[var(--teal-deep)] font-semibold hover:underline"
              >
                {selectedRole === "driver"
                  ? t.roles.driver
                  : selectedRole === "truck_mitra"
                  ? "ट्रक मित्र (Agent)"
                  : t.roles.entrepreneur}{" "}
                (बदला)
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--warm-gray-700)] uppercase tracking-wider mb-1.5">
                कोणताही मोबाईल नंबर टाका (Any Mobile Number):
              </label>
              <div className="relative flex rounded border border-[var(--warm-gray-300)] focus-within:border-[var(--teal-deep)] focus-within:ring-1 focus-within:ring-[var(--teal-deep)] overflow-hidden">
                <span className="inline-flex items-center px-3.5 bg-[var(--warm-gray-100)] text-[var(--ink)] font-bold text-sm border-r border-[var(--warm-gray-300)] select-none">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="उदा. 98220 12345 किंवा कोणताही नंबर"
                  required
                  className="w-full px-4 py-3 text-lg font-semibold tracking-wide text-[var(--ink)] placeholder-[var(--warm-gray-400)] focus:outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-[var(--warm-gray-700)] mb-1">
                  नाव (Name - ऐच्छिक):
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="उदा. रमेश पाटील"
                  className="w-full px-3 py-2 text-xs rounded border border-[var(--warm-gray-300)] focus:border-[var(--teal-deep)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--warm-gray-700)] mb-1">
                  जिल्हा (District - ऐच्छिक):
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="उदा. पालघर, नाशिक..."
                  className="w-full px-3 py-2 text-xs rounded border border-[var(--warm-gray-300)] focus:border-[var(--teal-deep)] focus:outline-none"
                />
              </div>
            </div>

            <p className="text-xs text-neutral-500 leading-normal bg-neutral-50 p-2.5 rounded border border-neutral-200">
              💡 <strong>नवीन किंवा जुना कोणताही नंबर चालेल</strong> — नवीन नंबर असल्यास थेट आपोआप नोंदणी (Registration) होईल!
            </p>

            <button
              type="submit"
              disabled={loading || phone.replace(/\D/g, "").slice(-10).length !== 10}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded font-bold text-white bg-[var(--teal-deep)] hover:bg-[#0b3836] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm text-base"
            >
              {loading ? (
                <>
                  <RotateCw className="w-5 h-5 animate-spin" />
                  <span>{t.common.loading}</span>
                </>
              ) : (
                <>
                  <span>ओटीपी पाठवा (Send OTP)</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: OTP Verification */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 bg-[var(--warm-gray-50)] border border-[var(--warm-gray-200)] rounded text-xs text-[var(--warm-gray-700)] flex items-center justify-between">
              <span>{t.auth.otpSentMessage.replace("{phone}", `+91 ${phone.slice(-10)}`)}</span>
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="text-[var(--teal-deep)] font-bold hover:underline"
              >
                बदला
              </button>
            </div>

            {/* Instant Demo OTP Helper Banner */}
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  तुमचा चाचणी OTP: <strong>{devOtp || "123456"}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOtp(devOtp || "123456")}
                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow-xs"
              >
                Auto-fill
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--warm-gray-700)] uppercase tracking-wider mb-2">
                {t.common.enterOtp} (६ अंकी कोड)
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="• • • • • •"
                required
                autoFocus
                className="w-full px-4 py-3 text-2xl font-bold tracking-[0.5em] text-center rounded border border-[var(--warm-gray-300)] focus:border-[var(--teal-deep)] focus:ring-1 focus:ring-[var(--teal-deep)] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--warm-gray-500)]">
                {resendCooldown > 0
                  ? t.common.resendIn.replace("{seconds}", resendCooldown.toString())
                  : "पुन्हा OTP हवा आहे?"}
              </span>
              <button
                type="button"
                onClick={() => handleSendOtp()}
                disabled={resendCooldown > 0 || loading}
                className="text-[var(--teal-deep)] font-bold hover:underline disabled:opacity-50 disabled:no-underline"
              >
                {t.common.resendOtp}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded font-bold text-white bg-[var(--teal-deep)] hover:bg-[#0b3836] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm text-base"
            >
              {loading ? (
                <>
                  <RotateCw className="w-5 h-5 animate-spin" />
                  <span>{t.common.loading}</span>
                </>
              ) : (
                <>
                  <span>सत्यापित करा व पुढे जा (Verify & Login)</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 4: Authenticated Welcome Screen */}
        {step === "authenticated" && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-xl font-bold text-[var(--ink)]">
              {userData?.isNewUser ? "अभिनंदन! आपले खाते तयार झाले 🎉" : "स्वागत आहे! आपण यशस्वीरीत्या लॉग इन केले आहे"}
            </h2>

            <p className="text-sm text-[var(--warm-gray-600)]">
              मोबाईल: +91 {userData?.phone} • भूमिका:{" "}
              <strong>
                {userData?.role === "admin"
                  ? "प्रशासक (Platform Administrator)"
                  : userData?.role === "driver"
                  ? "ट्रक चालक (Driver)"
                  : userData?.role === "truck_mitra"
                  ? "ट्रक मित्र (Agent)"
                  : "शेतकरी / उद्योजक (Entrepreneur)"}
              </strong>
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-3 rounded font-bold text-white bg-[var(--teal-deep)] hover:bg-[#0b3836] text-sm shadow-sm transition inline-flex items-center justify-center gap-2"
              >
                <span>माझे डॅशबोर्ड उघडा (Open My Dashboard) →</span>
              </a>

              {userData?.role === "admin" ? (
                <a
                  href="/admin/analytics"
                  className="w-full sm:w-auto px-4 py-3 rounded font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 text-xs transition inline-flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>प्रशासक कन्सोल (Admin)</span>
                </a>
              ) : userData?.role === "driver" ? (
                <a
                  href="/driver/jobs"
                  className="w-full sm:w-auto px-4 py-3 rounded font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 text-xs transition"
                >
                  उपलब्ध जॉब्स पहा (Jobs)
                </a>
              ) : userData?.role === "truck_mitra" ? (
                <a
                  href="/mitra"
                  className="w-full sm:w-auto px-4 py-3 rounded font-semibold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 text-xs transition"
                >
                  मित्र कियोस्क (Mitra Kiosk)
                </a>
              ) : (
                <a
                  href="/book"
                  className="w-full sm:w-auto px-4 py-3 rounded font-semibold text-teal-900 bg-teal-50 hover:bg-teal-100 text-xs transition inline-flex items-center justify-center gap-1.5"
                >
                  <span>ट्रक बुक करा (Book Freight)</span>
                </a>
              )}

              <button
                type="button"
                onClick={async () => {
                  try {
                    await fetch("/api/auth/logout", { method: "POST" });
                  } catch {
                    // Ignore error on logout
                  }
                  setStep("role");
                  setUserData(null);
                  setPhone("");
                  setOtp("");
                }}
                className="w-full sm:w-auto px-4 py-3 rounded font-semibold text-xs text-[var(--warm-gray-600)] hover:bg-[var(--warm-gray-100)] border border-[var(--warm-gray-200)] transition"
              >
                भूमिका बदला / लॉगआउट (Switch Role / Logout)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
