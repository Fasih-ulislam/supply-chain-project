# Supply Chain Management System

A full-stack multi-role supply chain platform that handles end-to-end order lifecycle management -- from suppliers to distributors to customers -- with RSA digital signatures and QR code verification to ensure order authenticity and prevent tampering.

---

## Live Demo

🔗 [Coming Soon](#)

---

## Screenshots

> _Screenshots coming soon_

---

## Features

- **Multi-Role Access** — Four distinct roles (Admin, Supplier, Distributor, Customer) each with their own dashboard and permissions
- **Order Lifecycle Management** — Full order flow covering creation, approval, rejection, reassignment, multi-leg distributor routing, and delivery confirmation
- **RSA Digital Signatures** — Orders are hashed and signed by suppliers using RSA key pairs; customers can verify authenticity on delivery
- **QR Code Verification** — Tamper-proof QR codes generated per order, scannable by customers to confirm integrity
- **Inventory Control** — Stock automatically deducted on order approval with oversell prevention
- **Audit Trail** — All order status changes are logged with tracking events
- **OTP Registration** -- Users verify via email OTP on signup; role upgrades require Admin approval
- **Email Notifications** -- Nodemailer handles OTPs, role approvals, and private key delivery

---

## Tech Stack

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Axios
- React Context API
- QR Code scanning and generation libraries

**Backend**
- Node.js + Express.js
- Prisma ORM
- MySQL
- JSON Web Tokens (JWT)
- Nodemailer
- Joi (request validation)
- Helmet + CORS (security)

---

## How It Works

1. **Customer** places an order (status: `PENDING`)
2. **Supplier** approves -- signs the order with their RSA private key, assigns a distributor, generates a QR token (status: `APPROVED`)
3. **Distributor** accepts the leg, confirms receipt, and ships onward (status: `IN_PROGRESS`)
4. If rejected at any point, the order returns to the supplier for reassignment
5. **Customer** receives the package, scans the QR code to verify signatures, and confirms delivery (status: `DELIVERED`)

---

## Project Structure

```
Supply-Chain/
├── frontend/
│   ├── app/                # Next.js App Router pages and dashboard
│   ├── components/         # Role-specific UI components
│   ├── services/           # API service functions
│   ├── context/            # Auth context
│   └── types/              # TypeScript types and enums
├── BackEnd/
│   ├── controllers/        # Auth, order, supplier, distributor logic
│   ├── services/           # Business logic layer
│   ├── routes/             # API route definitions
│   ├── middlewares/        # Auth, rate limiting, validation
│   ├── utils/              # RSA crypto utilities
│   └── prisma/             # Schema and migrations
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MySQL database

### Installation

```bash
# Clone the repository
git clone https://github.com/Fasih-ulislam/supply-chain.git
cd supply-chain

# Install backend dependencies
cd BackEnd
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Variables

Create a `.env` file in the `BackEnd` directory:

```env
PORT=5000
DATABASE_URL=mysql://user:password@localhost:3306/supplychain
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

### Database Setup

```bash
cd BackEnd
npx prisma migrate dev
```

### Run the App

```bash
# Start the backend
cd BackEnd
npm run dev

# Start the frontend
cd frontend
npm run dev
```

---

## Author

**Muhammad Fasih Ul Islam**
- GitHub: [@Fasih-ulislam](https://github.com/Fasih-ulislam)
- LinkedIn: [muhammad-fasih-cs](https://linkedin.com/in/muhammad-fasih-cs)
