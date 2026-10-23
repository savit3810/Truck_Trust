"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BRAND_NAME } from "@/lib/config/brand";
import {
  Truck,
  MapPin,
  ShieldCheck,
  PhoneCall,
  QrCode,
  AlertOctagon,
  CheckCircle2,
  RotateCw,
  ArrowLeft,
  Navigation,
  Sparkles,
  Camera,
  Star,
} from "lucide-react";

interface TrackingData {
  bookingNumber: string;
  status: string;
  pickup: {
    address: string;
    district: string;
    contactName: string;
    contactPhone: string;
    coordinates: [number, number];
  };
  drop: {
    address: string;
    district: string;
    receiverName: string;
    receiverPhone: string;
    coordinates: [number, number];
  };
  route: {
    distanceKm: number;
    durationMinutes: number;
  };
  tracking?: {
    currentLocation?: {
      coordinates: [number, number];
    };
    speedKmh?: number;
    etaMinutes?: number;
    heading?: number;
  };
}

function LiveTrackingContent() {
  const params = useParams();
  const bookingId = params.id as string;

  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sseConnected, setSseConnected] = useState(false);

  // Delivery Proof State
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [deliveryOtp, setDeliveryOtp] = useState<string | null>(null);
  const [proofLoading, setProofLoading] = useState(false);

  // Driver Verification Form (Driver scanning / inputting OTP)
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [inputOtp, setInputOtp] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState<string | null>(null);

  // Emergency SOS State
  const [showSosModal, setShowSosModal] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [sosHelplines, setSosHelplines] = useState<{ name: string; number: string }[]>([]);

  // Simulation controls (for demonstrating live truck movement along the highway)
  const [simulating, setSimulating] = useState(false);

  // Two-Way Review & Rating State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [punctualityRating, setPunctualityRating] = useState(5);
  const [cargoCareRating, setCargoCareRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [drivingSafetyRating, setDrivingSafetyRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  // Connect SSE Live Stream
  useEffect(() => {
    if (!bookingId) return;

    let eventSource: EventSource | null = null;
    let pollInterval: NodeJS.Timeout | null = null;

    try {
      eventSource = new EventSource(`/api/tracking/${bookingId}/stream`);

      eventSource.onopen = () => {
        setSseConnected(true);
        setLoading(false);
      };

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "initial") {
            setData(payload);
          }
        } catch {
          // ignore heartbeat
        }
      };

      eventSource.addEventListener("location", (event: MessageEvent) => {
        try {
          const loc = JSON.parse(event.data);
          setData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              tracking: {
                ...prev.tracking,
                currentLocation: { coordinates: loc.coordinates },
                speedKmh: loc.speedKmh ?? prev.tracking?.speedKmh,
                etaMinutes: loc.etaMinutes ?? prev.tracking?.etaMinutes,
                heading: loc.heading ?? prev.tracking?.heading,
              },
            };
          });
        } catch {
          // ignore
        }
      });

      eventSource.onerror = () => {
        setSseConnected(false);
      };
    } catch {
      // EventSource instantiation failed (fallback to polling handles state)
    }

    // Polling fallback if SSE drops
    const loadBookingData = async () => {
      try {
        const res = await fetch(`/api/bookings`);
        const json = await res.json();
        if (json.success) {
          const match = json.bookings.find((b: { id: string }) => b.id === bookingId);
          if (match) {
            setData(match);
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    loadBookingData();
    pollInterval = setInterval(loadBookingData, 10000);

    return () => {
      if (eventSource) eventSource.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [bookingId]);

  // Request Receiver Delivery Proof (QR & 6-digit OTP)
  const handleInitiateProof = async () => {
    setProofLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/delivery-proof/initiate`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        setQrCodeDataUrl(json.qrCodeDataUrl);
        setDeliveryOtp(json.otp);
        setShowQrModal(true);
      } else {
        setError(json.error || "डिलिव्हरी कोड तयार करण्यात अडचण आली");
      }
    } catch {
      setError("नेटवर्क त्रुटी");
    } finally {
      setProofLoading(false);
    }
  };

  // Submit delivery verification (Driver verifies receiver's OTP)
  const handleVerifyDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/verify-delivery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otp: inputOtp.trim(),
          dropPhotos: ["/uploads/cargo_delivered_safe.jpg"],
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "डिलिव्हरी पडताळणी अयशस्वी");
      } else {
        setVerifySuccess(json.message);
        setShowVerifyModal(false);
        if (data) {
          setData({ ...data, status: "completed" });
        }
      }
    } catch {
      setError("डिलिव्हरी नोंदवताना त्रुटी आली");
    } finally {
      setVerifyLoading(false);
    }
  };

  // Trigger Emergency SOS
  const handleTriggerSos = async () => {
    setSosLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/sos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: "Highway emergency / roadside assistance requested",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSosSent(true);
        setSosHelplines(json.emergencyHelplines || []);
      }
    } catch {
      setError("SOS पाठवण्यात अडचण आली");
    } finally {
      setSosLoading(false);
    }
  };

  // Simulate truck movement along the corridor (e.g. from Palghar towards Bhiwandi)
  const handleSimulateMovement = async () => {
    setSimulating(true);
    try {
      // Small progress along route
      const currentCoords = data?.tracking?.currentLocation?.coordinates || [72.7699, 19.6967];
      const targetCoords: [number, number] = [
        currentCoords[0] + 0.05,
        currentCoords[1] - 0.04,
      ];
      const nextSpeed = Math.floor(Math.random() * 20) + 45; // 45-65 km/h
      const nextEta = Math.max(10, (data?.tracking?.etaMinutes || 60) - 8);

      await fetch(`/api/tracking/${bookingId}/update-location`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          longitude: targetCoords[0],
          latitude: targetCoords[1],
          heading: 145,
          speedKmh: nextSpeed,
          etaMinutes: nextEta,
        }),
      });
    } catch {
      // ignore
    } finally {
      setSimulating(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: reviewRating,
          categories: {
            punctuality: punctualityRating,
            cargoCare: cargoCareRating,
            communication: communicationRating,
            drivingSafety: drivingSafetyRating,
          },
          comment: reviewComment,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setReviewSuccess("अभिप्राय यशस्वीरीत्या नोंदवला गेला! चालकाचे विश्वासू गुण अपडेट झाले (Review saved & driver trust recalculated)");
        setShowReviewModal(false);
      } else {
        alert(json.error || "Review submission failed");
      }
    } catch {
      alert("Network error submitting review");
    } finally {
      setReviewLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="truck-badge text-emerald-800 bg-emerald-50 border-emerald-300">डिलिव्हरी पूर्ण (Delivered)</span>;
      case "in_transit":
        return <span className="truck-badge text-blue-800 bg-blue-50 border-blue-300">प्रवासात आहे (In Transit)</span>;
      case "accepted":
        return <span className="truck-badge text-amber-800 bg-amber-50 border-amber-300">चालक नियुक्त (Driver Assigned)</span>;
      default:
        return <span className="truck-badge text-gray-700 bg-gray-100 border-gray-300">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--warm-gray-50)] text-[var(--ink)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--warm-gray-200)] py-3 px-4 sm:px-8 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 rounded hover:bg-[var(--warm-gray-100)] text-[var(--warm-gray-600)]"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <span className="font-[family-name:var(--font-display)] font-extrabold text-lg text-[var(--teal-deep)] tracking-tight">
                {BRAND_NAME}
              </span>
              <span className="text-xs text-[var(--warm-gray-500)] ml-2">
                थेट ट्रॅकिंग व डिजिटल वितरण (Live GPS & Proof)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                sseConnected
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  sseConnected ? "bg-emerald-600 animate-pulse" : "bg-amber-600"
                }`}
              />
              <span>{sseConnected ? "थेट GPS जोडले" : "कनेक्टिंग..."}</span>
            </span>

            <button
              type="button"
              onClick={() => setShowSosModal(true)}
              className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded shadow-sm transition-all"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>SOS मदत</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="p-3.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {verifySuccess && (
          <div className="p-3.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{verifySuccess}</span>
          </div>
        )}

        {reviewSuccess && (
          <div className="p-3.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <Star className="w-4 h-4 shrink-0 fill-amber-500 text-amber-500" />
            <span>{reviewSuccess}</span>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-xs font-bold text-[var(--warm-gray-500)] flex items-center justify-center gap-2">
            <RotateCw className="w-4 h-4 animate-spin text-[var(--teal-deep)]" />
            <span>थेट ट्रॅकिंग डेटा लोड होत आहे...</span>
          </div>
        ) : data ? (
          <>
            {/* Live Status Card */}
            <div className="bg-white rounded-xl border border-[var(--warm-gray-200)] shadow-sm p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--warm-gray-200)] pb-3">
                <div>
                  <div className="text-[11px] font-mono text-[var(--warm-gray-500)] uppercase">
                    बुकिंग क्रमांक
                  </div>
                  <h1 className="text-xl font-black font-mono text-[var(--ink)]">
                    {data.bookingNumber}
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(data.status)}
                </div>
              </div>

              {/* Highway Corridor Map Simulation Visualizer */}
              <div className="bg-emerald-950 text-white p-5 rounded-lg relative overflow-hidden shadow-inner">
                <div className="flex items-center justify-between text-xs text-emerald-200 border-b border-emerald-800/80 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-[var(--marigold)] animate-spin" />
                    <span className="font-bold">महाराष्ट्र महामार्ग कॉरिडॉर थेट दृश्य</span>
                  </div>
                  <div className="font-mono text-[11px]">
                    वेग: <span className="text-[var(--marigold)] font-bold">{data.tracking?.speedKmh || 48} किमी/तास</span> • उर्वरित वेळ: <span className="text-[var(--marigold)] font-bold">{data.tracking?.etaMinutes || 35} मिनिटे</span>
                  </div>
                </div>

                {/* Road Corridor Progress Line */}
                <div className="py-4 relative">
                  <div className="h-2 bg-emerald-900 rounded-full w-full relative">
                    <div
                      className="h-2 bg-[var(--marigold)] rounded-full transition-all duration-700"
                      style={{
                        width:
                          data.status === "completed"
                            ? "100%"
                            : data.status === "in_transit"
                            ? "65%"
                            : "25%",
                      }}
                    />
                  </div>

                  {/* Truck Icon moving */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 transition-all duration-700 flex flex-col items-center"
                    style={{
                      left:
                        data.status === "completed"
                          ? "92%"
                          : data.status === "in_transit"
                          ? "60%"
                          : "20%",
                    }}
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--marigold)] text-[var(--ink)] flex items-center justify-center shadow-lg border-2 border-white">
                      <Truck className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-white bg-black/70 px-1.5 py-0.5 rounded mt-1 whitespace-nowrap">
                      {data.status === "completed" ? "डिलिव्हरी झाली" : "गाडी मार्गावर आहे"}
                    </span>
                  </div>
                </div>

                {/* Route Endpoints */}
                <div className="flex justify-between text-xs pt-3 text-emerald-100">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-bold">{data.pickup.district} APMC</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-bold">{data.drop.district} हब</span>
                  </div>
                </div>

                {/* Simulation button for demo */}
                <div className="mt-4 pt-3 border-t border-emerald-900 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSimulateMovement}
                    disabled={simulating || data.status === "completed"}
                    className="flex items-center gap-1.5 px-3 py-1 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 text-[11px] font-bold rounded"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[var(--marigold)]" />
                    <span>{simulating ? "अपडेट होत आहे..." : "GPS प्रगती अपडेट करा (Simulate Movement)"}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons: View QR Code / Verify OTP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleInitiateProof}
                  disabled={proofLoading}
                  className="p-3.5 rounded-lg border-2 border-[var(--teal-deep)] bg-emerald-50/50 hover:bg-emerald-50 text-[var(--teal-deep)] font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <QrCode className="w-5 h-5" />
                  <span>
                    {proofLoading
                      ? "कोड तयार होत आहे..."
                      : "स्वीकारणाऱ्याचा QR कोड व OTP पहा (View Delivery QR)"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowVerifyModal(true)}
                  disabled={data.status === "completed"}
                  className="p-3.5 rounded-lg bg-[var(--teal-deep)] hover:bg-[#0b3836] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <CheckCircle2 className="w-5 h-5 text-[var(--marigold)]" />
                  <span>
                    {data.status === "completed"
                      ? "✓ डिलिव्हरी पूर्ण झालेली आहे"
                      : "चालक: डिलिव्हरी OTP टाका (Verify Delivery)"}
                  </span>
                </button>
              </div>

              {data.status === "completed" && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0">
                      <Star className="w-5 h-5 fill-slate-950" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        डिलिव्हरी यशस्वी झाली! चालकाला अभिप्राय व ५-स्टार रेटिंग द्या
                      </div>
                      <div className="text-[11px] text-slate-600">
                        आपल्या अभिप्रायामुळे विश्वासू चालकांना अधिक भाडे फेऱ्या मिळण्यास मदत होते
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(true)}
                    className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition whitespace-nowrap"
                  >
                    <Star className="w-4 h-4 fill-slate-950" />
                    <span>अभिप्राय नोंदवा (Rate Driver)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Delivery Locations and Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-[var(--warm-gray-200)] shadow-sm space-y-2 text-xs">
                <div className="text-[11px] font-bold text-[var(--warm-gray-500)] flex items-center gap-1.5 uppercase">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  माल भरण्याचे ठिकाण (Pickup)
                </div>
                <div className="font-bold text-sm text-[var(--ink)]">
                  {data.pickup.address}
                </div>
                <div className="text-[var(--warm-gray-600)]">
                  संपर्क व्यक्ती: <span className="font-bold">{data.pickup.contactName}</span>
                </div>
                <a
                  href={`tel:${data.pickup.contactPhone}`}
                  className="inline-flex items-center gap-1 text-[var(--teal-deep)] font-bold font-mono hover:underline"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>+91 {data.pickup.contactPhone}</span>
                </a>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[var(--warm-gray-200)] shadow-sm space-y-2 text-xs">
                <div className="text-[11px] font-bold text-[var(--warm-gray-500)] flex items-center gap-1.5 uppercase">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  माल उतरवण्याचे ठिकाण (Drop Destination)
                </div>
                <div className="font-bold text-sm text-[var(--ink)]">
                  {data.drop.address}
                </div>
                <div className="text-[var(--warm-gray-600)]">
                  स्वीकारणारे: <span className="font-bold">{data.drop.receiverName}</span>
                </div>
                <a
                  href={`tel:${data.drop.receiverPhone}`}
                  className="inline-flex items-center gap-1 text-[var(--teal-deep)] font-bold font-mono hover:underline"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>+91 {data.drop.receiverPhone}</span>
                </a>
              </div>
            </div>
          </>
        ) : null}
      </main>

      {/* Receiver Delivery QR & 6-Digit OTP Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-[var(--warm-gray-200)] pb-2">
              <span className="font-bold text-xs uppercase text-[var(--warm-gray-700)] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                डिलिव्हरी पडताळणी कोड (Delivery Proof)
              </span>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="text-[var(--warm-gray-400)] hover:text-[var(--ink)] font-bold text-base"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[var(--warm-gray-600)]">
              माल सुखरूप मिळाल्याची खात्री पटल्यानंतरच चालकाला हा QR कोड स्कॅन करू द्या किंवा खालील ६-अंकी OTP सांगा:
            </p>

            {qrCodeDataUrl && (
              <div className="border border-[var(--warm-gray-200)] p-3 rounded-lg inline-block bg-white shadow-sm">
                <Image
                  src={qrCodeDataUrl}
                  alt="Delivery Proof QR Code"
                  width={220}
                  height={220}
                  className="mx-auto"
                />
              </div>
            )}

            {deliveryOtp && (
              <div className="bg-[var(--warm-gray-100)] p-3 rounded border border-[var(--warm-gray-300)]">
                <div className="text-[10px] uppercase font-bold text-[var(--warm-gray-600)] mb-0.5">
                  ६-अंकी डिलिव्हरी OTP
                </div>
                <div className="text-3xl font-black font-mono tracking-widest text-[var(--teal-deep)]">
                  {deliveryOtp}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded bg-[var(--teal-deep)] text-white font-bold text-xs shadow-sm"
            >
              समजले (Close)
            </button>
          </div>
        </div>
      )}

      {/* Driver Verify Delivery Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-[var(--warm-gray-200)] pb-2">
              <span className="font-bold text-xs uppercase text-[var(--teal-deep)] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                डिलिव्हरी पडताळणी (Verify & Release Escrow)
              </span>
              <button
                type="button"
                onClick={() => setShowVerifyModal(false)}
                className="text-[var(--warm-gray-400)] hover:text-[var(--ink)] font-bold text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleVerifyDelivery} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[var(--warm-gray-700)] mb-1">
                  ग्राहकाने दिलेला ६-अंकी OTP टाका *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={inputOtp}
                  onChange={(e) => setInputOtp(e.target.value)}
                  placeholder="उदा. 482915"
                  required
                  className="w-full text-center text-2xl font-mono font-black py-2.5 rounded border border-[var(--warm-gray-300)] focus:border-[var(--teal-deep)] focus:outline-none tracking-widest"
                />
              </div>

              <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-start gap-2">
                <Camera className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  डिलिव्हरी फोटो व ओटीपी पडताळणीनंतर एस्क्रोमधील ५०% भाडे तात्काळ आपल्या पाकिटात जमा होईल.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="px-4 py-2 rounded border border-[var(--warm-gray-300)] text-xs font-bold text-[var(--warm-gray-700)]"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  disabled={verifyLoading || inputOtp.length !== 6}
                  className="px-5 py-2 rounded bg-[var(--teal-deep)] hover:bg-[#0b3836] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  {verifyLoading && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>पडताळणी पूर्ण करा</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Emergency SOS Modal */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 space-y-4 border-2 border-red-500 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 text-red-600 border-b border-red-100 pb-3">
              <AlertOctagon className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="font-black text-sm uppercase">
                  आपत्कालीन सुरक्षा इशारा (Emergency SOS Assistance)
                </h3>
                <p className="text-[11px] text-[var(--warm-gray-600)]">
                  महामार्गावर अपघात, गाडी बिघाड किंवा तातडीच्या मदतीसाठी
                </p>
              </div>
            </div>

            {sosSent ? (
              <div className="space-y-4">
                <div className="p-3.5 bg-red-50 border border-red-200 rounded text-xs text-red-900 font-semibold">
                  🚨 आपला SOS इशारा नियंत्रण कक्षाला पाठवला गेला आहे! आपले थेट GPS स्थान मदत पथकाकडे पोहोचले आहे.
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-[var(--warm-gray-600)] uppercase">
                    थेट संपर्क क्रमांक (Emergency Helplines):
                  </div>
                  {sosHelplines.map((line, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded bg-[var(--warm-gray-50)] border border-[var(--warm-gray-200)] flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-[var(--ink)]">{line.name}</div>
                        <div className="text-xs font-mono font-bold text-red-700">{line.number}</div>
                      </div>
                      <a
                        href={`tel:${line.number}`}
                        className="px-3 py-1.5 rounded bg-red-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>कॉल करा</span>
                      </a>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowSosModal(false)}
                  className="w-full py-2.5 rounded bg-[var(--warm-gray-200)] hover:bg-[var(--warm-gray-300)] text-[var(--warm-gray-800)] font-bold text-xs"
                >
                  बंद करा (Close)
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-[var(--warm-gray-700)] leading-relaxed">
                  या बटणावर क्लिक केल्यास आपले चालू स्थान थेट <strong>{BRAND_NAME} नियंत्रण कक्ष</strong> आणि <strong>महाराष्ट्र महामार्ग पोलिसांना</strong> पाठवले जाईल.
                </p>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSosModal(false)}
                    className="px-4 py-2 rounded border border-[var(--warm-gray-300)] text-xs font-bold text-[var(--warm-gray-700)]"
                  >
                    रद्द करा
                  </button>
                  <button
                    type="button"
                    onClick={handleTriggerSos}
                    disabled={sosLoading}
                    className="px-5 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    {sosLoading && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>तात्काळ मदतीची विनंती पाठवा (Confirm SOS)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Two-Way Review & Rating Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                  <Star className="w-4 h-4 fill-slate-950" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    चालकाला अभिप्राय द्या (Rate Driver)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    बुकिंग: {data?.bookingNumber}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star Rating Picker */}
              <div className="text-center py-2">
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  एकूण अनुभव रेटिंग (Overall Rating)
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= reviewRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-xs font-semibold text-amber-600 mt-1">
                  {reviewRating === 5
                    ? "⭐⭐⭐⭐⭐ उत्कृष्ट सेवा (Exceptional)"
                    : reviewRating === 4
                    ? "⭐⭐⭐⭐ चांगली सेवा (Good)"
                    : reviewRating === 3
                    ? "⭐⭐⭐ समाधानकारक (Average)"
                    : "सुधारणेची गरज (Needs Improvement)"}
                </div>
              </div>

              {/* Category Sliders / Selectors */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">वेळेचे पालन (Punctuality):</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setPunctualityRating(val)}
                        className={`w-6 h-6 rounded text-[11px] font-bold ${
                          punctualityRating === val
                            ? "bg-[#0F4C4A] text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">मालाची काळजी (Cargo Care):</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setCargoCareRating(val)}
                        className={`w-6 h-6 rounded text-[11px] font-bold ${
                          cargoCareRating === val
                            ? "bg-[#0F4C4A] text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">संभाषण व वर्तन (Communication):</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setCommunicationRating(val)}
                        className={`w-6 h-6 rounded text-[11px] font-bold ${
                          communicationRating === val
                            ? "bg-[#0F4C4A] text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">सुरक्षित ड्रायव्हिंग (Driving Safety):</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setDrivingSafetyRating(val)}
                        className={`w-6 h-6 rounded text-[11px] font-bold ${
                          drivingSafetyRating === val
                            ? "bg-[#0F4C4A] text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Review Comment */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  आपला अनुभव लिहा (Optional Feedback):
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="उदा. ड्रायव्हर वेळेवर पोहोचले, माल सुरक्षित बांधला होता..."
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F4C4A]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="px-5 py-2 rounded-lg bg-[#0F4C4A] hover:bg-[#0a3331] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
                >
                  {reviewLoading && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>अभिप्राय सबमिट करा</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LiveTrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--warm-gray-50)] flex items-center justify-center p-4">
          <div className="text-xs font-bold text-[var(--warm-gray-500)] flex items-center gap-2">
            <RotateCw className="w-4 h-4 animate-spin text-[var(--teal-deep)]" />
            <span>थेट ट्रॅकिंग सुरू होत आहे...</span>
          </div>
        </div>
      }
    >
      <LiveTrackingContent />
    </Suspense>
  );
}
