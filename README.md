# MEASUREGX Mobile — Field Officer & GATC Verification Suite
**Smart India Hackathon 2026 | Problem Statement: SIH26036**  
*Department of Consumer Affairs • Legal Metrology*

---

## 📱 Overview

MEASUREGX Mobile is a dedicated, offline-first mobile application built for **Legal Metrology Officers (LMO)** and **Authorized Government Approved Test Centre (GATC)** field inspectors.

It operates against the **single centralized Node.js API Gateway (Port 5000)** and Postgres database, providing on-site verification, OIML R 76-1 tolerance verification, GPS geofencing, security seal logging, and a 3-stage offline synchronization pipeline.

---

## 🏗️ Architecture & Dual Development Setup

- **VS Code Window 1 (`measuregx/web`)**: Web Portal, Node.js API Gateway (Port 5000), FastAPI OIML Engine (Port 8000), and SQLite/PostgreSQL Database.
- **VS Code Window 2 (`measuregx/mobile`)**: Standalone Expo / React Native Field App located in this folder.

### Network Topology
```
[ Field Officer Mobile App ] ───HTTP/REST───► [ Node.js Gateway :5000 ] ───► [ PostgreSQL / Prisma ]
   │                                                 ▲
   └── Offline Queue (LOCAL -> SYNC_PENDING) ────────┤
```

---

## 🚀 How to Run (VS Code Window 2)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Expo Development Server
```bash
npx expo start
```

### 3. Running with Expo Go (On Physical Android / iPhone):
1. Install **Expo Go** from Google Play Store (Android) or Apple App Store (iOS).
2. Ensure your phone and development PC are connected to the **same Wi-Fi network**.
3. In this mobile project terminal, run:
   ```bash
   npx expo start
   ```
4. Metro Bundler will display a terminal QR code.
   - **Android**: Open the **Expo Go** app and tap **"Scan QR Code"**.
   - **iPhone**: Open the default **Camera app**, point at the QR code, and tap the notification **"Open in Expo Go"**.
5. Once loaded on your phone:
   - On the mobile login screen, tap **"⚙️ Server Endpoint"**.
   - Set your PC's local Wi-Fi IP (e.g. `http://192.168.1.15:5000/api`).
   - Tap **"LMO Officer"** or **"GATC Lab"** quick button to sign in!

### 4. Running with Emulators / Simulators:
- **Android Emulator**: In the Expo terminal, press `a` (connects via `http://10.0.2.2:5000/api`).
- **iOS Simulator**: In the Expo terminal, press `i` (connects via `http://localhost:5000/api`).
- **Web Browser Simulator**: In the Expo terminal, press `w` (connects via `http://localhost:5000/api`).

---

## 🔑 Demo Field Credentials

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| **LMO Officer** | `officer@mesuregx.demo` | `Officer@123` | Government Legal Metrology Inspector |
| **GATC Lab** | `gatc@mesuregx.demo` | `Gatc@123` | Authorized Calibration Laboratory |
| **Admin** | `admin@mesuregx.demo` | `Admin@123` | System Administrator Oversight |

*Note: Quick demo buttons are built right into the mobile login screen for 1-tap evaluator testing.*

---

## 🔄 3-Stage Offline Sync Engine

1. **`LOCAL`**: Officer performs field inspection in remote location without cellular data. Test readings, photos, and digital signature are saved into device storage.
2. **`SYNC_PENDING`**: When officer opens Sync Queue and initiates sync, records are locked for cloud upload.
3. **`SYNCED`**: Once the central gateway (Port 5000) confirms certificate generation, the record is removed from device storage and available statewide.

---

## ⚖️ Features Checklist

- [x] OIML R 76-1 real-time error verification ($\pm 0.5e$, $\pm 1.0e$, $\pm 1.5e$)
- [x] On-site GPS Geofence verification
- [x] Security lead seal serial number logging
- [x] Digital confirmation and certificate generation
- [x] QR code scanning and instant instrument history lookup
- [x] Dynamic server IP configuration for any test environment
