import axios from '@/lib/axios';
import {
    DistributorProfile,
    Transporter,
    CreateTransporterData,
    UpdateTransporterData,
    Order,
    OrderLeg
} from '@/types';

export const distributorService = {
    // Profile
    async getProfile(): Promise<DistributorProfile> {
        const response = await axios.get('/distributor/profile');
        return response.data;
    },

    async updateProfile(data: Partial<DistributorProfile>): Promise<{ message: string; profile: DistributorProfile }> {
        const response = await axios.put('/distributor/profile', data);
        return response.data;
    },

    // Transporters
    async getTransporters(): Promise<Transporter[]> {
        const response = await axios.get('/distributor/transporters');
        return response.data;
    },

    async createTransporter(data: CreateTransporterData): Promise<{ message: string; transporter: Transporter }> {
        const response = await axios.post('/distributor/transporters', data);
        return response.data;
    },

    async updateTransporter(id: number, data: UpdateTransporterData): Promise<{ message: string; transporter: Transporter }> {
        const response = await axios.put(`/distributor/transporters/${id}`, data);
        return response.data;
    },

    async deleteTransporter(id: number): Promise<{ message: string }> {
        const response = await axios.delete(`/distributor/transporters/${id}`);
        return response.data;
    },

    // Orders
    async getAssignedOrders(): Promise<any[]> {
        const response = await axios.get('/distributor/orders/assigned');
        return response.data;
    },

    async getHeldOrders(): Promise<Order[]> {
        const response = await axios.get('/distributor/orders/held');
        return response.data;
    },

    // Order Leg Actions
    async acceptLeg(legId: number): Promise<{ message: string; leg: OrderLeg }> {
        const response = await axios.post(`/distributor/legs/${legId}/accept`);
        return response.data;
    },

    async rejectLeg(legId: number, data: { reason: string }): Promise<{ message: string; leg: OrderLeg }> {
        const response = await axios.post(`/distributor/legs/${legId}/reject`, data);
        return response.data;
    },

    async confirmReceipt(legId: number): Promise<{ message: string; leg: OrderLeg }> {
        const response = await axios.post(`/distributor/legs/${legId}/confirm-receipt`);
        return response.data;
    },

    async shipForward(legId: number): Promise<{ message: string; leg: OrderLeg }> {
        const response = await axios.post(`/distributor/legs/${legId}/ship`);
        return response.data;
    },

    async forwardOrder(orderId: number, data: any): Promise<{ message: string; leg: OrderLeg }> {
        const response = await axios.post(`/distributor/orders/${orderId}/forward`, data);
        return response.data;
    },

    async reassignLeg(legId: number, data: { toDistributorId: number; transporterId: number }): Promise<{ message: string; leg: OrderLeg }> {
        const response = await axios.post(`/distributor/legs/${legId}/reassign`, data);
        return response.data;
    },

    // Leg Tracking
    async getOutgoingLegs(): Promise<OrderLeg[]> {
        const response = await axios.get('/distributor/legs/outgoing');
        return response.data;
    },

    async getLegById(legId: number): Promise<OrderLeg> {
        const response = await axios.get(`/distributor/legs/${legId}`);
        return response.data;
    },

    // Browse
    async getDistributors(): Promise<any[]> {
        const response = await axios.get('/distributor/distributors');
        return response.data;
    },

    async getAllDistributors(): Promise<any[]> {
        const response = await axios.get('/distributor/distributors');
        return response.data;
    },
};