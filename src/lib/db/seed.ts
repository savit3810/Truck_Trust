import bcrypt from "bcryptjs";
import { connectToDatabase, disconnectDatabase } from "./connection";
import { UserModel } from "@/features/auth/models/user.model";
import { DriverModel } from "@/features/drivers/models/driver.model";
import { TruckModel } from "@/features/trucks/models/truck.model";
import { DocumentModel } from "@/features/documents/models/document.model";
import { WalletModel } from "@/features/ledger/models/wallet.model";
import { BRAND_NAME } from "@/lib/config/brand";

async function runSeed() {
  if (process.env.NODE_ENV === "production") {
    console.error("❌ Refusing to seed database in production environment!");
    process.exit(1);
  }

  console.log(`🌱 Seeding ${BRAND_NAME} database with realistic Maharashtra entities...`);
  await connectToDatabase();

  // 1. Create Platform Admin
  const adminPasswordHash = await bcrypt.hash("TruckTrust@Admin2026", 10);
  const adminUser = await UserModel.findOneAndUpdate(
    { phone: "9820098200" },
    {
      name: "Sanjay Deshmukh (Admin Lead)",
      email: "admin@trucktrust.in",
      passwordHash: adminPasswordHash,
      role: "admin",
      language: "mr",
      isVerified: true,
      isActive: true,
    },
    { upsert: true, new: true }
  );
  console.log(`✅ Admin Account ready: ${adminUser.email} / 9820098200`);

  // 2. Create Support Agent
  const supportPasswordHash = await bcrypt.hash("Support@Truck2026", 10);
  await UserModel.findOneAndUpdate(
    { phone: "9820098201" },
    {
      name: "Pooja Kulkarni (Customer Support)",
      email: "support@trucktrust.in",
      passwordHash: supportPasswordHash,
      role: "support",
      language: "mr",
      isVerified: true,
      isActive: true,
    },
    { upsert: true, new: true }
  );
  console.log(`✅ Support Account ready: support@trucktrust.in`);

  // 3. Create Rural Entrepreneurs
  const entrepreneursData = [
    {
      phone: "9822110001",
      name: "Savita Mahila Bachat Gat (Wada)",
      language: "mr" as const,
      role: "entrepreneur" as const,
    },
    {
      phone: "9822110002",
      name: "Ramesh Patil (Palghar Chiku Farmer)",
      language: "mr" as const,
      role: "entrepreneur" as const,
    },
    {
      phone: "9822110003",
      name: "Shaikh Rafiq (Bhiwandi Textile Merchant)",
      language: "hi" as const,
      role: "entrepreneur" as const,
    },
    {
      phone: "9822110004",
      name: "Sunita Gaikwad (Nashik Organic Grapes)",
      language: "mr" as const,
      role: "entrepreneur" as const,
    },
  ];

  for (const ent of entrepreneursData) {
    await UserModel.findOneAndUpdate(
      { phone: ent.phone },
      {
        name: ent.name,
        role: ent.role,
        language: ent.language,
        isVerified: true,
        isActive: true,
      },
      { upsert: true, new: true }
    );
  }
  console.log(`✅ Created ${entrepreneursData.length} Maharashtra entrepreneurs`);

  // 4. Create Verified Drivers and Trucks
  const driversData = [
    {
      phone: "9730012341",
      name: "Santosh Jadhav",
      license: "MH-48-20150009871",
      experience: 8,
      districts: ["Palghar", "Dahanu", "Wada", "Thane"],
      truck: {
        plate: "MH-48-AB-4021",
        type: "tata_ace" as const,
        capacityKg: 850,
        bodyType: "tarpaulin" as const,
        coords: [72.7699, 19.6967] as [number, number], // Palghar
      },
      walletBalancePaise: 450000, // ₹4,500
    },
    {
      phone: "9730012342",
      name: "Ganesh Shinde",
      license: "MH-15-20120005432",
      experience: 12,
      districts: ["Nashik", "Sinnar", "Bhiwandi", "Mumbai"],
      truck: {
        plate: "MH-15-EG-8930",
        type: "pickup" as const,
        capacityKg: 1700,
        bodyType: "tarpaulin" as const,
        coords: [73.7898, 19.9975] as [number, number], // Nashik
      },
      walletBalancePaise: 820000, // ₹8,200
    },
    {
      phone: "9730012343",
      name: "Baban Bhor",
      license: "MH-12-20100007890",
      experience: 15,
      districts: ["Pune", "Baramati", "Shirur", "Mumbai"],
      truck: {
        plate: "MH-12-QZ-5511",
        type: "truck_14ft" as const,
        capacityKg: 4200,
        bodyType: "closed_container" as const,
        coords: [73.8567, 18.5204] as [number, number], // Pune
      },
      walletBalancePaise: 1250000, // ₹12,500
    },
  ];

  for (const item of driversData) {
    const driverUser = await UserModel.findOneAndUpdate(
      { phone: item.phone },
      {
        name: item.name,
        role: "driver",
        language: "mr",
        isVerified: true,
        isActive: true,
      },
      { upsert: true, new: true }
    );

    const driverRecord = await DriverModel.findOneAndUpdate(
      { userId: driverUser._id },
      {
        userId: driverUser._id,
        licenseNumber: item.license,
        experienceYears: item.experience,
        operatingDistricts: item.districts,
        kycStatus: "verified",
        trustScore: 92,
        onTimeRate: 98,
        totalTripsCompleted: 42,
        bankDetails: {
          upiId: `${item.phone}@ybl`,
          accountLast4: "4321",
          ifscPrefix: "MAHB000",
        },
        verifiedAt: new Date(),
        verifiedBy: adminUser._id,
      },
      { upsert: true, new: true }
    );

    await TruckModel.findOneAndUpdate(
      { registrationNumber: item.truck.plate },
      {
        driverId: driverRecord._id,
        registrationNumber: item.truck.plate,
        truckType: item.truck.type,
        capacityKg: item.truck.capacityKg,
        bodyType: item.truck.bodyType,
        isAvailable: true,
        currentLocation: {
          type: "Point",
          coordinates: item.truck.coords,
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    // Initialize driver wallet with balance
    await WalletModel.findOneAndUpdate(
      { userId: driverUser._id },
      {
        userId: driverUser._id,
        balancePaise: item.walletBalancePaise,
        escrowBalancePaise: 0,
        totalEarnedPaise: item.walletBalancePaise * 4,
      },
      { upsert: true, new: true }
    );

    // Add realistic verified driving license document
    await DocumentModel.findOneAndUpdate(
      { ownerId: driverRecord._id, docType: "driving_license" },
      {
        ownerId: driverRecord._id,
        ownerType: "driver",
        docType: "driving_license",
        fileUrl: "/mock/docs/dl_verified.pdf",
        originalFilename: `${item.name.replace(/\s+/g, "_")}_DL.pdf`,
        fileSizeBytes: 245000,
        mimeType: "application/pdf",
        documentNumber: item.license,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 3), // 3 years validity
        status: "approved",
        reviewedBy: adminUser._id,
        reviewedAt: new Date(),
      },
      { upsert: true, new: true }
    );
  }

  console.log(`✅ Created ${driversData.length} verified Maharashtra drivers with trucks and wallets`);
  console.log(`🎉 Database seeding completed successfully!`);

  await disconnectDatabase();
}

runSeed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
