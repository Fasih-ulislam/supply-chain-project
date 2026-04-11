import axios from '@/lib/axios';
import {
    SupplierProfile,
    Product,
    Inventory,
    Transporter,
    CreateProductData,
    UpdateProductData,
    AddInventoryData,
    UpdateInventoryData,
    CreateTransporterData,
    UpdateTransporterData,
    Warehouse,
    Order
} from '@/types';

export const supplierService = {
    // Profile
    async getProfile(): Promise<SupplierProfile> {
        const response = await axios.get('/supplier/profile');
        return response.data;
    },

    async updateProfile(data: Partial<SupplierProfile>): Promise<{ message: string; profile: SupplierProfile }> {
        const response = await axios.put('/supplier/profile', data);
        return response.data;
    },

    // Warehouse
    async updateWarehouse(data: Partial<Warehouse>): Promise<{ message: string; warehouse: Warehouse }> {
        const response = await axios.put('/supplier/warehouse', data);
        return response.data;
    },

    // Products
    async getProducts(): Promise<Product[]> {
        const response = await axios.get('/supplier/products');
        return response.data;
    },

    async createProduct(data: CreateProductData): Promise<{ message: string; product: Product }> {
        const response = await axios.post('/supplier/products', data);
        return response.data;
    },

    async updateProduct(id: number, data: UpdateProductData): Promise<{ message: string; product: Product }> {
        const response = await axios.put(`/supplier/products/${id}`, data);
        return response.data;
    },

    async deleteProduct(id: number): Promise<{ message: string }> {
        const response = await axios.delete(`/supplier/products/${id}`);
        return response.data;
    },

    // Inventory
    async getInventory(): Promise<Inventory[]> {
        const response = await axios.get('/supplier/inventory');
        return response.data;
    },

    async addInventory(data: AddInventoryData): Promise<{ message: string; inventory: Inventory }> {
        const response = await axios.post('/supplier/inventory', data);
        return response.data;
    },

    async updateInventory(id: number, data: UpdateInventoryData): Promise<{ message: string; inventory: Inventory }> {
        const response = await axios.put(`/supplier/inventory/${id}`, data);
        return response.data;
    },

    async deleteInventory(id: number): Promise<{ message: string }> {
        const response = await axios.delete(`/supplier/inventory/${id}`);
        return response.data;
    },

    // Transporters
    async getTransporters(): Promise<Transporter[]> {
        const response = await axios.get('/supplier/transporters');
        return response.data;
    },

    async createTransporter(data: CreateTransporterData): Promise<{ message: string; transporter: Transporter }> {
        const response = await axios.post('/supplier/transporters', data);
        return response.data;
    },

    async updateTransporter(id: number, data: UpdateTransporterData): Promise<{ message: string; transporter: Transporter }> {
        const response = await axios.put(`/supplier/transporters/${id}`, data);
        return response.data;
    },

    async deleteTransporter(id: number): Promise<{ message: string }> {
        const response = await axios.delete(`/supplier/transporters/${id}`);
        return response.data;
    },

    // Orders
    async getOrders(): Promise<Order[]> {
        const response = await axios.get('/supplier/orders');
        return response.data;
    },

    // Browse
    async getDistributors(): Promise<any[]> {
        const response = await axios.get('/supplier/distributors');
        return response.data;
    },

    async getSuppliers(): Promise<any[]> {
        const response = await axios.get('/supplier/suppliers');
        return response.data;
    },
};