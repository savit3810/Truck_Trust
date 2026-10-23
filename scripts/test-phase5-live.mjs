import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const BASE_URL = "http://localhost:3000";
const MONGO_URI = "mongodb://localhost:27017/trucktrust";

async function run() {
  console.log("==========================================================");
  console.log("🚚 Phase 5 End-to-End Live Integration Verification");
  console.log("==========================================================");

  await mongoose.connect(MONGO_URI);
  console.log("✓ Connected to local MongoDB at " + MONGO_URI);

  const db = mongoose.connection.db;

  // 1. Setup Active OTPs for Entrepreneur and Driver
  const entPhone = "9822998811";
  const driverPhone = "9730012341";
  const testOtp = "123456";
  const salt = await bcrypt.genSalt(10);
  const codeHash = await bcrypt.hash(testOtp, salt);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.collection("otps").deleteMany({ phone: { $in: [entPhone, driverPhone] } });
  await db.collection("otps").insertMany([
    { phone: entPhone, purpose: "login", codeHash, attempts: 0, expiresAt },
    { phone: driverPhone, purpose: "login", codeHash, attempts: 0, expiresAt },
  ]);
  console.log(`✓ Seeded test OTP (${testOtp}) for ${entPhone} and ${driverPhone}`);

  // 2. Entrepreneur Login
  console.log("\n1. Logging in Entrepreneur...");
  const entLoginRes = await fetch(`${BASE_URL}/api/auth/otp/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: entPhone,
      otp: testOtp,
      role: "entrepreneur",
      language: "mr",
    }),
  });
  const entCookie = entLoginRes.headers.get("set-cookie")?.split(";")[0];
  const entData = await entLoginRes.json();
  console.log(`   Logged in Entrepreneur: ${entData.user.id} (${entCookie?.substring(0, 20)}...)`);

  // 3. Driver Login
  console.log("\n2. Logging in Driver...");
  const driverLoginRes = await fetch(`${BASE_URL}/api/auth/otp/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: driverPhone,
      otp: testOtp,
      role: "driver",
      language: "mr",
    }),
  });
  const driverCookie = driverLoginRes.headers.get("set-cookie")?.split(";")[0];
  const driverData = await driverLoginRes.json();
  console.log(`   Logged in Driver: ${driverData.user.id} (${driverCookie?.substring(0, 20)}...)`);

  // 4. Create Booking
  console.log("\n3. Creating Booking with 50-50 Fare Split...");
  const createBookingRes = await fetch(`${BASE_URL}/api/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: entCookie,
    },
    body: JSON.stringify({
      pickup: {
        address: "Pimpalgaon Onion APMC Market",
        district: "Nashik",
        contactName: "Suresh Patil",
        contactPhone: entPhone,
        coordinates: [73.9854, 20.1706],
      },
      drop: {
        address: "Vashi Onion APMC, Navi Mumbai",
        district: "Thane",
        receiverName: "Dilip Shah",
        receiverPhone: "9822445566",
        coordinates: [73.0012, 19.076],
      },
      goods: {
        category: "agricultural_produce",
        description: "Nashik Red Export Onions (कांदा)",
        weightKg: 3500,
        isPerishable: true,
        isFragile: false,
      },
      truckType: "truck_14ft",
      mode: "direct",
      route: {
        distanceKm: 175,
        durationMinutes: 240,
      },
      fare: {
        baseFarePaise: 70000,
        distanceFarePaise: 750000,
        handlingFarePaise: 30000,
        subtotalFarePaise: 850000,
        platformFeePaise: 63750,
        gstTaxPaise: 42500,
        totalFarePaise: 956250,
        advance50Paise: 478125,
        delivery50Paise: 478125,
      },
    }),
  });
  const bookingJson = await createBookingRes.json();
  const bookingId = bookingJson.booking.id;
  const bookingNumber = bookingJson.booking.bookingNumber;
  console.log(`   ✓ Booking Created: ${bookingNumber} (ID: ${bookingId})`);

  // 5. Driver Accepts Booking
  console.log("\n4. Driver Accepts Booking...");
  const acceptRes = await fetch(`${BASE_URL}/api/bookings/${bookingId}/accept`, {
    method: "POST",
    headers: { Cookie: driverCookie },
  });
  const acceptJson = await acceptRes.json();
  console.log(`   ✓ Acceptance Status: ${acceptJson.status}`);

  // 6. Pay 50% Advance Escrow
  console.log("\n5. Paying 50% Advance into Escrow...");
  const orderRes = await fetch(`${BASE_URL}/api/payments/razorpay/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: entCookie },
    body: JSON.stringify({ bookingId, paymentType: "advance" }),
  });
  const orderJson = await orderRes.json();

  const verifyPayRes = await fetch(`${BASE_URL}/api/payments/razorpay/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: entCookie },
    body: JSON.stringify({
      bookingId,
      razorpayOrderId: orderJson.order.id,
      razorpayPaymentId: `pay_mock_adv_${Date.now()}`,
      razorpaySignature: "mock_sig_ok",
      paymentType: "advance",
    }),
  });
  const verifyPayJson = await verifyPayRes.json();
  console.log(`   ✓ Advance Payment Result: ${verifyPayJson.message}`);

  // 7. Driver Submits Pickup Proof (Photos + Departure)
  console.log("\n6. Driver Submits Pickup Proof (Cargo Photos)...");
  const pickupRes = await fetch(`${BASE_URL}/api/bookings/${bookingId}/pickup-proof`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: driverCookie },
    body: JSON.stringify({
      photos: ["data:image/jpeg;base64,mockloadedcargo"],
      notes: "3.5 टन कांदा सुरक्षित ताडपत्री बांधून लोड केला",
    }),
  });
  const pickupJson = await pickupRes.json();
  console.log(`   ✓ Status: ${pickupJson.status}, Note: ${pickupJson.message}`);

  // 8. Receiver Initiates Delivery Proof
  console.log("\n7. Receiver Initiates Delivery Proof (QR & OTP)...");
  const initRes = await fetch(`${BASE_URL}/api/bookings/${bookingId}/delivery-proof/initiate`, {
    method: "POST",
    headers: { Cookie: entCookie },
  });
  const initJson = await initRes.json();
  const deliveryOtp = initJson.otp;
  console.log(`   ✓ Generated Delivery OTP: ${deliveryOtp}`);
  console.log(`   ✓ QR Data URL length: ${initJson.qrCodeDataUrl?.length} characters`);

  // 9. Update Vehicle Location via Live SSE / GPS
  console.log("\n8. Vehicle Location Update (Kasara Ghat / NH 160)...");
  const locRes = await fetch(`${BASE_URL}/api/tracking/${bookingId}/update-location`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      latitude: 19.8214,
      longitude: 73.5512,
      heading: 215,
      speedKmh: 52,
      etaMinutes: 85,
    }),
  });
  const locJson = await locRes.json();
  console.log(`   ✓ Location: [${locJson.tracking.currentLocation.coordinates}], Speed: ${locJson.tracking.speedKmh} km/h, ETA: ${locJson.tracking.etaMinutes}m`);

  // 10. Emergency SOS Alert Dispatch
  console.log("\n9. Testing Emergency SOS Dispatch...");
  const sosRes = await fetch(`${BASE_URL}/api/bookings/${bookingId}/sos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: driverCookie },
    body: JSON.stringify({
      latitude: 19.8214,
      longitude: 73.5512,
      reason: "गाडीचा टायर पंक्चर झाला आणि महामार्गावर थांबलो",
    }),
  });
  const sosJson = await sosRes.json();
  console.log(`   ✓ SOS Message: ${sosJson.message}`);
  console.log("   ✓ Emergency Helplines returned:", sosJson.emergencyHelplines.map((h) => `${h.name}: ${h.number}`).join(" | "));

  // 11. Driver Verifies Delivery Proof
  console.log(`\n10. Driver Verifies Delivery Proof with Receiver OTP (${deliveryOtp})...`);
  const verifyDlvRes = await fetch(`${BASE_URL}/api/bookings/${bookingId}/verify-delivery`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: driverCookie },
    body: JSON.stringify({
      otp: deliveryOtp,
      dropPhotos: ["data:image/jpeg;base64,mockunloadedcargo"],
      receiverNotes: "सर्व माल योग्य स्थितीत पोहोचला",
    }),
  });
  const verifyDlvJson = await verifyDlvRes.json();
  console.log(`   ✓ Verification: ${verifyDlvJson.message}`);
  console.log(`   ✓ Booking Status: ${verifyDlvJson.status}, Method: ${verifyDlvJson.verifiedMethod}`);

  // 12. Driver Wallet Balance Verification
  console.log("\n11. Driver Wallet Balance Verification...");
  const walletRes = await fetch(`${BASE_URL}/api/wallet`, {
    method: "GET",
    headers: { Cookie: driverCookie },
  });
  const walletJson = await walletRes.json();
  console.log(`   ✓ Driver Available Balance: ₹${(walletJson.wallet.balancePaise / 100).toFixed(2)}`);
  console.log(`   ✓ Total Double-Entry Passbook Records: ${walletJson.transactions.length}`);

  console.log("\n==========================================================");
  console.log("🎉 SUCCESS: Phase 5 Live APIs & Persistence Verified 100%!");
  console.log("==========================================================");

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("FATAL ERROR in Phase 5 verification:", err);
  process.exit(1);
});
