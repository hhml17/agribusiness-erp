/**
 * Sistema de Monedas y Cotizaciones - DNIT Paraguay
 */

// ==========================================
// TIPOS DE MONEDA
// ==========================================
export type CodigoMoneda = 'PYG' | 'USD' | 'BRL' | 'ARS' | 'EUR';

export interface Moneda {
  id: string;
  codigo: CodigoMoneda;
  nombre: string;
  simbolo: string;
  decimales: number;
  esMonedaBase: boolean;
  activa: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// COTIZACIONES
// ==========================================
export interface Cotizacion {
  id: string;
  tenantId: string;
  monedaOrigenId: string;
  monedaDestinoId: string;
  fecha: string;
  tasaCompra: number;
  tasaVenta: number;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;

  // Relaciones
  monedaOrigen?: Moneda;
  monedaDestino?: Moneda;
}

// ==========================================
// INPUT PARA CREAR COTIZACIÓN
// ==========================================
export interface CreateCotizacionInput {
  monedaOrigenId: string;
  monedaDestinoId: string;
  fecha: string;
  tasaCompra: number;
  tasaVenta: number;
  observaciones?: string;
}

// ==========================================
// INPUT PARA ACTUALIZAR COTIZACIÓN
// ==========================================
export interface UpdateCotizacionInput {
  tasaCompra?: number;
  tasaVenta?: number;
  observaciones?: string;
}

// ==========================================
// FILTROS PARA BÚSQUEDA
// ==========================================
export interface CotizacionFilters {
  monedaOrigenId?: string;
  monedaDestinoId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

// ==========================================
// HELPERS
// ==========================================
export const MONEDAS_DISPONIBLES: Moneda[] = [
  {
    id: 'pyg',
    codigo: 'PYG',
    nombre: 'Guaraní Paraguayo',
    simbolo: '₲',
    decimales: 0,
    esMonedaBase: true,
    activa: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'usd',
    codigo: 'USD',
    nombre: 'Dólar Estadounidense',
    simbolo: '$',
    decimales: 2,
    esMonedaBase: false,
    activa: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'brl',
    codigo: 'BRL',
    nombre: 'Real Brasileño',
    simbolo: 'R$',
    decimales: 2,
    esMonedaBase: false,
    activa: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ars',
    codigo: 'ARS',
    nombre: 'Peso Argentino',
    simbolo: '$',
    decimales: 2,
    esMonedaBase: false,
    activa: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'eur',
    codigo: 'EUR',
    nombre: 'Euro',
    simbolo: '€',
    decimales: 2,
    esMonedaBase: false,
    activa: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Obtiene la moneda base del sistema (PYG)
 */
export const getMonedaBase = (): Moneda => {
  return MONEDAS_DISPONIBLES.find(m => m.esMonedaBase) || MONEDAS_DISPONIBLES[0];
};

/**
 * Formatea un monto según la moneda
 */
export const formatCurrency = (monto: number, moneda: CodigoMoneda | Moneda): string => {
  const monedaObj = typeof moneda === 'string'
    ? MONEDAS_DISPONIBLES.find(m => m.codigo === moneda)
    : moneda;

  if (!monedaObj) return monto.toString();

  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: monedaObj.codigo,
    minimumFractionDigits: monedaObj.decimales,
    maximumFractionDigits: monedaObj.decimales,
  }).format(monto);
};

/**
 * Convierte un monto de una moneda a otra usando la tasa
 */
export const convertirMoneda = (
  monto: number,
  tasaCambio: number,
  tipo: 'compra' | 'venta' = 'compra'
): number => {
  return monto * tasaCambio;
};
