/**
 * Facturas de Compra Controller
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';

/**
 * Get all facturas de compra
 */
export const getFacturasCompra = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const {
      tipo,
      estado,
      proveedorId,
      ordenCompraId,
      fechaDesde,
      fechaHasta,
      page = '1',
      limit = '50',
    } = req.query;

    const where: any = { tenantId, activo: true };

    if (tipo) where.tipo = tipo;
    if (estado) where.estado = estado;
    if (proveedorId) where.proveedorId = proveedorId;
    if (ordenCompraId) where.ordenCompraId = ordenCompraId;
    if (fechaDesde || fechaHasta) {
      where.fecha = {};
      if (fechaDesde) where.fecha.gte = new Date(fechaDesde as string);
      if (fechaHasta) where.fecha.lte = new Date(fechaHasta as string);
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [facturas, total] = await Promise.all([
      prisma.facturaCompra.findMany({
        where,
        include: {
          proveedor: true,
          ordenCompra: true,
          ordenesPago: true,
        },
        orderBy: { fecha: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.facturaCompra.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        facturas,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching facturas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener facturas de compra',
    });
  }
};

/**
 * Get factura de compra by ID
 */
export const getFacturaCompraById = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { id } = req.params;

    const factura = await prisma.facturaCompra.findFirst({
      where: { id, tenantId },
      include: {
        proveedor: true,
        ordenCompra: {
          include: {
            items: {
              include: { producto: true },
            },
          },
        },
        ordenesPago: {
          include: {
            cuentaBancaria: true,
          },
        },
      },
    });

    if (!factura) {
      return res.status(404).json({
        success: false,
        error: 'Factura de compra no encontrada',
      });
    }

    res.json({
      success: true,
      data: factura,
    });
  } catch (error) {
    console.error('Error fetching factura:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener factura de compra',
    });
  }
};

/**
 * Create new factura de compra
 */
export const createFacturaCompra = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const {
      numeroFactura,
      timbrado,
      fecha,
      fechaVencimiento,
      proveedorId,
      ordenCompraId,
      tipo,
      descripcion,
      observaciones,
      subtotal,
      iva,
      total,
    } = req.body;

    // Validar que no exista una factura con el mismo número y timbrado
    const existente = await prisma.facturaCompra.findFirst({
      where: {
        tenantId,
        numero: numeroFactura,
        timbrado: timbrado || undefined,
      },
    });

    if (existente) {
      return res.status(409).json({
        success: false,
        error: 'Ya existe una factura con ese número y timbrado',
      });
    }

    // Si hay orden de compra, validar que esté aprobada
    if (ordenCompraId) {
      const ordenCompra = await prisma.ordenCompra.findFirst({
        where: { id: ordenCompraId, tenantId },
      });

      if (!ordenCompra) {
        return res.status(404).json({
          success: false,
          error: 'Orden de compra no encontrada',
        });
      }

      if (ordenCompra.estado !== 'APROBADA') {
        return res.status(400).json({
          success: false,
          error: 'Solo se pueden crear facturas para órdenes aprobadas',
        });
      }
    }

    const factura = await prisma.facturaCompra.create({
      data: {
        tenantId,
        numero: numeroFactura,
        timbrado,
        fecha: new Date(fecha),
        fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null,
        proveedorId,
        ordenCompraId,
        tipo: tipo || 'NORMAL',
        descripcion,
        observaciones,
        subtotal,
        iva10: iva || 0,
        iva5: 0,
        exentas: 0,
        total,
        estado: 'PENDIENTE',
        saldoPendiente: total,
      },
      include: {
        proveedor: true,
        ordenCompra: true,
      },
    });

    res.status(201).json({
      success: true,
      data: factura,
      message: 'Factura de compra creada exitosamente',
    });
  } catch (error) {
    console.error('Error creating factura:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear factura de compra',
    });
  }
};

/**
 * Update factura de compra
 */
export const updateFacturaCompra = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { id } = req.params;
    const {
      numeroFactura,
      timbrado,
      fecha,
      fechaVencimiento,
      descripcion,
      observaciones,
      subtotal,
      iva,
      total,
    } = req.body;

    const factura = await prisma.facturaCompra.findFirst({
      where: { id, tenantId },
    });

    if (!factura) {
      return res.status(404).json({
        success: false,
        error: 'Factura de compra no encontrada',
      });
    }

    // Solo se pueden editar facturas en estado PENDIENTE
    if (factura.estado !== 'PENDIENTE') {
      return res.status(400).json({
        success: false,
        error: 'Solo se pueden editar facturas en estado PENDIENTE',
      });
    }

    const facturaActualizada = await prisma.facturaCompra.update({
      where: { id },
      data: {
        numero: numeroFactura,
        timbrado,
        fecha: fecha ? new Date(fecha) : undefined,
        fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null,
        descripcion,
        observaciones,
        subtotal,
        iva10: iva,
        total,
        saldoPendiente: total,
      },
      include: {
        proveedor: true,
        ordenCompra: true,
      },
    });

    res.json({
      success: true,
      data: facturaActualizada,
      message: 'Factura de compra actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error updating factura:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar factura de compra',
    });
  }
};

/**
 * Marcar factura como pagada (total o parcialmente)
 */
export const marcarPago = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { id } = req.params;
    const { montoPagado } = req.body;

    const factura = await prisma.facturaCompra.findFirst({
      where: { id, tenantId },
    });

    if (!factura) {
      return res.status(404).json({
        success: false,
        error: 'Factura de compra no encontrada',
      });
    }

    const saldoPendiente = factura.saldoPendiente - montoPagado;

    let nuevoEstado = factura.estado;
    if (saldoPendiente <= 0) {
      nuevoEstado = 'PAGADA_TOTAL';
    } else if (montoPagado > 0) {
      nuevoEstado = 'PAGADA_PARCIAL';
    }

    const facturaActualizada = await prisma.facturaCompra.update({
      where: { id },
      data: {
        saldoPendiente,
        estado: nuevoEstado,
      },
      include: {
        proveedor: true,
        ordenCompra: true,
      },
    });

    res.json({
      success: true,
      data: facturaActualizada,
      message: 'Pago registrado exitosamente',
    });
  } catch (error) {
    console.error('Error marking payment:', error);
    res.status(500).json({
      success: false,
      error: 'Error al registrar pago',
    });
  }
};

/**
 * Anular factura de compra
 */
export const anularFactura = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { id } = req.params;
    const { motivoAnulacion } = req.body;

    const factura = await prisma.facturaCompra.findFirst({
      where: { id, tenantId },
    });

    if (!factura) {
      return res.status(404).json({
        success: false,
        error: 'Factura de compra no encontrada',
      });
    }

    // Verificar que no tenga pagos asociados
    const ordenesPago = await prisma.ordenPago.count({
      where: {
        facturaCompraId: id,
        estado: { in: ['APROBADA', 'PAGADA'] },
      },
    });

    if (ordenesPago > 0) {
      return res.status(400).json({
        success: false,
        error: 'No se puede anular una factura con pagos asociados',
      });
    }

    const facturaActualizada = await prisma.facturaCompra.update({
      where: { id },
      data: {
        estado: 'ANULADA',
        observaciones: factura.observaciones
          ? `${factura.observaciones}\n\nANULADA: ${motivoAnulacion}`
          : `ANULADA: ${motivoAnulacion}`,
      },
      include: {
        proveedor: true,
        ordenCompra: true,
      },
    });

    res.json({
      success: true,
      data: facturaActualizada,
      message: 'Factura anulada exitosamente',
    });
  } catch (error) {
    console.error('Error canceling factura:', error);
    res.status(500).json({
      success: false,
      error: 'Error al anular factura',
    });
  }
};
