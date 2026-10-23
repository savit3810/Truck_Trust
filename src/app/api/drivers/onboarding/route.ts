import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import { UserModel } from "@/features/auth/models/user.model";
import { DriverModel } from "@/features/drivers/models/driver.model";
import { TruckModel } from "@/features/trucks/models/truck.model";
import { WalletModel } from "@/features/ledger/models/wallet.model";

const driverOnboardingSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters"),
  licenseNumber: z
    .string()
    .trim()
    .min(8, "License number must be at least 8 characters")
    .toUpperCase(),
  experienceYears: z.coerce.number().min(0, "Experience cannot be negative").max(50),
  operatingDistricts: z
    .array(z.string().trim())
    .min(1, "Please select at least one operating district"),
  bankDetails: z.object({
    upiId: z.string().trim().min(3, "Valid UPI ID required").optional(),
    accountLast4: z.string().trim().length(4, "Enter last 4 digits of account").optional(),
    ifscPrefix: z.string().trim().min(4, "Enter bank IFSC code prefix").optional(),
  }),
  truck: z.object({
    registrationNumber: z
      .string()
      .trim()
      .regex(/^MH-\d{2}-[A-Z]{1,2}-\d{4}$/, "Vehicle plate must match Maharashtra format (e.g. MH-48-AB-1234)")
      .toUpperCase(),
    truckType: z.enum(["tata_ace", "pickup", "truck_14ft", "truck_17ft", "truck_20ft", "truck_32ft"]),
    capacityKg: z.coerce.number().min(300, "Capacity must be at least 300 kg"),
    bodyType: z.enum(["open", "closed_container", "tarpaulin", "refrigerated"]).default("tarpaulin"),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized. Please login first." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = driverOnboardingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    await connectToDatabase();

    // 1. Update primary User profile
    await UserModel.findByIdAndUpdate(session.userId, {
      name: data.name,
      role: "driver",
    });

    // 2. Upsert Driver Record
    const driver = await DriverModel.findOneAndUpdate(
      { userId: session.userId },
      {
        userId: session.userId,
        licenseNumber: data.licenseNumber,
        experienceYears: data.experienceYears,
        operatingDistricts: data.operatingDistricts,
        kycStatus: "pending", // Driver requires document upload & admin verification
        bankDetails: data.bankDetails,
      },
      { upsert: true, returnDocument: "after" }
    );

    // 3. Upsert Truck Record
    const truck = await TruckModel.findOneAndUpdate(
      { registrationNumber: data.truck.registrationNumber },
      {
        driverId: driver._id,
        registrationNumber: data.truck.registrationNumber,
        truckType: data.truck.truckType,
        capacityKg: data.truck.capacityKg,
        bodyType: data.truck.bodyType,
        isAvailable: false, // Inactive until KYC is verified
      },
      { upsert: true, returnDocument: "after" }
    );

    // 4. Ensure Wallet exists for driver
    await WalletModel.findOneAndUpdate(
      { userId: session.userId },
      {
        userId: session.userId,
        currency: "INR",
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Driver and truck profile registered successfully",
      driver: {
        id: driver._id.toString(),
        licenseNumber: driver.licenseNumber,
        kycStatus: driver.kycStatus,
      },
      truck: {
        id: truck._id.toString(),
        registrationNumber: truck.registrationNumber,
        truckType: truck.truckType,
      },
      requiredDocuments: [
        { docType: "driving_license", label: "Driving License (लायसन्स)", ownerType: "driver" },
        { docType: "rc_book", label: "RC Book (आरसी बुक)", ownerType: "truck" },
        { docType: "insurance", label: "Insurance Policy (इन्शुरन्स)", ownerType: "truck" },
        { docType: "puc", label: "PUC Certificate (पीयुसी)", ownerType: "truck" },
      ],
    });
  } catch (error) {
    console.error("Error in /api/drivers/onboarding:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
