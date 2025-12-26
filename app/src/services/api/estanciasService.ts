import apiClient from '../../config/apiClient';
import type {
  Estancia,
  CreateEstanciaInput,
  UpdateEstanciaInput,
  EstanciaFilters,
} from '../../types/actores';

const BASE_PATH = '/api/estancias';

/**
 * Estancias API Service
 */
export const estanciasService = {
  /**
   * Get all estancias with optional filters
   */
  getAll: async (filters?: EstanciaFilters): Promise<Estancia[]> => {
    const response = await apiClient.get<Estancia[]>(BASE_PATH, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get estancia by ID (includes centro de costo)
   */
  getById: async (id: string): Promise<Estancia> => {
    const response = await apiClient.get<Estancia>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Create new estancia
   */
  create: async (data: CreateEstanciaInput): Promise<Estancia> => {
    const response = await apiClient.post<Estancia>(BASE_PATH, data);
    return response.data;
  },

  /**
   * Update estancia
   */
  update: async (id: string, data: UpdateEstanciaInput): Promise<Estancia> => {
    const response = await apiClient.put<Estancia>(`${BASE_PATH}/${id}`, data);
    return response.data;
  },

  /**
   * Delete (deactivate) estancia
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${id}`);
  },
};
