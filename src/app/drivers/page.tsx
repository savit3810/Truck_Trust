"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Truck,
  ShieldCheck,
  Coins,
  CheckCircle2,
  FileCheck,
  PhoneCall,
  ArrowRight,
  TrendingUp,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import { BRAND_NAME } from "@/lib/config/brand";
import { formatCurrency } from "@/i18n/config";

export default function DriversRecruitmentPage() {
  const [weeklyTrips, setWeeklyTrips] = useState(4);
  const [selectedTruck, setSelectedTruck] = useState<"pickup" | "truck_14ft" | "tata_ace">("pickup");

  // Approximate net income estimation for driver
  const avgProfitPerTrip =
    selectedTruck === "tata_ace" ? 2200 : selectedTruck === "pickup" ? 3400 : 5800;
  const monthlyEstimatedEarnings = weeklyTrips * 4 * avgProfitPerTrip;

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
            <span className="truck-badge text-[var(--marigold)] bg-amber-50 border-amber-300">
              चालक नोंदणी
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-12 flex-1">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--cream)] border border-[var(--warm-gray-300)] text-xs font-bold text-[var(--teal-deep)]">
            <Truck className="w-4 h-4 text-[var(--marigold)]" />
            <span>महाराष्ट्रभरातील पिकअप व ट्रक मालकांसाठी सन्मानाचा रोजगार</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[var(--ink)] tracking-tight font-[family-name:var(--font-display)]">
            {BRAND_NAME} सोबत स्वतःचे मालक व्हा
          </h1>
          <p className="text-sm sm:text-base text-[var(--warm-gray-700)]">
            दलाली बंद, मोकळ्या फेऱ्या बंद! शेतातून थेट APMC व गोदामांचे नियमित भाडे आणि डिलिव्हरी झाल्यावर थेट तुमच्या UPI किंवा बँक खात्यात पैसे.
          </p>
          <div className="pt-2 flex justify-center">
            <Link
              href="/"
              className="px-6 py-3 rounded-xl bg-[var(--teal-deep)] text-white font-bold text-sm shadow-md hover:bg-[#0b3836] transition-all inline-flex items-center gap-2"
            >
              <span>मोफत चालक नोंदणी करा</span>
              <ArrowRight className="w-4 h-4 text-[var(--marigold)]" />
            </Link>
          </div>
        </div>

        {/* 4 Pillars of Driver Dignity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-lg bg-[var(--cream)] text-[var(--teal-deep)] flex items-center justify-center mb-1">
              <Coins className="w-5 h-5 text-[var(--marigold)]" />
            </div>
            <h3 className="text-sm font-bold text-[var(--ink)]">५०% डिझेल आगाऊ</h3>
            <p className="text-xs text-[var(--warm-gray-600)] leading-relaxed">
              शेतकऱ्याने गाडीत माल भरताच डिझेल आणि टोलसाठी अर्धी रक्कम थेट तुमच्या खात्यात जमा होते.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-lg bg-[var(--cream)] text-[var(--teal-deep)] flex items-center justify-center mb-1">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-[var(--ink)]">परतीची हमखास भाडी</h3>
            <p className="text-xs text-[var(--warm-gray-600)] leading-relaxed">
              वाशी किंवा पुण्यात माल खाली केल्यावर रिकामे न फिरता ॲपवरून आधीच परतीचा शेतमाल बुक करा.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-lg bg-[var(--cream)] text-[var(--teal-deep)] flex items-center justify-center mb-1">
              <ShieldCheck className="w-5 h-5 text-[var(--teal-deep)]" />
            </div>
            <h3 className="text-sm font-bold text-[var(--ink)]">शून्य दलाल कपात</h3>
            <p className="text-xs text-[var(--warm-gray-600)] leading-relaxed">
              मार्केटमधील कोणतेही अडते किंवा दलाल कट्टा कापत नाहीत. ठरलेले संपूर्ण भाडे पारदर्शकपणे बँक खात्यात.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-lg bg-[var(--cream)] text-[var(--teal-deep)] flex items-center justify-center mb-1">
              <CheckCircle2 className="w-5 h-5 text-[var(--chili)]" />
            </div>
            <h3 className="text-sm font-bold text-[var(--ink)]">अचूक ओटीपी पडताळणी</h3>
            <p className="text-xs text-[var(--warm-gray-600)] leading-relaxed">
              माल उतरवून रिसीव्हरने ६ अंकी ओटीपी दिला की पैसे त्वरित रिलीज, कोणतीही उधारी किंवा वाद नाही.
            </p>
          </div>
        </div>

        {/* Interactive Driver Earnings Calculator */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[var(--warm-gray-200)] shadow-2xs space-y-6">
          <div className="border-b border-[var(--warm-gray-200)] pb-3">
            <h2 className="text-xl font-bold text-[var(--ink)] font-[family-name:var(--font-display)]">
              तुमची संभाव्य मासिक कमाई मोजा (Driver Earnings Estimator)
            </h2>
            <p className="text-xs text-[var(--warm-gray-500)]">
              तुमची गाडी आणि आठवड्याच्या अपेक्षित फेऱ्या निवडा
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-[var(--ink)] block mb-2">
                  वाहन प्रकार निवडा:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelectedTruck("tata_ace")}
                    className={`p-2.5 rounded-lg border text-xs font-bold transition-all ${
                      selectedTruck === "tata_ace"
                        ? "bg-[var(--teal-deep)] text-white border-[var(--teal-deep)]"
                        : "bg-[var(--warm-gray-50)] text-[var(--warm-gray-800)] border-[var(--warm-gray-300)]"
                    }`}
                  >
                    छोटा हत्ती (1T)
                  </button>
                  <button
                    onClick={() => setSelectedTruck("pickup")}
                    className={`p-2.5 rounded-lg border text-xs font-bold transition-all ${
                      selectedTruck === "pickup"
                        ? "bg-[var(--teal-deep)] text-white border-[var(--teal-deep)]"
                        : "bg-[var(--warm-gray-50)] text-[var(--warm-gray-800)] border-[var(--warm-gray-300)]"
                    }`}
                  >
                    पिकअप बोलेरो (1.7T)
                  </button>
                  <button
                    onClick={() => setSelectedTruck("truck_14ft")}
                    className={`p-2.5 rounded-lg border text-xs font-bold transition-all ${
                      selectedTruck === "truck_14ft"
                        ? "bg-[var(--teal-deep)] text-white border-[var(--teal-deep)]"
                        : "bg-[var(--warm-gray-50)] text-[var(--warm-gray-800)] border-[var(--warm-gray-300)]"
                    }`}
                  >
                    १४ फूट ट्रक (4T)
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-2">
                  <span>आठवड्यातील फेऱ्या (Trips per week):</span>
                  <span className="text-sm font-mono text-[var(--teal-deep)]">{weeklyTrips} फेऱ्या</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={weeklyTrips}
                  onChange={(e) => setWeeklyTrips(Number(e.target.value))}
                  className="w-full accent-[var(--teal-deep)] h-2 bg-[var(--warm-gray-200)] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[var(--warm-gray-500)] mt-1">
                  <span>१ फेरी</span>
                  <span>४ फेऱ्या (नियमित)</span>
                  <span>७ फेऱ्या (पूर्ण वेळ)</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--cream)] border border-[var(--warm-gray-300)] text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--teal-deep)]">
                अंदाजे निव्वळ मासिक नफा (Estimated Net Income)
              </span>
              <div className="text-3xl sm:text-4xl font-black text-[var(--teal-deep)] font-mono">
                {formatCurrency(monthlyEstimatedEarnings * 100)}
              </div>
              <p className="text-[11px] text-[var(--warm-gray-600)]">
                * डिझेल व टोल वजा जाता अंदाजे निव्वळ शिल्लक. परतीच्या फेऱ्या घेतल्यास १५-२५% अधिक कमाई.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--marigold)] text-[var(--teal-deep)] text-xs font-bold hover:brightness-105"
              >
                <span>नोंदणी करून भाडी सुरू करा</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Required Documents */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[var(--warm-gray-200)] shadow-2xs space-y-4">
          <div className="border-b border-[var(--warm-gray-200)] pb-3">
            <h2 className="text-xl font-bold text-[var(--ink)] font-[family-name:var(--font-display)]">
              नोंदणीसाठी आवश्यक कागदपत्रे (Required Documents)
            </h2>
            <p className="text-xs text-[var(--warm-gray-500)]">
              फक्त खालील कागदपत्रांचे स्पष्ट फोटो मोबाईलवरून अपलोड करा:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 bg-[var(--warm-gray-50)] rounded-lg border border-[var(--warm-gray-200)] flex items-start gap-2.5">
              <FileCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-[var(--ink)] block">१. ड्रायव्हिंग लायसन्स (DL)</strong>
                <span className="text-[11px] text-[var(--warm-gray-600)]">LMV किंवा Transport प्रकारातील वैध परवाना</span>
              </div>
            </div>

            <div className="p-3 bg-[var(--warm-gray-50)] rounded-lg border border-[var(--warm-gray-200)] flex items-start gap-2.5">
              <FileCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-[var(--ink)] block">२. वाहन नोंदणी पुस्तक (RC)</strong>
                <span className="text-[11px] text-[var(--warm-gray-600)]">गाडीचे मूळ आरसी पुस्तक किंवा स्मार्ट कार्ड</span>
              </div>
            </div>

            <div className="p-3 bg-[var(--warm-gray-50)] rounded-lg border border-[var(--warm-gray-200)] flex items-start gap-2.5">
              <FileCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-[var(--ink)] block">३. व्यावसायिक इन्शुरन्स</strong>
                <span className="text-[11px] text-[var(--warm-gray-600)]">चालू मुदतीचा Third-Party किंवा Comprehensive विमा</span>
              </div>
            </div>

            <div className="p-3 bg-[var(--warm-gray-50)] rounded-lg border border-[var(--warm-gray-200)] flex items-start gap-2.5">
              <FileCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-[var(--ink)] block">४. पीयूसी (PUC Certificate)</strong>
                <span className="text-[11px] text-[var(--warm-gray-600)]">प्रदूषण नियंत्रण प्रमाणपत्र</span>
              </div>
            </div>

            <div className="p-3 bg-[var(--warm-gray-50)] rounded-lg border border-[var(--warm-gray-200)] flex items-start gap-2.5">
              <FileCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-[var(--ink)] block">५. बँक पासबुक / UPI</strong>
                <span className="text-[11px] text-[var(--warm-gray-600)]">खात्यात थेट भाडे जमा होण्यासाठी</span>
              </div>
            </div>

            <div className="p-3 bg-[var(--warm-gray-50)] rounded-lg border border-[var(--warm-gray-200)] flex items-start gap-2.5">
              <FileCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-[var(--ink)] block">६. गाडीचा फोटो (नंबर प्लेटसह)</strong>
                <span className="text-[11px] text-[var(--warm-gray-600)]">पुढील आणि मागील भागाचा स्पष्ट फोटो</span>
              </div>
            </div>
          </div>
        </section>

        {/* Real Driver Stories */}
        <section className="space-y-4">
          <div>
            <span className="text-[11px] font-bold text-[var(--teal-deep)] uppercase tracking-wider">
              चालकांचे खरे अनुभव
            </span>
            <h2 className="text-xl font-black text-[var(--ink)] font-[family-name:var(--font-display)]">
              महाराष्ट्रातील आमच्या साथीदारांचे शब्द
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-white rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-2">
              <div className="flex items-center gap-1 text-[var(--marigold)]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-[var(--warm-gray-700)] italic leading-relaxed">
                &quot;आधी वाशी मार्केटला माल नेला की परतीची गाडी रिकामी आणावी लागायची, डिझेल खिशातून जायचे. {BRAND_NAME} सुरू केल्यापासून मला वाशीहून ठाणे किंवा नाशिकसाठी आधीच लोड मिळतो. दरमहा १५,००० चा निव्वळ फायदा वाढला आहे.&quot;
              </p>
              <div className="border-t border-[var(--warm-gray-200)] pt-2 text-xs flex justify-between items-center">
                <span className="font-bold text-[var(--ink)]">रवींद्र बोराडे (नाशिक)</span>
                <span className="text-[11px] text-[var(--warm-gray-500)]">बोलेरो पिकअप चालक • MH-15-EG-4412</span>
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-2">
              <div className="flex items-center gap-1 text-[var(--marigold)]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-[var(--warm-gray-700)] italic leading-relaxed">
                &quot;सगळ्यात भारी गोष्ट म्हणजे ५०% डिझेलचे पैसे शेतात गाडी लागल्यावर लगेच खात्यात येतात. पूर्वी व्यापाऱ्यांशी पैशांसाठी भांडणे व्हावी लागायची. इथे ओटीपी दिला की पैसे जमा होतात.&quot;
              </p>
              <div className="border-t border-[var(--warm-gray-200)] pt-2 text-xs flex justify-between items-center">
                <span className="font-bold text-[var(--ink)]">संतोष मोरे (जुन्नर)</span>
                <span className="text-[11px] text-[var(--warm-gray-500)]">छोटा हत्ती मालक • MH-14-BT-8921</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--warm-gray-200)] bg-white py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--warm-gray-500)] gap-3">
          <div>© 2026 {BRAND_NAME}. सर्व हक्क राखीव.</div>
          <div className="flex gap-4">
            <Link href="/pricing" className="hover:underline">दरपत्रक</Link>
            <Link href="/how-it-works" className="hover:underline">कसे काम करते</Link>
            <Link href="/privacy" className="hover:underline">गोपनीयता धोरण</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
