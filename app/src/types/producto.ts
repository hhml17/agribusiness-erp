import type { CuentaContable } from './cuentaContable';

export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  unidadMedida?: string;
  precio?: number;

  // Cuentas contables requeridas
  cuentaInventarioId: string;
  cuentaCostoId: string;
  cuentaIngresoId: string;

  // Relaciones con cuentas
  cuentaInventario?: CuentaContable;
  cuentaCosto?: CuentaContable;
  cuentaIngreso?: CuentaContable;

  activo: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductoInput {
  codigo: string;
  nombre: string;
  descripcion?: string;
  unidadMedida?: string;
  precio?: number;
  cuentaInventarioId: string;
  cuentaCostoId: string;
  cuentaIngresoId: string;
}

export interface UpdateProductoInput {
  nombre?: string;
  descripcion?: string;
  unidadMedida?: string;
  precio?: number;
  cuentaInventarioId?: string;
  cuentaCostoId?: string;
  cuentaIngresoId?: string;
  activo?: boolean;
}

export interface ProductoFilters {
  activo?: boolean;
  search?: string;
}
