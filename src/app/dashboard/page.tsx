"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BRAND_NAME } from "@/lib/config/brand";
import { formatCurrency } from "@/i18n/config";
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RotateCw,
  PlusCircle,
  ExternalLink,
  Copy,
  PhoneCall,
  User,
  LogOut,
  Wallet,
  Star,
  Package,
  Calendar,
  Building,
  RefreshCw,
  Edit3,
  Check,
} from "lucide-react";

interface UserProfile {
  id: string;
  phone: string;
  name?: string;
  role: "entrepreneur" | "driver" | "admin" | "support" | "truck_mitra";
  language: string;
  district?: string;
  village?: string;
  businessType?: string;
  isVerified: boolean;
  createdAt: string;
}

interface DriverInfo {
  licenseNumber: string;
  experienceYears: number;
  operatingDistricts: string[];
  kycStatus: string;
  trustScore: number;
  trustTier?: string;
  onTimeRate: number;
  totalTripsCompleted: number;
}

interface TruckInfo {
  id: string;
  registrationNumber: string;
  truckType: string;
  capacityKg: number;
  bodyType: string;
  isAvailable: boolean;
}

interface WalletInfo {
  balancePaise: number;
  escrowBalancePaise: number;
}

interface BookingItem {
  id: string;
  bookingNumber: string;
  status: string;
  pickup: {
    address: string;
    district: string;
    contactName: string;
    contactPhone: string;
  };
  drop: {
    address: string;
    district: string;
    receiverName: string;
    receiverPhone: string;
  };
  goods: {
    category: string;
    description: string;
    weightKg: number;
    isPerishable: boolean;
  };
  truckType: string;
  mode: string;
  route: {
    distanceKm: number;
    durationMinutes: number;
  };
  fare: {
    totalFarePaise: number;
    advance50Paise: number;
    delivery50Paise: number;
  };
  createdAt: string;
}

export default function UserPersonalDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [driver, setDriver] = useState<DriverInfo | null>(null);
  const [truck, setTruck] = useState<TruckInfo | null>(null);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // Edit Profile Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDistrict, setEditDistrict] = useState("");
  const [editVillage, setEditVillage] = useState("");
  const [editBusinessType, setEditBusinessType] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileNotice, setProfileNotice] = useState<string | null>(null);

  // Fetch current authenticated user & role details
  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();

      if (!data.authenticated || !data.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(data.user);
      setDriver(data.driver || null);
      setTruck(data.truck || null);
      setWallet(data.wallet || null);

      setEditName(data.user.name || "");
      setEditDistrict(data.user.district || "");
      setEditVillage(data.user.village || "");
      setEditBusinessType(data.user.businessType || "");

      // Load bookings for this user
      loadUserBookings();
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loadUserBookings = async () => {
    setBookingsLoading(true);
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings || []);
      }
    } catch {
      // ignore
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          district: editDistrict.trim(),
          village: editVillage.trim(),
          businessType: editBusinessType.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setUser((prev) => (prev ? { ...prev, ...data.user } : null));
        setShowEditModal(false);
        setProfileNotice("माहिती यशस्वीरित्या जतन झाली! (Profile saved)");
        setTimeout(() => setProfileNotice(null), 3500);
      }
    } catch {
      // ignore
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--warm-gray-50)] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <RotateCw className="w-8 h-8 animate-spin text-[var(--teal-deep)] mx-auto" />
          <p className="text-xs font-bold text-[var(--warm-gray-600)]">
            आपला वैयक्तिक डॅशबोर्ड लोड होत आहे... (Loading Dashboard)
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, prompt login
  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--warm-gray-50)] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg border border-[var(--warm-gray-200)] shadow-sm p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-[var(--ink)]">
            कृपया प्रथम लॉगिन करा (Please Login First)
          </h2>
          <p className="text-xs text-[var(--warm-gray-600)]">
            आपला वैयक्तिक डॅशबोर्ड पाहण्यासाठी आपल्या मोबाईल क्रमांकाने लॉगिन करा.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded bg-[var(--teal-deep)] text-white text-xs font-bold hover:bg-[#0b3836] shadow-sm"
          >
            <span>मुख्य पानावर जा व लॉगिन करा (Go to Login)</span>
          </Link>
        </div>
      </div>
    );
  }

  // Active trips calculation
  const activeBookings = bookings.filter((b) => !["completed", "cancelled"].includes(b.status));
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const totalSpendPaise = bookings.reduce((sum, b) => sum + (b.fare?.totalFarePaise || 0), 0);

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "requested":
        return { text: "नवीन मागणी (Awaiting Driver)", cls: "bg-amber-50 text-amber-800 border-amber-300" };
      case "accepted":
        return { text: "चालकाने स्वीकारले (Driver Assigned)", cls: "bg-blue-50 text-blue-800 border-blue-300" };
      case "pickup_arrived":
        return { text: "चालक पिकअपला पोहोचला (Pickup Arrived)", cls: "bg-indigo-50 text-indigo-800 border-indigo-300" };
      case "goods_loaded":
        return { text: "माल ट्रकमध्ये भरला (Goods Loaded)", cls: "bg-cyan-50 text-cyan-800 border-cyan-300" };
      case "in_transit":
        return { text: "प्रवासात आहे (In Transit)", cls: "bg-purple-50 text-purple-800 border-purple-300" };
      case "delivery_arrived":
        return { text: "डिलिव्हरी स्थळी पोहोचले (At Destination)", cls: "bg-teal-50 text-teal-800 border-teal-300" };
      case "completed":
        return { text: "डिलिव्हरी पूर्ण (Completed)", cls: "bg-emerald-50 text-emerald-800 border-emerald-300" };
      case "cancelled":
        return { text: "रद्द केले (Cancelled)", cls: "bg-red-50 text-red-800 border-red-300" };
      default:
        return { text: st, cls: "bg-gray-50 text-gray-800 border-gray-300" };
    }
  };

  return (
    <div className="min-h-screen bg-[var(--warm-gray-50)] text-[var(--ink)]">
      {/* Indian Truck Art Top Bar */}
      <div className="truck-border-top h-1.5 w-full" />

      {/* Header */}
      <header className="bg-white border-b border-[var(--warm-gray-200)] sticky top-0 z-30 shadow-2xs py-3.5 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-[var(--teal-deep)] flex items-center justify-center text-[var(--marigold)]">
                <Truck className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg tracking-tight font-[family-name:var(--font-display)]">
                {BRAND_NAME}
              </span>
            </Link>
            <span className="hidden sm:inline-block text-[var(--warm-gray-300)]">|</span>
            <span className="hidden sm:inline-block text-xs font-bold text-[var(--warm-gray-600)]">
              वैयक्तिक डॅशबोर्ड (Personal Dashboard)
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Role Badge */}
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                user.role === "driver"
                  ? "bg-amber-50 text-amber-900 border-amber-300"
                  : user.role === "truck_mitra"
                  ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                  : user.role === "admin"
                  ? "bg-slate-900 text-white border-slate-700"
                  : "bg-teal-50 text-teal-900 border-teal-300"
              }`}
            >
              {user.role === "driver"
                ? "चालक (Truck Driver)"
                : user.role === "truck_mitra"
                ? "ट्रक मित्र (Agent)"
                : user.role === "admin"
                ? "प्रशासक (Admin)"
                : "शेतकरी / उद्योजक (Entrepreneur)"}
            </span>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-[var(--warm-gray-300)] bg-white text-xs font-bold text-[var(--warm-gray-700)] hover:bg-[var(--warm-gray-100)] transition"
              title="लॉगआउट करा"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">लॉगआउट (Logout)</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Notice Banner */}
        {profileNotice && (
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{profileNotice}</span>
          </div>
        )}

        {/* PROFILE BANNER */}
        <div className="bg-white rounded-lg border border-[var(--warm-gray-200)] shadow-2xs p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-[var(--cream)] border-2 border-[var(--teal-deep)] flex items-center justify-center text-[var(--teal-deep)] font-extrabold text-xl shrink-0">
              {user.name ? user.name[0].toUpperCase() : <User className="w-6 h-6" />}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] font-[family-name:var(--font-display)]">
                  {user.name || `वापरकर्ता ${user.phone.slice(-4)}`}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>सत्यापित खाते</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[var(--warm-gray-600)] mt-1.5">
                <span className="font-semibold text-[var(--ink)]">मोबाईल: +91 {user.phone}</span>
                {user.district && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[var(--teal-deep)]" />
                      <span>{user.district} {user.village ? `(${user.village})` : ""}</span>
                    </span>
                  </>
                )}
                {user.businessType && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Building className="w-3 h-3 text-[var(--warm-gray-500)]" />
                      <span>{user.businessType}</span>
                    </span>
                  </>
                )}
                <span>•</span>
                <span>सदस्य: {new Date(user.createdAt).toLocaleDateString("mr-IN", { month: "short", year: "numeric" })}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded border border-[var(--warm-gray-300)] bg-white text-xs font-bold text-[var(--ink)] hover:bg-[var(--warm-gray-100)] shadow-2xs transition"
            >
              <Edit3 className="w-3.5 h-3.5 text-[var(--teal-deep)]" />
              <span>माहिती बदला (Edit Profile)</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* ROLE 1: ENTREPRENEUR / FARMER DASHBOARD                       */}
        {/* ============================================================== */}
        {user.role === "entrepreneur" && (
          <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-lg border border-[var(--warm-gray-200)] shadow-2xs">
                <span className="text-[11px] font-bold text-[var(--warm-gray-500)] uppercase block">
                  एकूण भाडे (Total Loads)
                </span>
                <div className="text-2xl font-black text-[var(--ink)] mt-1 font-[family-name:var(--font-display)]">
                  {bookings.length}
                </div>
                <span className="text-[11px] text-[var(--warm-gray-500)] mt-0.5 block">नोंदवलेले व्यवहार</span>
              </div>

              <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-2xs bg-blue-50/20">
                <span className="text-[11px] font-bold text-blue-700 uppercase block">
                  चालू ट्रिप्स (Active Loads)
                </span>
                <div className="text-2xl font-black text-blue-800 mt-1 font-[family-name:var(--font-display)]">
                  {activeBookings.length}
                </div>
                <span className="text-[11px] text-blue-600 mt-0.5 block">प्रवासात / ड्रायव्हर वाटचाल</span>
              </div>

              <div className="bg-white p-4 rounded-lg border border-emerald-200 shadow-2xs bg-emerald-50/20">
                <span className="text-[11px] font-bold text-emerald-800 uppercase block">
                  यशस्वी डिलिव्हरी (Delivered)
                </span>
                <div className="text-2xl font-black text-emerald-900 mt-1 font-[family-name:var(--font-display)]">
                  {completedBookings.length}
                </div>
                <span className="text-[11px] text-emerald-700 mt-0.5 block">५०-५० रिलीज पूर्ण</span>
              </div>

              <div className="bg-white p-4 rounded-lg border border-[var(--warm-gray-200)] shadow-2xs">
                <span className="text-[11px] font-bold text-[var(--warm-gray-500)] uppercase block">
                  एकूण खर्च (Total Freight)
                </span>
                <div className="text-2xl font-black text-emerald-800 mt-1 font-[family-name:var(--font-display)]">
                  {formatCurrency(totalSpendPaise)}
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">१००% पारदर्शक भाडे</span>
              </div>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/book"
                className="p-4 rounded-lg bg-[var(--teal-deep)] text-white hover:bg-[#0b3836] shadow-sm transition flex items-center justify-between group"
              >
                <div>
                  <div className="font-bold text-sm flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-[var(--marigold)]" />
                    <span>नवीन भाडे नोंदवा (Book Freight)</span>
                  </div>
                  <p className="text-[11px] text-[var(--warm-gray-200)] mt-1">
                    शेतमाल व व्यापारासाठी सुरक्षित ट्रक बुक करा
                  </p>
                </div>
                <span className="text-lg font-bold group-hover:translate-x-1 transition-transform">→</span>
              </Link>

              <Link
                href="/book"
                className="p-4 rounded-lg bg-white border border-[var(--warm-gray-200)] hover:border-[var(--teal-deep)] shadow-2xs transition flex items-center justify-between group"
              >
                <div>
                  <div className="font-bold text-sm text-[var(--ink)] flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[var(--teal-deep)]" />
                    <span>माझे मागील बुकिंग ({bookings.length})</span>
                  </div>
                  <p className="text-[11px] text-[var(--warm-gray-600)] mt-1">
                    सर्व जुनी भाडी ट्रॅक करा व पुन्हा बुक करा
                  </p>
                </div>
                <span className="text-lg font-bold text-[var(--teal-deep)] group-hover:translate-x-1 transition-transform">→</span>
              </Link>

              <a
                href="tel:180087825"
                className="p-4 rounded-lg bg-white border border-[var(--warm-gray-200)] hover:border-emerald-600 shadow-2xs transition flex items-center justify-between group"
              >
                <div>
                  <div className="font-bold text-sm text-[var(--ink)] flex items-center gap-1.5">
                    <PhoneCall className="w-4 h-4 text-emerald-600" />
                    <span>ग्रामीण सहाय्यता केंद्र (Helpline)</span>
                  </div>
                  <p className="text-[11px] text-[var(--warm-gray-600)] mt-1">
                    टोल-फ्री १८०० ८७८२५ वर कॉल करा
                  </p>
                </div>
                <span className="text-lg font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </div>

            {/* Recent Freight Activity */}
            <div className="bg-white rounded-lg border border-[var(--warm-gray-200)] shadow-2xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--warm-gray-200)]">
                <div>
                  <h2 className="font-bold text-base text-[var(--ink)] font-[family-name:var(--font-display)] flex items-center gap-2">
                    <Package className="w-5 h-5 text-[var(--teal-deep)]" />
                    <span>चालू व अलीकडील भाडे (Active & Recent Orders)</span>
                  </h2>
                  <p className="text-xs text-[var(--warm-gray-600)] mt-0.5">
                    आपल्या मालाची थेट वाहतूक स्थिती व ट्रॅकिंग
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={loadUserBookings}
                    disabled={bookingsLoading}
                    className="px-3 py-1.5 rounded border border-[var(--warm-gray-200)] text-xs font-semibold text-[var(--warm-gray-700)] hover:bg-[var(--warm-gray-100)] inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${bookingsLoading ? "animate-spin" : ""}`} />
                    <span>रिफ्रेश</span>
                  </button>
                  <Link
                    href="/book"
                    className="text-xs font-bold text-[var(--teal-deep)] hover:underline inline-flex items-center gap-1"
                  >
                    <span>सर्व पहा ({bookings.length}) →</span>
                  </Link>
                </div>
              </div>

              {bookingsLoading ? (
                <div className="p-8 text-center text-xs font-bold text-[var(--warm-gray-500)] flex items-center justify-center gap-2">
                  <RotateCw className="w-4 h-4 animate-spin text-[var(--teal-deep)]" />
                  <span>ऑर्डर्स लोड होत आहेत...</span>
                </div>
              ) : bookings.length === 0 ? (
                <div className="p-10 text-center space-y-3">
                  <Package className="w-10 h-10 text-[var(--warm-gray-400)] mx-auto" />
                  <h3 className="font-bold text-sm text-[var(--ink)]">कोणतेही सक्रिय भाडे नाही</h3>
                  <p className="text-xs text-[var(--warm-gray-500)] max-w-sm mx-auto">
                    आपण अद्याप कोणतेही भाडे नोंदवलेले नाही. खालील बटणावर क्लिक करून पहिले बुकिंग करा!
                  </p>
                  <Link
                    href="/book"
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded bg-[var(--teal-deep)] text-white text-xs font-bold hover:bg-[#0b3836] shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4 text-[var(--marigold)]" />
                    <span>पहिले भाडे नोंदवा (Book Freight)</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.slice(0, 5).map((job) => {
                    const statusInfo = getStatusBadge(job.status);
                    return (
                      <div
                        key={job.id}
                        className="p-4 rounded-lg border border-[var(--warm-gray-200)] hover:border-[var(--teal-deep)] transition space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-[var(--ink)] font-[family-name:var(--font-display)]">
                              {job.bookingNumber}
                            </span>
                            <span className={`truck-badge text-[10px] ${statusInfo.cls}`}>
                              {statusInfo.text}
                            </span>
                            {job.goods?.isPerishable && (
                              <span className="truck-badge text-amber-800 border-amber-300 bg-amber-50 text-[10px]">
                                नाशवंत माल
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-black text-emerald-800 text-base">
                              {formatCurrency(job.fare?.totalFarePaise || 0)}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--warm-gray-700)]">
                          <div>
                            <span className="font-bold text-emerald-800">पिकअप:</span> {job.pickup?.address}
                          </div>
                          <div>
                            <span className="font-bold text-[var(--chili)]">डिलिव्हरी:</span> {job.drop?.address}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--warm-gray-100)] text-xs">
                          <span className="text-[var(--warm-gray-500)] text-[11px]">
                            माल: {job.goods?.description} ({job.goods?.weightKg} kg) • वाहन: {job.truckType}
                          </span>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/track/${job.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[var(--teal-deep)] text-white text-xs font-bold hover:bg-[#0b3836]"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>ट्रॅक करा (Track)</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ROLE 2: DRIVER DASHBOARD                                      */}
        {/* ============================================================== */}
        {user.role === "driver" && (
          <div className="space-y-6">
            {/* Driver Summary & Truck Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Truck Details Card */}
              <div className="bg-white p-5 rounded-lg border border-[var(--warm-gray-200)] shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--warm-gray-600)] uppercase">
                    पडताळणीकृत वाहन (Verified Truck)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                    सक्रिय
                  </span>
                </div>

                {truck ? (
                  <div>
                    <div className="text-xl font-black text-[var(--ink)] tracking-wider font-[family-name:var(--font-display)]">
                      {truck.registrationNumber}
                    </div>
                    <div className="text-xs text-[var(--warm-gray-600)] mt-1 space-y-0.5">
                      <div>प्रकार: <strong>{truck.truckType}</strong> ({truck.capacityKg} kg क्षमता)</div>
                      <div>बॉडी प्रकार: <strong>{truck.bodyType}</strong></div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded border border-amber-200">
                    कोणताही सक्रिय ट्रक जोडलेला नाही.
                    <Link href="/driver/onboarding" className="underline font-bold block mt-1">
                      ट्रक जोडा (Add Truck) →
                    </Link>
                  </div>
                )}
              </div>

              {/* Trust Score & Performance Card */}
              <div className="bg-white p-5 rounded-lg border border-[var(--warm-gray-200)] shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--warm-gray-600)] uppercase">
                    विश्वास व कार्यक्षमता (Trust Score)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--marigold)] text-black">
                    {driver?.trustTier?.toUpperCase() || "GOLD"} TIER
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-3xl font-black text-[var(--teal-deep)] font-[family-name:var(--font-display)]">
                    {driver?.trustScore || 85}/100
                  </div>
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                </div>

                <div className="text-xs text-[var(--warm-gray-600)] space-y-1">
                  <div>वेळेवर डिलिव्हरी: <strong>{driver?.onTimeRate || 100}%</strong></div>
                  <div>पूर्ण केलेल्या ट्रिप्स: <strong>{driver?.totalTripsCompleted || 0} ट्रिप्स</strong></div>
                </div>
              </div>

              {/* Wallet Card */}
              <div className="bg-white p-5 rounded-lg border border-[var(--warm-gray-200)] shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--warm-gray-600)] uppercase">
                    चालक पाकीट (Driver Wallet)
                  </span>
                  <Wallet className="w-4 h-4 text-emerald-600" />
                </div>

                <div>
                  <div className="text-2xl font-black text-emerald-800 font-[family-name:var(--font-display)]">
                    {formatCurrency(wallet?.balancePaise || 0)}
                  </div>
                  <div className="text-xs text-[var(--warm-gray-500)] mt-0.5">
                    एस्क्रो मधील शिल्लक: {formatCurrency(wallet?.escrowBalancePaise || 0)}
                  </div>
                </div>

                <Link
                  href="/driver/wallet"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--teal-deep)] hover:underline pt-1"
                >
                  <span>पाकीट तपशील व खात्यात ट्रान्सफर →</span>
                </Link>
              </div>
            </div>

            {/* Driver Action Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/driver/jobs"
                className="p-4 rounded-lg bg-[var(--teal-deep)] text-white hover:bg-[#0b3836] shadow-sm transition flex items-center justify-between group"
              >
                <div>
                  <div className="font-bold text-sm flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[var(--marigold)]" />
                    <span>जवळचे उपलब्ध भाडे शोधा (Find Loads)</span>
                  </div>
                  <p className="text-[11px] text-[var(--warm-gray-200)] mt-1">
                    जॉब बोर्डवर नवीन मागण्या स्वीकारा
                  </p>
                </div>
                <span className="text-lg font-bold group-hover:translate-x-1 transition-transform">→</span>
              </Link>

              <Link
                href="/driver/wallet"
                className="p-4 rounded-lg bg-white border border-[var(--warm-gray-200)] hover:border-[var(--teal-deep)] shadow-2xs transition flex items-center justify-between group"
              >
                <div>
                  <div className="font-bold text-sm text-[var(--ink)] flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-emerald-700" />
                    <span>माझे पाकीट (Wallet & Payouts)</span>
                  </div>
                  <p className="text-[11px] text-[var(--warm-gray-600)] mt-1">
                    ५०% ॲडव्हान्स व पूर्ण पेमेंट तपासा
                  </p>
                </div>
                <span className="text-lg font-bold text-[var(--teal-deep)] group-hover:translate-x-1 transition-transform">→</span>
              </Link>

              <Link
                href="/driver/documents"
                className="p-4 rounded-lg bg-white border border-[var(--warm-gray-200)] hover:border-[var(--teal-deep)] shadow-2xs transition flex items-center justify-between group"
              >
                <div>
                  <div className="font-bold text-sm text-[var(--ink)] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[var(--teal-deep)]" />
                    <span>कागदपत्रे व्यवस्थापन (KYC Docs)</span>
                  </div>
                  <p className="text-[11px] text-[var(--warm-gray-600)] mt-1">
                    ड्रायव्हिंग लायसन्स, RC व विमा कागदपत्रे
                  </p>
                </div>
                <span className="text-lg font-bold text-[var(--teal-deep)] group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ROLE 3: TRUCK MITRA (AGENT) DASHBOARD                         */}
        {/* ============================================================== */}
        {user.role === "truck_mitra" && (
          <div className="bg-white rounded-lg border border-[var(--warm-gray-200)] shadow-2xs p-6 space-y-4">
            <h2 className="text-lg font-bold text-[var(--ink)] font-[family-name:var(--font-display)] flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-700" />
              <span>ट्रक मित्र ग्रामीण केंद्र (Truck Mitra Kiosk)</span>
            </h2>
            <p className="text-xs text-[var(--warm-gray-600)]">
              गावातील शेतकरी व स्थानिक व्यापाऱ्यांसाठी थेट मालवाहतूक बुकिंग करा आणि प्रति ट्रिप कमिशन मिळवा.
            </p>
            <div className="pt-2">
              <Link
                href="/mitra"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm"
              >
                <span>ट्रक मित्र किऑस्क उघडा (Open Mitra Console) →</span>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[var(--warm-gray-300)] shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--warm-gray-200)]">
              <h3 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[var(--teal-deep)]" />
                <span>माहिती संपादित करा (Edit Profile)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[var(--warm-gray-700)] mb-1">
                  पूर्ण नाव / व्यवसायाचे नाव (Full Name / Business):
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="उदा. रमेश पाटील"
                  required
                  className="w-full px-3 py-2 rounded border border-[var(--warm-gray-300)] focus:border-[var(--teal-deep)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--warm-gray-700)] mb-1">
                  जिल्हा (District):
                </label>
                <input
                  type="text"
                  value={editDistrict}
                  onChange={(e) => setEditDistrict(e.target.value)}
                  placeholder="उदा. पालघर, नाशिक, पुणे"
                  className="w-full px-3 py-2 rounded border border-[var(--warm-gray-300)] focus:border-[var(--teal-deep)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--warm-gray-700)] mb-1">
                  गाव / तालुका (Village / Taluka):
                </label>
                <input
                  type="text"
                  value={editVillage}
                  onChange={(e) => setEditVillage(e.target.value)}
                  placeholder="उदा. मनोर, डहाणू"
                  className="w-full px-3 py-2 rounded border border-[var(--warm-gray-300)] focus:border-[var(--teal-deep)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--warm-gray-700)] mb-1">
                  व्यवसाय प्रकार (Business / Farmer Category):
                </label>
                <input
                  type="text"
                  value={editBusinessType}
                  onChange={(e) => setEditBusinessType(e.target.value)}
                  placeholder="उदा. फळबागायतदार, भाजीपाला व्यापारी"
                  className="w-full px-3 py-2 rounded border border-[var(--warm-gray-300)] focus:border-[var(--teal-deep)] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--warm-gray-200)]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded border border-[var(--warm-gray-300)] text-[var(--warm-gray-700)] hover:bg-[var(--warm-gray-100)]"
                >
                  रद्द करा (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="px-5 py-2 rounded bg-[var(--teal-deep)] text-white font-bold hover:bg-[#0b3836] shadow-sm disabled:opacity-50"
                >
                  {updatingProfile ? "जतन करत आहे..." : "जतन करा (Save Changes)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
