# Supply Chain Management System - Frontend Documentation

## 📋 Overview

Next.js 14-based frontend application for the Supply Chain Management System. Built with TypeScript, Tailwind CSS, and modern React patterns to provide a complete user interface for managing supply chain operations.

---

## 🛠 Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API + Custom Hooks
- **Form Management**: react-hook-form + Zod validation
- **HTTP Client**: Axios with interceptors
- **Icons**: Lucide React
- **Charts**: Recharts
- **QR Code**: qrcode + qr-scanner
- **Date Handling**: date-fns

---

## 📁 Complete Project Structure

This frontend is fully aligned with the backend API structure documented in `BackEnd/README.md`.

```
client/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── verify-otp/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── dashboard/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── customer/             # Customer routes
│   │   │   ├── products/page.tsx
│   │   │   ├── orders/page.tsx & [id]/page.tsx
│   │   │   ├── verify/page.tsx
│   │   │   └── role-request/page.tsx
│   │   ├── supplier/             # Supplier routes
│   │   │   ├── profile/page.tsx
│   │   │   ├── products/page.tsx
│   │   │   ├── inventory/page.tsx
│   │   │   ├── orders/page.tsx & [id]/page.tsx
│   │   │   ├── transporters/page.tsx
│   │   │   └── warehouse/page.tsx
│   │   ├── distributor/          # Distributor routes
│   │   │   ├── profile/page.tsx
│   │   │   ├── orders/assigned/page.tsx
│   │   │   ├── orders/held/page.tsx
│   │   │   ├── orders/[id]/page.tsx
│   │   │   ├── transporters/page.tsx
│   │   │   └── legs/page.tsx
│   │   ├── admin/                # Admin routes
│   │   │   ├── users/page.tsx
│   │   │   ├── role-requests/page.tsx & [id]/page.tsx
│   │   │   └── orders/page.tsx
│   │   └── layout.tsx
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Landing page
│   ├── globals.css               # Global styles
│   ├── error.tsx                 # Error boundary
│   └── loading.tsx               # Loading state
│
├── components/                   # Reusable React components
│   ├── ui/                       # Base UI components
│   ├── layout/                   # Layout components
│   ├── auth/                     # Auth components
│   ├── customer/                 # Customer-specific
│   ├── supplier/                 # Supplier-specific
│   ├── distributor/              # Distributor-specific
│   ├── admin/                    # Admin-specific
│   └── shared/                   # Shared across roles
│
├── services/                     # API service layer (matches backend routes)
│   ├── authService.ts            # → /api/auth/*
│   ├── userService.ts            # → /api/user/*
│   ├── roleRequestService.ts     # → /api/role-request/*
│   ├── supplierService.ts        # → /api/supplier/*
│   ├── distributorService.ts     # → /api/distributor/*
│   ├── orderService.ts           # → /api/order/*
│   └── verificationService.ts    # → /api/verify/*
│
├── context/                      # React Context providers
│   ├── AuthContext.tsx           # Authentication state
│   ├── ToastContext.tsx          # Notifications
│   └── ThemeContext.tsx          # Theme management
│
├── hooks/                        # Custom React hooks
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   ├── useFetch.ts
│   ├── useClickOutside.ts
│   └── useMediaQuery.ts
│
├── types/                        # TypeScript types (matches backend schema)
│   ├── enums.ts                  # Role, OrderStatus, LegStatus, etc.
│   ├── user.types.ts             # User, AuthUser types
│   ├── order.types.ts            # Order, OrderLeg, TrackingEvent
│   ├── product.types.ts          # Product, Inventory, Warehouse, etc.
│   ├── roleRequest.types.ts      # RoleRequest types
│   ├── api.types.ts              # API response types
│   └── index.ts                  # Type exports
│
├── lib/                          # Core utilities
│   ├── axios.ts                  # Configured Axios instance
│   ├── utils.ts                  # Helper functions
│   ├── constants.ts              # App constants
│   └── validations.ts            # Zod validation schemas
│
├── config/                       # Configuration files
│   ├── routes.ts                 # Route path constants
│   ├── navigation.ts             # Navigation menu by role
│   └── api.config.ts             # API endpoint configuration
│
├── middleware.ts                 # Next.js middleware for auth
├── .env.local                    # Environment variables
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind config
└── next.config.ts                # Next.js config
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Backend API running on `http://localhost:3000`

### 1. Install Dependencies
```bash
cd client
npm install
```

### 2. Configure Environment
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 3. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3001`

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🔗 API Integration

All services are pre-configured to match backend endpoints exactly.

### Service → Backend Route Mapping

| Service | Backend Route | Description |
|---------|---------------|-------------|
| `authService` | `/api/auth/*` | Authentication |
| `userService` | `/api/user/*` | User management |
| `roleRequestService` | `/api/role-request/*` | Role upgrade requests |
| `supplierService` | `/api/supplier/*` | Supplier operations |
| `distributorService` | `/api/distributor/*` | Distributor operations |
| `orderService` | `/api/order/*` | Order management |
| `verificationService` | `/api/verify/*` | QR verification |

### Example Usage
```typescript
import { orderService } from '@/services/orderService';
import { useToast } from '@/context/ToastContext';

const { showToast } = useToast();

try {
  const orders = await orderService.getMyOrders();
  showToast('Orders loaded successfully', 'success');
} catch (error) {
  showToast('Failed to load orders', 'error');
}
```

---

## 👥 User Roles & Features

### Customer
**Routes**: `/customer/*`
- ✅ Browse available products
- ✅ Place orders from suppliers
- ✅ Track order status in real-time
- ✅ Scan QR codes to verify products
- ✅ Confirm deliveries
- ✅ Request role upgrade to Supplier/Distributor

### Supplier
**Routes**: `/supplier/*`
- ✅ Manage business profile
- ✅ Create and manage product catalog
- ✅ Track inventory levels
- ✅ Receive and approve customer orders
- ✅ Assign distributors and transporters
- ✅ Generate QR codes for packages
- ✅ Ship orders
- ✅ Manage warehouse details

### Distributor
**Routes**: `/distributor/*`
- ✅ Manage business profile and service area
- ✅ Accept/reject delivery assignments
- ✅ Confirm receipt of goods
- ✅ Forward orders to other distributors or customers
- ✅ Mark shipments in-transit
- ✅ Track outgoing delivery legs
- ✅ Manage transporters

### Admin
**Routes**: `/admin/*`
- ✅ View all system users
- ✅ Approve/reject role requests
- ✅ Monitor all orders
- ✅ System oversight and management

---

## 🔐 Authentication Flow

```
1. Registration
   User registers → OTP sent to email → Verify OTP → Account created

2. Login
   Email/password → JWT in httpOnly cookie → Redirect to dashboard

3. Protected Routes
   Middleware checks token → Redirect to login if missing

4. Role-Based Access
   Pages check user.role → Show role-specific content
```

### Auth Context Usage
```typescript
'use client';

import { useAuth } from '@/context/AuthContext';

export default function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) return <div>Please login</div>;

  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <p>Role: {user.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## 📱 Pages Reference

### Public Pages
- `/` - Landing page with features
- `/login` - Login form
- `/register` - Registration with email/OTP
- `/verify-otp` - OTP verification

### Customer Pages
- `/dashboard` - Customer overview
- `/customer/products` - Browse & search products
- `/customer/orders` - Order history
- `/customer/orders/[id]` - Order tracking timeline
- `/customer/verify` - QR code scanner
- `/customer/role-request` - Request upgrade

### Supplier Pages
- `/supplier/profile` - Business profile
- `/supplier/products` - Product CRUD
- `/supplier/inventory` - Stock management
- `/supplier/orders` - Incoming orders
- `/supplier/orders/[id]` - Approve/reject orders
- `/supplier/transporters` - Transporter management
- `/supplier/warehouse` - Warehouse details

### Distributor Pages
- `/distributor/profile` - Business profile
- `/distributor/orders/assigned` - Pending assignments
- `/distributor/orders/held` - Currently holding
- `/distributor/orders/[id]` - Delivery actions
- `/distributor/transporters` - Transporter management
- `/distributor/legs` - Outgoing shipments

### Admin Pages
- `/admin/users` - User management table
- `/admin/role-requests` - Pending requests
- `/admin/role-requests/[id]` - Approve/reject
- `/admin/orders` - All orders overview

---

## 🎨 Component Library

### UI Components (`components/ui/`)
Pre-built reusable components:
- `Button` - Multiple variants (primary, secondary, outline)
- `Input` - Form inputs with validation states
- `Card` - Container with header/body/footer
- `Badge` - Status indicators
- `Table` - Data tables with sorting
- `Dialog` - Modal dialogs
- `Alert` - Notifications
- `Spinner` - Loading indicators
- `Select` - Dropdowns
- `Toast` - Toast notifications

### Example Component
```typescript
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

<Card>
  <Card.Header>
    <h2>Order Details</h2>
  </Card.Header>
  <Card.Body>
    <p>Order #123</p>
  </Card.Body>
  <Card.Footer>
    <Button variant="primary">Approve</Button>
    <Button variant="outline">Reject</Button>
  </Card.Footer>
</Card>
```

---

## 🎯 State Management

### Global State (React Context)
```typescript
// Auth state
const { user, login, logout } = useAuth();

// Toast notifications
const { showToast } = useToast();

// Theme
const { theme, toggleTheme } = useTheme();
```

### Form State (react-hook-form + Zod)
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validations';

const form = useForm({
  resolver: zodResolver(loginSchema),
  defaultValues: {
    email: '',
    password: '',
  },
});

const onSubmit = async (data) => {
  await authService.login(data);
};
```

### Server State (Custom useFetch hook)
```typescript
import { useFetch } from '@/hooks/useFetch';
import { orderService } from '@/services/orderService';

const { data: orders, error, isLoading, refetch } = useFetch(
  () => orderService.getMyOrders()
);

if (isLoading) return <Spinner />;
if (error) return <Alert type="error">Failed to load orders</Alert>;

return <OrdersList orders={orders} />;
```

---

## 📊 Data Flow Example

### Customer Places Order

```typescript
// 1. Component
'use client';

import { orderService } from '@/services/orderService';
import { useToast } from '@/context/ToastContext';
import { createOrderSchema } from '@/lib/validations';

export function PlaceOrderForm({ product }) {
  const { showToast } = useToast();
  const form = useForm({
    resolver: zodResolver(createOrderSchema),
  });

  const onSubmit = async (data) => {
    try {
      const order = await orderService.createOrder({
        productId: product.id,
        supplierId: product.supplierId,
        quantity: data.quantity,
        deliveryAddress: data.deliveryAddress,
      });
      
      showToast('Order placed successfully!', 'success');
      router.push(`/customer/orders/${order.id}`);
    } catch (error) {
      showToast('Failed to place order', 'error');
    }
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

```typescript
// 2. Service Layer
export const orderService = {
  async createOrder(data: CreateOrderData) {
    const response = await axios.post('/order', data);
    return response.data.order;
  },
};
```

```
// 3. API Call
POST http://localhost:3000/api/order
Cookie: token=<jwt>
Body: { productId, supplierId, quantity, deliveryAddress }

// 4. Backend processes (see BackEnd/README.md)
// 5. Response returns to frontend
```

---

## 🔔 Toast Notifications

```typescript
import { useToast } from '@/context/ToastContext';

const { showToast } = useToast();

// Success
showToast('Order approved successfully!', 'success');

// Error
showToast('Failed to process order', 'error');

// Warning
showToast('Low inventory', 'warning', 10000); // 10s duration

// Info
showToast('Processing...', 'info');
```

---

## 🎨 Styling with Tailwind

### Utility Classes
```tsx
<div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-lg">
  <h2 className="text-2xl font-bold text-gray-900">Title</h2>
  <p className="text-gray-600">Description</p>
</div>
```

### Conditional Classes with `cn()`
```tsx
import { cn } from '@/lib/utils';

<button
  className={cn(
    'px-4 py-2 rounded transition',
    variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
    variant === 'outline' && 'border border-blue-600 text-blue-600',
    isDisabled && 'opacity-50 cursor-not-allowed'
  )}
/>
```

### Responsive Design
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

---

## 🔒 Security

### Route Protection (middleware.ts)
```typescript
// Automatically redirects unauthenticated users
// Checks exist on every route except public pages
```

### API Security
```typescript
// Axios instance with:
- withCredentials: true  // Sends cookies
- Automatic token handling
- 401 redirect to login
- Error interceptors
```

### Form Security
```typescript
// Zod validation on all forms
// XSS prevention with proper escaping
// CSRF protection via httpOnly cookies
```

---

## 📦 Key Features Implemented

### ✅ Complete Authentication
- Email/password registration
- OTP verification
- JWT-based login
- Persistent sessions
- Secure logout

### ✅ Order Management
- Browse products
- Place orders
- Track status
- Multi-stage approval
- Delivery confirmation

### ✅ QR Verification
- Generate QR codes (supplier)
- Scan QR codes (customer)
- Verify signatures
- Check authenticity

### ✅ Multi-Hop Delivery
- Supplier → Distributor → Distributor → Customer
- Accept/reject at each stage
- Forward capabilities
- Real-time tracking

### ✅ Role Upgrade System
- Customer requests
- Admin approval
- Profile creation
- Role assignment

### ✅ Inventory Management
- Real-time stock
- Automatic deduction
- Low stock alerts
- Stock history

---

## 🧪 Testing

```bash
# Run tests
npm run test

# E2E tests
npm run test:e2e

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

---

## 🚢 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import repository in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_APP_URL`
4. Deploy

### Environment Variables
```env
NEXT_PUBLIC_API_URL=https://api.yourapp.com/api
NEXT_PUBLIC_APP_URL=https://yourapp.com
```

---

## 📚 Additional Resources

- [Backend API Documentation](../BackEnd/README.md)
- [Frontend Structure JSON](../frontend-structure.json)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)

---

## 🎉 Version Info

**Version**: 1.0.0  
**Framework**: Next.js 14  
**Last Updated**: December 15, 2025

---

**Complete frontend implementation matching the backend API structure!** 🚀
