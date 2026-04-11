'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Package, ArrowLeft, MapPin, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { OrderTracker } from '@/components/shared/OrderTracker';
import { useToast } from '@/context/ToastContext';
import { orderService } from '@/services/orderService';
import { Order } from '@/types';
import { ROUTES } from '@/config/routes';

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { showToast } = useToast();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetails();
    }, [params.id]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const data = await orderService.getOrderById(Number(params.id));
            setOrder(data);
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to fetch order details', 'error');
            router.push(ROUTES.CUSTOMER.ORDERS);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDelivery = async () => {
        if (!order || !confirm('Confirm that you have received this order?')) return;

        try {
            await orderService.confirmDelivery(order.id);
            showToast('Delivery confirmed successfully', 'success');
            fetchOrderDetails();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to confirm delivery', 'error');
        }
    };

    const handleCancelOrder = async () => {
        if (!order || !confirm('Are you sure you want to cancel this order?')) return;

        try {
            await orderService.cancelOrder(order.id);
            showToast('Order cancelled successfully', 'success');
            fetchOrderDetails();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to cancel order', 'error');
        }
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
                <Button onClick={() => router.push(ROUTES.CUSTOMER.ORDERS)}>
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
                        onClick={() => router.push(ROUTES.CUSTOMER.ORDERS)}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Order #{order.id}
                        </h1>
                        <p className="text-gray-600 mt-1">Order details and tracking</p>
                    </div>
                </div>
                <Badge variant={
                    order.status === 'DELIVERED' ? 'success' :
                        order.status === 'CANCELLED' ? 'destructive' :
                            order.status === 'PENDING' ? 'warning' : 'info'
                }>
                    {order.status}
                </Badge>
            </div>

            {/* Order Tracking */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Tracking</h2>
                <OrderTracker orderLegs={order.legs || []} trackingEvents={order.trackingEvents || []} />
            </Card>

            {/* Order Details */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-600">Order Date</p>
                                <p className="font-medium text-gray-900">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-600">Product</p>
                                <p className="font-medium text-gray-900">
                                    {order.product?.name || 'N/A'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-600">Quantity</p>
                                <p className="font-medium text-gray-900">{order.quantity}</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-600">Delivery Address</p>
                                <p className="font-medium text-gray-900">{order.deliveryAddress}</p>
                            </div>
                        </div>
                        {order.supplier && (
                            <div className="flex items-start gap-3">
                                <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600">Supplier</p>
                                    <p className="font-medium text-gray-900">
                                        {order.supplier.businessName}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Actions */}
            {order.status === 'IN_PROGRESS' && (
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Ready to confirm delivery?</h3>
                            <p className="text-gray-600 mt-1">
                                Click confirm once you've received your order
                            </p>
                        </div>
                        <Button onClick={handleConfirmDelivery}>
                            Confirm Delivery
                        </Button>
                    </div>
                </Card>
            )}

            {order.status === 'PENDING' && (
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Need to cancel?</h3>
                            <p className="text-gray-600 mt-1">
                                You can cancel this order while it's pending
                            </p>
                        </div>
                        <Button variant="destructive" onClick={handleCancelOrder}>
                            Cancel Order
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}
