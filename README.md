# 🚛 TruckTrust (ट्रकट्रस्ट)

> **Production-Ready Rural Freight Logistics & 50-50 Escrow Platform for Maharashtra**  
> *Connecting rural farmers, SHGs, and local entrepreneurs with verified truck drivers for last-mile delivery and return-load logistics.*

---

## 🌟 Executive Summary

In rural Maharashtra, farmers, women’s self-help groups (SHGs), dairy producers, and cottage industries lose millions each year to unreliable transport: goods are delayed, damaged, or stolen; drivers demand cash upfront and vanish; and empty return trips inflate freight rates.

**TruckTrust** solves this with an institutional-grade logistics platform:
1. **50-50 Escrow Protection**: 50% advance locked securely upon dispatch; remaining 50% released to driver only upon physical handover verified by cryptographic 6-digit OTP and signed QR code.
2. **Verified Drivers & RTO Verification**: Automated tiering (Silver, Gold, Platinum) with strict RC Book, Driving License, Fitness, and Insurance expiry tracking.
3. **Transparent APMC Route Pricing**: Fair distance and handling tariffs with 10% perishable handling surcharge and up to 30% return-load discounts.
4. **Offline & Low-Bandwidth Resilience**: Progressive Web App (PWA) with service worker caching, offline drafts, Marathi voice speech input, and 24x7 WhatsApp booking assistant.
5. **Double-Entry Financial Ledger**: Non-floating-point integer paise accounting guaranteeing zero financial discrepancies across escrow holds, payouts, disputes, and cancellations.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Rationale & Design Choice |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16 (App Router) + Turbopack** | Server Components, Partial Prerendering (PPR), Edge runtime route handlers |
| **Language** | **TypeScript (Strict Mode)** | Complete end-to-end type safety, Zod schema validation |
| **Styling** | **Tailwind CSS v4 + Semantic CSS Variables** | Curated regional palette (*Jaggery Gold, Deep Forest Teal, Chili Rust, Warm Off-White, Charcoal Ink*) |
| **Database** | **MongoDB 7.0 + Mongoose** | Native GeoJSON geospatial index for driver matching, document schemas |
| **Payments** | **Razorpay Route & Webhooks** | Split payments, virtual accounts, nodal escrow, and automated IMPS/UPI payouts |
| **Routing** | **OSRM & Haversine Engine** | Accurate Maharashtra APMC corridor distances with offline geocoding cache |
| **Live Tracking** | **Server-Sent Events (SSE)** | Battery-efficient live GPS updates without WebSocket connection overhead |
| **Localization** | **Custom Dictionary (MR / EN)** | Native Marathi localization (`mr-IN`) with Devanagari numerals and currency formatters |

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- **Node.js**: `v20.x` or later
- **npm**: `v10.x` or later
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/trucktrust`) or MongoDB Atlas URI

### 1. Clone & Install
```bash
git clone https://github.com/your-org/trucktrust.git
cd trucktrust
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Key configuration parameters:
```env
BRAND_NAME=TruckTrust
NEXT_PUBLIC_BRAND_NAME=TruckTrust
MONGODB_URI=mongodb://127.0.0.1:27017/trucktrust
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
RAZORPAY_KEY_ID=rzp_test_placeholder
RAZORPAY_KEY_SECRET=rzp_secret_placeholder
RAZORPAY_WEBHOOK_SECRET=rzp_webhook_secret_placeholder
SMS_PROVIDER=mock
NEXT_PUBLIC_MAP_PROVIDER=osrm
```

### 3. Seed Database with Realistic Corridors
Populate verified APMCs (Palghar, Vashi, Pune, Nashik, Junnar, Bhiwandi) and active drivers:
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Automated Tests
```bash
npm test
```

---

## 🧭 MongoDB Compass Guide

Inspect your local database directly using MongoDB Compass (`mongodb://127.0.0.1:27017`):

### Key Collections & Queries
1. **`users`**:
   - Filter shippers: `{ role: "entrepreneur" }`
   - Filter drivers: `{ role: "driver", isPhoneVerified: true }`
2. **`drivers`**:
   - Filter verified gold drivers: `{ tier: "gold", status: "approved" }`
   - Filter drivers operating in Palghar/Nashik: `{ operatingDistricts: { $in: ["Palghar", "Nashik"] } }`
3. **`bookings`**:
   - View in-transit shipments: `{ status: "in_transit" }`
   - Reconcile escrow payments: `{ "payment.status": "advance_held" }`
4. **`ledger_entries`**:
   - Inspect immutable transaction pairs: `{ transactionGroup: "..." }`
   - Verify zero discrepancy balance:
     ```javascript
     [
       { $group: { _id: null, totalDebits: { $sum: "$debitAmountPaise" }, totalCredits: { $sum: "$creditAmountPaise" } } }
     ]
     ```

---

## 🐳 Docker Deployment

### Run with Docker Compose
```bash
docker compose up --build -d
```
This automatically boots:
- `trucktrust-web` on port `3000` (production multi-stage image with non-root security user).
- `trucktrust-mongo` on port `27017` with persistent Docker volume storage and health checks.

---

## ⚖️ What Is Real vs What Is Simulated

| Feature | Production Implementation | Local / Dev Mode Simulation |
| :--- | :--- | :--- |
| **Ledger Engine** | Real immutable double-entry MongoDB writes | Real (runs in memory during Vitest) |
| **Authentication** | Real JWT session cookies + bcrypt password/OTP hashing | `SMS_PROVIDER=mock` outputs OTP to console |
| **Payments** | Real Razorpay Orders, HMAC signature verification, & Webhook capture | Mock payment verification adapter when keys are test placeholders |
| **Delivery Proof** | Real 6-digit cryptographic OTP + QR code data URLs | Real bcrypt hash comparison + timing-safe equality |
| **GPS Tracking** | Real Server-Sent Events (SSE) stream endpoint | Coordinates emit along real Maharashtra highway route |
| **Voice Input** | Native Web Speech API (`webkitSpeechRecognition`) in Marathi | Supported directly in modern Chrome/Edge browsers |

---

## 📋 What Still Needs Approvals Before Public Launch

Before turning on live credit card and UPI charging in production:
1. **Razorpay Route / Nodal Escrow KYC**: Submit Marketplace KYC to Razorpay under RBI payment aggregator guidelines.
2. **TRAI DLT Registration**: Register entity and approve Marathi transactional SMS templates on Vodafone-Idea / Jio DLT portal.
3. **Vahan & Sarathi API Gateway**: Procure commercial API credentials from NIC/ULIP for instant real-time driving license and RC book verification.
4. **Maharashtra GTA GST Assessment**: Complete Goods Transport Agency registration for statutory 5% reverse-charge GST filing.

Refer to [`docs/PRE_LAUNCH_CHECKLIST.md`](file:///c:/Users/Admin/Desktop/TruckTrust/docs/PRE_LAUNCH_CHECKLIST.md) for the complete launch runbook and sign-off criteria.

---

## 📜 Statutory & Legal Compliance

TruckTrust is designed to meet statutory requirements under:
- **Digital Personal Data Protection (DPDP) Act, 2023**: Consent manager and grievance officer published at `/grievance`.
- **Carriage by Road Act, 2007**: Electronic Consignment Notes (Waybills) generated for every booked trip.
- **IT Act, 2000 Section 5(9)**: 48-hour grievance redressal turnaround SLA.

---

## 👥 Contributors & Contact

- **Grievance Redressal Officer**: Nitin Deshmukh (`grievance@trucktrust.in`)
- **Toll-Free Helpline**: `1800-878-25` (१८००-ट्रक)
- **WhatsApp Support Desk**: `+91 98221 10000`
- **Headquarters**: TruckTrust Technologies Pvt. Ltd., Nariman Point, Mumbai & Shivaji Nagar, Pune, Maharashtra.
