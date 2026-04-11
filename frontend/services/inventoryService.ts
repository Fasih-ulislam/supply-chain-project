import axios from '@/lib/axios';
import { Inventory, AddInventoryData, UpdateInventoryData } from '@/types';

export const inventoryService = {
    // Get inventory (uses supplier service)
    async getInventory(): Promise<Inventory[]> {
        const response = await axios.get('/supplier/inventory');
        return response.data;
    },

    // Add inventory item
    async addInventory(data: AddInventoryData): Promise<{ message: string; inventory: Inventory }> {
        const response = await axios.post('/supplier/inventory', data);
        return response.data;
    },

    // Update inventory
    async updateInventory(id: number, data: UpdateInventoryData): Promise<{ message: string; inventory: Inventory }> {
        const response = await axios.put(`/supplier/inventory/${id}`, data);
        return response.data;
    },

    // Delete inventory item
    async deleteInventory(id: number): Promise<{ message: string }> {
        const response = await axios.delete(`/supplier/inventory/${id}`);
        return response.data;
    },

    // Get low stock items
    async getLowStock(threshold: number = 10): Promise<Inventory[]> {
        const response = await axios.get('/supplier/inventory');
        const inventory: Inventory[] = response.data;
        return inventory.filter(item => item.quantity < threshold);
    }
};
