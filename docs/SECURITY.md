# MEASUREGX — Security & Cryptographic Integrity Architecture

## 1. Security Philosophy & Threat Model

MEASUREGX is engineered as an enterprise-grade Legal Metrology GovTech platform designed to protect consumers, merchants, and regulatory bodies against fraudulent weights, counterfeit certificates, and unauthorized alterations.

---

## 2. Declaration of Security Controls: Implemented vs. Planned

| Defensive Control | Category | Status | Technical Implementation |
| :--- | :--- | :--- | :--- |
| **Bcrypt Password Hashing** | Identity | **IMPLEMENTED** | Bcrypt with 10 salt rounds executed prior to persistence |
| **Stateless Bearer JWT** | Identity | **IMPLEMENTED** | HMAC-SHA256 signed tokens with 24-hour expiration |
| **Role-Based Access Control** | Authorization | **IMPLEMENTED** | Express middleware `requireRole([roles])` enforced on all protected routes |
| **Multi-Tenant Ownership** | Authorization | **IMPLEMENTED** | Object-level tenancy checks ensuring merchants access only their records |
| **SHA-256 Digital Certificate Seal** | Cryptography | **IMPLEMENTED** | Format: `SHA256-RSA:<certId>|<customId>|<officerCode>|<timestamp>` |
| **Tamper-Evident QR Payloads** | Cryptography | **IMPLEMENTED** | QR codes encode direct validation URL referencing immutable certificate records |
| **GPS Geolocation Verification** | Telemetry | **IMPLEMENTED** | Latitude, longitude, accuracy radius, and timestamp acquired on-site |
| **SQL Injection Immunity** | Data Layer | **IMPLEMENTED** | Prisma ORM utilizes parameterized statements exclusively |
| **Immutable System Audit Trail** | Auditing | **IMPLEMENTED** | Dedicated `AuditLog` table logging user, role, entity, entityId, IP, timestamp |
| **File Upload Sandboxing** | Storage | **IMPLEMENTED** | Multer disk storage, strict MIME whitelist (JPEG/PNG/PDF), 10MB limit, UUID filenames |
| **Secrets Management (.env)** | Secrets | **IMPLEMENTED** | Environment isolation; no credentials committed to git version control |
| **CORS Policy** | Network | **IMPLEMENTED** | Express CORS middleware configured for cross-origin client access |
| **Hardware Security Module (HSM)** | Cryptography | **PLANNED** | FIPS 140-2 Level 3 HSM PKI integration for state-level root certificate authority |
| **Distributed Rate Limiting** | Network | **PLANNED** | Redis token-bucket rate limiting for high-concurrency public QR scanning endpoints |

---

## 3. Cryptographic Verification & Anti-Counterfeiting

### 3.1 Digital Certificate Issuance
When a Legal Metrology Officer approves an application following a passing physical test:
1. A unique sequential Certificate ID is generated: `CERT-YYYY-XXXXXX`.
2. A cryptographic SHA-256 digital stamp is calculated across immutable certificate attributes:
   $$\text{Signature} = \text{SHA256}(\text{certId} \parallel \text{customId} \parallel \text{officerCode} \parallel \text{issueDate} \parallel \text{secretSalt})$$
3. A public QR code payload is generated pointing directly to:
   `https://<domain>/verify/<certificateNumber>`
4. Any consumer, merchant, or enforcement officer scanning the QR code receives an instant, unforgeable verification dossier verified against the primary database.

---

## 4. Role-Based Access Control (RBAC) Specification

| Resource / Route Group | Public | Business Owner | Legal Metrology Officer | State Admin |
| :--- | :---: | :---: | :---: | :---: |
| **Public QR Verification (`/verify/:id`)** | Read | Read | Read | Read |
| **Public Concern Filing (`/report-concern`)** | Write | Write | Write | Write |
| **Merchant Fleet (`/api/instruments`)** | Denied | Read / Write (Own) | Read (District) | Read / Write (Statewide) |
| **Verification Applications (`/api/applications`)** | Denied | Read / Write (Own) | Read / Approve (District) | Read / Write (Statewide) |
| **Field Load Test (`/api/verifications`)** | Denied | Denied | Read / Write (Assigned) | Read (Statewide) |
| **Enforcement Monitoring (`/api/enforcement`)** | Denied | Read (Own Notices) | Read / Write (Full) | Read / Write (Directorate) |
| **Immutable Audit Logs (`/api/admin/audit-logs`)** | Denied | Denied | Denied | Read Only |

---

## 5. Audit Logging Architecture

All state-altering actions invoke non-blocking asynchronous audit logging via `auditService.logAudit()`:

```json
{
  "id": "e4f828a2-192b-42b7-8724-1fa99b1092a1",
  "userId": "usr_9443120001",
  "userRole": "OFFICER",
  "action": "ENFORCEMENT_CASE_CREATED",
  "entity": "EnforcementCase",
  "entityId": "ENF-2026-000001",
  "description": "Enforcement case ENF-2026-000001 registered: Expired Verification (High priority).",
  "ipAddress": "192.168.1.42",
  "createdAt": "2026-09-23T14:30:00.000Z"
}
```

Audit entries are append-only; the database schema exposes no update or deletion handlers.
