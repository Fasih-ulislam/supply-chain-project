"use client";

import { Eye, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Container from "@/components/layout/Container";
import { useFetch } from "@/hooks/useFetch";
import { distributorService } from "@/services/distributorService";
import { Spinner } from "@/components/ui/Spinner";
import { formatDate, formatCurrency } from "@/lib/utils";
import { OrderStatus } from "@/types/enums";
import { useToast } from "@/context/ToastContext";

export default function DistributorOrdersPage() {
    const { showToast } = useToast();
    const { data: orders, isLoading, error, refetch } = useFetch(
        () => distributorService.getAssignedOrders()
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
                return "destructive";
            default:
                return "default";
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

    return (
        <Container>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Received Orders</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage orders received at your distribution center
                    </p>
                </div>

                {/* Orders Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Order List</CardTitle>
                        <CardDescription>
                            All orders received for distribution
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
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="sm">
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
            </div>
        </Container>
    );
}
