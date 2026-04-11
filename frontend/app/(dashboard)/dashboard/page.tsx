"use client";

import { useAuth } from "@/context/AuthContext";
import { Role } from "@/types/enums";
import { Package, ShoppingCart, Users, TrendingUp, Box, Truck, ClipboardList, CheckCircle, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Container from "@/components/layout/Container";
import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { useFetch } from "@/hooks/useFetch";
import { orderService } from "@/services/orderService";
import { supplierService } from "@/services/supplierService";
import { distributorService } from "@/services/distributorService";
import { userService } from "@/services/userService";
import { roleRequestService } from "@/services/roleRequestService";
import { Order, Inventory } from "@/types";

export default function DashboardPage() {
    const { user } = useAuth();

    // Fetch data based on role
    const { data: customerOrders } = useFetch(
        () => user?.role === Role.CUSTOMER ? orderService.getMyOrders() : Promise.resolve([]),
        { skip: !user || user.role !== Role.CUSTOMER }
    );

    const { data: supplierProducts } = useFetch(
        () => user?.role === Role.SUPPLIER ? supplierService.getProducts() : Promise.resolve([]),
        { skip: !user || user.role !== Role.SUPPLIER }
    );

    const { data: supplierInventory } = useFetch(
        () => user?.role === Role.SUPPLIER ? supplierService.getInventory() : Promise.resolve([]),
        { skip: !user || user.role !== Role.SUPPLIER }
    );

    const { data: supplierOrders } = useFetch(
        () => user?.role === Role.SUPPLIER ? supplierService.getOrders() : Promise.resolve([]),
        { skip: !user || user.role !== Role.SUPPLIER }
    );

    const { data: distributorAssignedOrders } = useFetch(
        () => user?.role === Role.DISTRIBUTOR ? distributorService.getAssignedOrders() : Promise.resolve([]),
        { skip: !user || user.role !== Role.DISTRIBUTOR }
    );

    const { data: distributorHeldOrders } = useFetch(
        () => user?.role === Role.DISTRIBUTOR ? distributorService.getHeldOrders() : Promise.resolve([]),
        { skip: !user || user.role !== Role.DISTRIBUTOR }
    );

    const { data: distributorTransporters } = useFetch(
        () => user?.role === Role.DISTRIBUTOR ? distributorService.getTransporters() : Promise.resolve([]),
        { skip: !user || user.role !== Role.DISTRIBUTOR }
    );

    const { data: allUsers } = useFetch(
        () => user?.role === Role.ADMIN ? userService.getAllUsers() : Promise.resolve([]),
        { skip: !user || user.role !== Role.ADMIN }
    );

    const { data: allRoleRequests } = useFetch(
        () => user?.role === Role.ADMIN ? roleRequestService.getAll() : Promise.resolve([]),
        { skip: !user || user.role !== Role.ADMIN }
    );

    const { data: allProducts } = useFetch(
        () => user?.role === Role.ADMIN ? orderService.getAvailableProducts() : Promise.resolve([]),
        { skip: !user || user.role !== Role.ADMIN }
    );

    if (!user) {
        return null;
    }

    const userRole = user.role as Role;

    // Stats based on role with real data
    const getStats = () => {
        switch (userRole) {
            case Role.CUSTOMER:
                const activeOrders = (customerOrders as Order[] | null)?.filter((o: Order) =>
                    ['PENDING', 'APPROVED', 'IN_TRANSIT'].includes(o.status)
                ) || [];
                const completedOrders = (customerOrders as Order[] | null)?.filter((o: Order) =>
                    o.status === 'DELIVERED'
                ) || [];
                const pendingOrders = (customerOrders as Order[] | null)?.filter((o: Order) =>
                    o.status === 'PENDING'
                ) || [];

                return [
                    { title: "Total Orders", value: customerOrders?.length || 0, icon: ShoppingCart, change: "+3 this month" },
                    { title: "Active Orders", value: activeOrders.length, icon: TrendingUp, change: "In transit" },
                    { title: "Completed", value: completedOrders.length, icon: CheckCircle, change: "All time" },
                    { title: "Pending", value: pendingOrders.length, icon: ClipboardList, change: "Awaiting approval" },
                ];

            case Role.SUPPLIER:
                const totalInventory = (supplierInventory as Inventory[] | null)?.reduce((sum: number, inv: Inventory) =>
                    sum + (inv.quantity || 0), 0
                ) || 0;

                return [
                    { title: "Products", value: supplierProducts?.length || 0, icon: Package, change: "In catalog" },
                    { title: "Orders", value: supplierOrders?.length || 0, icon: ShoppingCart, change: "+5 this week" },
                    { title: "Inventory", value: totalInventory, icon: Box, change: "Units in stock" },
                    { title: "Warehouse", value: "1", icon: Truck, change: "Active location" },
                ];

            case Role.DISTRIBUTOR:
                const forwardedOrders = (distributorAssignedOrders as any[] | null)?.filter((o) =>
                    o.status === 'IN_TRANSIT'
                ) || [];
                const heldInventory = distributorHeldOrders?.length || 0;

                return [
                    { title: "Received Orders", value: distributorAssignedOrders?.length || 0, icon: ShoppingCart, change: "+4 this week" },
                    { title: "Forwarded", value: forwardedOrders.length, icon: Truck, change: "In transit" },
                    { title: "Held Orders", value: heldInventory, icon: Box, change: "Currently holding" },
                    { title: "Transporters", value: distributorTransporters?.length || 0, icon: Truck, change: "Active" },
                ];

            case Role.ADMIN:
                const pendingRequests = (allRoleRequests as any[] | null)?.filter((r) =>
                    r.status === 'PENDING'
                ) || [];

                return [
                    { title: "Total Users", value: allUsers?.length || 0, icon: Users, change: "+12 this month" },
                    { title: "Pending Requests", value: pendingRequests.length, icon: ClipboardList, change: "Role upgrades" },
                    { title: "Active Orders", value: "N/A", icon: ShoppingCart, change: "System-wide" },
                    { title: "Products", value: allProducts?.length || 0, icon: Package, change: "Total catalog" },
                ];

            default:
                return [];
        }
    };

    const stats = getStats();

    const getWelcomeMessage = () => {
        const hour = new Date().getHours();
        const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
        return `${greeting}, ${user.name}!`;
    };

    const getQuickActions = () => {
        switch (userRole) {
            case Role.CUSTOMER:
                return [
                    { label: "Browse Products", href: ROUTES.CUSTOMER.PRODUCTS, icon: Package },
                    { label: "My Orders", href: ROUTES.CUSTOMER.ORDERS, icon: ShoppingCart },
                    { label: "Upgrade Role", href: ROUTES.CUSTOMER.ROLE_REQUEST, icon: UserPlus },
                ];
            case Role.SUPPLIER:
                return [
                    { label: "Manage Products", href: ROUTES.SUPPLIER.PRODUCTS, icon: Package },
                    { label: "View Orders", href: ROUTES.SUPPLIER.ORDERS, icon: ShoppingCart },
                    { label: "Manage Inventory", href: ROUTES.SUPPLIER.INVENTORY, icon: Box },
                ];
            case Role.DISTRIBUTOR:
                return [
                    { label: "Assigned Orders", href: ROUTES.DISTRIBUTOR.ASSIGNED_ORDERS, icon: ShoppingCart },
                    { label: "Held Orders", href: ROUTES.DISTRIBUTOR.HELD_ORDERS, icon: Truck },
                    { label: "Manage Legs", href: ROUTES.DISTRIBUTOR.LEGS, icon: Box },
                ];
            case Role.ADMIN:
                return [
                    { label: "Role Requests", href: ROUTES.ADMIN.ROLE_REQUESTS, icon: ClipboardList },
                    { label: "All Users", href: ROUTES.ADMIN.USERS, icon: Users },
                    { label: "All Orders", href: ROUTES.ADMIN.ORDERS, icon: TrendingUp },
                ];
            default:
                return [];
        }
    };

    const quickActions = getQuickActions();

    return (
        <Container>
            <div className="space-y-8">
                {/* Welcome Section */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{getWelcomeMessage()}</h1>
                    <p className="text-muted-foreground mt-2">
                        Here&apos;s what&apos;s happening with your account today.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant="default">{userRole}</Badge>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={stat.title}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {stat.title}
                                    </CardTitle>
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {stat.change}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Commonly used features for quick access
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {quickActions.map((action) => {
                                const Icon = action.icon;
                                return (
                                    <Link
                                        key={action.label}
                                        href={action.href}
                                        className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                            <Icon className="h-5 w-5 text-primary" />
                                        </div>
                                        <span className="font-medium">{action.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Your latest actions and updates
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 border-b pb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Welcome to SupplyChain!</p>
                                    <p className="text-sm text-muted-foreground">
                                        Your account has been successfully created
                                    </p>
                                </div>
                                <span className="text-xs text-muted-foreground">Just now</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Container>
    );
}
