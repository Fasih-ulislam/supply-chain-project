import axios from '@/lib/axios';

export interface QRVerificationResult {
    valid: boolean;
    message: string;
    order?: any;
    verification?: {
        signedAt: string;
        orderHash: string;
        supplierSignatureValid: boolean;
        serverSignatureValid: boolean;
    };
    error?: string;
}

export interface QRDetails {
    orderId: number;
    qrToken: string;
    orderHash: string;
    supplierSignature: string;
    serverSignature: string;
    signedAt: string;
    qrCodeData?: string;
}

export const verificationService = {
    // Verify QR token
    async verifyQR(token: string): Promise<QRVerificationResult> {
        const response = await axios.get(`/verify?token=${encodeURIComponent(token)}`);
        return response.data;
    },

    // Get Order QR details (Supplier)
    async getOrderQR(orderId: number): Promise<QRDetails> {
        const response = await axios.get(`/verify/order/${orderId}/qr`);
        return response.data;
    },
};