import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/clientes
 * Get all clientes for the authenticated tenant
 */
export async function getClientes(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { activo } = req.query;

        const where: any = { tenantId };
        if (activo !== undefined) {
            where.activo = activo === 'true';
        }

        const clientes = await prisma.cliente.findMany({
            where,
            orderBy: { nombre: 'asc' }
        });

        res.json(clientes);
    } catch (error) {
        console.error('Error fetching clientes:', error);
        res.status(500).json({ error: 'Failed to fetch clientes' });
    }
}

/**
 * GET /api/clientes/:id
 * Get single cliente by ID
 */
export async function getCliente(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { id } = req.params;

        const cliente = await prisma.cliente.findFirst({
            where: { id, tenantId },
            include: {
                ventas: {
                    orderBy: { fecha: 'desc' },
                    take: 10
                }
            }
        });

        if (!cliente) {
            return res.status(404).json({ error: 'Cliente not found' });
        }

        res.json(cliente);
    } catch (error) {
        console.error('Error fetching cliente:', error);
        res.status(500).json({ error: 'Failed to fetch cliente' });
    }
}

/**
 * POST /api/clientes
 * Create new cliente
 */
export async function createCliente(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { codigo, nombre, ruc, direccion, telefono, email } = req.body;

        // Validation
        if (!codigo || !nombre) {
            return res.status(400).json({ error: 'Codigo and nombre are required' });
        }

        // Check if codigo already exists for this tenant
        const existing = await prisma.cliente.findFirst({
            where: { tenantId, codigo }
        });

        if (existing) {
            return res.status(409).json({ error: 'Cliente with this codigo already exists' });
        }

        const cliente = await prisma.cliente.create({
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

        res.status(201).json(cliente);
    } catch (error) {
        console.error('Error creating cliente:', error);
        res.status(500).json({ error: 'Failed to create cliente' });
    }
}

/**
 * PUT /api/clientes/:id
 * Update cliente
 */
export async function updateCliente(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { id } = req.params;
        const { codigo, nombre, ruc, direccion, telefono, email, activo } = req.body;

        // Check if cliente exists and belongs to tenant
        const existing = await prisma.cliente.findFirst({
            where: { id, tenantId }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Cliente not found' });
        }

        // If codigo is being changed, check uniqueness
        if (codigo && codigo !== existing.codigo) {
            const duplicate = await prisma.cliente.findFirst({
                where: { tenantId, codigo }
            });
            if (duplicate) {
                return res.status(409).json({ error: 'Cliente with this codigo already exists' });
            }
        }

        const cliente = await prisma.cliente.update({
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

        res.json(cliente);
    } catch (error) {
        console.error('Error updating cliente:', error);
        res.status(500).json({ error: 'Failed to update cliente' });
    }
}

/**
 * DELETE /api/clientes/:id
 * Deactivate cliente (soft delete)
 */
export async function deleteCliente(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { id } = req.params;

        // Check if cliente exists and belongs to tenant
        const existing = await prisma.cliente.findFirst({
            where: { id, tenantId }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Cliente not found' });
        }

        // Soft delete
        const cliente = await prisma.cliente.update({
            where: { id },
            data: { activo: false }
        });

        res.json({ message: 'Cliente deactivated successfully', cliente });
    } catch (error) {
        console.error('Error deactivating cliente:', error);
        res.status(500).json({ error: 'Failed to deactivate cliente' });
    }
}
