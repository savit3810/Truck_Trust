import Link from "next/link";
import {
  ArrowLeft,
  Truck,
  ShieldCheck,
  Scale,
  MapPin,
  CheckCircle2,
  Users,
  Smartphone,
  Coins,
  ArrowRight,
  PhoneCall,
  Clock,
} from "lucide-react";
import { BRAND_NAME, BRAND_TAGLINE_MR } from "@/lib/config/brand";

export const metadata = {
  title: `कार्यपद्धती - ${BRAND_NAME}`,
  description: "शेतकरी, उद्योजक आणि ट्रक चालकांसाठी सुरक्षित ५०-५० एस्क्रो मालवाहतूक कशी काम करते ते समजून घ्या.",
};

export default function HowItWorksPage() {
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
              मार्गदर्शक
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-12 flex-1">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--cream)] border border-[var(--warm-gray-300)] text-xs font-bold text-[var(--teal-deep)]">
            <ShieldCheck className="w-4 h-4 text-[var(--marigold)]" />
            <span>पारदर्शक ५०-५० एस्क्रो व थेट जीपीएस ट्रॅकिंग</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[var(--ink)] tracking-tight font-[family-name:var(--font-display)]">
            {BRAND_NAME} कसे कार्य करते?
          </h1>
          <p className="text-sm sm:text-base text-[var(--warm-gray-700)]">
            ग्रामीण महाराष्ट्रातील शेतकरी, लहान व्यापारी आणि ट्रक चालक दोघांचेही आर्थिक नुकसान आणि फसवणूक टाळण्यासाठी आमची त्रिस्तरीय सुरक्षित प्रणाली.
          </p>
        </div>

        {/* 1. For Senders / Farmers */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[var(--warm-gray-200)] shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--warm-gray-200)] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--teal-deep)] text-[var(--marigold)] flex items-center justify-center font-bold">
                १
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--ink)] font-[family-name:var(--font-display)]">
                  शेतकरी आणि उद्योजकांसाठी (For Senders)
                </h2>
                <p className="text-xs text-[var(--warm-gray-500)]">
                  कांदा, टोमॅटो, डाळिंब, दूध किंवा तयार उत्पादने पाठवण्यासाठी ५ सोप्या पायऱ्या
                </p>
              </div>
            </div>
            <Link
              href="/book"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--teal-deep)] text-white text-xs font-bold hover:bg-[#0b3836]"
            >
              <span>आताच माल बुक करा</span>
              <ArrowRight className="w-3.5 h-3.5 text-[var(--marigold)]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-4 bg-[var(--cream)]/40 rounded-xl border border-[var(--warm-gray-200)] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--marigold)] text-[var(--teal-deep)] flex items-center justify-center font-bold text-xs">
                १
              </div>
              <h3 className="text-xs font-bold text-[var(--ink)]">रूट आणि गाडी निवडा</h3>
              <p className="text-[11px] text-[var(--warm-gray-600)] leading-relaxed">
                गाव किंवा APMC मार्केट टाका. वजन व माल प्रकारानुसार पारदर्शक भाडे कॅल्क्युलेटर पहा.
              </p>
            </div>

            <div className="p-4 bg-[var(--cream)]/40 rounded-xl border border-[var(--warm-gray-200)] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--teal-deep)] text-white flex items-center justify-center font-bold text-xs">
                २
              </div>
              <h3 className="text-xs font-bold text-[var(--ink)]">५०% आगाऊ एस्क्रो</h3>
              <p className="text-[11px] text-[var(--warm-gray-600)] leading-relaxed">
                UPI किंवा नेटबँकिंगने ५०% रक्कम भरा. ही रक्कम सुरक्षित एस्क्रो खात्यात लॉक राहते.
              </p>
            </div>

            <div className="p-4 bg-[var(--cream)]/40 rounded-xl border border-[var(--warm-gray-200)] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--marigold)] text-[var(--teal-deep)] flex items-center justify-center font-bold text-xs">
                ३
              </div>
              <h3 className="text-xs font-bold text-[var(--ink)]">पडताळणीकृत ट्रक शेतात</h3>
              <p className="text-[11px] text-[var(--warm-gray-600)] leading-relaxed">
                चालक प्रत्यक्ष येतो, मालाचे फोटो व वजन पावती अपलोड होते. मगच डिझेल खर्च जारी होतो.
              </p>
            </div>

            <div className="p-4 bg-[var(--cream)]/40 rounded-xl border border-[var(--warm-gray-200)] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--teal-deep)] text-white flex items-center justify-center font-bold text-xs">
                ४
              </div>
              <h3 className="text-xs font-bold text-[var(--ink)]">थेट जीपीएस ट्रॅकिंग</h3>
              <p className="text-[11px] text-[var(--warm-gray-600)] leading-relaxed">
                तुमच्या मोबाईलवर ट्रकची हालचाल दिसते. लिंक व्हॉट्सॲपवर मार्केटमधील व्यापाऱ्यालाही शेअर करता येते.
              </p>
            </div>

            <div className="p-4 bg-[var(--cream)]/40 rounded-xl border border-[var(--warm-gray-200)] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                ५
              </div>
              <h3 className="text-xs font-bold text-[var(--ink)]">ओटीपी दिल्यावरच पेमेंट</h3>
              <p className="text-[11px] text-[var(--warm-gray-600)] leading-relaxed">
                माल सुरक्षित खाली उतरल्यावरच खरेदीदार ६-अंकी OTP देतो आणि उर्वरित ५०% रक्कम रिलीज होते.
              </p>
            </div>
          </div>
        </section>

        {/* 2. For Drivers */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[var(--warm-gray-200)] shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--warm-gray-200)] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--marigold)] text-[var(--teal-deep)] flex items-center justify-center font-bold">
                २
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--ink)] font-[family-name:var(--font-display)]">
                  ट्रक चालक आणि मालकांसाठी (For Drivers)
                </h2>
                <p className="text-xs text-[var(--warm-gray-500)]">
                  कमिशन दलाल नको, थेट वेळेवर खात्यात पेमेंट आणि रिकाम्या फेऱ्या बंद
                </p>
              </div>
            </div>
            <Link
              href="/drivers"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--marigold)] text-[var(--teal-deep)] text-xs font-bold hover:brightness-105"
            >
              <span>चालक म्हणून जुडा</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[var(--cream)]/40 rounded-xl border border-[var(--warm-gray-200)] space-y-2">
              <span className="text-[10px] font-bold uppercase text-[var(--teal-deep)]">पायरी १</span>
              <h3 className="text-xs font-bold text-[var(--ink)]">मोफत डिजिटल नोंदणी</h3>
              <p className="text-[11px] text-[var(--warm-gray-600)]">
                RC, DL आणि इन्शुरन्सचा फोटो अपलोड करा. आमची टीम २४ तासांत पडताळणी पूर्ण करते.
              </p>
            </div>

            <div className="p-4 bg-[var(--cream)]/40 rounded-xl border border-[var(--warm-gray-200)] space-y-2">
              <span className="text-[10px] font-bold uppercase text-[var(--teal-deep)]">पायरी २</span>
              <h3 className="text-xs font-bold text-[var(--ink)]">परतीची भाडी (Return Loads)</h3>
              <p className="text-[11px] text-[var(--warm-gray-600)]">
                वाशी किंवा पुण्यातून परत येताना रिकामे न येता आधीच रिटर्न लोड बुक करा.
              </p>
            </div>

            <div className="p-4 bg-[var(--cream)]/40 rounded-xl border border-[var(--warm-gray-200)] space-y-2">
              <span className="text-[10px] font-bold uppercase text-[var(--teal-deep)]">पायरी ३</span>
              <h3 className="text-xs font-bold text-[var(--ink)]">५०% डिझेल आगाऊ</h3>
              <p className="text-[11px] text-[var(--warm-gray-600)]">
                शेतकऱ्याचा माल भरताच डिझेल आणि टोलसाठी अर्धी रक्कम थेट तुमच्या UPI किंवा बँक खात्यात.
              </p>
            </div>

            <div className="p-4 bg-[var(--cream)]/40 rounded-xl border border-[var(--warm-gray-200)] space-y-2">
              <span className="text-[10px] font-bold uppercase text-[var(--teal-deep)]">पायरी ४</span>
              <h3 className="text-xs font-bold text-[var(--ink)]">निसंशय पूर्ण पेमेंट</h3>
              <p className="text-[11px] text-[var(--warm-gray-600)]">
                माल पोहोचल्यावर व्यापाऱ्याने ओटीपी देताच उर्वरित ५०% रक्कम ३० मिनिटांत जमा होते.
              </p>
            </div>
          </div>
        </section>

        {/* 3. For Truck Mitras */}
        <section className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 sm:p-8 rounded-2xl border border-amber-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                ३
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--ink)] font-[family-name:var(--font-display)]">
                  ट्रक मित्र मॉडेल (Assisted Village Kiosks)
                </h2>
                <p className="text-xs text-[var(--warm-gray-600)]">
                  गावपातळीवरील CSC चालक, कृषी केंद्र संचालक आणि बचत गट प्रतिनिधींसाठी
                </p>
              </div>
            </div>
            <Link
              href="/mitra"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-700 text-white text-xs font-bold hover:bg-amber-800"
            >
              <Users className="w-3.5 h-3.5" />
              <span>ट्रक मित्र डॅशबोर्ड उघडा</span>
            </Link>
          </div>
          <p className="text-xs sm:text-sm text-[var(--warm-gray-700)] leading-relaxed">
            ग्रामीण भागात ज्या वृद्ध शेतकऱ्यांकडे स्मार्टफोन नाही किंवा स्वतः ॲप चालवणे शक्य नाही, त्यांच्यासाठी आमचे स्थानिक ट्रक मित्र बुकिंग सहाय्य करतात. प्रत्येक यशस्वी बुकिंगवर मित्रांना १.५% मानधन थेट मिळते.
          </p>
        </section>

        {/* Bottom Help Banner */}
        <div className="p-6 bg-white rounded-xl border border-[var(--warm-gray-200)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--cream)] flex items-center justify-center text-[var(--teal-deep)]">
              <PhoneCall className="w-5 h-5 text-[var(--marigold)]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--ink)]">शंका किंवा मदत हवी आहे का?</h3>
              <p className="text-xs text-[var(--warm-gray-500)]">
                आमचे ग्रामीण सहाय्यता केंद्र दररोज सकाळी ६ ते रात्री १० पर्यंत उपलब्ध आहे.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="tel:+91800087825"
              className="px-4 py-2 rounded-lg bg-[var(--teal-deep)] text-white text-xs font-bold hover:bg-[#0b3836]"
            >
              १८०० ८७८२५ वर कॉल करा
            </a>
            <Link
              href="/faq"
              className="px-4 py-2 rounded-lg bg-[var(--warm-gray-100)] text-[var(--warm-gray-800)] text-xs font-bold hover:bg-[var(--warm-gray-200)]"
            >
              वारंवार विचारले जाणारे प्रश्न
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--warm-gray-200)] bg-white py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--warm-gray-500)] gap-3">
          <div>© 2026 {BRAND_NAME}. सर्व हक्क राखीव.</div>
          <div className="flex gap-4">
            <Link href="/pricing" className="hover:underline">दर व भाडे (Pricing)</Link>
            <Link href="/privacy" className="hover:underline">गोपनीयता धोरण</Link>
            <Link href="/terms" className="hover:underline">अटी व शर्ती</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
