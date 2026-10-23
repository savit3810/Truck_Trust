"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calculator, Truck, MapPin, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { formatCurrency } from "@/i18n/config";

interface CityData {
  id: string;
  nameMr: string;
  nameEn: string;
  coords: [number, number];
}

const ORIGINS: CityData[] = [
  { id: "nashik", nameMr: "नाशिक (पिंपळगाव APMC)", nameEn: "Nashik (Pimpalgaon)", coords: [73.9882, 20.1744] },
  { id: "junnar", nameMr: "जुन्नर (नारायणगाव टोमॅटो)", nameEn: "Junnar (Narayangaon)", coords: [73.9785, 19.1221] },
  { id: "palghar", nameMr: "पालघर (डहाणू चिकू यार्ड)", nameEn: "Palghar (Dahanu)", coords: [72.7303, 19.9823] },
  { id: "sangamner", nameMr: "संगमनेर (दूध व डाळिंब)", nameEn: "Sangamner (Dairy/Fruits)", coords: [74.2045, 19.5761] },
  { id: "baramati", nameMr: "बारामती (APMC मार्केट)", nameEn: "Baramati (APMC)", coords: [74.5815, 18.1519] },
];

const DESTINATIONS: CityData[] = [
  { id: "vashi", nameMr: "वाशी APMC (नवी मुंबई)", nameEn: "Vashi APMC (Navi Mumbai)", coords: [73.0033, 19.076] },
  { id: "dadar", nameMr: "दादर मार्केट (मुंबई)", nameEn: "Dadar Market (Mumbai)", coords: [72.8428, 19.0178] },
  { id: "bhiwandi", nameMr: "भिवंडी लॉजिस्टिक पार्क", nameEn: "Bhiwandi Logistics Hub", coords: [73.0581, 19.2813] },
  { id: "pune", nameMr: "पुणे मार्केट यार्ड (गुलटेकडी)", nameEn: "Pune Market Yard", coords: [73.868, 18.4905] },
  { id: "surat", nameMr: "सुरत APMC (गुजरात सीमा)", nameEn: "Surat APMC", coords: [72.8311, 21.1702] },
];

const DISTANCE_MATRIX: Record<string, Record<string, number>> = {
  nashik: { vashi: 185, dadar: 195, bhiwandi: 145, pune: 210, surat: 240 },
  junnar: { vashi: 150, dadar: 160, bhiwandi: 135, pune: 95, surat: 280 },
  palghar: { vashi: 125, dadar: 110, bhiwandi: 85, pune: 215, surat: 190 },
  sangamner: { vashi: 210, dadar: 220, bhiwandi: 175, pune: 155, surat: 310 },
  baramati: { vashi: 240, dadar: 250, bhiwandi: 260, pune: 105, surat: 450 },
};

const TRUCK_RATES: Record<string, { nameMr: string; base: number; perKm: number; capacity: string }> = {
  tata_ace: { nameMr: "छोटा हत्ती (Tata Ace)", base: 1400, perKm: 16, capacity: "१ टन (1000 kg)" },
  pickup: { nameMr: "पिकअप बोलेरो (Pickup)", base: 2200, perKm: 21, capacity: "१.७ टन (1700 kg)" },
  truck_14ft: { nameMr: "१४ फूट ट्रक (14ft)", base: 4200, perKm: 32, capacity: "४ टन (4000 kg)" },
  truck_17ft: { nameMr: "१७ फूट ट्रक (17ft)", base: 5500, perKm: 38, capacity: "६ टन (6000 kg)" },
};

export function FareCalculatorWidget() {
  const [originId, setOriginId] = useState("nashik");
  const [destId, setDestId] = useState("vashi");
  const [truckType, setTruckType] = useState("pickup");

  const distanceKm = DISTANCE_MATRIX[originId]?.[destId] || 150;
  const truck = TRUCK_RATES[truckType];

  const rawFare = truck.base + distanceKm * truck.perKm;
  const platformFee = Math.round(rawFare * 0.075);
  const gst = Math.round((rawFare + platformFee) * 0.05);
  const totalFarePaise = (rawFare + platformFee + gst) * 100;
  const advance50Paise = Math.round(totalFarePaise / 2);
  const delivery50Paise = totalFarePaise - advance50Paise;

  const originName = ORIGINS.find((o) => o.id === originId)?.nameMr;
  const destName = DESTINATIONS.find((d) => d.id === destId)?.nameMr;

  return (
    <div className="bg-white rounded-2xl border border-[var(--warm-gray-200)] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-[var(--teal-deep)] text-white p-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[var(--marigold)] text-[var(--teal-deep)] flex items-center justify-center font-bold">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-sm tracking-tight font-[family-name:var(--font-display)]">
              त्वरित भाडे गणक (Live APMC Fare Estimator)
            </h3>
            <p className="text-[11px] text-[var(--cream)]/80">
              पारदर्शक दर • कोणतीही छुपी दलाली नाही
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
          अचूक अंतर मॉडेल
        </span>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Origin & Destination Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[var(--warm-gray-700)] mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              कुठून (Origin APMC / गाव)
            </label>
            <select
              value={originId}
              onChange={(e) => setOriginId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--warm-gray-300)] text-xs bg-[var(--warm-gray-50)] focus:bg-white focus:ring-1 focus:ring-[var(--teal-deep)]"
            >
              {ORIGINS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nameMr}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--warm-gray-700)] mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-red-600" />
              कुठे (Destination Mandi)
            </label>
            <select
              value={destId}
              onChange={(e) => setDestId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--warm-gray-300)] text-xs bg-[var(--warm-gray-50)] focus:bg-white focus:ring-1 focus:ring-[var(--teal-deep)]"
            >
              {DESTINATIONS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nameMr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Truck Type Selection */}
        <div>
          <label className="block text-xs font-bold text-[var(--warm-gray-700)] mb-1.5 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-[var(--teal-deep)]" />
            ट्रकचा प्रकार आणि क्षमता निवडा
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(TRUCK_RATES).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTruckType(key)}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                  truckType === key
                    ? "border-[var(--teal-deep)] bg-emerald-50 text-[var(--teal-deep)] font-bold shadow-2xs"
                    : "border-[var(--warm-gray-200)] hover:bg-[var(--warm-gray-50)] text-[var(--warm-gray-700)]"
                }`}
              >
                <div className="text-[11px] truncate">{item.nameMr}</div>
                <div className="text-[10px] text-[var(--warm-gray-500)] mt-0.5">{item.capacity}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Calculated Results Card */}
        <div className="p-4 bg-[var(--cream)]/60 rounded-xl border border-[var(--warm-gray-200)] space-y-3">
          <div className="flex items-center justify-between text-xs text-[var(--warm-gray-600)]">
            <span>अंदाजे अंतर: <strong className="text-[var(--ink)] font-mono">{distanceKm} किमी</strong></span>
            <span>क्षमता: <strong className="text-[var(--ink)]">{truck.capacity}</strong></span>
          </div>

          <div className="flex items-baseline justify-between border-t border-[var(--warm-gray-300)] pt-3">
            <div>
              <span className="text-[11px] text-[var(--warm-gray-600)] block">अंदाजे निश्चित एकूण भाडे:</span>
              <div className="text-2xl font-black text-[var(--teal-deep)] font-[family-name:var(--font-display)]">
                {formatCurrency(totalFarePaise)}
              </div>
            </div>
            <div className="text-right text-xs">
              <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded">
                ५०% एस्क्रो मॉडेल
              </span>
              <div className="text-[11px] text-[var(--warm-gray-600)] mt-1 font-mono">
                आगाऊ: {formatCurrency(advance50Paise)} | वितरणावर: {formatCurrency(delivery50Paise)}
              </div>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/book?truck=${truckType}`}
            className="flex-1 py-3 px-4 rounded-xl bg-[var(--teal-deep)] text-white text-xs font-bold hover:bg-[#0b3836] shadow-sm flex items-center justify-center gap-2"
          >
            <span>हा ट्रक आत्ताच बुक करा</span>
            <ArrowRight className="w-4 h-4 text-[var(--marigold)]" />
          </Link>
          <Link
            href="/mitra"
            className="py-3 px-4 rounded-xl bg-[var(--warm-gray-100)] text-[var(--ink)] text-xs font-bold hover:bg-[var(--warm-gray-200)] flex items-center justify-center gap-1.5"
          >
            <span>ट्रक मित्र सहाय्य घ्या</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
