import { z } from 'zod';

// Auth Schemas
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
    email: z.string().email('Invalid email address'),
    password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least 1 uppercase, 1 lowercase letter, and 1 number'),
});

export const otpSchema = z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be 6 digits').regex(/^[0-9]+$/, 'OTP must contain only numbers'),
});

// User Schema
export const updateUserSchema = z.object({
    name: z.string().min(2).max(50).optional(),
    password: z
        .string()
        .min(6)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least 1 uppercase, 1 lowercase letter, and 1 number')
        .optional(),
    picture: z.string().url().optional(),
});

// Role Request Schema
export const roleRequestSchema = z.object({
    requestedRole: z.enum(['SUPPLIER', 'DISTRIBUTOR']),
    businessName: z.string().min(2).max(100),
    businessAddress: z.string().min(5).max(200),
    contactNumber: z.string().regex(/^[0-9+\-\s]{10,15}$/, 'Invalid phone number format'),
    NTN: z.string().max(20).optional(),
    licenseNumber: z.string().max(50).optional(),
    serviceArea: z.string().max(100).optional(),
});

// Product Schema
export const productSchema = z.object({
    name: z.string().min(2).max(100),
    category: z.string().min(2).max(100),
    batchNo: z.string().min(1).max(100),
    price: z.number().positive('Price must be positive'),
    description: z.string().max(500).optional(),
    qrCode: z.string().max(255).optional(),
});

// Inventory Schema
export const addInventorySchema = z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().min(1),
});

export const updateInventorySchema = z.object({
    quantity: z.number().int().min(0),
});

// Transporter Schema
export const transporterSchema = z.object({
    name: z.string().min(2).max(100),
    phone: z.string().regex(/^[0-9+\-\s]{10,15}$/, 'Invalid phone number format'),
});

// Order Schema
export const createOrderSchema = z.object({
    productId: z.number().int().positive(),
    supplierId: z.number().int().positive(),
    quantity: z.number().int().min(1),
    deliveryAddress: z.string().min(10).max(300),
});

// Warehouse Schema
export const warehouseSchema = z.object({
    name: z.string().min(2).max(100),
    address: z.string().min(5).max(200),
});