import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateProductoInput {
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  unidadMedida: string;
  precioCompra: number;
  precioVenta: number;
  stockMinimo?: number;
  cuentaInventarioId: string;
  cuentaCostoId: string;
  cuentaIngresoId: string;
}

export interface UpdateProductoInput {
  nombre?: string;
  descripcion?: string;
  categoria?: string;
  unidadMedida?: string;
  precioCompra?: number;
  precioVenta?: number;
  stockMinimo?: number;
  cuentaInventarioId?: string;
  cuentaCostoId?: string;
  cuentaIngresoId?: string;
  activo?: boolean;
}

export interface ProductoFilters {
  activo?: boolean;
  categoria?: string;
  search?: string;
}

/**
 * Valida que una cuenta contable sea válida para asignar a productos
 * Según estándar contable:
 * - Nivel 1: Tipo de cuenta (ACTIVO, PASIVO, PATRIMONIO, INGRESO, EGRESO)
 * - Nivel 2: Clasificación (Corriente, No Corriente, etc.)
 * - Nivel 3: Grupo (Disponibilidades, Inversiones, etc.)
 * - Nivel 4: Cuenta de detalle (CAJA, BANCOS, etc.) - SOLO ESTAS ACEPTAN MOVIMIENTOS
 *
 * Validaciones:
 * - Debe estar activa
 * - Debe aceptar movimientos
 * - Debe ser nivel >= 4 (solo cuentas de mayor detalle)
 * - Debe ser del tipo correcto según el uso
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
    throw new Error(`${nombreCampo}: Solo se pueden asignar cuentas de nivel 4 o superior (cuentas de detalle). Esta cuenta es de nivel ${cuenta.nivel}`);
  }

  if (cuenta.tipo !== tipoEsperado) {
    throw new Error(`${nombreCampo}: La cuenta debe ser de tipo ${tipoEsperado}, pero es ${cuenta.tipo}`);
  }

  return cuenta;
}

export const productoService = {
  async getAll(tenantId: string, filters?: ProductoFilters) {
    const where: any = { tenantId };

    if (filters?.activo !== undefined) {
      where.activo = filters.activo;
    }

    if (filters?.categoria) {
      where.categoria = filters.categoria;
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
        }
      },
      orderBy: { codigo: 'asc' }
    });
  },

  async getById(id: string, tenantId: string) {
    const producto = await prisma.producto.findFirst({
      where: { id, tenantId },
      include: {
        cuentaInventario: true,
        cuentaCosto: true,
        cuentaIngreso: true
      }
    });

    if (!producto) {
      throw new Error('Producto no encontrado');
    }

    return producto;
  },

  async create(tenantId: string, data: CreateProductoInput) {
    // Validar código único
    const existing = await prisma.producto.findFirst({
      where: { tenantId, codigo: data.codigo }
    });

    if (existing) {
      throw new Error('Ya existe un producto con este código');
    }

    // Validar cuentas contables
    await validateCuentaContable(
      data.cuentaInventarioId,
      tenantId,
      'ACTIVO',
      'Cuenta de Inventario'
    );

    await validateCuentaContable(
      data.cuentaCostoId,
      tenantId,
      'EGRESO',
      'Cuenta de Costo'
    );

    await validateCuentaContable(
      data.cuentaIngresoId,
      tenantId,
      'INGRESO',
      'Cuenta de Ingreso'
    );

    return await prisma.producto.create({
      data: {
        tenantId,
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        categoria: data.categoria,
        unidadMedida: data.unidadMedida,
        precioCompra: data.precioCompra,
        precioVenta: data.precioVenta,
        stockMinimo: data.stockMinimo,
        cuentaInventarioId: data.cuentaInventarioId,
        cuentaCostoId: data.cuentaCostoId,
        cuentaIngresoId: data.cuentaIngresoId
      },
      include: {
        cuentaInventario: true,
        cuentaCosto: true,
        cuentaIngreso: true
      }
    });
  },

  async update(id: string, tenantId: string, data: UpdateProductoInput) {
    const producto = await prisma.producto.findFirst({
      where: { id, tenantId }
    });

    if (!producto) {
      throw new Error('Producto no encontrado');
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
        'EGRESO',
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

    return await prisma.producto.update({
      where: { id },
      data,
      include: {
        cuentaInventario: true,
        cuentaCosto: true,
        cuentaIngreso: true
      }
    });
  },

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
  }
};
