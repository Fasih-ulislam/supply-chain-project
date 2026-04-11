export interface Product {
    id: number;
    name: string;
    category: string;
    batchNo: string;
    qrCode?: string;
    description?: string;
    price: number;
    supplierId: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductData {
    name: string;
    category: string;
    batchNo: string;
    price: number;
    description?: string;
    qrCode?: string;
}

export interface UpdateProductData {
    name?: string;
    category?: string;
    batchNo?: string;
    price?: number;
    description?: string;
    qrCode?: string;
}

export interface Inventory {
    id: number;
    warehouseId: number;
    productId: number;
    quantity: number;
    createdAt: string;
    updatedAt: string;
    product?: Product;
    warehouse?: Warehouse;
}

export interface AddInventoryData {
    productId: number;
    quantity: number;
}

export interface UpdateInventoryData {
    quantity: number;
}

export interface SupplierProfile {
    id: number;
    userId: number;
    businessName: string;
    businessAddress: string;
    contactNumber: string;
    NTN?: string;
    licenseNumber?: string;
    publicKey?: string;
    privateKeyHash?: string;
    createdAt: string;
    updatedAt: string;
    warehouse?: Warehouse;
}

export interface DistributorProfile {
    id: number;
    userId: number;
    businessName: string;
    businessAddress: string;
    contactNumber: string;
    NTN?: string;
    serviceArea?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Warehouse {
    id: number;
    supplierId: number;
    name: string;
    address: string;
    createdAt: string;
    updatedAt: string;
}

export interface Transporter {
    id: number;
    name: string;
    phone: string;
    supplierId?: number;
    distributorId?: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTransporterData {
    name: string;
    phone: string;
}

export interface UpdateTransporterData {
    name?: string;
    phone?: string;
}