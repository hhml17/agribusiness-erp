// ==========================================
// PLAN DE CUENTAS
// ==========================================

export interface PlanCuentas {
  id: string;
  tenantId: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: TipoCuenta;
  naturaleza: Naturaleza;
  nivel: number;
  cuentaPadreId?: string;
  cuentaPadre?: PlanCuentasBasic;
  centroCostoId?: string;
  centroCosto?: CentroCosto;
  subCentro?: string;
  tipoGasto?: TipoGasto;
  variabilidad?: Variabilidad;
  aceptaMovimiento: boolean;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  cuentasHijas?: PlanCuentasBasic[];
}

export interface PlanCuentasBasic {
  id: string;
  codigo: string;
  nombre: string;
  tipo?: TipoCuenta;
  nivel?: number;
  aceptaMovimiento?: boolean;
  activo?: boolean;
}

export type TipoCuenta = 'ACTIVO' | 'PASIVO' | 'PATRIMONIO' | 'INGRESO' | 'GASTO';
export type Naturaleza = 'DEUDORA' | 'ACREEDORA';
export type TipoGasto = 'COSTO' | 'INVERSION';
export type Variabilidad = 'FIJO' | 'VARIABLE';

// ==========================================
// CENTROS DE COSTO
// ==========================================

export interface CentroCosto {
  id: string;
  tenantId: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo?: TipoCentroCosto;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  cuentas?: PlanCuentasBasic[];
}

export type TipoCentroCosto = 'OPERATIVO' | 'ADMINISTRATIVO' | 'PRODUCCION';

// ==========================================
// ASIENTOS CONTABLES
// ==========================================

export interface AsientoContable {
  id: string;
  tenantId: string;
  numero: number;
  fecha: string;
  descripcion: string;
  tipo: TipoAsiento;
  estado: EstadoAsiento;
  documentoRef?: string;
  tipoDoc?: TipoDocumento;
  contabilizadoPor?: string;
  fechaContabilizado?: string;
  anuladoPor?: string;
  fechaAnulado?: string;
  motivoAnulacion?: string;
  createdAt: string;
  updatedAt: string;
  lineas: LineaAsiento[];
  totalDebe?: number;
  totalHaber?: number;
  diferencia?: number;
  balanceado?: boolean;
}

export interface LineaAsiento {
  id: string;
  asientoId: string;
  cuentaId: string;
  cuenta: PlanCuentasBasic;
  centroCostoId?: string;
  centroCosto?: CentroCosto;
  debe: number;
  haber: number;
  descripcion?: string;
  documentoRef?: string;
  createdAt: string;
  updatedAt: string;
}

export type TipoAsiento = 'DIARIO' | 'AJUSTE' | 'CIERRE' | 'APERTURA';
export type EstadoAsiento = 'BORRADOR' | 'CONTABILIZADO' | 'ANULADO';
export type TipoDocumento = 'FACTURA_COMPRA' | 'FACTURA_VENTA' | 'PAGO' | 'COBRO';

// ==========================================
// REPORTES
// ==========================================

export interface BalanceGeneral {
  fecha: string | Date;
  activos: CuentaConSaldo[];
  pasivos: CuentaConSaldo[];
  patrimonio: CuentaConSaldo[];
  totalActivos: number;
  totalPasivos: number;
  totalPatrimonio: number;
}

export interface EstadoResultados {
  fechaDesde: string | Date;
  fechaHasta: string | Date;
  ingresos: Array<{
    id: string;
    codigo: string;
    nombre: string;
    tipo: string;
    nivel: number;
    centroCosto?: string;
    tipoGasto?: string;
    variabilidad?: string;
    total: number;
    debe: number;
    haber: number;
  }>;
  gastos: Array<{
    id: string;
    codigo: string;
    nombre: string;
    tipo: string;
    nivel: number;
    centroCosto?: string;
    tipoGasto?: string;
    variabilidad?: string;
    total: number;
    debe: number;
    haber: number;
  }>;
  totalIngresos: number;
  totalGastos: number;
  utilidadNeta: number;
}

export interface LibroMayor {
  cuenta: {
    id: string;
    codigo: string;
    nombre: string;
    tipo: TipoCuenta;
    naturaleza: Naturaleza;
  };
  periodo: {
    desde: string;
    hasta: string;
  };
  movimientos: MovimientoMayor[];
  totales: {
    debe: number;
    haber: number;
    saldoFinal: number;
  };
}

export interface MovimientoMayor {
  fecha: string;
  asientoNumero: number;
  asientoId: string;
  descripcion: string;
  documentoRef?: string;
  centroCosto?: {
    codigo: string;
    nombre: string;
  };
  debe: number;
  haber: number;
  saldo: number;
}

export interface CuentaConSaldo {
  id: string;
  codigo: string;
  nombre: string;
  tipo: TipoCuenta;
  naturaleza: Naturaleza;
  nivel: number;
  cuentaPadreId?: string;
  debe: number;
  haber: number;
  saldo: number;
}

// ==========================================
// API RESPONSES
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==========================================
// FORM DATA
// ==========================================

export interface PlanCuentasFormData {
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: TipoCuenta;
  naturaleza: Naturaleza;
  nivel: number;
  cuentaPadreId?: string;
  centroCostoId?: string;
  subCentro?: string;
  tipoGasto?: TipoGasto;
  variabilidad?: Variabilidad;
  aceptaMovimiento?: boolean;
  activo?: boolean;
}

export interface CentroCostoFormData {
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo?: TipoCentroCosto;
  activo?: boolean;
}

export interface AsientoFormData {
  fecha: string;
  descripcion: string;
  tipo: TipoAsiento;
  estado?: EstadoAsiento;
  documentoRef?: string;
  tipoDoc?: TipoDocumento;
  lineas: LineaAsientoFormData[];
}

export interface LineaAsientoFormData {
  cuentaId: string;
  centroCostoId?: string;
  debe: number;
  haber: number;
  descripcion?: string;
  documentoRef?: string;
}
