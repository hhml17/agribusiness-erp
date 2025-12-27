/**
 * Cotización API Service
 * Gestión de tasas de cambio entre monedas
 */
import apiClient from '../../config/apiClient';
import type {
  Cotizacion,
  CreateCotizacionInput,
  UpdateCotizacionInput,
  CotizacionFilters,
  CodigoMoneda,
} from '../../types/moneda';

const BASE_PATH = '/api/cotizaciones';

export const cotizacionService = {
  /**
   * Obtiene todas las cotizaciones con filtros opcionales
   */
  async getAll(filters?: CotizacionFilters): Promise<Cotizacion[]> {
    const params = new URLSearchParams();

    if (filters?.monedaOrigenId) params.append('monedaOrigenId', filters.monedaOrigenId);
    if (filters?.monedaDestinoId) params.append('monedaDestinoId', filters.monedaDestinoId);
    if (filters?.fechaDesde) params.append('fechaDesde', filters.fechaDesde);
    if (filters?.fechaHasta) params.append('fechaHasta', filters.fechaHasta);

    const response = await apiClient.get(`${BASE_PATH}?${params.toString()}`);
    return response.data;
  },

  /**
   * Obtiene una cotización por ID
   */
  async getById(id: string): Promise<Cotizacion> {
    const response = await apiClient.get(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Obtiene la última cotización para un par de monedas
   */
  async getUltima(monedaOrigen: CodigoMoneda, monedaDestino: CodigoMoneda): Promise<Cotizacion | null> {
    try {
      const response = await apiClient.get(`${BASE_PATH}/ultima`, {
        params: { monedaOrigen, monedaDestino }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Obtiene la cotización vigente para una fecha específica
   */
  async getCotizacionVigente(
    monedaOrigen: CodigoMoneda,
    monedaDestino: CodigoMoneda,
    fecha: string
  ): Promise<Cotizacion | null> {
    try {
      const response = await apiClient.get(`${BASE_PATH}/vigente`, {
        params: { monedaOrigen, monedaDestino, fecha }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Crea una nueva cotización
   */
  async create(data: CreateCotizacionInput): Promise<Cotizacion> {
    const response = await apiClient.post(BASE_PATH, data);
    return response.data;
  },

  /**
   * Actualiza una cotización existente
   */
  async update(id: string, data: UpdateCotizacionInput): Promise<Cotizacion> {
    const response = await apiClient.put(`${BASE_PATH}/${id}`, data);
    return response.data;
  },

  /**
   * Elimina una cotización
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${BASE_PATH}/${id}`);
  },

  /**
   * Convierte un monto de una moneda a otra
   */
  async convertir(
    monto: number,
    monedaOrigen: CodigoMoneda,
    monedaDestino: CodigoMoneda,
    fecha?: string,
    tipo: 'compra' | 'venta' = 'compra'
  ): Promise<number> {
    const cotizacion = fecha
      ? await this.getCotizacionVigente(monedaOrigen, monedaDestino, fecha)
      : await this.getUltima(monedaOrigen, monedaDestino);

    if (!cotizacion) {
      throw new Error(`No se encontró cotización para ${monedaOrigen}/${monedaDestino}`);
    }

    const tasa = tipo === 'compra' ? cotizacion.tasaCompra : cotizacion.tasaVenta;
    return monto * tasa;
  },
};
