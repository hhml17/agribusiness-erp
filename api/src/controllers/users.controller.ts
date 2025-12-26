import { Response } from 'express';
import { TenantRequest } from '../middleware/tenant.js';
import { prisma } from '../server.js';

/**
 * Get current user's profile
 */
export async function getProfile(req: TenantRequest, res: Response) {
    try {
        const azureAdId = req.user?.oid;
        const tenantId = req.tenantId;

        if (!azureAdId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        if (!tenantId) {
            res.status(400).json({ error: 'Tenant ID is required' });
            return;
        }

        const usuario = await prisma.usuario.findFirst({
            where: {
                azureAdId,
                tenantId,
            },
            select: {
                id: true,
                email: true,
                nombre: true,
                apellido: true,
                azureAdId: true,
                role: true,
                activo: true,
                createdAt: true,
                updatedAt: true,
                tenantId: true,
            },
        });

        if (!usuario) {
            res.status(404).json({ error: 'User profile not found' });
            return;
        }

        res.json(usuario);
    } catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({ error: 'Failed to get user profile' });
    }
}

/**
 * Update current user's profile
 */
export async function updateProfile(req: TenantRequest, res: Response) {
    try {
        const azureAdId = req.user?.oid;
        const tenantId = req.tenantId;

        if (!azureAdId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        if (!tenantId) {
            res.status(400).json({ error: 'Tenant ID is required' });
            return;
        }

        const { nombre, apellido, email } = req.body;

        // Find the user first
        const existingUser = await prisma.usuario.findFirst({
            where: {
                azureAdId,
                tenantId,
            },
        });

        if (!existingUser) {
            res.status(404).json({ error: 'User profile not found' });
            return;
        }

        // If email is being changed, verify it's not already taken by another user
        if (email && email !== existingUser.email) {
            const emailExists = await prisma.usuario.findFirst({
                where: {
                    email,
                    tenantId,
                    id: { not: existingUser.id },
                },
            });

            if (emailExists) {
                res.status(400).json({ error: 'Email is already in use' });
                return;
            }
        }

        // Update the user
        const updatedUser = await prisma.usuario.update({
            where: {
                id: existingUser.id,
            },
            data: {
                ...(nombre && { nombre }),
                ...(apellido && { apellido }),
                ...(email && { email }),
            },
            select: {
                id: true,
                email: true,
                nombre: true,
                apellido: true,
                azureAdId: true,
                role: true,
                activo: true,
                createdAt: true,
                updatedAt: true,
                tenantId: true,
            },
        });

        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ error: 'Failed to update user profile' });
    }
}
