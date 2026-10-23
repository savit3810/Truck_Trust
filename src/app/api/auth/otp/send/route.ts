import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db/connection";
import { OtpModel } from "@/features/auth/models/otp.model";
import { getSmsProvider } from "@/lib/providers/sms";
import { checkOtpRateLimit } from "@/lib/auth/rate-limiter";

const sendOtpSchema = z.object({
  phone: z
    .string()
    .trim()
    .transform((val) => val.replace(/\D/g, "").slice(-10))
    .pipe(z.string().length(10, "कृपया वैध १०-अंकी मोबाईल नंबर प्रविष्ट करा (Please enter a valid 10-digit mobile number)")),
  purpose: z.enum(["login", "delivery_proof"]).default("login"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = sendOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { phone, purpose } = parsed.data;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    const isNonProd = process.env.NODE_ENV !== "production";

    if (!isNonProd) {
      const rateLimit = checkOtpRateLimit(phone, ip);
      if (!rateLimit.allowed) {
        return NextResponse.json(
          {
            success: false,
            error:
              rateLimit.reason === "resend_cooldown"
                ? `Please wait ${rateLimit.retryAfterSeconds} seconds before requesting a new OTP.`
                : "Too many requests. Please try again later.",
            retryAfterSeconds: rateLimit.retryAfterSeconds,
          },
          { status: 429 }
        );
      }
    }

    await connectToDatabase();

    // Generate cryptographically secure 6-digit numeric OTP
    const rawNumber = crypto.randomInt(100000, 999999);
    const otp = rawNumber.toString();

    // Hash with bcrypt before storing in database
    const salt = await bcrypt.genSalt(10);
    const codeHash = await bcrypt.hash(otp, salt);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Upsert OTP record for this phone & purpose
    await OtpModel.findOneAndUpdate(
      { phone, purpose },
      {
        codeHash,
        attempts: 0,
        expiresAt,
      },
      { upsert: true, new: true }
    );

    // Send OTP via configured SMS Provider (DevConsole logs to terminal in non-production)
    await getSmsProvider().sendOtp(phone, otp, purpose);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      expiresInSeconds: 600,
      devOtp: isNonProd ? otp : undefined,
    });
  } catch (error) {
    console.error("Error in /api/auth/otp/send:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error occurred" },
      { status: 500 }
    );
  }
}
