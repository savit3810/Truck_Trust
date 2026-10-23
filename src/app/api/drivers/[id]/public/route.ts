import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import { DriverModel } from "@/features/drivers/models/driver.model";
import { UserModel } from "@/features/auth/models/user.model";
import { TruckModel } from "@/features/trucks/models/truck.model";
import { DocumentModel } from "@/features/documents/models/document.model";

function maskLicenseNumber(license: string): string {
  if (!license || license.length <= 4) return "****";
  const start = license.slice(0, 5); // e.g. "MH-48"
  const end = license.slice(-4); // e.g. "9871"
  return `${start}-******${end}`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: driverId } = await params;
    await connectToDatabase();

    const driver = await DriverModel.findById(driverId).lean();
    if (!driver) {
      return NextResponse.json({ success: false, error: "Driver not found" }, { status: 404 });
    }

    const user = await UserModel.findById(driver.userId).select("name phone language createdAt").lean();
    const truck = await TruckModel.findOne({ driverId: driver._id }).lean();
    const approvedDocs = await DocumentModel.find({
      $or: [{ ownerId: driver._id }, ...(truck ? [{ ownerId: truck._id }] : [])],
      status: "approved",
    }).lean();

    const badges = [
      { id: "kyc_verified", label: "शासकीय KYC पडताळणीकृत", labelEn: "Government KYC Verified", icon: "shield" },
      { id: "active_insurance", label: "विमा संरक्षित (Insured)", labelEn: "Valid Commercial Insurance", icon: "file-check" },
      { id: "local_corridor", label: "स्थानिक मार्ग तज्ज्ञ", labelEn: "Maharashtra Corridor Specialist", icon: "map-pin" },
    ];

    if (driver.totalTripsCompleted >= 25) {
      badges.push({ id: "experienced_hauler", label: "अनुभवी चालक (२५+ ट्रिप्स)", labelEn: "Experienced Hauler (25+ Trips)", icon: "award" });
    }

    return NextResponse.json({
      success: true,
      driver: {
        id: driver._id.toString(),
        name: user?.name || "Verified Truck Driver",
        phoneMasked: user?.phone ? `+91 ${user.phone.slice(0, 3)}****${user.phone.slice(-3)}` : undefined,
        licenseMasked: maskLicenseNumber(driver.licenseNumber),
        experienceYears: driver.experienceYears,
        operatingDistricts: driver.operatingDistricts,
        kycStatus: driver.kycStatus,
        trustScore: driver.trustScore,
        trustBreakdown: {
          documentation: 25, // Max 25
          onTimeDelivery: Math.round((driver.onTimeRate / 100) * 35), // Max 35
          safetyAndRatings: 32, // Max 40
        },
        onTimeRate: driver.onTimeRate,
        totalTripsCompleted: driver.totalTripsCompleted,
        badges,
        truck: truck
          ? {
              registrationNumberMasked: `${truck.registrationNumber.slice(0, 6)}**${truck.registrationNumber.slice(-2)}`,
              truckType: truck.truckType,
              capacityKg: truck.capacityKg,
              bodyType: truck.bodyType,
              isAvailable: truck.isAvailable && driver.kycStatus === "verified",
            }
          : null,
        verifiedDocumentTypes: approvedDocs.map((d) => d.docType),
      },
    });
  } catch (error) {
    console.error("Error in /api/drivers/[id]/public:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
