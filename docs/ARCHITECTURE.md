# MESUREGX — System Architecture & Design Document

## 1. System Topology Overview

MESUREGX is architected as an interconnected four-tier enterprise GovTech platform:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TIER 1: CLIENT PRESENTATION                     │
│  React 18 SPA + React Router + Lucide Icons + Vite Dev & Build Server  │
│  • Public Portal & QR Verification Tool (/verify, /report-concern)     │
│  • Business Owner Self-Service Portal (/business/*)                    │
│  • Legal Metrology Officer Mobile Inspection Console (/officer/*)      │
│  • State Metrology Administrative Oversight (/admin/*)                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST (JWT Auth)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  TIER 2: API GATEWAY & WORKFLOW ENGINE                 │
│                 Node.js 18+ & Express Enterprise Server                │
│  • Authentication (Bcrypt + JWT) & Role-Based Access Control (RBAC)    │
│  • Application Workflow State Machine (SUBMITTED ➔ CERTIFIED)          │
│  • Statutory Treasury Fee Calculation & Payment Processing             │
│  • Citizen Grievance Lifecycle Management                              │
│  • Geolocation & Media Evidence Validation                             │
│  • Cryptographic Digital Signature & Tamper-Evident SHA-256 Hashing   │
│  • Audit Logging & Real-Time Notification Dispatcher                   │
└───────────────────────┬──────────────────────────────┬─────────────────┘
                        │ Prisma ORM                   │ HTTP REST (JSON)
                        ▼                              ▼
┌────────────────────────────────────────┐  ┌────────────────────────────┐
│      TIER 3: PERSISTENCE & DATA        │  │  TIER 4: METROLOGY ENGINE  │
│  Prisma ORM with SQLite / PostgreSQL   │  │   Python 3.10+ & FastAPI   │
│  • Users, Roles & Officer Jurisdictions│  │  • OIML R 76-1 Calculation │
│  • Commercial Instrument Registry      │  │  • MPE Tolerance Engine    │
│  • Verification Load Test Ledgers      │  │  • Class I, II, III, IIII  │
│  • Cryptographic Digital Certificates  │  │  • Multi-point Load Tests  │
│  • Treasury Payment & Fee Challans     │  │  • Eccentricity Tests      │
│  • Grievance & Investigation Dossiers  │  │  • Repeatability Tests     │
│  • Immutable System Audit Log Ledger   │  │  • Instant PASS/FAIL Math  │
└────────────────────────────────────────┘  └────────────────────────────┘
```

---

## 2. Core Operational Portals

### 2.1 Public & Citizen Transparency Portal
- **Instant QR Verification (`/verify`, `/verify/:certificateNumber`):** Enables any citizen or merchant with a smartphone camera to scan the physical QR sticker affixed to a commercial scale and verify verification status, expiry date, inspected business details, and official officer seal.
- **Consumer Vigilance Reporting (`/report-concern`):** Allows immediate filing of short-weighing complaints, unverified scales, or tampered seals with optional photographic proof. Generates a trackable reference ID (`CMP-2026-XXXXXX`).

### 2.2 Business Owner Portal (`/business/*`)
- **Fleet Instrument Management:** Comprehensive register of commercial measuring devices, accuracy classes, serial numbers, and verification status.
- **Verification Applications:** Form-based workflow to initiate initial verification or annual periodic re-verification.
- **Treasury Payments & Receipts (`/business/payments`):** Online statutory fee calculation, instant demo payment processing, and printable government-standard treasury receipts (`REC-2026-XXXXXX`).
- **Grievances / Helpdesk (`/business/complaints`):** Track applications, request re-inspection, and submit procedural inquiries.

### 2.3 Legal Metrology Officer Console (`/officer/*`)
- **Mobile-Responsive Field Inspection Console:** Optimized for field tablets and smartphones.
- **Physical Test Measurement Inputs:** Multi-point load tests, zero tracking, tare tests, eccentricity tests, and repeatability measurements.
- **Automated FastAPI Integration:** Real-time round-trip calculation of Maximum Permissible Errors against standard nominal weights.
- **Evidence Acquisition:** Geolocation coordinate capture (Lat/Lon) and physical seal photo recording.
- **Digital Certificate & Stamp Issuance:** Generates SHA-256 digital stamp and embeds verifiable QR code payload.
- **Assigned Grievance Inquiries (`/officer/complaints`):** Conduct spot investigations and record field findings.

### 2.4 State Administrative Directorate (`/admin/*`)
- **Statewide Compliance Oversight:** Aggregated metrics, pass/fail ratios, and jurisdiction performance.
- **Officer Deployment & Assignment:** Manual and automated inspector dispatch across districts.
- **State Treasury Reconciliation (`/admin/payments`):** Statewide revenue auditing and receipt lookup.
- **Citizen Grievance Redressal (`/admin/complaints`):** Central oversight of consumer complaints with officer assignment and closure tracking.
- **Immutable Audit Trail (`/admin/audit-logs`):** Cryptographically verifiable chronological activity ledger.

---

## 3. Metrological Tolerance Engine (FastAPI)

The dedicated Python microservice strictly evaluates device readings in compliance with **OIML R 76-1 (2006)** and the **Legal Metrology (General) Rules, 2011**:

1. **Verification Scale Interval ($e$):**
   Determined by instrument capacity and accuracy class.
2. **Maximum Permissible Error (MPE) Calculation:**
   - **Class III (Medium Accuracy - Commercial Scales):**
     - $0 \le m \le 500e$: $\text{MPE} = \pm 1e$ (Initial) / $\pm 1e$ (Periodic)
     - $500e < m \le 2000e$: $\text{MPE} = \pm 1.5e$ (Initial) / $\pm 2e$ (Periodic)
     - $2000e < m \le 10000e$: $\text{MPE} = \pm 2e$ (Initial) / $\pm 3e$ (Periodic)
3. **Error Determination ($E$):**
   $$E = I + 0.5e - \Delta L - L$$
   where $I$ is indicated weight, $\Delta L$ is additional weight to next turning point, and $L$ is nominal applied standard weight.

---

## 4. Security & Cryptographic Integrity

- **Password Hashing:** Bcrypt with 10 salt rounds.
- **Authentication:** Stateless JSON Web Tokens (JWT) signed with HMAC-SHA256, carrying user role and identification.
- **Digital Certificates:** Each issued certificate embeds:
  - Unique sequential Certificate ID: `CERT-2026-XXXXXX`
  - SHA-256 Digital Signature: `SHA256-RSA:<certId>|<customId>|<officerCode>|<timestamp>`
  - Encoded QR URL pointing to public verification endpoint.
- **Immutable Audit Trail:** All state transitions (creation, payment, field inspection, decision, certificate generation) create immutable rows in the `AuditLog` table.
