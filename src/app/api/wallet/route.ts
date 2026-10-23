import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import { WalletModel } from "@/features/ledger/models/wallet.model";
import { DriverModel } from "@/features/drivers/models/driver.model";
import { LedgerEntryModel } from "@/features/ledger/models/ledger-entry.model";
import { calculateLedgerAccountBalance } from "@/features/ledger/ledger-engine";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const driver = await DriverModel.findOne({ userId: session.userId });
    if (!driver && session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "केवळ चालकांसाठी पाकीट उपलब्ध आहे (Wallet is only available for drivers)" },
        { status: 403 }
      );
    }

    const driverId = driver ? driver._id.toString() : session.userId;

    // Retrieve or initialize wallet
    let wallet = await WalletModel.findOne({ userId: session.userId });
    if (!wallet) {
      wallet = await WalletModel.create({
        userId: session.userId,
        balancePaise: 0,
        escrowBalancePaise: 0,
        totalEarnedPaise: 0,
        totalWithdrawnPaise: 0,
      });
    }

    // Ledger audit: calculate live balance from immutable double-entry ledger entries
    const liveLedgerBalancePaise = await calculateLedgerAccountBalance(`driver:${driverId}:available`);

    // Fetch passbook history (latest 25 transactions)
    const transactions = await LedgerEntryModel.find({
      $or: [
        { creditAccount: `driver:${driverId}:available` },
        { debitAccount: `driver:${driverId}:available` },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(25)
      .lean();

    return NextResponse.json({
      success: true,
      wallet: {
        balancePaise: wallet.balancePaise,
        ledgerVerifiedBalancePaise: Math.max(0, liveLedgerBalancePaise),
        escrowBalancePaise: wallet.escrowBalancePaise,
        totalEarnedPaise: wallet.totalEarnedPaise,
        totalWithdrawnPaise: wallet.totalWithdrawnPaise,
        upiId: wallet.upiId,
        bankAccount: wallet.bankAccount,
      },
      transactions: transactions.map((t) => ({
        id: t._id.toString(),
        type: t.type,
        isCredit: t.creditAccount === `driver:${driverId}:available`,
        amountPaise: t.amountPaise,
        description: t.description,
        timestamp: t.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error in /api/wallet:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to fetch wallet" },
      { status: 500 }
    );
  }
}
