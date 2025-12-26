import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// API Base URL - from environment or default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Create axios instance with default configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to add authentication token
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get auth token from sessionStorage (set by MSAL)
    let token = sessionStorage.getItem('msal.accessToken');

    // In dev mode, use a mock token if no real token exists
    if (!token && import.meta.env.VITE_DEV_MODE === 'true') {
      token = 'dev-mode-token';
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Get active tenant ID from localStorage or environment
    const tenantId = localStorage.getItem('activeTenantId') || import.meta.env.VITE_TENANT_ID;

    if (tenantId && config.headers) {
      config.headers['X-Tenant-ID'] = tenantId;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle errors globally
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`[API] Response from ${response.config.url}:`, response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as any;

      switch (status) {
        case 401:
          console.error('[API] Unauthorized - redirecting to login');
          // Clear auth data
          sessionStorage.clear();
          localStorage.removeItem('activeTenantId');
          // Redirect to login (handled by App.tsx)
          window.location.href = '/login';
          break;

        case 403:
          console.error('[API] Forbidden - insufficient permissions');
          alert('No tienes permisos para realizar esta acción');
          break;

        case 404:
          console.error('[API] Not found:', data?.error || 'Resource not found');
          break;

        case 409:
          console.error('[API] Conflict:', data?.error || 'Resource already exists');
          break;

        case 500:
          console.error('[API] Server error:', data?.error || 'Internal server error');
          alert('Error del servidor. Por favor intenta nuevamente.');
          break;

        default:
          console.error(`[API] Error ${status}:`, data?.error || error.message);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('[API] No response received:', error.request);
      alert('No se pudo conectar con el servidor. Verifica tu conexión.');
    } else {
      // Error in request configuration
      console.error('[API] Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * Helper function to set active tenant
 */
export const setActiveTenant = (tenantId: string) => {
  localStorage.setItem('activeTenantId', tenantId);
};

/**
 * Helper function to get active tenant
 */
export const getActiveTenant = (): string | null => {
  return localStorage.getItem('activeTenantId');
};

/**
 * Helper function to set auth token
 */
export const setAuthToken = (token: string) => {
  sessionStorage.setItem('msal.accessToken', token);
};

/**
 * Helper function to clear auth data
 */
export const clearAuthData = () => {
  sessionStorage.clear();
  localStorage.removeItem('activeTenantId');
};

export default apiClient;
