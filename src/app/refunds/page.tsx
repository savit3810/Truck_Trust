import Link from "next/link";
import { ArrowLeft, RefreshCw, CheckCircle2, AlertCircle, HelpCircle, PhoneCall } from "lucide-react";
import { BRAND_NAME } from "@/lib/config/brand";

export const metadata = {
  title: `Escrow, Cancellations & Refund Policy - ${BRAND_NAME}`,
  description: "Stage-based cancellation refunds, escrow release guidelines, and dispute resolution for rural freight.",
};

export default function RefundsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--warm-gray-200)] bg-white sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-[var(--teal-deep)] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>मुख्यपृष्ठावर परत (Home)</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[var(--ink)] font-[family-name:var(--font-display)]">
              {BRAND_NAME}
            </span>
            <span className="text-[10px] bg-emerald-50 text-[var(--teal-deep)] border border-emerald-300 font-bold px-1.5 py-0.5 rounded">
              एस्क्रो व परतावा
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 flex-1 space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--cream)] border border-[var(--warm-gray-300)] text-xs font-bold text-[var(--teal-deep)] mb-3">
            <RefreshCw className="w-4 h-4 text-[var(--marigold)]" />
            <span>५०-५० एस्क्रो सुरक्षितता व पारदर्शक परतावा</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[var(--ink)] font-[family-name:var(--font-display)]">
            रद्दीकरण, एस्क्रो आणि परतावा धोरण (Refund Policy)
          </h1>
          <p className="text-xs sm:text-sm text-[var(--warm-gray-600)] mt-2">
            शेतकरी आणि ट्रक चालक दोघांचेही आर्थिक नुकसान टाळण्यासाठी तयार केलेली न्याय्य परतावा नियमावली.
          </p>
        </div>

        {/* 50-50 Escrow Model */}
        <section className="bg-white p-6 rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-[var(--teal-deep)] font-bold text-base">
            <CheckCircle2 className="w-5 h-5 text-[var(--marigold)]" />
            <h2>१. ५०-५० एस्क्रो पेमेंट प्रणाली कशी काम करते?</h2>
          </div>
          <p className="text-xs sm:text-sm text-[var(--warm-gray-700)] leading-relaxed">
            {BRAND_NAME} वर सर्व आर्थिक व्यवहार सुरक्षित एस्क्रो (RBI मान्यताप्राप्त नोडल खाते) द्वारे होतात:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-4 bg-[var(--cream)]/60 border border-[var(--warm-gray-200)] rounded-lg">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--teal-deep)]">पहिला टप्पा (Booking)</span>
              <h3 className="text-sm font-bold text-[var(--ink)] mt-0.5">५०% आगाऊ (Advance)</h3>
              <p className="text-xs text-[var(--warm-gray-600)] mt-1">
                बुकिंग करताना ५०% रक्कम भरली जाते. ही रक्कम थेट चालकाला न जाता एस्क्रो खात्यात सुरक्षित ठेवली जाते. चालक माल भरण्यासाठी आल्यावर यातील डिझेलचा खर्च जारी होतो.
              </p>
            </div>
            <div className="p-4 bg-[var(--cream)]/60 border border-[var(--warm-gray-200)] rounded-lg">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--teal-deep)]">दुसरा टप्पा (Delivery)</span>
              <h3 className="text-sm font-bold text-[var(--ink)] mt-0.5">५०% वितरणावर (On Delivery)</h3>
              <p className="text-xs text-[var(--warm-gray-600)] mt-1">
                गंतव्यस्थानी माल सुरक्षित उतरवून स्वीकारकर्त्याने (Consignee) ६ अंकी OTP दिल्यानंतरच उर्वरित ५०% रक्कम त्वरित चालकाच्या बँक खात्यात थेट जमा होते.
              </p>
            </div>
          </div>
        </section>

        {/* Cancellation Refund Matrix */}
        <section className="bg-white p-6 rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-[var(--teal-deep)] font-bold text-base">
            <AlertCircle className="w-5 h-5 text-[var(--chili)]" />
            <h2>२. टप्प्यानुसार रद्दीकरण आणि परतावा तक्ता (Refund Matrix)</h2>
          </div>
          <p className="text-xs sm:text-sm text-[var(--warm-gray-700)] leading-relaxed">
            बुकिंग रद्द झाल्यास परताव्याची टक्केवारी खालीलप्रमाणे निर्धारित केली जाते:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--warm-gray-200)] bg-[var(--warm-gray-50)] text-[var(--warm-gray-700)]">
                  <th className="py-2.5 px-3 font-bold">रद्दीकरणाची वेळ / स्थिती</th>
                  <th className="py-2.5 px-3 font-bold">मालकास परतावा</th>
                  <th className="py-2.5 px-3 font-bold">चालकास भरपाई (Dead Freight)</th>
                  <th className="py-2.5 px-3 font-bold">परतावा कालावधी</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--warm-gray-100)] text-[var(--warm-gray-800)]">
                <tr>
                  <td className="py-3 px-3 font-medium">चालक नियुक्त होण्यापूर्वी</td>
                  <td className="py-3 px-3 font-bold text-emerald-700">१००% पूर्ण परतावा</td>
                  <td className="py-3 px-3 text-[var(--warm-gray-500)]">₹० (लागू नाही)</td>
                  <td className="py-3 px-3">२४ तास</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium">चालक निघाल्यावर (लोडिंगपूर्वी)</td>
                  <td className="py-3 px-3 font-bold text-emerald-700">९०% परतावा</td>
                  <td className="py-3 px-3 text-amber-700">१०% (डिझेल नुकसान भरपाई)</td>
                  <td className="py-3 px-3">२४ ते ४८ तास</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium">माल वाहनात भरल्यानंतर (Loaded)</td>
                  <td className="py-3 px-3 font-bold text-red-600">परतावा नाही (०%)</td>
                  <td className="py-3 px-3 font-bold text-emerald-700">१००% भाडे चालकास देय</td>
                  <td className="py-3 px-3">-</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium">चालक वेळेवर न आल्यास (Driver No-Show)</td>
                  <td className="py-3 px-3 font-bold text-emerald-700">१००% पूर्ण परतावा</td>
                  <td className="py-3 px-3 text-red-600">चालकास दंड (Score Penalty)</td>
                  <td className="py-3 px-3">तात्काळ (Instant)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Dispute Resolution */}
        <section className="bg-white p-6 rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-[var(--teal-deep)] font-bold text-base">
            <HelpCircle className="w-5 h-5 text-[var(--marigold)]" />
            <h2>३. वाद निवारण आणि मध्यस्थी (Dispute Resolution)</h2>
          </div>
          <p className="text-xs sm:text-sm text-[var(--warm-gray-700)] leading-relaxed">
            मालाचे नुकसान, वजनातील तफावत किंवा वेळेतील दिरंगाई असल्यास दोन्ही पक्षांनी २४ तासांच्या आत ॲपमध्ये किंवा हेल्पलाइनवर तक्रार नोंदवावी. तक्रार दाखल झाल्यानंतर एस्क्रो पेआउट तात्काळ होल्ड केले जाते आणि ७२ तासांच्या आत पुरावे (फोटो, वजन काटा पावती, GPS लॉग्स) तपासून न्याय्य निर्णय घेतला जातो.
          </p>
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-[var(--teal-deep)]">मदत हवी आहे का?</h4>
              <p className="text-[11px] text-[var(--warm-gray-600)]">आमची मराठी सपोर्ट टीम २४/७ आपल्या सेवेत आहे.</p>
            </div>
            <a
              href="tel:+91800087825"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--teal-deep)] text-white text-xs font-bold hover:bg-[#0b3836]"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[var(--marigold)]" />
              <span>१८०० ८७८२५</span>
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--warm-gray-200)] bg-white py-6">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--warm-gray-500)] gap-3">
          <div>© 2026 {BRAND_NAME}. सर्व हक्क राखीव.</div>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:underline">गोपनीयता धोरण (Privacy)</Link>
            <Link href="/refunds" className="font-bold text-[var(--teal-deep)]">परतावा धोरण (Refunds)</Link>
            <Link href="/terms" className="hover:underline">अटी व शर्ती (Terms)</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
