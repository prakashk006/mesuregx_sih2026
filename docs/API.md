# MESUREGX — REST API Documentation

Base URL: `http://localhost:5000/api`

---

## 1. Authentication

### `POST /auth/register`
Registers a new commercial trade establishment and business owner.

**Request Body:**
```json
{
  "businessName": "Sri Lakshmi Stores",
  "ownerName": "K. Ramanathan",
  "email": "ramanathan@lakshmistores.com",
  "mobileNumber": "+91 98940 12345",
  "businessAddress": "42 Cross Cut Road, Gandhipuram",
  "city": "Coimbatore",
  "district": "Coimbatore",
  "state": "Tamil Nadu",
  "pincode": "641012",
  "businessType": "Retail Grocery & Provisions",
  "gstNumber": "33AABCL1234F1Z5",
  "password": "Password@123",
  "confirmPassword": "Password@123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful. Please login to continue.",
  "data": {
    "userId": "uuid-v4",
    "email": "ramanathan@lakshmistores.com",
    "businessName": "Sri Lakshmi Stores"
  }
}
```

---

### `POST /auth/login`
Authenticates a user and returns a signed JWT token.

**Request Body:**
```json
{
  "email": "business@mesuregx.demo",
  "password": "Business@123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "uuid-v4",
      "name": "K. Ramanathan",
      "email": "business@mesuregx.demo",
      "role": "BUSINESS_OWNER"
    }
  }
}
```

---

## 2. Measuring Instruments

### `GET /instruments`
Lists registered instruments. Automatically filtered by business for `BUSINESS_OWNER`, or searchable across the state for `OFFICER` and `ADMIN`.

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "instruments": [
      {
        "id": "inst-uuid",
        "customId": "WX-1001",
        "instrumentType": "Electronic Weighing Machine",
        "manufacturer": "Essae-Teraoka Ltd",
        "model": "DS-215 Commercial",
        "serialNumber": "ES-2024-98711",
        "capacity": 30,
        "capacityUnit": "kg",
        "accuracyClass": "III",
        "installationLocation": "Billing Counter 1",
        "status": "VERIFIED"
      }
    ]
  }
}
```

### `POST /instruments`
Enrolls a new measuring scale, counter balance, or fuel dispenser.

**Request Body:**
```json
{
  "typeId": "type-uuid",
  "customId": "WX-1008",
  "manufacturer": "Essae-Teraoka Ltd",
  "model": "DS-415 Digital Scale",
  "serialNumber": "ES-2025-00129",
  "capacity": 30,
  "capacityUnit": "kg",
  "accuracyClass": "III",
  "installationLocation": "Billing Desk 3"
}
```

---

## 3. Verification Applications

### `POST /applications`
Submits a new legal metrology verification application.

**Request Body:**
```json
{
  "instrumentId": "inst-uuid",
  "applicationType": "Initial Verification",
  "preferredDate": "2026-09-25",
  "location": "42 Cross Cut Road, Coimbatore",
  "remarks": "New instrument calibration required"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "application": {
      "id": "app-uuid",
      "applicationNumber": "APP-2026-000009",
      "status": "SUBMITTED"
    }
  }
}
```

---

## 4. Verification Engine & Evaluation

### `POST /verifications/evaluate-live`
Sends physical test loads to Python FastAPI service to evaluate Maximum Permissible Error (MPE) and PASS/FAIL compliance.

**Request Body:**
```json
{
  "instrumentType": "WEIGHING_SCALE",
  "capacity": 30,
  "unit": "kg",
  "accuracyClass": "III",
  "measurements": [
    { "reference": 5, "observed": 5.01 },
    { "reference": 10, "observed": 9.99 },
    { "reference": 20, "observed": 20.01 }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "evaluation": {
      "overallResult": "PASS",
      "tests": [
        {
          "testIndex": 1,
          "reference": 5,
          "observed": 5.01,
          "error": 0.01,
          "percentageError": 0.2,
          "allowedError": 0.03,
          "result": "PASS",
          "remarks": "Within allowable Maximum Permissible Error (±0.0300 kg)"
        }
      ],
      "summary": {
        "totalTests": 3,
        "passed": 3,
        "failed": 0,
        "passRate": 100.0
      },
      "complianceStatus": "COMPLIANT_FOR_CERTIFICATION"
    }
  }
}
```

---

## 5. Public Certificate Verification

### `GET /public/verify/:certificateNumber`
**Public unauthenticated endpoint** for consumers and inspectors scanning the physical QR code on any instrument.

**Example Request:** `GET /api/public/verify/CERT-2026-000001`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "certificateNumber": "CERT-2026-000001",
    "status": "VALID",
    "issueDate": "2026-01-15T12:00:00.000Z",
    "expiryDate": "2027-01-14T23:59:59.000Z",
    "daysRemaining": 115,
    "instrument": {
      "customId": "WX-1001",
      "type": "Electronic Weighing Machine",
      "manufacturer": "Essae-Teraoka Ltd",
      "model": "DS-215 Commercial",
      "capacity": "30 kg",
      "accuracyClass": "III"
    },
    "business": {
      "name": "Sri Lakshmi Stores",
      "location": "Coimbatore, Coimbatore, Tamil Nadu"
    },
    "officer": {
      "name": "R. Natarajan",
      "officerCode": "OFF-TN-042",
      "designation": "Senior Inspector of Legal Metrology"
    }
  }
}
```

---

## 6. Payments & Treasury API

### `POST /payments/pay-demo`
Processes a demo statutory verification fee deposit and generates an official treasury receipt.

**Headers:** `Authorization: Bearer <token>` (Business Owner)

**Request Body:**
```json
{
  "applicationId": "APP-2026-000013",
  "paymentMethod": "GOV_TREASURY_NETBANKING",
  "bankReference": "E-CHALLAN-TEST-99"
}
```

**Response (201 Created / 200 OK if already paid):**
```json
{
  "success": true,
  "message": "Demo payment processed successfully.",
  "data": {
    "payment": {
      "id": "uuid-v4",
      "paymentNumber": "PAY-2026-000002",
      "receiptNumber": "REC-2026-000002",
      "applicationId": "uuid-v4",
      "businessId": "uuid-v4",
      "amount": 350.00,
      "feeType": "Verification Fee",
      "paymentMethod": "GOV_TREASURY_NETBANKING",
      "transactionRef": "TXN-DEMO-13790945",
      "status": "PAID",
      "paidAt": "2026-09-21T18:03:10.946Z"
    }
  }
}
```

### `GET /payments`
Lists payment records. Business Owners see their own payments; Admins see statewide treasury collections.

**Headers:** `Authorization: Bearer <token>`

---

## 7. Complaints & Citizen Grievances API

### `POST /complaints`
Logs a public or business grievance report regarding suspected short-weighing, unverified devices, or procedural delays. Can be anonymous or authenticated.

**Request Body:**
```json
{
  "reporterName": "A. Citizen",
  "reporterEmail": "citizen@example.org",
  "reporterPhone": "+91 98765 43210",
  "category": "SHORT_WEIGHING",
  "description": "When buying 1kg sugar, scale display jumps directly to 950g.",
  "location": "City Bazaar Vendor 4",
  "certificateNumber": "CERT-2026-000001"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Grievance lodged successfully. Tracking number: CMP-2026-000003",
  "data": {
    "complaint": {
      "id": "uuid-v4",
      "complaintNumber": "CMP-2026-000003",
      "status": "SUBMITTED",
      "category": "SHORT_WEIGHING"
    }
  }
}
```

### `GET /complaints`
Retrieves grievances. Admins see all statewide complaints; Officers see assigned complaints; Businesses see their own submitted grievances.

### `PATCH /complaints/:id` or `PUT /complaints/:id/status`
Updates investigation status and records officer findings.

**Headers:** `Authorization: Bearer <token>` (Officer or Admin)

**Request Body:**
```json
{
  "status": "RESOLVED",
  "investigationNotes": "Conducted spot audit with standard weights. Discrepancy confirmed and scale seized for recalibration.",
  "resolutionSummary": "Violating scale confiscated and compounding fee notice issued. Matter closed."
}
```

---

## 8. Enforcement Monitoring (`/api/enforcement`)

All enforcement routes require `Authorization: Bearer <token>`.

### `GET /api/enforcement/stats`
Returns aggregated real-time operational indicators:
- `openCases`, `underReview`, `violationsConfirmed`, `actionsPending`, `noticesIssued`, `resolvedCases`, `repeatViolations`, `expiredInstruments`.

### `GET /api/enforcement`
Lists enforcement dossiers with search and filtering by status, priority, district, violation type, and date range.

### `POST /api/enforcement`
Registers a new enforcement dossier linked to an existing business, instrument, application, or complaint:
```json
{
  "businessId": "uuid-v4",
  "instrumentId": "uuid-v4",
  "violationType": "Expired Verification",
  "priority": "High",
  "location": "124 Cross Cut Road, Gandhipuram, Coimbatore",
  "district": "Coimbatore",
  "observations": "Counter scale found in commercial trade with expired verification stamp.",
  "initialActionType": "Warning / Notice",
  "initialActionDescription": "Show-cause notice served to present scale for verification within 7 days."
}
```

### `GET /api/enforcement/:id`
Retrieves full case dossier with actions taken, evidence files, and linked entity metadata.

### `PUT /api/enforcement/:id/status`
Advances lifecycle state (`OPEN`, `UNDER_REVIEW`, `INSPECTION_REQUIRED`, `VIOLATION_CONFIRMED`, `ACTION_PENDING`, `NOTICE_ISSUED`, `FOLLOW_UP`, `RESOLVED`, `CLOSED`).

### `POST /api/enforcement/:id/actions`
Records a formal statutory action (Warning/Notice, Re-inspection, Correction Required, Case Resolution).

### `POST /api/enforcement/:id/mobile-sync`
Mobile field inspection synchronization endpoint updating GPS coordinates, physical observations, and status in one transaction.

---

## 9. Government Approved Test Centres (GATC) & Allocation

### `POST /api/auth/register-gatc`
Self-registration endpoint for accredited test centres. Creates GATC profile in `PENDING_APPROVAL` status and notifies administrators for review.

### `GET /api/gatc/active`
Returns active, approved GATCs with live workload counts (`activeWorkload`) for the Admin allocation modal. Supports `?district=` filtering.

### `GET /api/gatc/dashboard`
Returns GATC command center KPI metrics (Total Assigned, Pending Acceptance, Under Testing, Scheduled Today, Completed, Certificates Issued, Monthly Testing Volume, Category Distribution).

### `GET /api/gatc`
Admin statewide GATC registry with search, district filtering, and workload metrics. Requires `ADMIN` role.

### `PATCH /api/gatc/:id/status`
Admin action to approve (`ACTIVE`), deactivate (`INACTIVE`), or put on hold a GATC test centre.

### `POST /api/assignments/assign`
Allocates verification application to either an LMO inspector or an approved GATC test centre. Validates active status and records `AssignmentHistory`.

### `POST /api/assignments/reassign`
Admin reassignment between LMO and GATC or between GATCs. Requires mandatory reason and logs audit trail.

### `POST /api/assignments/accept`
GATC accepts an assigned test application, advancing status to `ACCEPTED` / `GATC_IN_PROGRESS`.

### `POST /api/assignments/reject`
GATC requests reassignment with a mandatory reason, returning case to administrator oversight.

### `GET /api/assignments/history/:applicationId`
Retrieves the complete immutable assignment timeline for an application.


