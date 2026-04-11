"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home, User, ShoppingCart, Package, QrCode, UserPlus,
    Building, Database, ShoppingBag, Truck, Warehouse,
    Inbox, Send, Users, UserCheck, ClipboardCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { navigationConfig } from "@/config/navigation";
import { Role } from "@/types/enums";
import { LucideIcon } from "lucide-react";

// Map icon names to icon components
const iconMap: Record<string, LucideIcon> = {
    Home,
    User,
    ShoppingCart,
    Package,
    QrCode,
    UserPlus,
    Building,
    Database,
    ShoppingBag,
    Truck,
    Warehouse,
    Inbox,
    Send,
    Users,
    UserCheck,
    ClipboardCheck,
};

export default function Sidebar() {
    const { user } = useAuth();
    const pathname = usePathname();

    // Early return if no user
    if (!user || !user.role) {
        return null;
    }

    const userRole = user.role as Role;

    // Check if navigationConfig exists and has the role
    if (!navigationConfig || !navigationConfig[userRole]) {
        return null;
    }

    const menuItems = navigationConfig[userRole];

    // Don't render if no menu items
    if (!menuItems || menuItems.length === 0) {
        return null;
    }

    return (
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:bg-card">
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-3">
                    {menuItems.map((item) => {
                        // Skip items without href
                        if (!item || !item.href || !item.label) {
                            return null;
                        }

                        const Icon = item.icon ? iconMap[item.icon] : Package;
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                {Icon && <Icon className="h-5 w-5" />}
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* User Info at Bottom */}
            <div className="border-t p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium">{user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
