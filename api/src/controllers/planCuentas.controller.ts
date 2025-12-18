/**
 * Plan de Cuentas Controller
 * Gestión del catálogo de cuentas contables
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';

// GET /api/plan-cuentas - Obtener todas las cuentas
export const getPlanCuentas = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { tipo, nivel, activo } = req.query;

    const where: any = { tenantId };

    if (tipo) where.tipo = tipo;
    if (nivel) where.nivel = parseInt(nivel as string);
    if (activo !== undefined) where.activo = activo === 'true';

    const cuentas = await prisma.planCuentas.findMany({
      where,
      include: {
        cuentaPadre: true,
        centroCosto: true,
        cuentasHijas: true,
      },
      orderBy: { codigo: 'asc' },
    });

    res.json(cuentas);
  } catch (error) {
    console.error('Error fetching plan cuentas:', error);
    res.status(500).json({ error: 'Error al obtener plan de cuentas' });
  }
};

// GET /api/plan-cuentas/:id - Obtener una cuenta específica
export const getPlanCuentaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.headers['x-tenant-id'] as string;

    const cuenta = await prisma.planCuentas.findFirst({
      where: { id, tenantId },
      include: {
        cuentaPadre: true,
        centroCosto: true,
        cuentasHijas: true,
        lineasAsiento: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            asiento: true,
          },
        },
      },
    });

    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    res.json(cuenta);
  } catch (error) {
    console.error('Error fetching cuenta:', error);
    res.status(500).json({ error: 'Error al obtener cuenta' });
  }
};

// POST /api/plan-cuentas - Crear nueva cuenta
export const createPlanCuenta = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const {
      codigo,
      nombre,
      descripcion,
      tipo,
      naturaleza,
      nivel,
      cuentaPadreId,
      centroCostoId,
      subCentro,
      tipoGasto,
      variabilidad,
      aceptaMovimiento,
    } = req.body;

    // Validaciones
    if (!codigo || !nombre || !tipo || !naturaleza || !nivel) {
      return res.status(400).json({
        error: 'Campos requeridos: codigo, nombre, tipo, naturaleza, nivel',
      });
    }

    // Verificar que el código no exista
    const existente = await prisma.planCuentas.findFirst({
      where: { tenantId, codigo },
    });

    if (existente) {
      return res.status(400).json({ error: 'El código de cuenta ya existe' });
    }

    const cuenta = await prisma.planCuentas.create({
      data: {
        tenantId,
        codigo,
        nombre,
        descripcion,
        tipo,
        naturaleza,
        nivel,
        cuentaPadreId,
        centroCostoId,
        subCentro,
        tipoGasto,
        variabilidad,
        aceptaMovimiento: aceptaMovimiento !== undefined ? aceptaMovimiento : true,
      },
      include: {
        cuentaPadre: true,
        centroCosto: true,
      },
    });

    res.status(201).json(cuenta);
  } catch (error) {
    console.error('Error creating cuenta:', error);
    res.status(500).json({ error: 'Error al crear cuenta' });
  }
};

// PUT /api/plan-cuentas/:id - Actualizar cuenta
export const updatePlanCuenta = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.headers['x-tenant-id'] as string;
    const {
      codigo,
      nombre,
      descripcion,
      tipo,
      naturaleza,
      nivel,
      cuentaPadreId,
      centroCostoId,
      subCentro,
      tipoGasto,
      variabilidad,
      aceptaMovimiento,
      activo,
    } = req.body;

    // Verificar que la cuenta existe
    const cuenta = await prisma.planCuentas.findFirst({
      where: { id, tenantId },
    });

    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    // Si se cambia el código, verificar que no exista
    if (codigo && codigo !== cuenta.codigo) {
      const existente = await prisma.planCuentas.findFirst({
        where: { tenantId, codigo },
      });

      if (existente) {
        return res.status(400).json({ error: 'El código de cuenta ya existe' });
      }
    }

    const updated = await prisma.planCuentas.update({
      where: { id },
      data: {
        codigo,
        nombre,
        descripcion,
        tipo,
        naturaleza,
        nivel,
        cuentaPadreId,
        centroCostoId,
        subCentro,
        tipoGasto,
        variabilidad,
        aceptaMovimiento,
        activo,
      },
      include: {
        cuentaPadre: true,
        centroCosto: true,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating cuenta:', error);
    res.status(500).json({ error: 'Error al actualizar cuenta' });
  }
};

// DELETE /api/plan-cuentas/:id - Desactivar cuenta (soft delete)
export const deletePlanCuenta = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.headers['x-tenant-id'] as string;

    // Verificar que la cuenta existe
    const cuenta = await prisma.planCuentas.findFirst({
      where: { id, tenantId },
      include: {
        cuentasHijas: true,
        lineasAsiento: true,
      },
    });

    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    // Verificar que no tenga cuentas hijas activas
    const hijasActivas = cuenta.cuentasHijas.filter((h) => h.activo);
    if (hijasActivas.length > 0) {
      return res.status(400).json({
        error: 'No se puede desactivar una cuenta con subcuentas activas',
      });
    }

    // Verificar que no tenga movimientos
    if (cuenta.lineasAsiento.length > 0) {
      return res.status(400).json({
        error: 'No se puede desactivar una cuenta con movimientos registrados',
      });
    }

    // Desactivar (soft delete)
    const updated = await prisma.planCuentas.update({
      where: { id },
      data: { activo: false },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error deleting cuenta:', error);
    res.status(500).json({ error: 'Error al desactivar cuenta' });
  }
};

// GET /api/plan-cuentas/tree - Obtener árbol de cuentas
export const getPlanCuentasTree = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;

    // Obtener todas las cuentas de nivel 1 (raíz)
    const cuentasRaiz = await prisma.planCuentas.findMany({
      where: {
        tenantId,
        nivel: 1,
        activo: true,
      },
      include: {
        cuentasHijas: {
          where: { activo: true },
          include: {
            cuentasHijas: {
              where: { activo: true },
              include: {
                cuentasHijas: {
                  where: { activo: true },
                },
              },
            },
          },
        },
      },
      orderBy: { codigo: 'asc' },
    });

    res.json(cuentasRaiz);
  } catch (error) {
    console.error('Error fetching plan cuentas tree:', error);
    res.status(500).json({ error: 'Error al obtener árbol de cuentas' });
  }
};
