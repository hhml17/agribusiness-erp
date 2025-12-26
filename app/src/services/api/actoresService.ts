import apiClient from '../../config/apiClient';
import type {
  Actor,
  CreateActorInput,
  UpdateActorInput,
  ActorFilters,
  ActorCuentaContable,
  CreateActorCuentaInput,
} from '../../types/actores';

const BASE_PATH = '/api/actores';

/**
 * Actores API Service
 */
export const actoresService = {
  /**
   * Get all actores with optional filters
   */
  getAll: async (filters?: ActorFilters): Promise<Actor[]> => {
    const response = await apiClient.get<Actor[]>(BASE_PATH, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get actor by ID (includes cuentas contables)
   */
  getById: async (id: string): Promise<Actor> => {
    const response = await apiClient.get<Actor>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Create new actor
   */
  create: async (data: CreateActorInput): Promise<Actor> => {
    const response = await apiClient.post<Actor>(BASE_PATH, data);
    return response.data;
  },

  /**
   * Update actor
   */
  update: async (id: string, data: UpdateActorInput): Promise<Actor> => {
    const response = await apiClient.put<Actor>(`${BASE_PATH}/${id}`, data);
    return response.data;
  },

  /**
   * Delete (deactivate) actor
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${id}`);
  },

  /**
   * Get all cuentas contables for an actor
   */
  getCuentas: async (actorId: string): Promise<ActorCuentaContable[]> => {
    const response = await apiClient.get<ActorCuentaContable[]>(`${BASE_PATH}/${actorId}/cuentas`);
    return response.data;
  },

  /**
   * Add cuenta contable for an actor
   */
  addCuenta: async (actorId: string, data: CreateActorCuentaInput): Promise<ActorCuentaContable> => {
    const response = await apiClient.post<ActorCuentaContable>(
      `${BASE_PATH}/${actorId}/cuentas`,
      data
    );
    return response.data;
  },

  /**
   * Delete cuenta contable for an actor
   */
  deleteCuenta: async (actorId: string, cuentaId: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${actorId}/cuentas/${cuentaId}`);
  },
};
