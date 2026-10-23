import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Mukta } from "next/font/google";
import "./globals.css";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/config/brand";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { AccessibilityBar } from "@/components/ui/AccessibilityBar";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const mukta = Mukta({
  subsets: ["latin", "devanagari"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${BRAND_NAME} - ${BRAND_TAGLINE}`,
  description: "Rural Maharashtra freight network connecting verified truck drivers with local entrepreneurs for secure, tracked, and fair transport.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0A3331",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mr" className={`${bricolage.variable} ${mukta.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans bg-[var(--background)] text-[var(--foreground)] antialiased">
        <AccessibilityBar />
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}

