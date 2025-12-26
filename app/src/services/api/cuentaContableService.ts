/**
 * Cuenta Contable API Service
 */
import apiClient from '../../config/apiClient';
import type {
  CuentaContable,
  CreateCuentaContableInput,
  UpdateCuentaContableInput,
  CuentaContableFilters
} from '../../types/cuentaContable';

const BASE_PATH = '/api/cuentas-contables';

export const cuentaContableService = {
  async getAll(filters?: CuentaContableFilters): Promise<CuentaContable[]> {
    const params = new URLSearchParams();
    if (filters?.activo !== undefined) params.append('activo', String(filters.activo));
    if (filters?.tipo) params.append('tipo', filters.tipo);
    if (filters?.nivel !== undefined) params.append('nivel', String(filters.nivel));

    const response = await apiClient.get(`${BASE_PATH}?${params.toString()}`);
    return response.data;
  },

  async getById(id: string): Promise<CuentaContable> {
    const response = await apiClient.get(`${BASE_PATH}/${id}`);
    return response.data;
  },

  async create(data: CreateCuentaContableInput): Promise<CuentaContable> {
    const response = await apiClient.post(BASE_PATH, data);
    return response.data;
  },

  async update(id: string, data: UpdateCuentaContableInput): Promise<CuentaContable> {
    const response = await apiClient.put(`${BASE_PATH}/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${BASE_PATH}/${id}`);
  }
};
