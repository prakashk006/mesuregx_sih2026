# MEASUREGX — Legal Metrology Enforcement Monitoring Module

## 1. Executive Summary & Purpose

The **Enforcement Monitoring Module** provides state Legal Metrology Officers (LMOs) and Directorate Administrators with a statutory surveillance console to track, investigate, and penalize commercial measuring instrument infractions in strict accordance with the **Legal Metrology Act, 2009** and the **Legal Metrology (General) Rules, 2011**.

---

## 2. Statutory Enforcement Lifecycle State Machine

Enforcement cases transition through an immutable, strictly audited 8-stage state machine:

```
[CASE IDENTIFIED / OPEN]
           │
           ▼
    [UNDER REVIEW]
           │
           ▼
 [INSPECTION REQUIRED]
           │
           ▼
[VIOLATION CONFIRMED]
           │
           ▼
[ENFORCEMENT ACTION] (ACTION PENDING / NOTICE ISSUED)
           │
           ▼
      [FOLLOW-UP]
           │
           ▼
     [RESOLUTION]
           │
           ▼
    [CASE CLOSED]
```

### State Definitions & Trigger Criteria

1. **`OPEN` (Case Identified):** Infraction detected via routine inspection, consumer vigilance report, or automated validity expiration trigger.
2. **`UNDER_REVIEW`:** Supervisory evaluation by Zonal Inspector or Assistant Controller.
3. **`INSPECTION_REQUIRED`:** On-site forensic visit scheduled; officer allocated to site.
4. **`VIOLATION_CONFIRMED`:** Physical tolerance measurement error, broken lead wire seal, or unapproved model variation verified on-site.
5. **`ACTION_PENDING` / `NOTICE_ISSUED`:** Formal Statutory Show-Cause Notice under Section 24 issued to merchant with compliance deadline.
6. **`FOLLOW_UP`:** Mandated compliance deadline active; surprise re-audit scheduled.
7. **`RESOLVED`:** Merchant completed recalibration or re-stamping; compliance verified by inspector.
8. **`CLOSED`:** Case archived in immutable state regulatory archives.

---

## 3. Zero-Duplication Record Linkage Architecture

Enforcement dossiers link directly to active entities via foreign keys rather than duplicating business or instrument records:

| Linked Entity | Reference Key | Description |
| :--- | :--- | :--- |
| **Business** | `businessId` | Commercial establishment subject to enforcement |
| **Instrument** | `instrumentId` | Specific scale, fuel dispenser, or weighbridge |
| **Application** | `applicationId` | Original verification filing if inspection failed |
| **Certificate** | `certificateId` | Lapsed, revoked, or un-displayed certificate |
| **Complaint** | `complaintId` | Citizen short-weighing complaint that triggered case |
| **Officer** | `officerId` | Assigned Inspector responsible for investigation |

---

## 4. Configurable Violation Classifications

Violation types are categorized in accordance with departmental inspection standards:

- **Expired Verification:** Device used in commercial trade beyond annual validity date.
- **Failed Verification:** Device tested on-site exceeding Maximum Permissible Error (MPE) thresholds under OIML R 76-1.
- **Non-Compliant Instrument:** Unapproved model variation or un-certified load sensors installed without Model Approval.
- **Missing Certificate:** Verification certificate not framed and conspicuously displayed at point-of-sale.
- **Incorrect Display:** Customer-facing secondary display broken, omitted, or illegible.
- **Tampering/Irregularity:** Official lead wire seal cut, calibration potentiometer altered, or physical weights tampered.
- **Other:** Procedural or documentation non-compliance.

---

## 5. Mobile Field Inspection Console Flow

Field officers equipped with tablets or smartphones execute an on-site workflow:

```
Assigned Case
     ↓
Case Details Dossier
     ↓
Navigate & Capture GPS (Lat/Lon Coordinates)
     ↓
Inspect Commercial Instrument
     ↓
Capture Photographic Evidence (Fascia, Seals, Serial No.)
     ↓
Record Physical Test Observations & MPE Tolerance Error
     ↓
Advance Lifecycle Status (e.g. VIOLATION_CONFIRMED)
     ↓
Dispatch Statutory Action (Notice Issued / Confiscation Memo)
     ↓
Synchronize Telemetry (`POST /api/enforcement/:id/mobile-sync`)
```

---

## 6. Real-Time Dashboard KPI Indicators

The dashboard calculates metrics from live SQLite/PostgreSQL data:

1. **Open Cases:** Active dossiers under investigation.
2. **Under Review:** Cases awaiting supervisor endorsement.
3. **Violations Confirmed:** Infractions validated by on-site load tests.
4. **Actions Pending:** Cases awaiting statutory notice issuance.
5. **Notices Issued:** Active Section 24 show-cause notices dispatched.
6. **Resolved Cases:** Cases with verified compliance and closure.
7. **Repeat Violations:** Commercial traders with $> 1$ infractions across their fleet.
8. **Expired Scales:** Active commercial instruments operating past certificate validity date.

---

## 7. Enforcement API Reference

All routes require stateless Bearer JWT authentication:

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/enforcement/stats` | `OFFICER`, `ADMIN`, `BUSINESS_OWNER` | Real-time KPI dashboard counters |
| `GET` | `/api/enforcement` | `OFFICER`, `ADMIN`, `BUSINESS_OWNER` | List dossiers with multi-criteria filters |
| `POST` | `/api/enforcement` | `OFFICER`, `ADMIN` | Register new enforcement dossier |
| `GET` | `/api/enforcement/linkable-records` | `OFFICER`, `ADMIN` | Fetch existing records for zero-duplication linking |
| `GET` | `/api/enforcement/:id` | `OFFICER`, `ADMIN`, `BUSINESS_OWNER` | Full case dossier, timeline, and evidence |
| `PUT` | `/api/enforcement/:id/status` | `OFFICER`, `ADMIN` | Advance lifecycle state machine |
| `POST` | `/api/enforcement/:id/actions` | `OFFICER`, `ADMIN` | Dispatch statutory action notice |
| `POST` | `/api/enforcement/:id/evidence` | `OFFICER`, `ADMIN` | Upload photographic or memo evidence |
| `POST` | `/api/enforcement/:id/mobile-sync` | `OFFICER`, `ADMIN` | Single-call mobile GPS and field inspection sync |
| `GET` | `/api/enforcement/analytics` | `OFFICER`, `ADMIN` | Monthly trend, category distribution, district breakdown |
