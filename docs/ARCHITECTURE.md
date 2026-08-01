# My Society – System Architecture Document

## Overview

A full-stack React PWA hosted on Firebase, supporting three roles (Owner, Tenant, Admin/Caretaker) for managing a residential society with digital payments, automated billing, and AI-driven insights.

```
┌─────────────────────────────────────────────────────────────┐
│                     React PWA (Vite)                        │
│  Firebase Hosting  ·  Role-based routing  ·  MUI           │
└─────────────────────────────────────────────────────────────┘
        │                             │
        ▼                             ▼
┌──────────────┐            ┌──────────────────────┐
│  Firebase    │            │   Firebase Cloud      │
│  Auth        │            │   Functions (v2)      │
│  (Phone OTP) │            │   asia-south1         │
└──────────────┘            └──────────────────────┘
        │                             │
        ▼                             ▼
┌──────────────────────────────────────────────────┐
│           Firebase Firestore (NoSQL)             │
│  societies / flats / users / bills / payments /  │
│  utilityReadings / parkingSlots / expenses /     │
│  salaries / meetings / notices / notifications  │
└──────────────────────────────────────────────────┘
        │                             │
        ▼                             ▼
┌──────────────┐            ┌─────────────────────┐
│  Firebase    │            │  External Services  │
│  Cloud Msg   │            │  MSG91 (SMS)         │
│  (FCM/Push)  │            │  SendGrid (Email)    │
└──────────────┘            │  UPI Deep-link       │
                            └─────────────────────┘
```

## Technology Stack

| Layer            | Technology                                 |
|------------------|--------------------------------------------|
| Frontend         | React 18 + Vite + MUI v5                   |
| Auth             | Firebase Auth – Phone OTP (reCAPTCHA)      |
| Database         | Firebase Firestore (NoSQL)                 |
| Functions        | Firebase Cloud Functions v2 (Node 20)      |
| Hosting          | Firebase Hosting (SPA, CDN)                |
| Push             | Firebase Cloud Messaging (FCM)             |
| Email            | SendGrid (via Cloud Functions)             |
| SMS              | MSG91 API (via Cloud Functions)            |
| Payments         | UPI Intent deep-link + manual UTR capture |
| Charts           | Recharts                                   |
| Forms            | React Hook Form                            |

## Roles

| Role     | Permissions                                                                          |
|----------|--------------------------------------------------------------------------------------|
| Admin    | Full access – create bills, manage users, record expenses/salaries, post notices     |
| Owner    | View/pay bills, view utilities, meetings, notices, parking                           |
| Tenant   | Same as Owner (scoped to their flat)                                                 |
| Pending  | No access – awaits admin approval                                                    |

## Data Flow

### Login Flow
```
User enters phone → Firebase Auth sends OTP → User verifies OTP
→ Firestore creates/reads user doc → Role-based redirect
```

### Billing Flow
```
Admin creates bill (or Cloud Function auto-generates on 1st)
→ Bill stored in Firestore
→ Cloud Function sends FCM notification to flat residents
→ Resident clicks Pay → UPI deep-link opens their UPI app
→ Payment complete → Resident enters UTR ref
→ Firestore batch: bill marked paid + payment document created
→ Cloud Function trigger: payment confirmation notification sent
```

### Monthly Auto-Billing
```
Cloud Scheduler: 1st of month 00:00 IST
→ Fetch all societies + flats
→ For each flat: create Maintenance bill (if not exists)
→ Set due date to 10th of month
```
