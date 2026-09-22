# MESUREGX — Database Architecture & Data Dictionary

MESUREGX uses Prisma ORM with SQLite for zero-configuration development and direct PostgreSQL compatibility for production deployment.

---

## 1. Entity-Relationship Overview

```text
User (1) ───< (1) Business
User (1) ───< (1) Officer
User (1) ───< (*) AuditLog
User (1) ───< (*) Notification

Business (1) ───< (*) Instrument
Business (1) ───< (*) VerificationApplication
Business (1) ───< (*) Certificate

Instrument (1) ───< (*) VerificationApplication
Instrument (1) ───< (*) Certificate

VerificationApplication (1) ─── (1) Assignment
VerificationApplication (1) ─── (1) Verification
VerificationApplication (1) ─── (1) Certificate

Verification (1) ───< (*) Measurement
Verification (1) ───< (*) Evidence

InstrumentType (1) ───< (*) Instrument
InstrumentType (1) ───< (*) VerificationRule
```

---

## 2. Core Models

### `User`
Manages identities and authorization across three roles: `BUSINESS_OWNER`, `OFFICER`, and `ADMIN`.
- `id` (String UUID, Primary Key)
- `email` (Unique String)
- `passwordHash` (Bcrypt hash, Salt rounds: 10)
- `name` (String)
- `phone` (String, Optional)
- `role` (String Enum: `BUSINESS_OWNER` | `OFFICER` | `ADMIN`)
- `status` (`ACTIVE` | `INACTIVE`)

### `Business`
Stores trade establishment information and KYC metadata.
- `id` (String UUID)
- `userId` (Foreign Key -> `User.id`)
- `businessName` (String, e.g. "Sri Lakshmi Stores")
- `ownerName` (String)
- `mobile` (String)
- `address`, `city`, `district`, `state`, `pincode`
- `businessType` (e.g. "Retail Grocery & Provisions")
- `gstNumber` (String, Optional)

### `Officer`
Stores state Legal Metrology inspectors and jurisdiction credentials.
- `id` (String UUID)
- `userId` (Foreign Key -> `User.id`)
- `officerCode` (Unique String, e.g. "OFF-TN-042")
- `name` (String)
- `district` (String, e.g. "Coimbatore")
- `designation` (String, e.g. "Senior Inspector of Legal Metrology")
- `badgeNumber` (String, e.g. "LM-TN-CBE-042")
- `status` (`ACTIVE` | `INACTIVE`)

### `Instrument`
Maintains hardware weighing scales, platform balances, and dispensers.
- `id` (String UUID)
- `customId` (Unique String, e.g. "WX-1001")
- `businessId` (Foreign Key -> `Business.id`)
- `typeId` (Foreign Key -> `InstrumentType.id`)
- `manufacturer`, `model`, `serialNumber`
- `capacity` (Float), `capacityUnit` (e.g. "kg", "L")
- `accuracyClass` (`I`, `II`, `III`, `IIII`)
- `status` (`PENDING_VERIFICATION`, `VERIFIED`, `EXPIRED`, `REJECTED`)
- `currentCertificateId` (String, Optional)

### `VerificationApplication`
Workflow ledger for verification requests.
- `id` (String UUID)
- `applicationNumber` (Unique String, e.g. "APP-2026-000001")
- `businessId`, `instrumentId`
- `applicationType` (`Initial Verification`, `Periodic Verification`, etc.)
- `status` (`SUBMITTED`, `ASSIGNED`, `FIELD_VERIFICATION`, `OFFICER_REVIEW`, `APPROVED`, `REJECTED`, `CERTIFICATE_ISSUED`, `EXPIRED`)
- `rejectionReason` (String, Required on rejection)

### `Verification`
Field testing on-site audit container.
- `id` (String UUID)
- `applicationId` (Unique Foreign Key -> `VerificationApplication.id`)
- `officerId` (Foreign Key -> `Officer.id`)
- `latitude`, `longitude`, `locationAccuracy` (Float, GPS sensor coordinates)
- `overallResult` (`PASS` | `FAIL` | `PENDING`)
- `status` (`DRAFT` | `SUBMITTED` | `REVIEWED`)

### `Measurement`
Individual load test points evaluated against Maximum Permissible Error.
- `verificationId` (Foreign Key -> `Verification.id`)
- `testNumber` (Int, 1, 2, 3...)
- `referenceValue` (Float, standard weight, e.g. 5.0 kg)
- `observedValue` (Float, scale reading, e.g. 5.01 kg)
- `error` (Observed - Reference)
- `percentageError` (Absolute Error / Reference * 100)
- `allowedError` (Calculated MPE tolerance)
- `result` (`PASS` | `FAIL`)

### `Certificate`
Official digitally verifiable certificate.
- `id` (String UUID)
- `certificateNumber` (Unique String, e.g. "CERT-2026-000001")
- `issueDate` (DateTime)
- `expiryDate` (DateTime)
- `status` (`VALID`, `EXPIRING_SOON`, `EXPIRED`, `REVOKED`)
- `qrCodeData` (Public verification URL)
- `digitalSignature` (Cryptographic verification string)
- `revokedAt`, `revocationReason`

### `Payment`
Statutory treasury fee deposit ledger.
- `id` (String UUID)
- `paymentNumber` (Unique String, e.g. "PAY-2026-000001")
- `receiptNumber` (Unique String, e.g. "REC-2026-000001")
- `applicationId` (Foreign Key -> `VerificationApplication.id`, Optional)
- `businessId` (Foreign Key -> `Business.id`)
- `amount` (Float, statutory fee amount)
- `feeType` (String, e.g. "Verification Fee", "Re-Verification Fee")
- `paymentMethod` (String, e.g. "GOV_TREASURY_NETBANKING", "UPI", "TREASURY_CHALLAN")
- `transactionRef` (Unique String, e.g. "TXN-DEMO-13790945")
- `status` (`PENDING`, `PAID`, `FAILED`, `REFUNDED`)
- `paidAt` (DateTime)
- `receiptPdfUrl` (String, Optional)

### `Complaint`
Citizen and consumer vigilance and grievance redressal registry.
- `id` (String UUID)
- `complaintNumber` (Unique String, e.g. "CMP-2026-000001")
- `businessId` (Foreign Key -> `Business.id`, Optional)
- `assignedOfficerId` (Foreign Key -> `Officer.id`, Optional)
- `reporterName` (String)
- `reporterEmail` (String)
- `reporterPhone` (String, Optional)
- `category` (`SHORT_WEIGHING`, `UNVERIFIED_SCALE`, `TAMPERED_SEAL`, `PROCEDURAL_DELAY`, `OFFICER_MISCONDUCT`, `OTHER`)
- `certificateNumber` (String, Optional)
- `instrumentId` (String, Optional)
- `description` (Text)
- `evidenceUrl` (String, Optional)
- `location` (String, Optional)
- `status` (`SUBMITTED`, `UNDER_INVESTIGATION`, `RESOLVED`, `REJECTED`)
- `investigationNotes` (Text, Optional)
- `resolutionSummary` (Text, Optional)
- `resolvedAt` (DateTime, Optional)
