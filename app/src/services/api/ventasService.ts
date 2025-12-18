import apiClient from '../../config/apiClient';
import type {
  Venta,
  CreateVentaInput,
  UpdateVentaInput,
  VentaFilters,
} from '../../types/api';

const BASE_PATH = '/api/ventas';

/**
 * Ventas API Service
 */
export const ventasService = {
  /**
   * Get all ventas with optional filters
   */
  getAll: async (filters?: VentaFilters): Promise<Venta[]> => {
    const response = await apiClient.get<Venta[]>(BASE_PATH, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get venta by ID (includes cliente and items)
   */
  getById: async (id: string): Promise<Venta> => {
    const response = await apiClient.get<Venta>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Create new venta (updates stock automatically)
   */
  create: async (data: CreateVentaInput): Promise<Venta> => {
    const response = await apiClient.post<Venta>(BASE_PATH, data);
    return response.data;
  },

  /**
   * Update venta status
   */
  update: async (id: string, data: UpdateVentaInput): Promise<Venta> => {
    const response = await apiClient.put<Venta>(`${BASE_PATH}/${id}`, data);
    return response.data;
  },

  /**
   * Cancel venta (restores stock)
   */
  cancel: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${id}`);
  },
};
