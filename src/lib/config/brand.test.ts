import { describe, it, expect } from "vitest";
import { BRAND_NAME, APP_CONFIG } from "./brand";

describe("Brand & Configuration Invariants", () => {
  it("should have BRAND_NAME defined as TruckTrust", () => {
    expect(BRAND_NAME).toBe("TruckTrust");
  });

  it("should support Marathi, Hindi, and English with Marathi as default", () => {
    expect(APP_CONFIG.supportedLocales).toContain("mr");
    expect(APP_CONFIG.supportedLocales).toContain("hi");
    expect(APP_CONFIG.supportedLocales).toContain("en");
    expect(APP_CONFIG.defaultLocale).toBe("mr");
  });

  it("should have Indian currency configuration", () => {
    expect(APP_CONFIG.currency.code).toBe("INR");
    expect(APP_CONFIG.currency.symbol).toBe("₹");
  });
});
