"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BRAND_NAME } from "@/lib/config/brand";
import { ShieldCheck, Check, X, FileText, RotateCw, ExternalLink, RefreshCw, AlertTriangle } from "lucide-react";

interface DriverItem {
  id: string;
  user: {
    id: string;
    name: string;
    phone: string;
    registeredAt: string;
  } | null;
  licenseNumber: string;
  experienceYears: number;
  operatingDistricts: string[];
  kycStatus: "pending" | "verified" | "rejected" | "action_needed";
  trustScore: number;
  onTimeRate: number;
  totalTripsCompleted: number;
  truck: {
    id: string;
    registrationNumber: string;
    truckType: string;
    capacityKg: number;
    bodyType: string;
    isAvailable: boolean;
  } | null;
  documents: {
    id: string;
    docType: string;
    fileUrl: string;
    originalFilename: string;
    status: string;
    expiryDate?: string;
  }[];
}

type FilterStatus = "pending" | "verified" | "rejected" | "all";

export default function AdminVerificationsPage() {
  const [drivers, setDrivers] = useState<DriverItem[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("pending");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModalDriverId, setRejectModalDriverId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("लायसन्स प्रत अस्पष्ट आहे / कृपया स्पष्ट फोटो जोडा");
  const [cronStatus, setCronStatus] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        const res = await fetch(`/api/admin/verifications?status=${filter}`);
        const data = await res.json();
        if (!ignore) {
          if (data.success) {
            setDrivers(data.drivers || []);
            setAuthError(null);
          } else {
            setAuthError(data.error || "Failed to load verifications");
          }
        }
      } catch (e) {
        if (!ignore) setAuthError("Network error loading verification queue");
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, [filter, refreshTrigger]);

  const handleAction = async (driverId: string, action: "approve" | "reject" | "request_info", reason?: string) => {
    setActionLoading(driverId);
    try {
      const res = await fetch(`/api/admin/verifications/${driverId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      const data = await res.json();
      if (data.success) {
        setRejectModalDriverId(null);
        setRefreshTrigger((prev) => prev + 1);
      } else {
        alert(data.error || "Action failed");
      }
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRunCron = async () => {
    setCronStatus("Checking document validity...");
    try {
      const res = await fetch("/api/cron/document-expiry", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setCronStatus(
          `Cron Check Complete: ${data.expiredCount} expired documents, ${data.suspendedDriversCount} drivers suspended, ${data.expiringSoonCount} 30-day alerts.`
        );
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch {
      setCronStatus("Cron check execution failed");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--warm-gray-50)] text-[var(--ink)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--warm-gray-200)] py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[var(--teal-deep)] flex items-center justify-center text-[var(--marigold)]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight font-[family-name:var(--font-display)]">
                {BRAND_NAME} • प्रशासन नियंत्रण कक्ष
              </span>
              <span className="truck-badge text-amber-800 border-amber-300 bg-amber-50">
                Admin Console
              </span>
            </div>
            <p className="text-xs text-[var(--warm-gray-500)]">
              चालक व वाहन पडताळणी रांग (Driver & Vehicle Verification Queue)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRunCron}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--warm-gray-100)] hover:bg-[var(--warm-gray-200)] text-xs font-bold text-[var(--warm-gray-800)] border border-[var(--warm-gray-300)]"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[var(--teal-deep)]" />
            <span>कालबाह्यता तपासणी (Run Expiry Cron)</span>
          </button>
        </div>
      </header>

      {cronStatus && (
        <div className="max-w-6xl mx-auto mt-4 px-4">
          <div className="p-3 rounded bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
            <span>{cronStatus}</span>
            <button
              type="button"
              onClick={() => setCronStatus(null)}
              className="text-blue-700 font-bold ml-2"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {authError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div className="text-sm">
                <span className="font-semibold">प्रवेश नाकारला (Access Required): </span>
                {authError}
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
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-[var(--warm-gray-300)] pb-2">
          {(
            [
              { id: "pending", label: "प्रलंबित पडताळणी (Pending Review)" },
              { id: "verified", label: "मंजूर चालक (Verified)" },
              { id: "rejected", label: "नाकारलेले (Rejected)" },
              { id: "all", label: "सर्व अर्ज (All)" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setLoading(true);
                setFilter(tab.id);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-t transition-colors ${
                filter === tab.id
                  ? "bg-white text-[var(--teal-deep)] border-t-2 border-t-[var(--teal-deep)] border-x border-[var(--warm-gray-200)] shadow-2xs"
                  : "text-[var(--warm-gray-600)] hover:text-[var(--ink)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Drivers List */}
        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-[var(--warm-gray-500)] flex items-center justify-center gap-2">
            <RotateCw className="w-4 h-4 animate-spin" />
            <span>अर्ज लोड होत आहेत...</span>
          </div>
        ) : drivers.length === 0 ? (
          <div className="p-12 text-center bg-white rounded border border-[var(--warm-gray-200)]">
            <Check className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-[var(--ink)]">या श्रेणीत कोणतेही अर्ज नाहीत</h3>
            <p className="text-xs text-[var(--warm-gray-500)] mt-1">सर्व ड्रायव्हर अर्जांची तपासणी पूर्ण झाली आहे.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {drivers.map((d) => (
              <div
                key={d.id}
                className="bg-white rounded border border-[var(--warm-gray-200)] shadow-2xs p-5 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[var(--warm-gray-200)]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-[var(--ink)]">
                        {d.user?.name || "नोंदणीकृत चालक"}
                      </h3>
                      <span
                        className={`truck-badge text-xs ${
                          d.kycStatus === "verified"
                            ? "text-emerald-800 border-emerald-300 bg-emerald-50"
                            : d.kycStatus === "rejected"
                            ? "text-rose-800 border-rose-300 bg-rose-50"
                            : "text-amber-800 border-amber-300 bg-amber-50"
                        }`}
                      >
                        {d.kycStatus === "verified" ? "मंजूर • VERIFIED" : d.kycStatus === "rejected" ? "नाकारले • REJECTED" : "प्रलंबित • PENDING"}
                      </span>
                    </div>

                    <div className="text-xs text-[var(--warm-gray-600)] mt-1 flex flex-wrap gap-x-4 gap-y-1 font-mono">
                      <span>मोबाईल: +91 {d.user?.phone || "N/A"}</span>
                      <span>लायसन्स: {d.licenseNumber}</span>
                      <span>अनुभव: {d.experienceYears} वर्षे</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {d.kycStatus !== "verified" && (
                      <button
                        type="button"
                        disabled={actionLoading === d.id}
                        onClick={() => handleAction(d.id, "approve")}
                        className="flex items-center gap-1.5 px-4 py-2 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        <span>मंजूर करा (Approve)</span>
                      </button>
                    )}

                    {d.kycStatus !== "rejected" && (
                      <button
                        type="button"
                        disabled={actionLoading === d.id}
                        onClick={() => setRejectModalDriverId(d.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded bg-rose-50 hover:bg-rose-100 text-[var(--chili)] border border-rose-200 font-bold text-xs disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        <span>नाकारा (Reject)</span>
                      </button>
                    )}

                    <a
                      href={`/driver/${d.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded text-[var(--teal-deep)] hover:bg-[var(--warm-gray-100)] border border-[var(--warm-gray-300)]"
                      title="पब्लिक प्रोफाइल पहा"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Truck & Operating Districts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-[var(--warm-gray-200)] text-xs">
                  <div>
                    <span className="font-bold text-[var(--warm-gray-700)] uppercase block mb-1">वाहन माहिती (Truck Specs):</span>
                    {d.truck ? (
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-[var(--ink)] bg-[var(--cream)] px-2 py-0.5 rounded border border-[var(--warm-gray-300)]">
                          {d.truck.registrationNumber}
                        </span>
                        <div className="text-[var(--warm-gray-600)] mt-1">
                          प्रकार: {d.truck.truckType} • क्षमता: {d.truck.capacityKg} kg • बॉडी: {d.truck.bodyType}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[var(--warm-gray-500)] italic">ट्रक नोंदणी प्रलंबित</span>
                    )}
                  </div>

                  <div>
                    <span className="font-bold text-[var(--warm-gray-700)] uppercase block mb-1">कार्यक्षेत्र (Operating Districts):</span>
                    <div className="flex flex-wrap gap-1">
                      {d.operatingDistricts.map((dist) => (
                        <span key={dist} className="px-2 py-0.5 rounded bg-[var(--warm-gray-100)] text-[var(--warm-gray-800)] text-[11px] font-semibold">
                          {dist}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Uploaded Documents */}
                <div className="pt-4">
                  <span className="font-bold text-xs text-[var(--warm-gray-700)] uppercase block mb-2">अपलोड केलेली कागदपत्रे (Uploaded Documents):</span>
                  {d.documents.length === 0 ? (
                    <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 inline-block">
                      कोणतीही कागदपत्रे अपलोड केलेली नाहीत
                    </span>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      {d.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-2.5 rounded bg-[var(--warm-gray-50)] border border-[var(--warm-gray-200)] flex items-center justify-between text-xs"
                        >
                          <div className="overflow-hidden pr-2">
                            <span className="font-bold text-[var(--ink)] block truncate">
                              {doc.docType.replace("_", " ").toUpperCase()}
                            </span>
                            <span className="text-[10px] text-[var(--warm-gray-500)] block">
                              {doc.expiryDate ? `वैधता: ${new Date(doc.expiryDate).toLocaleDateString("en-IN")}` : "मुदत नमूद नाही"}
                            </span>
                          </div>
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded hover:bg-white text-[var(--teal-deep)]"
                            title="कागदपत्र पहा"
                          >
                            <FileText className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reject Modal */}
        {rejectModalDriverId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
              <h3 className="text-base font-bold text-[var(--ink)]">
                अर्ज नाकारण्याचे कारण नमूद करा (Rejection Reason)
              </h3>
              <p className="text-xs text-[var(--warm-gray-600)]">
                हे कारण चालकाला एसएमएस व ॲप नोटिफिकेशनद्वारे कळवले जाईल जेणेकरून तो योग्य कागदपत्रे पुन्हा अपलोड करू शकेल.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full p-3 rounded border border-[var(--warm-gray-300)] text-xs focus:outline-none focus:border-[var(--chili)] font-medium"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectModalDriverId(null)}
                  className="px-4 py-2 rounded text-xs font-bold text-[var(--warm-gray-700)] bg-[var(--warm-gray-100)]"
                >
                  रद्द करा
                </button>
                <button
                  type="button"
                  onClick={() => handleAction(rejectModalDriverId, "reject", rejectionReason)}
                  className="px-4 py-2 rounded text-xs font-bold text-white bg-[var(--chili)] hover:bg-[#a6301d]"
                >
                  नाकारणे निश्चित करा
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
