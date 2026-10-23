import Link from "next/link";
import {
  ArrowLeft,
  PhoneCall,
  Mail,
  MapPin,
  MessageSquare,
  Clock,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import { BRAND_NAME, APP_CONFIG } from "@/lib/config/brand";

export const metadata = {
  title: `संपर्क आणि सहाय्यता (Contact & Help) - ${BRAND_NAME}`,
  description: "TruckTrust ग्रामीण सहाय्यता केंद्र - कॉल, WhatsApp, ईमेल किंवा कार्यालय भेटीसाठी संपर्क माहिती.",
};

export default function ContactPage() {
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
          <span className="font-bold text-sm text-[var(--ink)] font-[family-name:var(--font-display)]">
            {BRAND_NAME}
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 flex-1 space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--cream)] border border-[var(--warm-gray-300)] text-xs font-bold text-[var(--teal-deep)] mb-3">
            <HelpCircle className="w-4 h-4 text-[var(--marigold)]" />
            <span>ग्रामीण सहाय्यता केंद्र • दररोज सकाळी ६ ते रात्री १०</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[var(--ink)] font-[family-name:var(--font-display)]">
            संपर्क आणि सहाय्यता (Contact & Help)
          </h1>
          <p className="text-xs sm:text-sm text-[var(--warm-gray-600)] mt-2">
            बुकिंग, पेमेंट, ट्रॅकिंग, चालक नोंदणी किंवा कोणत्याही समस्येसाठी आम्हाला खालील मार्गांनी संपर्क करा.
          </p>
        </div>

        {/* Contact Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Phone */}
          <a
            href={`tel:${APP_CONFIG.support.phone.replace(/\s/g, "")}`}
            className="p-5 bg-white rounded-xl border border-[var(--warm-gray-200)] shadow-2xs flex items-start gap-4 hover:border-[var(--teal-deep)] transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--teal-deep)] text-[var(--marigold)] flex items-center justify-center shrink-0">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--ink)] group-hover:text-[var(--teal-deep)]">
                मोफत हेल्पलाइन (Toll-Free Helpline)
              </h2>
              <p className="text-lg font-mono font-bold text-[var(--teal-deep)] mt-0.5">
                १८०० ८७८२५
              </p>
              <p className="text-xs text-[var(--warm-gray-500)] mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>दररोज सकाळी ६:०० ते रात्री १०:०० (IST)</span>
              </p>
              <p className="text-[11px] text-[var(--warm-gray-500)]">
                मराठी, हिंदी आणि इंग्रजीमध्ये सहाय्य उपलब्ध
              </p>
            </div>
          </a>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${APP_CONFIG.support.whatsapp.replace(/[\s+]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 bg-white rounded-xl border border-[var(--warm-gray-200)] shadow-2xs flex items-start gap-4 hover:border-emerald-500 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--ink)] group-hover:text-emerald-700">
                WhatsApp सहाय्यता
              </h2>
              <p className="text-lg font-mono font-bold text-emerald-700 mt-0.5">
                +91 98200 98200
              </p>
              <p className="text-xs text-[var(--warm-gray-500)] mt-1">
                बुकिंग, ट्रॅकिंग लिंक आणि तक्रारी WhatsApp वर पाठवा
              </p>
              <p className="text-[11px] text-[var(--warm-gray-500)]">
                सामान्यतः ३० मिनिटांत प्रतिसाद
              </p>
            </div>
          </a>

          {/* Email */}
          <a
            href={`mailto:${APP_CONFIG.support.email}`}
            className="p-5 bg-white rounded-xl border border-[var(--warm-gray-200)] shadow-2xs flex items-start gap-4 hover:border-[var(--marigold)] transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--marigold)] text-[var(--teal-deep)] flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--ink)] group-hover:text-[var(--marigold)]">
                ईमेल (Email)
              </h2>
              <p className="text-sm font-mono font-bold text-[var(--ink)] mt-0.5">
                {APP_CONFIG.support.email}
              </p>
              <p className="text-xs text-[var(--warm-gray-500)] mt-1">
                पेमेंट विवाद, पावत्या, चालक तक्रारी आणि अधिकृत पत्रव्यवहारासाठी
              </p>
              <p className="text-[11px] text-[var(--warm-gray-500)]">
                कामकाजाच्या दिवसांत २४ तासांत प्रतिसाद
              </p>
            </div>
          </a>

          {/* Office */}
          <div className="p-5 bg-white rounded-xl border border-[var(--warm-gray-200)] shadow-2xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--cream)] text-[var(--teal-deep)] flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6 text-[var(--chili)]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--ink)]">
                ऑपरेशन्स ऑफिस (Office)
              </h2>
              <p className="text-xs text-[var(--warm-gray-700)] mt-1 leading-relaxed">
                {BRAND_NAME} ऑपरेशन्स सेंटर<br />
                बांद्रा-कुर्ला कॉम्प्लेक्स (BKC)<br />
                मुंबई ४०००५१, महाराष्ट्र
              </p>
              <p className="text-[11px] text-[var(--warm-gray-500)] mt-1">
                सोमवार ते शुक्रवार, सकाळी १०:०० ते संध्याकाळी ६:००
              </p>
            </div>
          </div>
        </div>

        {/* Grievance Officer Quick Link */}
        <div className="p-5 bg-amber-50 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-amber-700" />
            <div>
              <h3 className="text-sm font-bold text-[var(--ink)]">
                तक्रार निवारण अधिकारी (Grievance Officer)
              </h3>
              <p className="text-xs text-[var(--warm-gray-600)]">
                DPDP Act 2023 अन्वये नियुक्त — डेटा गोपनीयता आणि गंभीर तक्रारींसाठी
              </p>
            </div>
          </div>
          <Link
            href="/grievance"
            className="px-4 py-2 rounded-lg bg-amber-700 text-white text-xs font-bold hover:bg-amber-800 whitespace-nowrap"
          >
            तक्रार निवारण पृष्ठ पहा
          </Link>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/faq"
            className="p-3 bg-white rounded-lg border border-[var(--warm-gray-200)] text-xs font-bold text-[var(--ink)] hover:border-[var(--teal-deep)] text-center"
          >
            वारंवार प्रश्न (FAQ)
          </Link>
          <Link
            href="/refunds"
            className="p-3 bg-white rounded-lg border border-[var(--warm-gray-200)] text-xs font-bold text-[var(--ink)] hover:border-[var(--teal-deep)] text-center"
          >
            परतावा धोरण
          </Link>
          <Link
            href="/how-it-works"
            className="p-3 bg-white rounded-lg border border-[var(--warm-gray-200)] text-xs font-bold text-[var(--ink)] hover:border-[var(--teal-deep)] text-center"
          >
            कसे काम करते
          </Link>
          <Link
            href="/pricing"
            className="p-3 bg-white rounded-lg border border-[var(--warm-gray-200)] text-xs font-bold text-[var(--ink)] hover:border-[var(--teal-deep)] text-center"
          >
            दरपत्रक
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--warm-gray-200)] bg-white py-6">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--warm-gray-500)] gap-3">
          <div>© 2026 {BRAND_NAME}. सर्व हक्क राखीव.</div>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:underline">गोपनीयता धोरण</Link>
            <Link href="/terms" className="hover:underline">अटी व शर्ती</Link>
            <Link href="/grievance" className="hover:underline">तक्रार निवारण</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
