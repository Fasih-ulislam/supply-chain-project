'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { AuthUser, LoginCredentials, RegisterData, OTPVerification } from '@/types';

interface AuthContextType {
    user: AuthUser | null;
    setUser: (user: AuthUser | null) => void;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    verifyOtp: (data: OTPVerification) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Only check auth on protected routes or when user might be logged in
        // Skip the check on public pages to reduce unnecessary API calls
        const publicPaths = ['/', '/login', '/register', '/verify-otp'];
        const currentPath = window.location.pathname;

        // Always check auth for /verify or non-public paths
        if (publicPaths.includes(currentPath)) {
            setIsLoading(false);
            return;
        }

        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const currentUser = await authService.getCurrentUser();
            setUser({
                id: currentUser.id,
                email: currentUser.email,
                name: currentUser.name,
                role: currentUser.role,
                hasSupplierProfile: !!currentUser.supplierProfileId,
                hasDistributorProfile: !!currentUser.distributorProfileId,
            });
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (credentials: LoginCredentials) => {
        const response = await authService.login(credentials);
        setUser(response.user);
        router.push('/dashboard');
    };

    const register = async (data: RegisterData) => {
        await authService.register(data);
        router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
    };

    const verifyOtp = async (data: OTPVerification) => {
        const response = await authService.verifyOtp(data);
        setUser(response.user);
        router.push('/dashboard');
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
        router.push('/login');
    };

    const refreshUser = async () => {
        await checkAuth();
    };

    const value: AuthContextType = {
        user,
        setUser,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        verifyOtp,
        logout,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}