"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PhoneCall, MessageSquare, Sun, Type, WifiOff, Globe } from "lucide-react";
import { BRAND_NAME } from "@/lib/config/brand";

export function AccessibilityBar() {
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("normal");
  const [highContrast, setHighContrast] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [locale, setLocale] = useState<"mr" | "hi" | "en">("mr");

  useEffect(() => {
    // Check initial online status
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);

      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // Check stored preferences
      const storedContrast = localStorage.getItem("trucktrust_contrast");
      if (storedContrast === "high") {
        setHighContrast(true);
        document.documentElement.setAttribute("data-contrast", "high");
      }

      const storedFontSize = localStorage.getItem("trucktrust_font_size");
      if (storedFontSize === "large" || storedFontSize === "xlarge") {
        setFontSize(storedFontSize as any);
        document.documentElement.setAttribute("data-font-size", storedFontSize);
      }

      const storedLocale = localStorage.getItem("trucktrust_locale");
      if (storedLocale === "hi" || storedLocale === "en" || storedLocale === "mr") {
        setLocale(storedLocale);
      }

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  const toggleHighContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    if (next) {
      document.documentElement.setAttribute("data-contrast", "high");
      localStorage.setItem("trucktrust_contrast", "high");
    } else {
      document.documentElement.removeAttribute("data-contrast");
      localStorage.setItem("trucktrust_contrast", "normal");
    }
  };

  const cycleFontSize = () => {
    let next: "normal" | "large" | "xlarge" = "normal";
    if (fontSize === "normal") next = "large";
    else if (fontSize === "large") next = "xlarge";
    else next = "normal";

    setFontSize(next);
    if (next === "normal") {
      document.documentElement.removeAttribute("data-font-size");
    } else {
      document.documentElement.setAttribute("data-font-size", next);
    }
    localStorage.setItem("trucktrust_font_size", next);
  };

  const handleLocaleChange = (newLocale: "mr" | "hi" | "en") => {
    setLocale(newLocale);
    localStorage.setItem("trucktrust_locale", newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
  };

  return (
    <div className="bg-[var(--ink)] text-white text-[11px] py-1 px-3 sm:px-6 border-b border-[var(--warm-gray-800)] flex flex-wrap items-center justify-between gap-2 z-40">
      {/* Left: Offline or Rural Status */}
      <div className="flex items-center gap-3">
        {!isOnline ? (
          <span className="inline-flex items-center gap-1 text-amber-300 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600 animate-pulse">
            <WifiOff className="w-3 h-3" />
            <span>इंटरनेट बंद आहे (ऑफलाइन मसुदा सेव्ह राहील)</span>
          </span>
        ) : (
          <span className="text-[var(--cream)]/80 hidden sm:inline-flex items-center gap-1">
            <span>महाराष्ट्र ग्रामीण मालवाहतूक सहाय्यता केंद्र</span>
          </span>
        )}

        <a
          href="tel:+91800087825"
          className="inline-flex items-center gap-1 text-[var(--marigold)] font-bold hover:underline"
        >
          <PhoneCall className="w-3 h-3" />
          <span>१८०० ८७८२५</span>
        </a>

        <Link
          href="/whatsapp"
          className="inline-flex items-center gap-1 text-emerald-400 font-bold hover:underline"
        >
          <MessageSquare className="w-3 h-3" />
          <span>WhatsApp बुकिंग</span>
        </Link>
      </div>

      {/* Right: Accessibility & Language Controls */}
      <div className="flex items-center gap-2.5">
        {/* Language selector */}
        <div className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded border border-white/10">
          <Globe className="w-3 h-3 text-[var(--marigold)]" />
          <button
            onClick={() => handleLocaleChange("mr")}
            className={`px-1 rounded ${locale === "mr" ? "text-[var(--marigold)] font-bold" : "text-white/70 hover:text-white"}`}
          >
            मराठी
          </button>
          <span className="text-white/30">|</span>
          <button
            onClick={() => handleLocaleChange("hi")}
            className={`px-1 rounded ${locale === "hi" ? "text-[var(--marigold)] font-bold" : "text-white/70 hover:text-white"}`}
          >
            हिंदी
          </button>
          <span className="text-white/30">|</span>
          <button
            onClick={() => handleLocaleChange("en")}
            className={`px-1 rounded ${locale === "en" ? "text-[var(--marigold)] font-bold" : "text-white/70 hover:text-white"}`}
          >
            Eng
          </button>
        </div>

        {/* Text Size Toggle */}
        <button
          onClick={cycleFontSize}
          title="फॉन्ट आकार बदला (Change Font Size)"
          className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white font-bold inline-flex items-center gap-0.5"
        >
          <Type className="w-3 h-3 text-[var(--marigold)]" />
          <span>{fontSize === "normal" ? "अ" : fontSize === "large" ? "अ+" : "अ++"}</span>
        </button>

        {/* High Contrast Mode Toggle */}
        <button
          onClick={toggleHighContrast}
          title="उच्च कॉन्ट्रास्ट (High Contrast for Sunlight)"
          className={`px-2 py-0.5 rounded font-bold inline-flex items-center gap-1 transition-colors ${
            highContrast
              ? "bg-[var(--marigold)] text-black"
              : "bg-white/10 hover:bg-white/20 text-white"
          }`}
        >
          <Sun className="w-3 h-3" />
          <span className="hidden sm:inline">कॉन्ट्रास्ट</span>
        </button>
      </div>
    </div>
  );
}
