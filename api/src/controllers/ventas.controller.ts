import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/ventas
 * Get all ventas for the authenticated tenant
 */
export async function getVentas(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { estado, desde, hasta } = req.query;

        const where: any = { tenantId };

        if (estado) {
            where.estado = estado;
        }

        if (desde || hasta) {
            where.fecha = {};
            if (desde) where.fecha.gte = new Date(desde as string);
            if (hasta) where.fecha.lte = new Date(hasta as string);
        }

        const ventas = await prisma.venta.findMany({
            where,
            include: {
                cliente: true,
                items: {
                    include: {
                        producto: true
                    }
                }
            },
            orderBy: { fecha: 'desc' }
        });

        res.json(ventas);
    } catch (error) {
        console.error('Error fetching ventas:', error);
        res.status(500).json({ error: 'Failed to fetch ventas' });
    }
}

/**
 * GET /api/ventas/:id
 * Get single venta by ID
 */
export async function getVenta(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { id } = req.params;

        const venta = await prisma.venta.findFirst({
            where: { id, tenantId },
            include: {
                cliente: true,
                items: {
                    include: {
                        producto: true
                    }
                }
            }
        });

        if (!venta) {
            return res.status(404).json({ error: 'Venta not found' });
        }

        res.json(venta);
    } catch (error) {
        console.error('Error fetching venta:', error);
        res.status(500).json({ error: 'Failed to fetch venta' });
    }
}

/**
 * POST /api/ventas
 * Create new venta with items
 */
export async function createVenta(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { numero, clienteId, items, observaciones } = req.body;

        // Validation
        if (!numero || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Numero and items are required' });
        }

        // Check if numero already exists for this tenant
        const existing = await prisma.venta.findFirst({
            where: { tenantId, numero }
        });

        if (existing) {
            return res.status(409).json({ error: 'Venta with this numero already exists' });
        }

        // Calculate totals
        let subtotal = 0;
        const itemsData: any[] = [];

        for (const item of items) {
            const producto = await prisma.producto.findFirst({
                where: { id: item.productoId, tenantId }
            });

            if (!producto) {
                return res.status(404).json({ error: `Producto ${item.productoId} not found` });
            }

            const itemSubtotal = Number(item.cantidad) * Number(item.precioUnit || producto.precioVenta);
            subtotal += itemSubtotal;

            itemsData.push({
                productoId: item.productoId,
                cantidad: item.cantidad,
                precioUnit: item.precioUnit || producto.precioVenta,
                subtotal: itemSubtotal
            });
        }

        const impuesto = subtotal * 0.1; // 10% IVA
        const total = subtotal + impuesto;

        // Create venta with items in a transaction
        const venta = await prisma.venta.create({
            data: {
                tenantId,
                numero,
                clienteId,
                subtotal,
                impuesto,
                total,
                observaciones,
                items: {
                    create: itemsData
                }
            },
            include: {
                cliente: true,
                items: {
                    include: {
                        producto: true
                    }
                }
            }
        });

        // Update stock for each product
        for (const item of itemsData) {
            await prisma.producto.update({
                where: { id: item.productoId },
                data: {
                    stock: {
                        decrement: Number(item.cantidad)
                    }
                }
            });
        }

        res.status(201).json(venta);
    } catch (error) {
        console.error('Error creating venta:', error);
        res.status(500).json({ error: 'Failed to create venta' });
    }
}

/**
 * PUT /api/ventas/:id
 * Update venta status
 */
export async function updateVenta(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { id } = req.params;
        const { estado, observaciones } = req.body;

        // Check if venta exists and belongs to tenant
        const existing = await prisma.venta.findFirst({
            where: { id, tenantId }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Venta not found' });
        }

        const venta = await prisma.venta.update({
            where: { id },
            data: {
                estado,
                observaciones
            },
            include: {
                cliente: true,
                items: {
                    include: {
                        producto: true
                    }
                }
            }
        });

        res.json(venta);
    } catch (error) {
        console.error('Error updating venta:', error);
        res.status(500).json({ error: 'Failed to update venta' });
    }
}

/**
 * DELETE /api/ventas/:id
 * Cancel venta and restore stock
 */
export async function deleteVenta(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { id } = req.params;

        // Get venta with items
        const venta = await prisma.venta.findFirst({
            where: { id, tenantId },
            include: {
                items: true
            }
        });

        if (!venta) {
            return res.status(404).json({ error: 'Venta not found' });
        }

        if (venta.estado === 'CANCELADA') {
            return res.status(400).json({ error: 'Venta already cancelled' });
        }

        // Restore stock for each item
        for (const item of venta.items) {
            await prisma.producto.update({
                where: { id: item.productoId },
                data: {
                    stock: {
                        increment: Number(item.cantidad)
                    }
                }
            });
        }

        // Update venta status
        const updatedVenta = await prisma.venta.update({
            where: { id },
            data: { estado: 'CANCELADA' }
        });

        res.json({ message: 'Venta cancelled successfully', venta: updatedVenta });
    } catch (error) {
        console.error('Error cancelling venta:', error);
        res.status(500).json({ error: 'Failed to cancel venta' });
    }
}
