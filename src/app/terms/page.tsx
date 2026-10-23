import Link from "next/link";
import { ArrowLeft, Shield, FileText, Clock, AlertTriangle, Truck } from "lucide-react";
import { BRAND_NAME } from "@/lib/config/brand";

export const metadata = {
  title: `Terms of Service & Carriage - ${BRAND_NAME}`,
  description: "Terms and conditions of carriage, demurrage rules, and intermediary liability guidelines under the Carriage by Road Act 2007.",
};

export default function TermsPage() {
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
              कायदेशीर नियम
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 flex-1 space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--cream)] border border-[var(--warm-gray-300)] text-xs font-bold text-[var(--teal-deep)] mb-3">
            <FileText className="w-4 h-4 text-[var(--marigold)]" />
            <span>Carriage by Road Act, 2007 & IT Act, 2000</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[var(--ink)] font-[family-name:var(--font-display)]">
            सेवा आणि मालवाहतूक अटी (Terms of Service)
          </h1>
          <p className="text-xs sm:text-sm text-[var(--warm-gray-600)] mt-2">
            अंतिम सुधारणा: १ जानेवारी २०२६ • महाराष्ट्र राज्य कार्यक्षेत्र (Jurisdiction: Courts in Mumbai/Pune)
          </p>
        </div>

        {/* Section 1: Intermediary Status */}
        <section className="bg-white p-6 rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-[var(--teal-deep)] font-bold text-base">
            <Shield className="w-5 h-5 text-[var(--marigold)]" />
            <h2>१. प्लॅटफॉर्मची भूमिका (Intermediary Platform Status)</h2>
          </div>
          <p className="text-xs sm:text-sm text-[var(--warm-gray-700)] leading-relaxed">
            {BRAND_NAME} हे माहिती तंत्रज्ञान कायदा २००० च्या कलम ७९ (Section 79 of Information Technology Act, 2000) अंतर्गत डिजिटल मध्यस्थ (Intermediary Marketplace) म्हणून कार्य करते. प्लॅटफॉर्म शेतकरी, व्यापारी (Consignor) आणि स्वतंत्र व्यावसायिक ट्रक चालक किंवा ट्रान्सपोर्टर (Carrier) यांना थेट जोडण्याचे काम करतो.
          </p>
          <p className="text-xs sm:text-sm text-[var(--warm-gray-700)] leading-relaxed">
            प्रत्येक मालवाहतुकीचा प्रत्यक्ष करार हा मालक आणि वाहन चालक यांच्यात Carriage by Road Act, 2007 अन्वये होतो. प्लॅटफॉर्म स्वतः वाहनांचा मालक नाही, परंतु सुरक्षितता आणि विश्वासार्हतेसाठी सर्व चालकांची Vahan आणि Sarathi डेटाबेसमधून पडताळणी करतो.
          </p>
        </section>

        {/* Section 2: Detention and Demurrage */}
        <section className="bg-white p-6 rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-[var(--teal-deep)] font-bold text-base">
            <Clock className="w-5 h-5 text-[var(--marigold)]" />
            <h2>२. लोडिंग/अनलोडिंग वेळ आणि हॉल्टिंग फी (Detention & Demurrage)</h2>
          </div>
          <p className="text-xs sm:text-sm text-[var(--warm-gray-700)] leading-relaxed">
            ग्रामीण महाराष्ट्रातील शेतमाल आणि APMC मार्केटची परिस्थिती लक्षात घेऊन लोडिंग व अनलोडिंगसाठी खालील नियम लागू राहतील:
          </p>
          <ul className="list-disc list-inside text-xs sm:text-sm text-[var(--warm-gray-700)] space-y-1.5 ml-2">
            <li>
              <strong>मोफत लोडिंग वेळ (Free Loading Window):</strong> वाहन पोहोचल्यापासून २ तास मोफत उपलब्ध असतील.
            </li>
            <li>
              <strong>मोफत अनलोडिंग वेळ (Free Unloading Window):</strong> गंतव्यस्थानी (उदा. APMC मार्केट किंवा गोदाम) २ तास मोफत उपलब्ध असतील.
            </li>
            <li>
              <strong>हॉल्टिंग/डिटेन्शन चार्जेस (Detention Fee):</strong> २ तासांनंतर प्रत्येक अतिरिक्त तासासाठी ₹२००/- प्रति तास किंवा त्याचा भाग याप्रमाणे थेट चालकाला एस्क्रो खात्यातून दिला जाईल.
            </li>
            <li>
              <strong>रात्र थांबा (Overnight Detention):</strong> मालकाकडील कारणास्तव वाहनाला रात्री थांबावे लागल्यास रात्री १० ते सकाळी ६ या कालावधीसाठी ₹१,०००/- निश्चित हॉल्टिंग शुल्क आकारले जाईल.
            </li>
          </ul>
        </section>

        {/* Section 3: Prohibited Cargo */}
        <section className="bg-white p-6 rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-[var(--chili)] font-bold text-base">
            <AlertTriangle className="w-5 h-5" />
            <h2>३. प्रतिबंधित वस्तू (Prohibited Cargo & Compliance)</h2>
          </div>
          <p className="text-xs sm:text-sm text-[var(--warm-gray-700)] leading-relaxed">
            {BRAND_NAME} द्वारे कोणत्याही अवैध, धोकादायक किंवा शासकीय परवाना नसलेल्या मालाची वाहतूक करण्यास सक्त मनाई आहे:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-[var(--warm-gray-700)]">
            <div className="p-2.5 bg-red-50/60 border border-red-200 rounded">
              ❌ विनापरवाना लाकूड, अवैध वनउपज व प्राणी
            </div>
            <div className="p-2.5 bg-red-50/60 border border-red-200 rounded">
              ❌ अमली पदार्थ, गुटखा, अवैध दारू किंवा तंबाखू
            </div>
            <div className="p-2.5 bg-red-50/60 border border-red-200 rounded">
              ❌ ज्वलनशील रसायने, स्फोटके व अवैध शस्त्रे
            </div>
            <div className="p-2.5 bg-red-50/60 border border-red-200 rounded">
              ❌ ई-वे बिल (E-Way Bill) किंवा पावती नसलेला करपात्र माल
            </div>
          </div>
          <p className="text-[11px] text-[var(--warm-gray-500)] italic mt-2">
            * नियमांचे उल्लंघन आढळल्यास वाहन तात्काळ जवळच्या पोलीस ठाण्यात जमा केले जाईल आणि खाते कायमस्वरूपी बंद केले जाईल.
          </p>
        </section>

        {/* Section 4: Weighbridge and Cargo Care */}
        <section className="bg-white p-6 rounded-xl border border-[var(--warm-gray-200)] shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-[var(--teal-deep)] font-bold text-base">
            <Truck className="w-5 h-5 text-[var(--marigold)]" />
            <h2>४. वजन काटा आणि सुरक्षित सुपूर्दता (Weighbridge & Handover)</h2>
          </div>
          <p className="text-xs sm:text-sm text-[var(--warm-gray-700)] leading-relaxed">
            शेतमालामध्ये नैसर्गिक पाण्याचे बाष्पीभवन (moisture loss) गृहीत धरून कमाल ±२% वजनातील तफावत ग्राह्य धरली जाते. त्याहून अधिक तफावत असल्यास डिजिटल वजन काटा पावती (Weighbridge Slip) ॲपमध्ये अपलोड करून चालक व मालक यांच्या संमतीने भाडे ॲडजस्ट केले जाईल.
          </p>
          <p className="text-xs sm:text-sm text-[var(--warm-gray-700)] leading-relaxed">
            माल सुरक्षित पोहोचल्यानंतर स्वीकारकर्त्याने (Consignee) चालकाला ६ अंकी सुरक्षित डिलिव्हरी ओटीपी (OTP) देणे बंधनकारक आहे. ओटीपी प्रमाणीकरण झाल्यावरच एस्क्रोमधून अंतिम ५०% रक्कम चालकाच्या बँक खात्यात थेट जमा होते.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--warm-gray-200)] bg-white py-6">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--warm-gray-500)] gap-3">
          <div>© 2026 {BRAND_NAME}. सर्व हक्क राखीव.</div>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:underline">गोपनीयता धोरण (Privacy)</Link>
            <Link href="/refunds" className="hover:underline">परतावा धोरण (Refunds)</Link>
            <Link href="/terms" className="font-bold text-[var(--teal-deep)]">अटी व शर्ती (Terms)</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
