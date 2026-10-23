import { describe, it, expect } from "vitest";
import { checkOtpRateLimit } from "./rate-limiter";

describe("OTP Rate Limiter", () => {
  it("allows initial request and enforces 30-second cooldown on immediate second request", () => {
    const testPhone = "9988776655";
    const first = checkOtpRateLimit(testPhone, "192.168.1.1");
    expect(first.allowed).toBe(true);

    const second = checkOtpRateLimit(testPhone, "192.168.1.1");
    expect(second.allowed).toBe(false);
    expect(second.reason).toBe("resend_cooldown");
    expect(second.retryAfterSeconds).toBeGreaterThan(0);
  });
});
