import apiClient from '../../config/apiClient';
import type {
  Producto,
  CreateProductoInput,
  UpdateProductoInput,
  ProductoFilters,
} from '../../types/api';

const BASE_PATH = '/api/productos';

/**
 * Productos API Service
 */
export const productosService = {
  /**
   * Get all productos with optional filters
   */
  getAll: async (filters?: ProductoFilters): Promise<Producto[]> => {
    const response = await apiClient.get<Producto[]>(BASE_PATH, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get productos with low stock
   */
  getBajoStock: async (): Promise<Producto[]> => {
    const response = await apiClient.get<Producto[]>(`${BASE_PATH}/bajo-stock`);
    return response.data;
  },

  /**
   * Get producto by ID
   */
  getById: async (id: string): Promise<Producto> => {
    const response = await apiClient.get<Producto>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Create new producto
   */
  create: async (data: CreateProductoInput): Promise<Producto> => {
    const response = await apiClient.post<Producto>(BASE_PATH, data);
    return response.data;
  },

  /**
   * Update producto
   */
  update: async (id: string, data: UpdateProductoInput): Promise<Producto> => {
    const response = await apiClient.put<Producto>(`${BASE_PATH}/${id}`, data);
    return response.data;
  },

  /**
   * Delete (deactivate) producto
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${id}`);
  },
};
