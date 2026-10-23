"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BRAND_NAME } from "@/lib/config/brand";
import {
  TrendingUp,
  Truck,
  ShieldCheck,
  AlertTriangle,
  RotateCw,
  Award,
  Wallet,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface AnalyticsData {
  corridors: {
    corridor: string;
    pickupDistrict: string;
    dropDistrict: string;
    tripCount: number;
    completedTrips: number;
    totalGmvPaise: number;
    totalTonnageKg: number;
    avgDistanceKm: number;
    avgDurationMinutes: number;
  }[];
  finances: {
    totalGmvPaise: number;
    platformFeeEarnedPaise: number;
    gstLiabilityPaise: number;
    advanceEscrowHeldPaise: number;
    activeEscrowPaise: number;
    disputedEscrowPaise: number;
    driverDisbursedPaise: number;
  };
  fulfillment: {
    totalBookings: number;
    completedBookings: number;
    inTransitBookings: number;
    activeRequests: number;
    cancelledBookings: number;
    disputedBookings: number;
    fulfillmentRatePercentage: number;
    sosAlertsCount: number;
  };
  fleet: {
    totalDrivers: number;
    verifiedDrivers: number;
    pendingDrivers: number;
    actionNeededDrivers: number;
    averageTrustScore: number;
    averageRating: number;
    trustTiers: {
      diamond: number;
      gold: number;
      silver: number;
      bronze: number;
    };
    truckTypeDistribution: Record<string, number>;
    totalFleetCapacityKg: number;
  };
  generatedAt: string;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeWindow, setTimeWindow] = useState<"7d" | "30d" | "all">("all");

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/analytics");
      const json = await res.json();
      if (json.success) {
        setData(json.analytics);
      } else {
        setError(json.error || "Failed to load analytics");
      }
    } catch (err) {
      setError((err as Error).message || "Network error loading analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const fetchInitial = async () => {
      try {
        const res = await fetch("/api/admin/analytics");
        const json = await res.json();
        if (!ignore) {
          if (json.success) {
            setData(json.analytics);
          } else {
            setError(json.error || "Failed to load analytics");
          }
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setError((err as Error).message || "Network error");
          setLoading(false);
        }
      }
    };

    fetchInitial();

    return () => {
      ignore = true;
    };
  }, []);

  const formatPaise = (paise: number) => {
    return (paise / 100).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Header */}
      <header className="bg-[#0A3331] text-white border-b border-[#0F4C4A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 text-xs font-bold px-2 py-0.5 rounded tracking-wider uppercase">
                  Admin Console
                </span>
                <span className="text-emerald-300 text-xs flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Maharashtra Radar
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight mt-1">
                {BRAND_NAME} Analytics & Freight Insights
              </h1>
              <p className="text-slate-300 text-xs mt-0.5">
                महाराष्ट्र कृषी व ग्रामीण मालवाहतूक डेटा • Real-time Corridor, Escrow & Fleet Telemetry
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-lg bg-[#0F4C4A] p-0.5 text-xs font-medium text-slate-300">
                {(["7d", "30d", "all"] as const).map((w) => (
                  <button
                    key={w}
                    onClick={() => setTimeWindow(w)}
                    className={`px-3 py-1.5 rounded-md transition ${
                      timeWindow === w
                        ? "bg-amber-400 text-slate-950 font-bold shadow-sm"
                        : "hover:text-white"
                    }`}
                  >
                    {w === "7d" ? "७ दिवस (7D)" : w === "30d" ? "३० दिवस (30D)" : "सर्व (All Time)"}
                  </button>
                ))}
              </div>

              <button
                onClick={loadAnalytics}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                रिफ्रेश करा
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 mt-6 border-t border-[#0F4C4A]/80 pt-3 text-sm">
            <Link
              href="/admin/analytics"
              className="px-3 py-1.5 rounded-md bg-white/10 text-white font-semibold flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Overview & Analytics
            </Link>
            <Link
              href="/admin/verifications"
              className="px-3 py-1.5 rounded-md text-slate-300 hover:text-white hover:bg-white/5 transition flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              KYC Verification Queue
            </Link>
            <Link
              href="/admin/verifications"
              className="px-3 py-1.5 rounded-md text-slate-300 hover:text-white hover:bg-white/5 transition flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Disputes & Safety Alerts
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {loading && !data && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
            <RotateCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">डेटा लोड होत आहे (Aggregating platform metrics)...</p>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div className="text-sm">
                <span className="font-semibold">प्रवेश नाकारला (Access Required): </span>
                {error}
              </div>
            </div>
            <Link
              href="/admin/login"
              className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-lg transition shrink-0"
            >
              प्रशासक लॉगिन करा (Sign In as Admin) →
            </Link>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Top KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Gross Merchandise Value */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    एकूण व्यवहार (Total GMV)
                  </span>
                  <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <TrendingUp className="w-5 h-5" />
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    ₹{formatPaise(data.finances.totalGmvPaise)}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <span className="text-emerald-600 font-bold flex items-center">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      50% अग्रिम + 50% डिलिव्हरी
                    </span>
                    <span>• {data.fulfillment.totalBookings} फेऱ्या</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Platform Revenue & GST */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    प्लॅटफॉर्म कमिशन (Revenue)
                  </span>
                  <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <Sparkles className="w-5 h-5" />
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    ₹{formatPaise(data.finances.platformFeeEarnedPaise)}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                    <span>७.५% फी</span>
                    <span className="text-slate-600 font-medium">
                      GST देय: ₹{formatPaise(data.finances.gstLiabilityPaise)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Active In-Transit Escrow */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    सुरक्षित एस्क्रो निधी (Protected Escrow)
                  </span>
                  <span className="p-2 bg-teal-50 text-[#0F4C4A] rounded-xl">
                    <Wallet className="w-5 h-5" />
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-[#0F4C4A] tracking-tight">
                    ₹{formatPaise(data.finances.activeEscrowPaise)}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                    <span className="text-emerald-700 font-semibold">
                      चालकांना अदा: ₹{formatPaise(data.finances.driverDisbursedPaise)}
                    </span>
                    {data.finances.disputedEscrowPaise > 0 && (
                      <span className="text-rose-600 font-semibold">
                        वादग्रस्त: ₹{formatPaise(data.finances.disputedEscrowPaise)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 4: Trip Fulfillment & Trust Index */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    यशस्वी फेऱ्या (Fulfillment Rate)
                  </span>
                  <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Award className="w-5 h-5" />
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    {data.fulfillment.fulfillmentRatePercentage}%
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                    <span>
                      {data.fulfillment.completedBookings} पूर्ण / {data.fulfillment.inTransitBookings} प्रवासात
                    </span>
                    <span className="font-semibold text-amber-600">
                      ★ {data.fleet.averageRating.toFixed(1)} / ५
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Corridors Leaderboard & Fleet Trust Profile */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Corridor Table (2 cols) */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-emerald-600" />
                      प्रमुख मालवाहतूक कॉरिडॉर (Top Freight Corridors)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      नाशिक, पुणे, पालघर आणि ठाणे कृषी उत्पन्न बाजार समिती (APMC) फेऱ्यांचे विश्लेषण
                    </p>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-md">
                    {data.corridors.length} सक्रिय मार्ग
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                        <th className="pb-3">कॉरिडॉर (Route)</th>
                        <th className="pb-3 text-center">एकूण फेऱ्या</th>
                        <th className="pb-3 text-right">वजन (Tonnage)</th>
                        <th className="pb-3 text-right">एकूण भाडे (GMV)</th>
                        <th className="pb-3 text-right">सरासरी अंतर</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.corridors.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                            सध्या सक्रिय कॉरिडॉर डेटा उपलब्ध नाही (No corridor trips logged yet)
                          </td>
                        </tr>
                      ) : (
                        data.corridors.map((c, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition">
                            <td className="py-3 font-semibold text-slate-900 flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">
                                {idx + 1}
                              </span>
                              {c.corridor}
                            </td>
                            <td className="py-3 text-center">
                              <span className="bg-slate-100 font-bold px-2 py-0.5 rounded text-xs text-slate-800">
                                {c.tripCount}
                              </span>
                              <span className="text-xs text-emerald-600 ml-1">
                                ({c.completedTrips} पूर्ण)
                              </span>
                            </td>
                            <td className="py-3 text-right font-medium text-slate-700">
                              {(c.totalTonnageKg / 1000).toFixed(1)} टन
                            </td>
                            <td className="py-3 text-right font-bold text-slate-900">
                              ₹{formatPaise(c.totalGmvPaise)}
                            </td>
                            <td className="py-3 text-right text-xs text-slate-500">
                              {c.avgDistanceKm} किमी ({Math.round(c.avgDurationMinutes / 60)} तास)
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Fleet Trust & Verification Breakdown (1 col) */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-5 h-5 text-[#0F4C4A]" />
                    चालक विश्वासार्हता निर्देशांक (Fleet Trust)
                  </h2>
                  <p className="text-xs text-slate-500 mb-4">
                    विश्वासू गुणांकन आणि व्हेरिफिकेशन स्तर (0-100 Weighted Trust Algorithm)
                  </p>

                  <div className="bg-emerald-50 rounded-xl p-4 mb-4 border border-emerald-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-emerald-800 uppercase">
                        सरासरी विश्वासू गुण (Trust Score)
                      </div>
                      <div className="text-3xl font-black text-emerald-950 mt-0.5">
                        {data.fleet.averageTrustScore}
                        <span className="text-sm text-emerald-700 font-medium"> / १००</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-emerald-800 uppercase">
                        सत्यापित चालक
                      </div>
                      <div className="text-xl font-bold text-emerald-900 mt-0.5">
                        {data.fleet.verifiedDrivers} / {data.fleet.totalDrivers}
                      </div>
                    </div>
                  </div>

                  {/* Trust Tier Badges */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-cyan-500" />
                        <span className="font-semibold text-slate-800">
                          डायमंड पार्टनर (Diamond • ९०+ गुण)
                        </span>
                      </div>
                      <span className="font-bold text-slate-900">
                        {data.fleet.trustTiers.diamond} चालक
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="font-semibold text-slate-800">
                          गोल्ड ड्रायव्हर (Gold • ८०+ गुण)
                        </span>
                      </div>
                      <span className="font-bold text-slate-900">
                        {data.fleet.trustTiers.gold} चालक
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-slate-400" />
                        <span className="font-semibold text-slate-800">
                          सिल्वर ड्रायव्हर (Silver • ७०+ गुण)
                        </span>
                      </div>
                      <span className="font-bold text-slate-900">
                        {data.fleet.trustTiers.silver} चालक
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-700" />
                        <span className="font-semibold text-slate-800">
                          स्टँडर्ड / नवीन (Standard)
                        </span>
                      </div>
                      <span className="font-bold text-slate-900">
                        {data.fleet.trustTiers.bronze} चालक
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>एकूण उपलब्ध क्षमता:</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {(data.fleet.totalFleetCapacityKg / 1000).toFixed(0)} टन
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: Financial Economics & Safety Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Financial Platform Economics */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                  प्लॅटफॉर्म अर्थशास्त्र व कमिशन (Double-Entry Economics)
                </h2>
                <p className="text-xs text-slate-500 mb-4">
                  सर्व व्यवहार ५०% अग्रिम व ५०% डिलिव्हरी एस्क्रो लेजर द्वारे सुरक्षित आहेत
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <div className="text-xs text-slate-500">प्लॅटफॉर्म कमिशन (७.५%)</div>
                      <div className="text-lg font-bold text-slate-900">
                        ₹{formatPaise(data.finances.platformFeeEarnedPaise)}
                      </div>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-1 rounded">
                      कमाई जमा
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <div className="text-xs text-slate-500">शासकीय जीएसटी देयता (५% GST Liability)</div>
                      <div className="text-lg font-bold text-slate-900">
                        ₹{formatPaise(data.finances.gstLiabilityPaise)}
                      </div>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-1 rounded">
                      कर राखीव
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <div className="text-xs text-slate-500">चालकांना थेट वितरित रक्कम (Driver Net Payouts)</div>
                      <div className="text-lg font-bold text-slate-900">
                        ₹{formatPaise(data.finances.driverDisbursedPaise)}
                      </div>
                    </div>
                    <span className="text-xs bg-purple-100 text-purple-800 font-semibold px-2 py-1 rounded">
                      तातडीचे UPI
                    </span>
                  </div>
                </div>
              </div>

              {/* Safety Radar & SOS Alerts */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                      सुरक्षा व तातडीचे इशारे (Safety Radar & SOS)
                    </h2>
                    {data.fulfillment.sosAlertsCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex items-center gap-1 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-rose-600" />
                        {data.fulfillment.sosAlertsCount} तातडीचे इशारे
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium">
                        सर्व शांत • All Safe
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mb-4">
                    २४×७ महामार्ग पोलीस व नियंत्रण कक्ष थेट जोडणी (११२ व ९८२२९६६३३३)
                  </p>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-slate-800">
                          महाराष्ट्र आपत्कालीन संपर्क (Emergency Control)
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          पोलीस व रुग्णवाहिका: 112 • महामार्ग पोलीस: 9822966333
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">
                        सक्रिय
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-slate-800">
                          सक्रिय वादग्रस्त फेऱ्या (Open Booking Disputes)
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {data.fulfillment.disputedBookings} फेऱ्यांमध्ये मध्यस्थी सुरू आहे
                        </div>
                      </div>
                      <Link
                        href="/admin/verifications"
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        तपासा <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>डेटा निर्मिती: {new Date(data.generatedAt).toLocaleTimeString("mr-IN")}</span>
                  <span>{BRAND_NAME} Enterprise Security Core</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
