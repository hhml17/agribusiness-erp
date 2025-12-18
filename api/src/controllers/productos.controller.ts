import { Response } from 'express';
import { TenantRequest } from '../middleware/tenant';
import { prisma } from '../server';

/**
 * Get all productos for a tenant
 */
export async function getProductos(req: TenantRequest, res: Response): Promise<void> {
    try {
        if (!req.tenantId) {
            res.status(400).json({ error: 'Tenant ID required' });
            return;
        }

        const { categoria, activo } = req.query;

        const productos = await prisma.producto.findMany({
            where: {
                tenantId: req.tenantId,
                ...(categoria && { categoria: categoria as string }),
                ...(activo !== undefined && { activo: activo === 'true' })
            },
            orderBy: {
                nombre: 'asc'
            }
        });

        res.json(productos);
    } catch (error) {
        console.error('Error fetching productos:', error);
        res.status(500).json({ error: 'Failed to fetch productos' });
    }
}

/**
 * Get single producto by ID
 */
export async function getProducto(req: TenantRequest, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!req.tenantId) {
            res.status(400).json({ error: 'Tenant ID required' });
            return;
        }

        const producto = await prisma.producto.findFirst({
            where: {
                id,
                tenantId: req.tenantId
            }
        });

        if (!producto) {
            res.status(404).json({ error: 'Producto not found' });
            return;
        }

        res.json(producto);
    } catch (error) {
        console.error('Error fetching producto:', error);
        res.status(500).json({ error: 'Failed to fetch producto' });
    }
}

/**
 * Create new producto
 */
export async function createProducto(req: TenantRequest, res: Response): Promise<void> {
    try {
        if (!req.tenantId) {
            res.status(400).json({ error: 'Tenant ID required' });
            return;
        }

        const {
            codigo,
            nombre,
            descripcion,
            categoria,
            unidadMedida,
            precioCompra,
            precioVenta,
            stock,
            stockMinimo
        } = req.body;

        // Validate required fields
        if (!codigo || !nombre || !unidadMedida || !precioCompra || !precioVenta) {
            res.status(400).json({
                error: 'Missing required fields: codigo, nombre, unidadMedida, precioCompra, precioVenta'
            });
            return;
        }

        // Check if codigo already exists for this tenant
        const existing = await prisma.producto.findFirst({
            where: {
                tenantId: req.tenantId,
                codigo
            }
        });

        if (existing) {
            res.status(400).json({ error: 'Producto with this codigo already exists' });
            return;
        }

        // Create producto
        const producto = await prisma.producto.create({
            data: {
                tenantId: req.tenantId,
                codigo,
                nombre,
                descripcion,
                categoria,
                unidadMedida,
                precioCompra,
                precioVenta,
                stock: stock || 0,
                stockMinimo,
                activo: true
            }
        });

        res.status(201).json(producto);
    } catch (error) {
        console.error('Error creating producto:', error);
        res.status(500).json({ error: 'Failed to create producto' });
    }
}

/**
 * Update producto
 */
export async function updateProducto(req: TenantRequest, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!req.tenantId) {
            res.status(400).json({ error: 'Tenant ID required' });
            return;
        }

        const {
            codigo,
            nombre,
            descripcion,
            categoria,
            unidadMedida,
            precioCompra,
            precioVenta,
            stock,
            stockMinimo
        } = req.body;

        // Verify producto exists and belongs to tenant
        const existing = await prisma.producto.findFirst({
            where: {
                id,
                tenantId: req.tenantId
            }
        });

        if (!existing) {
            res.status(404).json({ error: 'Producto not found' });
            return;
        }

        // Update producto
        const producto = await prisma.producto.update({
            where: { id },
            data: {
                codigo,
                nombre,
                descripcion,
                categoria,
                unidadMedida,
                precioCompra,
                precioVenta,
                stock,
                stockMinimo
            }
        });

        res.json(producto);
    } catch (error) {
        console.error('Error updating producto:', error);
        res.status(500).json({ error: 'Failed to update producto' });
    }
}

/**
 * Delete producto (soft delete)
 */
export async function deleteProducto(req: TenantRequest, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!req.tenantId) {
            res.status(400).json({ error: 'Tenant ID required' });
            return;
        }

        // Verify producto exists and belongs to tenant
        const existing = await prisma.producto.findFirst({
            where: {
                id,
                tenantId: req.tenantId
            }
        });

        if (!existing) {
            res.status(404).json({ error: 'Producto not found' });
            return;
        }

        // Soft delete
        const producto = await prisma.producto.update({
            where: { id },
            data: { activo: false }
        });

        res.json({ message: 'Producto deactivated', producto });
    } catch (error) {
        console.error('Error deleting producto:', error);
        res.status(500).json({ error: 'Failed to delete producto' });
    }
}

/**
 * Get productos with low stock
 */
export async function getProductosBajoStock(req: TenantRequest, res: Response): Promise<void> {
    try {
        if (!req.tenantId) {
            res.status(400).json({ error: 'Tenant ID required' });
            return;
        }

        const productos = await prisma.producto.findMany({
            where: {
                tenantId: req.tenantId,
                activo: true,
                AND: [
                    {
                        stockMinimo: {
                            not: null
                        }
                    }
                ]
            }
        });

        // Filter products where stock <= stockMinimo
        const bajoStock = productos.filter(p => {
            if (p.stockMinimo === null) return false;
            return p.stock <= p.stockMinimo;
        });

        res.json(bajoStock);
    } catch (error) {
        console.error('Error fetching low stock productos:', error);
        res.status(500).json({ error: 'Failed to fetch low stock productos' });
    }
}
