import { Role } from '@/types';
import { ROUTES } from './routes';

export interface NavItem {
    label: string;
    href: string;
    icon?: string;
    roles: Role[];
}

export const NAVIGATION: NavItem[] = [
    {
        label: 'Dashboard',
        href: ROUTES.DASHBOARD,
        icon: 'Home',
        roles: [Role.ADMIN, Role.SUPPLIER, Role.DISTRIBUTOR, Role.CUSTOMER],
    },
    {
        label: 'Profile',
        href: ROUTES.PROFILE,
        icon: 'User',
        roles: [Role.ADMIN, Role.SUPPLIER, Role.DISTRIBUTOR, Role.CUSTOMER],
    },

    // Customer Navigation
    {
        label: 'Browse Products',
        href: ROUTES.CUSTOMER.PRODUCTS,
        icon: 'ShoppingCart',
        roles: [Role.CUSTOMER],
    },
    {
        label: 'My Orders',
        href: ROUTES.CUSTOMER.ORDERS,
        icon: 'Package',
        roles: [Role.CUSTOMER],
    },
    {
        label: 'Request Role Upgrade',
        href: ROUTES.CUSTOMER.ROLE_REQUEST,
        icon: 'UserPlus',
        roles: [Role.CUSTOMER],
    },

    // Supplier Navigation
    {
        label: 'Supplier Profile',
        href: ROUTES.SUPPLIER.PROFILE,
        icon: 'Building',
        roles: [Role.SUPPLIER],
    },
    {
        label: 'Products',
        href: ROUTES.SUPPLIER.PRODUCTS,
        icon: 'Package',
        roles: [Role.SUPPLIER],
    },
    {
        label: 'Inventory',
        href: ROUTES.SUPPLIER.INVENTORY,
        icon: 'Database',
        roles: [Role.SUPPLIER],
    },
    {
        label: 'Manage Orders',
        href: ROUTES.SUPPLIER.MANAGE_ORDERS,
        icon: 'ClipboardCheck',
        roles: [Role.SUPPLIER],
    },
    {
        label: 'Transporters',
        href: ROUTES.SUPPLIER.TRANSPORTERS,
        icon: 'Truck',
        roles: [Role.SUPPLIER],
    },
    {
        label: 'Warehouse',
        href: ROUTES.SUPPLIER.WAREHOUSE,
        icon: 'Warehouse',
        roles: [Role.SUPPLIER],
    },

    // Distributor Navigation
    {
        label: 'Distributor Profile',
        href: ROUTES.DISTRIBUTOR.PROFILE,
        icon: 'Building',
        roles: [Role.DISTRIBUTOR],
    },
    {
        label: 'Assigned Orders',
        href: ROUTES.DISTRIBUTOR.ASSIGNED_ORDERS,
        icon: 'Inbox',
        roles: [Role.DISTRIBUTOR],
    },
    {
        label: 'Held Orders',
        href: ROUTES.DISTRIBUTOR.HELD_ORDERS,
        icon: 'Package',
        roles: [Role.DISTRIBUTOR],
    },
    {
        label: 'Transporters',
        href: ROUTES.DISTRIBUTOR.TRANSPORTERS,
        icon: 'Truck',
        roles: [Role.DISTRIBUTOR],
    },
    {
        label: 'Outgoing Legs',
        href: ROUTES.DISTRIBUTOR.LEGS,
        icon: 'Send',
        roles: [Role.DISTRIBUTOR],
    },

    // Admin Navigation
    {
        label: 'Users',
        href: ROUTES.ADMIN.USERS,
        icon: 'Users',
        roles: [Role.ADMIN],
    },
    {
        label: 'Role Requests',
        href: ROUTES.ADMIN.ROLE_REQUESTS,
        icon: 'UserCheck',
        roles: [Role.ADMIN],
    },
    {
        label: 'All Orders',
        href: ROUTES.ADMIN.ORDERS,
        icon: 'ShoppingCart',
        roles: [Role.ADMIN],
    },
];

export function getNavigationForRole(role: Role): NavItem[] {
    return NAVIGATION.filter((item) => item.roles.includes(role));
}

// Navigation config organized by role
export const navigationConfig: Record<Role, NavItem[]> = {
    [Role.ADMIN]: NAVIGATION.filter(item => item.roles.includes(Role.ADMIN)),
    [Role.SUPPLIER]: NAVIGATION.filter(item => item.roles.includes(Role.SUPPLIER)),
    [Role.DISTRIBUTOR]: NAVIGATION.filter(item => item.roles.includes(Role.DISTRIBUTOR)),
    [Role.CUSTOMER]: NAVIGATION.filter(item => item.roles.includes(Role.CUSTOMER)),
};