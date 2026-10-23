import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import { DriverModel } from "@/features/drivers/models/driver.model";
import { WalletModel } from "@/features/ledger/models/wallet.model";
import { executeDriverPayout } from "@/features/ledger/ledger-engine";
import { getPaymentProvider } from "@/lib/providers/payment";

const payoutSchema = z.object({
  amountPaise: z
    .number()
    .int()
    .min(50000, "किमान पैसे काढण्याची रक्कम ₹५०० (५०,००० पैसे) आहे (Minimum withdrawal is ₹500)"),
  accountType: z.enum(["vpa", "bank_account"]).default("vpa"),
  upiId: z
    .string()
    .trim()
    .regex(/^[\w.-]+@[\w.-]+$/, "कृपया वैध UPI ID प्रविष्ट करा (e.g. 9822110001@upi)")
    .optional(),
  bankAccount: z
    .object({
      accountNumber: z.string().trim().min(8, "Valid account number is required"),
      ifsc: z.string().trim().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Valid IFSC is required"),
      accountHolderName: z.string().trim().min(2, "Account holder name is required"),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = payoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid payout request" },
        { status: 400 }
      );
    }

    const { amountPaise, accountType, upiId, bankAccount } = parsed.data;

    if (accountType === "vpa" && !upiId) {
      return NextResponse.json(
        { success: false, error: "UPI ID प्रविष्ट करणे आवश्यक आहे (UPI ID is required)" },
        { status: 400 }
      );
    }

    if (accountType === "bank_account" && !bankAccount) {
      return NextResponse.json(
        { success: false, error: "बँक खात्याचा तपशील आवश्यक आहे (Bank account details required)" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const driver = await DriverModel.findOne({ userId: session.userId });
    if (!driver && session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "केवळ चालकांसाठी पैसे काढणे उपलब्ध आहे (Only drivers can request payouts)" },
        { status: 403 }
      );
    }

    const destinationDesc =
      accountType === "vpa"
        ? `UPI (${upiId})`
        : `Bank (${bankAccount?.accountNumber.slice(-4)} - ${bankAccount?.ifsc})`;

    // 1. Invoke Payment Provider Payout
    const provider = getPaymentProvider();
    const payoutResult = await provider.createPayout({
      driverId: driver ? driver._id.toString() : session.userId,
      amountPaise,
      accountType,
      vpaAddress: upiId,
      bankAccount,
      narration: `TruckTrust driver payout for ${session.phone}`,
    });

    // 2. Atomically debit double-entry ledger & driver wallet
    const execution = await executeDriverPayout({
      driverUserId: session.userId,
      amountPaise,
      payoutReference: payoutResult.referenceId,
      destination: destinationDesc,
    });

    // 3. Save preferred destination in Wallet for convenience
    const updateFields: Record<string, unknown> = {};
    if (upiId) updateFields.upiId = upiId;
    if (bankAccount) updateFields.bankAccount = bankAccount;
    if (Object.keys(updateFields).length > 0) {
      await WalletModel.updateOne({ userId: session.userId }, { $set: updateFields });
    }

    return NextResponse.json({
      success: true,
      message: `₹${(amountPaise / 100).toFixed(0)} तात्काळ ट्रान्सफर प्रक्रिया यशस्वी (Payout initiated successfully)`,
      amountPaise: execution.amountPaise,
      newBalancePaise: execution.newBalancePaise,
      referenceId: payoutResult.referenceId,
      payoutId: payoutResult.payoutId,
    });
  } catch (error) {
    console.error("Error in /api/wallet/payout:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Payout request failed" },
      { status: 400 }
    );
  }
}
