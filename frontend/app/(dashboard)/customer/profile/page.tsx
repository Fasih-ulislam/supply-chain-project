"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Calendar, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Container from "@/components/layout/Container";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/userService";
import { User as UserType } from "@/types";

export default function ProfilePage() {
    const { user: authUser, setUser: setAuthUser } = useAuth();
    const { showToast } = useToast();
    const [user, setUser] = useState<UserType | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: "",
    });

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const profile = await userService.getUser();
                setUser(profile);
                setFormData({
                    name: profile.name || "",
                    phone: (profile as any).phone || "",
                    address: (profile as any).address || "",
                });
            } catch (_error) {
                showToast("Failed to load profile", "error");
            } finally {
                setIsLoadingProfile(false);
            }
        };

        if (authUser) {
            fetchUserProfile();
        }
    }, [authUser, showToast]);

    if (!authUser || isLoadingProfile) {
        return (
            <Container>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Spinner size="lg" />
                </div>
            </Container>
        );
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const response = await userService.updateUser(formData);
            setUser(response.user);
            setAuthUser({ ...authUser!, name: response.user.name });
            setIsEditing(false);
            showToast("Profile updated successfully", "success");
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            showToast(err.response?.data?.message || "Failed to update profile", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (user) {
            setFormData({
                name: user.name || "",
                phone: (user as any).phone || "",
                address: (user as any).address || "",
            });
        }
        setIsEditing(false);
    };

    if (!user) {
        return null;
    }

    return (
        <Container>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage your account information
                        </p>
                    </div>
                    {!isEditing && (
                        <Button onClick={() => setIsEditing(true)}>
                            Edit Profile
                        </Button>
                    )}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Profile Information */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>
                                Your basic account details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Name */}
                            <div className="grid gap-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Full Name
                                </label>
                                <Input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="Enter your full name"
                                />
                            </div>

                            {/* Email */}
                            <div className="grid gap-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Email Address
                                </label>
                                <Input
                                    value={user.email}
                                    disabled
                                    className="bg-muted"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Email cannot be changed
                                </p>
                            </div>

                            {/* Phone */}
                            <div className="grid gap-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    Phone Number
                                </label>
                                <Input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="Enter your phone number"
                                />
                            </div>

                            {/* Address */}
                            <div className="grid gap-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Address
                                </label>
                                <Input
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="Enter your address"
                                />
                            </div>

                            {/* Action Buttons */}
                            {isEditing && (
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="flex-1"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Account Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Status</CardTitle>
                            <CardDescription>
                                Your account verification and role
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Role</span>
                                <Badge variant="default">{authUser.role}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Member Since</span>
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Information</CardTitle>
                            <CardDescription>
                                Other account details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">User ID</span>
                                    <span className="text-sm text-muted-foreground font-mono">
                                        #{user.id}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Last Updated</span>
                                    <span className="text-sm text-muted-foreground">
                                        {new Date(user.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Container>
    );
}
