import type { Producto } from './producto';
import type { CentroCosto } from './centroCosto';
import type { CodigoMoneda } from './moneda';

// ==========================================
// TIPOS - ORDEN DE COMPRA
// ==========================================
export type EstadoOrdenCompra = 'BORRADOR' | 'APROBADA' | 'PARCIAL' | 'COMPLETADA' | 'ANULADA';

// ==========================================
// ITEM DE ORDEN DE COMPRA (DNIT)
// ==========================================
export interface ItemOrdenCompra {
  id: string;
  ordenCompraId: string;
  lineaNumero: number;

  // Descripción
  descripcion: string;
  cantidad: number;
  unidadMedida: string;
  precioUnitario: number;
  subtotal: number;

  // Producto (opcional)
  productoId?: string;
  producto?: Producto;

  // CAMPOS DNIT - Centro de Costo
  centroCostoId: string;
  centroCosto?: CentroCosto;

  // CAMPOS DNIT - IVA
  tasaIva: number; // 10, 5, 0
  montoIva: number;
  total: number; // subtotal + IVA

  // CAMPOS DNIT - Para inventario futuro
  cantidadControl?: number;
  unidadControl?: string;

  createdAt: string;
  updatedAt: string;
}

// ==========================================
// ORDEN DE COMPRA (DNIT) - MULTIMONEDA
// ==========================================
export interface OrdenCompra {
  id: string;
  tenantId: string;

  // Número de orden
  numero: string;
  fecha: string;

  // Proveedor
  proveedorId: string;
  proveedorNombre?: string;
  proveedorRuc?: string;

  // Estado
  estado: EstadoOrdenCompra; // BORRADOR, APROBADA, PARCIAL, COMPLETADA, ANULADA

  // MULTIMONEDA
  moneda: CodigoMoneda; // Moneda de la orden
  cotizacion: number; // Tasa de cambio a moneda base (PYG)

  // Totales DNIT en moneda original (segregados por tasa de IVA)
  gravado10: number;
  iva10: number;
  gravado5: number;
  iva5: number;
  exentas: number;
  totalOrden: number;

  // Totales convertidos a moneda base (PYG)
  gravado10Base: number;
  iva10Base: number;
  gravado5Base: number;
  iva5Base: number;
  exentasBase: number;
  totalOrdenBase: number;

  // Descripción
  descripcion?: string;
  observaciones?: string;

  // Auditoría
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  aprobadoPor?: string;
  fechaAprobacion?: string;

  // Items
  items: ItemOrdenCompra[];
}

// ==========================================
// INPUT PARA CREAR ITEM
// ==========================================
export interface CreateItemOrdenCompraInput {
  lineaNumero: number;
  descripcion: string;
  cantidad: number;
  unidadMedida: string;
  precioUnitario: number;

  // Producto (opcional)
  productoId?: string;

  // DNIT - Centro de Costo (REQUERIDO)
  centroCostoId: string;

  // DNIT - IVA
  tasaIva: number; // 10, 5, 0

  // DNIT - Cantidades de control (opcionales)
  cantidadControl?: number;
  unidadControl?: string;
}

// ==========================================
// INPUT PARA CREAR ORDEN DE COMPRA - MULTIMONEDA
// ==========================================
export interface CreateOrdenCompraInput {
  proveedorId: string;
  fecha?: string; // Opcional, por defecto fecha actual
  descripcion?: string;
  observaciones?: string;

  // MULTIMONEDA
  moneda: CodigoMoneda;
  cotizacion: number; // Tasa de cambio a moneda base

  items: CreateItemOrdenCompraInput[];
}

// ==========================================
// INPUT PARA ACTUALIZAR ORDEN DE COMPRA - MULTIMONEDA
// ==========================================
export interface UpdateOrdenCompraInput {
  proveedorId?: string;
  fecha?: string;
  descripcion?: string;
  observaciones?: string;
  estado?: EstadoOrdenCompra;

  // MULTIMONEDA
  moneda?: CodigoMoneda;
  cotizacion?: number;

  items?: CreateItemOrdenCompraInput[];
}

// ==========================================
// FILTROS PARA BÚSQUEDA
// ==========================================
export interface OrdenCompraFilters {
  estado?: EstadoOrdenCompra;
  proveedorId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  search?: string;
}

// ==========================================
// RESUMEN DE TOTALES DNIT
// ==========================================
export interface TotalesDNIT {
  gravado10: number;
  iva10: number;
  gravado5: number;
  iva5: number;
  exentas: number;
  totalGeneral: number;
}
