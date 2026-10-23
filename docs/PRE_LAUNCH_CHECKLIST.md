# TruckTrust Pre-Launch & Operational Go-Live Checklist

## 1. Statutory & Regulatory Approvals

- [ ] **Razorpay Route / Nodal Escrow Integration**:
  - Complete Merchant KYC for Payment Aggregator / Marketplace Escrow under RBI guidelines.
  - Test settlement webhooks in live sandbox environment.
- [ ] **TRAI DLT Template Registration (Telecom Regulatory Authority of India)**:
  - Register Principal Entity (PE) on Jio/Airtel/BSNL DLT portal.
  - Approve Marathi & English OTP message templates (`{#var#} हा आपला TruckTrust लॉगिन OTP आहे`).
- [ ] **GST Registration**:
  - Verify Maharashtra GSTIN for 5% GTA (Goods Transport Agency) tax collection and input tax credits.
- [ ] **Carriage by Road Act 2007 Compliance**:
  - File digital transport aggregator intimation with the Maharashtra State Transport Commissioner (Bandra, Mumbai).
- [ ] **DPDP Act 2023 Statutory Officer**:
  - Confirm Grievance Redressal Officer appointment and public contact publication at `/grievance`.

---

## 2. Infrastructure & Hosting Hardening

- [ ] **Database (MongoDB)**:
  - Deploy MongoDB Atlas or self-hosted 3-node Replica Set in AWS `ap-south-1` (Mumbai).
  - Enable WiredTiger encryption at rest using AWS KMS.
  - Configure automated point-in-time recovery (PITR) with hourly snapshots.
  - Verify connection string `MONGODB_URI` with SSL/TLS (`ssl=true&replicaSet=...`).
- [ ] **Compute & Containerization**:
  - Verify multi-stage Docker build: `docker build -t trucktrust:v1 .`
  - Deploy across redundant nodes with automatic healthcheck restart policies (`/manifest.webmanifest`).
- [ ] **Reverse Proxy & Edge**:
  - Configure Cloudflare or NGINX reverse proxy with HTTP/2 and gzip/brotli compression.
  - Enforce TLS 1.3 only with HSTS (`max-age=31536000; includeSubDomains; preload`).
  - Configure rate limiting on `/api/auth/otp/send` (10 req/min per IP).

---

## 3. Financial & Ledger Verification

- [ ] **Ledger Reconciler Job**:
  - Run `src/features/ledger/ledger.test.ts` on staging.
  - Verify zero-discrepancy invariant across all historical transactions (`sum(debits) - sum(credits) == 0`).
- [ ] **Webhook Idempotency Validation**:
  - Simulate network duplicate delivery of `order.paid` and verify single debit/credit entry.
- [ ] **Driver Payout Rails**:
  - Verify automated UPI / IMPS payout API via RazorpayX or ICICI Bank Corporate API.
  - Set daily driver payout limits and manual approval triggers for withdrawals above ₹25,000.

---

## 4. Hardware & Field Testing in Rural Maharashtra

- [ ] **Low-Bandwidth 2G/3G Field Test**:
  - Test booking creation and voice input at Palghar APMC Yard and Junnar Tomato Mandi on Airtel/Jio 3G throttled network (360px viewport).
- [ ] **Offline PWA Capability**:
  - Test loading cached pages while in airplane mode.
  - Test offline booking draft persistence and background sync restoration upon reconnecting.
- [ ] **Weighbridge & Camera Proof**:
  - Test photo upload of APMC weighbridge slips under direct sunlight with compressed JPEG upload (< 500KB).

---

## 5. Emergency SOS & Incident Management

- [ ] **SOS Dispatch Center**:
  - Connect SOS webhook to 24x7 control room WhatsApp and SMS alerts for local highway police (Maharashtra Highway Safety Patrol 1098).
- [ ] **Dispute Resolution SLAs**:
  - 48-hour mandatory resolution turnaround for perishable cargo damage claims.
