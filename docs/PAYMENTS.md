# Payment Infrastructure

## 1. Flow Overview (MVP: Offline Manual)
For the MVP, we are utilizing an offline manual approval flow. Users select their payment method (e.g., Telebirr, CBE), transfer funds externally, and upload proof.

```text
User Selects Payment Method 
       ↓
App displays Admin Account Details (Phone/Account #)
       ↓
User transfers funds externally
       ↓
User uploads Screenshot + Transaction ID to App
       ↓
Payment record created (Status: PENDING)
       ↓
Admin reviews Admin Dashboard
       ↓
Admin cross-checks bank/telebirr SMS with Transaction ID
       ↓
Admin clicks "Approve" (Status: APPROVED)
       ↓
System finalizes Entry Generation (if campaign is still open)
       ↓
User Notified (via Web UI / Telegram Bot)
```

## 2. Payment Abstraction Layer
Even though the MVP is offline, the system must abstract this so that replacing it with an automated gateway (Chapa, Telebirr API) later is trivial.

```typescript
interface PaymentProvider {
  initializePayment(details: PurchaseDetails): Promise<PaymentSession>;
  verifyPayment(paymentId: string): Promise<PaymentStatus>;
}

// MVP Implementation
class ManualOfflineProvider implements PaymentProvider {
  async initializePayment(details) {
    // Generate pending payment record, prompt for screenshot upload
  }
  
  async verifyPayment(paymentId) {
    // Look up admin approval status in DB
  }
}
```

## 3. Edge Cases & Risks
- **Campaign Sold Out before Admin Approval:** If a user submits a payment, but the campaign hits `max_entries` before the Admin approves it, the system must NOT generate an entry. Instead, it credits the user's `Ledger` as an account balance, allowing them to use it for future campaigns, or initiates a manual refund process.
- **Fake Screenshots:** Relies purely on Admin vigilance matching the `Transaction ID`.
- **Double Submission:** The DB must enforce a unique constraint on `(provider, transaction_id)` to prevent multiple accounts submitting the same receipt.
