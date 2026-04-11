"use client";

import { Package, Eye, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Container from "@/components/layout/Container";
import { useFetch } from "@/hooks/useFetch";
import { orderService } from "@/services/orderService";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/context/ToastContext";
import { formatDate, formatCurrency } from "@/lib/utils";
import { OrderStatus } from "@/types/enums";
import Link from "next/link";
import { ROUTES } from "@/config/routes";

export default function MyOrdersPage() {
    const { showToast } = useToast();
    const { data: orders, isLoading, error, refetch } = useFetch(
        () => orderService.getMyOrders()
    );

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
            case OrderStatus.REJECTED:
                return "destructive";
            default:
                return "default";
        }
    };

    const handleCancelOrder = async (orderId: number) => {
        if (!confirm('Are you sure you want to cancel this order?')) return;

        try {
            await orderService.cancelOrder(orderId);
            showToast('Order cancelled successfully', 'success');
            refetch();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to cancel order', 'error');
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

    if (error) {
        return (
            <Container>
                <div className="text-center py-12">
                    <p className="text-destructive">Failed to load orders</p>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
                    <p className="text-muted-foreground mt-2">
                        Track and manage your order history
                    </p>
                </div>

                {/* Orders Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Order History</CardTitle>
                        <CardDescription>
                            View all your past and current orders
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!orders || orders.length === 0 ? (
                            <div className="text-center py-12">
                                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">No orders yet</p>
                                <Link href={ROUTES.CUSTOMER.PRODUCTS}>
                                    <Button className="mt-4">Browse Products</Button>
                                </Link>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
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
                                                <div className="flex items-center gap-2">
                                                    <Link href={ROUTES.CUSTOMER.ORDER_DETAILS(order.id)}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Track
                                                        </Button>
                                                    </Link>
                                                    {order.status === OrderStatus.PENDING && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleCancelOrder(order.id)}
                                                        >
                                                            <XCircle className="mr-2 h-4 w-4" />
                                                            Cancel
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Container>
    );
}
