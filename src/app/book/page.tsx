"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BRAND_NAME } from "@/lib/config/brand";
import { formatCurrency } from "@/i18n/config";
import { TruckType } from "@/features/trucks/models/truck.model";
import {
  MapPin,
  ArrowRight,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Save,
  FolderOpen,
  Trash2,
  Check,
  X,
  Clock,
  PlusCircle,
  RefreshCw,
  ExternalLink,
  Calendar,
  Copy,
  Truck,
  PhoneCall,
} from "lucide-react";
import { VoiceInputButton } from "@/components/voice/VoiceInputButton";
import {
  getOfflineDrafts,
  saveOfflineDraft,
  removeOfflineDraft,
  OfflineBookingDraft,
} from "@/lib/pwa/offline-drafts";

interface GeocodeItem {
  displayName: string;
  village?: string;
  taluka?: string;
  district: string;
  latitude: number;
  longitude: number;
}

interface FareEstimate {
  baseFarePaise: number;
  distanceFarePaise: number;
  handlingFarePaise: number;
  perishableSurchargePaise: number;
  discountPaise: number;
  subtotalFarePaise: number;
  platformFeePaise: number;
  gstTaxPaise: number;
  totalFarePaise: number;
  advance50Paise: number;
  delivery50Paise: number;
}

interface MatchedDriver {
  driverId: string;
  name: string;
  plateNumber: string;
  truckType: string;
  trustScore: number;
  onTimeRate: number;
  distanceToPickupKm: number;
  matchReasons: { mr: string; en: string };
}

interface PastBookingItem {
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

export default function BookFreightPage() {
  const [activeTab, setActiveTab] = useState<"new_booking" | "past_bookings">("new_booking");
  const [pastBookings, setPastBookings] = useState<PastBookingItem[]>([]);
  const [pastBookingsLoading, setPastBookingsLoading] = useState(false);
  const [pastBookingsError, setPastBookingsError] = useState<string | null>(null);
  const [bookingStatusFilter, setBookingStatusFilter] = useState<"all" | "active" | "completed">("all");

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Locations
  const [pickupSearch, setPickupSearch] = useState("Palghar APMC Market, Palghar");
  const [pickupCoords, setPickupCoords] = useState<[number, number]>([72.7699, 19.6967]); // [lng, lat]
  const [pickupDistrict, setPickupDistrict] = useState("Palghar");
  const [pickupContactName, setPickupContactName] = useState("Ramesh Patil");
  const [pickupContactPhone, setPickupContactPhone] = useState("9822110002");

  const [dropSearch, setDropSearch] = useState("Bhiwandi Logistics Park & Textile Hub, Bhiwandi");
  const [dropCoords, setDropCoords] = useState<[number, number]>([73.0631, 19.2967]); // [lng, lat]
  const [dropDistrict, setDropDistrict] = useState("Thane");
  const [dropReceiverName, setDropReceiverName] = useState("Shaikh Rafiq");
  const [dropReceiverPhone, setDropReceiverPhone] = useState("9822110003");

  const [pickupSuggestions, setPickupSuggestions] = useState<GeocodeItem[]>([]);
  const [dropSuggestions, setDropSuggestions] = useState<GeocodeItem[]>([]);

  // Step 2: Cargo
  type GoodsCategory = "agricultural_produce" | "dairy_milk" | "textiles" | "handicrafts" | "fmcg" | "other";
  const [category, setCategory] = useState<GoodsCategory>("agricultural_produce");
  const [description, setDescription] = useState("पालघर ताजे चिकू (Fresh Palghar Chiku Crates)");
  const [weightKg, setWeightKg] = useState(1200);
  const [isPerishable, setIsPerishable] = useState(true);
  const [isFragile, setIsFragile] = useState(false);

  // Step 3: Truck & Fare
  const [truckType, setTruckType] = useState<TruckType>("pickup");
  const [mode, setMode] = useState<"broadcast" | "direct" | "return_load" | "pooled">("broadcast");
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  const [fareEstimate, setFareEstimate] = useState<FareEstimate | null>(null);
  const [distanceKm, setDistanceKm] = useState(62.5);
  const [durationMins, setDurationMins] = useState(115);
  const [matchedDrivers, setMatchedDrivers] = useState<MatchedDriver[]>([]);

  // Step 4: Confirmed Booking
  const [createdBooking, setCreatedBooking] = useState<{
    id: string;
    bookingNumber: string;
    totalFarePaise: number;
    advance50Paise: number;
  } | null>(null);
  const [advancePaid, setAdvancePaid] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Offline Draft Management
  const [drafts, setDrafts] = useState<OfflineBookingDraft[]>([]);
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);

  const loadPastBookings = async () => {
    setPastBookingsLoading(true);
    setPastBookingsError(null);
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (data.success) {
        setPastBookings(data.bookings || []);
      } else {
        setPastBookingsError(data.error || "बुकिंग लोड करण्यात अडचण आली");
      }
    } catch {
      setPastBookingsError("नेटवर्क त्रुटी - कृपया पुन्हा प्रयत्न करा (Network error)");
    } finally {
      setPastBookingsLoading(false);
    }
  };

  useEffect(() => {
    setDrafts(getOfflineDrafts());
    loadPastBookings();
  }, []);

  const handleCopyBooking = (b: PastBookingItem) => {
    setPickupSearch(b.pickup.address);
    setPickupDistrict(b.pickup.district);
    setPickupContactName(b.pickup.contactName);
    setPickupContactPhone(b.pickup.contactPhone);
    setDropSearch(b.drop.address);
    setDropDistrict(b.drop.district);
    setDropReceiverName(b.drop.receiverName);
    setDropReceiverPhone(b.drop.receiverPhone);
    setCategory((b.goods.category as any) || "agricultural_produce");
    setDescription(b.goods.description);
    setWeightKg(b.goods.weightKg);
    setIsPerishable(b.goods.isPerishable);
    setTruckType((b.truckType as any) || "pickup");
    setMode((b.mode as any) || "broadcast");
    setStep(1);
    setActiveTab("new_booking");
    setDraftNotice("मागील बुकिंगचे तपशील फॉर्ममध्ये भरले गेले आहेत! (Booking details copied to form)");
    setTimeout(() => setDraftNotice(null), 3500);
  };

  const handleSaveDraft = () => {
    saveOfflineDraft({
      pickupAddress: pickupSearch,
      pickupDistrict,
      dropAddress: dropSearch,
      dropDistrict,
      senderName: pickupContactName,
      senderPhone: pickupContactPhone,
      receiverName: dropReceiverName,
      receiverPhone: dropReceiverPhone,
      goodsCategory: category,
      goodsDescription: description,
      weightKg,
      truckType,
      mode,
    });
    setDrafts(getOfflineDrafts());
    setDraftNotice("मसुदा सुरक्षित जतन झाला! (Draft saved offline)");
    setTimeout(() => setDraftNotice(null), 3500);
  };

  const handleRestoreDraft = (d: OfflineBookingDraft) => {
    setPickupSearch(d.pickupAddress || "");
    setPickupDistrict(d.pickupDistrict || "Palghar");
    setDropSearch(d.dropAddress || "");
    setDropDistrict(d.dropDistrict || "Thane");
    setPickupContactName(d.senderName || "");
    setPickupContactPhone(d.senderPhone || "");
    setDropReceiverName(d.receiverName || "");
    setDropReceiverPhone(d.receiverPhone || "");
    setCategory((d.goodsCategory as any) || "agricultural_produce");
    setDescription(d.goodsDescription || "");
    setWeightKg(d.weightKg || 1000);
    setTruckType((d.truckType as any) || "pickup");
    setMode((d.mode as any) || "broadcast");
    setShowDraftsModal(false);
    setDraftNotice("मसुदा लोड केला गेला! (Draft Restored)");
    setTimeout(() => setDraftNotice(null), 3500);
  };

  const handleDeleteDraft = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeOfflineDraft(id);
    setDrafts(getOfflineDrafts());
  };

  // Search autocomplete
  const searchLocations = async (query: string, setResults: (res: GeocodeItem[]) => void) => {
    if (query.length < 2) return;
    try {
      const res = await fetch(`/api/routes/geocode?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.results || []);
      }
    } catch {
      // ignore
    }
  };

  // Re-calculate route and fare when truck, cargo, or locations change
  const fetchFareEstimate = async (
    targetTruck: TruckType = truckType,
    targetMode: "broadcast" | "direct" | "return_load" | "pooled" = mode,
    targetPerishable: boolean = isPerishable
  ) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Calculate actual route
      const routeRes = await fetch("/api/routes/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: { latitude: pickupCoords[1], longitude: pickupCoords[0] },
          end: { latitude: dropCoords[1], longitude: dropCoords[0] },
        }),
      });
      const routeData = await routeRes.json();
      const calcDistance = routeData.route?.distanceKm || 62.5;
      const calcDuration = routeData.route?.durationMinutes || 115;
      setDistanceKm(calcDistance);
      setDurationMins(calcDuration);

      // 2. Estimate fare
      const fareRes = await fetch("/api/bookings/estimate-fare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          truckType: targetTruck,
          distanceKm: calcDistance,
          isPerishable: targetPerishable,
          isReturnLoad: targetMode === "return_load",
          isPooled: targetMode === "pooled",
          district: pickupDistrict,
          pickupCoords,
        }),
      });

      const fareData = await fareRes.json();
      if (fareData.success) {
        setFareEstimate(fareData.fare);
        setMatchedDrivers(fareData.matchedDrivers || []);
      }
    } catch {
      setError("भाडे गणना करण्यात त्रुटी आली.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickup: {
            address: pickupSearch,
            district: pickupDistrict,
            coordinates: pickupCoords,
            contactName: pickupContactName,
            contactPhone: pickupContactPhone,
          },
          drop: {
            address: dropSearch,
            district: dropDistrict,
            coordinates: dropCoords,
            receiverName: dropReceiverName,
            receiverPhone: dropReceiverPhone,
          },
          goods: {
            category,
            description,
            weightKg,
            isPerishable,
            isFragile,
          },
          truckType,
          mode: selectedDriverId ? "direct" : mode,
          driverId: selectedDriverId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Booking failed");
      } else {
        const bId = data.booking._id || data.booking.id;
        setCreatedBooking({
          id: bId,
          bookingNumber: data.booking.bookingNumber,
          totalFarePaise: data.booking.fare.totalFarePaise,
          advance50Paise: data.booking.fare.advance50Paise,
        });
        setAdvancePaid(false);
        setStep(4);
      }
    } catch {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handlePayAdvance = async () => {
    if (!createdBooking) return;
    setPaymentLoading(true);
    setError(null);

    try {
      // 1. Create Order
      const orderRes = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: createdBooking.id }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || "Order creation failed");
      }

      // 2. In Mock/Dev mode or testing, auto verify with mock signature
      const verifyRes = await fetch("/api/payments/razorpay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: createdBooking.id,
          razorpayOrderId: orderData.order.orderId,
          razorpayPaymentId: `pay_${Date.now()}`,
          razorpaySignature: "mock_valid_signature",
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.error || "Payment verification failed");
      }

      setAdvancePaid(true);
    } catch (err) {
      setError((err as Error).message || "Payment process failed");
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--warm-gray-50)] text-[var(--ink)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--warm-gray-200)] py-4 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-[var(--teal-deep)] hover:underline">
            <ArrowLeft className="w-4 h-4" />
            <span>{BRAND_NAME}</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="truck-badge text-emerald-800 border-emerald-300 bg-emerald-50 text-[11px]">
              ५०-५० एस्क्रो सुरक्षित
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Top Tab Bar: New Booking vs Past Bookings */}
        <div className="flex items-center gap-2 mb-6 border-b border-[var(--warm-gray-300)] pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("new_booking")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t transition-colors inline-flex items-center gap-2 ${
              activeTab === "new_booking"
                ? "bg-white text-[var(--teal-deep)] border-t-2 border-t-[var(--teal-deep)] border-x border-[var(--warm-gray-200)] shadow-2xs"
                : "text-[var(--warm-gray-600)] hover:text-[var(--ink)]"
            }`}
          >
            <PlusCircle className="w-4 h-4 text-[var(--teal-deep)]" />
            <span>नवीन भाडे नोंदवा (New Booking)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("past_bookings");
              loadPastBookings();
            }}
            className={`px-4 py-2.5 text-xs font-bold rounded-t transition-colors inline-flex items-center gap-2 ${
              activeTab === "past_bookings"
                ? "bg-white text-[var(--teal-deep)] border-t-2 border-t-[var(--teal-deep)] border-x border-[var(--warm-gray-200)] shadow-2xs"
                : "text-[var(--warm-gray-600)] hover:text-[var(--ink)]"
            }`}
          >
            <Clock className="w-4 h-4 text-[var(--marigold)]" />
            <span>माझे मागील बुकिंग (My Past Bookings)</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] font-black bg-[var(--cream)] text-[var(--teal-deep)] border border-[var(--warm-gray-300)]">
              {pastBookings.length}
            </span>
          </button>
        </div>

        {activeTab === "new_booking" && (
          <>
            {/* Offline Draft Toolbar & Notice */}
        {draftNotice && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              {draftNotice}
            </span>
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-white border border-[var(--warm-gray-200)] shadow-sm">
          <div className="flex items-center gap-2 text-xs text-[var(--warm-gray-600)]">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium">ऑफलाइन मसुदा सुविधा (Offline Draft Support)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-3 py-1.5 rounded bg-[var(--warm-gray-100)] hover:bg-[var(--warm-gray-200)] text-xs font-bold text-[var(--ink)] inline-flex items-center gap-1.5 transition"
              title="सध्याचा फॉर्म मसुदा म्हणून जतन करा"
            >
              <Save className="w-3.5 h-3.5 text-[var(--teal-deep)]" />
              <span>मसुदा सेव्ह करा (Save Draft)</span>
            </button>

            {drafts.length > 0 && (
              <button
                type="button"
                onClick={() => setShowDraftsModal(true)}
                className="px-3 py-1.5 rounded bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-900 border border-amber-300 inline-flex items-center gap-1.5 transition"
              >
                <FolderOpen className="w-3.5 h-3.5 text-amber-700" />
                <span>जतन केलेले मसुदे ({drafts.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Drafts Modal */}
        {showDraftsModal && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-5 border border-neutral-200 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm font-bold text-neutral-900">
                    जतन केलेले ऑफलाइन मसुदे (Saved Drafts)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDraftsModal(false)}
                  className="p-1 rounded hover:bg-neutral-100 text-neutral-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {drafts.length === 0 ? (
                <p className="text-xs text-neutral-500 py-4 text-center">कोणताही मसुदा उपलब्ध नाही.</p>
              ) : (
                <div className="space-y-2.5">
                  {drafts.map((d) => (
                    <div
                      key={d.id}
                      onClick={() => handleRestoreDraft(d)}
                      className="p-3 rounded-lg border border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50/30 cursor-pointer transition flex items-start justify-between gap-3"
                    >
                      <div className="text-left space-y-1">
                        <div className="text-xs font-bold text-neutral-900 line-clamp-1">
                          {d.pickupAddress || "पिकअप पत्ता नाही"} → {d.dropAddress || "ड्रॉप पत्ता नाही"}
                        </div>
                        <div className="text-[11px] text-neutral-500 flex flex-wrap gap-2">
                          <span>{d.goodsDescription || "माल वर्णन नाही"}</span>
                          <span>•</span>
                          <span>{d.weightKg} किलो</span>
                          <span>•</span>
                          <span>{new Date(d.savedAt).toLocaleDateString("mr-IN")}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteDraft(d.id, e)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 transition rounded"
                        title="हटवा"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowDraftsModal(false)}
                  className="px-4 py-2 rounded text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                >
                  बंद करा (Close)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          <div
            className={`p-3 rounded border text-left text-xs font-bold transition-colors ${
              step === 1
                ? "bg-[var(--teal-deep)] text-white border-[var(--teal-deep)]"
                : "bg-white border-[var(--warm-gray-200)] text-[var(--warm-gray-700)]"
            }`}
          >
            १. मार्ग व पत्ते (Route)
          </div>
          <div
            className={`p-3 rounded border text-left text-xs font-bold transition-colors ${
              step === 2
                ? "bg-[var(--teal-deep)] text-white border-[var(--teal-deep)]"
                : "bg-white border-[var(--warm-gray-200)] text-[var(--warm-gray-700)]"
            }`}
          >
            २. माल तपशील (Cargo)
          </div>
          <div
            className={`p-3 rounded border text-left text-xs font-bold transition-colors ${
              step >= 3
                ? "bg-[var(--teal-deep)] text-white border-[var(--teal-deep)]"
                : "bg-white border-[var(--warm-gray-200)] text-[var(--warm-gray-700)]"
            }`}
          >
            ३. ट्रक व भाडे (Fare & Truck)
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded bg-red-50 border border-red-200 text-sm text-[var(--chili)] flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Route Selection */}
        {step === 1 && (
          <div className="bg-white p-6 sm:p-8 rounded-lg border border-[var(--warm-gray-200)] shadow-sm space-y-6">
            <h2 className="text-lg font-bold border-b border-[var(--warm-gray-200)] pb-3 font-[family-name:var(--font-display)]">
              कुठून कुठे माल पाठवायचा आहे? (Pickup & Drop Route)
            </h2>

            {/* Pickup Section */}
            <div className="p-4 rounded border border-[var(--warm-gray-300)] bg-[var(--warm-gray-50)] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--teal-deep)] uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-[var(--teal-deep)]" />
                <span>माल भरण्याचे ठिकाण (Pickup Location)</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={pickupSearch}
                    onChange={(e) => {
                      setPickupSearch(e.target.value);
                      searchLocations(e.target.value, setPickupSuggestions);
                    }}
                    placeholder="गाव, तालुका किंवा बाजार समितीचे नाव शोधा (उदा. पालघर APMC)"
                    className="w-full px-3.5 py-2.5 rounded border border-[var(--warm-gray-300)] bg-white text-sm font-semibold focus:outline-none focus:border-[var(--teal-deep)]"
                  />

                  {pickupSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white rounded border border-[var(--warm-gray-300)] shadow-lg max-h-48 overflow-y-auto">
                      {pickupSuggestions.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setPickupSearch(item.displayName);
                            setPickupCoords([item.longitude, item.latitude]);
                            setPickupDistrict(item.district);
                            setPickupSuggestions([]);
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs hover:bg-[var(--warm-gray-100)] border-b last:border-b-0"
                        >
                          <span className="font-bold text-[var(--ink)] block">{item.displayName}</span>
                          <span className="text-[11px] text-[var(--warm-gray-500)]">जिल्हा: {item.district}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <VoiceInputButton
                  lang="mr-IN"
                  title="पिकअप गावाचे नाव बोला (Speak Pickup Village)"
                  onTranscript={(text) => {
                    setPickupSearch(text);
                    searchLocations(text, setPickupSuggestions);
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--warm-gray-600)] mb-1">
                    पाठवणाऱ्याचे नाव (Sender Contact Name)
                  </label>
                  <input
                    type="text"
                    value={pickupContactName}
                    onChange={(e) => setPickupContactName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-[var(--warm-gray-300)] bg-white text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--warm-gray-600)] mb-1">
                    पाठवणाऱ्याचा मोबाईल (Sender Phone)
                  </label>
                  <input
                    type="tel"
                    value={pickupContactPhone}
                    onChange={(e) => setPickupContactPhone(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-[var(--warm-gray-300)] bg-white text-xs font-mono font-semibold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Drop Section */}
            <div className="p-4 rounded border border-[var(--warm-gray-300)] bg-[var(--warm-gray-50)] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--chili)] uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-[var(--chili)]" />
                <span>माल पोहोचवण्याचे ठिकाण (Drop Location)</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={dropSearch}
                    onChange={(e) => {
                      setDropSearch(e.target.value);
                      searchLocations(e.target.value, setDropSuggestions);
                    }}
                    placeholder="गाव, तालुका किंवा बाजार समितीचे नाव शोधा (उदा. भिवंडी / नाशिक)"
                    className="w-full px-3.5 py-2.5 rounded border border-[var(--warm-gray-300)] bg-white text-sm font-semibold focus:outline-none focus:border-[var(--chili)]"
                  />

                  {dropSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white rounded border border-[var(--warm-gray-300)] shadow-lg max-h-48 overflow-y-auto">
                      {dropSuggestions.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setDropSearch(item.displayName);
                            setDropCoords([item.longitude, item.latitude]);
                            setDropDistrict(item.district);
                            setDropSuggestions([]);
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs hover:bg-[var(--warm-gray-100)] border-b last:border-b-0"
                        >
                          <span className="font-bold text-[var(--ink)] block">{item.displayName}</span>
                          <span className="text-[11px] text-[var(--warm-gray-500)]">जिल्हा: {item.district}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <VoiceInputButton
                  lang="mr-IN"
                  title="ड्रॉप ठिकाणाचे नाव बोला (Speak Drop Location)"
                  onTranscript={(text) => {
                    setDropSearch(text);
                    searchLocations(text, setDropSuggestions);
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--warm-gray-600)] mb-1">
                    स्वीकारणाऱ्याचे नाव (Receiver Name)
                  </label>
                  <input
                    type="text"
                    value={dropReceiverName}
                    onChange={(e) => setDropReceiverName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-[var(--warm-gray-300)] bg-white text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--warm-gray-600)] mb-1">
                    स्वीकारणाऱ्याचा मोबाईल (Receiver Phone)
                  </label>
                  <input
                    type="tel"
                    value={dropReceiverPhone}
                    onChange={(e) => setDropReceiverPhone(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-[var(--warm-gray-300)] bg-white text-xs font-mono font-semibold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!pickupSearch || !dropSearch}
                className="flex items-center gap-2 px-6 py-3 rounded font-bold text-white bg-[var(--teal-deep)] hover:bg-[#0b3836] disabled:opacity-50 text-sm shadow-sm"
              >
                <span>मालाचा तपशील भरा</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Cargo Details */}
        {step === 2 && (
          <div className="bg-white p-6 sm:p-8 rounded-lg border border-[var(--warm-gray-200)] shadow-sm space-y-6">
            <h2 className="text-lg font-bold border-b border-[var(--warm-gray-200)] pb-3 font-[family-name:var(--font-display)]">
              मालाचा प्रकार व वजन (Cargo Specifications)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase text-[var(--warm-gray-700)] mb-1">
                  मालाचा प्रकार (Goods Category)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GoodsCategory)}
                  className="w-full px-3.5 py-2.5 rounded border border-[var(--warm-gray-300)] focus:border-[var(--teal-deep)] focus:outline-none text-sm font-semibold"
                >
                  <option value="agricultural_produce">शेतमाल / फळे / भाज्या (Agro Produce)</option>
                  <option value="dairy_milk">दूध व दुग्धजन्य पदार्थ (Dairy & Milk)</option>
                  <option value="textiles">कापड व सूत (Textiles & Yarn)</option>
                  <option value="handicrafts">हस्तकला व गृहउद्योग (Handicrafts)</option>
                  <option value="fmcg">किराणा व पॅक्ड माल (FMCG)</option>
                  <option value="other">इतर सामान (Other)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[var(--warm-gray-700)] mb-1">
                  अंदाजे एकूण वजन (Weight in KG) *
                </label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseInt(e.target.value) || 100)}
                  min={50}
                  max={25000}
                  className="w-full px-3.5 py-2.5 rounded border border-[var(--warm-gray-300)] focus:border-[var(--teal-deep)] focus:outline-none text-sm font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[var(--warm-gray-700)] mb-1">
                मालाचे वर्णन (Cargo Description) *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="उदा. ५० क्रेट्स चिकू, ३० गोण्या कांदा"
                  required
                  className="w-full px-3.5 py-2.5 rounded border border-[var(--warm-gray-300)] focus:border-[var(--teal-deep)] focus:outline-none text-sm font-semibold"
                />
                <VoiceInputButton
                  lang="mr-IN"
                  title="मालाचे वर्णन बोला (Speak Cargo Description)"
                  onTranscript={(text) =>
                    setDescription((prev) => (prev ? `${prev} ${text}` : text))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-3 p-3.5 rounded border border-[var(--warm-gray-200)] bg-[var(--warm-gray-50)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPerishable}
                  onChange={(e) => setIsPerishable(e.target.checked)}
                  className="w-4 h-4 text-[var(--teal-deep)] rounded"
                />
                <div>
                  <span className="text-xs font-bold text-[var(--ink)] block">
                    नाशवंत माल (Perishable Goods)
                  </span>
                  <span className="text-[11px] text-[var(--warm-gray-500)]">
                    ताजी फळे, दूध किंवा भाज्या (तातडीची वाहतूक)
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded border border-[var(--warm-gray-200)] bg-[var(--warm-gray-50)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFragile}
                  onChange={(e) => setIsFragile(e.target.checked)}
                  className="w-4 h-4 text-[var(--teal-deep)] rounded"
                />
                <div>
                  <span className="text-xs font-bold text-[var(--ink)] block">
                    नाजूक वस्तू (Fragile Items)
                  </span>
                  <span className="text-[11px] text-[var(--warm-gray-500)]">
                    काच किंवा मातीची भांडी (विशेष हाताळणी)
                  </span>
                </div>
              </label>
            </div>

            <div className="flex justify-between pt-4 border-t border-[var(--warm-gray-200)]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded font-bold text-[var(--warm-gray-700)] bg-[var(--warm-gray-100)] text-sm"
              >
                मागे (Back)
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(3);
                  fetchFareEstimate(truckType, mode, isPerishable);
                }}
                disabled={!description || weightKg <= 0}
                className="flex items-center gap-2 px-6 py-3 rounded font-bold text-white bg-[var(--teal-deep)] hover:bg-[#0b3836] disabled:opacity-50 text-sm shadow-sm"
              >
                <span>ट्रक निवडा व भाडे पहा</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Truck Selection, Matching & Transparent Fare */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-lg border border-[var(--warm-gray-200)] shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--warm-gray-200)] pb-3">
                <h2 className="text-lg font-bold font-[family-name:var(--font-display)]">
                  ट्रक निवडा आणि पारदर्शक भाडे (Truck & Fare)
                </h2>
                <div className="text-xs font-mono font-bold text-[var(--teal-deep)]">
                  अंतर: {distanceKm} किमी • वेळ: {durationMins} मिनिटे
                </div>
              </div>

              {/* Truck Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: "tata_ace", label: "छोटा हत्ती (Tata Ace)", cap: "750 kg" },
                  { id: "pickup", label: "पिकअप / बोलेरो", cap: "1.5 Ton" },
                  { id: "truck_14ft", label: "१४ फूट ट्रक", cap: "4 Ton" },
                  { id: "truck_17ft", label: "१७ फूट ट्रक", cap: "6 Ton" },
                  { id: "truck_20ft", label: "२० फूट ट्रक", cap: "9 Ton" },
                  { id: "truck_32ft", label: "३२ फूट कंटेनर", cap: "15 Ton" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      const nextTruck = t.id as TruckType;
                      setTruckType(nextTruck);
                      fetchFareEstimate(nextTruck, mode, isPerishable);
                    }}
                    className={`p-3 rounded border text-left transition-colors ${
                      truckType === t.id
                        ? "border-2 border-[var(--teal-deep)] bg-emerald-50/50"
                        : "border-[var(--warm-gray-200)] hover:bg-[var(--warm-gray-50)]"
                    }`}
                  >
                    <div className="font-bold text-xs text-[var(--ink)]">{t.label}</div>
                    <div className="text-[11px] text-[var(--warm-gray-500)] mt-0.5">क्षमता: {t.cap}</div>
                  </button>
                ))}
              </div>

              {/* Mode Options: Return load / Pooled */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const nextMode = mode === "return_load" ? "broadcast" : "return_load";
                    setMode(nextMode);
                    fetchFareEstimate(truckType, nextMode, isPerishable);
                  }}
                  className={`px-3 py-1.5 rounded border text-xs font-bold transition-colors ${
                    mode === "return_load"
                      ? "bg-amber-100 border-amber-400 text-amber-900"
                      : "bg-[var(--warm-gray-50)] text-[var(--warm-gray-700)] border-[var(--warm-gray-200)]"
                  }`}
                >
                  🔄 रिटर्न लोड सूट (-२०% Return Load Discount)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const nextMode = mode === "pooled" ? "broadcast" : "pooled";
                    setMode(nextMode);
                    fetchFareEstimate(truckType, nextMode, isPerishable);
                  }}
                  className={`px-3 py-1.5 rounded border text-xs font-bold transition-colors ${
                    mode === "pooled"
                      ? "bg-blue-100 border-blue-400 text-blue-900"
                      : "bg-[var(--warm-gray-50)] text-[var(--warm-gray-700)] border-[var(--warm-gray-200)]"
                  }`}
                >
                  📦 लोड पूलिंग सूट (-२५% Shared Load Discount)
                </button>
              </div>

              {/* Transparent Fare Breakdown Card */}
              {loading ? (
                <div className="p-8 text-center text-xs font-bold text-[var(--warm-gray-500)] flex items-center justify-center gap-2">
                  <RotateCw className="w-4 h-4 animate-spin text-[var(--teal-deep)]" />
                  <span>पारदर्शक भाडे मोजले जात आहे...</span>
                </div>
              ) : fareEstimate ? (
                <div className="p-5 rounded-lg border-2 border-[var(--teal-deep)] bg-emerald-50/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-[var(--teal-deep)]">
                      पारदर्शक भाडे तपशील (Transparent Fare Breakdown):
                    </span>
                    <span className="truck-badge stamp-verified text-[11px]">शासकीय जीएसटी समाविष्ट</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs py-2 border-y border-[var(--warm-gray-200)]">
                    <div>
                      <span className="text-[var(--warm-gray-500)] block">मूळ भाडे (Base):</span>
                      <span className="font-bold text-[var(--ink)]">{formatCurrency(fareEstimate.baseFarePaise)}</span>
                    </div>
                    <div>
                      <span className="text-[var(--warm-gray-500)] block">अंतर भाडे ({distanceKm} km):</span>
                      <span className="font-bold text-[var(--ink)]">{formatCurrency(fareEstimate.distanceFarePaise)}</span>
                    </div>
                    <div>
                      <span className="text-[var(--warm-gray-500)] block">लोडिंग हाताळणी:</span>
                      <span className="font-bold text-[var(--ink)]">{formatCurrency(fareEstimate.handlingFarePaise)}</span>
                    </div>
                    <div>
                      <span className="text-[var(--warm-gray-500)] block">प्लॅटफॉर्म फी (७.५%):</span>
                      <span className="font-bold text-[var(--ink)]">{formatCurrency(fareEstimate.platformFeePaise)}</span>
                    </div>
                  </div>

                  {/* 50-50 Split Banner */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-white rounded border border-emerald-300 shadow-2xs">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase block">
                        ५०% आगाऊ रक्कम (Advance Due at Booking)
                      </span>
                      <div className="text-2xl font-black text-emerald-900 font-[family-name:var(--font-display)] mt-0.5">
                        {formatCurrency(fareEstimate.advance50Paise)}
                      </div>
                      <span className="text-[10px] text-[var(--warm-gray-500)]">ट्रिप सुरू करण्यासाठी आवश्यक</span>
                    </div>

                    <div className="p-3 bg-white rounded border border-amber-300 shadow-2xs">
                      <span className="text-[11px] font-bold text-amber-800 uppercase block">
                        ५०% वितरणावर देय (Held in Trust Escrow)
                      </span>
                      <div className="text-2xl font-black text-amber-900 font-[family-name:var(--font-display)] mt-0.5">
                        {formatCurrency(fareEstimate.delivery50Paise)}
                      </div>
                      <span className="text-[10px] text-[var(--warm-gray-500)]">माल पोहोचल्यावर ओटीपी देऊनच विमुक्त</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 text-xs font-bold text-[var(--ink)]">
                    <span>एकूण अंतिम भाडे (Total Gross Fare):</span>
                    <span className="text-lg text-[var(--teal-deep)] font-black">
                      {formatCurrency(fareEstimate.totalFarePaise)}
                    </span>
                  </div>
                </div>
              ) : null}

              {/* Matched Drivers Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[var(--ink)] uppercase tracking-wider">
                    जवळचे पडताळणीकृत ड्रायव्हर्स ({matchedDrivers.length} Verified Drivers Near You)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedDriverId(null)}
                    className={`text-xs font-bold ${!selectedDriverId ? "text-[var(--teal-deep)] underline" : "text-[var(--warm-gray-500)]"}`}
                  >
                    सर्व जवळच्या ड्रायव्हर्सना ब्रॉडकास्ट करा
                  </button>
                </div>

                {matchedDrivers.length === 0 ? (
                  <div className="p-4 bg-[var(--warm-gray-50)] rounded border border-[var(--warm-gray-200)] text-xs text-[var(--warm-gray-600)]">
                    या मार्गावर त्वरित थेट चालक उपलब्ध नाही. आपण ऑर्डर पोस्ट करू शकता, जवळचा उपलब्ध चालक स्वीकारेल.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {matchedDrivers.map((drv) => (
                      <div
                        key={drv.driverId}
                        onClick={() => setSelectedDriverId(drv.driverId)}
                        className={`p-3.5 rounded border cursor-pointer transition-all ${
                          selectedDriverId === drv.driverId
                            ? "border-2 border-[var(--teal-deep)] bg-emerald-50/40 shadow-sm"
                            : "border-[var(--warm-gray-200)] bg-white hover:border-[var(--warm-gray-300)]"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-bold text-sm text-[var(--ink)]">{drv.name}</span>
                            <span className="text-xs text-[var(--warm-gray-500)] font-mono block mt-0.5">
                              {drv.plateNumber}
                            </span>
                          </div>
                          <span className="truck-badge text-emerald-800 border-emerald-300 bg-emerald-50 text-[11px]">
                            {drv.trustScore}% विश्वास
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-700 font-semibold mt-2">
                          ✓ {drv.matchReasons.mr}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Booking */}
              <div className="flex justify-between pt-4 border-t border-[var(--warm-gray-200)]">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded font-bold text-[var(--warm-gray-700)] bg-[var(--warm-gray-100)] text-sm"
                >
                  मागे (Back)
                </button>

                <button
                  type="button"
                  disabled={loading || !fareEstimate}
                  onClick={handleCreateBooking}
                  className="flex items-center gap-2 px-6 py-3 rounded font-bold text-white bg-[var(--teal-deep)] hover:bg-[#0b3836] disabled:opacity-50 text-sm shadow-sm"
                >
                  {loading ? (
                    <RotateCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>
                    {selectedDriverId ? "चालकाची निवड करून बुक करा" : "जवळच्या सर्व ड्रायव्हर्सना पाठवा (Post Load)"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Booking Confirmation Screen */}
        {step === 4 && createdBooking && (
          <div className="bg-white p-6 sm:p-8 rounded-lg border border-[var(--warm-gray-200)] shadow-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-600 mx-auto flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <div className="truck-badge stamp-verified mb-2">बुकिंग यशस्वीरीत्या नोंदवले</div>
              <h1 className="text-2xl font-black text-[var(--ink)] font-[family-name:var(--font-display)]">
                बुकिंग संदर्भ: {createdBooking.bookingNumber}
              </h1>
              <p className="text-xs text-[var(--warm-gray-600)] mt-1">
                आपले भाडे नोंदवले गेले आहे. जवळच्या पडताळणीकृत ड्रायव्हर्सना तत्काळ सूचना पाठवण्यात आली आहे.
              </p>
            </div>

            <div className="p-4 rounded bg-[var(--warm-gray-50)] border border-[var(--warm-gray-200)] max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[var(--warm-gray-500)]">एकूण भाडे (Total Fare):</span>
                <span className="font-bold text-[var(--ink)]">{formatCurrency(createdBooking.totalFarePaise)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--warm-gray-500)]">५०% आगाऊ देय (50% Advance):</span>
                <span className="font-bold text-emerald-700">{formatCurrency(createdBooking.advance50Paise)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--warm-gray-500)]">५०% वितरण एस्क्रो (50% Delivery Escrow):</span>
                <span className="font-bold text-amber-700">{formatCurrency(createdBooking.advance50Paise)}</span>
              </div>
            </div>

            {/* Advance Payment Action */}
            <div className="max-w-md mx-auto pt-2">
              {advancePaid ? (
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-start gap-2.5 text-left">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">५०% उचल रक्कम सुरक्षितपणे एस्क्रोमध्ये जमा झाली आहे</span>
                    <span className="text-[11px] text-emerald-700">
                      माल सुखरूप पोहोचल्यानंतर आपण ओटीपी दिल्यावरच ही रक्कम चालकाला दिली जाईल.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-3">
                  <div className="flex items-start gap-2 text-left">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">बुकिंग निश्चित करण्यासाठी ५०% उचल भरा</span>
                      <span className="text-[11px] text-amber-800">
                        रक्कम {BRAND_NAME} एस्क्रो खात्यात सुरक्षित राहील.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handlePayAdvance}
                    disabled={paymentLoading}
                    className="w-full py-2.5 px-4 bg-[var(--marigold-deep)] hover:bg-[#d09112] text-[var(--ink)] font-bold text-xs rounded shadow-sm flex items-center justify-center gap-2"
                  >
                    {paymentLoading ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>५०% उचल भरा • {formatCurrency(createdBooking.advance50Paise)} (Pay Advance)</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link
                href={`/track/${createdBooking.id}`}
                className="px-5 py-2.5 rounded font-bold text-white bg-[var(--teal-deep)] hover:bg-[#0b3836] text-xs shadow-sm flex items-center gap-1.5"
              >
                <span>थेट ट्रॅकिंग पहा (Live Tracking & QR)</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("past_bookings");
                  loadPastBookings();
                }}
                className="px-5 py-2.5 rounded font-bold text-[var(--teal-deep)] bg-[var(--cream)] border border-[var(--warm-gray-300)] text-xs inline-flex items-center gap-1.5 hover:bg-[#fff9e6] transition"
              >
                <Clock className="w-3.5 h-3.5 text-[var(--marigold)]" />
                <span>माझे सर्व बुकिंग पहा (View My Bookings)</span>
              </button>
              <Link
                href="/"
                className="px-5 py-2.5 rounded font-bold text-[var(--warm-gray-700)] bg-[var(--warm-gray-100)] text-xs inline-flex items-center gap-1.5"
              >
                मुख्य पान
              </Link>
            </div>
          </div>
        )}
          </>
        )}

        {/* TAB 2: PAST BOOKINGS SECTION */}
        {activeTab === "past_bookings" && (
          <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-lg border border-[var(--warm-gray-200)] shadow-2xs">
              <div>
                <h2 className="text-base font-bold text-[var(--ink)] font-[family-name:var(--font-display)] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[var(--teal-deep)]" />
                  <span>माझे सर्व बुकिंग तपशील (My Past Bookings)</span>
                </h2>
                <p className="text-xs text-[var(--warm-gray-600)] mt-0.5">
                  आपण नोंदवलेले सर्व चालू व जुने भाडे ट्रॅक करा आणि स्थिती पहा.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadPastBookings}
                  disabled={pastBookingsLoading}
                  className="px-3 py-1.5 rounded border border-[var(--warm-gray-300)] bg-white text-xs font-semibold text-[var(--warm-gray-700)] hover:bg-[var(--warm-gray-100)] inline-flex items-center gap-1.5 transition disabled:opacity-50"
                  title="बुकिंग सूची ताजी करा"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[var(--teal-deep)] ${pastBookingsLoading ? "animate-spin" : ""}`} />
                  <span>रिफ्रेश (Refresh)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setActiveTab("new_booking");
                  }}
                  className="px-3.5 py-1.5 rounded bg-[var(--teal-deep)] text-white text-xs font-bold hover:bg-[#0b3836] inline-flex items-center gap-1.5 shadow-sm transition"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[var(--marigold)]" />
                  <span>नवीन बुकिंग (New Booking)</span>
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setBookingStatusFilter("all")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all ${
                  bookingStatusFilter === "all"
                    ? "bg-[var(--teal-deep)] text-white border-[var(--teal-deep)] shadow-2xs"
                    : "bg-white text-[var(--warm-gray-700)] border-[var(--warm-gray-300)] hover:bg-[var(--warm-gray-100)]"
                }`}
              >
                सर्व बुकिंग (All - {pastBookings.length})
              </button>

              <button
                type="button"
                onClick={() => setBookingStatusFilter("active")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all ${
                  bookingStatusFilter === "active"
                    ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                    : "bg-white text-[var(--warm-gray-700)] border-[var(--warm-gray-300)] hover:bg-[var(--warm-gray-100)]"
                }`}
              >
                चालू ट्रिप्स (Active / In Transit - {pastBookings.filter((b) => !["completed", "cancelled"].includes(b.status)).length})
              </button>

              <button
                type="button"
                onClick={() => setBookingStatusFilter("completed")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all ${
                  bookingStatusFilter === "completed"
                    ? "bg-emerald-700 text-white border-emerald-700 shadow-2xs"
                    : "bg-white text-[var(--warm-gray-700)] border-[var(--warm-gray-300)] hover:bg-[var(--warm-gray-100)]"
                }`}
              >
                पूर्ण झालेल्या (Completed - {pastBookings.filter((b) => b.status === "completed").length})
              </button>
            </div>

            {/* Error Message */}
            {pastBookingsError && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{pastBookingsError}</span>
                </div>
                <button
                  type="button"
                  onClick={loadPastBookings}
                  className="underline font-bold text-red-800 hover:text-red-900"
                >
                  पुन्हा प्रयत्न करा (Retry)
                </button>
              </div>
            )}

            {/* Loading Spinner */}
            {pastBookingsLoading ? (
              <div className="p-16 text-center bg-white rounded-lg border border-[var(--warm-gray-200)] flex flex-col items-center justify-center gap-3">
                <RotateCw className="w-8 h-8 animate-spin text-[var(--teal-deep)]" />
                <span className="text-xs font-bold text-[var(--warm-gray-600)]">मागील बुकिंग माहिती लोड होत आहे...</span>
              </div>
            ) : pastBookings.length === 0 ? (
              /* Empty State */
              <div className="p-12 text-center bg-white rounded-lg border border-[var(--warm-gray-200)] shadow-2xs space-y-4">
                <div className="w-14 h-14 rounded-full bg-[var(--cream)] flex items-center justify-center mx-auto text-[var(--teal-deep)]">
                  <Truck className="w-7 h-7 text-[var(--teal-deep)]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--ink)]">सध्या कोणतेही मागील बुकिंग सापडले नाही</h3>
                  <p className="text-xs text-[var(--warm-gray-600)] mt-1 max-w-md mx-auto">
                    आपण अद्याप कोणतेही भाडे नोंदवलेले नाही किंवा आपण वेगळ्या मोबाईल क्रमांकाने लॉगिन आहात.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setActiveTab("new_booking");
                  }}
                  className="px-6 py-2.5 rounded bg-[var(--teal-deep)] text-white text-xs font-bold hover:bg-[#0b3836] shadow-sm inline-flex items-center gap-2 transition"
                >
                  <PlusCircle className="w-4 h-4 text-[var(--marigold)]" />
                  <span>पहिले भाडे बुक करा (Create First Booking)</span>
                </button>
              </div>
            ) : (
              /* Bookings List */
              <div className="space-y-4">
                {pastBookings
                  .filter((b) => {
                    if (bookingStatusFilter === "active") return !["completed", "cancelled"].includes(b.status);
                    if (bookingStatusFilter === "completed") return b.status === "completed";
                    return true;
                  })
                  .map((booking) => {
                    // Status Badge metadata
                    const getStatusInfo = (st: string) => {
                      switch (st) {
                        case "requested":
                          return { text: "नवीन मागणी • चालक शोधत आहे (Awaiting Driver)", cls: "bg-amber-50 text-amber-800 border-amber-300" };
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
                          return { text: "डिलिव्हरी पूर्ण • ५०-५० रिलीज (Completed)", cls: "bg-emerald-50 text-emerald-800 border-emerald-300" };
                        case "cancelled":
                          return { text: "रद्द केले (Cancelled)", cls: "bg-red-50 text-red-800 border-red-300" };
                        default:
                          return { text: st, cls: "bg-gray-50 text-gray-800 border-gray-300" };
                      }
                    };

                    const statusInfo = getStatusInfo(booking.status);

                    return (
                      <div
                        key={booking.id}
                        className="bg-white rounded-lg border border-[var(--warm-gray-200)] hover:border-[var(--teal-deep)] shadow-2xs p-5 transition space-y-4"
                      >
                        {/* Top Bar: Booking Number, Status, Fare */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--warm-gray-200)]">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-base text-[var(--ink)] font-[family-name:var(--font-display)]">
                                {booking.bookingNumber}
                              </span>
                              <span className={`truck-badge text-[10px] ${statusInfo.cls}`}>
                                {statusInfo.text}
                              </span>
                              {booking.goods.isPerishable && (
                                <span className="truck-badge text-amber-800 border-amber-300 bg-amber-50 text-[10px]">
                                  नाशवंत माल (Perishable)
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--warm-gray-500)] mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-[var(--warm-gray-400)]" />
                                {new Date(booking.createdAt).toLocaleDateString("mr-IN", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                              <span>•</span>
                              <span>वाहन: {booking.truckType}</span>
                              <span>•</span>
                              <span>अंतर: {booking.route?.distanceKm || 0} किमी</span>
                            </div>
                          </div>

                          <div className="text-left sm:text-right">
                            <div className="text-xl font-black text-emerald-800 font-[family-name:var(--font-display)]">
                              {formatCurrency(booking.fare?.totalFarePaise || 0)}
                            </div>
                            <span className="text-[10px] text-[var(--warm-gray-500)] block">
                              ५०% ॲडव्हान्स: {formatCurrency(booking.fare?.advance50Paise || 0)}
                            </span>
                          </div>
                        </div>

                        {/* Location Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {/* Pickup Box */}
                          <div className="p-3 bg-emerald-50/40 rounded border border-emerald-200/60">
                            <div className="flex items-center gap-1.5 font-bold text-emerald-800 uppercase text-[11px] mb-1">
                              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                              <span>पिकअप ठिकाण (Pickup):</span>
                            </div>
                            <p className="font-semibold text-[var(--ink)] leading-snug">{booking.pickup.address}</p>
                            <div className="text-[11px] text-[var(--warm-gray-600)] mt-1">
                              संपर्क: {booking.pickup.contactName} ({booking.pickup.contactPhone})
                            </div>
                          </div>

                          {/* Drop Box */}
                          <div className="p-3 bg-amber-50/40 rounded border border-amber-200/60">
                            <div className="flex items-center gap-1.5 font-bold text-[var(--chili)] uppercase text-[11px] mb-1">
                              <MapPin className="w-3.5 h-3.5 text-[var(--chili)]" />
                              <span>डिलिव्हरी ठिकाण (Drop):</span>
                            </div>
                            <p className="font-semibold text-[var(--ink)] leading-snug">{booking.drop.address}</p>
                            <div className="text-[11px] text-[var(--warm-gray-600)] mt-1">
                              स्वीकारणारा: {booking.drop.receiverName} ({booking.drop.receiverPhone})
                            </div>
                          </div>
                        </div>

                        {/* Cargo & Action Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs border-t border-[var(--warm-gray-100)]">
                          <div className="text-[var(--warm-gray-700)]">
                            <span className="font-bold">माल:</span> {booking.goods.description} ({booking.goods.weightKg} kg)
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/track/${booking.id}`}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[var(--teal-deep)] text-white text-xs font-bold hover:bg-[#0b3836] shadow-2xs transition"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-[var(--marigold)]" />
                              <span>थेट ट्रॅक करा (Track & QR)</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleCopyBooking(booking)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded border border-[var(--warm-gray-300)] bg-white text-xs font-bold text-[var(--ink)] hover:bg-[var(--warm-gray-100)] transition"
                              title="हेच भाडे पुन्हा बुक करण्यासाठी तपशील फॉर्ममध्ये भरा"
                            >
                              <Copy className="w-3.5 h-3.5 text-[var(--teal-deep)]" />
                              <span>पुन्हा बुक करा (Re-book)</span>
                            </button>

                            <a
                              href={`tel:+91${booking.pickup.contactPhone}`}
                              className="inline-flex items-center gap-1 px-2.5 py-2 rounded border border-[var(--warm-gray-200)] text-xs text-[var(--warm-gray-600)] hover:bg-[var(--warm-gray-100)]"
                              title="संपर्क करा"
                            >
                              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
