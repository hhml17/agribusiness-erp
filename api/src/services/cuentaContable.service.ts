import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateCuentaContableInput {
  codigo: string;
  nombre: string;
  tipo: string;
  nivel: number;
  cuentaPadreId?: string;
  descripcion?: string;
  naturaleza?: string;
  centroCostoId?: string;
  subCentro?: string;
  tipoGasto?: string;
  variabilidad?: string;
  aceptaMovimiento?: boolean;
}

export interface UpdateCuentaContableInput {
  nombre?: string;
  tipo?: string;
  descripcion?: string;
  naturaleza?: string;
  centroCostoId?: string;
  subCentro?: string;
  tipoGasto?: string;
  variabilidad?: string;
  aceptaMovimiento?: boolean;
  activo?: boolean;
}

export interface CuentaContableFilters {
  activo?: boolean;
  tipo?: string;
  nivel?: number;
}

export const cuentaContableService = {
  async getAll(tenantId: string, filters?: CuentaContableFilters) {
    const where: any = { tenantId };

    if (filters?.activo !== undefined) {
      where.activo = filters.activo;
    }

    if (filters?.tipo) {
      where.tipo = filters.tipo;
    }

    if (filters?.nivel !== undefined) {
      where.nivel = filters.nivel;
    }

    return await prisma.planCuentas.findMany({
      where,
      orderBy: [
        { codigo: 'asc' }
      ],
      include: {
        cuentaPadre: {
          select: {
            id: true,
            codigo: true,
            nombre: true
          }
        },
        centroCosto: {
          select: {
            id: true,
            codigo: true,
            nombre: true
          }
        }
      }
    });
  },

  async getById(id: string, tenantId: string) {
    const cuenta = await prisma.planCuentas.findFirst({
      where: { id, tenantId },
      include: {
        cuentaPadre: {
          select: {
            id: true,
            codigo: true,
            nombre: true
          }
        },
        centroCosto: {
          select: {
            id: true,
            codigo: true,
            nombre: true
          }
        },
        cuentasHijas: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            activo: true
          }
        }
      }
    });

    if (!cuenta) {
      throw new Error('Cuenta contable no encontrada');
    }

    return cuenta;
  },

  async create(tenantId: string, data: CreateCuentaContableInput) {
    // Validar código único
    const existing = await prisma.planCuentas.findFirst({
      where: {
        tenantId,
        codigo: data.codigo
      }
    });

    if (existing) {
      throw new Error('Ya existe una cuenta contable con este código');
    }

    // Validar cuenta padre si se proporciona
    if (data.cuentaPadreId) {
      const cuentaPadre = await prisma.planCuentas.findFirst({
        where: {
          id: data.cuentaPadreId,
          tenantId,
          activo: true
        }
      });

      if (!cuentaPadre) {
        throw new Error('Cuenta padre no encontrada o inactiva');
      }

      // Validar que el nivel sea consistente
      if (data.nivel <= cuentaPadre.nivel) {
        throw new Error('El nivel de la cuenta debe ser mayor al de la cuenta padre');
      }
    }

    // Validar centro de costo si se proporciona
    if (data.centroCostoId) {
      const centroCosto = await prisma.centroCosto.findFirst({
        where: {
          id: data.centroCostoId,
          tenantId,
          activo: true
        }
      });

      if (!centroCosto) {
        throw new Error('Centro de costo no encontrado o inactivo');
      }
    }

    // Determinar naturaleza automáticamente si no se proporciona
    let naturaleza = data.naturaleza;
    if (!naturaleza) {
      if (['ACTIVO', 'EGRESO', 'GASTO'].includes(data.tipo.toUpperCase())) {
        naturaleza = 'DEUDORA';
      } else {
        naturaleza = 'ACREEDORA';
      }
    }

    return await prisma.planCuentas.create({
      data: {
        tenantId,
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        tipo: data.tipo.toUpperCase(),
        naturaleza,
        nivel: data.nivel,
        cuentaPadreId: data.cuentaPadreId,
        centroCostoId: data.centroCostoId,
        subCentro: data.subCentro,
        tipoGasto: data.tipoGasto?.toUpperCase(),
        variabilidad: data.variabilidad?.toUpperCase(),
        aceptaMovimiento: data.aceptaMovimiento ?? true
      },
      include: {
        cuentaPadre: {
          select: {
            id: true,
            codigo: true,
            nombre: true
          }
        },
        centroCosto: {
          select: {
            id: true,
            codigo: true,
            nombre: true
          }
        }
      }
    });
  },

  async update(id: string, tenantId: string, data: UpdateCuentaContableInput) {
    const cuenta = await prisma.planCuentas.findFirst({
      where: { id, tenantId }
    });

    if (!cuenta) {
      throw new Error('Cuenta contable no encontrada');
    }

    // Validar centro de costo si se proporciona
    if (data.centroCostoId) {
      const centroCosto = await prisma.centroCosto.findFirst({
        where: {
          id: data.centroCostoId,
          tenantId,
          activo: true
        }
      });

      if (!centroCosto) {
        throw new Error('Centro de costo no encontrado o inactivo');
      }
    }

    return await prisma.planCuentas.update({
      where: { id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        tipo: data.tipo?.toUpperCase(),
        naturaleza: data.naturaleza?.toUpperCase(),
        centroCostoId: data.centroCostoId,
        subCentro: data.subCentro,
        tipoGasto: data.tipoGasto?.toUpperCase(),
        variabilidad: data.variabilidad?.toUpperCase(),
        aceptaMovimiento: data.aceptaMovimiento,
        activo: data.activo
      },
      include: {
        cuentaPadre: {
          select: {
            id: true,
            codigo: true,
            nombre: true
          }
        },
        centroCosto: {
          select: {
            id: true,
            codigo: true,
            nombre: true
          }
        }
      }
    });
  },

  async delete(id: string, tenantId: string) {
    const cuenta = await prisma.planCuentas.findFirst({
      where: { id, tenantId },
      include: {
        cuentasHijas: {
          where: { activo: true }
        },
        lineasAsiento: true
      }
    });

    if (!cuenta) {
      throw new Error('Cuenta contable no encontrada');
    }

    // Validar que no tenga cuentas hijas activas
    if (cuenta.cuentasHijas.length > 0) {
      throw new Error('No se puede desactivar una cuenta con cuentas hijas activas');
    }

    // Validar que no tenga movimientos
    if (cuenta.lineasAsiento.length > 0) {
      throw new Error('No se puede desactivar una cuenta con movimientos registrados');
    }

    // Soft delete
    return await prisma.planCuentas.update({
      where: { id },
      data: { activo: false }
    });
  }
};
