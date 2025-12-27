/**
 * Orden de Compra API Service - DNIT Paraguay
 */
import apiClient from '../../config/apiClient';
import type {
  OrdenCompra,
  CreateOrdenCompraInput,
  UpdateOrdenCompraInput,
  OrdenCompraFilters,
  TotalesDNIT
} from '../../types/ordenCompra';

const BASE_PATH = '/api/ordenes-compra';

export const ordenCompraService = {
  /**
   * Obtiene todas las órdenes de compra con filtros opcionales
   */
  async getAll(filters?: OrdenCompraFilters): Promise<OrdenCompra[]> {
    const params = new URLSearchParams();

    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.proveedorId) params.append('proveedorId', filters.proveedorId);
    if (filters?.fechaDesde) params.append('fechaDesde', filters.fechaDesde);
    if (filters?.fechaHasta) params.append('fechaHasta', filters.fechaHasta);
    if (filters?.search) params.append('search', filters.search);

    const response = await apiClient.get(`${BASE_PATH}?${params.toString()}`);
    return response.data;
  },

  /**
   * Obtiene una orden de compra por ID
   */
  async getById(id: string): Promise<OrdenCompra> {
    const response = await apiClient.get(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * Crea una nueva orden de compra
   */
  async create(data: CreateOrdenCompraInput): Promise<OrdenCompra> {
    const response = await apiClient.post(BASE_PATH, data);
    return response.data;
  },

  /**
   * Actualiza una orden de compra existente
   */
  async update(id: string, data: UpdateOrdenCompraInput): Promise<OrdenCompra> {
    const response = await apiClient.put(`${BASE_PATH}/${id}`, data);
    return response.data;
  },

  /**
   * Aprueba una orden de compra (cambia estado de BORRADOR a APROBADA)
   */
  async aprobar(id: string): Promise<OrdenCompra> {
    const response = await apiClient.post(`${BASE_PATH}/${id}/aprobar`);
    return response.data;
  },

  /**
   * Anula una orden de compra
   */
  async anular(id: string, motivo?: string): Promise<OrdenCompra> {
    const response = await apiClient.post(`${BASE_PATH}/${id}/anular`, { motivo });
    return response.data;
  },

  /**
   * Elimina (soft delete) una orden de compra
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${BASE_PATH}/${id}`);
  },

  /**
   * Calcula totales DNIT a partir de items
   * Útil para validación en el frontend antes de enviar al backend
   */
  calcularTotales(items: CreateOrdenCompraInput['items']): TotalesDNIT {
    let gravado10 = 0;
    let iva10 = 0;
    let gravado5 = 0;
    let iva5 = 0;
    let exentas = 0;

    for (const item of items) {
      const subtotal = item.cantidad * item.precioUnitario;
      const montoIva = subtotal * (item.tasaIva / 100);

      if (item.tasaIva === 10) {
        gravado10 += subtotal;
        iva10 += montoIva;
      } else if (item.tasaIva === 5) {
        gravado5 += subtotal;
        iva5 += montoIva;
      } else if (item.tasaIva === 0) {
        exentas += subtotal;
      }
    }

    const totalGeneral = gravado10 + iva10 + gravado5 + iva5 + exentas;

    return {
      gravado10,
      iva10,
      gravado5,
      iva5,
      exentas,
      totalGeneral
    };
  },

  /**
   * Convierte totales a moneda base usando cotización
   */
  convertirAMonedaBase(totales: TotalesDNIT, cotizacion: number): TotalesDNIT {
    return {
      gravado10: totales.gravado10 * cotizacion,
      iva10: totales.iva10 * cotizacion,
      gravado5: totales.gravado5 * cotizacion,
      iva5: totales.iva5 * cotizacion,
      exentas: totales.exentas * cotizacion,
      totalGeneral: totales.totalGeneral * cotizacion,
    };
  }
};
