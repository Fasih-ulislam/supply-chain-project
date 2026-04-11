"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Package, Building2, Calendar, User, MapPin, LogIn } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { formatDate, formatCurrency } from "@/lib/utils";
import axios from "@/lib/axios";

interface OrderDetails {
    id: number;
    status: string;
    orderDate: string;
    totalAmount: number;
    quantity: number;
    deliveryAddress: string;
    product: {
        name: string;
        description: string;
        price: number;
    };
    customer: {
        id: number;
        name: string;
        email: string;
    };
    supplier: {
        businessName: string;
        contactNumber: string;
    };
}

export default function VerifyOrderPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isLoading: authLoading } = useAuth();
    const [isVerifying, setIsVerifying] = useState(false);
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [verificationMessage, setVerificationMessage] = useState<string>("");
    const [hasAttemptedVerification, setHasAttemptedVerification] = useState(false);
    const token = searchParams.get("token");

    useEffect(() => {
        // Wait for auth to load
        if (authLoading) return;

        // If no token, show error
        if (!token) {
            setError("No verification token provided in URL");
            return;
        }

        // If not logged in, redirect to login with return URL
        if (!user) {
            const returnUrl = `/verify-order?token=${token}`;
            router.push(`/login?redirect=${encodeURIComponent(returnUrl)}`);
            return;
        }

        // User is logged in, verify the order once
        if (!hasAttemptedVerification) {
            setHasAttemptedVerification(true);
            verifyOrder();
        }
    }, [user, authLoading, token, hasAttemptedVerification]);

    const verifyOrder = async () => {
        if (!token || !user) return;

        try {
            setIsVerifying(true);
            setError(null);

            // Call verification endpoint
            const response = await axios.get(`/verify?token=${encodeURIComponent(token)}`);

            if (!response.data.valid) {
                setError(response.data.message || "Verification failed");
                setVerificationMessage(response.data.message || "Invalid QR code");
                return;
            }

            // Fetch full order details
            const fullOrder = await axios.get(`/order/${response.data.order.id}`);

            // Check if order belongs to logged-in customer
            if (fullOrder.data.customerId !== user.id) {
                setError("This order does not belong to you");
                setVerificationMessage("⚠️ This order belongs to a different customer");
                return;
            }

            // Success - order verified and belongs to user
            setOrder(fullOrder.data);
            setVerificationMessage(response.data.message || "✅ Order verified successfully!");
        } catch (err: any) {
            console.error("Verification error:", err);
            const errorMessage = err.response?.data?.message || err.message || "Failed to verify order";
            setError(errorMessage);
            setVerificationMessage(errorMessage);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleGoToDashboard = () => {
        router.push("/dashboard");
    };

    const handleGoToOrders = () => {
        router.push("/customer/orders");
    };

    // Loading state - wait for auth to initialize
    if (authLoading || isVerifying) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center justify-center py-8">
                            <Spinner size="lg" />
                            <p className="mt-4 text-gray-600">
                                {authLoading ? "Loading..." : "Verifying order..."}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl space-y-6">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Order Verification</h1>
                    <p className="text-gray-600 mt-2">Verify the authenticity of your order</p>
                </div>

                {/* Error State */}
                {error && !order && (
                    <Card className="border-red-500 bg-red-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-700">
                                <XCircle className="w-6 h-6" />
                                Verification Failed
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-red-800 font-medium mb-4">{verificationMessage}</p>
                            <div className="flex gap-3">
                                <Button onClick={handleGoToDashboard} variant="outline">
                                    Go to Dashboard
                                </Button>
                                {user?.role === "CUSTOMER" && (
                                    <Button onClick={handleGoToOrders}>
                                        View My Orders
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Success State - Show Order Details */}
                {order && !error && (
                    <>
                        <Card className="border-green-500 bg-green-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-700">
                                    <CheckCircle className="w-6 h-6" />
                                    Order Verified Successfully
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-green-800 font-medium">{verificationMessage}</p>
                            </CardContent>
                        </Card>

                        {/* Order Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Order Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Order Info Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Order ID</p>
                                        <p className="font-semibold text-gray-900">#{order.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Status</p>
                                        <Badge variant={
                                            order.status === 'DELIVERED' ? 'success' :
                                                order.status === 'IN_PROGRESS' ? 'info' :
                                                    order.status === 'APPROVED' ? 'warning' : 'default'
                                        }>
                                            {order.status}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Order Date</p>
                                        <p className="font-medium text-gray-900 flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {formatDate(order.orderDate)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total Amount</p>
                                        <p className="font-semibold text-gray-900 text-lg">{formatCurrency(order.totalAmount)}</p>
                                    </div>
                                </div>

                                {/* Product Details */}
                                <div className="border-t pt-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Product Details</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="font-medium text-gray-900 mb-1">{order.product.name}</p>
                                        <p className="text-sm text-gray-600 mb-2">{order.product.description}</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Quantity: {order.quantity}</span>
                                            <span className="font-medium">{formatCurrency(order.product.price)} each</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="border-t pt-4">
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Customer Information
                                    </h4>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="font-medium text-gray-900">{order.customer.name}</p>
                                        <p className="text-sm text-gray-600">{order.customer.email}</p>
                                    </div>
                                </div>

                                {/* Supplier Info */}
                                <div className="border-t pt-4">
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Building2 className="w-4 h-4" />
                                        Supplier Information
                                    </h4>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="font-medium text-gray-900">{order.supplier.businessName}</p>
                                        <p className="text-sm text-gray-600">{order.supplier.contactNumber}</p>
                                    </div>
                                </div>

                                {/* Delivery Address */}
                                <div className="border-t pt-4">
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Delivery Address
                                    </h4>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-gray-900">{order.deliveryAddress}</p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <Button onClick={handleGoToDashboard} variant="outline" className="flex-1">
                                        Go to Dashboard
                                    </Button>
                                    <Button onClick={handleGoToOrders} className="flex-1">
                                        View All Orders
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}

                {/* Not Logged In State - Should redirect, but show message briefly */}
                {!user && !authLoading && (
                    <Card className="border-blue-500 bg-blue-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-700">
                                <LogIn className="w-6 h-6" />
                                Authentication Required
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-blue-800 mb-4">Please log in to verify your order</p>
                            <Button onClick={() => router.push(`/login?redirect=/verify-order?token=${token}`)}>
                                <LogIn className="mr-2 h-4 w-4" />
                                Log In
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
