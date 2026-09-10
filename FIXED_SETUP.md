# NaNb Fixed Project - Run Instructions

The visual design was intentionally kept unchanged. This build fixes the backend, secure login, account wishlist sync, checkout/order ownership, server-side pricing, stock validation, admin authentication, newsletter storage, contact storage, and product-data consistency.

## 1. Requirements
- Node.js 18 or newer
- MongoDB running locally on `mongodb://127.0.0.1:27017`

## 2. Install and seed
Open a terminal in the `backend` folder:

```bash
npm install
npm run check
npm run seed
npm start
```

`npm run seed` refreshes the product catalog and stock but preserves existing users and orders.

## 3. Open the website
Use the Express server instead of opening the HTML files directly:

`http://localhost:5000`

Admin page:

`http://localhost:5000/admin.html`

Local development admin credentials are stored only in `backend/.env`:
- Username: `admin`
- Password: `NaNbAdmin2026!`

Change `ADMIN_PASSWORD` and `AUTH_SECRET` in `backend/.env` before any real deployment.

## 4. Important behavior changes
- Login/signup require the backend and MongoDB; insecure local account fallback was removed.
- Orders are tied to the authenticated MongoDB user and users cannot request another user's order.
- Checkout ignores browser prices and recalculates product prices, bargains, promo discounts, fees, and stock on the server.
- Bargain prices use a signed 15-minute deal token and cannot be forged by editing localStorage/DevTools.
- Admin access is role-protected by the server; credentials are no longer embedded in frontend JavaScript.
- Wishlist items sync to the logged-in MongoDB account while keeping the same UI.
- Contact form messages and newsletter subscriptions are saved in MongoDB.
- The product API now keeps description, rating, color, keyword, sizes, and stock data.

## 5. Existing browser sessions
Because the old build used insecure browser-only sessions, log out and log in again after upgrading. If an old session causes confusion, clear site storage for localhost once and log in normally.

## Admin order actions added
- **Accept**: changes a pending order to `Accepted` and sets an estimated arrival time. The default is 72 hours after acceptance and can be changed with `ORDER_ARRIVAL_HOURS` in `backend/.env`.
- **Delete**: safely cancels/soft-deletes the order from the admin list, restores reserved stock, and keeps the order visible to the customer as `Cancelled`.
- Customer order tracking refreshes every 15 seconds while the page is open.
- Cancelled customers see: `Your order is cancelled. Please check your payment method and payment status. If you already paid, contact NaNb support.`

## Order Delete/Cancel Hotfix (Sep 9, 2026)
- Fixed admin Delete/Cancel returning HTTP 500 on some accepted or older orders.
- Cancellation now uses an atomic database update so older order records do not fail full-document validation.
- Stock restoration is best-effort and no longer blocks the customer-visible cancellation status.
- The cancelled order remains in the customer's order history with the payment-method warning, while it is hidden from the admin active-order list.
- Existing CSS/design files were not changed by this hotfix.
