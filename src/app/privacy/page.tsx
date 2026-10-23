import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Eye, Mail, MapPin } from "lucide-react";
import { BRAND_NAME } from "@/lib/config/brand";

export const metadata = {
  title: `Privacy Policy - ${BRAND_NAME}`,
  description: "Data protection and privacy guidelines compliant with the Digital Personal Data Protection Act (DPDP Act) 2023.",
};

export default function PrivacyPage() {
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
              DPDP २०२३ अनुरूप
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 flex-1 space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--cream)] border border-[var(--warm-gray-300)] text-xs font-bold text-[var(--teal-deep)] mb-3">
            <ShieldCheck className="w-4 h-4 text-[var(--marigold)]" />
            <span>Digital Personal Data Protection Act, 2023 Compliant</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[var(--ink)] font-[family-name:var(--font-display)]">
            गोपनीयता धोरण (Privacy Policy)
          </h1>
          <p className="text-xs sm:text-sm text-[var(--warm-gray-600)] mt-2">
            आम्ही तुमच्या वैयक्तिक माहितीचे आणि शेतमालाच्या डेटाचे संरक्षण करण्यास कटिबद्ध आहोत.
          </p>
        </div>

        {/* Purpose Specification */}
        <section className="bg-white p-6 rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-[var(--teal-deep)] font-bold text-base">
            <Eye className="w-5 h-5 text-[var(--marigold)]" />
            <h2>१. आम्ही गोळा करत असलेली माहिती आणि त्याचा उद्देश</h2>
          </div>
          <p className="text-xs sm:text-sm text-[var(--warm-gray-700)] leading-relaxed">
            DPDP Act २०२३ च्या तरतुदींनुसार आम्ही केवळ सेवा देण्यासाठी अत्यावश्यक असलेलीच माहिती गोळा करतो:
          </p>
          <div className="space-y-3 pt-2">
            <div className="p-3 bg-[var(--warm-gray-50)] border border-[var(--warm-gray-200)] rounded-lg">
              <h3 className="text-xs font-bold text-[var(--ink)]">अ. चालक आणि वाहन पडताळणी माहिती:</h3>
              <p className="text-xs text-[var(--warm-gray-600)] mt-1">
                वाहन क्रमांक (RC), ड्रायव्हिंग लायसन्स (DL), आधार पडताळणी आणि इन्शुरन्स दस्तऐवज. ही माहिती केवळ रस्ते वाहतूक मंत्रालय (MoRTH) च्या नियमांनुसार चालकाची कायदेशीर पडताळणी करण्यासाठी वापरली जाते.
              </p>
            </div>
            <div className="p-3 bg-[var(--warm-gray-50)] border border-[var(--warm-gray-200)] rounded-lg">
              <h3 className="text-xs font-bold text-[var(--ink)]">ब. लाईव्ह जीपीएस ट्रॅकिंग (Live GPS Location):</h3>
              <p className="text-xs text-[var(--warm-gray-600)] mt-1">
                चालकाचे लोकेशन केवळ सक्रिय ट्रिप (Active Trip) दरम्यानच ट्रॅक केले जाते. ट्रिप पूर्ण झाल्यावर किंवा चालक ऑफलाइन असताना बॅकग्राउंड ट्रॅकिंग पूर्णपणे बंद केले जाते.
              </p>
            </div>
            <div className="p-3 bg-[var(--warm-gray-50)] border border-[var(--warm-gray-200)] rounded-lg">
              <h3 className="text-xs font-bold text-[var(--ink)]">क. आर्थिक आणि एस्क्रो व्यवहार डेटा:</h3>
              <p className="text-xs text-[var(--warm-gray-600)] mt-1">
                UPI आयडी आणि बँक खाते तपशील हे केवळ सुरक्षित पेमेंट गेटवे (RBI अधिकृत) आणि थेट बँक खात्यात रक्कम जमा करण्यासाठी कूटबद्ध (Encrypted) स्वरूपात वापरले जातात.
              </p>
            </div>
          </div>
        </section>

        {/* Data Security & Retention */}
        <section className="bg-white p-6 rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-[var(--teal-deep)] font-bold text-base">
            <Lock className="w-5 h-5 text-[var(--marigold)]" />
            <h2>२. डेटा सुरक्षितता आणि जपणूक (Data Security & Retention)</h2>
          </div>
          <p className="text-xs sm:text-sm text-[var(--warm-gray-700)] leading-relaxed">
            सर्व संवेदनशील दस्तऐवज आणि माहिती AES-256 बिट एन्क्रिप्शनने सुरक्षित केली जाते. सर्व नेटवर्क संवाद TLS 1.3 द्वारे सुरक्षित केला जातो. आयकर आणि जीएसटी कायद्यानुसार आवश्यक असलेले आर्थिक रेकॉर्ड कायदेशीर मुदतीसाठी सुरक्षित ठेवले जातात, त्यानंतर वापरकर्त्याच्या विनंतीनुसार वैयक्तिक डेटा कायमस्वरूपी नष्ट केला जातो.
          </p>
        </section>

        {/* User Rights */}
        <section className="bg-white p-6 rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-[var(--teal-deep)] font-bold text-base">
            <ShieldCheck className="w-5 h-5 text-[var(--marigold)]" />
            <h2>३. तुमचे हक्क (Your DPDP Rights)</h2>
          </div>
          <ul className="list-disc list-inside text-xs sm:text-sm text-[var(--warm-gray-700)] space-y-1.5 ml-2">
            <li><strong>माहिती मिळवण्याचा हक्क:</strong> तुमच्या खात्यात साठवलेल्या सर्व डेटाची प्रत मागवण्याचा अधिकार.</li>
            <li><strong>दुरुस्तीचा हक्क:</strong> चुकीची माहिती किंवा फोन नंबर दुरुस्त करण्याची मुभा.</li>
            <li><strong>संमती मागे घेणे (Withdrawal of Consent):</strong> तुम्ही कधीही तुमची संमती मागे घेऊन खाते बंद करू शकता.</li>
          </ul>
        </section>

        {/* Grievance Officer */}
        <section className="bg-white p-6 rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-[var(--teal-deep)] font-bold text-base">
            <Mail className="w-5 h-5 text-[var(--marigold)]" />
            <h2>४. तक्रार निवारण अधिकारी (Grievance Redressal Officer)</h2>
          </div>
          <p className="text-xs sm:text-sm text-[var(--warm-gray-700)] leading-relaxed">
            DPDP कायदा २०२३ च्या कलम १९ अन्वये, आपल्या कोणत्याही डेटा आणि गोपनीयतेच्या तक्रारीसाठी खालील नियुक्त अधिकाऱ्याशी संपर्क साधावा:
          </p>
          <div className="p-4 bg-[var(--cream)] rounded-lg text-xs space-y-1 text-[var(--ink)]">
            <div className="font-bold">नाव: सुहास कुलकर्णी (डेटा संरक्षण अधिकारी / DPO)</div>
            <div className="flex items-center gap-1.5 text-[var(--warm-gray-700)]">
              <Mail className="w-3.5 h-3.5 text-[var(--teal-deep)]" />
              <span>ईमेल: grievance@trucktrust.in</span>
            </div>
            <div className="flex items-center gap-1.5 text-[var(--warm-gray-700)]">
              <MapPin className="w-3.5 h-3.5 text-[var(--teal-deep)]" />
              <span>पत्ता: {BRAND_NAME} ऑपरेशन्स सेंटर, बांद्रा-कुर्ला कॉम्प्लेक्स (BKC), मुंबई ४०००५१</span>
            </div>
            <div className="text-[11px] text-[var(--warm-gray-500)] pt-1">
              * सर्व तक्रारींचे निराकरण जास्तीत जास्त ७२ कामकाजाच्या तासांच्या आत केले जाते.
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--warm-gray-200)] bg-white py-6">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--warm-gray-500)] gap-3">
          <div>© 2026 {BRAND_NAME}. सर्व हक्क राखीव.</div>
          <div className="flex gap-4">
            <Link href="/privacy" className="font-bold text-[var(--teal-deep)]">गोपनीयता धोरण (Privacy)</Link>
            <Link href="/refunds" className="hover:underline">परतावा धोरण (Refunds)</Link>
            <Link href="/terms" className="hover:underline">अटी व शर्ती (Terms)</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
