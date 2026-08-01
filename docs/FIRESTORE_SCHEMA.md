# Firestore Schema & Setup Guide

## Collections Overview

```
societies/
flats/
users/
bills/
payments/
utilityReadings/
parkingSlots/
expenses/
salaries/
meetings/
notices/
notifications/
```

---

## Collection: `societies`

**Document ID:** auto-generated (store in users.societyId)

```json
{
  "id": "soc_abc123",
  "name": "Sunrise Heights",
  "address": "Plot 12, Sector 5, Pune 411001",
  "city": "Pune",
  "state": "Maharashtra",
  "monthlyMaintenance": 2500,
  "electricityRate": 5.45,
  "waterRatePerKL": 8,
  "adminUid": "uid_admin1",
  "createdAt": "Timestamp"
}
```

---

## Collection: `flats`

**Document ID:** auto-generated

```json
{
  "societyId": "soc_abc123",
  "flatNumber": "A-101",
  "floor": 1,
  "wing": "A",
  "area": 850,
  "bedrooms": 2,
  "ownerName": "Ramesh Kumar",
  "ownerUid": "uid_owner1",
  "tenantUid": null,
  "status": "occupied",
  "parkingSlots": ["P-01"],
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

**Indexes:** `societyId` + `flatNumber`

---

## Collection: `users`

**Document ID:** Firebase Auth UID

```json
{
  "uid": "uid_owner1",
  "phone": "+919876543210",
  "name": "Ramesh Kumar",
  "email": "ramesh@example.com",
  "role": "owner",
  "societyId": "soc_abc123",
  "flatId": "flat_a101",
  "flatNumber": "A-101",
  "isActive": true,
  "fcmTokens": ["token1", "token2"],
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

**Role values:** `admin | owner | tenant | pending`

---

## Collection: `bills`

**Document ID:** auto-generated

```json
{
  "societyId": "soc_abc123",
  "flatId": "flat_a101",
  "flatNumber": "A-101",
  "type": "Maintenance",
  "month": "2024-01",
  "baseAmount": 2500,
  "lateFeePct": 10,
  "lateFeeAmount": 0,
  "totalAmount": 2500,
  "status": "unpaid",
  "dueDate": "Timestamp(2024-01-10)",
  "paidAt": null,
  "paymentId": null,
  "description": "Monthly maintenance Jan 2024",
  "createdBy": "system",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

**Type values:** `Maintenance | Water | Electricity | Ad-hoc | Penalty`
**Status values:** `unpaid | paid | partial | waived`

**Indexes:**
- `societyId` + `flatId` + `dueDate` DESC
- `societyId` + `status` + `dueDate` ASC (for overdue query)
- `societyId` + `createdAt` DESC (admin list)

---

## Collection: `payments`

**Document ID:** auto-generated

```json
{
  "societyId": "soc_abc123",
  "flatId": "flat_a101",
  "uid": "uid_owner1",
  "billId": "bill_xyz",
  "billType": "Maintenance",
  "month": "2024-01",
  "amount": 2500,
  "method": "UPI",
  "upiTxnId": "SOC17209876ABCD",
  "upiRef": "407123456789",
  "status": "success",
  "paidAt": "Timestamp",
  "createdAt": "Timestamp"
}
```

**Indexes:** `societyId` + `flatId` + `paidAt` DESC

---

## Collection: `utilityReadings`

**Document ID:** auto-generated

```json
{
  "societyId": "soc_abc123",
  "flatId": "flat_a101",
  "type": "Electricity",
  "month": "2024-01",
  "previousReading": 1500,
  "currentReading": 1620,
  "unitsConsumed": 120,
  "ratePerUnit": 5.45,
  "calculatedAmount": 654,
  "recordedBy": "uid_admin1",
  "createdAt": "Timestamp"
}
```

**Slab-based calculation** for electricity (see `src/utils/billingUtils.js`).

---

## Collection: `parkingSlots`

**Document ID:** auto-generated

```json
{
  "societyId": "soc_abc123",
  "slotNumber": "P-01",
  "type": "car",
  "status": "occupied",
  "flatId": "flat_a101",
  "vehicleNumber": "MH12AB1234",
  "allocatedBy": "uid_admin1",
  "updatedAt": "Timestamp"
}
```

**Indexes:** `societyId` + `slotNumber`

---

## Collection: `expenses`

**Document ID:** auto-generated

```json
{
  "societyId": "soc_abc123",
  "category": "Security",
  "amount": 15000,
  "date": "Timestamp",
  "month": "2024-01",
  "vendor": "GuardForce Ltd",
  "description": "Security guard salary",
  "receiptUrl": "https://...",
  "recordedBy": "uid_admin1",
  "createdAt": "Timestamp"
}
```

**Category values:** `Maintenance | Cleaning | Security | Electricity | Water | Garden | Repair | Equipment | Miscellaneous`

---

## Collection: `salaries`

**Document ID:** auto-generated

```json
{
  "societyId": "soc_abc123",
  "staffName": "Suresh Pawar",
  "staffRole": "Security Guard",
  "basicSalary": 12000,
  "bonus": 500,
  "deductions": 200,
  "netSalary": 12300,
  "paidDate": "Timestamp",
  "month": "2024-01",
  "paymentMode": "UPI",
  "recordedBy": "uid_admin1",
  "createdAt": "Timestamp"
}
```

---

## Collection: `meetings`

**Document ID:** auto-generated

```json
{
  "societyId": "soc_abc123",
  "title": "AGM 2024 – Annual Accounts Review",
  "scheduledAt": "Timestamp(2024-02-15T10:00:00)",
  "venue": "Society Hall, Ground Floor",
  "agenda": "1. Account review\n2. Budget 2024\n3. Maintenance hike vote",
  "status": "scheduled",
  "minutesUrl": null,
  "createdBy": "uid_admin1",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

**Status values:** `scheduled | completed | cancelled`

---

## Collection: `notices`

**Document ID:** auto-generated

```json
{
  "societyId": "soc_abc123",
  "title": "Water supply disruption on 5th Jan",
  "body": "Due to tank cleaning, water supply will be disrupted from 8am–12pm on 5th Jan.",
  "type": "Maintenance",
  "createdBy": "uid_admin1",
  "createdAt": "Timestamp"
}
```

**Type values:** `General | Maintenance | Emergency | Event | Rule Change`

---

## Collection: `notifications`

**Document ID:** auto-generated

```json
{
  "societyId": "soc_abc123",
  "recipientUids": ["uid_owner1", "uid_tenant1"],
  "title": "Payment Confirmed",
  "body": "₹2500 received for Maintenance – Jan 2024",
  "type": "payment",
  "read": false,
  "createdAt": "Timestamp"
}
```

**Type values:** `payment | reminder | notice | meeting | insight`

**Indexes:**
- `recipientUids` (array-contains) + `read`
- `recipientUids` (array-contains) + `createdAt` DESC

---

## Indexing Strategy Summary

All composite indexes are defined in `firestore.indexes.json` and should be deployed with:

```bash
firebase deploy --only firestore:indexes
```

Key patterns:
- **Unpaid bills query**: `societyId` + `status == unpaid` + `dueDate` ASC
- **Flat bills**: `societyId` + `flatId` + `dueDate` DESC
- **Monthly expenses**: `societyId` + `month` + `date` DESC
- **Notifications**: `recipientUids` array-contains + `read` filter
- **Parking allocation**: `societyId` + `slotNumber` (sorted display)
