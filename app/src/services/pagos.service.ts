import apiClient from '../config/apiClient';
import type { ApiResponse } from '../types/contabilidad';

// ==========================================
// TYPES
// ==========================================

export interface CuentaBancaria {
  id: string;
  tenantId: string;
  banco: string;
  tipoCuenta: string; // CUENTA_CORRIENTE, CAJA_AHORRO
  numeroCuenta: string;
  moneda: string; // PYG, USD
  saldoActual: number;
  cuentaContableId?: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chequera {
  id: string;
  tenantId: string;
  cuentaBancariaId: string;
  numeroInicial: number;
  numeroFinal: number;
  siguienteNumero: number;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrdenCompra {
  id: string;
  tenantId: string;
  numero: string;
  fecha: Date;
  proveedorId: string;
  proveedor?: any;
  descripcion: string;
  observaciones?: string;
  subtotal: number;
  iva: number;
  total: number;
  estado: string; // BORRADOR, PENDIENTE_APROBACION, APROBADA, RECHAZADA, ANULADA
  solicitadoPor?: string;
  aprobadoPor?: string;
  fechaAprobacion?: Date;
  motivoRechazo?: string;
  createdAt: Date;
  updatedAt: Date;
  items?: ItemOrdenCompra[];
}

export interface ItemOrdenCompra {
  id: string;
  ordenCompraId: string;
  productoId: string;
  producto?: any;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface FacturaCompra {
  id: string;
  tenantId: string;
  numeroFactura: string;
  timbrado: string;
  fecha: Date;
  fechaVencimiento?: Date;
  proveedorId: string;
  proveedor?: any;
  ordenCompraId?: string;
  ordenCompra?: OrdenCompra;
  tipo: string; // NORMAL, ANTICIPO, GASTO_NO_DEDUCIBLE, CAJA_CHICA
  descripcion: string;
  observaciones?: string;
  subtotal: number;
  iva: number;
  total: number;
  montoPagado: number;
  saldoPendiente: number;
  estado: string; // PENDIENTE, PAGO_PARCIAL, PAGADA, ANULADA
  createdAt: Date;
  updatedAt: Date;
}

export interface OrdenPago {
  id: string;
  tenantId: string;
  numero: string;
  fecha: Date;
  proveedorId?: string;
  proveedor?: any;
  beneficiario: string;
  facturaCompraId?: string;
  facturaCompra?: FacturaCompra;
  metodoPago: string; // EFECTIVO, TRANSFERENCIA, CHEQUE, CHEQUE_DIFERIDO
  cuentaBancariaId?: string;
  cuentaBancaria?: CuentaBancaria;
  montoTotal: number;
  montoNeto: number;
  retencionIVA: number;
  retencionIRE: number;
  estado: string; // BORRADOR, PENDIENTE_APROBACION, APROBADA, RECHAZADA, PAGADA, ANULADA
  solicitadoPor?: string;
  aprobadoPor?: string;
  fechaAprobacion?: Date;
  fechaPago?: Date;
  motivoRechazo?: string;
  observaciones?: string;
  createdAt: Date;
  updatedAt: Date;
  retenciones?: Retencion[];
}

export interface Retencion {
  id: string;
  tenantId: string;
  ordenPagoId: string;
  tipo: string; // IVA, IRE, OTROS
  descripcion: string;
  monto: number;
  numeroComprobante?: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MovimientoBancario {
  id: string;
  tenantId: string;
  cuentaBancariaId: string;
  tipo: string; // INGRESO, EGRESO
  fecha: Date;
  descripcion: string;
  monto: number;
  numeroCheque?: string;
  ordenPagoId?: string;
  estado: string; // PENDIENTE, CONCILIADO, REVERSADO
  createdAt: Date;
  updatedAt: Date;
}

// Form Data Types
export interface CuentaBancariaFormData {
  banco: string;
  tipoCuenta: string;
  numeroCuenta: string;
  moneda?: string;
  saldoActual?: number;
  cuentaContableId?: string;
}

export interface ChequeraFormData {
  numeroInicial: number;
  numeroFinal: number;
}

export interface OrdenCompraFormData {
  fecha: Date;
  proveedorId: string;
  descripcion: string;
  observaciones?: string;
  items: {
    productoId: string;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
  }[];
  solicitadoPor?: string;
}

export interface FacturaCompraFormData {
  numeroFactura: string;
  timbrado: string;
  fecha: Date;
  fechaVencimiento?: Date;
  proveedorId: string;
  ordenCompraId?: string;
  tipo?: string;
  descripcion: string;
  observaciones?: string;
  subtotal: number;
  iva?: number;
  total: number;
}

export interface OrdenPagoFormData {
  fecha: Date;
  proveedorId?: string;
  beneficiario: string;
  facturaCompraId?: string;
  metodoPago: string;
  cuentaBancariaId?: string;
  montoTotal: number;
  retencionIVA?: number;
  retencionIRE?: number;
  solicitadoPor?: string;
  observaciones?: string;
  retenciones?: {
    tipo: string;
    descripcion: string;
    monto: number;
    numeroComprobante?: string;
  }[];
}

// ==========================================
// SERVICE
// ==========================================

export const pagosService = {
  // Cuentas Bancarias
  cuentasBancarias: {
    async getAll(params?: {
      banco?: string;
      tipoCuenta?: string;
      moneda?: string;
      activo?: boolean;
    }): Promise<{ cuentas: CuentaBancaria[]; total: number }> {
      const response = await apiClient.get<ApiResponse<{ cuentas: CuentaBancaria[]; total: number }>>(
        '/api/cuentas-bancarias',
        { params }
      );
      return response.data.data;
    },

    async getById(id: string): Promise<CuentaBancaria> {
      const response = await apiClient.get<ApiResponse<CuentaBancaria>>(`/api/cuentas-bancarias/${id}`);
      return response.data.data;
    },

    async create(data: CuentaBancariaFormData): Promise<CuentaBancaria> {
      const response = await apiClient.post<ApiResponse<CuentaBancaria>>('/api/cuentas-bancarias', data);
      return response.data.data;
    },

    async update(id: string, data: Partial<CuentaBancariaFormData>): Promise<CuentaBancaria> {
      const response = await apiClient.put<ApiResponse<CuentaBancaria>>(`/api/cuentas-bancarias/${id}`, data);
      return response.data.data;
    },

    async delete(id: string): Promise<void> {
      await apiClient.delete(`/api/cuentas-bancarias/${id}`);
    },

    async getMovimientos(id: string, params?: {
      fechaDesde?: string;
      fechaHasta?: string;
      tipo?: string;
      page?: number;
      limit?: number;
    }): Promise<{
      movimientos: MovimientoBancario[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }> {
      const response = await apiClient.get<ApiResponse<any>>(`/api/cuentas-bancarias/${id}/movimientos`, { params });
      return response.data.data;
    },

    async getChequeras(id: string): Promise<Chequera[]> {
      const response = await apiClient.get<ApiResponse<Chequera[]>>(`/api/cuentas-bancarias/${id}/chequeras`);
      return response.data.data;
    },

    async createChequera(id: string, data: ChequeraFormData): Promise<Chequera> {
      const response = await apiClient.post<ApiResponse<Chequera>>(`/api/cuentas-bancarias/${id}/chequeras`, data);
      return response.data.data;
    },
  },

  // Ordenes de Compra
  ordenesCompra: {
    async getAll(params?: {
      estado?: string;
      proveedorId?: string;
      fechaDesde?: string;
      fechaHasta?: string;
      page?: number;
      limit?: number;
    }): Promise<{
      ordenes: OrdenCompra[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }> {
      const response = await apiClient.get<ApiResponse<any>>('/api/ordenes-compra', { params });
      return response.data.data;
    },

    async getById(id: string): Promise<OrdenCompra> {
      const response = await apiClient.get<ApiResponse<OrdenCompra>>(`/api/ordenes-compra/${id}`);
      return response.data.data;
    },

    async create(data: OrdenCompraFormData): Promise<OrdenCompra> {
      const response = await apiClient.post<ApiResponse<OrdenCompra>>('/api/ordenes-compra', data);
      return response.data.data;
    },

    async update(id: string, data: Partial<OrdenCompraFormData>): Promise<OrdenCompra> {
      const response = await apiClient.put<ApiResponse<OrdenCompra>>(`/api/ordenes-compra/${id}`, data);
      return response.data.data;
    },

    async enviarAprobacion(id: string): Promise<OrdenCompra> {
      const response = await apiClient.put<ApiResponse<OrdenCompra>>(`/api/ordenes-compra/${id}/enviar-aprobacion`);
      return response.data.data;
    },

    async aprobar(id: string, aprobadoPor: string): Promise<OrdenCompra> {
      const response = await apiClient.put<ApiResponse<OrdenCompra>>(`/api/ordenes-compra/${id}/aprobar`, {
        aprobadoPor,
      });
      return response.data.data;
    },

    async rechazar(id: string, motivoRechazo: string): Promise<OrdenCompra> {
      const response = await apiClient.put<ApiResponse<OrdenCompra>>(`/api/ordenes-compra/${id}/rechazar`, {
        motivoRechazo,
      });
      return response.data.data;
    },

    async anular(id: string, motivoAnulacion: string): Promise<OrdenCompra> {
      const response = await apiClient.put<ApiResponse<OrdenCompra>>(`/api/ordenes-compra/${id}/anular`, {
        motivoAnulacion,
      });
      return response.data.data;
    },
  },

  // Facturas de Compra
  facturasCompra: {
    async getAll(params?: {
      tipo?: string;
      estado?: string;
      proveedorId?: string;
      ordenCompraId?: string;
      fechaDesde?: string;
      fechaHasta?: string;
      page?: number;
      limit?: number;
    }): Promise<{
      facturas: FacturaCompra[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }> {
      const response = await apiClient.get<ApiResponse<any>>('/api/facturas-compra', { params });
      return response.data.data;
    },

    async getById(id: string): Promise<FacturaCompra> {
      const response = await apiClient.get<ApiResponse<FacturaCompra>>(`/api/facturas-compra/${id}`);
      return response.data.data;
    },

    async create(data: FacturaCompraFormData): Promise<FacturaCompra> {
      const response = await apiClient.post<ApiResponse<FacturaCompra>>('/api/facturas-compra', data);
      return response.data.data;
    },

    async update(id: string, data: Partial<FacturaCompraFormData>): Promise<FacturaCompra> {
      const response = await apiClient.put<ApiResponse<FacturaCompra>>(`/api/facturas-compra/${id}`, data);
      return response.data.data;
    },

    async marcarPago(id: string, montoPagado: number): Promise<FacturaCompra> {
      const response = await apiClient.put<ApiResponse<FacturaCompra>>(`/api/facturas-compra/${id}/marcar-pago`, {
        montoPagado,
      });
      return response.data.data;
    },

    async anular(id: string, motivoAnulacion: string): Promise<FacturaCompra> {
      const response = await apiClient.put<ApiResponse<FacturaCompra>>(`/api/facturas-compra/${id}/anular`, {
        motivoAnulacion,
      });
      return response.data.data;
    },
  },

  // Ordenes de Pago
  ordenesPago: {
    async getAll(params?: {
      estado?: string;
      metodoPago?: string;
      proveedorId?: string;
      fechaDesde?: string;
      fechaHasta?: string;
      page?: number;
      limit?: number;
    }): Promise<{
      ordenes: OrdenPago[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }> {
      const response = await apiClient.get<ApiResponse<any>>('/api/ordenes-pago', { params });
      return response.data.data;
    },

    async getById(id: string): Promise<OrdenPago> {
      const response = await apiClient.get<ApiResponse<OrdenPago>>(`/api/ordenes-pago/${id}`);
      return response.data.data;
    },

    async create(data: OrdenPagoFormData): Promise<OrdenPago> {
      const response = await apiClient.post<ApiResponse<OrdenPago>>('/api/ordenes-pago', data);
      return response.data.data;
    },

    async update(id: string, data: Partial<OrdenPagoFormData>): Promise<OrdenPago> {
      const response = await apiClient.put<ApiResponse<OrdenPago>>(`/api/ordenes-pago/${id}`, data);
      return response.data.data;
    },

    async enviarAprobacion(id: string): Promise<OrdenPago> {
      const response = await apiClient.put<ApiResponse<OrdenPago>>(`/api/ordenes-pago/${id}/enviar-aprobacion`);
      return response.data.data;
    },

    async aprobar(id: string, aprobadoPor: string): Promise<OrdenPago> {
      const response = await apiClient.put<ApiResponse<OrdenPago>>(`/api/ordenes-pago/${id}/aprobar`, {
        aprobadoPor,
      });
      return response.data.data;
    },

    async rechazar(id: string, motivoRechazo: string): Promise<OrdenPago> {
      const response = await apiClient.put<ApiResponse<OrdenPago>>(`/api/ordenes-pago/${id}/rechazar`, {
        motivoRechazo,
      });
      return response.data.data;
    },

    async marcarPagada(id: string, data: {
      numeroCheque?: string;
      fechaPago?: string;
      observaciones?: string;
    }): Promise<OrdenPago> {
      const response = await apiClient.put<ApiResponse<OrdenPago>>(`/api/ordenes-pago/${id}/marcar-pagada`, data);
      return response.data.data;
    },

    async anular(id: string, motivoAnulacion: string): Promise<OrdenPago> {
      const response = await apiClient.put<ApiResponse<OrdenPago>>(`/api/ordenes-pago/${id}/anular`, {
        motivoAnulacion,
      });
      return response.data.data;
    },
  },
};

export default pagosService;
