# MESUREGX — Hackathon Demo Script & Walkthrough

Follow this exact demonstration workflow to present MESUREGX live to judges and evaluators.

---

## Demo Accounts Credentials

| Role | Email | Password | Representative |
| :--- | :--- | :--- | :--- |
| **Business Owner** | `business@mesuregx.demo` | `Business@123` | K. Ramanathan (Sri Lakshmi Stores, Coimbatore) |
| **Field Officer** | `officer@mesuregx.demo` | `Officer@123` | Inspector R. Natarajan (Coimbatore, OFF-TN-042) |
| **Admin** | `admin@mesuregx.demo` | `Admin@123` | Dr. A. Swaminathan (State Legal Metrology HQ) |

*(Quick Auto-Fill buttons are also available directly on the login screen for instant 1-click access!)*

---

## SCENARIO 1: The Golden Pass Workflow (End-to-End Certification)

### Step 1: Business Portal & Instrument Registration
1. Open the app at `http://localhost:5173`.
2. Click **Sign In** and click the **Business** auto-fill button.
3. Observe the live **Business Dashboard**:
   - Total Instruments: 3
   - Active verified devices
   - 30-day expiry alerts
4. Navigate to **Instruments** in the sidebar.
5. Click **Register New Instrument**:
   - Type: `Electronic Weighing Machine`
   - Manufacturer: `Essae-Teraoka Ltd`
   - Model: `DS-415 Dual Display`
   - Serial: `ES-2026-77881`
   - Capacity: `30 kg`
   - Location: `Billing Counter 3`
6. Click **Register Instrument**. Observe it instantly added to the database with status `PENDING_VERIFICATION`.

### Step 2: Submit Verification Request
1. On the new instrument row, click **Apply**.
2. Select **Application Type**: `Initial Verification`.
3. Set preferred date and confirm premises location.
4. Click **Submit Verification Request**.
5. Observe the generated application ID (e.g. `APP-2026-000002`) in status `SUBMITTED`.
6. Log out from the top-right menu.

### Step 3: Officer Assignment & Field Inspection
1. Click **Sign In** and select the **Officer** auto-fill button (`officer@mesuregx.demo`).
2. Observe the **Officer Dashboard**:
   - Monthly inspection volume chart
   - Pending applications queue
3. Navigate to **Applications** and open the newly submitted application.
4. Click **Assign / Schedule**:
   - Select Inspector `R. Natarajan`
   - Set inspection date and time
   - Click **Confirm Assignment**. Status transitions to `ASSIGNED`.
5. Click **Start Field Verification** (or go to `Field Verification` in sidebar).

### Step 4: Live FastAPI Rule Engine Evaluation (PASS)
1. Notice the mobile-friendly field testing interface.
2. Click **Load PASS Demo** (populates `5kg -> 5.01kg`, `10kg -> 9.99kg`, `20kg -> 20.01kg`).
3. Click the blue button: **Run Verification Rule Engine**.
4. Observe:
   - Request evaluated by the **Python FastAPI microservice** on port 8000.
   - Live badges turn green: **PASS**.
   - Maximum Permissible Error (MPE) calculated accurately (±0.0300 kg).
   - Card displays: **OVERALL RESULT: PASS (100% Pass Rate)**.

### Step 5: Evidence & Geolocation Capture
1. In the **GPS Geolocation** card, click **Capture GPS Coordinates**.
   - Browser captures latitude and longitude with meter accuracy.
2. In the **Inspection Evidence Photos** card:
   - Select `Display Reading Under Load`
   - Upload any test photo (processed via Multer to `/uploads`).
   - Image preview renders instantly with delete capability.

### Step 6: Approval & Digital Certificate Generation
1. Click **Approve & Issue Certificate**.
2. A formal **Digital Verification Certificate** modal pops up immediately:
   - Official double-line border with Legal Metrology watermark
   - Unique Certificate Number: `CERT-2026-XXXXXX`
   - Validity Period: 12 months (calculated dynamically)
   - Officer signature hash
   - **High-contrast QR Code** pointing to `http://localhost:5173/verify/CERT-2026-XXXXXX`.
3. Click **Print / Save PDF** to demonstrate printer formatting.

### Step 7: Public QR Verification
1. Click the QR code or open: `http://localhost:5173/verify/CERT-2026-000001`.
2. Notice: **No authentication required** (Public consumer access).
3. The page displays the green authenticated banner:
   ```text
   ✓ CERTIFICATE VALID
   Digitally authenticated. 115 days remaining.
   ```
4. Full instrument serial and business verification details are displayed.

---

## SCENARIO 2: The Failure & Tamper Rejection Demo

Demonstrates that MESUREGX performs real mathematical verification and rejects non-compliant instruments.

1. In the **Field Verification** module, select any pending application.
2. Click **Load FAIL Demo**:
   - Test 1: `5kg -> 5.01kg` (PASS)
   - Test 2: `10kg -> 10.45kg` (Error: +0.45kg > MPE ±0.03kg -> **FAIL**)
   - Test 3: `20kg -> 20.80kg` (Error: +0.80kg > MPE ±0.06kg -> **FAIL**)
3. Click **Run Verification Rule Engine**:
   - Card flashes red: **OVERALL RESULT: FAIL**.
   - Remarks display: `Exceeded MPE by 0.7400 kg`.
   - "Approve" button is automatically disabled to prevent wrongful issuance!
4. The officer clicks **Reject Application**:
   - Enter mandatory rejection reason: `Calibration drift exceeds Legal Metrology allowable limits. Recalibration by licensed manufacturer required.`
   - Click **Confirm Rejection**.
5. The application is marked `REJECTED`, the instrument status updates to `REJECTED`, and the business owner receives an immediate red notification.

---

## SCENARIO 3: Admin System Audit & Reports

1. Login as `admin@mesuregx.demo` (`Admin@123`).
2. Open **Reports**:
   - View visual Recharts analytics: Pass Rate, Instruments by Category, Geographic Dispersion by District.
3. Open **Audit Logs**:
   - Observe timestamped records for every action performed above (`INSTRUMENT_CREATED`, `MEASUREMENT_SUBMITTED`, `APPLICATION_APPROVED`, `CERTIFICATE_ISSUED`).
4. Open **Verification Rules**:
   - Show configurable tolerance thresholds and validity durations.

---

## SCENARIO 4: Statutory Fee Treasury Payment & Official Receipt

1. Login as Business Owner (`business@mesuregx.demo`).
2. Navigate to **Payments & Treasury** (`/business/payments`).
3. Click **Pay Verification Fee (Demo)**.
4. Select an application (e.g. `APP-2026-000013`), choose payment method (`GOV_TREASURY_NETBANKING`), and submit.
5. Notice:
   - System records instant payment transaction (`TXN-DEMO-XXXXXX`).
   - Official Treasury Receipt Number issued (`REC-2026-XXXXXX`).
   - Click **View Receipt** to display the formal Treasury Form TR-6 receipt.
   - Click **Print / Download PDF** to preview printable government format.
6. Switch to Admin login (`admin@mesuregx.demo`) and open **Treasury & Fees** (`/admin/payments`):
   - View statewide revenue aggregation, fee breakdown, and transaction reconciliation ledger.

---

## SCENARIO 5: Consumer Grievance Lodging & Officer Resolution

1. Open the public portal at `http://localhost:5173`.
2. Click **Vigilance & Grievances** in the top service bar or navigate to `/report-concern`.
3. Fill in the consumer complaint form:
   - Category: `Suspected Short-Weighing`
   - Description: `Merchant counter scale reading skips 50g on zero balance.`
   - Premise / Location: `Central Market, Stall 12`
   - Enter contact details and submit.
4. Note the generated tracking number (e.g. `CMP-2026-000001`).
5. Login as Officer (`officer@mesuregx.demo`) and navigate to **Grievance Inquiries** (`/officer/complaints`):
   - Open the complaint.
   - Enter field investigation notes (`Inspected premise with calibrated 1kg M1 working standard. Recalibration issued.`).
   - Mark status as `RESOLVED`.
6. Login as Admin (`admin@mesuregx.demo`) and view **Grievance Oversight** (`/admin/complaints`):
   - Confirm complete investigation dossier and closed status.

