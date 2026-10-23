import Link from "next/link";
import { BRAND_NAME, BRAND_TAGLINE_MR } from "@/lib/config/brand";
import { AuthCard } from "@/components/auth/AuthCard";
import { FareCalculatorWidget } from "@/components/home/FareCalculatorWidget";
import {
  ShieldCheck,
  Truck,
  Scale,
  PhoneCall,
  PlusCircle,
  Users,
  Navigation,
  FileCheck,
  Star,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col justify-between bg-[var(--background)]">
      {/* Top Header */}
      <header className="border-b border-[var(--warm-gray-200)] bg-white sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--teal-deep)] flex items-center justify-center text-[var(--marigold)] shadow-sm">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-[var(--ink)] tracking-tight font-[family-name:var(--font-display)]">
                  {BRAND_NAME}
                </span>
                <span className="truck-badge text-[var(--teal-deep)] bg-emerald-50 border-emerald-300">
                  महाराष्ट्र
                </span>
              </div>
              <p className="text-xs text-[var(--warm-gray-500)] hidden sm:block">
                {BRAND_TAGLINE_MR}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--cream)] text-[var(--teal-deep)] border border-[var(--warm-gray-300)] text-xs font-bold hover:bg-[#fff9e6] shadow-2xs"
            >
              <span>माझे डॅशबोर्ड (Dashboard)</span>
            </Link>

            <Link
              href="/book"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--teal-deep)] text-white text-xs font-bold hover:bg-[#0b3836] shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[var(--marigold)]" />
              <span>माल पाठवा (Book)</span>
            </Link>

            <Link
              href="/mitra"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold hover:bg-amber-100"
            >
              <Users className="w-3.5 h-3.5 text-amber-700" />
              <span>ट्रक मित्र</span>
            </Link>

            <Link
              href="/driver/jobs"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--warm-gray-100)] text-[var(--warm-gray-800)] text-xs font-bold hover:bg-[var(--warm-gray-200)]"
            >
              <span>चालक जॉब्स</span>
            </Link>

            <Link
              href="/admin/login"
              className="hidden md:inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-md"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>प्रशासक (Admin)</span>
            </Link>

            <a
              href="tel:+91800087825"
              className="hidden lg:inline-flex items-center gap-1 text-xs font-bold text-[var(--teal-deep)] hover:underline ml-1"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[var(--marigold)]" />
              <span>१८०० ८७८२५</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero & Auth Section */}
      <section className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-6 flex flex-col lg:flex-row items-center gap-10">
        <div className="flex-1 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--cream)] border border-[var(--warm-gray-300)] text-xs font-bold text-[var(--teal-deep)]">
            <ShieldCheck className="w-4 h-4 text-[var(--marigold)]" />
            <span>१००% शासकीय कागदपत्रे पडताळणीकृत चालक (Vahan & Sarathi)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[var(--ink)] tracking-tight leading-tight font-[family-name:var(--font-display)]">
            महाराष्ट्रातील शेतकरी आणि ग्रामीण उद्योजकांसाठी विश्वासू ट्रक नेटवर्क
          </h1>

          <p className="text-base sm:text-lg text-[var(--warm-gray-700)] leading-relaxed max-w-xl font-[family-name:var(--font-body)]">
            नाशिक, पालघर, पुणे, ठाणे आणि सांगलीच्या गावागावांमधून शेतमाल, कांदा, फळे आणि उत्पादनांची सुरक्षित व वेळेवर वाहतूक. ५०% आगाऊ आणि ५०% सुरक्षित वितरणावर देय.
          </p>

          {/* 3 Core Value Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-white border border-[var(--warm-gray-200)] shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-[var(--teal-deep)] mb-1.5" />
              <h2 className="text-xs font-bold text-[var(--ink)]">पडताळणीकृत ड्रायव्हर्स</h2>
              <p className="text-[11px] text-[var(--warm-gray-500)] mt-0.5">RC, DL आणि इन्शुरन्सची प्रत्यक्ष तपासणी</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[var(--warm-gray-200)] shadow-2xs">
              <Scale className="w-5 h-5 text-[var(--marigold)] mb-1.5" />
              <h2 className="text-xs font-bold text-[var(--ink)]">५०-५० एस्क्रो पेमेंट</h2>
              <p className="text-[11px] text-[var(--warm-gray-500)] mt-0.5">माल पोहोचल्यावर ओटीपी देऊनच अंतिम रक्कम</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[var(--warm-gray-200)] shadow-2xs">
              <Truck className="w-5 h-5 text-[var(--chili)] mb-1.5" />
              <h2 className="text-xs font-bold text-[var(--ink)]">लाईव्ह ट्रॅकिंग</h2>
              <p className="text-[11px] text-[var(--warm-gray-500)] mt-0.5">नकाशावर ट्रकचे थेट लोकेशन व अचूक वेळ</p>
            </div>
          </div>
        </div>

        {/* Auth Interactive Card */}
        <div className="w-full lg:w-auto flex justify-center">
          <AuthCard />
        </div>
      </section>

      {/* Interactive Fare Estimator Section */}
      <section className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        <FareCalculatorWidget />
      </section>

      {/* High-Volume Agricultural Freight Corridors */}
      <section className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold text-[var(--teal-deep)] uppercase tracking-wider">
              महाराष्ट्र कृषी मार्ग
            </span>
            <h2 className="text-2xl font-black text-[var(--ink)] font-[family-name:var(--font-display)]">
              प्रमुख मालवाहतूक कॉरिडोर्स (Active Corridors)
            </h2>
          </div>
          <Link
            href="/book"
            className="text-xs font-bold text-[var(--teal-deep)] hover:underline flex items-center gap-1"
          >
            <span>सर्व मार्गांसाठी बुकिंग करा</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-2">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                कांदा व द्राक्षे
              </span>
              <span className="text-xs font-mono text-[var(--warm-gray-500)]">१८५ किमी</span>
            </div>
            <h3 className="text-sm font-bold text-[var(--ink)] leading-snug">
              नाशिक APMC ➡️ वाशी APMC (नवी मुंबई)
            </h3>
            <p className="text-[11px] text-[var(--warm-gray-500)]">
              दरमहा ४,२००+ फेऱ्या • सरासरी वेळ ५ तास • नियमित ट्रक उपलब्ध
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-2">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded">
                टोमॅटो व भाजीपाला
              </span>
              <span className="text-xs font-mono text-[var(--warm-gray-500)]">१६० किमी</span>
            </div>
            <h3 className="text-sm font-bold text-[var(--ink)] leading-snug">
              जुन्नर (नारायणगाव) ➡️ दादर मार्केट
            </h3>
            <p className="text-[11px] text-[var(--warm-gray-500)]">
              दररोज ताजी आवक • छोटा हत्ती व पिकअप उपलब्ध • रात्रीची जलद वाहतूक
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-2">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                चिकू व सागरी मत्स्य
              </span>
              <span className="text-xs font-mono text-[var(--warm-gray-500)]">११० किमी</span>
            </div>
            <h3 className="text-sm font-bold text-[var(--ink)] leading-snug">
              पालघर (डहाणू) ➡️ भिवंडी हब
            </h3>
            <p className="text-[11px] text-[var(--warm-gray-500)]">
              थेट बागेतून गोदामात • १४ फूट ट्रक प्राधान्य • कमीत कमी नासाडी
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-2">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                डेअरी दूध व डाळिंब
              </span>
              <span className="text-xs font-mono text-[var(--warm-gray-500)]">१५५ किमी</span>
            </div>
            <h3 className="text-sm font-bold text-[var(--ink)] leading-snug">
              संगमनेर ➡️ पुणे मार्केट यार्ड
            </h3>
            <p className="text-[11px] text-[var(--warm-gray-500)]">
              दूध कॅन्स व फळांची सुरक्षित हाताळणी • ५०% एस्क्रो संरक्षण
            </p>
          </div>
        </div>
      </section>

      {/* Real-World Testimonials */}
      <section className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-4">
        <div>
          <span className="text-[11px] font-bold text-[var(--teal-deep)] uppercase tracking-wider">
            शेतकरी व चालकांचे अनुभव
          </span>
          <h2 className="text-2xl font-black text-[var(--ink)] font-[family-name:var(--font-display)]">
            विश्वास हाच आमचा खरा पाया
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-white rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-3">
            <div className="flex items-center gap-1 text-[var(--marigold)]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-[var(--warm-gray-700)] italic leading-relaxed">
              &quot;पिंपळगावमधून वाशीसाठी ३ टन कांदा पाठवला. ड्रायव्हर वेळेत आला, वजन काटा पावती ॲपमध्ये टाकली आणि वाशीला माल उतरल्यावरच मी ओटीपी दिला. पैसे सुरक्षित राहिल्याने मोठा दिलासा मिळाला.&quot;
            </p>
            <div className="border-t border-[var(--warm-gray-200)] pt-3 flex items-center justify-between text-xs">
              <div>
                <strong className="text-[var(--ink)] block">ज्ञानेश्वर सानप</strong>
                <span className="text-[11px] text-[var(--warm-gray-500)]">कांदा उत्पादक शेतकरी, निफाड (नाशिक)</span>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-300">
                पडताळणीकृत
              </span>
            </div>
          </div>

          <div className="p-5 bg-white rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-3">
            <div className="flex items-center gap-1 text-[var(--marigold)]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-[var(--warm-gray-700)] italic leading-relaxed">
              &quot;माझ्याकडे बोलेरो पिकअप आहे. {BRAND_NAME} मुळे मला परतीच्या प्रवासातही (Return Load) शेतमालाची भाडी मिळतात. डिझेलचे ५०% आगाऊ थेट खात्यात येतात, त्यामुळे खिशातून पैसे घालावे लागत नाहीत.&quot;
            </p>
            <div className="border-t border-[var(--warm-gray-200)] pt-3 flex items-center justify-between text-xs">
              <div>
                <strong className="text-[var(--ink)] block">सचिन जाधव</strong>
                <span className="text-[11px] text-[var(--warm-gray-500)]">पिकअप चालक, जुन्नर (पुणे)</span>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-300">
                गोल्ड चालक (४.९ ★)
              </span>
            </div>
          </div>

          <div className="p-5 bg-white rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-3">
            <div className="flex items-center gap-1 text-[var(--marigold)]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-[var(--warm-gray-700)] italic leading-relaxed">
              &quot;डहाणूच्या चिकू बागायतदारांसाठी ट्रक मित्र पोर्टलवरून आम्ही एकाच दिवसात ८ ट्रक बुक केले. स्थानिक एजंट म्हणून मला योग्य कमिशन मिळाले आणि शेतकऱ्यांचा माल वेळेत भिवंडी पोहोचला.&quot;
            </p>
            <div className="border-t border-[var(--warm-gray-200)] pt-3 flex items-center justify-between text-xs">
              <div>
                <strong className="text-[var(--ink)] block">राजेश वर्तक</strong>
                <span className="text-[11px] text-[var(--warm-gray-500)]">ट्रक मित्र केंद्र, डहाणू (पालघर)</span>
              </div>
              <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-300">
                अधिकृत मित्र
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--warm-gray-200)] bg-white py-8 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--warm-gray-600)]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[var(--teal-deep)] flex items-center justify-center text-[var(--marigold)] font-bold">
                TT
              </div>
              <div>
                <div className="font-bold text-sm text-[var(--ink)]">{BRAND_NAME}</div>
                <div className="text-[11px] text-[var(--warm-gray-500)]">
                  महाराष्ट्र ग्रामीण मालवाहतूक व एस्क्रो लॉजिस्टिक नेटवर्क
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold">
              <Link href="/book" className="hover:text-[var(--teal-deep)]">माल पाठवा</Link>
              <Link href="/how-it-works" className="hover:text-[var(--teal-deep)]">कसे चालते?</Link>
              <Link href="/pricing" className="hover:text-[var(--teal-deep)]">दर व भाडे</Link>
              <Link href="/drivers" className="hover:text-[var(--teal-deep)]">चालक नोंदणी</Link>
              <Link href="/whatsapp" className="hover:text-[var(--teal-deep)] text-emerald-700 font-bold">व्हॉट्सअ‍ॅप बुकिंग</Link>
              <Link href="/mitra" className="hover:text-[var(--teal-deep)]">ट्रक मित्र</Link>
              <Link href="/faq" className="hover:text-[var(--teal-deep)]">प्रश्नोत्तरे (FAQ)</Link>
              <Link href="/contact" className="hover:text-[var(--teal-deep)]">संपर्क व मदत</Link>
              <Link href="/grievance" className="hover:text-[var(--teal-deep)]">तक्रार निवारण</Link>
              <Link href="/terms" className="hover:text-[var(--teal-deep)]">अटी व शर्ती</Link>
              <Link href="/privacy" className="hover:text-[var(--teal-deep)]">गोपनीयता धोरण</Link>
              <Link href="/refunds" className="hover:text-[var(--teal-deep)]">परतावा नियमावली</Link>
            </div>
          </div>

          <div className="border-t border-[var(--warm-gray-200)] pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--warm-gray-500)] gap-2">
            <div>
              © 2026 {BRAND_NAME}. सर्व हक्क सुरक्षित. DPDP Act २०२३ आणि Carriage by Road Act २००७ अंतर्गत नोंदणीकृत.
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--teal-deep)] font-bold">Horn OK Please 🚛</span>
              <span>•</span>
              <span>हेल्पलाइन: १८०० ८७८२५</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
