import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/compras
 * Get all compras for the authenticated tenant
 */
export async function getCompras(req: Request, res: Response) {
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

        const compras = await prisma.compra.findMany({
            where,
            include: {
                proveedor: true,
                items: {
                    include: {
                        producto: true
                    }
                }
            },
            orderBy: { fecha: 'desc' }
        });

        res.json(compras);
    } catch (error) {
        console.error('Error fetching compras:', error);
        res.status(500).json({ error: 'Failed to fetch compras' });
    }
}

/**
 * GET /api/compras/:id
 * Get single compra by ID
 */
export async function getCompra(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { id } = req.params;

        const compra = await prisma.compra.findFirst({
            where: { id, tenantId },
            include: {
                proveedor: true,
                items: {
                    include: {
                        producto: true
                    }
                }
            }
        });

        if (!compra) {
            return res.status(404).json({ error: 'Compra not found' });
        }

        res.json(compra);
    } catch (error) {
        console.error('Error fetching compra:', error);
        res.status(500).json({ error: 'Failed to fetch compra' });
    }
}

/**
 * POST /api/compras
 * Create new compra with items
 */
export async function createCompra(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { numero, proveedorId, items, observaciones } = req.body;

        // Validation
        if (!numero || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Numero and items are required' });
        }

        // Check if numero already exists for this tenant
        const existing = await prisma.compra.findFirst({
            where: { tenantId, numero }
        });

        if (existing) {
            return res.status(409).json({ error: 'Compra with this numero already exists' });
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

            const itemSubtotal = Number(item.cantidad) * Number(item.precioUnit || producto.precioCompra);
            subtotal += itemSubtotal;

            itemsData.push({
                productoId: item.productoId,
                cantidad: item.cantidad,
                precioUnit: item.precioUnit || producto.precioCompra,
                subtotal: itemSubtotal
            });
        }

        const impuesto = subtotal * 0.1; // 10% IVA
        const total = subtotal + impuesto;

        // Create compra with items
        const compra = await prisma.compra.create({
            data: {
                tenantId,
                numero,
                proveedorId,
                subtotal,
                impuesto,
                total,
                observaciones,
                items: {
                    create: itemsData
                }
            },
            include: {
                proveedor: true,
                items: {
                    include: {
                        producto: true
                    }
                }
            }
        });

        res.status(201).json(compra);
    } catch (error) {
        console.error('Error creating compra:', error);
        res.status(500).json({ error: 'Failed to create compra' });
    }
}

/**
 * PUT /api/compras/:id
 * Update compra status and stock when received
 */
export async function updateCompra(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { id } = req.params;
        const { estado, observaciones } = req.body;

        // Get compra with items
        const existing = await prisma.compra.findFirst({
            where: { id, tenantId },
            include: {
                items: true
            }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Compra not found' });
        }

        // If marking as received, update stock
        if (estado === 'RECIBIDA' && existing.estado !== 'RECIBIDA') {
            for (const item of existing.items) {
                await prisma.producto.update({
                    where: { id: item.productoId },
                    data: {
                        stock: {
                            increment: Number(item.cantidad)
                        }
                    }
                });
            }
        }

        const compra = await prisma.compra.update({
            where: { id },
            data: {
                estado,
                observaciones
            },
            include: {
                proveedor: true,
                items: {
                    include: {
                        producto: true
                    }
                }
            }
        });

        res.json(compra);
    } catch (error) {
        console.error('Error updating compra:', error);
        res.status(500).json({ error: 'Failed to update compra' });
    }
}

/**
 * DELETE /api/compras/:id
 * Cancel compra
 */
export async function deleteCompra(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { id } = req.params;

        // Get compra
        const compra = await prisma.compra.findFirst({
            where: { id, tenantId },
            include: {
                items: true
            }
        });

        if (!compra) {
            return res.status(404).json({ error: 'Compra not found' });
        }

        if (compra.estado === 'CANCELADA') {
            return res.status(400).json({ error: 'Compra already cancelled' });
        }

        // If compra was received, restore stock
        if (compra.estado === 'RECIBIDA') {
            for (const item of compra.items) {
                await prisma.producto.update({
                    where: { id: item.productoId },
                    data: {
                        stock: {
                            decrement: Number(item.cantidad)
                        }
                    }
                });
            }
        }

        // Update compra status
        const updatedCompra = await prisma.compra.update({
            where: { id },
            data: { estado: 'CANCELADA' }
        });

        res.json({ message: 'Compra cancelled successfully', compra: updatedCompra });
    } catch (error) {
        console.error('Error cancelling compra:', error);
        res.status(500).json({ error: 'Failed to cancel compra' });
    }
}
