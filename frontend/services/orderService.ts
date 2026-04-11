import axios from '@/lib/axios';
import {
    Product,
    Order,
    CreateOrderData,
    ApproveOrderData,
    ReassignOrderData,
    RejectOrderData
} from '@/types';

export const orderService = {
    // Public/Browse
    async getAvailableProducts(): Promise<Product[]> {
        const response = await axios.get('/order/products');
        return response.data;
    },

    // Customer Actions
    async createOrder(data: CreateOrderData): Promise<{ message: string; order: Order }> {
        const response = await axios.post('/order', data);
        return response.data;
    },

    async getMyOrders(): Promise<Order[]> {
        const response = await axios.get('/order/my-orders');
        return response.data;
    },

    async getOrderById(id: number): Promise<Order> {
        const response = await axios.get(`/order/${id}`);
        return response.data;
    },

    async cancelOrder(id: number): Promise<{ message: string; order: Order }> {
        const response = await axios.post(`/order/${id}/cancel`);
        return response.data;
    },

    async confirmDelivery(id: number): Promise<{ message: string; order: Order }> {
        const response = await axios.post(`/order/${id}/confirm-delivery`);
        return response.data;
    },

    // Supplier Actions
    async approveOrder(id: number, data: ApproveOrderData): Promise<{ message: string; order: Order; leg: any }> {
        const response = await axios.post(`/order/${id}/approve`, data);
        return response.data;
    },

    async rejectOrder(id: number, data: RejectOrderData): Promise<{ message: string; order: Order }> {
        const response = await axios.post(`/order/${id}/reject`, data);
        return response.data;
    },

    async reassignOrder(id: number, data: ReassignOrderData): Promise<{ message: string; order: Order; leg: any }> {
        const response = await axios.post(`/order/${id}/reassign`, data);
        return response.data;
    },

    async shipOrder(id: number, legId: number): Promise<{ message: string; leg: any }> {
        const response = await axios.post(`/order/${id}/legs/${legId}/ship`);
        return response.data;
    },
};