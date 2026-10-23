"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Truck,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Printer,
  Share2,
  PhoneCall,
  Coins,
  MapPin,
  RefreshCw,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import { BRAND_NAME } from "@/lib/config/brand";
import { formatCurrency } from "@/i18n/config";

interface APMCPreset {
  nameMr: string;
  nameEn: string;
  pickup: {
    address: string;
    taluka: string;
    district: string;
    coordinates: [number, number];
  };
  drop: {
    address: string;
    taluka: string;
    district: string;
    coordinates: [number, number];
  };
  distanceKm: number;
  estHours: number;
}

const APMC_PRESETS: APMCPreset[] = [
  {
    nameMr: "नाशिक APMC (पिंपळगाव कांदा) ➡️ वाशी APMC (नवी मुंबई)",
    nameEn: "Nashik APMC Onion Yard to Vashi APMC Navi Mumbai",
    pickup: {
      address: "Pimpalgaon Baswant APMC Market Yard, Nashik",
      taluka: "Niphad",
      district: "Nashik",
      coordinates: [73.9882, 20.1744],
    },
    drop: {
      address: "Sector 19, APMC Market Yard, Vashi, Navi Mumbai",
      taluka: "Thane",
      district: "Thane",
      coordinates: [73.0033, 19.076],
    },
    distanceKm: 185,
    estHours: 5,
  },
  {
    nameMr: "जुन्नर टोमॅटो मार्केट ➡️ दादर मार्केट (मुंबई)",
    nameEn: "Junnar Tomato Market to Dadar Flower/Veg Market Mumbai",
    pickup: {
      address: "Narayangaon APMC Submarket, Junnar",
      taluka: "Junnar",
      district: "Pune",
      coordinates: [73.9785, 19.1221],
    },
    drop: {
      address: "Senapati Bapat Marg, Dadar West, Mumbai",
      taluka: "Mumbai City",
      district: "Mumbai",
      coordinates: [72.8428, 19.0178],
    },
    distanceKm: 160,
    estHours: 4.5,
  },
  {
    nameMr: "पालघर चिकू बागायत ➡️ भिवंडी लॉजिस्टिक पार्क",
    nameEn: "Palghar Chikoo Orchards to Bhiwandi Logistic Hub",
    pickup: {
      address: "Dahanu Gholvad Chikoo Board, Palghar",
      taluka: "Dahanu",
      district: "Palghar",
      coordinates: [72.7303, 19.9823],
    },
    drop: {
      address: "Mankoli Naka, Bhiwandi Warehousing Hub",
      taluka: "Bhiwandi",
      district: "Thane",
      coordinates: [73.0581, 19.2813],
    },
    distanceKm: 110,
    estHours: 3,
  },
  {
    nameMr: "संगमनेर दूध डेअरी ➡️ पुणे गुलटेकडी मार्केट यार्ड",
    nameEn: "Sangamner Dairy to Pune Gultekdi Market Yard",
    pickup: {
      address: "Amrutnagar Milk Processing Union, Sangamner",
      taluka: "Sangamner",
      district: "Ahmednagar",
      coordinates: [74.2045, 19.5761],
    },
    drop: {
      address: "Pune APMC Market Yard, Gultekdi, Pune",
      taluka: "Haveli",
      district: "Pune",
      coordinates: [73.868, 18.4905],
    },
    distanceKm: 155,
    estHours: 4,
  },
];

const COMMODITIES = [
  { id: "onion", labelMr: "कांदा (Onions)", category: "agricultural_produce", perishable: true },
  { id: "tomato", labelMr: "टोमॅटो (Tomatoes)", category: "agricultural_produce", perishable: true },
  { id: "pomegranate", labelMr: "डाळिंब / केळी (Pomegranate/Banana)", category: "agricultural_produce", perishable: true },
  { id: "chikoo", labelMr: "चिकू / आंबा (Chikoo/Mango)", category: "agricultural_produce", perishable: true },
  { id: "milk", labelMr: "दूध कॅन्स (Dairy Milk Cans)", category: "dairy_milk", perishable: true },
  { id: "grains", labelMr: "धान्य / कडधान्य (Grains/Pulses)", category: "agricultural_produce", perishable: false },
  { id: "other", labelMr: "इतर कृषी / औद्योगिक माल", category: "other", perishable: false },
];

const TRUCKS = [
  { id: "tata_ace", name: "छोटा हत्ती (Tata Ace / 1 Ton)", baseFare: 1400, perKm: 16 },
  { id: "pickup", name: "पिकअप बोलेरो (Pickup / 1.7 Ton)", baseFare: 2200, perKm: 21 },
  { id: "truck_14ft", name: "१४ फूट ट्रक (14ft / 4 Ton)", baseFare: 4200, perKm: 32 },
  { id: "truck_17ft", name: "१७ फूट ट्रक (17ft / 6 Ton)", baseFare: 5500, perKm: 38 },
];

export default function TruckMitraPage() {
  const [selectedCorridorIdx, setSelectedCorridorIdx] = useState(0);
  const [farmerName, setFarmerName] = useState("");
  const [farmerPhone, setFarmerPhone] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [commodity, setCommodity] = useState(COMMODITIES[0]);
  const [weightKg, setWeightKg] = useState("1500");
  const [selectedTruck, setSelectedTruck] = useState(TRUCKS[1]);
  const [mitraName, setMitraName] = useState("विठ्ठल जाधव (APMC केंद्र क्र. १२)");
  const [mitraCode, setMitraCode] = useState("TM-NSK-442");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mitra Dashboard Counter
  const [todayBookingsCount, setTodayBookingsCount] = useState(6);
  const [todayCommissionPaise, setTodayCommissionPaise] = useState(485000); // Rs 4,850

  const corridor = APMC_PRESETS[selectedCorridorIdx];

  // Calculate live estimate
  const estDistanceKm = corridor.distanceKm;
  const rawFare = selectedTruck.baseFare + estDistanceKm * selectedTruck.perKm;
  const perishableSurcharge = commodity.perishable ? Math.round(rawFare * 0.08) : 0;
  const subtotal = rawFare + perishableSurcharge;
  const platformFee = Math.round(subtotal * 0.075);
  const gst = Math.round((subtotal + platformFee) * 0.05);
  const totalFarePaise = (subtotal + platformFee + gst) * 100;
  const advance50Paise = Math.round(totalFarePaise / 2);
  const delivery50Paise = totalFarePaise - advance50Paise;
  const mitraCommissionPaise = Math.round(totalFarePaise * 0.015); // 1.5% facilitation commission

  const handleCreateAssistedBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!farmerName || farmerPhone.length !== 10) {
      setError("कृपया शेतकऱ्याचे नाव आणि १० अंकी मोबाईल नंबर योग्य प्रविष्ट करा.");
      return;
    }

    if (!receiverName || receiverPhone.length !== 10) {
      setError("कृपया व्यापारी/स्वीकारकर्त्याचे नाव आणि १० अंकी मोबाईल नंबर योग्य प्रविष्ट करा.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        pickup: {
          address: corridor.pickup.address,
          taluka: corridor.pickup.taluka,
          district: corridor.pickup.district,
          coordinates: corridor.pickup.coordinates,
          contactName: `${farmerName} (शेतकरी)`,
          contactPhone: farmerPhone,
        },
        drop: {
          address: corridor.drop.address,
          taluka: corridor.drop.taluka,
          district: corridor.drop.district,
          coordinates: corridor.drop.coordinates,
          receiverName: `${receiverName} (व्यापारी/कमिशन एजंट)`,
          receiverPhone: receiverPhone,
        },
        goods: {
          category: commodity.category,
          description: `${commodity.labelMr} - ${weightKg} kg (मित्र बुकिंग)`,
          weightKg: Number(weightKg),
          isPerishable: commodity.perishable,
          isFragile: false,
          specialNotes: `बुकिंग सहाय्यक: ${mitraName} (कोड: ${mitraCode}). शेतकरी रोख/UPI द्वारे ५०% आगाऊ देईल.`,
        },
        truckType: selectedTruck.id,
        mode: "broadcast",
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 401) {
          throw new Error("कृपया प्रथम मुख्य खात्यात लॉगिन करा किंवा ऑटो-लॉगिन वापरा.");
        }
        throw new Error(data.error || "बुकिंग तयार करताना त्रुटी आली.");
      }

      setBookingSuccess(data.booking);
      setTodayBookingsCount((prev) => prev + 1);
      setTodayCommissionPaise((prev) => prev + mitraCommissionPaise);
    } catch (err: any) {
      setError(err.message || "सर्व्हरशी संपर्क होऊ शकला नाही.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--warm-gray-200)] bg-[var(--teal-deep)] text-white sticky top-0 z-20 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-10 h-10 rounded-lg bg-[var(--marigold)] text-[var(--teal-deep)] flex items-center justify-center font-black shadow-sm"
            >
              TT
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-white font-[family-name:var(--font-display)]">
                  {BRAND_NAME} ट्रक मित्र पोर्टल
                </span>
                <span className="text-[10px] bg-[var(--marigold)] text-[var(--teal-deep)] font-extrabold px-2 py-0.5 rounded-full">
                  सहाय्यक बुकिंग
                </span>
              </div>
              <p className="text-xs text-[var(--cream)]/80">
                ग्रामीण शेतकरी आणि व्यापारी यांच्यासाठी विश्वासू एजंट केंद्र
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="hidden sm:block text-right">
              <div className="font-bold text-[var(--cream)]">{mitraName}</div>
              <div className="text-[11px] text-[var(--marigold)] font-mono">{mitraCode}</div>
            </div>
            <Link
              href="/"
              className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white font-bold"
            >
              बाहेर पडा
            </Link>
          </div>
        </div>
      </header>

      {/* Main Mitra Dashboard */}
      <main className="max-w-6xl w-full mx-auto px-4 py-6 sm:py-8 flex-1 space-y-6">
        {/* Mitra Performance Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-white rounded-xl border border-[var(--warm-gray-200)] shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs text-[var(--warm-gray-500)] font-medium">आजचे सहाय्यक बुकिंग्ज</span>
              <div className="text-2xl font-black text-[var(--ink)] mt-0.5">
                {todayBookingsCount} <span className="text-xs text-emerald-600 font-bold">+२ चालू</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[var(--warm-gray-200)] shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs text-[var(--warm-gray-500)] font-medium">आजचे कमिशन कमाई (१.५%)</span>
              <div className="text-2xl font-black text-[var(--teal-deep)] mt-0.5">
                {formatCurrency(todayCommissionPaise)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[var(--warm-gray-200)] shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs text-[var(--warm-gray-500)] font-medium">मित्र दर्जा व पडताळणी</span>
              <div className="text-sm font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                अधिकृत APMC केंद्र (सक्रिय)
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-[var(--teal-deep)] flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Success Screen after Booking */}
        {bookingSuccess ? (
          <div className="bg-white rounded-2xl border-2 border-emerald-500 p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--warm-gray-200)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[var(--ink)]">
                    शेतकऱ्याचे बुकिंग यशस्वीरीत्या पूर्ण झाले!
                  </h2>
                  <p className="text-xs text-[var(--warm-gray-600)]">
                    बुकिंग क्रमांक: <strong className="font-mono text-emerald-700">{bookingSuccess.bookingNumber}</strong> • शेतकरी आणि चालकाला SMS पाठवला आहे.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintReceipt}
                  className="px-4 py-2 rounded-lg bg-[var(--teal-deep)] text-white text-xs font-bold hover:bg-[#0b3836] flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  पावती प्रिंट करा
                </button>
                <Link
                  href={`/track/${bookingSuccess.id}`}
                  className="px-4 py-2 rounded-lg bg-[var(--warm-gray-100)] text-[var(--ink)] text-xs font-bold hover:bg-[var(--warm-gray-200)]"
                >
                  लाईव्ह ट्रॅक
                </Link>
                <button
                  onClick={() => {
                    setBookingSuccess(null);
                    setFarmerName("");
                    setFarmerPhone("");
                  }}
                  className="px-3 py-2 rounded-lg border border-[var(--warm-gray-300)] text-xs font-bold hover:bg-[var(--warm-gray-50)]"
                >
                  नवीन बुकिंग करा
                </button>
              </div>
            </div>

            {/* Printable Receipt Card */}
            <div className="p-6 bg-[var(--warm-gray-50)] border border-[var(--warm-gray-200)] rounded-xl space-y-4 print:p-0 print:border-none print:bg-white">
              <div className="flex items-center justify-between border-b border-[var(--warm-gray-300)] pb-3">
                <div>
                  <h3 className="text-lg font-black text-[var(--ink)] tracking-tight">
                    {BRAND_NAME} - अधिकृत शेतकरी मालवाहतूक पावती
                  </h3>
                  <p className="text-xs text-[var(--warm-gray-600)]">
                    मित्र केंद्र: {mitraName} ({mitraCode}) • दूरध्वनी: १८०० ८७८२५
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[var(--warm-gray-500)]">दिनांक: {new Date().toLocaleDateString("mr-IN")}</div>
                  <div className="text-xs font-bold text-emerald-700">५०% एस्क्रो संरक्षित</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <h4 className="font-bold text-[var(--ink)] mb-1">शेतकरी तपशील (Consignor):</h4>
                  <div className="text-[var(--warm-gray-700)]">नाव: {bookingSuccess.pickup?.contactName}</div>
                  <div className="text-[var(--warm-gray-700)]">मोबाईल: {bookingSuccess.pickup?.contactPhone}</div>
                  <div className="text-[var(--warm-gray-700)]">उगम: {bookingSuccess.pickup?.address}</div>
                </div>

                <div>
                  <h4 className="font-bold text-[var(--ink)] mb-1">स्वीकारकर्ता / व्यापारी (Consignee):</h4>
                  <div className="text-[var(--warm-gray-700)]">नाव: {bookingSuccess.drop?.receiverName}</div>
                  <div className="text-[var(--warm-gray-700)]">मोबाईल: {bookingSuccess.drop?.receiverPhone}</div>
                  <div className="text-[var(--warm-gray-700)]">गंतव्य: {bookingSuccess.drop?.address}</div>
                </div>
              </div>

              <div className="border-t border-[var(--warm-gray-300)] pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 bg-white rounded border border-[var(--warm-gray-200)]">
                  <span className="text-[11px] text-[var(--warm-gray-500)]">मालाचा प्रकार:</span>
                  <div className="font-bold text-[var(--ink)]">{commodity.labelMr}</div>
                </div>
                <div className="p-2 bg-white rounded border border-[var(--warm-gray-200)]">
                  <span className="text-[11px] text-[var(--warm-gray-500)]">अंदाजे वजन:</span>
                  <div className="font-bold text-[var(--ink)]">{weightKg} किलो</div>
                </div>
                <div className="p-2 bg-white rounded border border-[var(--warm-gray-200)]">
                  <span className="text-[11px] text-[var(--warm-gray-500)]">एकूण भाडे:</span>
                  <div className="font-bold text-[var(--teal-deep)]">{formatCurrency(totalFarePaise)}</div>
                </div>
                <div className="p-2 bg-white rounded border border-[var(--warm-gray-200)]">
                  <span className="text-[11px] text-[var(--warm-gray-500)]">५०% आगाऊ देय:</span>
                  <div className="font-bold text-emerald-700">{formatCurrency(advance50Paise)}</div>
                </div>
              </div>

              <div className="border-t border-[var(--warm-gray-200)] pt-3 flex items-center justify-between text-[11px] text-[var(--warm-gray-500)]">
                <div>* डिलिव्हरी झाल्यावरच ओटीपी द्यावा. मोफत लोडिंग वेळ २ तास.</div>
                <div className="font-bold text-[var(--teal-deep)]">मित्र कमिशन: {formatCurrency(mitraCommissionPaise)} (जमा झाले)</div>
              </div>
            </div>
          </div>
        ) : (
          /* Form for Assisted Booking */
          <form
            onSubmit={handleCreateAssistedBooking}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left 2 Cols: Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step A: APMC Route Selection */}
              <div className="bg-white p-6 rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[var(--teal-deep)]" />
                    १. प्रमुख APMC मार्ग (Corridor Selection)
                  </h3>
                  <span className="text-[11px] text-[var(--warm-gray-500)]">अंदाजे अंतर: {corridor.distanceKm} किमी</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {APMC_PRESETS.map((p, idx) => (
                    <button
                      key={p.nameEn}
                      type="button"
                      onClick={() => setSelectedCorridorIdx(idx)}
                      className={`p-3 text-left rounded-lg border text-xs transition-all ${
                        selectedCorridorIdx === idx
                          ? "border-[var(--teal-deep)] bg-emerald-50/50 shadow-xs font-bold text-[var(--teal-deep)]"
                          : "border-[var(--warm-gray-200)] hover:bg-[var(--warm-gray-50)] text-[var(--warm-gray-800)]"
                      }`}
                    >
                      <div className="leading-tight">{p.nameMr}</div>
                      <div className="text-[10px] text-[var(--warm-gray-500)] mt-1 font-normal">
                        {p.distanceKm} किमी • ~{p.estHours} तास
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step B: Farmer & Merchant Details */}
              <div className="bg-white p-6 rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[var(--teal-deep)]" />
                  २. शेतकरी आणि व्यापारी माहिती (Consignor & Buyer)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Farmer */}
                  <div className="p-3 bg-[var(--cream)]/40 rounded-lg border border-[var(--warm-gray-200)] space-y-2">
                    <span className="text-[11px] font-bold text-[var(--teal-deep)] uppercase tracking-wide">
                      शेतकरी (Farmer / मालक)
                    </span>
                    <div>
                      <label className="block text-[11px] text-[var(--warm-gray-700)] mb-1">
                        शेतकऱ्याचे पूर्ण नाव *
                      </label>
                      <input
                        type="text"
                        required
                        value={farmerName}
                        onChange={(e) => setFarmerName(e.target.value)}
                        placeholder="उदा. बबनराव पाटील"
                        className="w-full px-3 py-2 rounded border border-[var(--warm-gray-300)] text-xs focus:ring-1 focus:ring-[var(--teal-deep)] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[var(--warm-gray-700)] mb-1">
                        मोबाईल नंबर (१० अंकी) *
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={farmerPhone}
                        onChange={(e) => setFarmerPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="९८XXXXXXXX"
                        className="w-full px-3 py-2 rounded border border-[var(--warm-gray-300)] text-xs focus:ring-1 focus:ring-[var(--teal-deep)] bg-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Buyer */}
                  <div className="p-3 bg-[var(--cream)]/40 rounded-lg border border-[var(--warm-gray-200)] space-y-2">
                    <span className="text-[11px] font-bold text-[var(--marigold)] uppercase tracking-wide">
                      स्वीकारकर्ता व्यापारी / आडत्या
                    </span>
                    <div>
                      <label className="block text-[11px] text-[var(--warm-gray-700)] mb-1">
                        व्यापारी किंवा पेढीचे नाव *
                      </label>
                      <input
                        type="text"
                        required
                        value={receiverName}
                        onChange={(e) => setReceiverName(e.target.value)}
                        placeholder="उदा. मेसर्स गणेश ट्रेडिंग कंपनी"
                        className="w-full px-3 py-2 rounded border border-[var(--warm-gray-300)] text-xs focus:ring-1 focus:ring-[var(--teal-deep)] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[var(--warm-gray-700)] mb-1">
                        व्यापाऱ्याचा मोबाईल नंबर *
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={receiverPhone}
                        onChange={(e) => setReceiverPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="९८XXXXXXXX"
                        className="w-full px-3 py-2 rounded border border-[var(--warm-gray-300)] text-xs focus:ring-1 focus:ring-[var(--teal-deep)] bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step C: Commodity & Vehicle Selection */}
              <div className="bg-white p-6 rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[var(--teal-deep)]" />
                  ३. शेतमाल आणि वाहन प्रकार (Produce & Vehicle)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--warm-gray-700)] mb-1">
                      शेतमालाचा प्रकार
                    </label>
                    <select
                      value={commodity.id}
                      onChange={(e) => {
                        const found = COMMODITIES.find((c) => c.id === e.target.value);
                        if (found) setCommodity(found);
                      }}
                      className="w-full px-3 py-2 rounded border border-[var(--warm-gray-300)] text-xs bg-white focus:ring-1 focus:ring-[var(--teal-deep)]"
                    >
                      {COMMODITIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.labelMr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--warm-gray-700)] mb-1">
                      अंदाजे वजन (किलो मध्ये)
                    </label>
                    <input
                      type="number"
                      min={50}
                      step={50}
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-[var(--warm-gray-300)] text-xs bg-white focus:ring-1 focus:ring-[var(--teal-deep)] font-mono"
                    />
                  </div>
                </div>

                {/* Truck Types */}
                <div>
                  <label className="block text-xs font-bold text-[var(--warm-gray-700)] mb-2">
                    आवश्यक ट्रक प्रकार
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {TRUCKS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTruck(t)}
                        className={`p-2.5 rounded border text-left text-xs transition-all ${
                          selectedTruck.id === t.id
                            ? "border-[var(--teal-deep)] bg-emerald-50 text-[var(--teal-deep)] font-bold shadow-xs"
                            : "border-[var(--warm-gray-200)] hover:bg-[var(--warm-gray-50)] text-[var(--warm-gray-800)]"
                        }`}
                      >
                        <div>{t.name}</div>
                        <div className="text-[10px] text-[var(--warm-gray-500)] mt-0.5 font-normal">
                          मूळ भाडे: ₹{t.baseFare} + ₹{t.perKm}/किमी
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Instant Fare Breakdown & Mitra Commission */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-4 sticky top-20">
                <h3 className="text-sm font-black text-[var(--ink)] flex items-center justify-between border-b border-[var(--warm-gray-200)] pb-3">
                  <span>भाडे व कमिशन गणक</span>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                    एस्क्रो मॉडेल
                  </span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[var(--warm-gray-600)]">
                    <span>अंतर (Distance):</span>
                    <span className="font-mono">{corridor.distanceKm} किमी</span>
                  </div>
                  <div className="flex justify-between text-[var(--warm-gray-600)]">
                    <span>मूळ वाहतूक भाडे:</span>
                    <span className="font-mono">₹{rawFare.toLocaleString("en-IN")}</span>
                  </div>
                  {perishableSurcharge > 0 && (
                    <div className="flex justify-between text-[var(--warm-gray-600)]">
                      <span>नाशवंत शेतमाल अधिभार (8%):</span>
                      <span className="font-mono">₹{perishableSurcharge.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[var(--warm-gray-600)]">
                    <span>प्लॅटफॉर्म व जीएसटी (7.5% + 5%):</span>
                    <span className="font-mono">₹{(platformFee + gst).toLocaleString("en-IN")}</span>
                  </div>

                  <div className="border-t border-[var(--warm-gray-200)] pt-2 flex justify-between font-bold text-sm text-[var(--ink)]">
                    <span>एकूण निश्चित भाडे:</span>
                    <span className="text-[var(--teal-deep)] font-black">
                      {formatCurrency(totalFarePaise)}
                    </span>
                  </div>
                </div>

                {/* 50-50 Escrow Breakdown */}
                <div className="p-3 bg-[var(--warm-gray-50)] border border-[var(--warm-gray-200)] rounded-lg space-y-1.5 text-xs">
                  <div className="flex justify-between font-medium">
                    <span>५०% आगाऊ (बुकिंग वेळी):</span>
                    <strong className="text-emerald-700">{formatCurrency(advance50Paise)}</strong>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>५०% वितरणावर (OTP नंतर):</span>
                    <strong>{formatCurrency(delivery50Paise)}</strong>
                  </div>
                </div>

                {/* Mitra Commission Earned Box */}
                <div className="p-3.5 bg-amber-50/80 border border-amber-300 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-900 tracking-wider">
                      मित्र एजंट कमिशन (१.५%)
                    </span>
                    <div className="font-black text-amber-900 text-base mt-0.5">
                      {formatCurrency(mitraCommissionPaise)}
                    </div>
                  </div>
                  <Coins className="w-6 h-6 text-amber-600" />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-lg bg-[var(--teal-deep)] text-white text-xs font-bold hover:bg-[#0b3836] shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[var(--marigold)]" />
                      <span>बुकिंग नोंदवत आहे...</span>
                    </>
                  ) : (
                    <>
                      <span>शेतकऱ्यासाठी ट्रक बुक करा</span>
                      <ArrowRight className="w-4 h-4 text-[var(--marigold)]" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-[var(--warm-gray-500)]">
                  * शेतकरी किंवा व्यापाऱ्यास तात्काळ एसएमएसद्वारे ट्रॅकिंग लिंक पाठवली जाईल.
                </p>
              </div>
            </div>
          </form>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--warm-gray-200)] bg-white py-4 mt-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--warm-gray-500)] gap-2">
          <div>© 2026 {BRAND_NAME} - ग्रामीण महाराष्ट्र ट्रक मित्र नेटवर्क.</div>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:underline">अटी व शर्ती</Link>
            <Link href="/refunds" className="hover:underline">परतावा धोरण</Link>
            <Link href="/privacy" className="hover:underline">गोपनीयता</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
