"use client";

import { useState, useEffect, useRef } from "react";
import { QrCode, CheckCircle, XCircle, AlertCircle, Package, Building2, Calendar, User, MapPin, Camera, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Container from "@/components/layout/Container";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { formatDate, formatCurrency } from "@/lib/utils";
import axios from "@/lib/axios";
import { Html5Qrcode } from "html5-qrcode";

interface VerificationResult {
    success: boolean;
    message: string;
    order?: {
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
    };
}

export default function CustomerVerifyQRPage() {
    const { showToast } = useToast();
    const { user } = useAuth();
    const [qrToken, setQrToken] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
    const [showScanner, setShowScanner] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const scannerInitialized = useRef(false);

    useEffect(() => {
        return () => {
            // Cleanup scanner on unmount
            if (scannerRef.current && scannerInitialized.current) {
                scannerRef.current.stop().catch(console.error);
            }
        };
    }, []);

    const startScanner = async () => {
        try {
            setScanError(null);
            const scanner = new Html5Qrcode("qr-reader");
            scannerRef.current = scanner;

            await scanner.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText) => {
                    // Success callback - QR code scanned
                    handleScanSuccess(decodedText);
                },
                (errorMessage) => {
                    // Error callback - can be ignored for scanning issues
                    // Only log significant errors
                }
            );
            scannerInitialized.current = true;
        } catch (err: any) {
            console.error("Scanner error:", err);
            setScanError("Unable to access camera. Please ensure camera permissions are granted.");
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current && scannerInitialized.current) {
            try {
                await scannerRef.current.stop();
                scannerInitialized.current = false;
            } catch (err) {
                console.error("Error stopping scanner:", err);
            }
        }
    };

    const handleScanSuccess = (decodedText: string) => {
        console.log("Scanned QR code:", decodedText);
        const trimmedToken = decodedText.trim();

        // Check if it's a URL (starts with http:// or https://)
        if (trimmedToken.startsWith('http://') || trimmedToken.startsWith('https://')) {
            // It's a URL, redirect to it
            stopScanner();
            setShowScanner(false);
            showToast("Redirecting to verification page...", "success");
            window.location.href = trimmedToken;
        } else {
            // It's just a token, verify directly
            setQrToken(trimmedToken);
            setShowScanner(false);
            stopScanner();
            showToast("QR code scanned successfully!", "success");
            handleVerifyWithToken(trimmedToken);
        }
    };

    const toggleScanner = async () => {
        if (showScanner) {
            await stopScanner();
            setShowScanner(false);
        } else {
            setShowScanner(true);
            // Small delay to ensure div is rendered
            setTimeout(() => startScanner(), 100);
        }
    };

    const handleVerifyWithToken = async (token: string) => {
        const trimmedToken = token.trim();

        if (!trimmedToken) {
            showToast("Please enter a QR code token", "error");
            return;
        }

        console.log("Verifying token:", trimmedToken);
        console.log("Token length:", trimmedToken.length);

        try {
            setIsVerifying(true);
            setVerificationResult(null);

            const response = await axios.get(`/verification?token=${encodeURIComponent(trimmedToken)}`);
            console.log("Verification response:", response.data);

            // Backend returns { valid: true/false, message, order: {...}, error }
            if (!response.data.valid) {
                setVerificationResult({
                    success: false,
                    message: response.data.message || "Verification failed",
                });
                showToast(response.data.message || "Verification failed", "error");
            } else {
                // Fetch full order details for display
                const fullOrder = await axios.get(`/order/${response.data.order.id}`);

                setVerificationResult({
                    success: true,
                    message: response.data.message || "✅ Order verified successfully!",
                    order: fullOrder.data,
                });
                showToast("Order verified successfully!", "success");
            }
        } catch (error: any) {
            console.error("Verification error:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to verify QR code";
            setVerificationResult({
                success: false,
                message: errorMessage,
            });
            showToast(errorMessage, "error");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleVerify = () => {
        handleVerifyWithToken(qrToken);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleVerify();
        }
    };

    return (
        <Container>
            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Verify QR Code</h1>
                    <p className="text-muted-foreground mt-2">
                        Scan or enter the QR code token to verify your order authenticity
                    </p>
                </div>

                {/* Verification Input */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <QrCode className="w-5 h-5" />
                            Verify QR Code
                        </CardTitle>
                        <CardDescription>
                            Scan the QR code with your camera or enter the token manually
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Scanner Toggle */}
                        <div className="flex gap-3">
                            <Button
                                onClick={toggleScanner}
                                variant={showScanner ? "destructive" : "default"}
                                className="flex-1"
                            >
                                {showScanner ? (
                                    <>
                                        <X className="mr-2 h-4 w-4" />
                                        Close Scanner
                                    </>
                                ) : (
                                    <>
                                        <Camera className="mr-2 h-4 w-4" />
                                        Scan QR Code
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* QR Scanner */}
                        {showScanner && (
                            <div className="space-y-3">
                                <div id="qr-reader" className="rounded-lg overflow-hidden border-2 border-blue-500"></div>
                                {scanError && (
                                    <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                        <p className="text-sm text-yellow-800">{scanError}</p>
                                    </div>
                                )}
                                <p className="text-sm text-muted-foreground text-center">
                                    Position the QR code within the frame to scan
                                </p>
                            </div>
                        )}

                        {/* Manual Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Or enter token manually:</label>
                            <div className="flex gap-3">
                                <Input
                                    type="text"
                                    placeholder="Enter QR code token"
                                    value={qrToken}
                                    onChange={(e) => setQrToken(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="flex-1 font-mono text-sm"
                                />
                                <Button onClick={handleVerify} disabled={isVerifying || !qrToken.trim()}>
                                    {isVerifying ? (
                                        <>
                                            <Spinner size="sm" className="mr-2" />
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            <QrCode className="mr-2 h-4 w-4" />
                                            Verify
                                        </>
                                    )}
                                </Button>
                            </div>
                            {qrToken && (
                                <div className="text-xs text-muted-foreground p-2 bg-gray-50 rounded border">
                                    <p className="font-semibold mb-1">Token Preview:</p>
                                    <p className="break-all font-mono">{qrToken}</p>
                                    <p className="mt-1">Length: {qrToken.length} characters</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Verification Result */}
                {verificationResult && (
                    <Card className={verificationResult.success ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {verificationResult.success ? (
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                ) : (
                                    <XCircle className="w-6 h-6 text-red-600" />
                                )}
                                {verificationResult.success ? "Verification Successful" : "Verification Failed"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className={verificationResult.success ? "text-green-800 font-medium" : "text-red-800 font-medium"}>
                                {verificationResult.message}
                            </p>

                            {/* Order Details - Only show if successful and correct customer */}
                            {verificationResult.success && verificationResult.order && (
                                <div className="mt-6 space-y-6">
                                    {/* Order Information */}
                                    <div className="bg-white p-4 rounded-lg border border-green-200">
                                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <Package className="w-4 h-4" />
                                            Order Information
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500">Order ID</p>
                                                <p className="font-medium text-gray-900">#{verificationResult.order.id}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Status</p>
                                                <Badge variant={
                                                    verificationResult.order.status === 'DELIVERED' ? 'success' :
                                                        verificationResult.order.status === 'IN_PROGRESS' ? 'info' :
                                                            verificationResult.order.status === 'APPROVED' ? 'warning' : 'default'
                                                }>
                                                    {verificationResult.order.status}
                                                </Badge>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Order Date</p>
                                                <p className="font-medium text-gray-900">{formatDate(verificationResult.order.orderDate)}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Total Amount</p>
                                                <p className="font-medium text-gray-900 text-lg">{formatCurrency(verificationResult.order.totalAmount)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Product Information */}
                                    <div className="bg-white p-4 rounded-lg border border-green-200">
                                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <Package className="w-4 h-4" />
                                            Product Details
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <p className="text-gray-500">Product Name</p>
                                                <p className="font-medium text-gray-900">{verificationResult.order.product.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Description</p>
                                                <p className="font-medium text-gray-900">{verificationResult.order.product.description}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-gray-500">Quantity</p>
                                                    <p className="font-medium text-gray-900">{verificationResult.order.quantity}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Unit Price</p>
                                                    <p className="font-medium text-gray-900">{formatCurrency(verificationResult.order.product.price)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Customer Information */}
                                    <div className="bg-white p-4 rounded-lg border border-green-200">
                                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            Your Information
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <p className="text-gray-500">Name</p>
                                                <p className="font-medium text-gray-900">{verificationResult.order.customer.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Email</p>
                                                <p className="font-medium text-gray-900">{verificationResult.order.customer.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Supplier Information */}
                                    <div className="bg-white p-4 rounded-lg border border-green-200">
                                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <Building2 className="w-4 h-4" />
                                            Supplier Information
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <p className="text-gray-500">Business Name</p>
                                                <p className="font-medium text-gray-900">{verificationResult.order.supplier.businessName}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Contact</p>
                                                <p className="font-medium text-gray-900">{verificationResult.order.supplier.contactNumber}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delivery Information */}
                                    <div className="bg-white p-4 rounded-lg border border-green-200">
                                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            Delivery Address
                                        </h3>
                                        <p className="text-sm font-medium text-gray-900">{verificationResult.order.deliveryAddress}</p>
                                    </div>

                                    {/* Authenticity Confirmation */}
                                    <div className="bg-green-100 p-4 rounded-lg border-2 border-green-500">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="font-semibold text-green-900 mb-1">Authenticity Verified</h4>
                                                <p className="text-sm text-green-800">
                                                    This order has been verified as authentic and belongs to you.
                                                    The product was supplied by {verificationResult.order.supplier.businessName}
                                                    and has been digitally signed to ensure its authenticity throughout the supply chain.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Help Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            How to Verify
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 text-sm text-gray-600">
                            <p>1. Scan the QR code on your product packaging or order document</p>
                            <p>2. Copy the token displayed after scanning</p>
                            <p>3. Paste the token in the input field above</p>
                            <p>4. Click "Verify" to check the authenticity</p>
                            <p className="text-amber-600 font-medium mt-4">
                                ⚠️ Note: You can only verify orders that belong to your account.
                                If you try to verify another customer's order, an error will be shown.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Container>
    );
}
