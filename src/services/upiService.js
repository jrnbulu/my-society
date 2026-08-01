/**
 * UPI payment utilities.
 *
 * On mobile browsers, we construct a UPI deep-link URI and open it.
 * The user completes payment in their UPI app and returns to the browser.
 * We then capture the transaction reference number manually or via callback.
 */

/**
 * Build a UPI intent URL.
 * @param {Object} params
 * @param {string} params.vpa     - Society's UPI VPA (e.g. society@upi)
 * @param {string} params.name    - Payee name
 * @param {number} params.amount  - Amount in INR
 * @param {string} params.txnNote - Transaction note
 * @param {string} params.txnId   - Merchant transaction ID
 */
export function buildUPIUrl({ vpa, name, amount, txnNote, txnId }) {
  const params = new URLSearchParams({
    pa: vpa,
    pn: name,
    am: amount.toFixed(2),
    cu: "INR",
    tn: txnNote,
    tr: txnId,
  });
  return `upi://pay?${params.toString()}`;
}

/**
 * Generate a unique transaction reference ID.
 */
export function generateTxnId(prefix = "SOC") {
  return `${prefix}${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

/**
 * Open the UPI intent on mobile.
 * Returns a promise that resolves when the user comes back to the app.
 * @param {string} upiUrl
 */
export function openUPIIntent(upiUrl) {
  return new Promise((resolve) => {
    window.location.href = upiUrl;
    // After app switch, user returns; we wait a moment then resolve
    const onFocus = () => {
      window.removeEventListener("focus", onFocus);
      resolve();
    };
    window.addEventListener("focus", onFocus);
  });
}

/**
 * UPI apps supported for Android deep links (for "choose app" button sheet).
 */
export const UPI_APPS = [
  { name: "GPay", packageIntent: "com.google.android.apps.nbu.paisa.user" },
  { name: "PhonePe", packageIntent: "com.phonepe.app" },
  { name: "Paytm", packageIntent: "net.one97.paytm" },
  { name: "BHIM", packageIntent: "in.org.npci.upiapp" },
];
