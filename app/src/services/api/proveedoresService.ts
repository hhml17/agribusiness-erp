import apiClient from '../../config/apiClient';
import type {
  Proveedor,
  CreateProveedorInput,
  UpdateProveedorInput,
  ProveedorFilters,
} from '../../types/api';

const BASE_PATH = '/api/proveedores';

/**
 * Proveedores API Service
 */
export const proveedoresService = {
  /**
   * Get all proveedores with optional filters
   */
  getAll: async (filters?: ProveedorFilters): Promise<Proveedor[]> => {
    const response = await apiClient.get<Proveedor[]>(BASE_PATH, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get proveedor by ID (includes recent compras)
   */
  getById: async (id: string): Promise<Proveedor> => {
    const response = await apiClient.get<Proveedor>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Create new proveedor
   */
  create: async (data: CreateProveedorInput): Promise<Proveedor> => {
    const response = await apiClient.post<Proveedor>(BASE_PATH, data);
    return response.data;
  },

  /**
   * Update proveedor
   */
  update: async (id: string, data: UpdateProveedorInput): Promise<Proveedor> => {
    const response = await apiClient.put<Proveedor>(`${BASE_PATH}/${id}`, data);
    return response.data;
  },

  /**
   * Delete (deactivate) proveedor
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${id}`);
  },
};
