"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BRAND_NAME } from "@/lib/config/brand";
import { ShieldCheck, Truck, CheckCircle2, MapPin, ArrowLeft, RotateCw } from "lucide-react";

interface PublicDriverData {
  id: string;
  name: string;
  phoneMasked?: string;
  licenseMasked: string;
  experienceYears: number;
  operatingDistricts: string[];
  kycStatus: string;
  trustScore: number;
  trustBreakdown: {
    documentation: number;
    onTimeDelivery: number;
    safetyAndRatings: number;
  };
  onTimeRate: number;
  totalTripsCompleted: number;
  badges: { id: string; label: string; icon: string }[];
  truck: {
    registrationNumberMasked: string;
    truckType: string;
    capacityKg: number;
    bodyType: string;
    isAvailable: boolean;
  } | null;
  verifiedDocumentTypes: string[];
}

function DriverProfileContent() {
  const params = useParams();
  const driverId = params?.id as string;

  const [driver, setDriver] = useState<PublicDriverData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!driverId) return;
    fetch(`/api/drivers/${driverId}/public`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDriver(data.driver);
        } else {
          setError(data.error || "Driver profile not found");
        }
      })
      .catch(() => setError("Failed to load driver profile"))
      .finally(() => setLoading(false));
  }, [driverId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--warm-gray-50)] flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--warm-gray-600)]">
          <RotateCw className="w-4 h-4 animate-spin text-[var(--teal-deep)]" />
          <span>पडताळणीकृत प्रोफाइल लोड होत आहे...</span>
        </div>
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="min-h-screen bg-[var(--warm-gray-50)] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-6 rounded border border-[var(--warm-gray-200)] text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-red-50 text-[var(--chili)] mx-auto flex items-center justify-center">
            !
          </div>
          <h2 className="font-bold text-sm text-[var(--ink)]">प्रोफाइल सापडली नाही</h2>
          <p className="text-xs text-[var(--warm-gray-500)]">{error || "हा ड्रायव्हर उपलब्ध नाही."}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--teal-deep)] hover:underline pt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>मुख्य पानावर परत जा</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--warm-gray-50)] text-[var(--ink)]">
      {/* Truck Border Accent */}
      <div className="truck-border-top h-1.5 w-full" />

      {/* Header */}
      <header className="bg-white border-b border-[var(--warm-gray-200)] py-4 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-[var(--teal-deep)] hover:underline">
            <ArrowLeft className="w-4 h-4" />
            <span>{BRAND_NAME}</span>
          </Link>
          <span className="truck-badge stamp-verified text-[11px]">
            पडताळणीकृत चालक प्रोफाइल
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Hero Card */}
        <div className="bg-white rounded-lg border border-[var(--warm-gray-200)] shadow-sm p-6 sm:p-8 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-[var(--cream)] border-2 border-[var(--teal-deep)] flex items-center justify-center text-[var(--teal-deep)] flex-shrink-0">
                <Truck className="w-9 h-9" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-[var(--ink)] font-[family-name:var(--font-display)]">
                    {driver.name}
                  </h1>
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-xs text-[var(--warm-gray-600)] font-mono mt-1 space-x-3">
                  <span>लायसन्स: {driver.licenseMasked}</span>
                  <span>•</span>
                  <span>अनुभव: {driver.experienceYears} वर्षे</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {driver.badges.map((b) => (
                    <span
                      key={b.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--warm-gray-100)] text-[var(--teal-deep)] text-[11px] font-bold border border-[var(--warm-gray-200)]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--marigold)]" />
                      <span>{b.label}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Trust Score Gauge Stamp */}
            <div className="p-4 rounded border-2 border-emerald-600 bg-emerald-50/50 text-center flex-shrink-0 min-w-[140px]">
              <div className="text-3xl font-black text-emerald-800 font-[family-name:var(--font-display)]">
                {driver.trustScore}
                <span className="text-sm font-normal text-emerald-600">/१००</span>
              </div>
              <div className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider mt-0.5">
                विश्वास निर्देशांक (Trust Score)
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[var(--warm-gray-200)] text-center">
            <div className="p-3 bg-[var(--warm-gray-50)] rounded border border-[var(--warm-gray-200)]">
              <div className="text-xl font-black text-[var(--ink)] font-[family-name:var(--font-display)]">
                {driver.totalTripsCompleted}
              </div>
              <div className="text-[11px] font-semibold text-[var(--warm-gray-500)] mt-0.5">
                एकूण पूर्ण ट्रिप्स
              </div>
            </div>

            <div className="p-3 bg-[var(--warm-gray-50)] rounded border border-[var(--warm-gray-200)]">
              <div className="text-xl font-black text-emerald-700 font-[family-name:var(--font-display)]">
                {driver.onTimeRate}%
              </div>
              <div className="text-[11px] font-semibold text-[var(--warm-gray-500)] mt-0.5">
                वेळेवर वितरण दर
              </div>
            </div>

            <div className="p-3 bg-[var(--warm-gray-50)] rounded border border-[var(--warm-gray-200)]">
              <div className="text-xl font-black text-[var(--teal-deep)] font-[family-name:var(--font-display)]">
                १००%
              </div>
              <div className="text-[11px] font-semibold text-[var(--warm-gray-500)] mt-0.5">
                कागदपत्रे तपासणी
              </div>
            </div>

            <div className="p-3 bg-[var(--warm-gray-50)] rounded border border-[var(--warm-gray-200)]">
              <div className="text-xl font-black text-amber-700 font-[family-name:var(--font-display)]">
                ४.९ ★
              </div>
              <div className="text-[11px] font-semibold text-[var(--warm-gray-500)] mt-0.5">
                शेतकरी रेटिंग्स
              </div>
            </div>
          </div>
        </div>

        {/* Truck Specs & Corridor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Truck Card */}
          <div className="bg-white rounded-lg border border-[var(--warm-gray-200)] shadow-2xs p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--warm-gray-200)] pb-3">
              <Truck className="w-5 h-5 text-[var(--teal-deep)]" />
              <h2 className="font-bold text-base text-[var(--ink)] font-[family-name:var(--font-display)]">
                नोंदणीकृत वाहन (Vehicle Specs)
              </h2>
            </div>

            {driver.truck ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[var(--warm-gray-100)]">
                  <span className="text-[var(--warm-gray-500)]">गाडी नंबर:</span>
                  <span className="font-mono font-bold text-[var(--ink)] bg-[var(--cream)] px-2 py-0.5 rounded border border-[var(--warm-gray-300)]">
                    {driver.truck.registrationNumberMasked}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[var(--warm-gray-100)]">
                  <span className="text-[var(--warm-gray-500)]">वाहन प्रकार:</span>
                  <span className="font-bold text-[var(--ink)]">{driver.truck.truckType}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[var(--warm-gray-100)]">
                  <span className="text-[var(--warm-gray-500)]">कमाल क्षमता:</span>
                  <span className="font-bold text-[var(--ink)]">{driver.truck.capacityKg} kg</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[var(--warm-gray-100)]">
                  <span className="text-[var(--warm-gray-500)]">बॉडी प्रकार:</span>
                  <span className="font-bold text-[var(--ink)]">{driver.truck.bodyType}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[var(--warm-gray-500)]">उपलब्धता स्थिती:</span>
                  <span className="truck-badge text-emerald-800 border-emerald-300 bg-emerald-50">
                    भाड्यासाठी उपलब्ध (Available)
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[var(--warm-gray-500)] italic">वाहन तपशील प्रलंबित</p>
            )}
          </div>

          {/* Operating Districts Card */}
          <div className="bg-white rounded-lg border border-[var(--warm-gray-200)] shadow-2xs p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--warm-gray-200)] pb-3">
              <MapPin className="w-5 h-5 text-[var(--marigold)]" />
              <h2 className="font-bold text-base text-[var(--ink)] font-[family-name:var(--font-display)]">
                कार्यक्षेत्र जिल्हे (Operating Routes)
              </h2>
            </div>

            <p className="text-xs text-[var(--warm-gray-600)] leading-relaxed">
              हा चालक खालील महाराष्ट्र जिल्ह्यांमधील शेतकरी आणि व्यापाऱ्यांकडून थेट मालवाहतूक करण्यासाठी उपलब्ध आहे:
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {driver.operatingDistricts.map((dist) => (
                <span
                  key={dist}
                  className="px-3 py-1 rounded bg-[var(--cream)] border border-[var(--warm-gray-300)] text-xs font-bold text-[var(--ink)]"
                >
                  📍 {dist}
                </span>
              ))}
            </div>

            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900">
              <span className="font-bold">TruckTrust एस्क्रो संरक्षण:</span> या चालकासोबत बुक केलेल्या प्रत्येक ट्रिपसाठी ५०% आगाऊ व ५०% माल पोहोचल्याची खात्री झाल्यावरच दिले जाते.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PublicDriverProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--warm-gray-50)] flex items-center justify-center p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--warm-gray-600)]">
            <RotateCw className="w-4 h-4 animate-spin text-[var(--teal-deep)]" />
            <span>पडताळणीकृत प्रोफाइल लोड होत आहे...</span>
          </div>
        </div>
      }
    >
      <DriverProfileContent />
    </Suspense>
  );
}
