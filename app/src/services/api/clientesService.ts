import apiClient from '../../config/apiClient';
import type {
  Cliente,
  CreateClienteInput,
  UpdateClienteInput,
  ClienteFilters,
} from '../../types/api';

const BASE_PATH = '/api/clientes';

/**
 * Clientes API Service
 */
export const clientesService = {
  /**
   * Get all clientes with optional filters
   */
  getAll: async (filters?: ClienteFilters): Promise<Cliente[]> => {
    const response = await apiClient.get<Cliente[]>(BASE_PATH, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get cliente by ID (includes recent ventas)
   */
  getById: async (id: string): Promise<Cliente> => {
    const response = await apiClient.get<Cliente>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Create new cliente
   */
  create: async (data: CreateClienteInput): Promise<Cliente> => {
    const response = await apiClient.post<Cliente>(BASE_PATH, data);
    return response.data;
  },

  /**
   * Update cliente
   */
  update: async (id: string, data: UpdateClienteInput): Promise<Cliente> => {
    const response = await apiClient.put<Cliente>(`${BASE_PATH}/${id}`, data);
    return response.data;
  },

  /**
   * Delete (deactivate) cliente
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${id}`);
  },
};
