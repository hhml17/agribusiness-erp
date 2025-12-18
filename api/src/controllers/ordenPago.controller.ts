/**
 * Ordenes de Pago Controller
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';

/**
 * Get all ordenes de pago
 */
export const getOrdenesPago = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const {
      estado,
      metodoPago,
      proveedorId,
      fechaDesde,
      fechaHasta,
      page = '1',
      limit = '50',
    } = req.query;

    const where: any = { tenantId, activo: true };

    if (estado) where.estado = estado;
    if (metodoPago) where.metodoPago = metodoPago;
    if (proveedorId) where.proveedorId = proveedorId;
    if (fechaDesde || fechaHasta) {
      where.fecha = {};
      if (fechaDesde) where.fecha.gte = new Date(fechaDesde as string);
      if (fechaHasta) where.fecha.lte = new Date(fechaHasta as string);
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [ordenes, total] = await Promise.all([
      prisma.ordenPago.findMany({
        where,
        include: {
          proveedor: true,
          facturaCompra: true,
          cuentaBancaria: true,
          retenciones: {
            where: { activo: true },
          },
        },
        orderBy: { fecha: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.ordenPago.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        ordenes,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching ordenes pago:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener órdenes de pago',
    });
  }
};

/**
 * Get orden de pago by ID
 */
export const getOrdenPagoById = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { id } = req.params;

    const orden = await prisma.ordenPago.findFirst({
      where: { id, tenantId },
      include: {
        proveedor: true,
        facturaCompra: {
          include: {
            ordenCompra: true,
          },
        },
        cuentaBancaria: true,
        retenciones: {
          where: { activo: true },
        },
        movimientos: {
          where: { activo: true },
        },
        asientoContable: {
          include: {
            detalles: {
              include: {
                cuenta: true,
              },
            },
          },
        },
      },
    });

    if (!orden) {
      return res.status(404).json({
        success: false,
        error: 'Orden de pago no encontrada',
      });
    }

    res.json({
      success: true,
      data: orden,
    });
  } catch (error) {
    console.error('Error fetching orden pago:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener orden de pago',
    });
  }
};

/**
 * Create new orden de pago
 */
export const createOrdenPago = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const {
      fecha,
      proveedorId,
      beneficiario,
      facturaCompraId,
      metodoPago,
      cuentaBancariaId,
      montoTotal,
      retencionIVA,
      retencionIRE,
      solicitadoPor,
      retenciones,
      observaciones,
    } = req.body;

    // Generar número de OP
    const ultimaOrden = await prisma.ordenPago.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    const numeroSecuencia = ultimaOrden
      ? parseInt(ultimaOrden.numero.split('-')[2]) + 1
      : 1;
    const numero = `OP-${new Date().getFullYear()}-${numeroSecuencia.toString().padStart(4, '0')}`;

    // Calcular monto neto
    const totalRetenciones = (retencionIVA || 0) + (retencionIRE || 0);
    const montoNeto = montoTotal - totalRetenciones;

    // Validar cuenta bancaria si el método de pago lo requiere
    if (['TRANSFERENCIA', 'CHEQUE', 'CHEQUE_DIFERIDO'].includes(metodoPago) && !cuentaBancariaId) {
      return res.status(400).json({
        success: false,
        error: 'Debe seleccionar una cuenta bancaria para este método de pago',
      });
    }

    // Si hay factura asociada, validar que exista
    if (facturaCompraId) {
      const factura = await prisma.facturaCompra.findFirst({
        where: { id: facturaCompraId, tenantId },
      });

      if (!factura) {
        return res.status(404).json({
          success: false,
          error: 'Factura de compra no encontrada',
        });
      }
    }

    // Crear orden de pago con retenciones
    const orden = await prisma.ordenPago.create({
      data: {
        tenantId,
        numero,
        fecha: new Date(fecha),
        proveedorId,
        beneficiario,
        facturaCompraId,
        metodoPago,
        cuentaBancariaId,
        montoTotal,
        retencionIVA: retencionIVA || 0,
        retencionIRE: retencionIRE || 0,
        montoNeto,
        estado: 'BORRADOR',
        solicitadoPor,
        observaciones,
        retenciones: retenciones
          ? {
              create: retenciones.map((ret: any) => ({
                tenantId,
                tipo: ret.tipo,
                descripcion: ret.descripcion,
                monto: ret.monto,
                numeroComprobante: ret.numeroComprobante,
              })),
            }
          : undefined,
      },
      include: {
        proveedor: true,
        facturaCompra: true,
        cuentaBancaria: true,
        retenciones: true,
      },
    });

    res.status(201).json({
      success: true,
      data: orden,
      message: 'Orden de pago creada exitosamente',
    });
  } catch (error) {
    console.error('Error creating orden pago:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear orden de pago',
    });
  }
};

/**
 * Update orden de pago
 */
export const updateOrdenPago = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { id } = req.params;
    const {
      fecha,
      beneficiario,
      metodoPago,
      cuentaBancariaId,
      montoTotal,
      retencionIVA,
      retencionIRE,
      observaciones,
    } = req.body;

    const orden = await prisma.ordenPago.findFirst({
      where: { id, tenantId },
    });

    if (!orden) {
      return res.status(404).json({
        success: false,
        error: 'Orden de pago no encontrada',
      });
    }

    // Solo se pueden editar órdenes en estado BORRADOR
    if (orden.estado !== 'BORRADOR') {
      return res.status(400).json({
        success: false,
        error: 'Solo se pueden editar órdenes en estado BORRADOR',
      });
    }

    // Recalcular monto neto si cambian las retenciones o el total
    const totalRetenciones = (retencionIVA || orden.retencionIVA) + (retencionIRE || orden.retencionIRE);
    const montoNeto = (montoTotal || orden.montoTotal) - totalRetenciones;

    const ordenActualizada = await prisma.ordenPago.update({
      where: { id },
      data: {
        fecha: fecha ? new Date(fecha) : undefined,
        beneficiario,
        metodoPago,
        cuentaBancariaId,
        montoTotal,
        retencionIVA,
        retencionIRE,
        montoNeto,
        observaciones,
      },
      include: {
        proveedor: true,
        facturaCompra: true,
        cuentaBancaria: true,
        retenciones: true,
      },
    });

    res.json({
      success: true,
      data: ordenActualizada,
      message: 'Orden de pago actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error updating orden pago:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar orden de pago',
    });
  }
};

/**
 * Enviar orden de pago a aprobación
 */
export const enviarAprobacion = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { id } = req.params;

    const orden = await prisma.ordenPago.findFirst({
      where: { id, tenantId },
    });

    if (!orden) {
      return res.status(404).json({
        success: false,
        error: 'Orden de pago no encontrada',
      });
    }

    if (orden.estado !== 'BORRADOR') {
      return res.status(400).json({
        success: false,
        error: 'Solo se pueden enviar a aprobación órdenes en estado BORRADOR',
      });
    }

    const ordenActualizada = await prisma.ordenPago.update({
      where: { id },
      data: {
        estado: 'PENDIENTE_APROBACION',
      },
      include: {
        proveedor: true,
        facturaCompra: true,
        cuentaBancaria: true,
        retenciones: true,
      },
    });

    res.json({
      success: true,
      data: ordenActualizada,
      message: 'Orden enviada a aprobación',
    });
  } catch (error) {
    console.error('Error sending to approval:', error);
    res.status(500).json({
      success: false,
      error: 'Error al enviar a aprobación',
    });
  }
};

/**
 * Aprobar orden de pago
 */
export const aprobarOrdenPago = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { id } = req.params;
    const { aprobadoPor } = req.body;

    const orden = await prisma.ordenPago.findFirst({
      where: { id, tenantId },
    });

    if (!orden) {
      return res.status(404).json({
        success: false,
        error: 'Orden de pago no encontrada',
      });
    }

    if (orden.estado !== 'PENDIENTE_APROBACION') {
      return res.status(400).json({
        success: false,
        error: 'Solo se pueden aprobar órdenes en estado PENDIENTE_APROBACION',
      });
    }

    const ordenActualizada = await prisma.ordenPago.update({
      where: { id },
      data: {
        estado: 'APROBADA',
        aprobadoPor,
        fechaAprobacion: new Date(),
      },
      include: {
        proveedor: true,
        facturaCompra: true,
        cuentaBancaria: true,
        retenciones: true,
      },
    });

    res.json({
      success: true,
      data: ordenActualizada,
      message: 'Orden aprobada exitosamente',
    });
  } catch (error) {
    console.error('Error approving orden pago:', error);
    res.status(500).json({
      success: false,
      error: 'Error al aprobar orden',
    });
  }
};

/**
 * Rechazar orden de pago
 */
export const rechazarOrdenPago = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { id } = req.params;
    const { motivoRechazo } = req.body;

    const orden = await prisma.ordenPago.findFirst({
      where: { id, tenantId },
    });

    if (!orden) {
      return res.status(404).json({
        success: false,
        error: 'Orden de pago no encontrada',
      });
    }

    if (orden.estado !== 'PENDIENTE_APROBACION') {
      return res.status(400).json({
        success: false,
        error: 'Solo se pueden rechazar órdenes en estado PENDIENTE_APROBACION',
      });
    }

    const ordenActualizada = await prisma.ordenPago.update({
      where: { id },
      data: {
        estado: 'RECHAZADA',
        motivoRechazo,
      },
      include: {
        proveedor: true,
        facturaCompra: true,
        cuentaBancaria: true,
        retenciones: true,
      },
    });

    res.json({
      success: true,
      data: ordenActualizada,
      message: 'Orden rechazada',
    });
  } catch (error) {
    console.error('Error rejecting orden pago:', error);
    res.status(500).json({
      success: false,
      error: 'Error al rechazar orden',
    });
  }
};

/**
 * Marcar orden como pagada y crear movimiento bancario
 */
export const marcarComoPagada = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { id } = req.params;
    const { numeroCheque, fechaPago, observaciones } = req.body;

    const orden = await prisma.ordenPago.findFirst({
      where: { id, tenantId },
      include: {
        cuentaBancaria: true,
        facturaCompra: true,
      },
    });

    if (!orden) {
      return res.status(404).json({
        success: false,
        error: 'Orden de pago no encontrada',
      });
    }

    if (orden.estado !== 'APROBADA') {
      return res.status(400).json({
        success: false,
        error: 'Solo se pueden marcar como pagadas órdenes aprobadas',
      });
    }

    // Crear movimiento bancario si hay cuenta asociada
    let movimiento = null;
    if (orden.cuentaBancariaId) {
      movimiento = await prisma.movimientoBancario.create({
        data: {
          tenantId,
          cuentaBancariaId: orden.cuentaBancariaId,
          tipo: 'EGRESO',
          fecha: fechaPago ? new Date(fechaPago) : new Date(),
          descripcion: `Pago OP ${orden.numero} - ${orden.beneficiario}`,
          monto: orden.montoNeto,
          numeroCheque,
          ordenPagoId: orden.id,
          estado: 'PENDIENTE',
        },
      });

      // Actualizar saldo de cuenta bancaria
      await prisma.cuentaBancaria.update({
        where: { id: orden.cuentaBancariaId },
        data: {
          saldoActual: {
            decrement: orden.montoNeto,
          },
        },
      });
    }

    // Actualizar orden de pago
    const ordenActualizada = await prisma.ordenPago.update({
      where: { id },
      data: {
        estado: 'PAGADA',
        fechaPago: fechaPago ? new Date(fechaPago) : new Date(),
        observaciones: observaciones || orden.observaciones,
      },
      include: {
        proveedor: true,
        facturaCompra: true,
        cuentaBancaria: true,
        retenciones: true,
        movimientos: true,
      },
    });

    // Si hay factura asociada, actualizar su estado de pago
    if (orden.facturaCompraId) {
      const factura = orden.facturaCompra!;
      const nuevoMontoPagado = (factura.montoPagado || 0) + orden.montoNeto;
      const saldoPendiente = factura.total - nuevoMontoPagado;

      await prisma.facturaCompra.update({
        where: { id: orden.facturaCompraId },
        data: {
          montoPagado: nuevoMontoPagado,
          saldoPendiente,
          estado: saldoPendiente <= 0 ? 'PAGADA' : 'PAGO_PARCIAL',
        },
      });
    }

    res.json({
      success: true,
      data: ordenActualizada,
      message: 'Orden marcada como pagada exitosamente',
    });
  } catch (error) {
    console.error('Error marking as paid:', error);
    res.status(500).json({
      success: false,
      error: 'Error al marcar como pagada',
    });
  }
};

/**
 * Anular orden de pago
 */
export const anularOrdenPago = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { id } = req.params;
    const { motivoAnulacion } = req.body;

    const orden = await prisma.ordenPago.findFirst({
      where: { id, tenantId },
    });

    if (!orden) {
      return res.status(404).json({
        success: false,
        error: 'Orden de pago no encontrada',
      });
    }

    if (orden.estado === 'PAGADA') {
      return res.status(400).json({
        success: false,
        error: 'No se pueden anular órdenes pagadas',
      });
    }

    const ordenActualizada = await prisma.ordenPago.update({
      where: { id },
      data: {
        estado: 'ANULADA',
        motivoRechazo: motivoAnulacion,
      },
      include: {
        proveedor: true,
        facturaCompra: true,
        cuentaBancaria: true,
        retenciones: true,
      },
    });

    res.json({
      success: true,
      data: ordenActualizada,
      message: 'Orden anulada exitosamente',
    });
  } catch (error) {
    console.error('Error canceling orden pago:', error);
    res.status(500).json({
      success: false,
      error: 'Error al anular orden',
    });
  }
};
