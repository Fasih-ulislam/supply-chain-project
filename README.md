# Supply Chain Management System

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933)
![Express](https://img.shields.io/badge/Express-5.x-000000)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-007ACC)
![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1)
![Security](https://img.shields.io/badge/RSA-Digital_Signatures-blueviolet)
![License](https://img.shields.io/badge/License-MIT-green)

A production-grade, full-stack multi-role supply chain platform that manages the complete end-to-end order lifecycle — from supplier through multi-hop distributors to customer — with **RSA digital signatures**, **QR code verification**, and a **cryptographic audit trail** to guarantee order authenticity and prevent tampering at every step.

---

## Table of Contents

1. [Why This Exists](#why-this-exists)
2. [System Architecture](#system-architecture)
3. [Security Model](#security-model)
4. [Features](#features)
5. [Tech Stack](#tech-stack)
6. [Project Structure](#project-structure)
7. [Database Schema](#database-schema)
8. [API Reference](#api-reference)
9. [Authentication & Authorization](#authentication--authorization)
10. [Order Lifecycle Flow](#order-lifecycle-flow)
11. [Middleware Stack](#middleware-stack)
12. [Frontend Architecture](#frontend-architecture)
13. [Environment Variables](#environment-variables)
14. [Getting Started](#getting-started)
15. [Author](#author)

---

## Why This Exists

Traditional supply chains have a fundamental trust problem: once a package leaves a supplier's hands, there is no reliable way for a customer to verify that what they receive is actually what was approved and shipped. Packages can be swapped, contents altered, or records forged.

This platform treats every order as a **verifiable cryptographic record**. Using RSA digital signatures and QR-based verification, the system ensures that from the moment a supplier approves an order to the moment a customer receives it, the data is authenticated and tamper-evident. Any modification to order data invalidates the signature — making fraud detectable.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                   │
│                                                                         │
│   ┌────────────┐  ┌──────────────┐  ┌───────────────┐  ┌───────────┐  │
│   │  Customer  │  │   Supplier   │  │  Distributor  │  │   Admin   │  │
│   │  Dashboard │  │  Dashboard   │  │   Dashboard   │  │ Dashboard │  │
│   └──────┬─────┘  └──────┬───────┘  └───────┬───────┘  └─────┬─────┘  │
│          │               │                  │                 │        │
│          └───────────────┴──────────────────┴─────────────────┘        │
│                                    │                                    │
│                    Next.js 14 (App Router) + TypeScript                 │
│                    Tailwind CSS + Shadcn/Radix UI                       │
│                    Axios (withCredentials) + React Context              │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │  HTTPS / Cookie (httpOnly JWT)
┌──────────────────────────────────▼──────────────────────────────────────┐
│                          API GATEWAY LAYER                              │
│                                                                         │
│   Helmet (security headers)  →  CORS  →  Cookie Parser  →  JSON Parser │
│   Rate Limiter  →  Morgan Logger  →  Route Matching                    │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────────────────┐
│                        BUSINESS LOGIC LAYER                             │
│                                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │Auth Service │  │Order Service │  │Supplier Svc  │  │Distrib.Svc │  │
│  └─────────────┘  └──────────────┘  └──────────────┘  └────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────┐  │
│  │OrderLeg Svc  │  │Verify Svc    │  │   RSA Crypto Utils           │  │
│  └──────────────┘  └──────────────┘  │  (sign / verify / hash)     │  │
│                                      └──────────────────────────────┘  │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │  Prisma ORM
┌──────────────────────────────────▼──────────────────────────────────────┐
│                          DATABASE LAYER                                 │
│                           MySQL (Prisma)                                │
│                                                                         │
│  User  SupplierProfile  DistributorProfile  Product  Inventory          │
│  Warehouse  Order  OrderLeg  Transporter  TrackingEvent                 │
│  RoleRequest  PendingUser                                               │
└─────────────────────────────────────────────────────────────────────────┘
```

### Request Pipeline

```
Incoming Request
     │
     ▼
[Helmet] → Security headers (CSP, HSTS, X-Frame-Options, etc.)
     │
     ▼
[CORS] → Whitelist check against ALLOWED_ORIGINS
     │
     ▼
[Cookie Parser] → Parse JWT from cookie
     │
     ▼
[Express JSON] → Parse body (10 KB limit)
     │
     ▼
[Rate Limiter] → Per-IP request throttling
     │
     ▼
[Route Handler] → Method + path matching
     │
     ▼
[authenticateUser] → JWT verify, attach req.user
     │
     ▼
[authorizeRoles] → RBAC check against allowed roles
     │
     ▼
[Joi Validation] → Schema validation on body/params
     │
     ▼
[Controller] → Delegates to Service layer
     │
     ▼
[Service] → Business logic, calls Prisma
     │
     ▼
[Prisma] → MySQL query
     │
     ▼
[Response] → JSON with status code
     │
     ▼
[globalErrorHandler] → Catch all unhandled errors, map to safe messages
```

---

## Security Model

This is not a standard CRUD application. The platform implements a **trust-but-verify** approach across multiple layers:

### 1. Cryptographic Order Integrity

When a supplier approves an order, the system:

1. Computes a **SHA-256 hash** of the order data (order ID, product, quantity, supplier, customer, timestamp)
2. Signs the hash using the **supplier's RSA-2048 private key** (stored only by the supplier, received via email)
3. Also signs using the **server's RSA private key** (stored server-side)
4. Stores `orderHash`, `supplierSignature`, `serverSignature`, and `signedAt` in the database
5. Encodes the above into a **Base64 QR token** attached to the physical package

### 2. Physical-Digital Link via QR

When a customer receives a package:

1. They scan the QR code printed on the package
2. The frontend decodes the Base64 token
3. The backend re-computes the order hash from the database record
4. It verifies the supplier's RSA signature using the **public key stored in `SupplierProfile`**
5. Any mismatch between physical and digital records is detected and flagged

### 3. RSA Key Lifecycle

```
Admin approves role request
        │
        ▼
Backend generates RSA-2048 key pair
        │
        ├──→ Public key stored in SupplierProfile.publicKey (database)
        │
        └──→ Private key emailed to supplier via Nodemailer (never stored in DB)
                    │
                    └──→ privateKeyHash (SHA-256) stored for verification purposes
```

The private key is never stored on the server after delivery. Only the supplier holds it.

### 4. Authentication Security

| Measure | Implementation |
|---------|---------------|
| Password storage | bcrypt with salt rounds |
| Session token | JWT in `httpOnly`, `secure`, `sameSite=None` cookie |
| Token expiry | 1 hour |
| OTP verification | 6-digit OTP, expires in 10 minutes |
| Rate limiting | Per-IP, per-route throttling |
| CORS | Whitelist-only, credentials allowed |
| HTTP headers | Helmet (CSP, HSTS, X-Frame, X-Content-Type) |
| Input validation | Joi schemas on all request bodies |
| SQL injection | Prisma parameterized queries (no raw SQL) |
| Body size | Limited to 10 KB |

### 5. Role-Based Access Control

```
ADMIN ────────────────────────────────── Full system access
  │
  └── Approve/Reject role requests
  └── Manage all users
  └── View all orders
  └── Generate RSA keys for suppliers

SUPPLIER ─────────────────────────────── Own data + order management
  │
  └── Manage products, inventory, warehouse
  └── Approve/reject/sign incoming orders
  └── Create distributors, transporters
  └── Reassign order legs

DISTRIBUTOR ──────────────────────────── Leg-level operations
  │
  └── Accept/reject incoming delivery legs
  └── Ship and forward orders
  └── Manage own transporters

CUSTOMER ─────────────────────────────── Self-service
  │
  └── Browse products and place orders
  └── Cancel before shipment
  └── Scan QR to verify delivery
  └── Request role upgrade (SUPPLIER or DISTRIBUTOR)
```

---

## Features

### Core Business Features

| Feature | Description |
|---------|-------------|
| **Multi-Role Platform** | Four distinct roles — Admin, Supplier, Distributor, Customer — each with dedicated dashboards and permissions |
| **Full Order Lifecycle** | End-to-end order management: creation, approval, rejection, multi-leg routing, reassignment, and delivery confirmation |
| **Multi-Hop Distribution** | Orders can pass through multiple distributors before reaching the customer (OrderLeg system) |
| **Leg Rejection & Reassignment** | If a distributor rejects, the order returns to the supplier who picks a different distributor |
| **Inventory Management** | Products linked to warehouse inventory; stock automatically deducted on order approval with oversell prevention |
| **RSA Digital Signatures** | Each approved order is signed by the supplier's RSA key — tamper detection at the cryptographic level |
| **QR Code Verification** | Customers scan a package QR to verify the cryptographic signature and confirm package authenticity |
| **Transporter Management** | Suppliers and distributors manage their own transporter registry |
| **Audit Trail** | Every status change logged as a `TrackingEvent` with timestamp, actor, and description |
| **Role Upgrade Workflow** | Customers submit business details to request Supplier or Distributor role; Admin approves |
| **OTP Email Verification** | New users must verify email via OTP before account activation |
| **Email Notifications** | OTPs, role approvals, and RSA private keys delivered via Nodemailer (Gmail SMTP) |

### Technical Features

- RSA-2048 key pair generation with server-side delivery
- SHA-256 order hashing
- Dual-signature scheme (supplier + server)
- JWT authentication in httpOnly cookies
- Comprehensive Joi validation on all inputs
- Helmet security headers
- Per-route rate limiting
- Prisma migrations and seeding
- Admin auto-creation on server startup
- Default distributor initialization
- Global error handler with Prisma error mapping

---

## Tech Stack

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18+ | Runtime |
| Express.js | 5.x | HTTP framework |
| Prisma ORM | 6.x | Database access layer |
| MySQL | 8.x | Relational database |
| JWT (jsonwebtoken) | 9.x | Stateless authentication |
| bcrypt / bcryptjs | 6.x / 3.x | Password hashing |
| Joi | 18.x | Request validation |
| Helmet | 8.x | HTTP security headers |
| express-rate-limit | 8.x | Rate limiting |
| Nodemailer | 7.x | Email (OTP, keys) |
| cors | 2.x | Cross-origin resource sharing |
| cookie-parser | 1.x | Cookie parsing |
| morgan | 1.x | HTTP request logging |
| Node crypto (built-in) | — | RSA operations, SHA-256 |
| dotenv | 17.x | Environment variables |

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14 | React framework (App Router) |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Utility-first styling |
| Axios | 1.x | HTTP client with interceptors |
| React Hook Form | 7.x | Form state management |
| Zod | 3.x | Frontend schema validation |
| Lucide React | 0.344 | Icon library |
| Recharts | 2.x | Dashboard charts |
| QRCode | 1.x | QR code generation |
| html5-qrcode | 2.x | QR code scanning |
| js-cookie | 3.x | Cookie access |
| date-fns | 3.x | Date formatting |
| class-variance-authority | 0.7 | UI variant management |
| clsx + tailwind-merge | — | Conditional class names |

---

## Project Structure

```
supply-chain-project/
├── BackEnd/                               ← Node.js / Express API
│   ├── app.js                             ← Express app setup, middleware, routes
│   ├── server.js                          ← Entry point, server start, admin init
│   ├── Procfile                           ← Heroku deployment config
│   ├── package.json
│   │
│   ├── config/
│   │   ├── database.js                    ← Prisma client singleton
│   │   └── nodemailer.js                  ← Gmail SMTP transporter config
│   │
│   ├── routes/
│   │   ├── auth.routes.js                 ← /api/auth
│   │   ├── user.routes.js                 ← /api/user
│   │   ├── role.request.routes.js         ← /api/role-request
│   │   ├── supplier.routes.js             ← /api/supplier
│   │   ├── distributor.routes.js          ← /api/distributor
│   │   ├── order.routes.js                ← /api/order
│   │   ├── product.routes.js              ← /api/product
│   │   ├── verification.routes.js         ← /api/verify
│   │   └── tracking.event.routes.js       ← /api/tracking
│   │
│   ├── controllers/
│   │   ├── auth.controller.js             ← Register, login, logout, me
│   │   ├── user.controller.js             ← User CRUD, admin controls
│   │   ├── role.request.controller.js     ← Role upgrade workflow
│   │   ├── supplier.controller.js         ← Profile, products, inventory, transporters
│   │   ├── distributor.controller.js      ← Legs, receipt, forwarding
│   │   ├── order.controller.js            ← Full order lifecycle
│   │   ├── verification.controller.js     ← QR verification
│   │   └── tracking.event.controller.js   ← Tracking history
│   │
│   ├── services/
│   │   ├── auth.service.js                ← OTP, JWT, password logic
│   │   ├── user.service.js                ← User queries
│   │   ├── role.request.service.js        ← Approval, key gen, profile creation
│   │   ├── supplier.service.js            ← Supplier data operations
│   │   ├── distributor.service.js         ← Distributor data operations
│   │   ├── order.service.js               ← Order creation, approval, signing
│   │   ├── orderLeg.service.js            ← Leg creation and transitions
│   │   └── verification.service.js        ← Signature verification logic
│   │
│   ├── middlewares/
│   │   ├── validate.user.middleware.js    ← JWT auth + RBAC authorization
│   │   ├── rateLimit.middleware.js        ← Custom in-memory rate limiter
│   │   └── globalErrorHandler.js          ← Catch-all, Prisma error mapping
│   │
│   ├── utils/
│   │   ├── validation.js                  ← All Joi schemas
│   │   ├── customError.js                 ← ResponseError class
│   │   └── crypto.js                      ← RSA keygen, sign, verify, SHA-256
│   │
│   ├── prisma/
│   │   ├── schema.prisma                  ← Full database schema (12 models)
│   │   ├── seed.js                        ← Seed initial data
│   │   └── migrations/                    ← Migration history
│   │
│   ├── scripts/
│   │   ├── createAdminUser.js             ← Bootstrap admin account
│   │   ├── addDistributors.js             ← Bootstrap default distributors
│   │   ├── generateServerKeys.js          ← Generate server RSA key pair
│   │   └── regenerateSupplierKeys.js      ← Re-issue supplier keys
│   │
│   └── logs/
│       ├── access.log                     ← HTTP access log (Morgan)
│       ├── error.log                      ← Application errors
│       └── security.log                   ← Auth/security events
│
├── frontend/                              ← Next.js 14 / TypeScript
│   ├── app/                               ← App Router (pages)
│   │   ├── layout.tsx                     ← Root layout
│   │   ├── page.tsx                       ← Landing/home page
│   │   ├── error.tsx                      ← Error boundary
│   │   ├── loading.tsx                    ← Loading state
│   │   ├── globals.css
│   │   │
│   │   ├── (auth)/                        ← Public auth group
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── verify-otp/page.tsx
│   │   │
│   │   ├── (dashboard)/                   ← Protected routes
│   │   │   ├── layout.tsx                 ← Sidebar + header wrapper
│   │   │   ├── dashboard/page.tsx         ← Role-based dashboard home
│   │   │   ├── profile/page.tsx
│   │   │   ├── admin/                     ← Admin-only pages
│   │   │   ├── customer/                  ← Customer pages
│   │   │   ├── supplier/                  ← Supplier pages
│   │   │   └── distributor/               ← Distributor pages
│   │   │
│   │   ├── verify-order/page.tsx          ← Public QR verification page
│   │   └── [...not-found]/page.tsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Container.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── shared/
│   │   │   ├── OrderCard.tsx
│   │   │   ├── OrderTracker.tsx           ← Visual timeline for order status
│   │   │   ├── ProductCard.tsx
│   │   │   ├── QRScanner.tsx              ← html5-qrcode camera scanner
│   │   │   └── CookieConsent.tsx
│   │   └── ui/                            ← Shadcn/Radix components
│   │       └── Button, Card, Dialog, Input, Select, Table, Badge, Alert, Tabs...
│   │
│   ├── context/
│   │   ├── AuthContext.tsx                ← Global user + auth state
│   │   ├── ThemeContext.tsx               ← Dark/light mode
│   │   └── ToastContext.tsx               ← Notification system
│   │
│   ├── services/                          ← API call functions (Axios)
│   │   ├── authService.ts
│   │   ├── orderService.ts
│   │   ├── supplierService.ts
│   │   ├── distributorService.ts
│   │   ├── userService.ts
│   │   ├── roleRequestService.ts
│   │   ├── productService.ts
│   │   ├── inventoryService.ts
│   │   ├── trackingService.ts
│   │   ├── transporterService.ts
│   │   └── verificationService.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useFetch.ts
│   │   ├── useForm.ts
│   │   ├── useToast.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useDebounce.ts
│   │   ├── useClickOutside.ts
│   │   ├── useMediaQuery.ts
│   │   └── useInfiniteScroll.ts
│   │
│   ├── lib/
│   │   ├── axios.ts                       ← Axios instance with interceptors
│   │   ├── constants.ts
│   │   ├── cookies.ts
│   │   ├── cn.ts                          ← clsx + tailwind-merge helper
│   │   ├── utils.ts
│   │   └── validations.ts                 ← Zod schemas
│   │
│   ├── config/
│   │   ├── api.config.ts                  ← All API endpoint strings
│   │   ├── navigation.ts                  ← Role-based nav config
│   │   └── routes.ts                      ← App route constants
│   │
│   ├── types/
│   │   ├── api.types.ts
│   │   ├── user.types.ts
│   │   ├── order.types.ts
│   │   ├── product.types.ts
│   │   ├── roleRequest.types.ts
│   │   ├── common.types.ts
│   │   ├── enums.ts                       ← Role, OrderStatus, LegStatus, etc.
│   │   └── index.ts
│   │
│   ├── middleware.ts                       ← Next.js edge middleware (route guards)
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── vercel.json
│
├── supply_chain_order_flow.svg            ← Architecture/flow diagram
├── LICENSE
└── README.md
```

---

## Database Schema

### Entity Relationship Overview

```
User ──────────────────────────────────────────────────────────────────────
  │
  ├── SupplierProfile (1:1)
  │       ├── Warehouse (1:1)
  │       │       └── Inventory[] (many products)
  │       ├── Product[] 
  │       ├── Transporter[]
  │       ├── Order[] (as supplier)
  │       └── OrderLeg[] (as fromSupplier)
  │
  ├── DistributorProfile (1:1)
  │       ├── Transporter[]
  │       ├── OrderLeg[] (as fromDistributor)
  │       └── OrderLeg[] (as toDistributor)
  │
  ├── RoleRequest[] (upgrade requests)
  ├── Order[] (as customer)
  └── TrackingEvent[] (as fromUser / toUser)

Order ─────────────────────────────────────────────────────────────────────
  │
  ├── OrderLeg[] (sequential delivery hops)
  │       └── Transporter (assigned carrier)
  │
  └── TrackingEvent[] (full audit trail)
```

### Model Definitions

#### `User`

| Field | Type | Notes |
|-------|------|-------|
| id | Int (PK) | Auto-increment |
| name | String | Display name |
| email | String (unique) | Login identifier |
| password | String | bcrypt hash |
| picture | String? | Avatar URL |
| role | Role | ADMIN, SUPPLIER, DISTRIBUTOR, CUSTOMER |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

#### `SupplierProfile`

| Field | Type | Notes |
|-------|------|-------|
| id | Int (PK) | |
| userId | Int (unique FK) | Links to User |
| businessName | String | |
| businessAddress | String | |
| contactNumber | String | |
| NTN | String? | Tax number |
| licenseNumber | String? | Business license |
| publicKey | Text? | RSA-2048 public key for signature verification |
| privateKeyHash | String? | SHA-256 of private key (verification only) |
| createdAt / updatedAt | DateTime | |

#### `DistributorProfile`

| Field | Type | Notes |
|-------|------|-------|
| id | Int (PK) | |
| userId | Int (unique FK) | Links to User |
| businessName | String | |
| businessAddress | String | |
| contactNumber | String | |
| NTN | String? | |
| serviceArea | String? | Geographic coverage |
| createdAt / updatedAt | DateTime | |

#### `Product`

| Field | Type | Notes |
|-------|------|-------|
| id | Int (PK) | |
| name | String | |
| category | String | |
| batchNo | String | Production batch |
| qrCode | String? (unique) | Product-level QR identifier |
| description | String? | |
| price | Float | Unit price |
| supplierId | Int (FK) | Owner supplier |
| createdAt / updatedAt | DateTime | |

#### `Warehouse`

| Field | Type | Notes |
|-------|------|-------|
| id | Int (PK) | |
| supplierId | Int (unique FK) | One warehouse per supplier |
| name | String | Default: "Main Warehouse" |
| address | String | Physical location |
| createdAt / updatedAt | DateTime | |

#### `Inventory`

| Field | Type | Notes |
|-------|------|-------|
| id | Int (PK) | |
| warehouseId | Int (FK) | |
| productId | Int (FK) | |
| quantity | Int | Current stock (default 0) |
| createdAt / updatedAt | DateTime | |
| — | unique([warehouseId, productId]) | One record per product per warehouse |

#### `Order`

| Field | Type | Notes |
|-------|------|-------|
| id | Int (PK) | |
| orderDate | DateTime | Auto |
| quantity | Int | Units ordered |
| totalAmount | Float | price × quantity |
| status | OrderStatus | See enum below |
| deliveryAddress | String | Customer delivery address |
| orderHash | VarChar(64)? | SHA-256 of order data |
| supplierSignature | Text? | RSA signature by supplier's private key |
| serverSignature | Text? | RSA signature by server's private key |
| qrToken | Text? | Base64 QR payload |
| signedAt | DateTime? | When signatures were applied |
| customerId | Int (FK) | |
| supplierId | Int (FK) | |
| productId | Int (FK) | |
| updatedAt | DateTime | |

**OrderStatus Enum:**

| Value | Meaning |
|-------|---------|
| `PENDING` | Customer placed order; awaiting supplier action |
| `APPROVED` | Supplier approved; stock deducted; first leg created; QR generated |
| `PENDING_REASSIGN` | Distributor rejected; supplier must pick another |
| `IN_PROGRESS` | At least one delivery leg is in transit |
| `DELIVERED` | Customer confirmed final receipt |
| `CANCELLED` | Cancelled by customer or rejected by supplier |

#### `OrderLeg`

| Field | Type | Notes |
|-------|------|-------|
| id | Int (PK) | |
| orderId | Int (FK) | Parent order |
| legNumber | Int | Sequence: 1, 2, 3... |
| status | LegStatus | See enum below |
| fromType | ParticipantType | SUPPLIER, DISTRIBUTOR, CUSTOMER |
| fromSupplierId | Int? (FK) | Set when fromType=SUPPLIER |
| fromDistributorId | Int? (FK) | Set when fromType=DISTRIBUTOR |
| toType | ParticipantType | DISTRIBUTOR or CUSTOMER |
| toDistributorId | Int? (FK) | Set when toType=DISTRIBUTOR |
| transporterId | Int? (FK) | Assigned carrier |
| createdAt / updatedAt | DateTime | |
| — | unique([orderId, legNumber]) | |

**LegStatus Enum:**

| Value | Meaning |
|-------|---------|
| `PENDING` | Created; awaiting recipient acceptance |
| `ACCEPTED` | Recipient agreed to receive |
| `IN_TRANSIT` | Currently being transported |
| `DELIVERED` | Recipient confirmed physical receipt |
| `REJECTED` | Recipient declined; triggers PENDING_REASSIGN |

**ParticipantType Enum:** `SUPPLIER` | `DISTRIBUTOR` | `CUSTOMER`

#### `Transporter`

| Field | Type | Notes |
|-------|------|-------|
| id | Int (PK) | |
| name | String | Carrier name |
| phone | String | Contact (10–15 digits) |
| supplierId | Int? (FK) | Owner if supplier-managed |
| distributorId | Int? (FK) | Owner if distributor-managed |
| createdAt / updatedAt | DateTime | |

#### `RoleRequest`

| Field | Type | Notes |
|-------|------|-------|
| id | Int (PK) | |
| userId | Int (FK) | Requesting user |
| requestedRole | Role | SUPPLIER or DISTRIBUTOR only |
| status | RequestStatus | PENDING, APPROVED, REJECTED |
| businessName | String | |
| businessAddress | String | |
| contactNumber | String | |
| NTN | String? | |
| licenseNumber | String? | Suppliers only |
| serviceArea | String? | Distributors only |
| createdAt / updatedAt | DateTime | |

#### `TrackingEvent`

| Field | Type | Notes |
|-------|------|-------|
| id | Int (PK) | |
| orderId | Int (FK) | Associated order |
| legId | Int? | Associated leg |
| fromUserId | Int? (FK) | Who triggered the event |
| toUserId | Int? (FK) | Recipient of the change |
| status | String | Event label |
| description | String? | Human-readable detail |
| timestamp | DateTime | Auto |

#### `PendingUser`

| Field | Type | Notes |
|-------|------|-------|
| id | Int (PK) | |
| email | String (unique) | Registration email |
| name | String | |
| password | String | bcrypt hash |
| otp | String | 6-digit code |
| otpExpiry | DateTime | OTP valid window |
| createdAt | DateTime | |

---

## API Reference

### Base URL

```
Backend: http://localhost:5000/api
Frontend: http://localhost:3000
```

### Response Format

All responses follow:
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

Errors:
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

---

### Authentication Routes — `/api/auth`

| Method | Endpoint | Auth Required | Rate Limit | Description |
|--------|----------|:-------------:|:----------:|-------------|
| `POST` | `/register` | No | authLimiter | Register new user, send OTP email |
| `POST` | `/verify-otp` | No | otpLimiter | Verify OTP and activate account |
| `POST` | `/resend-otp` | No | otpLimiter | Resend OTP to email |
| `POST` | `/login` | No | authLimiter | Login, returns httpOnly JWT cookie |
| `POST` | `/logout` | JWT | — | Clear auth cookie |
| `GET` | `/me` | JWT | — | Get currently authenticated user |

#### `POST /api/auth/register`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response `201`:**
```json
{
  "message": "OTP sent to email. Please verify to complete registration.",
  "email": "john@example.com"
}
```

#### `POST /api/auth/verify-otp`

**Request:**
```json
{
  "email": "john@example.com",
  "otp": "483920"
}
```

**Response `200`:**
```json
{
  "message": "Account verified successfully.",
  "user": { "id": 1, "name": "John Doe", "email": "...", "role": "CUSTOMER" }
}
```

#### `POST /api/auth/login`

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "activeRole": "SUPPLIER"
}
```

**Response `200`** (sets `token` cookie):
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "SUPPLIER",
    "supplierProfileId": 3
  }
}
```

---

### User Routes — `/api/user`

All require JWT authentication.

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| `GET` | `/` | ALL | Get current user by email |
| `PUT` | `/` | ALL | Update own profile (name, picture) |
| `DELETE` | `/` | ALL | Delete own account |
| `GET` | `/all` | ADMIN | List all users |
| `DELETE` | `/:id` | ADMIN | Delete any user by ID |

#### `PUT /api/user`

**Request:**
```json
{
  "name": "John Updated",
  "picture": "https://cdn.example.com/avatar.jpg"
}
```

---

### Role Request Routes — `/api/role-request`

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| `POST` | `/` | CUSTOMER | Submit role upgrade request |
| `GET` | `/me` | ALL | Get own role requests |
| `GET` | `/all` | ADMIN | Get all role requests |
| `GET` | `/pending` | ADMIN | Get pending requests only |
| `GET` | `/:id` | ADMIN | Get specific request |
| `PATCH` | `/:id/status` | ADMIN | Approve or reject request |
| `DELETE` | `/:id` | ADMIN | Delete request |

#### `POST /api/role-request`

**Request (Supplier):**
```json
{
  "requestedRole": "SUPPLIER",
  "businessName": "ABC Supplies Co.",
  "businessAddress": "123 Industrial Zone, Karachi",
  "contactNumber": "03001234567",
  "NTN": "1234567-8",
  "licenseNumber": "LIC-2024-00123"
}
```

**Request (Distributor):**
```json
{
  "requestedRole": "DISTRIBUTOR",
  "businessName": "Fast Logistics",
  "businessAddress": "456 Hub Street, Lahore",
  "contactNumber": "03009876543",
  "NTN": "9876543-2",
  "serviceArea": "Lahore, Faisalabad, Gujranwala"
}
```

#### `PATCH /api/role-request/:id/status`

**Request:**
```json
{
  "status": "APPROVED"
}
```

**On Approval (Supplier):** System generates RSA key pair, emails private key to user, creates `SupplierProfile` + `Warehouse`, updates `User.role` to `SUPPLIER`.

**On Approval (Distributor):** System creates `DistributorProfile`, updates `User.role` to `DISTRIBUTOR`.

---

### Supplier Routes — `/api/supplier`

All require JWT + `SUPPLIER` role.

#### Profile & Warehouse

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/profile` | Get supplier profile with warehouse |
| `PUT` | `/profile` | Update profile fields |
| `PUT` | `/warehouse` | Update warehouse address |

#### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/products` | List my products |
| `POST` | `/products` | Create a new product |
| `PUT` | `/products/:id` | Update product details |
| `DELETE` | `/products/:id` | Delete a product |

**`POST /api/supplier/products` Request:**
```json
{
  "name": "Industrial Valve Type A",
  "category": "Hardware",
  "batchNo": "BATCH-2024-001",
  "description": "High-pressure stainless steel valve",
  "price": 1250.00
}
```

#### Inventory

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/inventory` | View warehouse stock levels |
| `POST` | `/inventory` | Add product to inventory |
| `PUT` | `/inventory/:id` | Update stock quantity |
| `DELETE` | `/inventory/:id` | Remove item from inventory |

**`POST /api/supplier/inventory` Request:**
```json
{
  "productId": 5,
  "quantity": 500
}
```

#### Transporters

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/transporters` | List my transporters |
| `POST` | `/transporters` | Register a transporter |
| `PUT` | `/transporters/:id` | Update transporter |
| `DELETE` | `/transporters/:id` | Remove transporter |

**`POST /api/supplier/transporters` Request:**
```json
{
  "name": "Khan Transport Co.",
  "phone": "03331234567"
}
```

#### Orders & Browse

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/orders` | View incoming customer orders |
| `GET` | `/distributors` | Browse all available distributors |
| `GET` | `/suppliers` | Browse all suppliers |

---

### Distributor Routes — `/api/distributor`

All require JWT + `DISTRIBUTOR` role.

#### Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/profile` | Get distributor profile |
| `PUT` | `/profile` | Update profile |

#### Transporters

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/transporters` | List my transporters |
| `POST` | `/transporters` | Register transporter |
| `PUT` | `/transporters/:id` | Update transporter |
| `DELETE` | `/transporters/:id` | Delete transporter |

#### Order Leg Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/orders/assigned` | Orders currently assigned to me |
| `GET` | `/orders/held` | Orders I currently hold (received but not forwarded) |
| `POST` | `/legs/:legId/accept` | Accept incoming delivery leg |
| `POST` | `/legs/:legId/reject` | Reject incoming delivery (triggers PENDING_REASSIGN) |
| `POST` | `/legs/:legId/confirm-receipt` | Confirm physical receipt of goods |
| `POST` | `/legs/:legId/ship` | Mark leg as in-transit with transporter |
| `POST` | `/orders/:orderId/forward` | Forward order to next distributor or customer |
| `POST` | `/legs/:legId/reassign` | Reassign leg to different transporter |
| `GET` | `/legs/outgoing` | View legs I've dispatched |
| `GET` | `/legs/:legId` | Get leg details |
| `GET` | `/distributors` | Browse all distributors |

**`POST /api/distributor/legs/:legId/ship` Request:**
```json
{
  "transporterId": 7
}
```

**`POST /api/distributor/orders/:orderId/forward` Request:**
```json
{
  "toType": "DISTRIBUTOR",
  "toDistributorId": 4,
  "transporterId": 7
}
```
Or to forward directly to customer:
```json
{
  "toType": "CUSTOMER",
  "transporterId": 7
}
```

---

### Order Routes — `/api/order`

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| `GET` | `/products` | ALL | Browse all available products from all suppliers |
| `POST` | `/` | CUSTOMER | Place a new order |
| `GET` | `/my-orders` | CUSTOMER | List my orders |
| `GET` | `/:id` | ALL | View order details (parties only) |
| `POST` | `/:id/cancel` | CUSTOMER | Cancel order (before shipment) |
| `POST` | `/:id/confirm-delivery` | CUSTOMER | Confirm receipt, trigger QR verification |
| `POST` | `/:id/approve` | SUPPLIER | Approve order, sign, deduct stock, create leg |
| `POST` | `/:id/reject` | SUPPLIER | Reject order |
| `POST` | `/:id/reassign` | SUPPLIER | Reassign distributor after rejection |
| `POST` | `/:id/legs/:legId/ship` | SUPPLIER | Mark first leg as shipped |

#### `POST /api/order`

**Request:**
```json
{
  "productId": 5,
  "inventoryId": 12,
  "sellerId": 3,
  "quantity": 10,
  "deliveryAddress": "789 Customer Street, Karachi"
}
```

**Response `201`:**
```json
{
  "message": "Order placed successfully",
  "order": {
    "id": 42,
    "status": "PENDING",
    "quantity": 10,
    "totalAmount": 12500.00,
    "deliveryAddress": "789 Customer Street, Karachi",
    "product": { "id": 5, "name": "Industrial Valve Type A" },
    "supplier": { "businessName": "ABC Supplies Co." }
  }
}
```

#### `POST /api/order/:id/approve`

**Request:**
```json
{
  "distributorId": 2,
  "transporterId": 7
}
```

**What happens internally:**
1. Validates supplier owns the order
2. Computes SHA-256 hash: `SHA256(orderId + productId + quantity + customerId + supplierId + timestamp)`
3. Signs hash with supplier's RSA private key → `supplierSignature`
4. Signs hash with server's RSA private key → `serverSignature`
5. Encodes signatures + hash into Base64 → `qrToken`
6. Deducts `quantity` from `Inventory`
7. Creates `OrderLeg` (leg 1): `fromType=SUPPLIER → toType=DISTRIBUTOR`
8. Updates `Order.status` → `APPROVED`
9. Creates `TrackingEvent`

**Response `200`:**
```json
{
  "message": "Order approved and signed",
  "order": {
    "id": 42,
    "status": "APPROVED",
    "signedAt": "2025-01-15T10:30:00Z",
    "qrToken": "eyJvcmRlcklkIjo0MiwiaGFzaCI6..."
  }
}
```

---

### Verification Routes — `/api/verify`

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| `GET` | `/` | CUSTOMER, ADMIN | Verify QR token from scanned package |
| `GET` | `/order/:id/qr` | SUPPLIER | Get printable QR details for an order |

#### `GET /api/verify?token=<base64-token>`

**What happens internally:**
1. Decodes Base64 `qrToken`
2. Extracts `orderId`, `orderHash`, `supplierSignature`
3. Loads `Order` from database
4. Re-computes SHA-256 hash from order record
5. Verifies `supplierSignature` using `SupplierProfile.publicKey`
6. Returns verification result with order details

**Response `200` (valid):**
```json
{
  "verified": true,
  "message": "Order signature is valid. Package is authentic.",
  "order": {
    "id": 42,
    "product": "Industrial Valve Type A",
    "quantity": 10,
    "supplier": "ABC Supplies Co.",
    "signedAt": "2025-01-15T10:30:00Z"
  }
}
```

**Response `200` (tampered):**
```json
{
  "verified": false,
  "message": "Signature verification failed. Package may have been tampered with."
}
```

---

### Product Routes — `/api/product`

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| `POST` | `/` | SUPPLIER | Create product |
| `GET` | `/me` | SUPPLIER | Get my products |
| `PUT` | `/me/:id` | SUPPLIER | Update my product |
| `DELETE` | `/me/:id` | SUPPLIER | Delete my product |
| `GET` | `/all` | ADMIN | Get all products system-wide |

---

### Tracking Routes — `/api/tracking`

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| `GET` | `/:orderId/tracking` | SUPPLIER, DISTRIBUTOR, CUSTOMER | Get full tracking history for an order |

**Response:**
```json
{
  "events": [
    {
      "id": 1,
      "status": "ORDER_PLACED",
      "description": "Customer placed order",
      "timestamp": "2025-01-14T08:00:00Z",
      "fromUser": { "name": "John Doe", "role": "CUSTOMER" }
    },
    {
      "id": 2,
      "status": "ORDER_APPROVED",
      "description": "Supplier approved and signed order",
      "timestamp": "2025-01-14T09:15:00Z",
      "fromUser": { "name": "ABC Supplies Co.", "role": "SUPPLIER" }
    },
    {
      "id": 3,
      "status": "IN_TRANSIT",
      "description": "Leg 1 shipped via Khan Transport Co.",
      "timestamp": "2025-01-14T11:30:00Z"
    }
  ]
}
```

---

## Authentication & Authorization

### JWT Token Structure

```javascript
// Payload stored in JWT
{
  id: number,                     // User ID
  email: string,
  role: "ADMIN" | "SUPPLIER" | "DISTRIBUTOR" | "CUSTOMER",
  supplierProfileId: number | null,
  distributorProfileId: number | null,
  iat: number,                    // Issued at
  exp: number                     // Expires at (1h)
}
```

### Cookie Configuration

```javascript
{
  httpOnly: true,        // No JavaScript access — XSS protection
  secure: true,          // HTTPS only in production
  sameSite: "None",      // Allow cross-origin (frontend ↔ backend)
  maxAge: 3600000        // 1 hour in milliseconds
}
```

### Middleware Chain for Protected Routes

```javascript
// Example: Supplier-only route
router.get('/products',
  authenticateUser,              // 1. Verify JWT, set req.user
  authorizeRoles('SUPPLIER'),    // 2. Check role
  supplierController.getProducts // 3. Handle request
);
```

### Active Role Header

Users with multiple roles (e.g., approved for both SUPPLIER and DISTRIBUTOR) pass:
```
X-Active-Role: SUPPLIER
```
The `authorizeRoles` middleware reads this header to determine which profile to load.

---

## Order Lifecycle Flow

```
CUSTOMER places order
        │
        ▼ status: PENDING
SUPPLIER receives notification
        │
        ├──[REJECT]──→ status: CANCELLED
        │
        └──[APPROVE]──────────────────────────────────────────────────┐
                │                                                     │
                ▼ status: APPROVED                                    │
         Cryptographic signing:                                       │
         1. SHA-256(orderId+productId+qty+customerId+supplierId+ts)   │
         2. RSA-sign(hash, supplier.privateKey) → supplierSignature   │
         3. RSA-sign(hash, server.privateKey) → serverSignature       │
         4. Base64(qrPayload) → qrToken (printed on package)          │
         5. Inventory deducted                                        │
         6. OrderLeg 1 created: SUPPLIER → DISTRIBUTOR                │
                │                                                     │
                ▼                                                     │
DISTRIBUTOR receives leg 1                                            │
        │                                                             │
        ├──[REJECT]──→ status: PENDING_REASSIGN ──→ SUPPLIER picks new DISTRIBUTOR
        │
        ├──[ACCEPT]──→ leg.status: ACCEPTED
        │
        ├──[CONFIRM_RECEIPT]──→ leg.status: DELIVERED (leg 1)
        │
        ├──[FORWARD to DISTRIBUTOR 2]──→ leg 2 created: DISTRIBUTOR → DISTRIBUTOR
        │       └──→ same accept/reject/forward cycle
        │
        └──[FORWARD to CUSTOMER]──→ final leg created: DISTRIBUTOR → CUSTOMER
                        │ status: IN_PROGRESS
                        │
                        ▼
              CUSTOMER receives package
                        │
              [SCAN QR CODE]
                        │
                        ▼
              Backend verification:
              1. Decode Base64 qrToken
              2. Re-compute hash from DB
              3. RSA-verify(hash, supplierSignature, supplier.publicKey)
              4. ✓ VALID → Package authentic
              4. ✗ INVALID → Tampering detected
                        │
              [CONFIRM_DELIVERY]──→ status: DELIVERED
```

---

## Middleware Stack

### Rate Limiter (`rateLimit.middleware.js`)

Custom in-memory rate limiter with 5-minute cleanup intervals.

| Limiter | Max Requests | Window | Applied To |
|---------|:------------:|:------:|-----------|
| `authLimiter` | 10 | 15 min | `/api/auth/login`, `/api/auth/register` |
| `otpLimiter` | 5 | 1 hour | `/api/auth/verify-otp`, `/api/auth/resend-otp` |
| `apiLimiter` | 100 | 15 min | All `/api/*` routes |
| `strictLimiter` | 20 | 1 hour | Sensitive write operations |

**Rate limit exceeded response `429`:**
```json
{
  "message": "Too many requests. Please try again later.",
  "retryAfter": 900
}
```

### Global Error Handler (`globalErrorHandler.js`)

Maps Prisma errors and custom `ResponseError` to safe HTTP responses:

| Error Code | HTTP Status | Message |
|-----------|:-----------:|---------|
| Prisma P2002 | 409 | "A record with this value already exists" |
| Prisma P2025 | 404 | "Record not found" |
| Prisma P2003 | 400 | "Referenced record does not exist" |
| `ResponseError` | Custom | Error message from service layer |
| Unhandled | 500 | "Internal server error" |

### Authentication Middleware (`validate.user.middleware.js`)

**`authenticateUser`:**
1. Extract `token` from `req.cookies`
2. `jwt.verify(token, process.env.JWT_SECRET)`
3. Decode payload, attach to `req.user`
4. On failure → `401 Unauthorized`

**`authorizeRoles(...roles)`:**
1. Check `req.user.role` against `roles` array
2. If `X-Active-Role` header present, validate user has the profile for that role
3. On failure → `403 Forbidden`

---

## Frontend Architecture

### Routing Structure (Next.js App Router)

```
/                          ← Landing page
/login                     ← Login form
/register                  ← Registration form
/verify-otp                ← OTP entry
/verify-order              ← Public QR scanner page
/dashboard                 ← Role-based dashboard (redirects by role)

/admin/
  ├── users                ← User management
  ├── role-requests        ← Approve/reject upgrades
  └── orders               ← View all orders

/supplier/
  ├── products             ← Product CRUD
  ├── inventory            ← Stock management
  ├── orders               ← Incoming orders + approve/reject
  ├── transporters         ← Transporter registry
  └── distributors         ← Browse distributors

/distributor/
  ├── orders               ← Assigned & held orders
  ├── legs                 ← Leg management (accept/ship/forward)
  └── transporters         ← Transporter registry

/customer/
  ├── browse               ← Browse products and place orders
  ├── orders               ← My order history
  └── verify               ← QR scanner for delivery

/profile                   ← Edit own profile
```

### Next.js Middleware (`middleware.ts`)

Edge middleware handles route protection:
- Unauthenticated users redirected to `/login`
- Role-based path protection (e.g., `/admin/*` requires ADMIN role)
- Auth pages redirect to `/dashboard` if already logged in

### State Management

```typescript
// AuthContext — persisted user state
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email, password, activeRole?) => Promise<void>;
  logout: () => Promise<void>;
  register: (name, email, password) => Promise<void>;
  verifyOtp: (email, otp) => Promise<void>;
  refreshUser: () => Promise<void>;
}
```

### Axios Instance (`lib/axios.ts`)

```typescript
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,   // Sends httpOnly cookie
  timeout: 30000,
});

// Response interceptor
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
```

### Custom Hooks

| Hook | Purpose |
|------|---------|
| `useAuth` | Access auth context (user, login, logout) |
| `useFetch` | Generic data fetching with loading/error states |
| `useForm` | Form state with validation |
| `useToast` | Show success/error notifications |
| `useLocalStorage` | Persist state across sessions |
| `useDebounce` | Debounce search inputs |
| `useClickOutside` | Close dropdowns on outside click |
| `useMediaQuery` | Responsive breakpoint detection |
| `useInfiniteScroll` | Paginated list loading |

---

## Environment Variables

### Backend (`BackEnd/.env`)

```env
# Server
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=mysql://username:password@host:3306/supplychain

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Email (Gmail SMTP)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-specific-password

# CORS (comma-separated origins)
ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000

# Optional
SESSION_SECRET=your-session-secret
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8.x
- Gmail account (for SMTP — enable App Passwords in Google Account settings)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Fasih-ulislam/supply-chain.git
cd supply-chain-project

# 2. Install backend dependencies
cd BackEnd
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install
```

### Database Setup

```bash
cd BackEnd

# Set your DATABASE_URL in .env first, then:
npx prisma migrate dev --name init

# Optional: Seed with sample data
node prisma/seed.js
```

### Generate Server RSA Keys

```bash
cd BackEnd
node scripts/generateServerKeys.js
```

This creates the server's RSA key pair used for `serverSignature` on orders.

### Run the Application

```bash
# Terminal 1 — Start backend (from BackEnd/)
npm run dev
# Server starts on http://localhost:5000
# Admin user auto-created on first run
# Default distributors initialized

# Terminal 2 — Start frontend (from frontend/)
npm run dev
# Frontend starts on http://localhost:3000
```

### First-Time Setup

1. Visit `http://localhost:3000/register` and create an account
2. Check your email for the OTP and verify at `/verify-otp`
3. Log in at `/login` — you'll be a `CUSTOMER` by default
4. To become a Supplier or Distributor, go to **Profile → Request Role Upgrade**
5. Log in as Admin (credentials set in `scripts/createAdminUser.js`) to approve the request
6. On approval, suppliers receive their RSA private key via email

### Available Scripts

```bash
# Backend
npm run dev         # Development with nodemon
npm start           # Production (node server.js)
npx prisma studio   # Visual DB browser

# Scripts
node scripts/createAdminUser.js        # Bootstrap admin
node scripts/addDistributors.js        # Add default distributors
node scripts/generateServerKeys.js     # Generate server RSA keys
node scripts/regenerateSupplierKeys.js # Re-issue supplier RSA keys
```

---

## License

MIT — see [LICENSE](LICENSE)

---

## Author

**Muhammad Fasih Ul Islam**

## Contributor 

**Muhammad Zeeshan Abbas**

- GitHub: [@Fasih-ulislam](https://github.com/Fasih-ulislam)
- LinkedIn: [muhammad-fasih-cs](https://linkedin.com/in/muhammad-fasih-cs)
