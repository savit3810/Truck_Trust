import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  Truck,
  ShieldCheck,
  Scale,
  MapPin,
  PhoneCall,
  FileCheck,
  HelpCircle,
  Coins,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { BRAND_NAME, APP_CONFIG } from "@/lib/config/brand";

export const metadata = {
  title: `वारंवार विचारले जाणारे प्रश्न (FAQ) - ${BRAND_NAME}`,
  description: "शेतकरी, ट्रक चालक आणि व्यापाऱ्यांसाठी TruckTrust बद्दल सर्वसामान्य प्रश्न आणि उत्तरे.",
};

interface FaqItem {
  q: string;
  a: string;
  category: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    category: "सामान्य (General)",
    q: "TruckTrust म्हणजे नक्की काय?",
    a: "TruckTrust हे महाराष्ट्रातील ग्रामीण शेतकरी, महिला बचत गट, लहान व्यापारी आणि पडताळणीकृत ट्रक चालक यांना जोडणारे डिजिटल मालवाहतूक प्लॅटफॉर्म आहे. शेतमाल, दूध, कांदा, फळे यांची सुरक्षित, ट्रॅक केलेली आणि ५०-५० एस्क्रो पेमेंट असलेली वाहतूक सेवा आम्ही देतो.",
  },
  {
    category: "सामान्य (General)",
    q: "मला ॲप डाउनलोड करावे लागेल का?",
    a: "नाही! TruckTrust हे PWA (Progressive Web App) आहे, म्हणजे तुम्ही थेट ब्राऊझरमधून वापरू शकता. तुमच्या Android फोनवर 'Install' बटण दिसल्यास ॲप म्हणूनही इन्स्टॉल करता येते. इंटरनेट बंद असतानाही तुम्ही मसुदा बुकिंग सेव्ह करू शकता.",
  },
  {
    category: "बुकिंग (Booking)",
    q: "मी बुकिंग कसे करू शकतो?",
    a: "मुख्यपृष्ठावरून 'माल पाठवा (Book)' बटणावर क्लिक करा. पिकअप आणि ड्रॉप ठिकाण, मालाचा प्रकार व वजन, आणि ट्रक प्रकार निवडा. भाडे पाहून ५०% आगाऊ UPI किंवा नेटबँकिंगने भरा. ट्रक चालक स्वीकारल्यावर तुमच्या शेतावर किंवा गोदामावर येतो.",
  },
  {
    category: "बुकिंग (Booking)",
    q: "मला स्वतः बुकिंग करता येत नसेल तर?",
    a: "तुमच्या गावातील ट्रक मित्र (Truck Mitra) तुमच्यावतीने बुकिंग करतील. तुम्हाला फक्त मालाचा तपशील आणि फोन नंबर सांगायचा आहे. ट्रक मित्र APMC केंद्रात किंवा CSC सेंटरवर उपलब्ध असतात.",
  },
  {
    category: "बुकिंग (Booking)",
    q: "परतीची फेरी (Return Load) म्हणजे काय?",
    a: "जर एखादा ट्रक वाशी किंवा पुण्यात माल उतरवून रिकामा परत जाणार असेल, तर त्या परतीच्या मार्गावर तुमचा माल सवलतीच्या दरात (२०-३०% कमी) पाठवता येतो. ड्रायव्हरला रिकामी फेरी वाचते आणि तुम्हाला स्वस्त भाडे मिळते.",
  },
  {
    category: "पेमेंट (Payments)",
    q: "५०-५० एस्क्रो पेमेंट कसे काम करते?",
    a: "बुकिंगच्या वेळी तुम्ही एकूण भाड्याच्या ५०% रक्कम UPI किंवा नेटबँकिंगने भरता. ही रक्कम सुरक्षित एस्क्रो खात्यात लॉक राहते. माल गंतव्यस्थानी पोहोचल्यावर स्वीकारकर्ता (Receiver) ६ अंकी OTP देतो, मगच उर्वरित ५०% रक्कम चालकाला रिलीज होते.",
  },
  {
    category: "पेमेंट (Payments)",
    q: "बुकिंग रद्द केल्यावर पैसे परत मिळतात का?",
    a: "होय! चालक स्वीकारण्यापूर्वी रद्द केल्यास १००% परतावा. चालक येण्यापूर्वी रद्द केल्यास ९०% परतावा (१०% रद्दीकरण शुल्क). माल भरल्यानंतर रद्दीकरण केल्यास चालकाचा प्रवास खर्च वजा करून उर्वरित रक्कम परत केली जाते. सविस्तर माहितीसाठी आमचे परतावा धोरण पहा.",
  },
  {
    category: "चालक (Drivers)",
    q: "मी ट्रक चालक म्हणून कसे जुळू शकतो?",
    a: "मुख्यपृष्ठावर मोबाईल नंबरने नोंदणी करा आणि 'ट्रक चालक' भूमिका निवडा. ड्रायव्हिंग लायसन्स (DL), आर.सी. पुस्तक (RC), इन्शुरन्स आणि PUC चे फोटो अपलोड करा. आमची टीम २४ तासांत पडताळणी करते. मंजुरी मिळाल्यावर तुम्हाला भाडी दिसू लागतात.",
  },
  {
    category: "चालक (Drivers)",
    q: "चालकाला पेमेंट कधी मिळते?",
    a: "शेतकऱ्याने माल भरल्यावर ५०% डिझेल आगाऊ रक्कम थेट तुमच्या बँक किंवा UPI खात्यात जमा होते. माल पोहोचल्यावर स्वीकारकर्त्याने OTP दिल्यानंतर उर्वरित ५०% रक्कम ३० मिनिटांच्या आत जमा होते.",
  },
  {
    category: "सुरक्षितता (Safety)",
    q: "माझा माल सुरक्षित राहील याची खात्री काय?",
    a: "प्रत्येक ट्रिपला पिकअप आणि डिलिव्हरी या दोन्ही टप्प्यांवर मालाचे फोटो काढले जातात. GPS ट्रॅकिंगने तुम्ही ट्रकची हालचाल थेट पाहू शकता. नुकसान किंवा विलंब झाल्यास विवाद (Dispute) बटणाने तक्रार नोंदवता येते आणि एस्क्रो रक्कम तक्रार सुटेपर्यंत होल्ड राहते.",
  },
  {
    category: "सुरक्षितता (Safety)",
    q: "चालकाचे कागदपत्रे कसे पडताळले जातात?",
    a: "सध्या आमची प्रशिक्षित टीम प्रत्येक चालकाचे DL, RC, इन्शुरन्स आणि PUC हाताने तपासते. Vahan आणि Sarathi सरकारी डेटाबेसशी API एकत्रीकरण शासकीय मंजुरी प्राप्त झाल्यावर सक्रिय केले जाईल. कागदपत्रे कालबाह्य झाल्यास चालकाची सेवा आपोआप निलंबित होते.",
  },
  {
    category: "तांत्रिक (Technical)",
    q: "इंटरनेट नसताना बुकिंग करता येते का?",
    a: "तुम्ही ऑफलाइन असताना बुकिंगचा मसुदा (Draft) तुमच्या फोनवर सेव्ह होतो. इंटरनेट आल्यावर तो आपोआप सर्व्हरला पाठवला जातो. पेमेंटसाठी मात्र इंटरनेट आवश्यक आहे.",
  },
];

export default function FaqPage() {
  // Group FAQ items by category
  const categories = Array.from(new Set(FAQ_ITEMS.map((f) => f.category)));

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
              सहाय्यता
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 flex-1 space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--cream)] border border-[var(--warm-gray-300)] text-xs font-bold text-[var(--teal-deep)] mb-3">
            <HelpCircle className="w-4 h-4 text-[var(--marigold)]" />
            <span>शेतकरी, चालक आणि व्यापाऱ्यांसाठी मदत केंद्र</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[var(--ink)] font-[family-name:var(--font-display)]">
            वारंवार विचारले जाणारे प्रश्न (FAQ)
          </h1>
          <p className="text-xs sm:text-sm text-[var(--warm-gray-600)] mt-2">
            तुमच्या शंकांची उत्तरे खाली मिळतील. अजून प्रश्न असल्यास आमच्या सहाय्यता क्रमांकावर मोफत कॉल करा.
          </p>
        </div>

        {categories.map((cat) => (
          <section key={cat} className="space-y-3">
            <h2 className="text-sm font-bold text-[var(--teal-deep)] uppercase tracking-wider border-b border-[var(--warm-gray-200)] pb-2">
              {cat}
            </h2>
            <div className="space-y-2">
              {FAQ_ITEMS.filter((f) => f.category === cat).map((item, idx) => (
                <details
                  key={idx}
                  className="bg-white rounded-xl border border-[var(--warm-gray-200)] shadow-2xs group"
                >
                  <summary className="p-4 cursor-pointer list-none flex items-start justify-between gap-3 text-sm font-bold text-[var(--ink)] hover:text-[var(--teal-deep)] transition-colors">
                    <span>{item.q}</span>
                    <ChevronDown className="w-4 h-4 text-[var(--warm-gray-500)] shrink-0 mt-0.5 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-4 pb-4 pt-0 text-xs sm:text-sm text-[var(--warm-gray-700)] leading-relaxed border-t border-[var(--warm-gray-100)]">
                    <p className="pt-3">{item.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}

        {/* Still need help banner */}
        <div className="p-6 bg-[var(--teal-deep)] text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold">अजून शंका आहेत?</h3>
            <p className="text-xs text-[var(--cream)]/80 mt-1">
              आमचे ग्रामीण सहाय्यता केंद्र दररोज सकाळी ६ ते रात्री १० पर्यंत उपलब्ध.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`tel:${APP_CONFIG.support.phone.replace(/\s/g, "")}`}
              className="px-4 py-2 rounded-lg bg-[var(--marigold)] text-[var(--teal-deep)] text-xs font-bold hover:brightness-105 inline-flex items-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>१८०० ८७८२५ वर कॉल</span>
            </a>
            <Link
              href="/contact"
              className="px-4 py-2 rounded-lg bg-white/10 text-white text-xs font-bold hover:bg-white/20"
            >
              संपर्क फॉर्म
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--warm-gray-200)] bg-white py-6">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--warm-gray-500)] gap-3">
          <div>© 2026 {BRAND_NAME}. सर्व हक्क राखीव.</div>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:underline">गोपनीयता धोरण</Link>
            <Link href="/refunds" className="hover:underline">परतावा धोरण</Link>
            <Link href="/terms" className="hover:underline">अटी व शर्ती</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
