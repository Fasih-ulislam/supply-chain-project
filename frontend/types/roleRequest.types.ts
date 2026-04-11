import { Role, RequestStatus } from './enums';

export interface RoleRequest {
    id: number;
    userId: number;
    requestedRole: Role;
    status: RequestStatus;
    businessName: string;
    businessAddress: string;
    contactNumber: string;
    NTN?: string;
    licenseNumber?: string;
    serviceArea?: string;
    createdAt: string;
    updatedAt: string;
    user?: {
        name: string;
        email: string;
    };
}

export interface CreateRoleRequestData {
    requestedRole: Role.SUPPLIER | Role.DISTRIBUTOR;
    businessName: string;
    businessAddress: string;
    contactNumber: string;
    NTN?: string;
    licenseNumber?: string;
    serviceArea?: string;
}

export interface UpdateRoleRequestStatusData {
    status: RequestStatus.APPROVED | RequestStatus.REJECTED;
}