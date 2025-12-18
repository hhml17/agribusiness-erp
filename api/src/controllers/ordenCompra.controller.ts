/**
 * Ordenes de Compra Controller
 * Gestión de órdenes de compra con workflow de aprobación
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';

// GET /api/ordenes-compra - Listar todas las órdenes de compra
export const getOrdenesCompra = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { estado, proveedorId, fechaDesde, fechaHasta, page = 1, limit = 20 } = req.query;

    const where: any = { tenantId };

    if (estado) {
      where.estado = estado;
    }

    if (proveedorId) {
      where.proveedorId = proveedorId;
    }

    if (fechaDesde || fechaHasta) {
      where.fecha = {};
      if (fechaDesde) where.fecha.gte = new Date(fechaDesde as string);
      if (fechaHasta) where.fecha.lte = new Date(fechaHasta as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [ordenes, total] = await Promise.all([
      prisma.ordenCompra.findMany({
        where,
        include: {
          proveedor: {
            select: {
              codigo: true,
              nombre: true,
              ruc: true,
            },
          },
          _count: {
            select: {
              items: true,
              facturas: true,
            },
          },
        },
        orderBy: { fecha: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.ordenCompra.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        ordenes,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching ordenes de compra:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener órdenes de compra',
    });
  }
};

// GET /api/ordenes-compra/:id - Obtener una orden de compra por ID
export const getOrdenCompraById = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { id } = req.params;

    const orden = await prisma.ordenCompra.findFirst({
      where: { id, tenantId },
      include: {
        proveedor: true,
        items: {
          include: {
            producto: {
              select: {
                codigo: true,
                nombre: true,
                unidadMedida: true,
              },
            },
          },
        },
        facturas: {
          select: {
            id: true,
            numero: true,
            fecha: true,
            total: true,
            estado: true,
          },
        },
      },
    });

    if (!orden) {
      return res.status(404).json({
        success: false,
        error: 'Orden de compra no encontrada',
      });
    }

    res.json({
      success: true,
      data: orden,
    });
  } catch (error) {
    console.error('Error fetching orden de compra:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener orden de compra',
    });
  }
};

// POST /api/ordenes-compra - Crear nueva orden de compra
export const createOrdenCompra = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const {
      proveedorId,
      descripcion,
      observaciones,
      items,
      solicitadoPor,
    } = req.body;

    // Calcular totales
    let subtotal = 0;
    let iva = 0;

    items.forEach((item: any) => {
      const itemSubtotal = item.cantidad * item.precioUnitario;
      subtotal += itemSubtotal;
      // Asumimos IVA 10% por defecto
      iva += itemSubtotal * 0.1;
    });

    const total = subtotal + iva;

    // Generar número de OC
    const ultimaOrden = await prisma.ordenCompra.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    const numeroSecuencia = ultimaOrden
      ? parseInt(ultimaOrden.numero.split('-')[2]) + 1
      : 1;
    const numero = `OC-${new Date().getFullYear()}-${numeroSecuencia.toString().padStart(4, '0')}`;

    const orden = await prisma.ordenCompra.create({
      data: {
        tenantId,
        numero,
        proveedorId,
        descripcion,
        observaciones,
        subtotal,
        iva,
        total,
        estado: 'BORRADOR',
        solicitadoPor,
        items: {
          create: items.map((item: any) => ({
            productoId: item.productoId,
            descripcion: item.descripcion,
            cantidad: item.cantidad,
            unidadMedida: item.unidadMedida,
            precioUnitario: item.precioUnitario,
            subtotal: item.cantidad * item.precioUnitario,
          })),
        },
      },
      include: {
        proveedor: true,
        items: {
          include: {
            producto: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: orden,
    });
  } catch (error) {
    console.error('Error creating orden de compra:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear orden de compra',
    });
  }
};

// PUT /api/ordenes-compra/:id - Actualizar orden de compra
export const updateOrdenCompra = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { id } = req.params;
    const {
      proveedorId,
      descripcion,
      observaciones,
      items,
    } = req.body;

    // Verificar que existe y está en BORRADOR
    const ordenExistente = await prisma.ordenCompra.findFirst({
      where: { id, tenantId },
    });

    if (!ordenExistente) {
      return res.status(404).json({
        success: false,
        error: 'Orden de compra no encontrada',
      });
    }

    if (ordenExistente.estado !== 'BORRADOR') {
      return res.status(400).json({
        success: false,
        error: 'Solo se pueden editar órdenes en estado BORRADOR',
      });
    }

    // Recalcular totales
    let subtotal = 0;
    let iva = 0;

    items.forEach((item: any) => {
      const itemSubtotal = item.cantidad * item.precioUnitario;
      subtotal += itemSubtotal;
      iva += itemSubtotal * 0.1;
    });

    const total = subtotal + iva;

    // Eliminar items anteriores y crear nuevos
    await prisma.itemOrdenCompra.deleteMany({
      where: { ordenCompraId: id },
    });

    const orden = await prisma.ordenCompra.update({
      where: { id },
      data: {
        proveedorId,
        descripcion,
        observaciones,
        subtotal,
        iva,
        total,
        items: {
          create: items.map((item: any) => ({
            productoId: item.productoId,
            descripcion: item.descripcion,
            cantidad: item.cantidad,
            unidadMedida: item.unidadMedida,
            precioUnitario: item.precioUnitario,
            subtotal: item.cantidad * item.precioUnitario,
          })),
        },
      },
      include: {
        proveedor: true,
        items: {
          include: {
            producto: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: orden,
    });
  } catch (error) {
    console.error('Error updating orden de compra:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar orden de compra',
    });
  }
};

// PUT /api/ordenes-compra/:id/enviar-aprobacion - Enviar a aprobación
export const enviarAprobacion = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { id } = req.params;

    const orden = await prisma.ordenCompra.findFirst({
      where: { id, tenantId },
    });

    if (!orden) {
      return res.status(404).json({
        success: false,
        error: 'Orden de compra no encontrada',
      });
    }

    if (orden.estado !== 'BORRADOR') {
      return res.status(400).json({
        success: false,
        error: 'Solo se pueden enviar a aprobación órdenes en estado BORRADOR',
      });
    }

    const ordenActualizada = await prisma.ordenCompra.update({
      where: { id },
      data: {
        estado: 'PENDIENTE_APROBACION',
      },
      include: {
        proveedor: true,
        items: true,
      },
    });

    res.json({
      success: true,
      data: ordenActualizada,
      message: 'Orden enviada a aprobación exitosamente',
    });
  } catch (error) {
    console.error('Error sending to approval:', error);
    res.status(500).json({
      success: false,
      error: 'Error al enviar a aprobación',
    });
  }
};

// PUT /api/ordenes-compra/:id/aprobar - Aprobar orden de compra
export const aprobarOrdenCompra = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { id } = req.params;
    const { aprobadoPor } = req.body;

    const orden = await prisma.ordenCompra.findFirst({
      where: { id, tenantId },
    });

    if (!orden) {
      return res.status(404).json({
        success: false,
        error: 'Orden de compra no encontrada',
      });
    }

    if (orden.estado !== 'PENDIENTE_APROBACION') {
      return res.status(400).json({
        success: false,
        error: 'Solo se pueden aprobar órdenes en estado PENDIENTE_APROBACION',
      });
    }

    const ordenActualizada = await prisma.ordenCompra.update({
      where: { id },
      data: {
        estado: 'APROBADA',
        aprobadoPor,
        fechaAprobacion: new Date(),
      },
      include: {
        proveedor: true,
        items: true,
      },
    });

    res.json({
      success: true,
      data: ordenActualizada,
      message: 'Orden aprobada exitosamente',
    });
  } catch (error) {
    console.error('Error approving orden:', error);
    res.status(500).json({
      success: false,
      error: 'Error al aprobar orden',
    });
  }
};

// PUT /api/ordenes-compra/:id/rechazar - Rechazar orden de compra
export const rechazarOrdenCompra = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { id } = req.params;
    const { motivoRechazo, aprobadoPor } = req.body;

    if (!motivoRechazo) {
      return res.status(400).json({
        success: false,
        error: 'Debe proporcionar un motivo de rechazo',
      });
    }

    const orden = await prisma.ordenCompra.findFirst({
      where: { id, tenantId },
    });

    if (!orden) {
      return res.status(404).json({
        success: false,
        error: 'Orden de compra no encontrada',
      });
    }

    if (orden.estado !== 'PENDIENTE_APROBACION') {
      return res.status(400).json({
        success: false,
        error: 'Solo se pueden rechazar órdenes en estado PENDIENTE_APROBACION',
      });
    }

    const ordenActualizada = await prisma.ordenCompra.update({
      where: { id },
      data: {
        estado: 'RECHAZADA',
        aprobadoPor,
        motivoRechazo,
        fechaAprobacion: new Date(),
      },
      include: {
        proveedor: true,
        items: true,
      },
    });

    res.json({
      success: true,
      data: ordenActualizada,
      message: 'Orden rechazada',
    });
  } catch (error) {
    console.error('Error rejecting orden:', error);
    res.status(500).json({
      success: false,
      error: 'Error al rechazar orden',
    });
  }
};

// PUT /api/ordenes-compra/:id/anular - Anular orden de compra
export const anularOrdenCompra = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { id } = req.params;

    const orden = await prisma.ordenCompra.findFirst({
      where: { id, tenantId },
    });

    if (!orden) {
      return res.status(404).json({
        success: false,
        error: 'Orden de compra no encontrada',
      });
    }

    if (orden.estado === 'ANULADA') {
      return res.status(400).json({
        success: false,
        error: 'La orden ya está anulada',
      });
    }

    const ordenActualizada = await prisma.ordenCompra.update({
      where: { id },
      data: {
        estado: 'ANULADA',
      },
      include: {
        proveedor: true,
        items: true,
      },
    });

    res.json({
      success: true,
      data: ordenActualizada,
      message: 'Orden anulada exitosamente',
    });
  } catch (error) {
    console.error('Error canceling orden:', error);
    res.status(500).json({
      success: false,
      error: 'Error al anular orden',
    });
  }
};
