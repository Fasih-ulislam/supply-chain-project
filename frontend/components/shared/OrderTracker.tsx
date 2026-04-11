'use client';

import { CheckCircle, Circle, Truck, Package, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { OrderLeg, LegStatus, TrackingEvent } from '@/types';
import { formatDate } from '@/lib/utils';

interface OrderTrackerProps {
  orderLegs: OrderLeg[];
  trackingEvents?: TrackingEvent[];
}

export function OrderTracker({ orderLegs, trackingEvents = [] }: OrderTrackerProps) {
  const getStatusIcon = (status: LegStatus) => {
    switch (status) {
      case LegStatus.DELIVERED:
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case LegStatus.IN_TRANSIT:
        return <Truck className="w-6 h-6 text-blue-600" />;
      case LegStatus.PENDING:
        return <Circle className="w-6 h-6 text-gray-400" />;
      default:
        return <Package className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: LegStatus) => {
    switch (status) {
      case LegStatus.DELIVERED:
        return 'bg-green-600';
      case LegStatus.IN_TRANSIT:
        return 'bg-blue-600';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Legs Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Delivery Route</h3>

        <div className="relative">
          {orderLegs.map((leg, index) => (
            <div key={leg.id} className="relative pb-8 last:pb-0">
              {/* Connecting Line */}
              {index < orderLegs.length - 1 && (
                <div
                  className={`absolute left-3 top-8 w-0.5 h-full ${leg.status === LegStatus.DELIVERED ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                ></div>
              )}

              {/* Timeline Node */}
              <div className="flex items-start gap-4">
                <div className="relative z-10 bg-white">
                  {getStatusIcon(leg.status)}
                </div>

                <div className="flex-1 pt-0.5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Leg {leg.legNumber}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {leg.fromSupplier?.businessName || leg.fromDistributor?.businessName || 'From'} → {leg.toDistributor?.businessName || 'To'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Transporter: {leg.transporter?.name || 'Assigned'}
                      </p>
                    </div>
                    <Badge
                      variant={
                        leg.status === LegStatus.DELIVERED ? 'success' :
                          leg.status === LegStatus.IN_TRANSIT ? 'info' :
                            'default'
                      }
                    >
                      {leg.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span>From: {leg.fromSupplier?.businessName || leg.fromDistributor?.businessName || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>To: {leg.toDistributor?.businessName || 'Unknown'}</span>
                    </div>
                  </div>

                  {/* Leg created at */}
                  <p className="text-sm text-gray-500 mt-2">
                    Created: {formatDate(leg.createdAt)}
                  </p>

                  {leg.status === LegStatus.DELIVERED && (
                    <p className="text-sm text-green-600 mt-2">
                      Delivered: {formatDate(leg.updatedAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Tracking Events */}
      {trackingEvents.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Tracking History</h3>

          <div className="space-y-4">
            {trackingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
              >
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{event.status}</p>
                      <p className="text-sm text-gray-600 mt-1">{event.description || 'No description'}</p>
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(event.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
