'use client';

import { Package, Calendar, MapPin, Truck, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Order, OrderStatus } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';

interface OrderCardProps {
  order: Order;
  onViewDetails?: () => void;
  onTrack?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  showActions?: boolean;
}

export function OrderCard({
  order,
  onViewDetails,
  onTrack,
  onApprove,
  onReject,
  showActions = true,
}: OrderCardProps) {
  const getStatusBadge = (status: OrderStatus) => {
    const variants: Record<OrderStatus, 'warning' | 'info' | 'success' | 'destructive' | 'default'> = {
      [OrderStatus.PENDING]: 'warning',
      [OrderStatus.APPROVED]: 'info',
      [OrderStatus.PENDING_REASSIGN]: 'warning',
      [OrderStatus.IN_PROGRESS]: 'info',
      [OrderStatus.DELIVERED]: 'success',
      [OrderStatus.CANCELLED]: 'destructive',
      [OrderStatus.REJECTED]: 'destructive',
    };

    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return <Package className="w-5 h-5 text-yellow-600" />;
      case OrderStatus.APPROVED:
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case OrderStatus.IN_PROGRESS:
        return <Truck className="w-5 h-5 text-blue-600" />;
      case OrderStatus.DELIVERED:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {getStatusIcon(order.status)}
          <div>
            <h3 className="font-semibold text-gray-900">Order #{order.id}</h3>
            <p className="text-sm text-gray-500">{order.product?.name || 'Product'}</p>
          </div>
        </div>
        {getStatusBadge(order.status)}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Quantity</span>
          <span className="font-medium text-gray-900">{order.quantity} units</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Amount</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(order.totalAmount || 0)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Ordered {formatDate(order.createdAt)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{order.deliveryAddress}</span>
        </div>
      </div>

      {showActions && (
        <div className="flex gap-2 mt-6 pt-4 border-t">
          {onViewDetails && (
            <Button variant="outline" size="sm" onClick={onViewDetails} className="flex-1">
              View Details
            </Button>
          )}

          {onTrack && order.status !== OrderStatus.PENDING && (
            <Button variant="outline" size="sm" onClick={onTrack} className="flex-1">
              <Truck className="w-4 h-4 mr-1" />
              Track
            </Button>
          )}

          {onApprove && order.status === OrderStatus.PENDING && (
            <Button size="sm" onClick={onApprove} className="flex-1">
              Approve
            </Button>
          )}

          {onReject && order.status === OrderStatus.PENDING && (
            <Button variant="outline" size="sm" onClick={onReject} className="text-red-600">
              Reject
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
