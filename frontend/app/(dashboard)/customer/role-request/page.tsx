"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Clock, XCircle, Send, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import Container from "@/components/layout/Container";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { roleRequestService } from "@/services/roleRequestService";
import { RoleRequest } from "@/types";

const AVAILABLE_ROLES = [
    {
        value: "SUPPLIER",
        label: "Supplier",
        description: "Manage products, inventory, and fulfill orders",
        icon: "📦",
    },
    {
        value: "DISTRIBUTOR",
        label: "Distributor",
        description: "Handle order delivery and logistics",
        icon: "🚚",
    },
];

export default function RoleRequestPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [requests, setRequests] = useState<RoleRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [selectedRole, setSelectedRole] = useState("");
    const [formData, setFormData] = useState({
        businessName: "",
        businessAddress: "",
        contactNumber: "",
        NTN: "",
    });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const data = await roleRequestService.getMyRequests();
            setRequests(data);
        } catch (error: any) {
            showToast(error.response?.data?.message || "Failed to fetch requests", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestRole = async (requestedRole: string) => {
        setSelectedRole(requestedRole);
        setFormData({
            businessName: "",
            businessAddress: "",
            contactNumber: "",
            NTN: "",
        });
        setShowDialog(true);
    };

    const handleSubmitRequest = async () => {
        if (!formData.businessName || !formData.businessAddress || !formData.contactNumber) {
            showToast("Please fill in all required fields", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            const requestData: any = {
                requestedRole: selectedRole,
                businessName: formData.businessName,
                businessAddress: formData.businessAddress,
                contactNumber: formData.contactNumber,
            };

            // Only include NTN if it's not empty
            if (formData.NTN && formData.NTN.trim()) {
                requestData.NTN = formData.NTN;
            }

            await roleRequestService.create(requestData);
            showToast("Role request submitted successfully!", "success");
            setShowDialog(false);
            fetchRequests();
        } catch (error: any) {
            showToast(error.response?.data?.message || "Failed to submit request", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteRequest = async (id: number) => {
        try {
            await roleRequestService.delete(id);
            showToast("Request deleted successfully", "success");
            fetchRequests();
        } catch (error: any) {
            showToast(error.response?.data?.message || "Failed to delete request", "error");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "APPROVED":
                return <Badge variant="success">Approved</Badge>;
            case "REJECTED":
                return <Badge variant="destructive">Rejected</Badge>;
            case "PENDING":
                return <Badge variant="warning">Pending</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "APPROVED":
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case "REJECTED":
                return <XCircle className="h-5 w-5 text-red-500" />;
            case "PENDING":
                return <Clock className="h-5 w-5 text-yellow-500" />;
            default:
                return null;
        }
    };

    const canRequestRole = (role: string) => {
        // Check if user already has this role
        if (user?.role === role) return false;

        // Check if there's already a pending request for this role
        const hasPendingRequest = requests.some(
            (req) => req.requestedRole === role && req.status === "PENDING"
        );

        return !hasPendingRequest;
    };

    return (
        <Container>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Role Upgrade Request</h1>
                    <p className="text-muted-foreground mt-2">
                        Request additional roles to access more features
                    </p>
                </div>

                {/* Current Roles */}
                <Card>
                    <CardHeader>
                        <CardTitle>Your Current Roles</CardTitle>
                        <CardDescription>
                            Roles you currently have access to
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            {user?.role ? (
                                <Badge variant="default" className="text-sm">
                                    {user.role}
                                </Badge>
                            ) : (
                                <p className="text-muted-foreground">No roles assigned</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Available Roles */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Request New Role</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {AVAILABLE_ROLES.map((role) => {
                            const canRequest = canRequestRole(role.value);
                            const hasRole = user?.role === role.value;

                            return (
                                <Card key={role.value}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-4xl">{role.icon}</span>
                                                <div>
                                                    <CardTitle>{role.label}</CardTitle>
                                                    <CardDescription className="mt-1">
                                                        {role.description}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {hasRole ? (
                                            <Badge variant="success" className="w-full justify-center">
                                                Already Have This Role
                                            </Badge>
                                        ) : canRequest ? (
                                            <Button
                                                onClick={() => handleRequestRole(role.value)}
                                                disabled={isSubmitting}
                                                className="w-full"
                                            >
                                                <Send className="mr-2 h-4 w-4" />
                                                Request {role.label} Role
                                            </Button>
                                        ) : (
                                            <Badge variant="warning" className="w-full justify-center">
                                                Request Pending
                                            </Badge>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* My Requests */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4">My Requests</h2>
                    {isLoading ? (
                        <Card>
                            <CardContent className="py-8">
                                <p className="text-center text-muted-foreground">Loading requests...</p>
                            </CardContent>
                        </Card>
                    ) : requests.length === 0 ? (
                        <Card>
                            <CardContent className="py-8">
                                <div className="text-center">
                                    <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">No role requests yet</p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Request a new role above to get started
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {requests.map((request) => (
                                <Card key={request.id}>
                                    <CardContent className="py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                {getStatusIcon(request.status)}
                                                <div>
                                                    <h3 className="font-semibold">
                                                        {request.requestedRole} Role Request
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Requested on{" "}
                                                        {new Date(request.createdAt).toLocaleDateString()}
                                                    </p>
                                                    {request.status === "APPROVED" && (
                                                        <p className="text-sm text-green-600">
                                                            Approved on{" "}
                                                            {new Date(request.updatedAt).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                    {request.status === "REJECTED" && (
                                                        <p className="text-sm text-red-600">
                                                            Rejected on{" "}
                                                            {new Date(request.updatedAt).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {getStatusBadge(request.status)}
                                                {request.status === "PENDING" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteRequest(request.id)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Role Request Form Dialog */}
            <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">
                        Request {selectedRole} Role
                    </h2>
                    <p className="text-muted-foreground">
                        Please provide your business details to request the {selectedRole.toLowerCase()} role.
                    </p>

                    <div className="space-y-4 mt-4">
                        <div>
                            <Label htmlFor="businessName">Business Name *</Label>
                            <Input
                                id="businessName"
                                value={formData.businessName}
                                onChange={(e) =>
                                    setFormData({ ...formData, businessName: e.target.value })
                                }
                                placeholder="Enter your business name"
                            />
                        </div>

                        <div>
                            <Label htmlFor="businessAddress">Business Address *</Label>
                            <Input
                                id="businessAddress"
                                value={formData.businessAddress}
                                onChange={(e) =>
                                    setFormData({ ...formData, businessAddress: e.target.value })
                                }
                                placeholder="Enter your business address"
                            />
                        </div>

                        <div>
                            <Label htmlFor="contactNumber">Contact Number *</Label>
                            <Input
                                id="contactNumber"
                                value={formData.contactNumber}
                                onChange={(e) =>
                                    setFormData({ ...formData, contactNumber: e.target.value })
                                }
                                placeholder="e.g., +92-300-1234567"
                            />
                        </div>

                        <div>
                            <Label htmlFor="NTN">NTN (Optional)</Label>
                            <Input
                                id="NTN"
                                value={formData.NTN}
                                onChange={(e) =>
                                    setFormData({ ...formData, NTN: e.target.value })
                                }
                                placeholder="Enter your National Tax Number"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setShowDialog(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitRequest} disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : "Submit Request"}
                        </Button>
                    </div>
                </div>
            </Dialog>
        </Container>
    );
}
