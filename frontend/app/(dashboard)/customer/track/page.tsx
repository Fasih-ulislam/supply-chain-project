"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Package, MapPin, CheckCircle, Clock, Truck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Container from "@/components/layout/Container";
import { orderService } from "@/services/orderService";
import { Spinner } from "@/components/ui/Spinner";
import { formatDate } from "@/lib/utils";
import { OrderStatus, LegStatus } from "@/types/enums";

export default function TrackOrderPage() {
    const searchParams = useSearchParams();
    const orderIdParam = searchParams.get("orderId");

    const [orderId, setOrderId] = useState(orderIdParam || "");
    const [loading, setLoading] = useState(false);
    const [orderData, setOrderData] = useState<any>(null);
    const [error, setError] = useState("");

    const handleTrack = async () => {
        if (!orderId) {
            setError("Please enter an order ID");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const data = await orderService.getOrderById(parseInt(orderId));
            setOrderData(data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Order not found");
            setOrderData(null);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: OrderStatus | LegStatus) => {
        switch (status) {
            case OrderStatus.PENDING:
            case LegStatus.PENDING:
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case OrderStatus.IN_PROGRESS:
            case LegStatus.IN_TRANSIT:
                return <Truck className="h-5 w-5 text-blue-500" />;
            case OrderStatus.DELIVERED:
            case LegStatus.DELIVERED:
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            default:
                return <Package className="h-5 w-5 text-gray-500" />;
        }
    };

    return (
        <Container>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Track Order</h1>
                    <p className="text-muted-foreground mt-2">
                        Enter your order ID to track its current status
                    </p>
                </div>

                {/* Search */}
                <Card>
                    <CardHeader>
                        <CardTitle>Order Tracking</CardTitle>
                        <CardDescription>
                            Track your order in real-time
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <Input
                                placeholder="Enter order ID (e.g., 123)"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleTrack()}
                            />
                            <Button onClick={handleTrack} isLoading={loading}>
                                Track Order
                            </Button>
                        </div>
                        {error && <p className="text-destructive text-sm mt-2">{error}</p>}
                    </CardContent>
                </Card>

                {/* Order Details */}
                {orderData && (
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order #{orderData.id}</CardTitle>
                                <CardDescription>
                                    Placed on {formatDate(orderData.createdAt)}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Product</p>
                                        <p className="font-medium">{orderData.product?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Quantity</p>
                                        <p className="font-medium">{orderData.quantity} units</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Status</p>
                                        <Badge variant={orderData.status === OrderStatus.DELIVERED ? "success" : "info"}>
                                            {orderData.status}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Destination</p>
                                        <p className="font-medium">{orderData.deliveryAddress}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tracking Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Tracking Timeline</CardTitle>
                                <CardDescription>
                                    Follow your order&apos;s journey
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {orderData.orderLegs?.map((leg: any, index: number) => (
                                        <div key={leg.id} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background">
                                                    {getStatusIcon(leg.status)}
                                                </div>
                                                {index < orderData.orderLegs.length - 1 && (
                                                    <div className="h-full w-0.5 bg-border my-2" />
                                                )}
                                            </div>
                                            <div className="flex-1 pb-8">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-semibold">Leg {index + 1}</h4>
                                                    <Badge variant={leg.status === LegStatus.DELIVERED ? "success" : "info"}>
                                                        {leg.status}
                                                    </Badge>
                                                </div>
                                                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                                    <p className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4" />
                                                        From: {leg.fromLocation || "Warehouse"}
                                                    </p>
                                                    <p className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4" />
                                                        To: {leg.toLocation || "Destination"}
                                                    </p>
                                                    {leg.transporter && (
                                                        <p className="flex items-center gap-2">
                                                            <Truck className="h-4 w-4" />
                                                            Transporter: {leg.transporter.name}
                                                        </p>
                                                    )}
                                                </div>
                                                {leg.trackingEvents && leg.trackingEvents.length > 0 && (
                                                    <div className="mt-3 space-y-2">
                                                        {leg.trackingEvents.map((event: any) => (
                                                            <div key={event.id} className="text-sm">
                                                                <p className="font-medium">{event.status?.replace(/_/g, ' ') || 'Unknown Event'}</p>
                                                                <p className="text-muted-foreground">
                                                                    {event.location} - {formatDate(event.timestamp)}
                                                                </p>
                                                                {event.description && (
                                                                    <p className="text-muted-foreground">{event.description}</p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </Container>
    );
}
