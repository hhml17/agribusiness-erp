/**
 * Asiento Contable Controller
 * Gestión de asientos contables (journal entries)
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';

// GET /api/asientos - Obtener todos los asientos contables
export const getAsientos = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { tipo, estado, fechaDesde, fechaHasta } = req.query;

    const where: any = { tenantId };

    if (tipo) where.tipo = tipo;
    if (estado) where.estado = estado;
    if (fechaDesde || fechaHasta) {
      where.fecha = {};
      if (fechaDesde) where.fecha.gte = new Date(fechaDesde as string);
      if (fechaHasta) where.fecha.lte = new Date(fechaHasta as string);
    }

    const asientos = await prisma.asientoContable.findMany({
      where,
      include: {
        lineas: {
          include: {
            cuenta: {
              select: {
                codigo: true,
                nombre: true,
              },
            },
            centroCosto: {
              select: {
                codigo: true,
                nombre: true,
              },
            },
          },
        },
      },
      orderBy: { fecha: 'desc' },
    });

    res.json(asientos);
  } catch (error) {
    console.error('Error fetching asientos:', error);
    res.status(500).json({ error: 'Error al obtener asientos contables' });
  }
};

// GET /api/asientos/:id - Obtener un asiento específico
export const getAsientoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.headers['x-tenant-id'] as string;

    const asiento = await prisma.asientoContable.findFirst({
      where: { id, tenantId },
      include: {
        lineas: {
          include: {
            cuenta: true,
            centroCosto: true,
          },
        },
      },
    });

    if (!asiento) {
      return res.status(404).json({ error: 'Asiento no encontrado' });
    }

    res.json(asiento);
  } catch (error) {
    console.error('Error fetching asiento:', error);
    res.status(500).json({ error: 'Error al obtener asiento' });
  }
};

// POST /api/asientos - Crear nuevo asiento contable
export const createAsiento = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const {
      fecha,
      descripcion,
      tipo,
      documentoRef,
      tipoDoc,
      lineas,
    } = req.body;

    // Validaciones
    if (!fecha || !descripcion || !tipo || !lineas || lineas.length === 0) {
      return res.status(400).json({
        error: 'Campos requeridos: fecha, descripcion, tipo, lineas',
      });
    }

    // Validar que el asiento esté balanceado (debe = haber)
    const totalDebe = lineas.reduce((sum: number, l: any) => sum + (l.debe || 0), 0);
    const totalHaber = lineas.reduce((sum: number, l: any) => sum + (l.haber || 0), 0);

    if (Math.abs(totalDebe - totalHaber) > 0.01) {
      return res.status(400).json({
        error: `Asiento desbalanceado: Debe=${totalDebe}, Haber=${totalHaber}`,
      });
    }

    // Obtener el próximo número de asiento
    const ultimoAsiento = await prisma.asientoContable.findFirst({
      where: { tenantId },
      orderBy: { numero: 'desc' },
    });

    const numero = (ultimoAsiento?.numero || 0) + 1;

    // Crear asiento con sus líneas
    const asiento = await prisma.asientoContable.create({
      data: {
        tenantId,
        numero,
        fecha: new Date(fecha),
        descripcion,
        tipo,
        estado: 'BORRADOR',
        documentoRef,
        tipoDoc,
        lineas: {
          create: lineas.map((linea: any) => ({
            cuentaId: linea.cuentaId,
            centroCostoId: linea.centroCostoId,
            debe: linea.debe || 0,
            haber: linea.haber || 0,
            descripcion: linea.descripcion,
            documentoRef: linea.documentoRef,
          })),
        },
      },
      include: {
        lineas: {
          include: {
            cuenta: true,
            centroCosto: true,
          },
        },
      },
    });

    res.status(201).json(asiento);
  } catch (error) {
    console.error('Error creating asiento:', error);
    res.status(500).json({ error: 'Error al crear asiento contable' });
  }
};

// PUT /api/asientos/:id - Actualizar asiento contable (solo si está en BORRADOR)
export const updateAsiento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.headers['x-tenant-id'] as string;
    const { fecha, descripcion, tipo, documentoRef, tipoDoc, lineas } = req.body;

    // Verificar que el asiento existe
    const asiento = await prisma.asientoContable.findFirst({
      where: { id, tenantId },
      include: { lineas: true },
    });

    if (!asiento) {
      return res.status(404).json({ error: 'Asiento no encontrado' });
    }

    // Solo se pueden editar asientos en BORRADOR
    if (asiento.estado !== 'BORRADOR') {
      return res.status(400).json({
        error: 'Solo se pueden editar asientos en estado BORRADOR',
      });
    }

    // Validar que el asiento esté balanceado
    if (lineas) {
      const totalDebe = lineas.reduce((sum: number, l: any) => sum + (l.debe || 0), 0);
      const totalHaber = lineas.reduce((sum: number, l: any) => sum + (l.haber || 0), 0);

      if (Math.abs(totalDebe - totalHaber) > 0.01) {
        return res.status(400).json({
          error: `Asiento desbalanceado: Debe=${totalDebe}, Haber=${totalHaber}`,
        });
      }
    }

    // Actualizar asiento
    const updated = await prisma.asientoContable.update({
      where: { id },
      data: {
        fecha: fecha ? new Date(fecha) : undefined,
        descripcion,
        tipo,
        documentoRef,
        tipoDoc,
        lineas: lineas
          ? {
              deleteMany: {},
              create: lineas.map((linea: any) => ({
                cuentaId: linea.cuentaId,
                centroCostoId: linea.centroCostoId,
                debe: linea.debe || 0,
                haber: linea.haber || 0,
                descripcion: linea.descripcion,
                documentoRef: linea.documentoRef,
              })),
            }
          : undefined,
      },
      include: {
        lineas: {
          include: {
            cuenta: true,
            centroCosto: true,
          },
        },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating asiento:', error);
    res.status(500).json({ error: 'Error al actualizar asiento' });
  }
};

// POST /api/asientos/:id/contabilizar - Contabilizar asiento (cambiar estado a CONTABILIZADO)
export const contabilizarAsiento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.headers['x-tenant-id'] as string;
    const { contabilizadoPor } = req.body;

    // Verificar que el asiento existe
    const asiento = await prisma.asientoContable.findFirst({
      where: { id, tenantId },
      include: { lineas: true },
    });

    if (!asiento) {
      return res.status(404).json({ error: 'Asiento no encontrado' });
    }

    // Solo se pueden contabilizar asientos en BORRADOR
    if (asiento.estado !== 'BORRADOR') {
      return res.status(400).json({
        error: 'Solo se pueden contabilizar asientos en estado BORRADOR',
      });
    }

    // Validar que el asiento tenga líneas
    if (asiento.lineas.length === 0) {
      return res.status(400).json({ error: 'El asiento no tiene líneas' });
    }

    // Validar que el asiento esté balanceado
    const totalDebe = asiento.lineas.reduce((sum, l) => sum + l.debe, 0);
    const totalHaber = asiento.lineas.reduce((sum, l) => sum + l.haber, 0);

    if (Math.abs(totalDebe - totalHaber) > 0.01) {
      return res.status(400).json({
        error: `Asiento desbalanceado: Debe=${totalDebe}, Haber=${totalHaber}`,
      });
    }

    // Contabilizar
    const updated = await prisma.asientoContable.update({
      where: { id },
      data: {
        estado: 'CONTABILIZADO',
        contabilizadoPor,
        fechaContabilizado: new Date(),
      },
      include: {
        lineas: {
          include: {
            cuenta: true,
            centroCosto: true,
          },
        },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error contabilizando asiento:', error);
    res.status(500).json({ error: 'Error al contabilizar asiento' });
  }
};

// POST /api/asientos/:id/anular - Anular asiento
export const anularAsiento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.headers['x-tenant-id'] as string;
    const { anuladoPor, motivoAnulacion } = req.body;

    if (!motivoAnulacion) {
      return res.status(400).json({ error: 'Se requiere motivo de anulación' });
    }

    // Verificar que el asiento existe
    const asiento = await prisma.asientoContable.findFirst({
      where: { id, tenantId },
    });

    if (!asiento) {
      return res.status(404).json({ error: 'Asiento no encontrado' });
    }

    // No se pueden anular asientos ya anulados
    if (asiento.estado === 'ANULADO') {
      return res.status(400).json({ error: 'El asiento ya está anulado' });
    }

    // Anular
    const updated = await prisma.asientoContable.update({
      where: { id },
      data: {
        estado: 'ANULADO',
        anuladoPor,
        fechaAnulado: new Date(),
        motivoAnulacion,
      },
      include: {
        lineas: {
          include: {
            cuenta: true,
            centroCosto: true,
          },
        },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error anulando asiento:', error);
    res.status(500).json({ error: 'Error al anular asiento' });
  }
};

// DELETE /api/asientos/:id - Eliminar asiento (solo si está en BORRADOR)
export const deleteAsiento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.headers['x-tenant-id'] as string;

    // Verificar que el asiento existe
    const asiento = await prisma.asientoContable.findFirst({
      where: { id, tenantId },
    });

    if (!asiento) {
      return res.status(404).json({ error: 'Asiento no encontrado' });
    }

    // Solo se pueden eliminar asientos en BORRADOR
    if (asiento.estado !== 'BORRADOR') {
      return res.status(400).json({
        error: 'Solo se pueden eliminar asientos en estado BORRADOR',
      });
    }

    // Eliminar (cascade eliminará las líneas)
    await prisma.asientoContable.delete({
      where: { id },
    });

    res.json({ message: 'Asiento eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting asiento:', error);
    res.status(500).json({ error: 'Error al eliminar asiento' });
  }
};
