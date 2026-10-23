import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import { DriverModel } from "@/features/drivers/models/driver.model";
import { UserModel } from "@/features/auth/models/user.model";
import { TruckModel } from "@/features/trucks/models/truck.model";
import { DocumentModel } from "@/features/documents/models/document.model";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !["admin", "support"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Access denied: Admin permissions required." }, { status: 403 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending";

    const query: Record<string, unknown> = {};
    if (status !== "all") {
      query.kycStatus = status;
    }

    const drivers = await DriverModel.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const populatedDrivers = await Promise.all(
      drivers.map(async (drv) => {
        const user = await UserModel.findById(drv.userId).select("name phone language createdAt").lean();
        const truck = await TruckModel.findOne({ driverId: drv._id }).lean();
        
        const driverDocs = await DocumentModel.find({ ownerId: drv._id }).lean();
        const truckDocs = truck ? await DocumentModel.find({ ownerId: truck._id }).lean() : [];

        return {
          id: drv._id.toString(),
          user: user
            ? {
                id: user._id.toString(),
                name: user.name,
                phone: user.phone,
                language: user.language,
                registeredAt: user.createdAt,
              }
            : null,
          licenseNumber: drv.licenseNumber,
          experienceYears: drv.experienceYears,
          operatingDistricts: drv.operatingDistricts,
          kycStatus: drv.kycStatus,
          trustScore: drv.trustScore,
          onTimeRate: drv.onTimeRate,
          totalTripsCompleted: drv.totalTripsCompleted,
          bankDetails: drv.bankDetails,
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
          documents: [...driverDocs, ...truckDocs].map((d) => ({
            id: d._id.toString(),
            docType: d.docType,
            fileUrl: d.fileUrl,
            originalFilename: d.originalFilename,
            status: d.status,
            expiryDate: d.expiryDate,
            rejectionReason: d.rejectionReason,
          })),
        };
      })
    );

    return NextResponse.json({
      success: true,
      count: populatedDrivers.length,
      drivers: populatedDrivers,
    });
  } catch (error) {
    console.error("Error in /api/admin/verifications:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
