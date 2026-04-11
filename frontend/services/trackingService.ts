import axios from '@/lib/axios';
import { Order, OrderLeg } from '@/types';

export const trackingService = {
    // Track order by ID
    async trackOrder(orderId: number): Promise<Order> {
        const response = await axios.get(`/order/${orderId}`);
        return response.data;
    },

    // Get order tracking events
    async getTrackingEvents(orderId: number): Promise<any[]> {
        const response = await axios.get(`/order/${orderId}/tracking`);
        return response.data;
    },

    // Get order legs/delivery chain
    async getOrderLegs(orderId: number): Promise<OrderLeg[]> {
        const response = await axios.get(`/order/${orderId}/legs`);
        return response.data;
    },

    // Track by QR code
    async trackByQR(token: string): Promise<Order> {
        const response = await axios.get(`/verify?token=${token}`);
        return response.data;
    },

    // Get current order location (if available)
    async getCurrentLocation(orderId: number): Promise<{
        latitude: number;
        longitude: number;
        address: string;
        updatedAt: string;
    }> {
        const response = await axios.get(`/order/${orderId}/location`);
        return response.data;
    },

    // Get estimated delivery time
    async getEstimatedDelivery(orderId: number): Promise<{
        estimatedDate: string;
        confidence: 'high' | 'medium' | 'low';
    }> {
        const response = await axios.get(`/order/${orderId}/estimated-delivery`);
        return response.data;
    }
};
