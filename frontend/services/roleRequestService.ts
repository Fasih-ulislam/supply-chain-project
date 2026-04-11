import axios from '@/lib/axios';
import { RoleRequest, CreateRoleRequestData, UpdateRoleRequestStatusData } from '@/types';

export const roleRequestService = {
    // Create role request
    async create(data: CreateRoleRequestData): Promise<{ message: string; request: RoleRequest }> {
        const response = await axios.post('/role-request', data);
        return response.data;
    },

    // Get my role requests
    async getMyRequests(): Promise<RoleRequest[]> {
        const response = await axios.get('/role-request/me');
        return response.data;
    },

    // Get all role requests (admin)
    async getAll(): Promise<RoleRequest[]> {
        const response = await axios.get('/role-request/all');
        return response.data;
    },

    // Get pending role requests (admin)
    async getPending(): Promise<RoleRequest[]> {
        const response = await axios.get('/role-request/pending');
        return response.data;
    },

    // Get role request by ID
    async getById(id: number): Promise<RoleRequest> {
        const response = await axios.get(`/role-request/${id}`);
        return response.data;
    },

    // Update role request status (admin)
    async updateStatus(id: number, data: UpdateRoleRequestStatusData): Promise<{ message: string; updatedRequest: RoleRequest }> {
        const response = await axios.patch(`/role-request/${id}/status`, data);
        return response.data;
    },

    // Delete role request (admin)
    async delete(id: number): Promise<{ message: string }> {
        const response = await axios.delete(`/role-request/${id}`);
        return response.data;
    },
};