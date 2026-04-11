import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from './constants';

// Create axios instance
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    withCredentials: true, // Important for cookie-based auth
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // You can add auth token here if using header-based auth
        // const token = localStorage.getItem('token');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        if (error.response) {
            const errorMessage = (error.response.data as any)?.message || '';
            const statusCode = error.response.status;

            // For 401 errors, check if it's a business logic error or actual auth failure
            if (statusCode === 401) {
                // Don't redirect for specific business logic errors (invalid private key, etc.)
                const noRedirectPatterns = ['private key', 'invalid key', 'wrong key'];
                const shouldNotRedirect = noRedirectPatterns.some(pattern =>
                    errorMessage.toLowerCase().includes(pattern)
                );

                // Debug logging
                if (process.env.NODE_ENV === 'development') {
                    console.log('401 Error:', errorMessage);
                    console.log('Should not redirect:', shouldNotRedirect);
                }

                if (!shouldNotRedirect) {
                    // Redirect to login only for actual authentication failures
                    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                        console.log('Redirecting to login...');
                        window.location.href = '/login';
                    }
                }
            }

            // Handle other status codes
            switch (statusCode) {
                case 403:
                    console.error('Access forbidden');
                    break;
                case 404:
                    console.error('Resource not found');
                    break;
                case 500:
                    console.error('Server error');
                    break;
                default:
                    break;
            }
        } else if (error.request) {
            // Network error
            console.error('Network error - please check your connection');
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;