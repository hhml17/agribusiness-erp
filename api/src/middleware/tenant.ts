import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { prisma } from '../server';

// Extend AuthRequest to include tenant info
export interface TenantRequest extends AuthRequest {
    tenantId?: string;
    userRole?: string;
}

/**
 * Middleware to extract and validate tenant ID from request
 *
 * Expects X-Tenant-ID header from frontend
 * Validates that user has access to the tenant
 */
export async function validateTenant(
    req: TenantRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;

        if (!tenantId) {
            res.status(400).json({ error: 'Tenant ID is required (X-Tenant-ID header)' });
            return;
        }

        // Verify tenant exists
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId }
        });

        if (!tenant) {
            res.status(404).json({ error: 'Tenant not found' });
            return;
        }

        if (!tenant.activo) {
            res.status(403).json({ error: 'Tenant is inactive' });
            return;
        }

        // If user is authenticated, verify they have access to this tenant
        if (req.user) {
            const usuario = await prisma.usuario.findFirst({
                where: {
                    azureAdId: req.user.oid,
                    tenantId: tenantId,
                    activo: true
                }
            });

            if (!usuario) {
                res.status(403).json({ error: 'User does not have access to this tenant' });
                return;
            }

            // Store user role for authorization
            req.userRole = usuario.role;
        }

        // Store tenant ID in request for use in controllers
        req.tenantId = tenantId;
        next();

    } catch (error) {
        console.error('Tenant validation error:', error);
        res.status(500).json({ error: 'Tenant validation failed' });
        return;
    }
}

/**
 * Middleware to check if user has admin role
 */
export function requireAdmin(
    req: TenantRequest,
    res: Response,
    next: NextFunction
): void {
    if (!req.userRole || req.userRole !== 'ADMIN') {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    next();
}

/**
 * Middleware to check if user has at least user role (not just viewer)
 */
export function requireUser(
    req: TenantRequest,
    res: Response,
    next: NextFunction
): void {
    if (!req.userRole || req.userRole === 'VIEWER') {
        res.status(403).json({ error: 'User access required' });
        return;
    }
    next();
}
