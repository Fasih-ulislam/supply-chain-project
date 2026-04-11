'use client';

import { useState } from 'react';
import { Search, Package, MapPin, User, Building2, Truck, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import Container from '@/components/layout/Container';
import { useToast } from '@/context/ToastContext';
import { trackingService } from '@/services/trackingService';
import { Order, OrderLeg, TrackingEvent, LegStatus } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function TrackOrderPage() {
    const { showToast } = useToast();
    const [orderId, setOrderId] = useState('');
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState<Order | null>(null);
    const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId.trim()) {
            showToast('Please enter an order ID', 'error');
            return;
        }

        try {
            setLoading(true);
            const [orderData, events] = await Promise.all([
                trackingService.trackOrder(parseInt(orderId)),
                trackingService.getTrackingEvents(parseInt(orderId))
            ]);
            setOrder(orderData);
            setTrackingEvents(events);
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to track order', 'error');
            setOrder(null);
            setTrackingEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toUpperCase()) {
            case 'DELIVERED':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'IN_TRANSIT':
                return <Truck className="w-5 h-5 text-blue-600" />;
            case 'ACCEPTED':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'REJECTED':
                return <AlertCircle className="w-5 h-5 text-red-600" />;
            default:
                return <Package className="w-5 h-5 text-gray-600" />;
        }
    };

    const getLegStatusColor = (status: LegStatus) => {
        switch (status) {
            case 'DELIVERED':
                return 'success';
            case 'IN_TRANSIT':
                return 'info';
            case 'ACCEPTED':
                return 'warning';
            case 'REJECTED':
                return 'destructive';
            default:
                return 'default';
        }
    };

    const getCurrentLocation = () => {
        if (!order?.legs || order.legs.length === 0) return 'Preparing for shipment';

        const latestLeg = order.legs.reduce((latest, leg) =>
            leg.legNumber > latest.legNumber ? leg : latest
        );

        if (latestLeg.status === 'DELIVERED') {
            return latestLeg.toType === 'CUSTOMER' ? 'Delivered to Customer' : `At ${latestLeg.toDistributor?.businessName}`;
        } else if (latestLeg.status === 'IN_TRANSIT') {
            return `In Transit to ${latestLeg.toDistributor?.businessName || 'Customer'}`;
        } else if (latestLeg.status === 'ACCEPTED') {
            const from = latestLeg.fromSupplier?.businessName || latestLeg.fromDistributor?.businessName;
            return `Ready to ship from ${from}`;
        } else {
            return `Awaiting acceptance at ${latestLeg.toDistributor?.businessName || 'destination'}`;
        }
    };

    return (
        <Container>
            <div className="space-y-6 max-w-6xl mx-auto">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Track Order</h1>
                    <p className="text-muted-foreground mt-2">
                        Enter your order ID to track its journey through the supply chain
                    </p>
                </div>

                {/* Search Form */}
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleTrack} className="flex gap-3">
                            <Input
                                type="number"
                                placeholder="Enter Order ID (e.g., 123)"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                className="flex-1"
                            />
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <Spinner size="sm" className="mr-2" />
                                ) : (
                                    <Search className="w-4 h-4 mr-2" />
                                )}
                                Track Order
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Order Details */}
                {order && (
                    <>
                        {/* Current Status Card */}
                        <Card className="border-2 border-blue-200 bg-blue-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-blue-600" />
                                    Current Location
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <p className="text-lg font-semibold text-gray-900">
                                        {getCurrentLocation()}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <Package className="w-4 h-4" />
                                            Order #{order.id}
                                        </span>
                                        <Badge variant={order.status === 'DELIVERED' ? 'success' : 'info'}>
                                            {order.status}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-3 gap-6">
                                    {/* Product Info */}
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                            <Package className="w-4 h-4" />
                                            Product
                                        </h4>
                                        <div className="space-y-1">
                                            <p className="font-medium">{order.product?.name}</p>
                                            <p className="text-sm text-gray-600">Quantity: {order.quantity}</p>
                                            <p className="text-sm text-gray-600">Total: {formatCurrency(order.totalAmount)}</p>
                                        </div>
                                    </div>

                                    {/* Customer Info */}
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            Customer
                                        </h4>
                                        <div className="space-y-1">
                                            <p className="font-medium">{order.customer?.name}</p>
                                            <p className="text-sm text-gray-600">{order.customer?.email}</p>
                                            <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                                        </div>
                                    </div>

                                    {/* Supplier Info */}
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                            <Building2 className="w-4 h-4" />
                                            Supplier
                                        </h4>
                                        <div className="space-y-1">
                                            <p className="font-medium">{order.supplier?.businessName}</p>
                                            <p className="text-sm text-gray-600">{order.supplier?.contactNumber}</p>
                                            <p className="text-sm text-gray-600">Order Date: {formatDate(order.orderDate)}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Delivery Route Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Delivery Route</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative">
                                    {order.legs && order.legs.length > 0 ? (
                                        <div className="space-y-6">
                                            {order.legs.map((leg, index) => (
                                                <div key={leg.id} className="relative">
                                                    {/* Connecting Line */}
                                                    {index < order.legs!.length - 1 && (
                                                        <div className={`absolute left-3 top-12 w-0.5 h-full ${leg.status === 'DELIVERED' ? 'bg-green-600' : 'bg-gray-300'
                                                            }`}></div>
                                                    )}

                                                    <div className="flex gap-4">
                                                        {/* Status Icon */}
                                                        <div className="relative z-10 bg-white">
                                                            {getStatusIcon(leg.status)}
                                                        </div>

                                                        {/* Leg Details */}
                                                        <div className="flex-1 pb-2">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <div>
                                                                    <h4 className="font-semibold text-gray-900">
                                                                        Leg {leg.legNumber}
                                                                    </h4>
                                                                    <p className="text-sm text-gray-600 mt-1">
                                                                        From: {leg.fromSupplier?.businessName || leg.fromDistributor?.businessName}
                                                                    </p>
                                                                    <p className="text-sm text-gray-600">
                                                                        To: {leg.toDistributor?.businessName || 'Customer'}
                                                                    </p>
                                                                </div>
                                                                <Badge variant={getLegStatusColor(leg.status as LegStatus)}>
                                                                    {leg.status}
                                                                </Badge>
                                                            </div>

                                                            {/* Transporter Info */}
                                                            {leg.transporter && (
                                                                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                                                    <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                                        <Truck className="w-4 h-4" />
                                                                        Transporter: {leg.transporter.name}
                                                                    </p>
                                                                    <p className="text-sm text-gray-600 mt-1">
                                                                        Contact: {leg.transporter.phone}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {/* Timestamps */}
                                                            <div className="mt-2 space-y-1 text-sm text-gray-500">
                                                                <p className="flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    Created: {formatDate(leg.createdAt)}
                                                                </p>
                                                                {leg.status === 'DELIVERED' && (
                                                                    <p className="flex items-center gap-1 text-green-600">
                                                                        <CheckCircle className="w-3 h-3" />
                                                                        Delivered: {formatDate(leg.updatedAt)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">No delivery route available</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tracking History */}
                        {trackingEvents.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Complete Tracking History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {trackingEvents.map((event) => (
                                            <div
                                                key={event.id}
                                                className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
                                            >
                                                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                                    {getStatusIcon(event.status)}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-gray-900">{event.status}</p>
                                                            <p className="text-sm text-gray-600 mt-1 break-words">
                                                                {event.description || 'No description'}
                                                            </p>
                                                            {(event.fromUser || event.toUser) && (
                                                                <p className="text-xs text-gray-500 mt-2">
                                                                    {event.fromUser?.name && `From: ${event.fromUser.name}`}
                                                                    {event.fromUser && event.toUser && ' → '}
                                                                    {event.toUser?.name && `To: ${event.toUser.name}`}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <span className="text-sm text-gray-500 whitespace-nowrap flex-shrink-0">
                                                            {formatDate(event.timestamp)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* All Stakeholders */}
                        <Card>
                            <CardHeader>
                                <CardTitle>All Stakeholders</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Supplier */}
                                    <div className="p-4 border rounded-lg">
                                        <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                                            <Building2 className="w-4 h-4 text-blue-600" />
                                            Supplier
                                        </h4>
                                        <p className="font-medium">{order.supplier?.businessName}</p>
                                        <p className="text-sm text-gray-600">{order.supplier?.contactNumber}</p>
                                    </div>

                                    {/* Distributors */}
                                    {order.legs?.map((leg, index) => {
                                        if (leg.toDistributor) {
                                            return (
                                                <div key={`dist-${index}`} className="p-4 border rounded-lg">
                                                    <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                                                        <Building2 className="w-4 h-4 text-green-600" />
                                                        Distributor (Leg {leg.legNumber})
                                                    </h4>
                                                    <p className="font-medium">{leg.toDistributor.businessName}</p>
                                                    <Badge variant={getLegStatusColor(leg.status as LegStatus)} className="mt-2">
                                                        {leg.status}
                                                    </Badge>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}

                                    {/* Customer */}
                                    <div className="p-4 border rounded-lg">
                                        <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                                            <User className="w-4 h-4 text-purple-600" />
                                            Customer
                                        </h4>
                                        <p className="font-medium">{order.customer?.name}</p>
                                        <p className="text-sm text-gray-600">{order.customer?.email}</p>
                                        <p className="text-sm text-gray-600 mt-1">{order.deliveryAddress}</p>
                                    </div>

                                    {/* Transporters */}
                                    {order.legs?.map((leg, index) => {
                                        if (leg.transporter) {
                                            return (
                                                <div key={`trans-${index}`} className="p-4 border rounded-lg">
                                                    <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                                                        <Truck className="w-4 h-4 text-orange-600" />
                                                        Transporter (Leg {leg.legNumber})
                                                    </h4>
                                                    <p className="font-medium">{leg.transporter.name}</p>
                                                    <p className="text-sm text-gray-600">{leg.transporter.phone}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}

                {/* No Results */}
                {!loading && orderId && !order && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No order found with this ID</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </Container>
    );
}
