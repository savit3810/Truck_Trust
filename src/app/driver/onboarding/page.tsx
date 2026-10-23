"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BRAND_NAME } from "@/lib/config/brand";
import { Truck, ShieldCheck, Upload, CheckCircle2, ArrowRight, RotateCw, AlertTriangle } from "lucide-react";

const MAHARASHTRA_DISTRICTS = [
  "Palghar (पालघर)",
  "Nashik (नाशिक)",
  "Pune (पुणे)",
  "Thane (ठाणे)",
  "Raigad (रायगड)",
  "Kolhapur (कोल्हापूर)",
  "Ahmednagar (अहिल्यानगर)",
  "Satara (सातारा)",
  "Solapur (सोलापूर)",
  "Jalgaon (जळगाव)",
];

const TRUCK_TYPES = [
  { id: "tata_ace", label: "छोटा हत्ती (Tata Ace)", capacity: "750 kg", body: "tarpaulin" },
  { id: "pickup", label: "पिकअप / बोलेरो मॅक्सी", capacity: "1,500 kg", body: "tarpaulin" },
  { id: "truck_14ft", label: "१४ फूट ट्रक (4 Ton)", capacity: "4,000 kg", body: "closed_container" },
  { id: "truck_17ft", label: "१७ फूट ट्रक (6 Ton)", capacity: "6,000 kg", body: "closed_container" },
  { id: "truck_20ft", label: "२० फूट ट्रक (9 Ton)", capacity: "9,000 kg", body: "closed_container" },
  { id: "truck_32ft", label: "३२ फूट कंटेनर (15+ Ton)", capacity: "15,000 kg", body: "closed_container" },
];

export default function DriverOnboardingPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [experienceYears, setExperienceYears] = useState(3);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>(["Palghar", "Thane", "Nashik"]);
  const [upiId, setUpiId] = useState("");
  const [accountLast4, setAccountLast4] = useState("");
  const [ifscPrefix, setIfscPrefix] = useState("MAHB");

  // Truck State
  const [plateNumber, setPlateNumber] = useState("");
  const [truckType, setTruckType] = useState("pickup");
  const [capacityKg, setCapacityKg] = useState(1500);
  const [bodyType, setBodyType] = useState<"tarpaulin" | "closed_container" | "open" | "refrigerated">("tarpaulin");

  // Document Upload State
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { url: string; status: string }>>({});
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [docExpiries, setDocExpiries] = useState<Record<string, string>>({
    driving_license: "2028-12-31",
    rc_book: "2030-05-15",
    insurance: "2027-04-10",
    puc: "2027-02-28",
  });

  useEffect(() => {
    // Check if user has existing profile
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          if (data.user.name) setName(data.user.name);
          if (data.driver) {
            setLicenseNumber(data.driver.licenseNumber || "");
            setExperienceYears(data.driver.experienceYears || 3);
            if (data.driver.operatingDistricts?.length) setSelectedDistricts(data.driver.operatingDistricts);
            if (data.driver.bankDetails?.upiId) setUpiId(data.driver.bankDetails.upiId);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/drivers/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          licenseNumber,
          experienceYears,
          operatingDistricts: selectedDistricts,
          bankDetails: {
            upiId: upiId || undefined,
            accountLast4: accountLast4 || undefined,
            ifscPrefix: ifscPrefix || undefined,
          },
          truck: {
            registrationNumber: plateNumber,
            truckType,
            capacityKg,
            bodyType,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Profile registration failed");
      } else {
        setSuccessMessage("माहिती जतन झाली! आता कृपया कागदपत्रे अपलोड करा.");
        setStep(3); // Proceed to document upload
      }
    } catch {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (docType: string, file: File) => {
    setUploadingDoc(docType);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("docType", docType);
    if (docExpiries[docType]) {
      formData.append("expiryDate", docExpiries[docType]);
    }

    try {
      const res = await fetch("/api/drivers/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Document upload failed");
      } else {
        setUploadedDocs((prev) => ({
          ...prev,
          [docType]: { url: data.document.fileUrl, status: "pending" },
        }));
      }
    } catch {
      setError("Document upload failed");
    } finally {
      setUploadingDoc(null);
    }
  };

  const toggleDistrict = (dist: string) => {
    const raw = dist.split(" ")[0];
    if (selectedDistricts.includes(raw)) {
      if (selectedDistricts.length > 1) {
        setSelectedDistricts(selectedDistricts.filter((d) => d !== raw));
      }
    } else {
      setSelectedDistricts([...selectedDistricts, raw]);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--warm-gray-50)] text-[var(--ink)]">
      {/* Top Banner */}
      <header className="bg-white border-b border-[var(--warm-gray-200)] py-4 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[var(--teal-deep)] flex items-center justify-center text-[var(--marigold)]">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight font-[family-name:var(--font-display)]">
              {BRAND_NAME} • ड्रायव्हर आणि ट्रक नोंदणी
            </h1>
            <p className="text-xs text-[var(--warm-gray-500)]">
              Driver & Vehicle KYC Verification Portal
            </p>
          </div>
        </div>
        <div className="truck-badge stamp-verified text-xs">
          शासकीय पडताळणी
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Step Navigation Indicator */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`p-3 rounded border text-left text-xs font-bold transition-colors ${
              step === 1
                ? "bg-[var(--teal-deep)] text-white border-[var(--teal-deep)]"
                : "bg-white border-[var(--warm-gray-200)] text-[var(--warm-gray-700)]"
            }`}
          >
            १. वैयक्तिक माहिती (Driver Info)
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`p-3 rounded border text-left text-xs font-bold transition-colors ${
              step === 2
                ? "bg-[var(--teal-deep)] text-white border-[var(--teal-deep)]"
                : "bg-white border-[var(--warm-gray-200)] text-[var(--warm-gray-700)]"
            }`}
          >
            २. ट्रक माहिती (Vehicle Specs)
          </button>
          <button
            type="button"
            onClick={() => setStep(3)}
            className={`p-3 rounded border text-left text-xs font-bold transition-colors ${
              step === 3
                ? "bg-[var(--teal-deep)] text-white border-[var(--teal-deep)]"
                : "bg-white border-[var(--warm-gray-200)] text-[var(--warm-gray-700)]"
            }`}
          >
            ३. कागदपत्रे अपलोड (Upload Docs)
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded bg-red-50 border border-red-200 text-sm text-[var(--chili)] flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* STEP 1: Driver Personal Details */}
        {step === 1 && (
          <div className="bg-white p-6 sm:p-8 rounded border border-[var(--warm-gray-200)] shadow-sm space-y-6">
            <h2 className="text-lg font-bold border-b border-[var(--warm-gray-200)] pb-3">
              ड्रायव्हर वैयक्तिक व परवाना तपशील (Driver Details)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase text-[var(--warm-gray-700)] mb-1">
                  पूर्ण नाव (Full Name) *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="उदा. संतोष जाधव (Santosh Jadhav)"
                  required
                  className="w-full px-3.5 py-2.5 rounded border border-[var(--warm-gray-300)] focus:border-[var(--teal-deep)] focus:outline-none text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[var(--warm-gray-700)] mb-1">
                  ड्रायव्हिंग लायसन्स नंबर (Driving License) *
                </label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
                  placeholder="MH-48-20150009871"
                  required
                  className="w-full px-3.5 py-2.5 rounded border border-[var(--warm-gray-300)] focus:border-[var(--teal-deep)] focus:outline-none text-sm font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[var(--warm-gray-700)] mb-1">
                  वाहतूक अनुभव वर्षे (Experience in Years)
                </label>
                <input
                  type="number"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                  min={0}
                  max={45}
                  className="w-full px-3.5 py-2.5 rounded border border-[var(--warm-gray-300)] focus:border-[var(--teal-deep)] focus:outline-none text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[var(--warm-gray-700)] mb-1">
                  पैसे जमा करण्यासाठी UPI ID (Payout UPI)
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="9730012341@ybl"
                  className="w-full px-3.5 py-2.5 rounded border border-[var(--warm-gray-300)] focus:border-[var(--teal-deep)] focus:outline-none text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[var(--warm-gray-700)] mb-1">
                  बँक खाते शेवटचे ४ अंक (Account Last 4)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={accountLast4}
                  onChange={(e) => setAccountLast4(e.target.value.replace(/\D/g, ""))}
                  placeholder="4321"
                  className="w-full px-3.5 py-2.5 rounded border border-[var(--warm-gray-300)] focus:border-[var(--teal-deep)] focus:outline-none text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[var(--warm-gray-700)] mb-1">
                  बँक IFSC कोड प्रिफिक्स (IFSC Prefix)
                </label>
                <input
                  type="text"
                  value={ifscPrefix}
                  onChange={(e) => setIfscPrefix(e.target.value.toUpperCase())}
                  placeholder="MAHB"
                  className="w-full px-3.5 py-2.5 rounded border border-[var(--warm-gray-300)] focus:border-[var(--teal-deep)] focus:outline-none text-sm font-mono uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[var(--warm-gray-700)] mb-2">
                कार्यक्षेत्र जिल्हे निवडा (Operating Districts in Maharashtra) *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {MAHARASHTRA_DISTRICTS.map((d) => {
                  const raw = d.split(" ")[0];
                  const selected = selectedDistricts.includes(raw);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDistrict(d)}
                      className={`p-2.5 rounded border text-xs font-semibold text-left transition-colors ${
                        selected
                          ? "bg-[var(--teal-deep)] text-white border-[var(--teal-deep)]"
                          : "bg-[var(--warm-gray-50)] text-[var(--warm-gray-800)] border-[var(--warm-gray-200)]"
                      }`}
                    >
                      {selected ? "✓ " : "+ "}
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!name || !licenseNumber}
                className="flex items-center gap-2 px-6 py-3 rounded font-bold text-white bg-[var(--teal-deep)] hover:bg-[#0b3836] disabled:opacity-50 text-sm shadow-sm"
              >
                <span>ट्रक तपशील भरा</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Truck Vehicle Specs */}
        {step === 2 && (
          <div className="bg-white p-6 sm:p-8 rounded border border-[var(--warm-gray-200)] shadow-sm space-y-6">
            <h2 className="text-lg font-bold border-b border-[var(--warm-gray-200)] pb-3">
              वाहनाची माहिती (Truck Vehicle Specs)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase text-[var(--warm-gray-700)] mb-1">
                  गाडी नंबर (Registration Plate MH-xx-AB-1234) *
                </label>
                <input
                  type="text"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                  placeholder="MH-48-AB-4021"
                  required
                  className="w-full px-3.5 py-2.5 rounded border border-[var(--warm-gray-300)] focus:border-[var(--teal-deep)] focus:outline-none text-base font-mono font-bold uppercase tracking-wider"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[var(--warm-gray-700)] mb-1">
                  बॉडी प्रकार (Body Type)
                </label>
                <select
                  value={bodyType}
                  onChange={(e) => setBodyType(e.target.value as "tarpaulin" | "closed_container" | "open" | "refrigerated")}
                  className="w-full px-3.5 py-2.5 rounded border border-[var(--warm-gray-300)] focus:border-[var(--teal-deep)] focus:outline-none text-sm font-semibold"
                >
                  <option value="tarpaulin">ताडपत्री कव्हर (Tarpaulin Closed)</option>
                  <option value="closed_container">पक्का कंटेनर (Closed Metal Container)</option>
                  <option value="open">खुला डल्ला (Open Body)</option>
                  <option value="refrigerated">शीतगृह / रेफ्रिजरेटेड (Reefer)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[var(--warm-gray-700)] mb-2">
                ट्रक प्रकार व क्षमता (Truck Category & Payload Capacity) *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TRUCK_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTruckType(t.id);
                      setCapacityKg(parseInt(t.capacity.replace(/\D/g, "")) || 1500);
                    }}
                    className={`p-4 rounded border text-left flex items-start gap-3 transition-colors ${
                      truckType === t.id
                        ? "border-2 border-[var(--teal-deep)] bg-emerald-50/40"
                        : "border-[var(--warm-gray-200)] hover:bg-[var(--warm-gray-50)]"
                    }`}
                  >
                    <Truck className={`w-6 h-6 mt-0.5 ${truckType === t.id ? "text-[var(--teal-deep)]" : "text-[var(--warm-gray-400)]"}`} />
                    <div>
                      <div className="font-bold text-sm text-[var(--ink)]">{t.label}</div>
                      <div className="text-xs text-[var(--warm-gray-500)] mt-0.5">कमाल क्षमता: {t.capacity}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-[var(--warm-gray-200)]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded font-bold text-[var(--warm-gray-700)] bg-[var(--warm-gray-100)] text-sm"
              >
                मागे (Back)
              </button>

              <button
                type="button"
                onClick={handleProfileSubmit}
                disabled={loading || !plateNumber}
                className="flex items-center gap-2 px-6 py-3 rounded font-bold text-white bg-[var(--teal-deep)] hover:bg-[#0b3836] disabled:opacity-50 text-sm shadow-sm"
              >
                {loading ? <RotateCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>नोंदणी जतन करा व पुढे जा</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Document Uploads */}
        {step === 3 && (
          <div className="bg-white p-6 sm:p-8 rounded border border-[var(--warm-gray-200)] shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold pb-1 font-[family-name:var(--font-display)]">
                कागदपत्रे अपलोड करा (Government Document Verification)
              </h2>
              <p className="text-xs text-[var(--warm-gray-700)]">
                शासकीय नियमांनुसार ड्रायव्हरची सुरक्षितता व मालवाहतूक परवाना तपासण्यासाठी खालील ४ कागदपत्रे आवश्यक आहेत.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { type: "driving_license", title: "१. ड्रायव्हिंग लायसन्स (DL)", desc: "चालकाचा वाहन चालवण्याचा वैध परवाना" },
                { type: "rc_book", title: "२. आरसी बुक (RC Book)", desc: "गाडी नोंदणी प्रमाणपत्र" },
                { type: "insurance", title: "३. गाडी इन्शुरन्स (Insurance Policy)", desc: "थर्ड पार्टी / कॉम्प्रिहेन्सिव्ह विमा" },
                { type: "puc", title: "४. पीयुसी सर्टिफिकेट (PUC)", desc: "प्रदूषण नियंत्रण प्रमाणपत्र" },
              ].map((doc) => {
                const isUploaded = uploadedDocs[doc.type];
                const isUploading = uploadingDoc === doc.type;

                return (
                  <div
                    key={doc.type}
                    className="p-4 rounded border border-[var(--warm-gray-300)] bg-[var(--warm-gray-50)] space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-sm text-[var(--ink)]">{doc.title}</div>
                        <div className="text-xs text-[var(--warm-gray-500)] mt-0.5">{doc.desc}</div>
                      </div>
                      {isUploaded ? (
                        <span className="truck-badge text-emerald-700 border-emerald-400 bg-emerald-50">
                          अपलोड झाले
                        </span>
                      ) : (
                        <span className="truck-badge text-amber-700 border-amber-400 bg-amber-50">
                          प्रतीक्षेत
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[var(--warm-gray-600)] mb-1">
                        कालबाह्यता दिनांक (Expiry Date):
                      </label>
                      <input
                        type="date"
                        value={docExpiries[doc.type] || ""}
                        onChange={(e) =>
                          setDocExpiries({ ...docExpiries, [doc.type]: e.target.value })
                        }
                        className="w-full px-2.5 py-1.5 rounded border border-[var(--warm-gray-300)] text-xs font-semibold focus:outline-none"
                      />
                    </div>

                    <div className="pt-1">
                      <label className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded border-2 border-dashed border-[var(--warm-gray-300)] hover:border-[var(--teal-deep)] hover:bg-white cursor-pointer transition-colors text-xs font-bold text-[var(--teal-deep)]">
                        {isUploading ? (
                          <>
                            <RotateCw className="w-4 h-4 animate-spin" />
                            <span>अपलोड होत आहे...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>{isUploaded ? "कागदपत्र बदला (Re-upload)" : "फाइल निवडा (PDF / JPG)"}</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept=".pdf,image/jpeg,image/png,image/webp"
                          className="hidden"
                          disabled={isUploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(doc.type, file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-teal-50 border border-teal-200 rounded flex items-start gap-3 text-xs text-[var(--teal-deep)]">
              <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">प्रशासक पडताळणी सूचना (Admin Review Notice):</p>
                <p className="mt-0.5">
                  कागदपत्रे अपलोड केल्यानंतर TruckTrust पडताळणी पथक २४ तासांत कागदपत्रे तपासून मंजुरी देईल. मंजुरी मिळाल्यावरच आपण भाडे स्वीकारू शकाल.
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-[var(--warm-gray-200)]">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded font-bold text-[var(--warm-gray-700)] bg-[var(--warm-gray-100)] text-sm"
              >
                मागे (Back)
              </button>

              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded font-bold text-white bg-[var(--teal-deep)] hover:bg-[#0b3836] text-sm shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>नोंदणी पूर्ण झाली • मुख्य पानावर जा</span>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
