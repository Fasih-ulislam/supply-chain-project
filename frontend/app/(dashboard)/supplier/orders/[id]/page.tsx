'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Package, ArrowLeft, CheckCircle, XCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/context/ToastContext';
import { orderService } from '@/services/orderService';
import { supplierService } from '@/services/supplierService';
import { Order, DistributorProfile } from '@/types';
import { ROUTES } from '@/config/routes';

export default function SupplierOrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { showToast } = useToast();
    const [order, setOrder] = useState<Order | null>(null);
    const [distributors, setDistributors] = useState<DistributorProfile[]>([]);
    const [selectedDistributor, setSelectedDistributor] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [params.id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [orderData, distributorsData] = await Promise.all([
                orderService.getOrderById(Number(params.id)),
                supplierService.getDistributors()
            ]);
            setOrder(orderData);
            setDistributors(distributorsData);
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to fetch data', 'error');
            router.push(ROUTES.SUPPLIER.ORDERS);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        // TODO: Implement full approve functionality with distributorId, transporterId, and privateKey
        // Use supplier/orders/manage page as reference
        showToast('Please use the Manage Orders page to approve orders', 'info');
    };

    const handleReject = async () => {
        // TODO: Implement full reject functionality with rejection reason
        // Use supplier/orders/manage page as reference
        showToast('Please use the Manage Orders page to reject orders', 'info');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Order not found</h3>
                <Button onClick={() => router.push(ROUTES.SUPPLIER.ORDERS)}>
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
                        onClick={() => router.push(ROUTES.SUPPLIER.ORDERS)}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Order #{order.id}</h1>
                        <p className="text-gray-600 mt-1">Review and process order</p>
                    </div>
                </div>
                <Badge variant={
                    order.status === 'APPROVED' ? 'success' :
                        order.status === 'REJECTED' ? 'destructive' :
                            order.status === 'PENDING' ? 'warning' : 'info'
                }>
                    {order.status}
                </Badge>
            </div>

            {/* Order Details */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Information</h2>
                <div className="space-y-6">
                    {/* Product Information */}
                    <div className="border-b pb-4">
                        <h3 className="text-sm font-medium text-gray-600 mb-3">Product Details</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Name</p>
                                <p className="font-medium text-gray-900">{order.product?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Category</p>
                                <p className="font-medium text-gray-900">{order.product?.category || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Unit Price</p>
                                <p className="font-medium text-gray-900">Rs. {order.product?.price?.toFixed(2) || '0.00'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Quantity Ordered</p>
                                <p className="font-medium text-gray-900">{order.quantity}</p>
                            </div>
                        </div>
                        {order.product?.description && (
                            <div className="mt-3">
                                <p className="text-sm text-gray-600">Description</p>
                                <p className="text-sm text-gray-700 mt-1">{order.product.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Customer & Order Information */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">Customer Name</p>
                                <p className="font-medium text-gray-900">{order.customer?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Customer Email</p>
                                <p className="font-medium text-gray-900">{order.customer?.email || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Amount</p>
                                <p className="font-medium text-gray-900 text-lg">Rs. {order.totalAmount?.toFixed(2) || '0.00'}</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">Delivery Address</p>
                                <p className="font-medium text-gray-900">{order.deliveryAddress}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Order Date</p>
                                <p className="font-medium text-gray-900">
                                    {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Approve/Reject Actions */}
            {order.status === 'PENDING' && (
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Process Order</h2>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="distributor">Assign Distributor *</Label>
                            <Select
                                id="distributor"
                                value={selectedDistributor}
                                onChange={(e) => setSelectedDistributor(e.target.value)}
                            >
                                <option value="">Select a distributor</option>
                                {distributors.map((dist) => (
                                    <option key={dist.id} value={dist.id}>
                                        {dist.businessName} - {dist.businessAddress}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <Button variant="destructive" onClick={handleReject}>
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject Order
                            </Button>
                            <Button onClick={handleApprove} disabled={!selectedDistributor}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve & Assign
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {order.status === 'APPROVED' && (
                <Card className="p-6">
                    <div className="text-center py-8">
                        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Order Approved
                        </h3>
                        <p className="text-gray-600">
                            This order has been approved and assigned to a distributor
                        </p>
                    </div>
                </Card>
            )}
        </div>
    );
}
