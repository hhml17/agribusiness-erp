import apiClient from '../../config/apiClient';
import type {
  Talonario,
  CreateTalonarioInput,
  UpdateTalonarioInput,
  TalonarioFilters,
} from '../../types/actores';

const BASE_PATH = '/api/talonarios';

/**
 * Talonarios API Service
 */
export const talonariosService = {
  /**
   * Get all talonarios with optional filters
   */
  getAll: async (filters?: TalonarioFilters): Promise<Talonario[]> => {
    const response = await apiClient.get<Talonario[]>(BASE_PATH, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get talonario by ID (includes recent facturas)
   */
  getById: async (id: string): Promise<Talonario> => {
    const response = await apiClient.get<Talonario>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Create new talonario
   */
  create: async (data: CreateTalonarioInput): Promise<Talonario> => {
    const response = await apiClient.post<Talonario>(BASE_PATH, data);
    return response.data;
  },

  /**
   * Update talonario
   */
  update: async (id: string, data: UpdateTalonarioInput): Promise<Talonario> => {
    const response = await apiClient.put<Talonario>(`${BASE_PATH}/${id}`, data);
    return response.data;
  },

  /**
   * Delete (deactivate) talonario
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${id}`);
  },
};
