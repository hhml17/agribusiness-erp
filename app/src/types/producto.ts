import type { CuentaContable } from './cuentaContable';

// ==========================================
// TIPOS DNIT - UNIDADES DE MEDIDA
// ==========================================
export type UnidadCompra = 'GLOBAL' | 'TON' | 'M3' | 'UNIDAD' | 'KG' | 'L';
export type UnidadControl = 'L' | 'KG' | 'CABEZA' | 'UNIDAD';
export type TasaIva = 0 | 5 | 10;
export type TipoArticulo = 'INSUMO' | 'ACTIVO_FIJO' | 'ANIMAL' | 'GASTO_DIRECTO' | 'SERVICIO';
export type MetodoValuacion = 'PROMEDIO' | 'FIFO' | 'IDENTIFICADO';
export type EspecieAnimal = 'BOVINO' | 'EQUINO' | 'OVINO' | 'PORCINO';
export type CategoriaAgricola = 'SEMILLA' | 'FERTILIZANTE' | 'AGROQUIMICO' | 'HERBICIDA';

// ==========================================
// INTERFAZ PRINCIPAL - PRODUCTO DNIT
// ==========================================
export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;

  // LEGACY (deprecated - mantener por compatibilidad)
  unidadMedida?: string;
  precioCompra?: number;
  precioVenta?: number;
  stock?: number;
  stockMinimo?: number;

  // ==========================================
  // CAMPOS DNIT - Datos Financieros
  // ==========================================
  tasaIva: number; // 10.0, 5.0, 0.0
  cuentaIvaId?: string;
  cuentaIva?: CuentaContable;

  // ==========================================
  // CAMPOS DNIT - Tipo de Artículo
  // ==========================================
  tipoArticulo: string; // INSUMO, ACTIVO_FIJO, ANIMAL, GASTO_DIRECTO, SERVICIO

  // ==========================================
  // CAMPOS DNIT - Doble Unidad de Medida
  // ==========================================
  unidadCompra: string; // GLOBAL, TON, M3, UNIDAD, KG, L
  unidadControl?: string; // L, KG, CABEZA, UNIDAD
  factorConversion?: number; // 1 TON = 1000 KG

  // ==========================================
  // CAMPOS DNIT - Control de Inventario
  // ==========================================
  controlaStock: boolean;
  metodoValuacion?: string; // PROMEDIO, FIFO, IDENTIFICADO

  // ==========================================
  // CAMPOS DNIT - Ganadería
  // ==========================================
  esAnimal: boolean;
  especieAnimal?: string; // BOVINO, EQUINO, OVINO, PORCINO

  // ==========================================
  // CAMPOS DNIT - Agricultura
  // ==========================================
  esInsumoAgricola: boolean;
  categoriaAgricola?: string; // SEMILLA, FERTILIZANTE, AGROQUIMICO

  // ==========================================
  // Cuentas Contables
  // ==========================================
  cuentaInventarioId?: string;
  cuentaInventario?: CuentaContable;

  cuentaCostoId?: string;
  cuentaCosto?: CuentaContable;

  cuentaIngresoId?: string;
  cuentaIngreso?: CuentaContable;

  // ==========================================
  // Estado y Auditoría
  // ==========================================
  activo: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// ==========================================
// INPUT PARA CREAR PRODUCTO
// ==========================================
export interface CreateProductoInput {
  // Identificación
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;

  // CAMPOS DNIT - Datos Financieros
  tasaIva: number; // 10.0, 5.0, 0.0
  cuentaIvaId?: string;

  // CAMPOS DNIT - Tipo de Artículo
  tipoArticulo: string; // INSUMO, ACTIVO_FIJO, ANIMAL, GASTO_DIRECTO, SERVICIO

  // CAMPOS DNIT - Doble Unidad de Medida
  unidadCompra: string; // GLOBAL, TON, M3, UNIDAD, KG, L
  unidadControl?: string; // L, KG, CABEZA, UNIDAD
  factorConversion?: number; // 1 TON = 1000 KG

  // CAMPOS DNIT - Control de Inventario
  controlaStock: boolean;
  metodoValuacion?: string; // PROMEDIO, FIFO, IDENTIFICADO

  // CAMPOS DNIT - Ganadería
  esAnimal?: boolean;
  especieAnimal?: string;

  // CAMPOS DNIT - Agricultura
  esInsumoAgricola?: boolean;
  categoriaAgricola?: string;

  // Cuentas Contables
  cuentaInventarioId?: string;
  cuentaCostoId?: string;
  cuentaIngresoId?: string;

  // Stock
  stockMinimo?: number;

  // LEGACY (opcionales para compatibilidad)
  unidadMedida?: string;
  precioCompra?: number;
  precioVenta?: number;
}

// ==========================================
// INPUT PARA ACTUALIZAR PRODUCTO
// ==========================================
export interface UpdateProductoInput {
  nombre?: string;
  descripcion?: string;
  categoria?: string;

  // DNIT
  tasaIva?: number;
  cuentaIvaId?: string;
  tipoArticulo?: string;
  unidadCompra?: string;
  unidadControl?: string;
  factorConversion?: number;
  controlaStock?: boolean;
  metodoValuacion?: string;
  esAnimal?: boolean;
  especieAnimal?: string;
  esInsumoAgricola?: boolean;
  categoriaAgricola?: string;

  // Cuentas
  cuentaInventarioId?: string;
  cuentaCostoId?: string;
  cuentaIngresoId?: string;

  // Stock
  stockMinimo?: number;

  // LEGACY
  unidadMedida?: string;
  precioCompra?: number;
  precioVenta?: number;

  activo?: boolean;
}

// ==========================================
// FILTROS PARA BÚSQUEDA
// ==========================================
export interface ProductoFilters {
  activo?: boolean;
  categoria?: string;
  tipoArticulo?: string;
  esAnimal?: boolean;
  esInsumoAgricola?: boolean;
  controlaStock?: boolean;
  search?: string;
}

// ==========================================
// RESULTADO DE CONVERSIÓN DE UNIDADES
// ==========================================
export interface ConversionUnidadResult {
  cantidadOriginal: number;
  unidadOriginal: string;
  cantidadConvertida: number;
  unidadConvertida: string;
  factorUsado: number;
}
