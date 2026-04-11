'use client';

import { useState, useEffect } from 'react';
import { Package, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import { orderService } from '@/services/orderService';
import { Order } from '@/types';

export default function AdminOrdersPage() {
    const { showToast } = useToast();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            // TODO: Implement getAllOrders endpoint in backend
            // const data = await orderService.getAllOrders();
            setOrders([]);
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to fetch orders', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order =>
        statusFilter === 'ALL' || order.status === statusFilter
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">All Orders</h1>
                <p className="text-gray-600 mt-2">Monitor all orders in the system</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-6">
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{orders.length}</p>
                </Card>
                <Card className="p-6">
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600 mt-2">
                        {orders.filter(o => o.status === 'PENDING').length}
                    </p>
                </Card>
                <Card className="p-6">
                    <p className="text-sm text-gray-600">In Progress</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                        {orders.filter(o => o.status === 'IN_PROGRESS').length}
                    </p>
                </Card>
                <Card className="p-6">
                    <p className="text-sm text-gray-600">Delivered</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                        {orders.filter(o => o.status === 'DELIVERED').length}
                    </p>
                </Card>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex items-center gap-4">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="max-w-xs"
                    >
                        <option value="ALL">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="REJECTED">Rejected</option>
                    </Select>
                </div>
            </Card>

            {/* Orders Table */}
            <Card className="p-6">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                        <p className="text-gray-600">No orders match your current filter</p>
                    </div>
                ) : (
                    <Table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Supplier</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <tr key={order.id}>
                                    <td className="font-medium">#{order.id}</td>
                                    <td>{order.customer?.name || 'N/A'}</td>
                                    <td>{order.product?.name || 'N/A'}</td>
                                    <td>{order.quantity}</td>
                                    <td>{order.supplier?.businessName || 'N/A'}</td>
                                    <td>
                                        <Badge variant={
                                            order.status === 'DELIVERED' ? 'success' :
                                                order.status === 'CANCELLED' || order.status === 'REJECTED' ? 'destructive' :
                                                    order.status === 'PENDING' ? 'warning' : 'info'
                                        }>
                                            {order.status}
                                        </Badge>
                                    </td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Card>
        </div>
    );
}
