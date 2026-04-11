"use client";

import { useState } from "react";
import { Package, Check, X, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import Container from "@/components/layout/Container";
import { useFetch } from "@/hooks/useFetch";
import { distributorService } from "@/services/distributorService";
import { Spinner } from "@/components/ui/Spinner";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

export default function AssignedOrdersPage() {
    const { showToast } = useToast();
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [showAcceptDialog, setShowAcceptDialog] = useState(false);
    const [selectedLeg, setSelectedLeg] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const { data: assignedOrders, isLoading, refetch } = useFetch(
        () => distributorService.getAssignedOrders()
    );

    const getLegStatusVariant = (status: string) => {
        switch (status) {
            case 'PENDING':
                return "warning";
            case 'ACCEPTED':
                return "info";
            case 'IN_TRANSIT':
                return "info";
            case 'DELIVERED':
                return "success";
            case 'REJECTED':
                return "destructive";
            default:
                return "default";
        }
    };

    const handleAccept = (leg: any) => {
        setSelectedLeg(leg);
        setShowAcceptDialog(true);
    };

    const submitAcceptance = async () => {
        if (!selectedLeg) return;

        try {
            setIsSubmitting(true);
            await distributorService.acceptLeg(selectedLeg.id);
            showToast("Order accepted successfully!", "success");
            setShowAcceptDialog(false);
            refetch();
        } catch (error: any) {
            showToast(error.response?.data?.message || "Failed to accept order", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = (leg: any) => {
        setSelectedLeg(leg);
        setRejectReason('');
        setShowRejectDialog(true);
    };

    const submitRejection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLeg) return;

        try {
            setIsSubmitting(true);
            await distributorService.rejectLeg(selectedLeg.id, { reason: rejectReason });
            showToast("Order rejected", "success");
            setShowRejectDialog(false);
            refetch();
        } catch (error: any) {
            showToast(error.response?.data?.message || "Failed to reject order", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmReceipt = async (leg: any) => {
        try {
            setIsSubmitting(true);
            await distributorService.confirmReceipt(leg.id);
            showToast("Receipt confirmed! Order moved to held inventory.", "success");
            refetch();
        } catch (error: any) {
            showToast(error.response?.data?.message || "Failed to confirm receipt", "error");
        } finally {
            setIsSubmitting(false);
        }
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

    // Group legs by status
    const pendingLegs = assignedOrders?.filter((leg: any) => leg.status === 'PENDING') || [];
    const acceptedLegs = assignedOrders?.filter((leg: any) => leg.status === 'ACCEPTED') || [];
    const inTransitLegs = assignedOrders?.filter((leg: any) => leg.status === 'IN_TRANSIT') || [];

    return (
        <Container>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Assigned Orders</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage incoming orders assigned to your distribution center
                    </p>
                </div>

                {/* Statistics */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Acceptance</CardTitle>
                            <Package className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{pendingLegs.length}</div>
                            <p className="text-xs text-muted-foreground">Awaiting your response</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
                            <Package className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{inTransitLegs.length}</div>
                            <p className="text-xs text-muted-foreground">On the way to you</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Assigned</CardTitle>
                            <Package className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{assignedOrders?.length || 0}</div>
                            <p className="text-xs text-muted-foreground">All incoming orders</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Pending Orders Table */}
                {pendingLegs.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Acceptance</CardTitle>
                            <CardDescription>
                                Orders awaiting your acceptance or rejection
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>From</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingLegs.map((leg: any) => (
                                        <TableRow key={leg.id}>
                                            <TableCell className="font-medium">#{leg.order?.id}</TableCell>
                                            <TableCell>{leg.order?.product?.name || "N/A"}</TableCell>
                                            <TableCell>{leg.order?.quantity}</TableCell>
                                            <TableCell>
                                                {leg.fromType === 'SUPPLIER'
                                                    ? leg.fromSupplier?.businessName || "Supplier"
                                                    : leg.fromDistributor?.businessName || "Distributor"}
                                            </TableCell>
                                            <TableCell>{leg.order?.customer?.name || "N/A"}</TableCell>
                                            <TableCell>
                                                <Badge variant={getLegStatusVariant(leg.status)}>
                                                    {leg.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onClick={() => handleAccept(leg)}
                                                        disabled={isSubmitting}
                                                    >
                                                        <Check className="mr-1 h-4 w-4" />
                                                        Accept
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleReject(leg)}
                                                        disabled={isSubmitting}
                                                    >
                                                        <X className="mr-1 h-4 w-4" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* In Transit Orders Table */}
                {inTransitLegs.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>In Transit</CardTitle>
                            <CardDescription>
                                Orders being shipped to your distribution center
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>From</TableHead>
                                        <TableHead>Transporter</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {inTransitLegs.map((leg: any) => (
                                        <TableRow key={leg.id}>
                                            <TableCell className="font-medium">#{leg.order?.id}</TableCell>
                                            <TableCell>{leg.order?.product?.name || "N/A"}</TableCell>
                                            <TableCell>{leg.order?.quantity}</TableCell>
                                            <TableCell>
                                                {leg.fromType === 'SUPPLIER'
                                                    ? leg.fromSupplier?.businessName || "Supplier"
                                                    : leg.fromDistributor?.businessName || "Distributor"}
                                            </TableCell>
                                            <TableCell>{leg.transporter?.name || "N/A"}</TableCell>
                                            <TableCell>
                                                <Badge variant={getLegStatusVariant(leg.status)}>
                                                    {leg.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => handleConfirmReceipt(leg)}
                                                    disabled={isSubmitting}
                                                >
                                                    <CheckCircle className="mr-1 h-4 w-4" />
                                                    Confirm Receipt
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Accepted Orders Table */}
                {acceptedLegs.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Accepted Orders</CardTitle>
                            <CardDescription>
                                Orders you've accepted, waiting for shipment
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>From</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Accepted Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {acceptedLegs.map((leg: any) => (
                                        <TableRow key={leg.id}>
                                            <TableCell className="font-medium">#{leg.order?.id}</TableCell>
                                            <TableCell>{leg.order?.product?.name || "N/A"}</TableCell>
                                            <TableCell>{leg.order?.quantity}</TableCell>
                                            <TableCell>
                                                {leg.fromType === 'SUPPLIER'
                                                    ? leg.fromSupplier?.businessName || "Supplier"
                                                    : leg.fromDistributor?.businessName || "Distributor"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getLegStatusVariant(leg.status)}>
                                                    {leg.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{formatDate(leg.updatedAt)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Empty State */}
                {assignedOrders?.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-muted-foreground">No assigned orders</p>
                            <p className="text-sm text-gray-500 mt-1">Orders assigned to you will appear here</p>
                        </CardContent>
                    </Card>
                )}

                {/* Accept Order Dialog */}
                <Dialog open={showAcceptDialog} onClose={() => setShowAcceptDialog(false)}>
                    <div className="p-6 bg-black text-white">
                        <h2 className="text-2xl font-bold text-white mb-6">Accept Order</h2>
                        {selectedLeg && (
                            <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
                                <h3 className="font-semibold text-white mb-2">Order #{selectedLeg.order?.id}</h3>
                                <div className="space-y-1 text-sm">
                                    <p className="text-gray-300">Product: <span className="font-medium text-white">{selectedLeg.order?.product?.name}</span></p>
                                    <p className="text-gray-300">Quantity: <span className="font-medium text-white">{selectedLeg.order?.quantity}</span></p>
                                    <p className="text-gray-300">From: <span className="font-medium text-white">
                                        {selectedLeg.fromType === 'SUPPLIER'
                                            ? selectedLeg.fromSupplier?.businessName || "Supplier"
                                            : selectedLeg.fromDistributor?.businessName || "Distributor"}
                                    </span></p>
                                </div>
                            </div>
                        )}
                        <p className="text-gray-300 mb-6">
                            By accepting this order, you confirm that you will receive and handle this delivery assignment.
                        </p>
                        <div className="flex gap-3">
                            <Button onClick={submitAcceptance} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white">
                                {isSubmitting ? 'Accepting...' : 'Confirm Accept'}
                            </Button>
                            <Button variant="outline" onClick={() => setShowAcceptDialog(false)} className="bg-gray-900 text-white border-gray-700 hover:bg-gray-800">
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Dialog>

                {/* Reject Order Dialog */}
                <Dialog open={showRejectDialog} onClose={() => setShowRejectDialog(false)}>
                    <div className="p-6 bg-black text-white">
                        <h2 className="text-2xl font-bold text-white mb-6">Reject Order</h2>
                        {selectedLeg && (
                            <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
                                <h3 className="font-semibold text-white mb-2">Order #{selectedLeg.order?.id}</h3>
                                <div className="space-y-1 text-sm">
                                    <p className="text-gray-300">Product: <span className="font-medium text-white">{selectedLeg.order?.product?.name}</span></p>
                                    <p className="text-gray-300">Quantity: <span className="font-medium text-white">{selectedLeg.order?.quantity}</span></p>
                                    <p className="text-gray-300">From: <span className="font-medium text-white">
                                        {selectedLeg.fromType === 'SUPPLIER'
                                            ? selectedLeg.fromSupplier?.businessName || "Supplier"
                                            : selectedLeg.fromDistributor?.businessName || "Distributor"}
                                    </span></p>
                                </div>
                            </div>
                        )}
                        <form onSubmit={submitRejection} className="space-y-4">
                            <div>
                                <Label htmlFor="reason" className="text-white">Rejection Reason *</Label>
                                <Textarea
                                    id="reason"
                                    placeholder="Please provide a reason for rejecting this order"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    required
                                    rows={4}
                                    className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500"
                                />
                                <p className="text-xs text-gray-400 mt-1">The supplier will be notified and can reassign to another distributor</p>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button type="submit" variant="destructive" disabled={isSubmitting}>
                                    {isSubmitting ? 'Rejecting...' : 'Reject Order'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setShowRejectDialog(false)} className="bg-gray-900 text-white border-gray-700 hover:bg-gray-800">
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </Dialog>
            </div>
        </Container>
    );
}
