export interface CuentaContable {
  id: string;
  codigo: string;
  nombre: string;
  tipo: TipoCuenta;
  nivel: number;
  cuentaPadreId: string | null;
  activo: boolean;
  descripcion?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export type TipoCuenta = 'ACTIVO' | 'PASIVO' | 'PATRIMONIO' | 'INGRESO' | 'EGRESO';

export interface CreateCuentaContableInput {
  codigo: string;
  nombre: string;
  tipo: TipoCuenta;
  nivel: number;
  cuentaPadreId?: string;
  descripcion?: string;
}

export interface UpdateCuentaContableInput {
  nombre?: string;
  tipo?: TipoCuenta;
  descripcion?: string;
  activo?: boolean;
}

export interface CuentaContableFilters {
  activo?: boolean;
  tipo?: TipoCuenta;
  nivel?: number;
}
