"use client";

import { User, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import Container from "@/components/layout/Container";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function ProfilePage() {
    const { user, setUser } = useAuth();
    const { showToast } = useToast();

    if (!user) return null;

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
        <Container>
            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your account information
                    </p>
                </div>

                {/* Profile Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarFallback className="text-2xl">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle>{user.name}</CardTitle>
                                    <CardDescription>{user.email}</CardDescription>
                                    <div className="flex gap-2 mt-2">
                                        {user.role && (
                                            <Badge variant="default">
                                                {user.role}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Email (Read-only) */}
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium">{user.email}</p>
                            </div>
                        </div>

                        {/* Name */}
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="font-medium">{user.name}</p>
                            </div>
                        </div>

                        {/* Supplier Profile */}
                        {(user as any).supplierProfile && (
                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Supplier Business</p>
                                    <p className="font-medium">{(user as any).supplierProfile.businessName}</p>
                                    {(user as any).supplierProfile.businessAddress && (
                                        <p className="text-sm text-gray-500">{(user as any).supplierProfile.businessAddress}</p>
                                    )}
                                    {(user as any).supplierProfile.contactNumber && (
                                        <p className="text-sm text-gray-500">📞 {(user as any).supplierProfile.contactNumber}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Distributor Profile */}
                        {(user as any).distributorProfile && (
                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Distributor Business</p>
                                    <p className="font-medium">{(user as any).distributorProfile.businessName}</p>
                                    {(user as any).distributorProfile.businessAddress && (
                                        <p className="text-sm text-gray-500">{(user as any).distributorProfile.businessAddress}</p>
                                    )}
                                    {(user as any).distributorProfile.contactNumber && (
                                        <p className="text-sm text-gray-500">📞 {(user as any).distributorProfile.contactNumber}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Created At */}
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">Account Created</p>
                                <p className="font-medium">{new Date((user as any).createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Container>
    );
}
