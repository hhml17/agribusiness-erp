import apiClient from '../../config/apiClient';
import type { CentroCosto, CreateCentroCostoInput, UpdateCentroCostoInput, CentroCostoFilters } from '../../types/centroCosto';

const BASE_PATH = '/api/centros-costo';

/**
 * Centro de Costo API Service
 */
export const centroCostoService = {
  /**
   * Get all centros de costo
   */
  getAll: async (filters?: CentroCostoFilters): Promise<CentroCosto[]> => {
    const response = await apiClient.get<CentroCosto[]>(BASE_PATH, { params: filters });
    return response.data;
  },

  /**
   * Get centro de costo by ID
   */
  getById: async (id: string): Promise<CentroCosto> => {
    const response = await apiClient.get<CentroCosto>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Create new centro de costo
   */
  create: async (data: CreateCentroCostoInput): Promise<CentroCosto> => {
    const response = await apiClient.post<CentroCosto>(BASE_PATH, data);
    return response.data;
  },

  /**
   * Update centro de costo
   */
  update: async (id: string, data: UpdateCentroCostoInput): Promise<CentroCosto> => {
    const response = await apiClient.put<CentroCosto>(`${BASE_PATH}/${id}`, data);
    return response.data;
  },

  /**
   * Delete (deactivate) centro de costo
   */
  delete: async (id: string): Promise<CentroCosto> => {
    const response = await apiClient.delete<CentroCosto>(`${BASE_PATH}/${id}`);
    return response.data;
  },
};
