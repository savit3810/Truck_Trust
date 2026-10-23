import crypto from "crypto";
import bcrypt from "bcryptjs";
import QRCode from "qrcode";

export interface DeliveryProofGenerationResult {
  otp: string;
  otpHash: string;
  qrCodeToken: string;
  qrCodeDataUrl: string;
}

/**
 * Generates receiver delivery verification secrets:
 * 1. 6-digit Delivery OTP (hashed with bcrypt for database storage)
 * 2. High-entropy QR token for direct camera scanner verification
 * 3. Pre-rendered QR code Data URL containing cryptographic verification payload
 */
export async function generateDeliveryProofSecrets(
  bookingNumber: string
): Promise<DeliveryProofGenerationResult> {
  // 1. Generate 6-digit numeric OTP
  const otpNumber = crypto.randomInt(100000, 999999);
  const otp = otpNumber.toString();
  const otpHash = await bcrypt.hash(otp, 10);

  // 2. Generate random high-entropy token for QR scanner
  const qrCodeToken = `tt_dlv_${crypto.randomBytes(16).toString("hex")}`;

  // 3. Payload for QR Scanner
  const qrPayload = JSON.stringify({
    b: bookingNumber,
    t: qrCodeToken,
    iat: Math.floor(Date.now() / 1000),
  });

  const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
    width: 280,
    margin: 2,
    color: {
      dark: "#0F4C4A", // TruckTrust Deep Teal
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "M",
  });

  return {
    otp,
    otpHash,
    qrCodeToken,
    qrCodeDataUrl,
  };
}

/**
 * Validates delivery proof via either 6-digit OTP or scanned QR Token
 */
export async function verifyDeliveryProofSecret(params: {
  inputOtp?: string;
  inputQrToken?: string;
  expectedOtpHash?: string;
  expectedQrToken?: string;
}): Promise<{ valid: boolean; method?: "otp" | "qr" }> {
  const { inputOtp, inputQrToken, expectedOtpHash, expectedQrToken } = params;

  // Check QR Token first if provided
  if (inputQrToken && expectedQrToken) {
    const a = Buffer.from(inputQrToken);
    const b = Buffer.from(expectedQrToken);
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
      return { valid: true, method: "qr" };
    }
  }

  // Check 6-digit OTP
  if (inputOtp && expectedOtpHash) {
    const isMatch = await bcrypt.compare(inputOtp.trim(), expectedOtpHash);
    if (isMatch) {
      return { valid: true, method: "otp" };
    }
  }

  return { valid: false };
}
