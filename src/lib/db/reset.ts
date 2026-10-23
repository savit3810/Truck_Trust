import mongoose from "mongoose";
import { connectToDatabase, disconnectDatabase } from "./connection";
import { BRAND_NAME } from "@/lib/config/brand";

async function runReset() {
  if (process.env.NODE_ENV === "production") {
    console.error("❌ DANGER: Reset script refused to run in production!");
    process.exit(1);
  }

  console.log(`⚠️ Resetting ${BRAND_NAME} development database...`);
  await connectToDatabase();

  const collections = await mongoose.connection.db?.collections();
  if (collections) {
    for (const collection of collections) {
      await collection.deleteMany({});
      console.log(`🧹 Cleared collection: ${collection.collectionName}`);
    }
  }

  console.log("✅ Database reset complete.");
  await disconnectDatabase();
}

runReset().catch((err) => {
  console.error("❌ Reset failed:", err);
  process.exit(1);
});
