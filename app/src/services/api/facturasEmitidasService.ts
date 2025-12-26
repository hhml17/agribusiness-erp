import apiClient from '../../config/apiClient';
import type {
  FacturaEmitida,
  CreateFacturaEmitidaInput,
  AnularFacturaInput,
  FacturaEmitidaFilters,
} from '../../types/actores';

const BASE_PATH = '/api/facturas-emitidas';

/**
 * Facturas Emitidas API Service
 */
export const facturasEmitidasService = {
  /**
   * Get all facturas emitidas with optional filters
   */
  getAll: async (filters?: FacturaEmitidaFilters): Promise<FacturaEmitida[]> => {
    const response = await apiClient.get<FacturaEmitida[]>(BASE_PATH, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get factura emitida by ID (includes talonario)
   */
  getById: async (id: string): Promise<FacturaEmitida> => {
    const response = await apiClient.get<FacturaEmitida>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Create new factura emitida
   */
  create: async (data: CreateFacturaEmitidaInput): Promise<FacturaEmitida> => {
    const response = await apiClient.post<FacturaEmitida>(BASE_PATH, data);
    return response.data;
  },

  /**
   * Anular factura emitida
   */
  anular: async (id: string, data: AnularFacturaInput): Promise<FacturaEmitida> => {
    const response = await apiClient.put<FacturaEmitida>(`${BASE_PATH}/${id}/anular`, data);
    return response.data;
  },
};
