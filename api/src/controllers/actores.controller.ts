import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/actores
 * Get all actores for the authenticated tenant
 * Query params: ?tipoPersona=FISICA|JURIDICA, ?esCliente=boolean, ?esProveedor=boolean, ?esAsociado=boolean
 */
export async function getActores(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { tipoPersona, esCliente, esProveedor, esAsociado, activo } = req.query;

        const where: any = { tenantId };

        if (tipoPersona) {
            where.tipoPersona = tipoPersona;
        }

        if (esCliente !== undefined) {
            where.esCliente = esCliente === 'true';
        }

        if (esProveedor !== undefined) {
            where.esProveedor = esProveedor === 'true';
        }

        if (esAsociado !== undefined) {
            where.esAsociado = esAsociado === 'true';
        }

        if (activo !== undefined) {
            where.activo = activo === 'true';
        }

        const actores = await prisma.actor.findMany({
            where,
            include: {
                cuentasContablesPorRol: {
                    include: {
                        cuentaContable: true
                    }
                }
            },
            orderBy: { nombre: 'asc' }
        });

        res.json(actores);
    } catch (error) {
        console.error('Error fetching actores:', error);
        res.status(500).json({ error: 'Failed to fetch actores' });
    }
}

/**
 * GET /api/actores/:id
 * Get single actor by ID
 */
export async function getActor(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { id } = req.params;

        const actor = await prisma.actor.findFirst({
            where: { id, tenantId },
            include: {
                cuentasContablesPorRol: {
                    include: {
                        cuentaContable: true
                    }
                }
            }
        });

        if (!actor) {
            return res.status(404).json({ error: 'Actor not found' });
        }

        res.json(actor);
    } catch (error) {
        console.error('Error fetching actor:', error);
        res.status(500).json({ error: 'Failed to fetch actor' });
    }
}

/**
 * POST /api/actores
 * Create new actor
 */
export async function createActor(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const {
            tipoPersona,
            tipoDocumento,
            numeroDocumento,
            dv,
            nombre,
            nombreFantasia,
            apellido,
            fechaNacimiento,
            estadoCivil,
            razonSocial,
            fechaConstitucion,
            representanteLegal,
            email,
            telefono,
            celular,
            direccion,
            ciudad,
            departamento,
            pais,
            esCliente,
            esProveedor,
            esAsociado
        } = req.body;

        // Validation
        if (!tipoPersona || !tipoDocumento || !numeroDocumento || !nombre || !nombreFantasia) {
            return res.status(400).json({
                error: 'tipoPersona, tipoDocumento, numeroDocumento, nombre and nombreFantasia are required'
            });
        }

        // Validate tipoPersona
        if (!['FISICA', 'JURIDICA'].includes(tipoPersona)) {
            return res.status(400).json({
                error: 'tipoPersona must be FISICA or JURIDICA'
            });
        }

        // Check if numeroDocumento already exists for this tenant
        const existing = await prisma.actor.findFirst({
            where: { tenantId, numeroDocumento }
        });

        if (existing) {
            return res.status(409).json({
                error: 'Actor with this numeroDocumento already exists'
            });
        }

        const actor = await prisma.actor.create({
            data: {
                tenantId,
                tipoPersona,
                tipoDocumento,
                numeroDocumento,
                dv,
                nombre,
                nombreFantasia,
                apellido,
                fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : undefined,
                estadoCivil,
                razonSocial,
                fechaConstitucion: fechaConstitucion ? new Date(fechaConstitucion) : undefined,
                representanteLegal,
                email,
                telefono,
                celular,
                direccion,
                ciudad,
                departamento,
                pais: pais || 'PY',
                esCliente: esCliente || false,
                esProveedor: esProveedor || false,
                esAsociado: esAsociado || false
            }
        });

        res.status(201).json(actor);
    } catch (error) {
        console.error('Error creating actor:', error);
        res.status(500).json({ error: 'Failed to create actor' });
    }
}

/**
 * PUT /api/actores/:id
 * Update actor
 */
export async function updateActor(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { id } = req.params;
        const updateData = req.body;

        // Check if actor exists and belongs to tenant
        const existing = await prisma.actor.findFirst({
            where: { id, tenantId }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Actor not found' });
        }

        // If numeroDocumento is being changed, check uniqueness
        if (updateData.numeroDocumento && updateData.numeroDocumento !== existing.numeroDocumento) {
            const duplicate = await prisma.actor.findFirst({
                where: { tenantId, numeroDocumento: updateData.numeroDocumento }
            });
            if (duplicate) {
                return res.status(409).json({
                    error: 'Actor with this numeroDocumento already exists'
                });
            }
        }

        // Convert date strings to Date objects
        if (updateData.fechaNacimiento) {
            updateData.fechaNacimiento = new Date(updateData.fechaNacimiento);
        }
        if (updateData.fechaConstitucion) {
            updateData.fechaConstitucion = new Date(updateData.fechaConstitucion);
        }

        const actor = await prisma.actor.update({
            where: { id },
            data: updateData
        });

        res.json(actor);
    } catch (error) {
        console.error('Error updating actor:', error);
        res.status(500).json({ error: 'Failed to update actor' });
    }
}

/**
 * DELETE /api/actores/:id
 * Deactivate actor (soft delete)
 */
export async function deleteActor(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { id } = req.params;

        // Check if actor exists and belongs to tenant
        const existing = await prisma.actor.findFirst({
            where: { id, tenantId }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Actor not found' });
        }

        // Soft delete
        const actor = await prisma.actor.update({
            where: { id },
            data: { activo: false }
        });

        res.json({ message: 'Actor deactivated successfully', actor });
    } catch (error) {
        console.error('Error deactivating actor:', error);
        res.status(500).json({ error: 'Failed to deactivate actor' });
    }
}

/**
 * GET /api/actores/:id/cuentas
 * Get all cuentas contables for an actor
 */
export async function getActorCuentas(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { id } = req.params;

        // Verify actor exists and belongs to tenant
        const actor = await prisma.actor.findFirst({
            where: { id, tenantId }
        });

        if (!actor) {
            return res.status(404).json({ error: 'Actor not found' });
        }

        const cuentas = await prisma.actorCuentaContable.findMany({
            where: { actorId: id, tenantId },
            include: {
                cuentaContable: true
            },
            orderBy: [{ rol: 'asc' }, { moneda: 'asc' }]
        });

        res.json(cuentas);
    } catch (error) {
        console.error('Error fetching actor cuentas:', error);
        res.status(500).json({ error: 'Failed to fetch actor cuentas' });
    }
}

/**
 * POST /api/actores/:id/cuentas
 * Add cuenta contable for an actor
 */
export async function createActorCuenta(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { id: actorId } = req.params;
        const { rol, moneda, cuentaContableId, descripcion } = req.body;

        // Validation
        if (!rol || !moneda || !cuentaContableId) {
            return res.status(400).json({
                error: 'rol, moneda and cuentaContableId are required'
            });
        }

        // Validate rol
        if (!['CLIENTE', 'PROVEEDOR', 'ASOCIADO'].includes(rol)) {
            return res.status(400).json({
                error: 'rol must be CLIENTE, PROVEEDOR or ASOCIADO'
            });
        }

        // Validate moneda
        if (!['USD', 'PYG'].includes(moneda)) {
            return res.status(400).json({
                error: 'moneda must be USD or PYG'
            });
        }

        // Verify actor exists and belongs to tenant
        const actor = await prisma.actor.findFirst({
            where: { id: actorId, tenantId }
        });

        if (!actor) {
            return res.status(404).json({ error: 'Actor not found' });
        }

        // Verify cuenta contable exists and belongs to tenant
        const cuentaContable = await prisma.planCuentas.findFirst({
            where: { id: cuentaContableId, tenantId }
        });

        if (!cuentaContable) {
            return res.status(404).json({ error: 'Cuenta contable not found' });
        }

        // Check if cuenta already exists for this actor, rol and moneda
        const existing = await prisma.actorCuentaContable.findFirst({
            where: { actorId, rol, moneda }
        });

        if (existing) {
            return res.status(409).json({
                error: 'Cuenta for this rol and moneda already exists'
            });
        }

        const actorCuenta = await prisma.actorCuentaContable.create({
            data: {
                tenantId,
                actorId,
                rol,
                moneda,
                cuentaContableId,
                descripcion
            },
            include: {
                cuentaContable: true
            }
        });

        res.status(201).json(actorCuenta);
    } catch (error) {
        console.error('Error creating actor cuenta:', error);
        res.status(500).json({ error: 'Failed to create actor cuenta' });
    }
}

/**
 * DELETE /api/actores/:id/cuentas/:cuentaId
 * Delete cuenta contable for an actor
 */
export async function deleteActorCuenta(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { id: actorId, cuentaId } = req.params;

        // Verify cuenta exists and belongs to actor and tenant
        const cuenta = await prisma.actorCuentaContable.findFirst({
            where: { id: cuentaId, actorId, tenantId }
        });

        if (!cuenta) {
            return res.status(404).json({ error: 'Actor cuenta not found' });
        }

        await prisma.actorCuentaContable.delete({
            where: { id: cuentaId }
        });

        res.json({ message: 'Actor cuenta deleted successfully' });
    } catch (error) {
        console.error('Error deleting actor cuenta:', error);
        res.status(500).json({ error: 'Failed to delete actor cuenta' });
    }
}
