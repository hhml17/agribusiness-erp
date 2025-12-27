import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==========================================
// INTERFACES - DNIT Compliant
// ==========================================

export interface CreateProductoInput {
  // Identificación
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;

  // CAMPOS DNIT - Datos Financieros
  tasaIva: number; // 10.0, 5.0, 0.0
  cuentaIvaId?: string; // Cuenta IVA Crédito Fiscal

  // CAMPOS DNIT - Tipo de Artículo
  tipoArticulo: string; // INSUMO, ACTIVO_FIJO, ANIMAL, GASTO_DIRECTO, SERVICIO

  // CAMPOS DNIT - Doble Unidad de Medida
  unidadCompra: string; // GLOBAL, TON, M3, UNIDAD, KG, L
  unidadControl?: string; // L, KG, CABEZA, UNIDAD
  factorConversion?: number; // Factor: 1 TON = 1000 KG

  // CAMPOS DNIT - Control de Inventario
  controlaStock: boolean;
  metodoValuacion?: string; // PROMEDIO, FIFO, IDENTIFICADO

  // CAMPOS DNIT - Ganadería
  esAnimal?: boolean;
  especieAnimal?: string; // BOVINO, EQUINO, OVINO, PORCINO

  // CAMPOS DNIT - Agricultura
  esInsumoAgricola?: boolean;
  categoriaAgricola?: string; // SEMILLA, FERTILIZANTE, AGROQUIMICO

  // Cuentas Contables (requeridas)
  cuentaInventarioId?: string;
  cuentaCostoId?: string;
  cuentaIngresoId?: string;

  // Stock
  stockMinimo?: number;

  // LEGACY (opcionales para compatibilidad)
  unidadMedida?: string; // DEPRECATED
  precioCompra?: number; // DEPRECATED
  precioVenta?: number; // DEPRECATED
}

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

export interface ProductoFilters {
  activo?: boolean;
  categoria?: string;
  tipoArticulo?: string;
  esAnimal?: boolean;
  esInsumoAgricola?: boolean;
  controlaStock?: boolean;
  search?: string;
}

export interface ConversionUnidadResult {
  cantidadOriginal: number;
  unidadOriginal: string;
  cantidadConvertida: number;
  unidadConvertida: string;
  factorUsado: number;
}

// ==========================================
// FUNCIONES DE UTILIDAD
// ==========================================

/**
 * Convierte cantidad entre unidad de compra y unidad de control
 */
export function convertirUnidad(
  cantidad: number,
  unidadOrigen: string,
  unidadDestino: string | null,
  factorConversion: number | null
): ConversionUnidadResult | null {
  // Si no hay unidad de destino o son iguales, no hay conversión
  if (!unidadDestino || unidadOrigen === unidadDestino) {
    return {
      cantidadOriginal: cantidad,
      unidadOriginal: unidadOrigen,
      cantidadConvertida: cantidad,
      unidadConvertida: unidadOrigen,
      factorUsado: 1
    };
  }

  // Validar que exista factor de conversión
  if (!factorConversion || factorConversion <= 0) {
    throw new Error('Factor de conversión no definido o inválido');
  }

  const cantidadConvertida = cantidad * factorConversion;

  return {
    cantidadOriginal: cantidad,
    unidadOriginal: unidadOrigen,
    cantidadConvertida,
    unidadConvertida: unidadDestino,
    factorUsado: factorConversion
  };
}

/**
 * Valida tasa de IVA según normativa DNIT Paraguay
 */
function validarTasaIva(tasa: number): void {
  const tasasValidas = [0, 5, 10];
  if (!tasasValidas.includes(tasa)) {
    throw new Error('Tasa de IVA inválida. Valores permitidos: 0 (Exenta), 5, 10');
  }
}

/**
 * Valida tipo de artículo según DNIT
 */
function validarTipoArticulo(tipo: string): void {
  const tiposValidos = ['INSUMO', 'ACTIVO_FIJO', 'ANIMAL', 'GASTO_DIRECTO', 'SERVICIO'];
  if (!tiposValidos.includes(tipo)) {
    throw new Error(`Tipo de artículo inválido. Valores permitidos: ${tiposValidos.join(', ')}`);
  }
}

/**
 * Valida que una cuenta contable sea válida para asignar a productos
 */
async function validateCuentaContable(
  cuentaId: string,
  tenantId: string,
  tipoEsperado: string,
  nombreCampo: string
) {
  const cuenta = await prisma.planCuentas.findFirst({
    where: { id: cuentaId, tenantId }
  });

  if (!cuenta) {
    throw new Error(`${nombreCampo}: Cuenta contable no encontrada`);
  }

  if (!cuenta.activo) {
    throw new Error(`${nombreCampo}: La cuenta contable está inactiva`);
  }

  if (!cuenta.aceptaMovimiento) {
    throw new Error(`${nombreCampo}: La cuenta contable no acepta movimientos (es cuenta de grupo)`);
  }

  if (cuenta.nivel < 4) {
    throw new Error(`${nombreCampo}: Solo se pueden asignar cuentas de nivel 4 o superior. Esta cuenta es de nivel ${cuenta.nivel}`);
  }

  if (cuenta.tipo !== tipoEsperado) {
    throw new Error(`${nombreCampo}: La cuenta debe ser de tipo ${tipoEsperado}, pero es ${cuenta.tipo}`);
  }

  return cuenta;
}

// ==========================================
// SERVICIO DE PRODUCTOS
// ==========================================

export const productoService = {
  /**
   * Obtiene todos los productos con filtros
   */
  async getAll(tenantId: string, filters?: ProductoFilters) {
    const where: any = { tenantId };

    if (filters?.activo !== undefined) {
      where.activo = filters.activo;
    }

    if (filters?.categoria) {
      where.categoria = filters.categoria;
    }

    if (filters?.tipoArticulo) {
      where.tipoArticulo = filters.tipoArticulo;
    }

    if (filters?.esAnimal !== undefined) {
      where.esAnimal = filters.esAnimal;
    }

    if (filters?.esInsumoAgricola !== undefined) {
      where.esInsumoAgricola = filters.esInsumoAgricola;
    }

    if (filters?.controlaStock !== undefined) {
      where.controlaStock = filters.controlaStock;
    }

    if (filters?.search) {
      where.OR = [
        { codigo: { contains: filters.search } },
        { nombre: { contains: filters.search } },
        { descripcion: { contains: filters.search } }
      ];
    }

    return await prisma.producto.findMany({
      where,
      include: {
        cuentaInventario: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            tipo: true
          }
        },
        cuentaCosto: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            tipo: true
          }
        },
        cuentaIngreso: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            tipo: true
          }
        },
        cuentaIva: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            tipo: true
          }
        }
      },
      orderBy: { codigo: 'asc' }
    });
  },

  /**
   * Obtiene un producto por ID
   */
  async getById(id: string, tenantId: string) {
    const producto = await prisma.producto.findFirst({
      where: { id, tenantId },
      include: {
        cuentaInventario: true,
        cuentaCosto: true,
        cuentaIngreso: true,
        cuentaIva: true
      }
    });

    if (!producto) {
      throw new Error('Producto no encontrado');
    }

    return producto;
  },

  /**
   * Crea un nuevo producto con validaciones DNIT
   */
  async create(tenantId: string, data: CreateProductoInput, createdBy?: string) {
    // Validar código único
    const existing = await prisma.producto.findFirst({
      where: { tenantId, codigo: data.codigo }
    });

    if (existing) {
      throw new Error('Ya existe un producto con este código');
    }

    // Validaciones DNIT
    validarTasaIva(data.tasaIva);
    validarTipoArticulo(data.tipoArticulo);

    // Validar que si tiene factor de conversión, tenga unidad de control
    if (data.factorConversion && !data.unidadControl) {
      throw new Error('Si define factor de conversión, debe especificar unidad de control');
    }

    if (data.unidadControl && !data.factorConversion) {
      throw new Error('Si define unidad de control, debe especificar factor de conversión');
    }

    // Validar cuentas contables si se proporcionan
    if (data.cuentaInventarioId) {
      await validateCuentaContable(
        data.cuentaInventarioId,
        tenantId,
        'ACTIVO',
        'Cuenta de Inventario'
      );
    }

    if (data.cuentaCostoId) {
      await validateCuentaContable(
        data.cuentaCostoId,
        tenantId,
        'GASTO',
        'Cuenta de Costo'
      );
    }

    if (data.cuentaIngresoId) {
      await validateCuentaContable(
        data.cuentaIngresoId,
        tenantId,
        'INGRESO',
        'Cuenta de Ingreso'
      );
    }

    if (data.cuentaIvaId) {
      await validateCuentaContable(
        data.cuentaIvaId,
        tenantId,
        'ACTIVO',
        'Cuenta IVA Crédito Fiscal'
      );
    }

    return await prisma.producto.create({
      data: {
        tenantId,
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        categoria: data.categoria,

        // DNIT
        tasaIva: data.tasaIva,
        cuentaIvaId: data.cuentaIvaId,
        tipoArticulo: data.tipoArticulo,
        unidadCompra: data.unidadCompra,
        unidadControl: data.unidadControl,
        factorConversion: data.factorConversion,
        controlaStock: data.controlaStock,
        metodoValuacion: data.metodoValuacion,
        esAnimal: data.esAnimal || false,
        especieAnimal: data.especieAnimal,
        esInsumoAgricola: data.esInsumoAgricola || false,
        categoriaAgricola: data.categoriaAgricola,

        // Cuentas
        cuentaInventarioId: data.cuentaInventarioId,
        cuentaCostoId: data.cuentaCostoId,
        cuentaIngresoId: data.cuentaIngresoId,

        // Stock
        stockMinimo: data.stockMinimo,

        // LEGACY (compatibilidad)
        unidadMedida: data.unidadMedida || data.unidadCompra,
        precioCompra: data.precioCompra,
        precioVenta: data.precioVenta,

        // Auditoría
        createdBy
      },
      include: {
        cuentaInventario: true,
        cuentaCosto: true,
        cuentaIngreso: true,
        cuentaIva: true
      }
    });
  },

  /**
   * Actualiza un producto existente
   */
  async update(id: string, tenantId: string, data: UpdateProductoInput, updatedBy?: string) {
    const producto = await prisma.producto.findFirst({
      where: { id, tenantId }
    });

    if (!producto) {
      throw new Error('Producto no encontrado');
    }

    // Validaciones DNIT si se están actualizando
    if (data.tasaIva !== undefined) {
      validarTasaIva(data.tasaIva);
    }

    if (data.tipoArticulo) {
      validarTipoArticulo(data.tipoArticulo);
    }

    // Validar cuentas contables si se están actualizando
    if (data.cuentaInventarioId) {
      await validateCuentaContable(
        data.cuentaInventarioId,
        tenantId,
        'ACTIVO',
        'Cuenta de Inventario'
      );
    }

    if (data.cuentaCostoId) {
      await validateCuentaContable(
        data.cuentaCostoId,
        tenantId,
        'GASTO',
        'Cuenta de Costo'
      );
    }

    if (data.cuentaIngresoId) {
      await validateCuentaContable(
        data.cuentaIngresoId,
        tenantId,
        'INGRESO',
        'Cuenta de Ingreso'
      );
    }

    if (data.cuentaIvaId) {
      await validateCuentaContable(
        data.cuentaIvaId,
        tenantId,
        'ACTIVO',
        'Cuenta IVA Crédito Fiscal'
      );
    }

    return await prisma.producto.update({
      where: { id },
      data: {
        ...data,
        updatedBy
      },
      include: {
        cuentaInventario: true,
        cuentaCosto: true,
        cuentaIngreso: true,
        cuentaIva: true
      }
    });
  },

  /**
   * Desactiva un producto (soft delete)
   */
  async delete(id: string, tenantId: string) {
    const producto = await prisma.producto.findFirst({
      where: { id, tenantId },
      include: {
        ventaItems: true,
        compraItems: true
      }
    });

    if (!producto) {
      throw new Error('Producto no encontrado');
    }

    // Validar que no tenga movimientos
    if (producto.ventaItems.length > 0 || producto.compraItems.length > 0) {
      throw new Error('No se puede desactivar un producto con movimientos registrados');
    }

    // Soft delete
    return await prisma.producto.update({
      where: { id },
      data: { activo: false }
    });
  },

  /**
   * Convierte cantidad de unidad de compra a unidad de control
   */
  convertirCantidad(
    productoId: string,
    cantidad: number,
    producto?: any
  ): Promise<ConversionUnidadResult | null> {
    if (producto) {
      return Promise.resolve(
        convertirUnidad(
          cantidad,
          producto.unidadCompra,
          producto.unidadControl,
          producto.factorConversion
        )
      );
    }

    // Si no se pasa el producto, buscarlo
    return prisma.producto.findUnique({ where: { id: productoId } }).then(p => {
      if (!p) throw new Error('Producto no encontrado');
      return convertirUnidad(
        cantidad,
        p.unidadCompra,
        p.unidadControl,
        p.factorConversion
      );
    });
  }
};
