import axios from '@/lib/axios';
import { Product, CreateProductData, UpdateProductData } from '@/types';

export const productService = {
    // Get all products (for customers)
    async getProducts(): Promise<Product[]> {
        const response = await axios.get('/order/products');
        return response.data;
    },

    // Get product by ID
    async getProductById(id: number): Promise<Product> {
        const response = await axios.get(`/products/${id}`);
        return response.data;
    },

    // Search products
    async searchProducts(query: string): Promise<Product[]> {
        const response = await axios.get('/order/products', {
            params: { search: query }
        });
        return response.data;
    },

    // Filter products by category
    async filterByCategory(category: string): Promise<Product[]> {
        const response = await axios.get('/order/products', {
            params: { category }
        });
        return response.data;
    }
};
