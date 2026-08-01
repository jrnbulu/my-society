# 🏘 My Society – Society Management App

A React PWA for managing residential societies with Firebase backend.

## Features

- 📱 **Mobile-first** – Phone OTP login, responsive UI
- 🏠 **Multi-role** – Owner, Tenant, Admin/Caretaker
- 💰 **Billing & Payments** – Auto-generated monthly bills, UPI payment integration
- ⚡ **Utility Management** – Electricity/water readings with slab-based calculation
- 🚗 **Parking** – Slot allocation and management
- 💼 **Expenses & Salaries** – Track society expenses and staff salaries
- 📅 **Meetings & Notices** – Schedule meetings, post notices
- 🔔 **Notifications** – Push (FCM), SMS (MSG91), In-app

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) – System architecture
- [`docs/FIRESTORE_SCHEMA.md`](docs/FIRESTORE_SCHEMA.md) – Database schema
- [`docs/SETUP_GUIDE.md`](docs/SETUP_GUIDE.md) – Complete setup instructions

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your Firebase config

# 3. Start development server
npm run dev

# 4. Build for production
npm run build

# 5. Deploy to Firebase
firebase deploy
```

## Project Structure

```
my-society/
├── src/
│   ├── contexts/          # AuthContext, AppContext
│   ├── components/common/ # AppLayout, ProtectedRoutes
│   ├── pages/             # All page components
│   ├── services/          # Firestore, UPI, Notifications
│   ├── utils/             # Billing calculations
│   └── firebase.js        # Firebase initialization
├── functions/src/         # Cloud Functions
│   └── index.js           # Scheduled jobs + triggers
├── docs/                  # Architecture & setup docs
├── firestore.rules        # Security rules
├── firestore.indexes.json # Composite indexes
└── firebase.json          # Hosting + emulator config
```

## Tech Stack

- **Frontend**: React 18, Vite, MUI v5
- **Backend**: Firebase (Auth, Firestore, Functions, Hosting, FCM)
- **Payments**: UPI Intent deep-link
- **Notifications**: FCM (push), MSG91 (SMS)
- **Charts**: Recharts
