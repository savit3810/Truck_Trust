"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BRAND_NAME } from "@/lib/config/brand";
import { formatCurrency } from "@/i18n/config";
import { Truck, MapPin, CheckCircle2, RotateCw, PhoneCall, AlertCircle, RefreshCw } from "lucide-react";

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

export default function DriverJobsPage() {
  const [tab, setTab] = useState<"open" | "my_jobs">("open");
  const [openJobs, setOpenJobs] = useState<BookingItem[]>([]);
  const [myJobs, setMyJobs] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Driver auth & status state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isDriverRole, setIsDriverRole] = useState(false);
  const [hasVerifiedTruck, setHasVerifiedTruck] = useState(false);
  const [driverKycStatus, setDriverKycStatus] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  // Check driver auth and status on mount
  useEffect(() => {
    async function checkDriverAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        if (!data.authenticated) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        setIsAuthenticated(true);
        setUserName(data.user?.name || null);

        if (data.user?.role !== "driver") {
          setIsDriverRole(false);
          setLoading(false);
          return;
        }

        setIsDriverRole(true);

        if (data.driver) {
          setDriverKycStatus(data.driver.kycStatus || null);
          setHasVerifiedTruck(Boolean(data.truck || data.driver.truckId));
        } else {
          setDriverKycStatus("not_registered");
          setHasVerifiedTruck(false);
        }
      } catch {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
    }

    checkDriverAuth();
  }, []);

  // Load jobs only when driver auth is confirmed
  useEffect(() => {
    if (isAuthenticated === null || !isDriverRole) return;

    let ignore = false;
    async function loadJobs() {
      setLoading(true);
      try {
        const [openRes, myRes] = await Promise.all([
          fetch("/api/bookings?scope=open_jobs"),
          fetch("/api/bookings"),
        ]);

        const openData = await openRes.json();
        const myData = await myRes.json();

        if (!ignore) {
          if (openData.success) setOpenJobs(openData.bookings || []);
          if (myData.success) setMyJobs(myData.bookings || []);
        }
      } catch {
        if (!ignore) setError("नेटवर्क त्रुटी - कृपया पुन्हा प्रयत्न करा (Network error)");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadJobs();
    return () => {
      ignore = true;
    };
  }, [refreshTrigger, isAuthenticated, isDriverRole]);

  const handleAcceptJob = async (bookingId: string) => {
    if (driverKycStatus && driverKycStatus !== "verified") {
      setError("आपली KYC पडताळणी प्रलंबित आहे. प्रशासकाकडून मंजुरी मिळाल्यानंतर आपण भाडे स्वीकारू शकता. (Your driver KYC must be verified by admin before accepting freight jobs.)");
      return;
    }
    if (!hasVerifiedTruck) {
      setError("आपल्या खात्याशी कोणताही सक्रिय पडताळणीकृत ट्रक जोडलेला नाही. कृपया प्रथम ट्रक नोंदणी करा. (No active verified truck found for your account.)");
      return;
    }

    setAcceptingId(bookingId);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/bookings/${bookingId}/accept`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to accept job");
      } else {
        setSuccess("भाडे स्वीकारले! आपण आता पिकअप ठिकाणी जाऊ शकता. (Job accepted successfully!)");
        setTab("my_jobs");
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch {
      setError("Network error occurred");
    } finally {
      setAcceptingId(null);
    }
  };

  const currentList = tab === "open" ? openJobs : myJobs;

  return (
    <div className="min-h-screen bg-[var(--warm-gray-50)] text-[var(--ink)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--warm-gray-200)] py-4 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[var(--teal-deep)] flex items-center justify-center text-[var(--marigold)]">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight font-[family-name:var(--font-display)]">
              {BRAND_NAME} • चालक जॉब बोर्ड (Driver Job Board)
            </h1>
            <p className="text-xs text-[var(--warm-gray-500)]">
              महाराष्ट्रातील शेतकरी व स्थानिक व्यापाऱ्यांचे थेट भाडे
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/driver/wallet"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[var(--teal-deep)] hover:bg-[#0b3836] text-xs font-bold text-white shadow-sm"
          >
            <span>माझे पाकीट (Wallet)</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setRefreshTrigger((prev) => prev + 1);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--warm-gray-100)] hover:bg-[var(--warm-gray-200)] text-xs font-bold text-[var(--warm-gray-800)] border border-[var(--warm-gray-300)]"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[var(--teal-deep)]" />
            <span>रिफ्रेश (Refresh)</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Auth Gate: Not logged in */}
        {isAuthenticated === false && (
          <div className="p-8 text-center bg-white rounded-lg border border-[var(--warm-gray-200)] mt-4">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <h2 className="font-bold text-lg text-[var(--ink)] mb-2">
              कृपया प्रथम लॉगिन करा (Please Login First)
            </h2>
            <p className="text-xs text-[var(--warm-gray-600)] mb-4">
              जॉब बोर्ड पाहण्यासाठी आपल्याला चालक खाते म्हणून लॉगिन करणे आवश्यक आहे.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-[var(--teal-deep)] text-white text-xs font-bold hover:bg-[#0b3836]"
            >
              <span>मुख्यपृष्ठावर जा व लॉगिन करा (Go to Home & Login)</span>
            </Link>
          </div>
        )}

        {/* Auth Gate: Logged in but NOT a driver role */}
        {isAuthenticated === true && !isDriverRole && (
          <div className="p-8 text-center bg-white rounded-lg border border-amber-200 mt-4">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <h2 className="font-bold text-lg text-[var(--ink)] mb-2">
              {userName ? `${userName}, ` : ""}हा विभाग फक्त चालकांसाठी आहे
            </h2>
            <p className="text-xs text-[var(--warm-gray-600)] mb-1">
              तुम्ही सध्या उद्योजक/प्रशासक म्हणून लॉगिन आहात. जॉब बोर्ड फक्त नोंदणीकृत चालकांसाठी उपलब्ध आहे.
            </p>
            <p className="text-xs text-[var(--warm-gray-600)] mb-4">
              (This section is for verified drivers only. You are logged in as an entrepreneur/admin.)
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/driver/onboarding"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-[var(--teal-deep)] text-white text-xs font-bold hover:bg-[#0b3836]"
              >
                <Truck className="w-4 h-4" />
                <span>चालक म्हणून नोंदणी करा (Register as Driver)</span>
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded border border-[var(--warm-gray-300)] text-xs font-bold text-[var(--warm-gray-700)] hover:bg-[var(--warm-gray-100)]"
              >
                <span>मुख्यपृष्ठ (Home)</span>
              </Link>
            </div>
          </div>
        )}

        {/* Driver status warnings */}
        {isAuthenticated === true && isDriverRole && (
          <>
            {driverKycStatus && driverKycStatus !== "verified" && (
              <div className="mb-4 p-3.5 rounded bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>
                  तुमची KYC पडताळणी <strong>{driverKycStatus === "pending" ? "प्रलंबित" : "नाकारली"}</strong> आहे.
                  {driverKycStatus === "pending"
                    ? " प्रशासकाद्वारे मंजुरी मिळाल्यावर तुम्ही भाडे स्वीकारू शकता."
                    : " कृपया प्रशासकाशी संपर्क साधा."}
                  {" "}(KYC status: {driverKycStatus})
                </span>
              </div>
            )}

            {!hasVerifiedTruck && (
              <div className="mb-4 p-3.5 rounded bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <div>
                  <span>तुमच्या खात्याशी कोणताही सक्रिय पडताळणीकृत ट्रक जोडलेला नाही. </span>
                  <Link href="/driver/onboarding" className="underline font-bold text-[var(--teal-deep)]">
                    ट्रक नोंदणी करा (Register Truck)
                  </Link>
                  <span className="ml-1">(No active verified truck found for your account.)</span>
                </div>
              </div>
            )}
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-[var(--warm-gray-300)] pb-2">
          <button
            type="button"
            onClick={() => setTab("open")}
            className={`px-4 py-2 text-xs font-bold rounded-t transition-colors ${
              tab === "open"
                ? "bg-white text-[var(--teal-deep)] border-t-2 border-t-[var(--teal-deep)] border-x border-[var(--warm-gray-200)] shadow-2xs"
                : "text-[var(--warm-gray-600)] hover:text-[var(--ink)]"
            }`}
          >
            जवळचे उपलब्ध भाडे (Open Loads - {openJobs.length})
          </button>

          <button
            type="button"
            onClick={() => setTab("my_jobs")}
            className={`px-4 py-2 text-xs font-bold rounded-t transition-colors ${
              tab === "my_jobs"
                ? "bg-white text-[var(--teal-deep)] border-t-2 border-t-[var(--teal-deep)] border-x border-[var(--warm-gray-200)] shadow-2xs"
                : "text-[var(--warm-gray-600)] hover:text-[var(--ink)]"
            }`}
          >
            माझ्या स्वीकारलेल्या ट्रिप्स (My Active Trips - {myJobs.length})
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded bg-red-50 border border-red-200 text-xs text-[var(--chili)] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3.5 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-[var(--warm-gray-500)] flex items-center justify-center gap-2">
            <RotateCw className="w-4 h-4 animate-spin text-[var(--teal-deep)]" />
            <span>भाडे लोड होत आहे...</span>
          </div>
        ) : currentList.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-lg border border-[var(--warm-gray-200)]">
            <Truck className="w-8 h-8 text-[var(--warm-gray-400)] mx-auto mb-2" />
            <h3 className="font-bold text-sm text-[var(--ink)]">
              {tab === "open" ? "सध्या आपल्या कार्यक्षेत्रात नवीन भाडे नाही" : "आपल्याकडे सध्या कोणतीही चालू ट्रिप नाही"}
            </h3>
            <p className="text-xs text-[var(--warm-gray-500)] mt-1">
              नवीन ऑर्डर येताच आपल्याला त्वरित सूचना मिळेल.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentList.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-lg border border-[var(--warm-gray-200)] shadow-2xs p-5 sm:p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--warm-gray-200)]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[var(--ink)] font-[family-name:var(--font-display)]">
                        {job.bookingNumber}
                      </span>
                      <span className="truck-badge text-emerald-800 border-emerald-300 bg-emerald-50 text-[10px]">
                        {job.status === "requested" ? "नवीन मागणी" : "स्वीकारले • चालू"}
                      </span>
                      {job.goods.isPerishable && (
                        <span className="truck-badge text-amber-800 border-amber-300 bg-amber-50 text-[10px]">
                          नाशवंत माल (तात्काळ)
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[var(--warm-gray-500)] block mt-0.5">
                      वाहन प्रकार: {job.truckType} • अंतर: {job.route.distanceKm} किमी ({job.route.durationMinutes} मिनिटे)
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-black text-emerald-800 font-[family-name:var(--font-display)]">
                      {formatCurrency(job.fare.totalFarePaise)}
                    </div>
                    <span className="text-[10px] text-[var(--warm-gray-500)] block">
                      ५०% ॲडव्हान्स: {formatCurrency(job.fare.advance50Paise)}
                    </span>
                  </div>
                </div>

                {/* Pickup and Drop Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-[var(--warm-gray-50)] rounded border border-[var(--warm-gray-200)]">
                    <div className="flex items-center gap-1.5 font-bold text-[var(--teal-deep)] uppercase text-[11px] mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>पिकअप (Pickup):</span>
                    </div>
                    <p className="font-semibold text-[var(--ink)]">{job.pickup.address}</p>
                    <div className="text-[11px] text-[var(--warm-gray-600)] mt-1">
                      संपर्क: {job.pickup.contactName} ({job.pickup.contactPhone})
                    </div>
                  </div>

                  <div className="p-3 bg-[var(--warm-gray-50)] rounded border border-[var(--warm-gray-200)]">
                    <div className="flex items-center gap-1.5 font-bold text-[var(--chili)] uppercase text-[11px] mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>डिलिव्हरी (Drop):</span>
                    </div>
                    <p className="font-semibold text-[var(--ink)]">{job.drop.address}</p>
                    <div className="text-[11px] text-[var(--warm-gray-600)] mt-1">
                      स्वीकारणारा: {job.drop.receiverName} ({job.drop.receiverPhone})
                    </div>
                  </div>
                </div>

                {/* Cargo Details & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
                  <div className="text-[var(--warm-gray-700)]">
                    <span className="font-bold">माल:</span> {job.goods.description} ({job.goods.weightKg} kg)
                  </div>

                  <div className="flex items-center gap-2">
                    {tab === "open" ? (
                      <button
                        type="button"
                        disabled={acceptingId === job.id || !hasVerifiedTruck || driverKycStatus !== "verified"}
                        onClick={() => handleAcceptJob(job.id)}
                        title={
                          driverKycStatus !== "verified"
                            ? "KYC पडताळणी प्रलंबित आहे (KYC verification pending)"
                            : !hasVerifiedTruck
                            ? "सक्रिय पडताळणीकृत ट्रक आवश्यक आहे (Verified truck required)"
                            : "भाडे स्वीकारा (Accept Load)"
                        }
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {acceptingId === job.id ? (
                          <RotateCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        <span>भाडे स्वीकारा (Accept Load)</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:+91${job.pickup.contactPhone}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--teal-deep)] text-white text-xs font-bold"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>कॉल करा (Call Sender)</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
          </>
        )}
      </main>
    </div>
  );
}
