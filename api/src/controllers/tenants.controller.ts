import { Response } from 'express';
import { TenantRequest } from '../middleware/tenant';
import { prisma } from '../server';

/**
 * Get all tenants for the authenticated user
 */
export async function getTenants(req: TenantRequest, res: Response): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        // Find all tenants the user has access to
        const usuarios = await prisma.usuario.findMany({
            where: {
                azureAdId: req.user.oid,
                activo: true
            },
            include: {
                tenant: true
            }
        });

        const tenants = usuarios.map(u => ({
            id: u.tenant.id,
            nombre: u.tenant.nombre,
            ruc: u.tenant.ruc,
            role: u.role
        }));

        res.json(tenants);
    } catch (error) {
        console.error('Error fetching tenants:', error);
        res.status(500).json({ error: 'Failed to fetch tenants' });
    }
}

/**
 * Get single tenant by ID
 */
export async function getTenant(req: TenantRequest, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        const tenant = await prisma.tenant.findUnique({
            where: { id }
        });

        if (!tenant) {
            res.status(404).json({ error: 'Tenant not found' });
            return;
        }

        res.json(tenant);
    } catch (error) {
        console.error('Error fetching tenant:', error);
        res.status(500).json({ error: 'Failed to fetch tenant' });
    }
}

/**
 * Create new tenant (admin only)
 */
export async function createTenant(req: TenantRequest, res: Response): Promise<void> {
    try {
        const { nombre, ruc, direccion, telefono, email } = req.body;

        // Validate required fields
        if (!nombre || !ruc) {
            res.status(400).json({ error: 'Nombre and RUC are required' });
            return;
        }

        // Check if RUC already exists
        const existing = await prisma.tenant.findUnique({
            where: { ruc }
        });

        if (existing) {
            res.status(400).json({ error: 'Tenant with this RUC already exists' });
            return;
        }

        // Create tenant
        const tenant = await prisma.tenant.create({
            data: {
                nombre,
                ruc,
                direccion,
                telefono,
                email,
                activo: true
            }
        });

        // Create admin user for the tenant if authenticated
        if (req.user) {
            await prisma.usuario.create({
                data: {
                    email: req.user.email,
                    nombre: req.user.name,
                    azureAdId: req.user.oid,
                    tenantId: tenant.id,
                    role: 'ADMIN',
                    activo: true
                }
            });
        }

        res.status(201).json(tenant);
    } catch (error) {
        console.error('Error creating tenant:', error);
        res.status(500).json({ error: 'Failed to create tenant' });
    }
}

/**
 * Update tenant
 */
export async function updateTenant(req: TenantRequest, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const { nombre, direccion, telefono, email } = req.body;

        const tenant = await prisma.tenant.update({
            where: { id },
            data: {
                nombre,
                direccion,
                telefono,
                email
            }
        });

        res.json(tenant);
    } catch (error) {
        console.error('Error updating tenant:', error);
        res.status(500).json({ error: 'Failed to update tenant' });
    }
}

/**
 * Deactivate tenant (soft delete)
 */
export async function deactivateTenant(req: TenantRequest, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        const tenant = await prisma.tenant.update({
            where: { id },
            data: { activo: false }
        });

        res.json({ message: 'Tenant deactivated', tenant });
    } catch (error) {
        console.error('Error deactivating tenant:', error);
        res.status(500).json({ error: 'Failed to deactivate tenant' });
    }
}
