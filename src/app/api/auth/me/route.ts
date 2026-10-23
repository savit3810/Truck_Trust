import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import { UserModel } from "@/features/auth/models/user.model";
import { DriverModel } from "@/features/drivers/models/driver.model";
import { WalletModel } from "@/features/ledger/models/wallet.model";
import { TruckModel } from "@/features/trucks/models/truck.model";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    await connectToDatabase();
    const user = await UserModel.findById(session.userId).lean();
    if (!user || !user.isActive) {
      return NextResponse.json({ authenticated: false, error: "User not found or deactivated" }, { status: 401 });
    }

    let driverProfile = null;
    let wallet = null;
    let truck = null;

    if (user.role === "driver") {
      driverProfile = await DriverModel.findOne({ userId: user._id }).lean();
      wallet = await WalletModel.findOne({ userId: user._id }).lean();
      if (driverProfile) {
        truck = await TruckModel.findOne({ driverId: driverProfile._id, isAvailable: true }).lean();
      }
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user._id.toString(),
        phone: user.phone,
        name: user.name,
        role: user.role,
        language: user.language,
        district: user.district,
        village: user.village,
        businessType: user.businessType,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
      driver: driverProfile,
      truck: truck
        ? {
            id: truck._id.toString(),
            registrationNumber: truck.registrationNumber,
            truckType: truck.truckType,
            capacityKg: truck.capacityKg,
            bodyType: truck.bodyType,
            isAvailable: truck.isAvailable,
          }
        : null,
      wallet: wallet
        ? {
            balancePaise: wallet.balancePaise,
            escrowBalancePaise: wallet.escrowBalancePaise,
          }
        : null,
    });
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json({ authenticated: false, error: "Internal server error" }, { status: 500 });
  }
}
