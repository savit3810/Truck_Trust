// Single source of truth for branding throughout the application
export const BRAND_NAME = "TruckTrust";
export const BRAND_TAGLINE = "Maharashtra's Verified Rural Freight Network";
export const BRAND_TAGLINE_MR = "महाराष्ट्राचे विश्वासू ग्रामीण मालवाहतूक नेटवर्क";
export const BRAND_TAGLINE_HI = "महाराष्ट्र का विश्वसनीय ग्रामीण माल ढुलाई नेटवर्क";

export const APP_CONFIG = {
  brandName: BRAND_NAME,
  defaultLocale: "mr" as const,
  supportedLocales: ["mr", "hi", "en"] as const,
  currency: {
    code: "INR",
    symbol: "₹",
    locale: "en-IN",
  },
  support: {
    phone: "+91 8000 87825", // 8000 TRUCK
    whatsapp: "+91 98200 98200",
    email: "sahayata@trucktrust.in",
    operatingHours: "6:00 AM - 10:00 PM IST (Daily)",
    headquarters: "Pune / Palghar, Maharashtra",
  },
  defaults: {
    countryCode: "+91",
    state: "Maharashtra",
    mapCenter: {
      lat: 19.6967, // Palghar / Nashik transport corridor
      lng: 72.7699,
      zoom: 9,
    },
    platformFeePercent: 7.5, // 7.5% platform commission
  },
} as const;

export type SupportedLocale = (typeof APP_CONFIG.supportedLocales)[number];
