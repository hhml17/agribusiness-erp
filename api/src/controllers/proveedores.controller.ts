import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/proveedores
 * Get all proveedores for the authenticated tenant
 */
export async function getProveedores(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { activo } = req.query;

        const where: any = { tenantId };
        if (activo !== undefined) {
            where.activo = activo === 'true';
        }

        const proveedores = await prisma.proveedor.findMany({
            where,
            orderBy: { nombre: 'asc' }
        });

        res.json(proveedores);
    } catch (error) {
        console.error('Error fetching proveedores:', error);
        res.status(500).json({ error: 'Failed to fetch proveedores' });
    }
}

/**
 * GET /api/proveedores/:id
 * Get single proveedor by ID
 */
export async function getProveedor(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { id } = req.params;

        const proveedor = await prisma.proveedor.findFirst({
            where: { id, tenantId },
            include: {
                compras: {
                    orderBy: { fecha: 'desc' },
                    take: 10
                }
            }
        });

        if (!proveedor) {
            return res.status(404).json({ error: 'Proveedor not found' });
        }

        res.json(proveedor);
    } catch (error) {
        console.error('Error fetching proveedor:', error);
        res.status(500).json({ error: 'Failed to fetch proveedor' });
    }
}

/**
 * POST /api/proveedores
 * Create new proveedor
 */
export async function createProveedor(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { codigo, nombre, ruc, direccion, telefono, email } = req.body;

        // Validation
        if (!codigo || !nombre) {
            return res.status(400).json({ error: 'Codigo and nombre are required' });
        }

        // Check if codigo already exists for this tenant
        const existing = await prisma.proveedor.findFirst({
            where: { tenantId, codigo }
        });

        if (existing) {
            return res.status(409).json({ error: 'Proveedor with this codigo already exists' });
        }

        const proveedor = await prisma.proveedor.create({
            data: {
                tenantId,
                codigo,
                nombre,
                ruc,
                direccion,
                telefono,
                email
            }
        });

        res.status(201).json(proveedor);
    } catch (error) {
        console.error('Error creating proveedor:', error);
        res.status(500).json({ error: 'Failed to create proveedor' });
    }
}

/**
 * PUT /api/proveedores/:id
 * Update proveedor
 */
export async function updateProveedor(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { id } = req.params;
        const { codigo, nombre, ruc, direccion, telefono, email, activo } = req.body;

        // Check if proveedor exists and belongs to tenant
        const existing = await prisma.proveedor.findFirst({
            where: { id, tenantId }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Proveedor not found' });
        }

        // If codigo is being changed, check uniqueness
        if (codigo && codigo !== existing.codigo) {
            const duplicate = await prisma.proveedor.findFirst({
                where: { tenantId, codigo }
            });
            if (duplicate) {
                return res.status(409).json({ error: 'Proveedor with this codigo already exists' });
            }
        }

        const proveedor = await prisma.proveedor.update({
            where: { id },
            data: {
                codigo,
                nombre,
                ruc,
                direccion,
                telefono,
                email,
                activo
            }
        });

        res.json(proveedor);
    } catch (error) {
        console.error('Error updating proveedor:', error);
        res.status(500).json({ error: 'Failed to update proveedor' });
    }
}

/**
 * DELETE /api/proveedores/:id
 * Deactivate proveedor (soft delete)
 */
export async function deleteProveedor(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { id } = req.params;

        // Check if proveedor exists and belongs to tenant
        const existing = await prisma.proveedor.findFirst({
            where: { id, tenantId }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Proveedor not found' });
        }

        // Soft delete
        const proveedor = await prisma.proveedor.update({
            where: { id },
            data: { activo: false }
        });

        res.json({ message: 'Proveedor deactivated successfully', proveedor });
    } catch (error) {
        console.error('Error deactivating proveedor:', error);
        res.status(500).json({ error: 'Failed to deactivate proveedor' });
    }
}
