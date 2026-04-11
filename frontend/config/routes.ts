export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    VERIFY_OTP: '/verify-otp',

    // Common
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',

    // Customer
    CUSTOMER: {
        PROFILE: '/customer/profile',
        PRODUCTS: '/customer/products',
        ORDERS: '/customer/orders',
        ORDER_DETAILS: (id: number) => `/customer/orders/${id}`,
        VERIFY: '/customer/verify',
        ROLE_REQUEST: '/customer/role-request',
    },

    // Supplier
    SUPPLIER: {
        PROFILE: '/supplier/profile',
        PRODUCTS: '/supplier/products',
        INVENTORY: '/supplier/inventory',
        ORDERS: '/supplier/orders',
        MANAGE_ORDERS: '/supplier/orders/manage',
        ORDER_DETAILS: (id: number) => `/supplier/orders/${id}`,
        TRANSPORTERS: '/supplier/transporters',
        WAREHOUSE: '/supplier/warehouse',
    },

    // Distributor
    DISTRIBUTOR: {
        PROFILE: '/distributor/profile',
        ASSIGNED_ORDERS: '/distributor/orders/assigned',
        HELD_ORDERS: '/distributor/orders/held',
        ORDER_DETAILS: (id: number) => `/distributor/orders/${id}`,
        TRANSPORTERS: '/distributor/transporters',
        LEGS: '/distributor/legs',
    },

    // Admin
    ADMIN: {
        USERS: '/admin/users',
        ROLE_REQUESTS: '/admin/role-requests',
        ROLE_REQUEST_DETAILS: (id: number) => `/admin/role-requests/${id}`,
        ORDERS: '/admin/orders',
    },
} as const;