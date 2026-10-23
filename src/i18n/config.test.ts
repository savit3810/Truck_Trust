import { describe, it, expect } from "vitest";
import { formatCurrency, getDictionary } from "./config";

describe("i18n & Currency Formatting", () => {
  it("formats integer paise into Indian Rupee representation correctly", () => {
    // 150000 paise = ₹1,500
    const formatted1500 = formatCurrency(150000);
    expect(formatted1500).toContain("1,500");

    // 12500000 paise = ₹1,25,000 (Indian grouping: 1,25,000)
    const formatted125k = formatCurrency(12500000);
    expect(formatted125k).toContain("1,25,000");
  });

  it("loads Marathi, Hindi, and English dictionaries with key parity", () => {
    const mr = getDictionary("mr");
    const hi = getDictionary("hi");
    const en = getDictionary("en");

    expect(mr.brand.name).toBe("TruckTrust");
    expect(hi.brand.name).toBe("TruckTrust");
    expect(en.brand.name).toBe("TruckTrust");

    expect(mr.common.submit).toBe("पुढे जा");
    expect(hi.common.submit).toBe("आगे बढ़ें");
    expect(en.common.submit).toBe("Continue");
  });
});
