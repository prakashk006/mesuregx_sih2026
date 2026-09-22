# MESUREGX — Smart Legal Metrology Verification & Digital Certification Platform

MESUREGX is a full-stack digital platform designed to modernize legal metrology operations. It provides end-to-end management for commercial measuring instruments, verification requests, mobile field inspections with GPS tagging, automated tolerance rule evaluation via a Python FastAPI microservice, digital certificate generation with tamper-evident QR codes, public verification portals, and comprehensive audit trails.

---

## Architecture Overview

```text
[ React 18 + Vite Frontend (Port 5173) ]
                 │
                 ▼  REST API + JWT
[ Node.js + Express Backend (Port 5000) ]
       │                      │
       ▼ Prisma ORM           ▼ HTTP Evaluation
[ SQLite / PostgreSQL ]     [ Python FastAPI Verification Engine (Port 8000) ]
```

---

## Key Features

- **Multi-Portal Architecture**: Dedicated, authenticated environments for `BUSINESS_OWNER`, Legal Metrology `OFFICER`, and System `ADMIN`, plus zero-login Public citizen portals.
- **Instrument Management**: Registration of weighing scales, platform scales, fuel dispensers, and volume measures with accuracy classes (Class I to IIII).
- **Application Tracking**: Lifecycle management across `SUBMITTED`, `ASSIGNED`, `FIELD_VERIFICATION`, `OFFICER_REVIEW`, `APPROVED`, `REJECTED`, and `CERTIFICATE_ISSUED`.
- **Field Verification Console**: Mobile-friendly on-site inspection interface with live error calculation, Maximum Permissible Error (MPE) comparison, browser GPS capture, and evidence photo uploads.
- **Python FastAPI Rule Engine**: High-performance mathematical evaluation microservice implementing OIML R 76 and Legal Metrology (General) Rules 2011.
- **Digital Certificates & QR Validation**: Instant generation of official digital certificates featuring unique IDs (`CERT-2026-XXXXXX`), SHA-256 digital signatures, and scannable public QR codes.
- **Statutory Fee Treasury & Receipts**: Online fee calculation, demo payment gateway integration, and printable Form TR-6 treasury receipts (`REC-2026-XXXXXX`).
- **Citizen Grievance & Vigilance Portal**: Public reporting of suspected short-weighing, unverified scales, or tampered seals with tracking IDs (`CMP-2026-XXXXXX`) and officer spot investigation workflows.
- **Comprehensive Public Landing Portal**: 19-section Government Legal Metrology landing page with interactive tabs, certificate search console, OIML standards, and citizen FAQs.
- **Immutable Audit Trails**: System-wide audit logging recording timestamps, actors, IPs, and cryptographic state transitions.

---

## Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Axios, Recharts, `qrcode.react`, `lucide-react`, Custom Government/Enterprise CSS Design System.
- **Backend**: Node.js, Express.js, Prisma ORM, JWT, bcryptjs, Multer, Nodemailer.
- **Verification Service**: Python 3.10+, FastAPI, Uvicorn, Pydantic.
- **Database**: SQLite (Zero-configuration local setup) / PostgreSQL.

---

## Monorepo Folder Structure

```text
mesuregx/
├── frontend/                 # React + Vite Client
│   ├── src/
│   │   ├── components/       # StatusBadge, DigitalCertificateModal, QRScannerModal, Navbar, Sidebar
│   │   ├── context/          # AuthContext with role guards
│   │   ├── pages/            # Business, Officer, Admin, Public Verification, Landing, Payments, Complaints
│   │   ├── services/         # Axios API client
│   │   ├── App.jsx           # Router configuration
│   │   ├── index.css         # Enterprise Metrology Design System
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # Node.js + Express REST API
│   ├── src/
│   │   ├── config/           # Prisma singleton
│   │   ├── controllers/      # Auth, Business, Instrument, Application, Verification, Certificate, Admin, Payment, Complaint
│   │   ├── middleware/       # JWT Auth, RBAC, Multer upload, Centralized Error Handler
│   │   ├── routes/           # Express route definitions
│   │   ├── services/         # FastAPI client, Audit logger, Notification, Email
│   │   ├── utils/            # Status helper, certificate number generator
│   │   └── server.js         # Express server entrypoint
│   ├── prisma/
│   │   ├── schema.prisma     # Database models (including Payment & Complaint)
│   │   └── seed.js           # Realistic Indian demo dataset
│   ├── test/                 # Automated API test suite
│   │   ├── api.test.js
│   │   ├── e2e.test.js       # End-to-end certification lifecycle test
│   │   └── payments_complaints.test.js # Treasury & Grievances automated test
│   ├── package.json
│   └── .env
│
├── verification-engine/      # Python FastAPI Microservice
│   ├── app/
│   │   ├── main.py           # FastAPI application entrypoint
│   │   ├── rules.py          # OIML & Legal Metrology MPE mathematical formulas
│   │   └── schemas.py        # Pydantic validation models
│   ├── requirements.txt
│   └── README.md
│
├── uploads/                  # Storage target for field evidence photos
├── docs/
│   ├── ARCHITECTURE.md       # 4-tier GovTech topology & design document
│   ├── API.md                # Complete REST API specifications
│   ├── DATABASE.md           # Schema models and data dictionary
│   └── DEMO.md               # Step-by-step hackathon presentation guide
├── docker-compose.yml        # Multi-container Docker deployment
├── .env.example
├── package.json
└── README.md
```

---

## Prerequisites

- **Node.js**: v18+
- **npm**: v9+
- **Python**: v3.10+

---

## Quick Start (Running Locally)

### 1. Verification Engine (FastAPI)
```bash
cd verification-engine
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
*Health check available at: `http://localhost:8000/health`*

### 2. Backend (Express + Prisma)
```bash
cd backend
npm install
npx prisma db push
node prisma/seed.js
npm run dev
```
*Backend API runs at: `http://localhost:5000`*
*Health check available at: `http://localhost:5000/api/health`*

### 3. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
*Frontend opens at: `http://localhost:5173`*

---

## Demo Accounts

Pre-seeded with realistic Legal Metrology data:

| Portal | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Business Owner** | `business@mesuregx.demo` | `Business@123` | Sri Lakshmi Stores, Coimbatore |
| **Field Officer** | `officer@mesuregx.demo` | `Officer@123` | Senior Inspector R. Natarajan (OFF-TN-042) |
| **Administrator** | `admin@mesuregx.demo` | `Admin@123` | Dr. A. Swaminathan (State HQ) |

*(1-click auto-fill buttons are provided on the Login screen for instantaneous testing!)*

---

## Verification & Testing

To run the full suite of automated end-to-end tests:
```bash
cd backend
node test/e2e.test.js
node test/payments_complaints.test.js
```

All integration test suites validate:
- Server health check and database integrity
- Business, Officer, and Admin authentications
- Full verification lifecycle (`SUBMITTED` ➔ `ASSIGNED` ➔ `FIELD_TEST` ➔ `FASTAPI_MPE` ➔ `APPROVED` ➔ `QR_CERTIFICATE`)
- Public zero-auth certificate verification (`CERT-2026-000001`)
- Treasury fee payment processing, receipts, and revenue reconciliation
- Citizen grievance lodging, officer investigation notes, and resolution

For the live presentation walkthrough, see [`docs/DEMO.md`](docs/DEMO.md) and [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
