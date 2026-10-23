# TruckTrust Security Policy & Technical Architecture

## 1. Compliance & Statutory Framework

TruckTrust is engineered to comply with:
- **Digital Personal Data Protection (DPDP) Act, 2023** (India)
- **Carriage by Road Act, 2007** & Central Motor Vehicles Rules (CMVR)
- **Information Technology Act, 2000** (Section 5(9) & Intermediary Guidelines)
- **RBI Guidelines on Payment Aggregators & Escrow Accounts**

---

## 2. Financial Security & Immutable Double-Entry Ledger

### A. Non-Zero Floating Point Arithmetic
- **Strict Integer Paise**: All monetary amounts in the entire system are stored as 64-bit integer paise (1 INR = 100 paise).
- Floating-point numbers are prohibited in database storage, calculations, or transfers to eliminate rounding errors.

### B. Double-Entry Accounting Invariant
- Every transaction contains equal and balancing debit and credit legs.
- Total system debits **must strictly equal** total system credits at all times.
- Funds flow directly into `escrow:held` upon 50% advance payment.
- Escrow releases to driver's wallet only upon cryptographic delivery proof verification (OTP / QR).

### C. Webhook Idempotency & Replay Protection
- All Razorpay webhook events require cryptographically verified HMAC-SHA256 signatures (`x-razorpay-signature`).
- Webhook payloads are hashed and checked against stored payment IDs to ensure replayed or duplicate webhook deliveries never cause double-crediting or duplicate payouts.

---

## 3. Authentication & Access Control

### A. Phone OTP Verification
- Multi-factor authentication via 6-digit numeric OTP with 5-minute expiry.
- OTPs are hashed using `bcrypt` (cost factor 10) before persistence in MongoDB. Plaintext OTPs are never stored.
- Rate-limiting prevents brute-force attempts (maximum 3 attempts per 15 minutes per phone number).

### B. Session Security
- User sessions are issued via HMAC-SHA256 signed JSON Web Tokens (`jose`).
- Tokens are delivered via **HttpOnly, Secure, SameSite=Strict** cookies to protect against Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF).

### C. Role-Based Access Control (RBAC)
- Strict server-side route guards enforce authorization across:
  - `entrepreneur` (Shipper/Customer)
  - `driver` (Commercial Vehicle Operator)
  - `support_agent` (Dispute review & driver query support)
  - `admin` (Financial oversight, driver verification, system settings)

---

## 4. Delivery Verification Cryptography

- **6-Digit Delivery OTP**: Generated at dispatch, delivered securely to receiver via SMS/WhatsApp. Never revealed to the driver until physical handover.
- **Signed QR Code**: Signed payload containing booking ID, token, and issued timestamp.
- **Timing-Safe Equality**: QR code token comparisons use `crypto.timingSafeEqual` to defeat timing attacks.

---

## 5. Data Privacy & DPDP Act 2023 Compliance

1. **Purpose Limitation**: Personal documents (Aadhaar, Driving License, RC Book) are collected solely for commercial vehicle verification and regulatory compliance.
2. **Consent & Right to Grievance**:
   - Explicit consent logged with timestamps.
   - Statutory Grievance Redressal Officer published at [`/grievance`](file:///c:/Users/Admin/Desktop/TruckTrust/src/app/grievance/page.tsx).
3. **Data Localization**: Database and backups are hosted exclusively in Indian AWS/GCP regions (Mumbai / Pune / Hyderabad).

---

## 6. Vulnerability Disclosure & Reporting

If you identify a security issue or vulnerability in TruckTrust, please report it immediately:
- **Email**: `security@trucktrust.in`
- **Grievance Officer**: Nitin Deshmukh (`grievance@trucktrust.in`)
- **Emergency Hotline**: `+91 98221 10000`
