import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/talonarios
 * Get all talonarios for the authenticated tenant
 * Query params: ?tipoComprobante=FACTURA|NOTA_CREDITO, ?activo=boolean
 */
export async function getTalonarios(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { tipoComprobante, activo } = req.query;

        const where: any = { tenantId };

        if (tipoComprobante) {
            where.tipoComprobante = tipoComprobante;
        }

        if (activo !== undefined) {
            where.activo = activo === 'true';
        }

        const talonarios = await prisma.talonario.findMany({
            where,
            orderBy: [{ tipoComprobante: 'asc' }, { numeroTimbrado: 'desc' }]
        });

        res.json(talonarios);
    } catch (error) {
        console.error('Error fetching talonarios:', error);
        res.status(500).json({ error: 'Failed to fetch talonarios' });
    }
}

/**
 * GET /api/talonarios/:id
 * Get single talonario by ID
 */
export async function getTalonario(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { id } = req.params;

        const talonario = await prisma.talonario.findFirst({
            where: { id, tenantId },
            include: {
                facturasEmitidas: {
                    orderBy: { numeroFactura: 'desc' },
                    take: 10
                }
            }
        });

        if (!talonario) {
            return res.status(404).json({ error: 'Talonario not found' });
        }

        res.json(talonario);
    } catch (error) {
        console.error('Error fetching talonario:', error);
        res.status(500).json({ error: 'Failed to fetch talonario' });
    }
}

/**
 * POST /api/talonarios
 * Create new talonario
 */
export async function createTalonario(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const {
            tipoComprobante,
            numeroTimbrado,
            fechaVigenciaDesde,
            fechaVigenciaHasta,
            establecimiento,
            puntoVenta,
            numeroInicial,
            numeroFinal,
            descripcion,
            observaciones
        } = req.body;

        // Validation
        if (!tipoComprobante || !numeroTimbrado || !fechaVigenciaDesde || !fechaVigenciaHasta ||
            !establecimiento || !puntoVenta || !numeroInicial || !numeroFinal) {
            return res.status(400).json({
                error: 'All required fields must be provided'
            });
        }

        // Validate tipoComprobante
        const tiposValidos = ['FACTURA', 'NOTA_CREDITO', 'NOTA_DEBITO', 'AUTOFACTURA'];
        if (!tiposValidos.includes(tipoComprobante)) {
            return res.status(400).json({
                error: 'tipoComprobante must be one of: ' + tiposValidos.join(', ')
            });
        }

        // Validate dates
        const desde = new Date(fechaVigenciaDesde);
        const hasta = new Date(fechaVigenciaHasta);
        if (hasta <= desde) {
            return res.status(400).json({
                error: 'fechaVigenciaHasta must be after fechaVigenciaDesde'
            });
        }

        // Validate numbers
        const numInicial = parseInt(numeroInicial);
        const numFinal = parseInt(numeroFinal);
        if (numFinal < numInicial) {
            return res.status(400).json({
                error: 'numeroFinal must be greater than or equal to numeroInicial'
            });
        }

        // Check if talonario already exists
        const existing = await prisma.talonario.findFirst({
            where: {
                tenantId,
                numeroTimbrado,
                establecimiento,
                puntoVenta
            }
        });

        if (existing) {
            return res.status(409).json({
                error: 'Talonario with this timbrado, establecimiento and punto de venta already exists'
            });
        }

        const talonario = await prisma.talonario.create({
            data: {
                tenantId,
                tipoComprobante,
                numeroTimbrado,
                fechaVigenciaDesde: desde,
                fechaVigenciaHasta: hasta,
                establecimiento,
                puntoVenta,
                numeroInicial: numInicial,
                numeroFinal: numFinal,
                siguienteNumero: numInicial,
                descripcion,
                observaciones
            }
        });

        res.status(201).json(talonario);
    } catch (error) {
        console.error('Error creating talonario:', error);
        res.status(500).json({ error: 'Failed to create talonario' });
    }
}

/**
 * PUT /api/talonarios/:id
 * Update talonario
 */
export async function updateTalonario(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { id } = req.params;
        const updateData = req.body;

        // Check if talonario exists and belongs to tenant
        const existing = await prisma.talonario.findFirst({
            where: { id, tenantId }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Talonario not found' });
        }

        // Convert date strings to Date objects
        if (updateData.fechaVigenciaDesde) {
            updateData.fechaVigenciaDesde = new Date(updateData.fechaVigenciaDesde);
        }
        if (updateData.fechaVigenciaHasta) {
            updateData.fechaVigenciaHasta = new Date(updateData.fechaVigenciaHasta);
        }

        // Convert numeric strings to numbers
        if (updateData.numeroInicial) {
            updateData.numeroInicial = parseInt(updateData.numeroInicial);
        }
        if (updateData.numeroFinal) {
            updateData.numeroFinal = parseInt(updateData.numeroFinal);
        }
        if (updateData.siguienteNumero) {
            updateData.siguienteNumero = parseInt(updateData.siguienteNumero);
        }

        // Check if agotado
        if (updateData.siguienteNumero && updateData.numeroFinal) {
            updateData.agotado = updateData.siguienteNumero > updateData.numeroFinal;
        } else if (updateData.siguienteNumero) {
            updateData.agotado = updateData.siguienteNumero > existing.numeroFinal;
        } else if (updateData.numeroFinal) {
            updateData.agotado = existing.siguienteNumero > updateData.numeroFinal;
        }

        const talonario = await prisma.talonario.update({
            where: { id },
            data: updateData
        });

        res.json(talonario);
    } catch (error) {
        console.error('Error updating talonario:', error);
        res.status(500).json({ error: 'Failed to update talonario' });
    }
}

/**
 * DELETE /api/talonarios/:id
 * Deactivate talonario (soft delete)
 */
export async function deleteTalonario(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { id } = req.params;

        // Check if talonario exists and belongs to tenant
        const existing = await prisma.talonario.findFirst({
            where: { id, tenantId }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Talonario not found' });
        }

        // Check if there are facturas emitidas
        const facturasCount = await prisma.facturaEmitida.count({
            where: { talonarioId: id }
        });

        if (facturasCount > 0) {
            return res.status(400).json({
                error: 'Cannot deactivate talonario with emitted invoices'
            });
        }

        // Soft delete
        const talonario = await prisma.talonario.update({
            where: { id },
            data: { activo: false }
        });

        res.json({ message: 'Talonario deactivated successfully', talonario });
    } catch (error) {
        console.error('Error deactivating talonario:', error);
        res.status(500).json({ error: 'Failed to deactivate talonario' });
    }
}
