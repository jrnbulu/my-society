# Firestore Collection-Per-Entity Schema

This project keeps one top-level Firestore collection per entity so the data model stays scalable and Firebase-friendly.

## Collections Overview

```
users/
flats/
bills/
payments/
utilities/
expenses/
salaries/
meetings/
```

---

## `users`

```json
{
  "userId": "auto-id",
  "name": "Jyoti Nayak",
  "phone": "+91XXXXXXXXXX",
  "email": "optional",
  "role": "OWNER | TENANT | ADMIN | CARETAKER",
  "flatId": "flat_101",
  "isActive": true,
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "fcmToken": "device token",
  "profileImageUrl": "storage link"
}
```

### Notes

- `role` controls access in Firestore rules.
- `flatId` links the user to a flat document.
- `fcmToken` is used for push notifications.

---

## `flats`

```json
{
  "flatId": "flat_101",
  "flatNumber": "A-101",
  "block": "A",
  "floor": 1,
  "ownerId": "userId",
  "tenantId": "userId",
  "areaSqFt": 1200,
  "parkingSlots": ["P1", "P2"],
  "maintenanceRate": 2.5,
  "createdAt": "timestamp"
}
```

---

## `bills`

```json
{
  "billId": "bill_2026_04_flat_101",
  "flatId": "flat_101",
  "month": "2026-04",
  "maintenanceAmount": 3000,
  "utilityAmount": 1200,
  "otherCharges": 500,
  "penalty": 0,
  "totalAmount": 4700,
  "status": "PAID | UNPAID | PARTIAL",
  "dueDate": "timestamp",
  "generatedAt": "timestamp",
  "paidAt": "timestamp",
  "paymentIds": ["payment1"],
  "breakdown": {
    "electricity": 800,
    "water": 400
  }
}
```

---

## `payments`

```json
{
  "paymentId": "payment_001",
  "billId": "bill_2026_04_flat_101",
  "flatId": "flat_101",
  "userId": "userId",
  "amount": 4700,
  "mode": "UPI",
  "upiApp": "GPay | PhonePe",
  "transactionId": "UPI123ABC",
  "status": "SUCCESS | PENDING | FAILED",
  "paidAt": "timestamp",
  "verifiedBy": "adminId",
  "proofImage": "storage link"
}
```

---

## `utilities`

```json
{
  "utilityId": "util_101_apr",
  "flatId": "flat_101",
  "type": "ELECTRICITY | WATER",
  "previousReading": 1200,
  "currentReading": 1350,
  "unitsConsumed": 150,
  "ratePerUnit": 6,
  "amount": 900,
  "recordedAt": "timestamp",
  "recordedBy": "caretakerId"
}
```

---

## `expenses`

```json
{
  "expenseId": "exp_001",
  "title": "Lift repair",
  "description": "Motor replacement",
  "amount": 15000,
  "category": "REPAIR | CLEANING | SECURITY",
  "paidTo": "Vendor Name",
  "invoiceUrl": "storage link",
  "date": "timestamp",
  "createdBy": "adminId"
}
```

---

## `salaries`

```json
{
  "salaryId": "sal_apr_001",
  "employeeName": "Ramesh",
  "role": "CARETAKER",
  "amount": 12000,
  "month": "2026-04",
  "status": "PAID | UNPAID",
  "paidDate": "timestamp",
  "paymentMode": "UPI | CASH"
}
```

---

## `meetings`

```json
{
  "meetingId": "meet_001",
  "title": "Monthly Meeting",
  "agenda": "Budget discussion",
  "date": "timestamp",
  "createdBy": "adminId",
  "notes": "Finalized maintenance increase",
  "attendees": ["user1", "user2"]
}
```

---

## Seed Script

Use `/home/runner/work/my-society/my-society/functions/scripts/seed-firestore.js` to create sample documents for every collection above.

```bash
cd /home/runner/work/my-society/my-society/functions
npm run seed:firestore
```

The script writes sample data into:

- `users`
- `flats`
- `bills`
- `payments`
- `utilities`
- `expenses`
- `salaries`
- `meetings`
