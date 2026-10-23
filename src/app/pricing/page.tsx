"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Truck,
  Scale,
  ShieldCheck,
  CheckCircle2,
  Info,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { BRAND_NAME } from "@/lib/config/brand";
import { formatCurrency } from "@/i18n/config";
import { FareCalculatorWidget } from "@/components/home/FareCalculatorWidget";

const TRUCK_RATES = [
  {
    type: "tata_ace",
    nameMr: "छोटा हत्ती (Tata Ace)",
    capacityKg: "१,००० किलो (१ टन)",
    baseFarePaise: 140000,
    perKmPaise: 1600,
    bestFor: "भाजीपाला, फुले, स्थानिक शेतमाल व लहान व्यापारी",
  },
  {
    type: "pickup",
    nameMr: "बोलेरो पिकअप (Pickup)",
    capacityKg: "१,७०० किलो (१.७ टन)",
    baseFarePaise: 220000,
    perKmPaise: 2100,
    bestFor: "कांदा, टोमॅटो, दूध कॅन्स व फळांची जलद वाहतूक",
  },
  {
    type: "truck_14ft",
    nameMr: "१४ फूट ट्रक (Eicher/Tata)",
    capacityKg: "४,००० किलो (४ टन)",
    baseFarePaise: 420000,
    perKmPaise: 3200,
    bestFor: "चिकू बागायत, धान्य पोती, साखर व गोदाम माल",
  },
  {
    type: "truck_17ft",
    nameMr: "१७-१९ फूट ट्रक (Medium Freight)",
    capacityKg: "६,५०० किलो (६.५ टन)",
    baseFarePaise: 550000,
    perKmPaise: 3800,
    bestFor: "मोठे कांदा व्यापारी, डाळिंब व अंतरजिल्हा कॉरिडोर्स",
  },
  {
    type: "truck_22ft",
    nameMr: "२२ फूट हेवी ट्रक (Heavy Freight)",
    capacityKg: "१०,००० किलो (१० टन)",
    baseFarePaise: 750000,
    perKmPaise: 4600,
    bestFor: "साखर कारखाने, खते व औद्योगिक घाऊक वाहतूक",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-[var(--warm-gray-200)] bg-white sticky top-0 z-20 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-[var(--teal-deep)] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>मुख्यपृष्ठावर परत (Home)</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-black text-lg text-[var(--ink)] font-[family-name:var(--font-display)]">
              {BRAND_NAME}
            </span>
            <span className="truck-badge text-[var(--teal-deep)] bg-emerald-50 border-emerald-300">
              दरपत्रक
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-12 flex-1">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--cream)] border border-[var(--warm-gray-300)] text-xs font-bold text-[var(--teal-deep)]">
            <Scale className="w-4 h-4 text-[var(--marigold)]" />
            <span>१००% पारदर्शक दर • छुपे शुल्क शून्य</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[var(--ink)] tracking-tight font-[family-name:var(--font-display)]">
            पारदर्शक भाडे दरपत्रक (Pricing Policy)
          </h1>
          <p className="text-sm sm:text-base text-[var(--warm-gray-700)]">
            कोणतीही दलाली किंवा अचानक वाढीव शुल्क नाही. अंतरावर आधारित निश्चित दर, ५०-५० एस्क्रो सुरक्षितता आणि परतीच्या प्रवासात थेट सवलत.
          </p>
        </div>

        {/* Live Interactive Fare Estimator */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[var(--warm-gray-200)] shadow-2xs space-y-6">
          <div className="border-b border-[var(--warm-gray-200)] pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[var(--ink)] font-[family-name:var(--font-display)]">
                थेट भाडे कॅल्क्युलेटर (Live Fare Calculator)
              </h2>
              <p className="text-xs text-[var(--warm-gray-500)]">
                तुमचा मार्ग, वाहन प्रकार आणि वजन निवडून अचूक भाडे समजून घ्या
              </p>
            </div>
            <span className="truck-badge text-[var(--marigold)] bg-amber-50 border-amber-300 hidden sm:inline-flex">
              OSRM राऊटिंग इंजिन
            </span>
          </div>

          <FareCalculatorWidget />
        </section>

        {/* Standard Vehicle Rate Card */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[var(--warm-gray-200)] shadow-2xs space-y-6">
          <div className="border-b border-[var(--warm-gray-200)] pb-3">
            <h2 className="text-xl font-bold text-[var(--ink)] font-[family-name:var(--font-display)]">
              प्रमाणित वाहन दर तक्ता (Standard Rate Card)
            </h2>
            <p className="text-xs text-[var(--warm-gray-500)]">
              सर्व वाहनांसाठी किमान बेस भाडे आणि प्रति किलोमीटर दर
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[var(--warm-gray-700)]">
              <thead className="bg-[var(--cream)]/60 text-[var(--ink)] font-bold uppercase tracking-wider text-[11px] border-b border-[var(--warm-gray-300)]">
                <tr>
                  <th className="py-3 px-4">वाहन प्रकार (Truck)</th>
                  <th className="py-3 px-4">वजन क्षमता</th>
                  <th className="py-3 px-4">किमान बेस भाडे</th>
                  <th className="py-3 px-4">प्रति किमी दर</th>
                  <th className="py-3 px-4">कशासाठी योग्य?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--warm-gray-200)]">
                {TRUCK_RATES.map((t) => (
                  <tr key={t.type} className="hover:bg-[var(--warm-gray-50)]">
                    <td className="py-3.5 px-4 font-bold text-[var(--ink)]">
                      {t.nameMr}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium">{t.capacityKg}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[var(--teal-deep)]">
                      {formatCurrency(t.baseFarePaise)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[var(--marigold)]">
                      ₹{t.perKmPaise / 100} / किमी
                    </td>
                    <td className="py-3.5 px-4 text-[var(--warm-gray-600)]">{t.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Additional Fare Rules & Inclusions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 bg-white rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-[var(--teal-deep)] font-bold text-sm">
              <Clock className="w-4 h-4 text-[var(--marigold)]" />
              <h3>लोडिंग / अनलोडिंग वेळ</h3>
            </div>
            <p className="text-xs text-[var(--warm-gray-600)] leading-relaxed">
              प्रत्येक ट्रिपसाठी लोडिंगकरिता २ तास आणि अनलोडिंगकरिता २ तास पूर्णपणे मोफत मिळतात. त्यानंतर प्रति तास ₹२००/- प्रमाणे डिटेन्शन चार्ज लागतो.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-[var(--teal-deep)] font-bold text-sm">
              <Sparkles className="w-4 h-4 text-[var(--marigold)]" />
              <h3>परतीच्या फेरीत सवलत (Return Loads)</h3>
            </div>
            <p className="text-xs text-[var(--warm-gray-600)] leading-relaxed">
              वाशी किंवा पुण्यात माल खाली करून परत जाणाऱ्या मोकळ्या ट्रकला लोड दिल्यास नियमित भाड्यात २०% ते ३०% थेट सवलत मिळते.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-[var(--teal-deep)] font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-[var(--marigold)]" />
              <h3>५०-५० एस्क्रो सुरक्षितता</h3>
            </div>
            <p className="text-xs text-[var(--warm-gray-600)] leading-relaxed">
              ५०% आगाऊ रक्कम थेट चालकाला न जाता एस्क्रो खात्यात राहते. माल पोहोचून स्वीकारकर्त्याने ओटीपी दिल्यानंतरच संपूर्ण रक्कम चालकाला मिळते.
            </p>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="p-6 bg-[var(--teal-deep)] text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold font-[family-name:var(--font-display)]">
              तुमचा शेतमाल आजच सुरक्षित पाठवा
            </h3>
            <p className="text-xs text-[var(--cream)]/80 mt-1">
              पडताळणीकृत ट्रक चालक, लाइव्ह ट्रॅकिंग आणि पारदर्शक ५०-५० एस्क्रो संरक्षण.
            </p>
          </div>
          <Link
            href="/book"
            className="px-5 py-2.5 rounded-lg bg-[var(--marigold)] text-[var(--teal-deep)] text-xs font-bold hover:brightness-105 active:scale-95 transition-all shadow-md inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>आताच माल बुक करा</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--warm-gray-200)] bg-white py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--warm-gray-500)] gap-3">
          <div>© 2026 {BRAND_NAME}. सर्व हक्क राखीव.</div>
          <div className="flex gap-4">
            <Link href="/how-it-works" className="hover:underline">कसे काम करते</Link>
            <Link href="/privacy" className="hover:underline">गोपनीयता धोरण</Link>
            <Link href="/terms" className="hover:underline">अटी व शर्ती</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
