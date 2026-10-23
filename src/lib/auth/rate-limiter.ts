interface RateLimitEntry {
  count: number;
  lastAttemptAt: number;
  resetAt: number;
}

const phoneLimits = new Map<string, RateLimitEntry>();
const ipLimits = new Map<string, RateLimitEntry>();

const COOLDOWN_MS = 30 * 1000; // 30 seconds between resends
const MAX_ATTEMPTS_PER_WINDOW = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour window

export function checkOtpRateLimit(phone: string, ip: string = "127.0.0.1"): { allowed: boolean; reason?: string; retryAfterSeconds?: number } {
  const now = Date.now();

  // Check phone cooldown
  const phoneEntry = phoneLimits.get(phone);
  if (phoneEntry) {
    if (now < phoneEntry.lastAttemptAt + COOLDOWN_MS) {
      const waitSeconds = Math.ceil((phoneEntry.lastAttemptAt + COOLDOWN_MS - now) / 1000);
      return { allowed: false, reason: "resend_cooldown", retryAfterSeconds: waitSeconds };
    }

    if (now > phoneEntry.resetAt) {
      phoneLimits.set(phone, { count: 1, lastAttemptAt: now, resetAt: now + WINDOW_MS });
    } else {
      if (phoneEntry.count >= MAX_ATTEMPTS_PER_WINDOW) {
        const waitMinutes = Math.ceil((phoneEntry.resetAt - now) / 60000);
        return { allowed: false, reason: "hourly_limit_exceeded", retryAfterSeconds: waitMinutes * 60 };
      }
      phoneEntry.count += 1;
      phoneEntry.lastAttemptAt = now;
    }
  } else {
    phoneLimits.set(phone, { count: 1, lastAttemptAt: now, resetAt: now + WINDOW_MS });
  }

  // Check IP limits
  const ipEntry = ipLimits.get(ip);
  if (ipEntry) {
    if (now > ipEntry.resetAt) {
      ipLimits.set(ip, { count: 1, lastAttemptAt: now, resetAt: now + WINDOW_MS });
    } else {
      if (ipEntry.count >= 20) {
        return { allowed: false, reason: "ip_rate_limit_exceeded", retryAfterSeconds: 300 };
      }
      ipEntry.count += 1;
      ipEntry.lastAttemptAt = now;
    }
  } else {
    ipLimits.set(ip, { count: 1, lastAttemptAt: now, resetAt: now + WINDOW_MS });
  }

  return { allowed: true };
}
