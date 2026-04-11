import axios from '@/lib/axios';
import { User } from '@/types';

export const userService = {
    // Get user by email (self)
    async getUser(): Promise<User> {
        const response = await axios.get('/user');
        return response.data;
    },

    // Update user
    async updateUser(data: Partial<User>): Promise<{ message: string; user: User }> {
        const response = await axios.put('/user', data);
        return response.data;
    },

    // Delete user
    async deleteUser(): Promise<{ message: string }> {
        const response = await axios.delete('/user');
        return response.data;
    },

    // Get all users (admin only)
    async getAllUsers(): Promise<User[]> {
        const response = await axios.get('/user/all');
        return response.data;
    },

    // Delete user by ID (admin only)
    async deleteUserById(userId: number): Promise<{ message: string }> {
        const response = await axios.delete(`/user/${userId}`);
        return response.data;
    },
};