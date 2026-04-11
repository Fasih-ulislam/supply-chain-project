"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Package, Sun, Moon, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { ROUTES } from "@/config/routes";

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const pathname = usePathname();

    const handleLogout = async () => {
        await logout();
    };

    const getInitials = (name: string | undefined) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href={user ? ROUTES.DASHBOARD : ROUTES.HOME} className="flex items-center space-x-2">
                    <Package className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold">SupplyChain</span>
                </Link>

                {/* Desktop Navigation */}
                {user && (
                    <nav className="hidden md:flex items-center space-x-6">
                        <Link
                            href={ROUTES.DASHBOARD}
                            className={`text-sm font-medium transition-colors hover:text-primary ${pathname === ROUTES.DASHBOARD
                                ? "text-primary"
                                : "text-muted-foreground"
                                }`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            href={ROUTES.PROFILE}
                            className={`text-sm font-medium transition-colors hover:text-primary ${pathname === ROUTES.PROFILE
                                ? "text-primary"
                                : "text-muted-foreground"
                                }`}
                        >
                            Profile
                        </Link>
                    </nav>
                )}

                {/* Right Side Actions */}
                <div className="flex items-center space-x-4">
                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                    >
                        {theme === "dark" ? (
                            <Sun className="h-5 w-5" />
                        ) : (
                            <Moon className="h-5 w-5" />
                        )}
                    </Button>

                    {user ? (
                        <>
                            {/* User Menu */}
                            <div className="hidden md:flex items-center space-x-4">
                                <Link href={ROUTES.PROFILE}>
                                    <Avatar className="h-8 w-8 cursor-pointer">
                                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                    </Avatar>
                                </Link>
                                <Button variant="ghost" size="sm" onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </Button>
                            </div>

                            {/* Mobile Menu Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                            </Button>
                        </>
                    ) : (
                        <div className="hidden md:flex items-center space-x-2">
                            <Link href={ROUTES.LOGIN}>
                                <Button variant="ghost">Login</Button>
                            </Link>
                            <Link href={ROUTES.REGISTER}>
                                <Button>Sign Up</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && user && (
                <div className="border-t md:hidden">
                    <div className="container mx-auto space-y-1 px-4 py-4">
                        <Link
                            href={ROUTES.DASHBOARD}
                            className="block rounded-md px-3 py-2 text-base font-medium hover:bg-accent"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Dashboard
                        </Link>
                        <Link
                            href={ROUTES.PROFILE}
                            className="block rounded-md px-3 py-2 text-base font-medium hover:bg-accent"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Profile
                        </Link>
                        <button
                            onClick={() => {
                                handleLogout();
                                setMobileMenuOpen(false);
                            }}
                            className="w-full text-left block rounded-md px-3 py-2 text-base font-medium hover:bg-accent"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
}
