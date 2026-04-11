import { OrderStatus, LegStatus, ParticipantType } from './enums';

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
    supplier?: {
        businessName: string;
    };
    inventories?: Inventory[];
}

export interface Inventory {
    id: number;
    warehouseId: number;
    productId: number;
    quantity: number;
    createdAt: string;
    updatedAt: string;
    product?: Product;
    warehouse?: {
        name: string;
        address: string;
    };
}

export interface Order {
    id: number;
    orderDate: string;
    quantity: number;
    totalAmount: number;
    status: OrderStatus;
    deliveryAddress: string;
    orderHash?: string;
    supplierSignature?: string;
    serverSignature?: string;
    qrToken?: string;
    signedAt?: string;
    customerId: number;
    supplierId: number;
    productId: number;
    createdAt: string;
    updatedAt: string;
    customer?: {
        name: string;
        email: string;
    };
    supplier?: {
        businessName: string;
        contactNumber: string;
    };
    product?: Product;
    legs?: OrderLeg[];
    trackingEvents?: TrackingEvent[];
}

export interface OrderLeg {
    id: number;
    orderId: number;
    legNumber: number;
    status: LegStatus;
    fromType: ParticipantType;
    fromSupplierId?: number;
    fromDistributorId?: number;
    toType: ParticipantType;
    toDistributorId?: number;
    transporterId?: number;
    createdAt: string;
    updatedAt: string;
    order?: Order;
    fromSupplier?: {
        businessName: string;
    };
    fromDistributor?: {
        businessName: string;
    };
    toDistributor?: {
        businessName: string;
    };
    transporter?: {
        name: string;
        phone: string;
    };
}

export interface TrackingEvent {
    id: number;
    orderId: number;
    legId?: number;
    fromUserId?: number;
    toUserId?: number;
    status: string;
    description?: string;
    timestamp: string;
    fromUser?: {
        name: string;
    };
    toUser?: {
        name: string;
    };
}

export interface CreateOrderData {
    productId: number;
    supplierId: number;
    quantity: number;
    deliveryAddress: string;
}

export interface ApproveOrderData {
    distributorId: number;
    transporterId: number;
    privateKey: string;
}

export interface ReassignOrderData {
    distributorId: number;
    transporterId: number;
}

export interface RejectOrderData {
    reason: string;
}