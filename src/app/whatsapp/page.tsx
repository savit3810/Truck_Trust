import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MessageSquare,
  Mic,
  PhoneCall,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Send,
  Truck,
  Sparkles,
  MapPin,
  HelpCircle,
} from "lucide-react";
import { BRAND_NAME, APP_CONFIG } from "@/lib/config/brand";

export const metadata = {
  title: `व्हॉट्सअ‍ॅप बुकिंग (WhatsApp Booking) | ${BRAND_NAME}`,
  description: `ग्रामीण महाराष्ट्रासाठी सोपे व्हॉट्सअ‍ॅप बुकिंग. फक्त 'नमस्ते' मेसेज किंवा ऑडिओ व्हॉइस नोट पाठवा आणि तात्काळ ट्रक बुक करा.`,
};

export default function WhatsAppBookingPage() {
  const waNumber = APP_CONFIG.support.whatsapp.replace(/\D/g, "");
  const defaultMessage = encodeURIComponent(
    `नमस्ते ${BRAND_NAME}, मला ट्रक हवा आहे.\nनाव: \nपिकअप गाव/मंडी: \nड्रॉप शहर/मंडी: \nमाल प्रकार व वजन: `
  );
  const waUrl = `https://wa.me/${waNumber}?text=${defaultMessage}`;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-20">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-emerald-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>मुख्यपृष्ठ (Home)</span>
          </Link>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            WhatsApp Bot 24x7 Live
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-10 pb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium mb-4">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>अ‍ॅप डाऊनलोड न करता थेट व्हॉट्सअ‍ॅपवर बुक करा</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          फक्त एक मेसेज करा,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
            ट्रक हजर!
          </span>
        </h1>
        <p className="mt-3 text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto">
          इंटरनेटचा वेग कमी असेल किंवा फॉर्म भरणे कठीण वाटत असेल, तर आपल्या गावच्या
          भाषेत व्हॉट्सअ‍ॅपवर बोला किंवा मेसेज करा.
        </p>

        {/* CTA Banner */}
        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-emerald-950/50 to-neutral-900 border border-emerald-500/30 shadow-xl max-w-xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                अधिकृत व्हॉट्सअ‍ॅप नंबर
              </div>
              <div className="text-2xl font-bold text-white mt-0.5 tracking-wide">
                {APP_CONFIG.support.whatsapp}
              </div>
              <div className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-400" />
                २४ तास उपलब्ध • मराठी, हिंदी, इंग्रजी
              </div>
            </div>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <Send className="w-4 h-4 fill-neutral-950" />
              <span>व्हॉट्सअ‍ॅप उघडा</span>
            </a>
          </div>
        </div>
      </section>

      {/* Voice Note Feature Highlight */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
            <Mic className="w-8 h-8 animate-pulse" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-2">
              <Sparkles className="w-3 h-3" />
              व्हॉइस नोट सपोर्ट (Voice Message)
            </div>
            <h3 className="text-lg font-bold text-white">
              टाईप करण्याची गरज नाही! ऑडिओ रेकॉर्ड करून पाठवा
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              &quot;मला उद्या सकाळी जुन्नरवरून वाशी मार्केटसाठी २ टन टोमॅटो न्यायचे आहेत&quot; — फक्त एवढी व्हॉइस नोट पाठवा. आमची प्रणाली आणि ट्रान्सपोर्ट मित्र त्वरित तुमच्याशी संपर्क साधतील.
            </p>
          </div>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-4 py-2.5 rounded-lg border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-xs font-semibold transition"
          >
            व्हॉइस मेसेज पाठवा →
          </a>
        </div>
      </section>

      {/* 3 Steps Guide */}
      <section className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold text-white mb-6 text-center">
          व्हॉट्सअ‍ॅपवर ३ सोप्या पायऱ्यांमध्ये बुकिंग कसे करावे?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 relative">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm mb-3">
              १
            </div>
            <h4 className="font-semibold text-white text-sm">
              &apos;नमस्ते&apos; किंवा &apos;Hi&apos; पाठवा
            </h4>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              आमच्या व्हॉट्सअ‍ॅप नंबरवर मेसेज करा. बॉट लगेच तुम्हाला मराठीत पर्याय देईल.
            </p>
            <div className="mt-3 p-2.5 rounded bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-emerald-400">
              User: नमस्ते मला ट्रक हवा आहे
            </div>
          </div>

          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 relative">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm mb-3">
              २
            </div>
            <h4 className="font-semibold text-white text-sm">
              मालाचा आणि पत्त्याचा तपशील द्या
            </h4>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              पिकअप गाव, ड्रॉप मंडी आणि मालाचे वजन सांगा. तुम्हाला अचूक दर (Fare Estimate) दिसेल.
            </p>
            <div className="mt-3 p-2.5 rounded bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-neutral-300">
              Bot: नारायणगाव ते वाशी APMC (१४० किमी) - ₹४,२००
            </div>
          </div>

          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 relative">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm mb-3">
              ३
            </div>
            <h4 className="font-semibold text-white text-sm">
              ड्रायव्हर कन्फर्म आणि लाईव्ह ट्रॅकिंग
            </h4>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              सत्यापित ड्रायव्हरची माहिती, गाडी क्रमांक आणि थेट GPS ट्रॅकिंग लिंक थेट व्हॉट्सअ‍ॅपवर मिळेल.
            </p>
            <div className="mt-3 p-2.5 rounded bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-emerald-400">
              MH-14-CW-4921 • चालक सचिन शिंदे
            </div>
          </div>
        </div>
      </section>

      {/* Why WhatsApp Booking */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
          <h3 className="text-base font-bold text-white mb-4">
            व्हॉट्सअ‍ॅप बुकिंगचे खास फायदे:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-neutral-300">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>कोणताही मोठा अ‍ॅप डाऊनलोड करण्याची गरज नाही.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>२G / ३G नेटवर्कवरही सुरळीत चालते.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>पारदर्शक पावती आणि डिजिटल बिल थेट व्हॉट्सअ‍ॅपवर PDF मध्ये.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>ड्रायव्हरचे फोटो आणि गाडीचे कागदपत्रे पाहण्याची सोय.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Support or Website fallback */}
      <section className="max-w-4xl mx-auto px-4 pt-4 text-center">
        <p className="text-xs text-neutral-400">
          किंवा संपूर्ण वेब पोर्टल वापरून सविस्तर ड्रायव्हर रेटिंग पाहायचे आहे का?
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/book"
            className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs transition inline-flex items-center gap-1.5"
          >
            <Truck className="w-4 h-4 text-amber-400" />
            <span>वेबवर थेट बुक करा (Book on Web)</span>
          </Link>
          <Link
            href="/contact"
            className="px-5 py-2.5 rounded-xl border border-neutral-700 hover:border-neutral-600 text-neutral-300 font-medium text-xs transition inline-flex items-center gap-1.5"
          >
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            <span>कॉल सपोर्ट (Call Helpline)</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
