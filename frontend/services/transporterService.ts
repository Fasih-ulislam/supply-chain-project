import axios from '@/lib/axios';
import { Transporter, CreateTransporterData, UpdateTransporterData } from '@/types';

export const transporterService = {
    // Supplier transporters
    supplier: {
        async getAll(): Promise<Transporter[]> {
            const response = await axios.get('/supplier/transporters');
            return response.data;
        },

        async create(data: CreateTransporterData): Promise<{ message: string; transporter: Transporter }> {
            const response = await axios.post('/supplier/transporters', data);
            return response.data;
        },

        async update(id: number, data: UpdateTransporterData): Promise<{ message: string; transporter: Transporter }> {
            const response = await axios.put(`/supplier/transporters/${id}`, data);
            return response.data;
        },

        async delete(id: number): Promise<{ message: string }> {
            const response = await axios.delete(`/supplier/transporters/${id}`);
            return response.data;
        }
    },

    // Distributor transporters
    distributor: {
        async getAll(): Promise<Transporter[]> {
            const response = await axios.get('/distributor/transporters');
            return response.data;
        },

        async create(data: CreateTransporterData): Promise<{ message: string; transporter: Transporter }> {
            const response = await axios.post('/distributor/transporters', data);
            return response.data;
        },

        async update(id: number, data: UpdateTransporterData): Promise<{ message: string; transporter: Transporter }> {
            const response = await axios.put(`/distributor/transporters/${id}`, data);
            return response.data;
        },

        async delete(id: number): Promise<{ message: string }> {
            const response = await axios.delete(`/distributor/transporters/${id}`);
            return response.data;
        }
    }
};
