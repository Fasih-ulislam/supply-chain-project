// Common types shared across the application

export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ApiError {
    message: string;
    statusCode: number;
    errors?: Record<string, string[]>;
}

export interface SelectOption {
    label: string;
    value: string | number;
}

export interface DateRange {
    from: Date;
    to: Date;
}

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface Address {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
}

export interface FileUpload {
    file: File;
    preview?: string;
    progress?: number;
}

export interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    createdAt: string;
}

export interface SearchParams {
    query?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, any>;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
