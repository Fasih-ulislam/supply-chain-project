import axios from '@/lib/axios';
import { LoginCredentials, RegisterData, OTPVerification, AuthResponse, CurrentUserResponse } from '@/types';

export const authService = {
    // Register new user
    async register(data: RegisterData): Promise<{ message: string }> {
        const response = await axios.post('/auth/register', data);
        return response.data;
    },

    // Verify OTP
    async verifyOtp(data: OTPVerification): Promise<AuthResponse> {
        const response = await axios.post('/auth/verify-otp', data);
        return response.data;
    },

    // Login
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await axios.post('/auth/login', credentials);
        return response.data;
    },

    // Logout
    async logout(): Promise<{ message: string }> {
        const response = await axios.post('/auth/logout');
        return response.data;
    },

    // Get current user
    async getCurrentUser(): Promise<CurrentUserResponse> {
        const response = await axios.get('/auth/me');
        return response.data;
    },
};