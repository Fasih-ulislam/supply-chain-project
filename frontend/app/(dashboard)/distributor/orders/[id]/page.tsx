'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Package, ArrowLeft, CheckCircle, Send, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { Spinner } from '@/components/ui/Spinner';
import { Dialog } from '@/components/ui/Dialog';
import { useToast } from '@/context/ToastContext';
import { distributorService } from '@/services/distributorService';
import { OrderLeg, DistributorProfile, Transporter } from '@/types';
import { ROUTES } from '@/config/routes';

export default function DistributorOrderLegDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { showToast } = useToast();
    const [leg, setLeg] = useState<OrderLeg | null>(null);
    const [distributors, setDistributors] = useState<DistributorProfile[]>([]);
    const [transporters, setTransporters] = useState<Transporter[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForwardDialog, setShowForwardDialog] = useState(false);
    const [showShipDialog, setShowShipDialog] = useState(false);
    const [selectedDistributor, setSelectedDistributor] = useState('');
    const [selectedTransporter, setSelectedTransporter] = useState('');

    useEffect(() => {
        fetchData();
    }, [params.id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [legData, distributorsData, transportersData] = await Promise.all([
                distributorService.getLegById(Number(params.id)),
                distributorService.getAllDistributors(),
                distributorService.getTransporters()
            ]);
            setLeg(legData);
            setDistributors(distributorsData);
            setTransporters(transportersData);
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to fetch data', 'error');
            router.push(ROUTES.DISTRIBUTOR.ASSIGNED_ORDERS);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmReceipt = async () => {
        if (!leg || !confirm('Confirm that you have received this order?')) return;

        try {
            await distributorService.confirmReceipt(leg.id);
            showToast('Receipt confirmed successfully', 'success');
            fetchData();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to confirm receipt', 'error');
        }
    };

    const handleShip = async () => {
        if (!leg || !selectedTransporter) {
            showToast('Please select a transporter', 'error');
            return;
        }

        try {
            await distributorService.shipForward(leg.id);
            showToast('Order shipped successfully', 'success');
            setShowShipDialog(false);
            fetchData();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to ship order', 'error');
        }
    };

    const handleForward = async () => {
        if (!leg || !selectedDistributor || !selectedTransporter) {
            showToast('Please select distributor and transporter', 'error');
            return;
        }

        try {
            await distributorService.forwardOrder(leg.orderId, {
                distributorId: Number(selectedDistributor),
                transporterId: Number(selectedTransporter)
            });
            showToast('Order forwarded successfully', 'success');
            setShowForwardDialog(false);
            fetchData();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to forward order', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!leg) {
        return (
            <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Order leg not found</h3>
                <Button onClick={() => router.push(ROUTES.DISTRIBUTOR.ASSIGNED_ORDERS)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Orders
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(ROUTES.DISTRIBUTOR.ASSIGNED_ORDERS)}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Order Leg #{leg.id}
                        </h1>
                        <p className="text-gray-600 mt-1">Order #{leg.orderId} delivery details</p>
                    </div>
                </div>
                <Badge variant={
                    leg.status === 'DELIVERED' ? 'success' :
                        leg.status === 'IN_TRANSIT' ? 'info' :
                            leg.status === 'ACCEPTED' ? 'warning' : 'default'
                }>
                    {leg.status}
                </Badge>
            </div>

            {/* Order Leg Details */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Leg Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-600">Product</p>
                            <p className="font-medium text-gray-900">
                                {leg.order?.product?.name || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Quantity</p>
                            <p className="font-medium text-gray-900">{leg.order?.quantity}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">From</p>
                            <p className="font-medium text-gray-900">
                                {leg.fromDistributor?.businessName || leg.order?.supplier?.businessName || 'Supplier'}
                            </p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-600">To</p>
                            <p className="font-medium text-gray-900">
                                {leg.toDistributor?.businessName || 'Customer'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Transporter</p>
                            <p className="font-medium text-gray-900">
                                {leg.transporter?.name || 'Not assigned'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Created</p>
                            <p className="font-medium text-gray-900">
                                {new Date(leg.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Actions based on status */}
            {leg.status === 'ACCEPTED' && (
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Confirm Receipt</h2>
                    <p className="text-gray-600 mb-4">
                        Confirm that you have physically received this order before shipping it forward.
                    </p>
                    <div className="flex gap-3">
                        <Button onClick={handleConfirmReceipt}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirm Receipt
                        </Button>
                    </div>
                </Card>
            )}

            {leg.status === 'IN_TRANSIT' && leg.toDistributor && (
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Order In Transit</h2>
                    <p className="text-gray-600">This order is currently being transported to you.</p>
                </Card>
            )}

            {leg.status === 'DELIVERED' && (
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Process Order</h2>
                    <p className="text-gray-600 mb-4">
                        Choose whether to deliver to the final customer or forward to another distributor.
                    </p>
                    <div className="flex gap-3">
                        <Button onClick={() => setShowShipDialog(true)}>
                            <Send className="w-4 h-4 mr-2" />
                            Ship to Customer
                        </Button>
                        <Button variant="outline" onClick={() => setShowForwardDialog(true)}>
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Forward to Distributor
                        </Button>
                    </div>
                </Card>
            )}

            {/* Ship Dialog */}
            <Dialog open={showShipDialog} onClose={() => setShowShipDialog(false)}>
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Ship to Customer</h2>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="shipTransporter">Select Transporter *</Label>
                            <Select
                                id="shipTransporter"
                                value={selectedTransporter}
                                onChange={(e) => setSelectedTransporter(e.target.value)}
                            >
                                <option value="">Select a transporter</option>
                                {transporters.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name} - {t.phone}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={() => setShowShipDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleShip} disabled={!selectedTransporter}>
                                Ship Order
                            </Button>
                        </div>
                    </div>
                </div>
            </Dialog>

            {/* Forward Dialog */}
            <Dialog open={showForwardDialog} onClose={() => setShowForwardDialog(false)}>
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Forward to Distributor</h2>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="forwardDistributor">Select Distributor *</Label>
                            <Select
                                id="forwardDistributor"
                                value={selectedDistributor}
                                onChange={(e) => setSelectedDistributor(e.target.value)}
                            >
                                <option value="">Select a distributor</option>
                                {distributors.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.businessName} - {d.businessAddress}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="forwardTransporter">Select Transporter *</Label>
                            <Select
                                id="forwardTransporter"
                                value={selectedTransporter}
                                onChange={(e) => setSelectedTransporter(e.target.value)}
                            >
                                <option value="">Select a transporter</option>
                                {transporters.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name} - {t.phone || 'N/A'}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={() => setShowForwardDialog(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleForward}
                                disabled={!selectedDistributor || !selectedTransporter}
                            >
                                Forward Order
                            </Button>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
