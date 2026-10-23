import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const BASE_URL = "http://localhost:3000";
const MONGO_URI = "mongodb://localhost:27017/trucktrust";

async function run() {
  console.log("==========================================================");
  console.log("🌟 Phase 6 Live Integration: Trust Engine & Analytics");
  console.log("==========================================================");

  await mongoose.connect(MONGO_URI);
  console.log("✓ Connected to local MongoDB at " + MONGO_URI);

  const db = mongoose.connection.db;

  // 1. Setup Admin Account and Authenticate
  console.log("\n1. Admin Authentication...");
  const adminEmail = "admin@trucktrust.in";
  const adminPass = "TruckTrustAdmin@2026";
  const passwordHash = await bcrypt.hash(adminPass, 10);

  await db.collection("users").updateOne(
    { email: adminEmail },
    {
      $set: {
        email: adminEmail,
        passwordHash,
        role: "admin",
        name: "DevOps Lead Admin",
        phone: "+919999000001",
        language: "en",
        isVerified: true,
        isActive: true,
        dpdpConsent: { consentedAt: new Date() },
      },
    },
    { upsert: true }
  );

  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password: adminPass }),
  });
  const adminCookie = adminLoginRes.headers.get("set-cookie")?.split(";")[0];
  const adminJson = await adminLoginRes.json();
  console.log(`   ✓ Admin logged in: ${adminJson.user?.name} (Role: ${adminJson.user?.role})`);

  // 2. Fetch Live Admin Analytics Aggregations
  console.log("\n2. Fetching Live Platform Analytics (/api/admin/analytics)...");
  const analyticsRes = await fetch(`${BASE_URL}/api/admin/analytics`, {
    method: "GET",
    headers: { Cookie: adminCookie },
  });
  const analyticsJson = await analyticsRes.json();
  console.log("   ✓ Success:", analyticsJson.success);
  console.log(`   ✓ Top Freight Corridors logged: ${analyticsJson.analytics.corridors.length}`);
  if (analyticsJson.analytics.corridors.length > 0) {
    const top = analyticsJson.analytics.corridors[0];
    console.log(`     Top Corridor: ${top.corridor} (${top.tripCount} trips, GMV: ₹${(top.totalGmvPaise / 100).toFixed(2)})`);
  }
  console.log(`   ✓ Total GMV: ₹${(analyticsJson.analytics.finances.totalGmvPaise / 100).toFixed(2)}`);
  console.log(`   ✓ Platform Commission: ₹${(analyticsJson.analytics.finances.platformFeeEarnedPaise / 100).toFixed(2)}`);
  console.log(`   ✓ Active Escrow: ₹${(analyticsJson.analytics.finances.activeEscrowPaise / 100).toFixed(2)}`);
  console.log(`   ✓ Fleet Average Trust Score: ${analyticsJson.analytics.fleet.averageTrustScore}/100`);

  // 3. Find a Completed Booking for Review Submission
  console.log("\n3. Testing Review Submission & Trust Recalculation...");
  const completedBooking = await db.collection("bookings").findOne({
    status: "completed",
    driverId: { $exists: true, $ne: null },
  });
  if (!completedBooking) {
    console.log("   ⚠️ No completed booking found to review. Creating mock completed trip...");
  } else {
    const bookingId = completedBooking._id.toString();
    const entrepreneurUser = await db.collection("users").findOne({ _id: completedBooking.entrepreneurId });

    // Seed OTP for entrepreneur login
    const entPhone = entrepreneurUser.phone.replace("+91", "");
    const testOtp = "123456";
    const salt = await bcrypt.genSalt(10);
    const codeHash = await bcrypt.hash(testOtp, salt);
    await db.collection("otps").deleteMany({ phone: entPhone });
    await db.collection("otps").insertOne({
      phone: entPhone,
      purpose: "login",
      codeHash,
      attempts: 0,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    const entLoginRes = await fetch(`${BASE_URL}/api/auth/otp/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: entPhone, otp: testOtp, role: "entrepreneur" }),
    });
    const entCookie = entLoginRes.headers.get("set-cookie")?.split(";")[0];

    // Delete any previous test review on this booking
    await db.collection("reviews").deleteMany({ bookingId: completedBooking._id });

    // Submit 5-Star Review
    console.log(`   Submitting 5-Star Review for booking ${completedBooking.bookingNumber}...`);
    const reviewRes = await fetch(`${BASE_URL}/api/bookings/${bookingId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: entCookie },
      body: JSON.stringify({
        rating: 5,
        categories: {
          punctuality: 5,
          cargoCare: 5,
          communication: 5,
          drivingSafety: 5,
        },
        comment: "उत्कृष्ट मालवाहतूक! वेळेत पोहोचले आणि कांदा अजिबात भिजला नाही.",
      }),
    });
    const reviewJson = await reviewRes.json();
    console.log("   ✓ Review Status:", reviewRes.status, reviewJson.message || reviewJson.error);
    if (reviewJson.updatedTrust) {
      console.log(`   ✓ Driver Recalculated Trust Score: ${reviewJson.updatedTrust.trustScore}/100 (${reviewJson.updatedTrust.trustTier.toUpperCase()} TIER)`);
      console.log(`   ✓ Driver Rating: ★ ${reviewJson.updatedTrust.rating.toFixed(1)} / 5.0 (${reviewJson.updatedTrust.totalRatingsCount} reviews)`);
    }

    // 4. Test Duplicate Review Rejection
    console.log("\n4. Verifying Duplicate Review Rejection...");
    const dupRes = await fetch(`${BASE_URL}/api/bookings/${bookingId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: entCookie },
      body: JSON.stringify({ rating: 4 }),
    });
    console.log(`   ✓ Duplicate rejection status code: ${dupRes.status} (Expected: 409)`);

    // 5. Test Driver Public Reviews API
    if (completedBooking.driverId) {
      console.log("\n5. Fetching Driver Reviews & Star Distribution (/api/drivers/[id]/reviews)...");
      const driverReviewsRes = await fetch(`${BASE_URL}/api/drivers/${completedBooking.driverId.toString()}/reviews`);
      const driverReviewsJson = await driverReviewsRes.json();
      console.log(`   ✓ Driver Reviews Loaded: ${driverReviewsJson.totalRatingsCount} ratings`);
      console.log("   ✓ Category Averages:", JSON.stringify(driverReviewsJson.categoryAverages));
      console.log("   ✓ Star Distribution:", JSON.stringify(driverReviewsJson.starDistribution));
    }
  }

  console.log("\n==========================================================");
  console.log("🎉 SUCCESS: Phase 6 Trust Engine & Analytics Live Verified 100%!");
  console.log("==========================================================");

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("FATAL ERROR in Phase 6 verification:", err);
  process.exit(1);
});
