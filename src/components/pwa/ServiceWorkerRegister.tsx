"use client";

import { useEffect, useState } from "react";
import { Download, CheckCircle2, X } from "lucide-react";
import { BRAND_NAME } from "@/lib/config/brand";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function ServiceWorkerRegister() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker in production or supporting browsers
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log(`[${BRAND_NAME}] Service Worker registered:`, reg.scope);
        })
        .catch((err) => {
          console.warn(`[${BRAND_NAME}] Service Worker registration failed:`, err);
        });
    }

    // 2. Listen for PWA install event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setIsInstalled(true);
    }
    setInstallPrompt(null);
  };

  if (!installPrompt || dismissed || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 bg-[var(--teal-deep)] text-white p-4 rounded-xl shadow-2xl border border-[var(--marigold)]/30 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--marigold)] text-[var(--teal-deep)] flex items-center justify-center font-black">
          TT
        </div>
        <div>
          <h4 className="text-sm font-bold leading-tight">
            {BRAND_NAME} ॲप इन्स्टॉल करा
          </h4>
          <p className="text-xs text-[var(--cream)]/80">
            ग्रामीण भागात ऑफलाइन व जलद वापरासाठी
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleInstallClick}
          className="px-3 py-1.5 rounded-lg bg-[var(--marigold)] text-[var(--teal-deep)] text-xs font-bold hover:brightness-105 active:scale-95 transition-all flex items-center gap-1"
        >
          <Download className="w-3.5 h-3.5" />
          इन्स्टॉल
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1.5 text-white/60 hover:text-white"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
