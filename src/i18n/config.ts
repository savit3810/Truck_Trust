import en from "@/messages/en.json";
import hi from "@/messages/hi.json";
import mr from "@/messages/mr.json";
import { APP_CONFIG, SupportedLocale } from "@/lib/config/brand";

export const messagesMap = {
  mr,
  hi,
  en,
} as const;

export function getDictionary(locale: SupportedLocale = APP_CONFIG.defaultLocale) {
  return messagesMap[locale] ?? messagesMap[APP_CONFIG.defaultLocale];
}

export function formatCurrency(amountPaise: number): string {
  const rupees = amountPaise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}
