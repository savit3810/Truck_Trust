import Link from "next/link";
import { ArrowLeft, ShieldCheck, Mail, MapPin, PhoneCall, Clock, FileText } from "lucide-react";
import { BRAND_NAME, APP_CONFIG } from "@/lib/config/brand";

export const metadata = {
  title: `तक्रार निवारण अधिकारी (Grievance Redressal Officer) - ${BRAND_NAME}`,
  description: "DPDP Act 2023 अन्वये नियुक्त तक्रार निवारण अधिकाऱ्याची माहिती आणि तक्रार नोंदणी प्रक्रिया.",
};

export default function GrievancePage() {
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
            <span className="text-[10px] bg-red-50 text-red-700 border border-red-300 font-bold px-1.5 py-0.5 rounded">
              कायदेशीर अनिवार्य
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 flex-1 space-y-8">
        {/* Legal Notice Banner */}
        <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg text-xs text-amber-900">
          <strong>⚠ कायदेशीर सूचना (Legal Notice):</strong> हे पृष्ठ मसुदा स्वरूपात (Draft) आहे आणि
          प्रत्यक्ष लॉन्चपूर्वी कायदेशीर तज्ञांच्या पुनरावलोकनानंतरच अंतिम केले जाईल. DPDP Act, 2023
          आणि IT Act, 2000 च्या तरतुदींनुसार अनिवार्य.
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--cream)] border border-[var(--warm-gray-300)] text-xs font-bold text-[var(--teal-deep)] mb-3">
            <ShieldCheck className="w-4 h-4 text-[var(--marigold)]" />
            <span>Digital Personal Data Protection Act, 2023 — कलम १९</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[var(--ink)] font-[family-name:var(--font-display)]">
            तक्रार निवारण अधिकारी (Grievance Redressal Officer)
          </h1>
          <p className="text-xs sm:text-sm text-[var(--warm-gray-600)] mt-2">
            माहिती तंत्रज्ञान कायदा, २००० चे कलम ५(९) आणि डिजिटल वैयक्तिक डेटा संरक्षण कायदा, २०२३ चे कलम १९ यानुसार
            खालील व्यक्तीची तक्रार निवारण अधिकारी म्हणून नियुक्ती करण्यात आली आहे.
          </p>
        </div>

        {/* Officer Details */}
        <section className="bg-white p-6 rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-[var(--teal-deep)] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[var(--marigold)]" />
            नियुक्त अधिकाऱ्याची माहिती
          </h2>

          <div className="p-4 bg-[var(--cream)] rounded-lg space-y-2.5 text-xs">
            <div className="flex items-start gap-3">
              <span className="font-bold text-[var(--ink)] min-w-[100px]">नाव:</span>
              <span className="text-[var(--warm-gray-800)]">सुहास कुलकर्णी (Suhas Kulkarni)</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-bold text-[var(--ink)] min-w-[100px]">पदनाम:</span>
              <span className="text-[var(--warm-gray-800)]">डेटा संरक्षण अधिकारी / तक्रार निवारण अधिकारी (DPO / GRO)</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-bold text-[var(--ink)] min-w-[100px]">ईमेल:</span>
              <a href="mailto:grievance@trucktrust.in" className="text-[var(--teal-deep)] font-bold hover:underline flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                grievance@trucktrust.in
              </a>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-bold text-[var(--ink)] min-w-[100px]">फोन:</span>
              <a href="tel:+912226543210" className="text-[var(--teal-deep)] font-bold hover:underline flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5" />
                +91 22 2654 3210
              </a>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-bold text-[var(--ink)] min-w-[100px]">पत्ता:</span>
              <span className="text-[var(--warm-gray-800)] flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                {BRAND_NAME} ऑपरेशन्स सेंटर, बांद्रा-कुर्ला कॉम्प्लेक्स (BKC), मुंबई ४०००५१, महाराष्ट्र
              </span>
            </div>
          </div>
        </section>

        {/* Types of Grievances */}
        <section className="bg-white p-6 rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-3">
          <h2 className="text-base font-bold text-[var(--teal-deep)]">
            कोणत्या तक्रारी नोंदवता येतात?
          </h2>
          <ul className="list-disc list-inside text-xs sm:text-sm text-[var(--warm-gray-700)] space-y-1.5 ml-2">
            <li><strong>वैयक्तिक डेटा गोपनीयतेचे उल्लंघन:</strong> तुमची माहिती अनधिकृतपणे वापरली किंवा शेअर केली गेल्यास</li>
            <li><strong>संमती मागे घेण्यास (Consent Withdrawal) विलंब:</strong> खाते बंद करण्याच्या किंवा डेटा हटवण्याच्या विनंतीस प्रतिसाद न मिळाल्यास</li>
            <li><strong>डेटा दुरुस्ती (Data Correction):</strong> तुमच्या खात्यात चुकीची माहिती दुरुस्त करण्यास नकार</li>
            <li><strong>पेमेंट आणि एस्क्रो विवाद:</strong> अन्यायकारक पेमेंट रोख, परतावा नकार किंवा एस्क्रो रक्कम न मिळणे</li>
            <li><strong>चालक पडताळणी तक्रार:</strong> बनावट कागदपत्रे, अपमानजनक वर्तन, माल चोरी किंवा नुकसान</li>
            <li><strong>प्लॅटफॉर्म सेवा तक्रार:</strong> बुकिंग, ट्रॅकिंग किंवा ॲप संबंधित कोणतीही अडचण</li>
          </ul>
        </section>

        {/* Resolution Timeline */}
        <section className="bg-white p-6 rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-3">
          <h2 className="text-base font-bold text-[var(--teal-deep)] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--marigold)]" />
            तक्रार निराकरण वेळापत्रक (Resolution Timeline)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs">
              <span className="font-bold text-emerald-800 block">पोचपावती (Acknowledgement)</span>
              <span className="text-emerald-700 text-lg font-mono font-bold">२४ तास</span>
              <p className="text-emerald-600 mt-1">तुमच्या तक्रारीची लिखित पोचपावती ईमेल आणि SMS ने</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs">
              <span className="font-bold text-amber-800 block">तपासणी (Investigation)</span>
              <span className="text-amber-700 text-lg font-mono font-bold">४८ तास</span>
              <p className="text-amber-600 mt-1">संबंधित विभागाकडून सखोल तपासणी आणि पुराव्यांचे संकलन</p>
            </div>
            <div className="p-3 bg-[var(--cream)] rounded-lg border border-[var(--warm-gray-300)] text-xs">
              <span className="font-bold text-[var(--ink)] block">अंतिम निराकरण (Resolution)</span>
              <span className="text-[var(--teal-deep)] text-lg font-mono font-bold">जास्तीत जास्त ७२ तास</span>
              <p className="text-[var(--warm-gray-600)] mt-1">कामकाजाच्या तासांत अंतिम निर्णय, परतावा किंवा कारवाई</p>
            </div>
          </div>
        </section>

        {/* Escalation */}
        <section className="bg-white p-6 rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-3">
          <h2 className="text-base font-bold text-[var(--teal-deep)]">
            उच्चस्तरीय दाद (Escalation)
          </h2>
          <p className="text-xs sm:text-sm text-[var(--warm-gray-700)] leading-relaxed">
            तक्रार निवारण अधिकाऱ्याच्या निर्णयावर समाधान न झाल्यास, तुम्ही डेटा संरक्षण मंडळ (Data Protection Board of India) कडे अपील दाखल करू शकता.
            हे अधिकार DPDP Act, 2023 च्या कलम २२ अन्वये तुम्हाला प्राप्त आहेत.
          </p>
          <p className="text-xs text-[var(--warm-gray-500)]">
            अधिक माहिती: <a href="https://meity.gov.in" target="_blank" rel="noopener noreferrer" className="text-[var(--teal-deep)] hover:underline">Ministry of Electronics & IT (MeitY)</a>
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--warm-gray-200)] bg-white py-6">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--warm-gray-500)] gap-3">
          <div>© 2026 {BRAND_NAME}. सर्व हक्क राखीव.</div>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:underline">गोपनीयता धोरण</Link>
            <Link href="/terms" className="hover:underline">अटी व शर्ती</Link>
            <Link href="/contact" className="hover:underline">संपर्क</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
