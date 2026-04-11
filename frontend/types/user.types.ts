import { Role } from './enums';

export interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
    picture?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AuthUser {
    id: number;
    email: string;
    name: string;
    role: Role;
    hasSupplierProfile: boolean;
    hasDistributorProfile: boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface OTPVerification {
    email: string;
    otp: string;
}

export interface AuthResponse {
    message: string;
    user: AuthUser;
}

export interface CurrentUserResponse {
    id: number;
    email: string;
    name: string;
    role: Role;
    supplierProfileId: number | null;
    distributorProfileId: number | null;
}