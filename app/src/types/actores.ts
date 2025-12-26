// ==========================================
// Actor Types
// ==========================================

export type TipoPersona = 'FISICA' | 'JURIDICA';
export type TipoDocumento = 'RUC' | 'CI' | 'PASAPORTE' | 'OTRO';
export type EstadoCivil = 'SOLTERO' | 'CASADO' | 'DIVORCIADO' | 'VIUDO';
export type RolActor = 'CLIENTE' | 'PROVEEDOR' | 'ASOCIADO';
export type Moneda = 'USD' | 'PYG';

export interface PlanCuentas {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  naturaleza: string;
}

export interface ActorCuentaContable {
  id: string;
  actorId: string;
  rol: RolActor;
  moneda: Moneda;
  cuentaContableId: string;
  cuentaContable?: PlanCuentas;
  descripcion?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Actor {
  id: string;
  tenantId: string;
  tipoPersona: TipoPersona;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  dv?: string;
  nombre: string;
  nombreFantasia: string;

  // Datos persona física
  apellido?: string;
  fechaNacimiento?: string;
  estadoCivil?: EstadoCivil;

  // Datos persona jurídica
  razonSocial?: string;
  fechaConstitucion?: string;
  representanteLegal?: string;

  // Contacto
  email?: string;
  telefono?: string;
  celular?: string;
  direccion?: string;
  ciudad?: string;
  departamento?: string;
  pais: string;

  // Roles
  esCliente: boolean;
  esProveedor: boolean;
  esAsociado: boolean;

  // Estado
  activo: boolean;
  createdAt: string;
  updatedAt: string;

  // Auditoría
  createdBy?: string;
  updatedBy?: string;

  // Relations
  cuentasContablesPorRol?: ActorCuentaContable[];
}

export interface CreateActorInput {
  tipoPersona: TipoPersona;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  dv?: string;
  nombre: string;
  nombreFantasia: string;

  // Datos persona física
  apellido?: string;
  fechaNacimiento?: string;
  estadoCivil?: EstadoCivil;

  // Datos persona jurídica
  razonSocial?: string;
  fechaConstitucion?: string;
  representanteLegal?: string;

  // Contacto
  email?: string;
  telefono?: string;
  celular?: string;
  direccion?: string;
  ciudad?: string;
  departamento?: string;
  pais?: string;

  // Roles
  esCliente?: boolean;
  esProveedor?: boolean;
  esAsociado?: boolean;
}

export interface UpdateActorInput extends Partial<CreateActorInput> {
  activo?: boolean;
}

export interface ActorFilters {
  tipoPersona?: TipoPersona;
  esCliente?: boolean;
  esProveedor?: boolean;
  esAsociado?: boolean;
  activo?: boolean;
}

export interface CreateActorCuentaInput {
  rol: RolActor;
  moneda: Moneda;
  cuentaContableId: string;
  descripcion?: string;
}

// ==========================================
// Estancia Types
// ==========================================

export type TipoPropiedad = 'PROPIA' | 'ALQUILADA' | 'COMPARTIDA';

export interface CentroCosto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo?: string;
}

export interface Estancia {
  id: string;
  tenantId: string;
  centroCostoId: string;
  centroCosto?: CentroCosto;
  codigo: string;
  nombre: string;
  descripcion?: string;

  // Ubicación
  direccion?: string;
  ciudad?: string;
  departamento?: string;
  pais: string;

  // Datos técnicos
  superficie?: number;
  superficieUtil?: number;
  capacidadUA?: number;
  tipoPropiedad: TipoPropiedad;

  // Datos de alquiler
  costoAlquiler?: number;
  monedaAlquiler?: Moneda;
  fechaVencimiento?: string;

  // Responsable
  responsable?: string;
  telefono?: string;
  email?: string;

  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEstanciaInput {
  centroCostoId: string;
  codigo: string;
  nombre: string;
  descripcion?: string;

  // Ubicación
  direccion?: string;
  ciudad?: string;
  departamento?: string;
  pais?: string;

  // Datos técnicos
  superficie?: number;
  superficieUtil?: number;
  capacidadUA?: number;
  tipoPropiedad: TipoPropiedad;

  // Datos de alquiler
  costoAlquiler?: number;
  monedaAlquiler?: Moneda;
  fechaVencimiento?: string;

  // Responsable
  responsable?: string;
  telefono?: string;
  email?: string;
}

export interface UpdateEstanciaInput extends Partial<CreateEstanciaInput> {
  activo?: boolean;
}

export interface EstanciaFilters {
  centroCostoId?: string;
  activo?: boolean;
}

// ==========================================
// Talonario Types
// ==========================================

export type TipoComprobante = 'FACTURA' | 'NOTA_CREDITO' | 'NOTA_DEBITO' | 'AUTOFACTURA';

export interface Talonario {
  id: string;
  tenantId: string;
  tipoComprobante: TipoComprobante;
  numeroTimbrado: string;
  fechaVigenciaDesde: string;
  fechaVigenciaHasta: string;
  establecimiento: string;
  puntoVenta: string;
  numeroInicial: number;
  numeroFinal: number;
  siguienteNumero: number;
  descripcion?: string;
  observaciones?: string;
  activo: boolean;
  agotado: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTalonarioInput {
  tipoComprobante: TipoComprobante;
  numeroTimbrado: string;
  fechaVigenciaDesde: string;
  fechaVigenciaHasta: string;
  establecimiento: string;
  puntoVenta: string;
  numeroInicial: number;
  numeroFinal: number;
  descripcion?: string;
  observaciones?: string;
}

export interface UpdateTalonarioInput extends Partial<CreateTalonarioInput> {
  siguienteNumero?: number;
  activo?: boolean;
  agotado?: boolean;
}

export interface TalonarioFilters {
  tipoComprobante?: TipoComprobante;
  activo?: boolean;
}

// ==========================================
// Factura Emitida Types
// ==========================================

export type EstadoFactura = 'EMITIDA' | 'ANULADA' | 'NOTA_CREDITO_APLICADA';
export type CondicionVenta = 'CONTADO' | 'CREDITO';

export interface FacturaEmitida {
  id: string;
  tenantId: string;
  talonarioId: string;
  talonario?: {
    numeroTimbrado: string;
    tipoComprobante: string;
  };
  establecimiento: string;
  puntoVenta: string;
  numeroFactura: number;
  numeroCompleto: string;
  tipoComprobante: TipoComprobante;

  // Cliente
  actorId?: string;
  nombreCliente: string;
  rucCliente?: string;
  direccionCliente?: string;

  // Fechas
  fecha: string;
  fechaVencimiento?: string;

  // Condición de venta
  condicionVenta: CondicionVenta;

  // Importes
  subtotal: number;
  iva10: number;
  iva5: number;
  exentas: number;
  total: number;

  // Moneda
  moneda: Moneda;

  // Estado
  estado: EstadoFactura;
  fechaAnulacion?: string;
  motivoAnulacion?: string;

  // Observaciones
  descripcion?: string;
  observaciones?: string;

  createdAt: string;
  updatedAt: string;
}

export interface CreateFacturaEmitidaInput {
  talonarioId: string;
  tipoComprobante: TipoComprobante;
  actorId?: string;
  nombreCliente: string;
  rucCliente?: string;
  direccionCliente?: string;
  fecha: string;
  fechaVencimiento?: string;
  condicionVenta: CondicionVenta;
  subtotal: number;
  iva10?: number;
  iva5?: number;
  exentas?: number;
  total: number;
  moneda: Moneda;
  descripcion?: string;
  observaciones?: string;
}

export interface AnularFacturaInput {
  motivoAnulacion: string;
}

export interface FacturaEmitidaFilters {
  estado?: EstadoFactura;
  talonarioId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}
