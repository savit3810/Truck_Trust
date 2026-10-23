"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BRAND_NAME } from "@/lib/config/brand";
import {
  Wallet,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  ArrowLeft,
  ShieldCheck,
  Building2,
  Smartphone,
  Info,
} from "lucide-react";

interface WalletData {
  balancePaise: number;
  ledgerVerifiedBalancePaise: number;
  escrowBalancePaise: number;
  totalEarnedPaise: number;
  totalWithdrawnPaise: number;
  upiId?: string;
  bankAccount?: {
    accountNumber: string;
    ifsc: string;
    accountHolderName: string;
  };
}

interface TransactionItem {
  id: string;
  type: string;
  isCredit: boolean;
  amountPaise: number;
  description: string;
  timestamp: string;
}

export default function DriverWalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payout Modal State
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmountRs, setPayoutAmountRs] = useState("500");
  const [accountType, setAccountType] = useState<"vpa" | "bank_account">("vpa");
  const [upiId, setUpiId] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [holderName, setHolderName] = useState("");
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState<string | null>(null);

  const refreshWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/wallet");
      const data = await res.json();
      if (data.success) {
        setWallet(data.wallet);
        setTransactions(data.transactions || []);
        if (data.wallet.upiId) setUpiId(data.wallet.upiId);
        if (data.wallet.bankAccount) {
          setAccountNumber(data.wallet.bankAccount.accountNumber || "");
          setIfsc(data.wallet.bankAccount.ifsc || "");
          setHolderName(data.wallet.bankAccount.accountHolderName || "");
        }
      } else {
        setError(data.error || "पाकीट माहिती मिळवण्यात अडचण आली");
      }
    } catch {
      setError("नेटवर्क त्रुटी (Network error)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/wallet");
        const data = await res.json();
        if (ignore) return;
        if (data.success) {
          setWallet(data.wallet);
          setTransactions(data.transactions || []);
          if (data.wallet.upiId) setUpiId(data.wallet.upiId);
          if (data.wallet.bankAccount) {
            setAccountNumber(data.wallet.bankAccount.accountNumber || "");
            setIfsc(data.wallet.bankAccount.ifsc || "");
            setHolderName(data.wallet.bankAccount.accountHolderName || "");
          }
        } else {
          setError(data.error || "पाकीट माहिती मिळवण्यात अडचण आली");
        }
      } catch {
        if (!ignore) setError("नेटवर्क त्रुटी (Network error)");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutLoading(true);
    setError(null);
    setPayoutSuccess(null);

    const amountPaise = Math.round(parseFloat(payoutAmountRs) * 100);

    if (isNaN(amountPaise) || amountPaise < 50000) {
      setError("किमान पैसे काढण्याची रक्कम ₹५०० आहे (Minimum withdrawal is ₹500)");
      setPayoutLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/wallet/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountPaise,
          accountType,
          upiId: accountType === "vpa" ? upiId : undefined,
          bankAccount:
            accountType === "bank_account"
              ? {
                  accountNumber,
                  ifsc: ifsc.toUpperCase(),
                  accountHolderName: holderName,
                }
              : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "पैसे काढणे अयशस्वी");
      } else {
        setPayoutSuccess(data.message);
        setShowPayoutModal(false);
        refreshWallet();
      }
    } catch {
      setError("ट्रान्सफर विनंती पाठवताना त्रुटी आली");
    } finally {
      setPayoutLoading(false);
    }
  };

  const formatRs = (paise: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(paise / 100);
  };

  return (
    <div className="min-h-screen bg-[var(--cream-warm)] text-[var(--ink)]">
      {/* Top Navbar */}
      <header className="border-b border-[var(--warm-gray-200)] bg-white sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/driver/jobs"
              className="p-1.5 rounded hover:bg-[var(--warm-gray-100)] text-[var(--warm-gray-600)]"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <span className="font-[family-name:var(--font-display)] font-extrabold text-lg text-[var(--teal-deep)] tracking-tight">
                {BRAND_NAME}
              </span>
              <span className="text-xs text-[var(--warm-gray-500)] ml-2">
                चालक पाकीट व पासबुक (Driver Wallet & Passbook)
              </span>
            </div>
          </div>

          <button
            onClick={refreshWallet}
            className="flex items-center gap-1.5 text-xs font-bold text-[var(--teal-deep)] hover:underline"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>रिफ्रेश</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {payoutSuccess && (
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{payoutSuccess}</span>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-xs font-bold text-[var(--warm-gray-500)] flex items-center justify-center gap-2">
            <RotateCw className="w-4 h-4 animate-spin text-[var(--teal-deep)]" />
            <span>पाकीट तपशील लोड होत आहेत...</span>
          </div>
        ) : wallet ? (
          <>
            {/* Wallet Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Primary Available Balance Card */}
              <div className="bg-[var(--teal-deep)] text-white p-5 rounded-xl shadow-md space-y-3 sm:col-span-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-100 flex items-center gap-1.5">
                    <Wallet className="w-4 h-4" />
                    उपलब्ध शिल्लक (Available Balance)
                  </span>
                  <span className="text-[10px] bg-emerald-700/60 px-2 py-0.5 rounded font-mono">
                    लेजर सत्यापित
                  </span>
                </div>

                <div className="text-3xl font-extrabold tracking-tight font-mono">
                  {formatRs(wallet.balancePaise)}
                </div>

                <button
                  type="button"
                  onClick={() => setShowPayoutModal(true)}
                  disabled={wallet.balancePaise < 50000}
                  className="w-full mt-2 py-2.5 px-4 bg-[var(--marigold-deep)] hover:bg-[#d09112] disabled:opacity-50 text-[var(--ink)] font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>पैसे खात्यात जमा करा (Withdraw to UPI)</span>
                </button>

                {wallet.balancePaise < 50000 && (
                  <p className="text-[10px] text-emerald-200 text-center">
                    * किमान पैसे काढण्याची रक्कम ₹५०० आहे
                  </p>
                )}
              </div>

              {/* In-Transit Escrow Hold */}
              <div className="bg-white p-5 rounded-xl border border-[var(--warm-gray-200)] shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--warm-gray-600)] flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    प्रवासात असलेली रक्कम (In-Transit Escrow)
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-[var(--ink)]">
                  {formatRs(wallet.escrowBalancePaise)}
                </div>
                <p className="text-[11px] text-[var(--warm-gray-500)] leading-relaxed">
                  माल सुखरूप पोहोचवून ग्राहकाने ओटीपी दिल्यानंतर ही रक्कम त्वरित उपलब्ध खात्यात जमा होते.
                </p>
              </div>

              {/* Lifetime Earnings */}
              <div className="bg-white p-5 rounded-xl border border-[var(--warm-gray-200)] shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--warm-gray-600)] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    एकूण कमाई (Total Lifetime Earned)
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-700">
                  {formatRs(wallet.totalEarnedPaise)}
                </div>
                <p className="text-[11px] text-[var(--warm-gray-500)]">
                  एकूण काढलेले: <span className="font-mono font-bold">{formatRs(wallet.totalWithdrawnPaise)}</span>
                </p>
              </div>
            </div>

            {/* Passbook / Ledger Entries Table */}
            <div className="bg-white rounded-xl border border-[var(--warm-gray-200)] shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[var(--warm-gray-200)] flex items-center justify-between">
                <h3 className="font-bold text-sm font-[family-name:var(--font-display)] flex items-center gap-2">
                  <span>खाते पासबुक (Double-Entry Passbook)</span>
                  <span className="text-xs font-normal text-[var(--warm-gray-500)]">
                    (प्रत्येक पैशाचा पारदर्शक हिशोब)
                  </span>
                </h3>
                <span className="text-xs font-mono text-[var(--warm-gray-500)]">
                  {transactions.length} नोंदी
                </span>
              </div>

              {transactions.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--warm-gray-500)]">
                  अद्याप कोणतेही व्यवहार झालेले नाहीत (No transaction records found)
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[var(--warm-gray-50)] text-[var(--warm-gray-600)] border-b border-[var(--warm-gray-200)] uppercase font-semibold text-[10px]">
                      <tr>
                        <th className="py-2.5 px-4">दिनांक (Date)</th>
                        <th className="py-2.5 px-4">तपशील (Description)</th>
                        <th className="py-2.5 px-4">प्रकार (Type)</th>
                        <th className="py-2.5 px-4 text-right">रक्कम (Amount)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--warm-gray-100)]">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-[var(--warm-gray-50)]">
                          <td className="py-3 px-4 font-mono text-[11px] text-[var(--warm-gray-600)] whitespace-nowrap">
                            {new Date(tx.timestamp).toLocaleString("mr-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-3 px-4 text-[var(--ink)] font-medium">
                            {tx.description}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                tx.isCredit
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {tx.isCredit ? "जमा (CREDIT)" : "नावे (DEBIT)"}
                            </span>
                          </td>
                          <td
                            className={`py-3 px-4 text-right font-mono font-bold text-sm whitespace-nowrap ${
                              tx.isCredit ? "text-emerald-700" : "text-red-700"
                            }`}
                          >
                            {tx.isCredit ? "+ " : "- "}
                            {formatRs(tx.amountPaise)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : null}
      </main>

      {/* Instant Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[var(--teal-deep)] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4" />
                <span>तात्काळ पैसे ट्रान्सफर (Instant Withdrawal)</span>
              </h3>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="text-white/80 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleWithdraw} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[var(--warm-gray-700)] mb-1">
                  काढावयाची रक्कम (Amount in Rupees) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-sm text-[var(--warm-gray-500)]">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="500"
                    step="50"
                    value={payoutAmountRs}
                    onChange={(e) => setPayoutAmountRs(e.target.value)}
                    required
                    className="w-full pl-8 pr-3.5 py-2 rounded border border-[var(--warm-gray-300)] font-mono font-bold text-sm focus:border-[var(--teal-deep)] focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-[var(--warm-gray-500)] mt-1 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  किमान ₹५०० • शिल्लक: {wallet ? formatRs(wallet.balancePaise) : ""}
                </p>
              </div>

              {/* Destination Mode */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setAccountType("vpa")}
                  className={`p-2.5 rounded border text-xs font-bold flex items-center justify-center gap-1.5 ${
                    accountType === "vpa"
                      ? "border-2 border-[var(--teal-deep)] bg-emerald-50 text-[var(--teal-deep)]"
                      : "border-[var(--warm-gray-200)] text-[var(--warm-gray-600)]"
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>UPI ID</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType("bank_account")}
                  className={`p-2.5 rounded border text-xs font-bold flex items-center justify-center gap-1.5 ${
                    accountType === "bank_account"
                      ? "border-2 border-[var(--teal-deep)] bg-emerald-50 text-[var(--teal-deep)]"
                      : "border-[var(--warm-gray-200)] text-[var(--warm-gray-600)]"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>बँक खाते (Bank)</span>
                </button>
              </div>

              {/* UPI Input */}
              {accountType === "vpa" ? (
                <div>
                  <label className="block text-xs font-bold uppercase text-[var(--warm-gray-700)] mb-1">
                    तुमचा UPI ID *
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="उदा. 9822110001@upi किंवा gpay"
                    required
                    className="w-full px-3.5 py-2 rounded border border-[var(--warm-gray-300)] text-xs font-mono font-semibold focus:border-[var(--teal-deep)] focus:outline-none"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[var(--warm-gray-700)] mb-1">
                      खातेदाराचे नाव (Account Holder Name) *
                    </label>
                    <input
                      type="text"
                      value={holderName}
                      onChange={(e) => setHolderName(e.target.value)}
                      placeholder="उदा. संतोष जाधव"
                      required
                      className="w-full px-3.5 py-2 rounded border border-[var(--warm-gray-300)] text-xs font-semibold focus:border-[var(--teal-deep)] focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold uppercase text-[var(--warm-gray-700)] mb-1">
                        खाते क्रमांक (A/C No.) *
                      </label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="1234567890"
                        required
                        className="w-full px-3.5 py-2 rounded border border-[var(--warm-gray-300)] text-xs font-mono font-semibold focus:border-[var(--teal-deep)] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-[var(--warm-gray-700)] mb-1">
                        IFSC कोड *
                      </label>
                      <input
                        type="text"
                        value={ifsc}
                        onChange={(e) => setIfsc(e.target.value)}
                        placeholder="MAHB0000123"
                        required
                        className="w-full px-3.5 py-2 rounded border border-[var(--warm-gray-300)] text-xs font-mono font-semibold uppercase focus:border-[var(--teal-deep)] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--warm-gray-200)]">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="px-4 py-2 rounded border border-[var(--warm-gray-300)] text-xs font-bold text-[var(--warm-gray-700)]"
                >
                  रद्द करा (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={payoutLoading}
                  className="px-5 py-2 rounded bg-[var(--teal-deep)] hover:bg-[#0b3836] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  {payoutLoading && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>पैसे पाठवा (Confirm Payout)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
