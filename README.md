# Supply Chain Management System

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC)
![Security](https://img.shields.io/badge/RSA-Digital_Signatures-blueviolet)
![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1)
![License](https://img.shields.io/badge/License-MIT-green)

A full-stack multi-role supply chain platform that handles end-to-end order lifecycle management -- from suppliers to distributors to customers -- with RSA digital signatures and QR code verification to ensure order authenticity and prevent tampering.

---

## Live Demo

🔗 [Coming Soon](#)

---

## Screenshots

> _Screenshots coming soon_

---

## Why This Exists

Traditional supply chains have a trust problem -- once a package leaves a supplier's hands, there is no reliable way for a customer to verify that what they receive is what was actually approved and shipped. This platform treats every order as a verifiable cryptographic record. Using RSA digital signatures and QR-based verification, the system ensures that from the moment a supplier approves an order to the moment a customer receives it, the data is authenticated and tamper-evident.

## Security Model

This is not a standard CRUD application. The platform implements a trust-but-verify approach across three layers:

- **Cryptographic integrity** -- Suppliers sign order hashes using RSA private keys generated and delivered to them by the Admin via Nodemailer. No one else can forge an approval.
- **Physical-digital link** -- Each approved order generates a QR token. Customers scan it on delivery to verify the supplier's signature against the order hash, bridging the physical package with its digital record.
- **Role-based access control** -- A strict four-role hierarchy (Admin, Supplier, Distributor, Customer) ensures each party only sees and acts on what they are supposed to.

---

## System Architecture

### Order Flow

1. **Customer** places an order → status: `PENDING`
2. **Admin** approves the supplier's role and generates their RSA key pair, delivered via email
3. **Supplier** approves the order -- signs the order hash with their RSA private key, assigns a distributor, and a QR token is generated → status: `APPROVED`
4. **Distributor** accepts the leg, confirms receipt, and ships onward → status: `IN_PROGRESS`
5. If a distributor rejects, the order returns to the supplier for reassignment
6. **Customer** receives the package, scans the QR code to verify the RSA signature, and confirms delivery → status: `DELIVERED`

### Flow Diagram

## ![flow-diagram](supply_chain_order_flow.svg)

## Features

- **Multi-Role Access** -- Four distinct roles (Admin, Supplier, Distributor, Customer) each with their own dashboard and permissions
- **Order Lifecycle Management** -- Full order flow covering creation, approval, rejection, reassignment, multi-leg distributor routing, and delivery confirmation
- **RSA Digital Signatures** -- Orders are hashed and signed by suppliers using RSA key pairs; customers can verify authenticity on delivery
- **QR Code Verification** -- Tamper-proof QR codes generated per order, scannable by customers to confirm integrity
- **Inventory Control** -- Stock automatically deducted on order approval with oversell prevention
- **Audit Trail** -- All order status changes are logged with tracking events
- **OTP Registration** -- Users verify via email OTP on signup; role upgrades require Admin approval
- **Email Notifications** -- Nodemailer handles OTPs, role approvals, and RSA private key delivery to suppliers

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

## License

MIT

---

## Author

**Muhammad Fasih Ul Islam**

- GitHub: [@Fasih-ulislam](https://github.com/Fasih-ulislam)
- LinkedIn: [muhammad-fasih-cs](https://linkedin.com/in/muhammad-fasih-cs)
