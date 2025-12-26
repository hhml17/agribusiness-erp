/**
 * Centro de Costo Controller
 * Gestión de centros de costo para contabilidad agropecuaria
 */

import { Response } from 'express';
import { TenantRequest } from '../middleware/tenant.js';
import { prisma } from '../config/database.js';

// GET /api/centros-costo - Obtener todos los centros de costo
export const getCentrosCosto = async (req: TenantRequest, res: Response) => {
  try {
    const tenantId = req.tenantId;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }

    const { tipo, activo } = req.query;

    const where: any = { tenantId };

    if (tipo) where.tipo = tipo;
    if (activo !== undefined) where.activo = activo === 'true';

    const centros = await prisma.centroCosto.findMany({
      where,
      include: {
        cuentas: {
          where: { activo: true },
          select: {
            id: true,
            codigo: true,
            nombre: true,
          },
        },
        _count: {
          select: {
            lineasAsiento: true,
          },
        },
      },
      orderBy: { codigo: 'asc' },
    });

    res.json(centros);
  } catch (error) {
    console.error('Error fetching centros costo:', error);
    res.status(500).json({ error: 'Error al obtener centros de costo' });
  }
};

// GET /api/centros-costo/:id - Obtener un centro de costo específico
export const getCentroCostoById = async (req: TenantRequest, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }

    const centro = await prisma.centroCosto.findFirst({
      where: { id, tenantId },
      include: {
        cuentas: {
          where: { activo: true },
        },
        lineasAsiento: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            asiento: true,
            cuenta: true,
          },
        },
      },
    });

    if (!centro) {
      return res.status(404).json({ error: 'Centro de costo no encontrado' });
    }

    res.json(centro);
  } catch (error) {
    console.error('Error fetching centro costo:', error);
    res.status(500).json({ error: 'Error al obtener centro de costo' });
  }
};

// POST /api/centros-costo - Crear nuevo centro de costo
export const createCentroCosto = async (req: TenantRequest, res: Response) => {
  try {
    const tenantId = req.tenantId;
    const { codigo, nombre, descripcion, tipo } = req.body;

    // Validaciones
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }

    if (!codigo || !nombre) {
      return res.status(400).json({
        error: 'Campos requeridos: codigo, nombre',
      });
    }

    // Verificar que el código no exista
    const existente = await prisma.centroCosto.findFirst({
      where: { tenantId, codigo },
    });

    if (existente) {
      return res.status(400).json({ error: 'El código de centro de costo ya existe' });
    }

    const centro = await prisma.centroCosto.create({
      data: {
        tenantId,
        codigo,
        nombre,
        descripcion,
        tipo,
      },
    });

    res.status(201).json(centro);
  } catch (error) {
    console.error('Error creating centro costo:', error);
    res.status(500).json({ error: 'Error al crear centro de costo' });
  }
};

// PUT /api/centros-costo/:id - Actualizar centro de costo
export const updateCentroCosto = async (req: TenantRequest, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;
    const { codigo, nombre, descripcion, tipo, activo } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }

    // Verificar que el centro existe
    const centro = await prisma.centroCosto.findFirst({
      where: { id, tenantId },
    });

    if (!centro) {
      return res.status(404).json({ error: 'Centro de costo no encontrado' });
    }

    // Si se cambia el código, verificar que no exista
    if (codigo && codigo !== centro.codigo) {
      const existente = await prisma.centroCosto.findFirst({
        where: { tenantId, codigo },
      });

      if (existente) {
        return res.status(400).json({ error: 'El código de centro de costo ya existe' });
      }
    }

    const updated = await prisma.centroCosto.update({
      where: { id },
      data: {
        codigo,
        nombre,
        descripcion,
        tipo,
        activo,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating centro costo:', error);
    res.status(500).json({ error: 'Error al actualizar centro de costo' });
  }
};

// DELETE /api/centros-costo/:id - Desactivar centro de costo (soft delete)
export const deleteCentroCosto = async (req: TenantRequest, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }

    // Verificar que el centro existe
    const centro = await prisma.centroCosto.findFirst({
      where: { id, tenantId },
      include: {
        cuentas: true,
        lineasAsiento: true,
      },
    });

    if (!centro) {
      return res.status(404).json({ error: 'Centro de costo no encontrado' });
    }

    // Verificar que no tenga cuentas asignadas
    const cuentasActivas = centro.cuentas.filter((c) => c.activo);
    if (cuentasActivas.length > 0) {
      return res.status(400).json({
        error: 'No se puede desactivar un centro de costo con cuentas asignadas',
      });
    }

    // Verificar que no tenga movimientos
    if (centro.lineasAsiento.length > 0) {
      return res.status(400).json({
        error: 'No se puede desactivar un centro de costo con movimientos registrados',
      });
    }

    // Desactivar (soft delete)
    const updated = await prisma.centroCosto.update({
      where: { id },
      data: { activo: false },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error deleting centro costo:', error);
    res.status(500).json({ error: 'Error al desactivar centro de costo' });
  }
};
