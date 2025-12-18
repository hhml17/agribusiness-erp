import apiClient from '../../config/apiClient';
import type {
  Compra,
  CreateCompraInput,
  UpdateCompraInput,
  CompraFilters,
} from '../../types/api';

const BASE_PATH = '/api/compras';

/**
 * Compras API Service
 */
export const comprasService = {
  /**
   * Get all compras with optional filters
   */
  getAll: async (filters?: CompraFilters): Promise<Compra[]> => {
    const response = await apiClient.get<Compra[]>(BASE_PATH, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get compra by ID (includes proveedor and items)
   */
  getById: async (id: string): Promise<Compra> => {
    const response = await apiClient.get<Compra>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Create new compra
   */
  create: async (data: CreateCompraInput): Promise<Compra> => {
    const response = await apiClient.post<Compra>(BASE_PATH, data);
    return response.data;
  },

  /**
   * Update compra status (updates stock when marked as RECIBIDA)
   */
  update: async (id: string, data: UpdateCompraInput): Promise<Compra> => {
    const response = await apiClient.put<Compra>(`${BASE_PATH}/${id}`, data);
    return response.data;
  },

  /**
   * Cancel compra (restores stock if was RECIBIDA)
   */
  cancel: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${id}`);
  },
};
