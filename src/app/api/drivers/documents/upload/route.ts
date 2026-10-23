import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import { DriverModel } from "@/features/drivers/models/driver.model";
import { TruckModel } from "@/features/trucks/models/truck.model";
import { DocumentModel, DocType } from "@/features/documents/models/document.model";
import { getStorageProvider } from "@/lib/providers/storage";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const driver = await DriverModel.findOne({ userId: session.userId });
    if (!driver) {
      return NextResponse.json(
        { success: false, error: "Driver profile not found. Please complete profile registration first." },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const docType = formData.get("docType") as DocType | null;
    const documentNumber = formData.get("documentNumber") as string | null;
    const expiryDateStr = formData.get("expiryDate") as string | null;

    if (!file || !docType) {
      return NextResponse.json(
        { success: false, error: "File and docType are required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only PDF and JPG/PNG images are accepted." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 5 MB limit." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload via Storage Provider (Local Disk with sanitization)
    const storageResult = await getStorageProvider().upload(
      buffer,
      file.name,
      file.type,
      "documents"
    );

    let ownerId = driver._id;
    let ownerType: "driver" | "truck" = "driver";

    if (["rc_book", "insurance", "puc", "fitness_permit", "truck_photo"].includes(docType)) {
      const truck = await TruckModel.findOne({ driverId: driver._id });
      if (truck) {
        ownerId = truck._id;
        ownerType = "truck";
      }
    }

    let parsedExpiry: Date | undefined;
    if (expiryDateStr) {
      const d = new Date(expiryDateStr);
      if (!isNaN(d.getTime())) {
        parsedExpiry = d;
      }
    }

    // Upsert Document Item
    const docRecord = await DocumentModel.findOneAndUpdate(
      { ownerId, docType },
      {
        ownerId,
        ownerType,
        docType,
        fileUrl: storageResult.fileUrl,
        originalFilename: storageResult.originalFilename,
        fileSizeBytes: storageResult.fileSizeBytes,
        mimeType: storageResult.mimeType,
        documentNumber: documentNumber || undefined,
        expiryDate: parsedExpiry,
        status: "pending",
        rejectionReason: undefined,
      },
      { upsert: true, returnDocument: "after" }
    );

    return NextResponse.json({
      success: true,
      message: "Document uploaded successfully and queued for admin verification",
      document: {
        id: docRecord._id.toString(),
        docType: docRecord.docType,
        fileUrl: docRecord.fileUrl,
        status: docRecord.status,
        expiryDate: docRecord.expiryDate,
      },
    });
  } catch (error) {
    console.error("Error in /api/drivers/documents/upload:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
