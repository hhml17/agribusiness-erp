import apiClient from '../../config/apiClient';
import type {
  Tenant,
  CreateTenantInput,
  UpdateTenantInput,
} from '../../types/api';

const BASE_PATH = '/api/tenants';

/**
 * Tenants API Service
 */
export const tenantsService = {
  /**
   * Get all tenants for authenticated user
   */
  getAll: async (): Promise<Tenant[]> => {
    const response = await apiClient.get<Tenant[]>(BASE_PATH);
    return response.data;
  },

  /**
   * Get tenant by ID
   */
  getById: async (id: string): Promise<Tenant> => {
    const response = await apiClient.get<Tenant>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Create new tenant
   */
  create: async (data: CreateTenantInput): Promise<Tenant> => {
    const response = await apiClient.post<Tenant>(BASE_PATH, data);
    return response.data;
  },

  /**
   * Update tenant (Admin only)
   */
  update: async (id: string, data: UpdateTenantInput): Promise<Tenant> => {
    const response = await apiClient.put<Tenant>(`${BASE_PATH}/${id}`, data);
    return response.data;
  },

  /**
   * Delete (deactivate) tenant (Admin only)
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${id}`);
  },
};
