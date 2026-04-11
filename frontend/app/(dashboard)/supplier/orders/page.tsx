"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Eye, Check, X, Download, Printer, QrCode as QrCodeIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import Container from "@/components/layout/Container";
import { useFetch } from "@/hooks/useFetch";
import { supplierService } from "@/services/supplierService";
import { orderService } from "@/services/orderService";
import { Spinner } from "@/components/ui/Spinner";
import { formatDate, formatCurrency } from "@/lib/utils";
import { OrderStatus } from "@/types/enums";
import { useToast } from "@/context/ToastContext";

export default function SupplierOrdersPage() {
    const { showToast } = useToast();
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [showQRDialog, setShowQRDialog] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [approveForm, setApproveForm] = useState({
        distributorId: '',
        transporterId: '',
        privateKey: ''
    });
    const [rejectReason, setRejectReason] = useState('');
    const [qrData, setQrData] = useState<{ qrToken: string; verificationUrl: string } | null>(null);

    const { data: orders, isLoading, error, refetch } = useFetch(
        () => supplierService.getOrders()
    );

    const { data: distributors } = useFetch(
        () => supplierService.getDistributors()
    );

    const { data: transporters } = useFetch(
        () => supplierService.getTransporters()
    );

    // Generate QR code when dialog opens
    useEffect(() => {
        if (showQRDialog && qrData) {
            generateQRCode().then(dataUrl => {
                if (dataUrl) {
                    const qrDisplay = document.getElementById('qr-display');
                    if (qrDisplay) {
                        qrDisplay.innerHTML = `<img src="${dataUrl}" alt="Order QR Code" class="w-64 h-64" />`;
                    }
                }
            });
        }
    }, [showQRDialog, qrData]);

    const getStatusVariant = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.PENDING:
                return "warning";
            case OrderStatus.APPROVED:
                return "info";
            case OrderStatus.IN_PROGRESS:
                return "info";
            case OrderStatus.DELIVERED:
                return "success";
            case OrderStatus.CANCELLED:
                return "destructive";
            default:
                return "default";
        }
    };

    const handleApprove = async (orderId: number) => {
        const order = orders?.find((o: any) => o.id === orderId);
        setSelectedOrder(order);
        setApproveForm({ distributorId: '', transporterId: '', privateKey: '' });
        setShowApproveDialog(true);
    };

    const handleReject = async (orderId: number) => {
        const order = orders?.find((o: any) => o.id === orderId);
        setSelectedOrder(order);
        setRejectReason('');
        setShowRejectDialog(true);
    };

    const handleViewDetails = (order: any) => {
        setSelectedOrder(order);
        setShowDetailsDialog(true);
    };

    const handleGenerateQR = async (order: any) => {
        setSelectedOrder(order);

        // Check if order already has QR data
        if (order.qrToken) {
            // Generate full URL for QR scanning
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
            const verificationUrl = `${baseUrl}/verify-order?token=${order.qrToken}`;
            setQrData({
                qrToken: order.qrToken,
                verificationUrl: verificationUrl // Full URL for scanning
            });
            setShowQRDialog(true);
        } else {
            showToast("QR code not available for this order", "error");
        }
    };

    const submitApproval = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrder) return;

        try {
            setIsSubmitting(true);
            const response: any = await orderService.approveOrder(selectedOrder.id, {
                distributorId: parseInt(approveForm.distributorId),
                transporterId: parseInt(approveForm.transporterId),
                privateKey: approveForm.privateKey
            });

            // Store QR data from response
            // @ts-ignore - Backend returns qrToken and verificationUrl
            if (response?.qrToken && response?.verificationUrl) {
                setQrData({
                    qrToken: response.qrToken,
                    verificationUrl: response.verificationUrl
                });
            }

            showToast("Order approved successfully!", "success");
            setShowApproveDialog(false);
            setApproveForm({ distributorId: '', transporterId: '', privateKey: '' });

            refetch();
        } catch (error: any) {
            console.log('Approval error caught:', error);
            console.log('Error response:', error.response);
            console.log('Error data:', error.response?.data);

            const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to approve order";

            console.log('Extracted error message:', errorMessage);

            // Show specific error message for invalid private key
            if (errorMessage.toLowerCase().includes('private key') || errorMessage.toLowerCase().includes('invalid key')) {
                showToast("❌ Invalid private key. Please check and try again.", "error");
            } else {
                showToast(errorMessage, "error");
            }

            // Don't close dialog on error so user can retry
        } finally {
            setIsSubmitting(false);
        }
    };

    const submitRejection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrder) return;

        try {
            setIsSubmitting(true);
            await orderService.rejectOrder(selectedOrder.id, {
                reason: rejectReason
            });
            showToast("Order rejected", "success");
            setShowRejectDialog(false);
            refetch();
        } catch (error: any) {
            showToast(error.response?.data?.message || "Failed to reject order", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const generateQRCode = async () => {
        if (!qrData) return null;

        try {
            const dataUrl = await QRCode.toDataURL(qrData.verificationUrl, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            return dataUrl;
        } catch (error) {
            console.error('Error generating QR code:', error);
            showToast("Failed to generate QR code", "error");
            return null;
        }
    };

    const handleDownloadQR = async () => {
        const qrDataUrl = await generateQRCode();
        if (!qrDataUrl) return;

        const link = document.createElement('a');
        link.href = qrDataUrl;
        link.download = `order-${selectedOrder?.id}-qr.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("QR code downloaded successfully!", "success");
    };

    const handlePrintQR = async () => {
        const qrDataUrl = await generateQRCode();
        if (!qrDataUrl) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Order QR Code - #${selectedOrder?.id}</title>
                    <style>
                        body {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            min-height: 100vh;
                            margin: 0;
                            font-family: Arial, sans-serif;
                        }
                        .qr-container {
                            text-align: center;
                            padding: 20px;
                        }
                        h1 { margin-bottom: 10px; }
                        p { margin: 5px 0; color: #666; }
                        img { margin: 20px 0; border: 2px solid #000; }
                    </style>
                </head>
                <body>
                    <div class="qr-container">
                        <h1>Order #${selectedOrder?.id}</h1>
                        <p><strong>Product:</strong> ${selectedOrder?.product?.name}</p>
                        <p><strong>Customer:</strong> ${selectedOrder?.customer?.name}</p>
                        <img src="${qrDataUrl}" alt="QR Code" />
                        <p>Scan to verify order authenticity</p>
                    </div>
                </body>
            </html>
        `);

        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };

    if (isLoading) {
        return (
            <Container>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Spinner size="lg" />
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Received Orders</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage customer orders for your products
                    </p>
                </div>

                {/* Orders Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Order List</CardTitle>
                        <CardDescription>
                            All orders received for your products
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!orders || orders.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No orders yet</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.map((order: any) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">#{order.id}</TableCell>
                                            <TableCell>{order.customer?.name || "N/A"}</TableCell>
                                            <TableCell>{order.product?.name || "N/A"}</TableCell>
                                            <TableCell>{order.quantity}</TableCell>
                                            <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(order.status)}>
                                                    {order.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{formatDate(order.createdAt)}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    {order.status === OrderStatus.PENDING && (
                                                        <>
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                onClick={() => handleApprove(order.id)}
                                                            >
                                                                <Check className="mr-1 h-4 w-4" />
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleReject(order.id)}
                                                            >
                                                                <X className="mr-1 h-4 w-4" />
                                                                Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                    {(order.status === OrderStatus.APPROVED || order.status === OrderStatus.IN_PROGRESS || order.status === OrderStatus.DELIVERED) && order.qrToken && (
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            onClick={() => handleGenerateQR(order)}
                                                        >
                                                            <QrCodeIcon className="mr-1 h-4 w-4" />
                                                            QR Code
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(order)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Approve Order Dialog */}
                <Dialog open={showApproveDialog} onClose={() => setShowApproveDialog(false)}>
                    <div className="p-6 bg-black text-white">
                        <h2 className="text-2xl font-bold text-white mb-6">Approve Order</h2>
                        {selectedOrder && (
                            <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
                                <h3 className="font-semibold text-white mb-2">Order #{selectedOrder.id}</h3>
                                <div className="space-y-1 text-sm">
                                    <p className="text-gray-300">Customer: <span className="font-medium text-white">{selectedOrder.customer?.name}</span></p>
                                    <p className="text-gray-300">Product: <span className="font-medium text-white">{selectedOrder.product?.name}</span></p>
                                    <p className="text-gray-300">Quantity: <span className="font-medium text-white">{selectedOrder.quantity}</span></p>
                                    <p className="text-gray-300">Total: <span className="font-medium text-white text-lg">{formatCurrency(selectedOrder.totalAmount)}</span></p>
                                    <p className="text-gray-300">Delivery: <span className="font-medium text-white">{selectedOrder.deliveryAddress}</span></p>
                                </div>
                            </div>
                        )}
                        <form onSubmit={submitApproval} className="space-y-4">
                            <div>
                                <Label htmlFor="distributor" className="text-white">Select Distributor *</Label>
                                <select
                                    id="distributor"
                                    className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={approveForm.distributorId}
                                    onChange={(e) => setApproveForm({ ...approveForm, distributorId: e.target.value })}
                                    required
                                >
                                    <option value="" className="text-gray-400">Choose a distributor</option>
                                    {distributors?.map((dist: any) => (
                                        <option key={dist.id} value={dist.id} className="text-white">
                                            {dist.businessName} - {dist.user?.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="transporter" className="text-white">Select Transporter *</Label>
                                <select
                                    id="transporter"
                                    className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={approveForm.transporterId}
                                    onChange={(e) => setApproveForm({ ...approveForm, transporterId: e.target.value })}
                                    required
                                >
                                    <option value="" className="text-gray-400">Choose a transporter</option>
                                    {transporters?.map((trans: any) => (
                                        <option key={trans.id} value={trans.id} className="text-white">
                                            {trans.name} - {trans.phone}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="privateKey" className="text-white">Private Key *</Label>
                                <Input
                                    id="privateKey"
                                    type="password"
                                    placeholder="Enter your private key for digital signature"
                                    value={approveForm.privateKey}
                                    onChange={(e) => setApproveForm({ ...approveForm, privateKey: e.target.value })}
                                    required
                                    className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                                />
                                <p className="text-xs text-gray-400 mt-1">Required for order verification and digital signature</p>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                                    {isSubmitting ? 'Approving...' : 'Approve Order'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setShowApproveDialog(false)} className="bg-gray-900 text-white border-gray-700 hover:bg-gray-800">
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </Dialog>

                {/* Reject Order Dialog */}
                <Dialog open={showRejectDialog} onClose={() => setShowRejectDialog(false)}>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Reject Order</h2>
                        {selectedOrder && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-2">Order #{selectedOrder.id}</h3>
                                <div className="space-y-1 text-sm">
                                    <p className="text-gray-600">Customer: <span className="font-medium">{selectedOrder.customer?.name}</span></p>
                                    <p className="text-gray-600">Product: <span className="font-medium">{selectedOrder.product?.name}</span></p>
                                    <p className="text-gray-600">Quantity: <span className="font-medium">{selectedOrder.quantity}</span></p>
                                </div>
                            </div>
                        )}
                        <form onSubmit={submitRejection} className="space-y-4">
                            <div>
                                <Label htmlFor="reason">Rejection Reason *</Label>
                                <Textarea
                                    id="reason"
                                    placeholder="Please provide a reason for rejecting this order"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    required
                                    rows={4}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button type="submit" variant="destructive" disabled={isSubmitting}>
                                    {isSubmitting ? 'Rejecting...' : 'Reject Order'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setShowRejectDialog(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </Dialog>

                {/* Order Details Dialog */}
                <Dialog open={showDetailsDialog} onClose={() => setShowDetailsDialog(false)}>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Details</h2>
                        {selectedOrder && (
                            <div className="space-y-6">
                                {/* Order Information */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-3">Order Information</h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-gray-500">Order ID</p>
                                            <p className="font-medium">#{selectedOrder.id}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Status</p>
                                            <Badge variant={getStatusVariant(selectedOrder.status)}>
                                                {selectedOrder.status}
                                            </Badge>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Order Date</p>
                                            <p className="font-medium">{formatDate(selectedOrder.orderDate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Total Amount</p>
                                            <p className="font-medium text-lg">{formatCurrency(selectedOrder.totalAmount)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Information */}
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <p className="text-gray-500">Name</p>
                                            <p className="font-medium">{selectedOrder.customer?.name || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Email</p>
                                            <p className="font-medium">{selectedOrder.customer?.email || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Phone</p>
                                            <p className="font-medium">{selectedOrder.customer?.phone || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Product Information */}
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-3">Product Information</h3>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <p className="text-gray-500">Product Name</p>
                                            <p className="font-medium">{selectedOrder.product?.name || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Description</p>
                                            <p className="font-medium">{selectedOrder.product?.description || "N/A"}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-gray-500">Quantity</p>
                                                <p className="font-medium">{selectedOrder.quantity}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Unit Price</p>
                                                <p className="font-medium">{formatCurrency(selectedOrder.product?.price || 0)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Delivery Information */}
                                <div className="bg-amber-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-3">Delivery Information</h3>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <p className="text-gray-500">Delivery Address</p>
                                            <p className="font-medium">{selectedOrder.deliveryAddress}</p>
                                        </div>
                                        {selectedOrder.specialInstructions && (
                                            <div>
                                                <p className="text-gray-500">Special Instructions</p>
                                                <p className="font-medium">{selectedOrder.specialInstructions}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Order Legs (if any) */}
                                {selectedOrder.legs && selectedOrder.legs.length > 0 && (
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-gray-900 mb-3">Delivery Legs</h3>
                                        <div className="space-y-3">
                                            {selectedOrder.legs.map((leg: any, index: number) => (
                                                <div key={leg.id} className="bg-white p-3 rounded border">
                                                    <p className="font-medium text-sm mb-2">Leg {index + 1}</p>
                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                        <div>
                                                            <p className="text-gray-500">From</p>
                                                            <p className="font-medium">
                                                                {leg.fromType === 'SUPPLIER'
                                                                    ? leg.fromSupplier?.companyName || "Supplier"
                                                                    : leg.fromDistributor?.businessName || "Distributor"}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500">To</p>
                                                            <p className="font-medium">
                                                                {leg.toType === 'CUSTOMER'
                                                                    ? "Customer"
                                                                    : leg.toDistributor?.businessName || "Distributor"}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500">Status</p>
                                                            <Badge variant={
                                                                leg.status === 'PENDING' ? 'warning' :
                                                                    leg.status === 'ACCEPTED' ? 'info' :
                                                                        leg.status === 'IN_TRANSIT' ? 'info' :
                                                                            leg.status === 'DELIVERED' ? 'success' : 'destructive'
                                                            }>
                                                                {leg.status}
                                                            </Badge>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500">Transporter</p>
                                                            <p className="font-medium">{leg.transporter?.name || "N/A"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="flex justify-end mt-6">
                            <Button type="button" variant="outline" onClick={() => setShowDetailsDialog(false)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </Dialog>

                {/* QR Code Dialog */}
                <Dialog open={showQRDialog} onClose={() => setShowQRDialog(false)}>
                    <div className="p-6 bg-black text-white">
                        <h2 className="text-2xl font-bold text-white mb-6">Order QR Code Generated</h2>
                        {qrData && selectedOrder && (
                            <div className="space-y-6">
                                <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                                    <h3 className="font-semibold text-white mb-2">Order #{selectedOrder.id}</h3>
                                    <div className="space-y-1 text-sm">
                                        <p className="text-gray-300">Product: <span className="font-medium text-white">{selectedOrder.product?.name}</span></p>
                                        <p className="text-gray-300">Customer: <span className="font-medium text-white">{selectedOrder.customer?.name}</span></p>
                                        <p className="text-gray-300">Quantity: <span className="font-medium text-white">{selectedOrder.quantity}</span></p>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-lg flex flex-col items-center">
                                    <p className="text-gray-900 font-semibold mb-4">Scan to Verify Order</p>
                                    <div id="qr-display">
                                        {/* QR Code will be displayed here */}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-4 text-center max-w-sm">
                                        Customers can scan this QR code to verify the authenticity and track the order
                                    </p>
                                </div>

                                <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                                    <p className="text-xs text-gray-400 mb-2">Verification URL:</p>
                                    <code className="text-xs text-green-400 break-all">{qrData.verificationUrl}</code>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleDownloadQR}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Download QR
                                    </Button>
                                    <Button
                                        onClick={handlePrintQR}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <Printer className="mr-2 h-4 w-4" />
                                        Print QR
                                    </Button>
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => setShowQRDialog(false)}
                                    className="w-full bg-gray-900 text-white border-gray-700 hover:bg-gray-800"
                                >
                                    Close
                                </Button>
                            </div>
                        )}
                    </div>
                </Dialog>
            </div>
        </Container>
    );
}
