import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/estancias
 * Get all estancias for the authenticated tenant
 * Query params: ?centroCostoId=uuid, ?activo=boolean
 */
export async function getEstancias(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { centroCostoId, activo } = req.query;

        const where: any = { tenantId };

        if (centroCostoId) {
            where.centroCostoId = centroCostoId;
        }

        if (activo !== undefined) {
            where.activo = activo === 'true';
        }

        const estancias = await prisma.estanciaMejorada.findMany({
            where,
            include: {
                centroCosto: true
            },
            orderBy: { nombre: 'asc' }
        });

        res.json(estancias);
    } catch (error) {
        console.error('Error fetching estancias:', error);
        res.status(500).json({ error: 'Failed to fetch estancias' });
    }
}

/**
 * GET /api/estancias/:id
 * Get single estancia by ID
 */
export async function getEstancia(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { id } = req.params;

        const estancia = await prisma.estanciaMejorada.findFirst({
            where: { id, tenantId },
            include: {
                centroCosto: true
            }
        });

        if (!estancia) {
            return res.status(404).json({ error: 'Estancia not found' });
        }

        res.json(estancia);
    } catch (error) {
        console.error('Error fetching estancia:', error);
        res.status(500).json({ error: 'Failed to fetch estancia' });
    }
}

/**
 * POST /api/estancias
 * Create new estancia
 */
export async function createEstancia(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const {
            centroCostoId,
            codigo,
            nombre,
            descripcion,
            direccion,
            ciudad,
            departamento,
            pais,
            superficie,
            superficieUtil,
            capacidadUA,
            tipoPropiedad,
            costoAlquiler,
            monedaAlquiler,
            fechaVencimiento,
            responsable,
            telefono,
            email
        } = req.body;

        // Validation
        if (!centroCostoId || !codigo || !nombre || !tipoPropiedad) {
            return res.status(400).json({
                error: 'centroCostoId, codigo, nombre and tipoPropiedad are required'
            });
        }

        // Validate tipoPropiedad
        if (!['PROPIA', 'ALQUILADA', 'COMPARTIDA'].includes(tipoPropiedad)) {
            return res.status(400).json({
                error: 'tipoPropiedad must be PROPIA, ALQUILADA or COMPARTIDA'
            });
        }

        // Verify centro de costo exists and belongs to tenant
        const centroCosto = await prisma.centroCosto.findFirst({
            where: { id: centroCostoId, tenantId }
        });

        if (!centroCosto) {
            return res.status(404).json({ error: 'Centro de costo not found' });
        }

        // Check if codigo already exists for this tenant
        const existing = await prisma.estanciaMejorada.findFirst({
            where: { tenantId, codigo }
        });

        if (existing) {
            return res.status(409).json({
                error: 'Estancia with this codigo already exists'
            });
        }

        const estancia = await prisma.estanciaMejorada.create({
            data: {
                tenantId,
                centroCostoId,
                codigo,
                nombre,
                descripcion,
                direccion,
                ciudad,
                departamento,
                pais: pais || 'PY',
                superficie: superficie ? parseFloat(superficie) : undefined,
                superficieUtil: superficieUtil ? parseFloat(superficieUtil) : undefined,
                capacidadUA: capacidadUA ? parseFloat(capacidadUA) : undefined,
                tipoPropiedad,
                costoAlquiler: costoAlquiler ? parseFloat(costoAlquiler) : undefined,
                monedaAlquiler,
                fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : undefined,
                responsable,
                telefono,
                email
            },
            include: {
                centroCosto: true
            }
        });

        res.status(201).json(estancia);
    } catch (error) {
        console.error('Error creating estancia:', error);
        res.status(500).json({ error: 'Failed to create estancia' });
    }
}

/**
 * PUT /api/estancias/:id
 * Update estancia
 */
export async function updateEstancia(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { id } = req.params;
        const updateData = req.body;

        // Check if estancia exists and belongs to tenant
        const existing = await prisma.estanciaMejorada.findFirst({
            where: { id, tenantId }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Estancia not found' });
        }

        // If codigo is being changed, check uniqueness
        if (updateData.codigo && updateData.codigo !== existing.codigo) {
            const duplicate = await prisma.estanciaMejorada.findFirst({
                where: { tenantId, codigo: updateData.codigo }
            });
            if (duplicate) {
                return res.status(409).json({
                    error: 'Estancia with this codigo already exists'
                });
            }
        }

        // Convert numeric strings to numbers
        if (updateData.superficie) {
            updateData.superficie = parseFloat(updateData.superficie);
        }
        if (updateData.superficieUtil) {
            updateData.superficieUtil = parseFloat(updateData.superficieUtil);
        }
        if (updateData.capacidadUA) {
            updateData.capacidadUA = parseFloat(updateData.capacidadUA);
        }
        if (updateData.costoAlquiler) {
            updateData.costoAlquiler = parseFloat(updateData.costoAlquiler);
        }

        // Convert date strings to Date objects
        if (updateData.fechaVencimiento) {
            updateData.fechaVencimiento = new Date(updateData.fechaVencimiento);
        }

        const estancia = await prisma.estanciaMejorada.update({
            where: { id },
            data: updateData,
            include: {
                centroCosto: true
            }
        });

        res.json(estancia);
    } catch (error) {
        console.error('Error updating estancia:', error);
        res.status(500).json({ error: 'Failed to update estancia' });
    }
}

/**
 * DELETE /api/estancias/:id
 * Deactivate estancia (soft delete)
 */
export async function deleteEstancia(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { id } = req.params;

        // Check if estancia exists and belongs to tenant
        const existing = await prisma.estanciaMejorada.findFirst({
            where: { id, tenantId }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Estancia not found' });
        }

        // Soft delete
        const estancia = await prisma.estanciaMejorada.update({
            where: { id },
            data: { activo: false }
        });

        res.json({ message: 'Estancia deactivated successfully', estancia });
    } catch (error) {
        console.error('Error deactivating estancia:', error);
        res.status(500).json({ error: 'Failed to deactivate estancia' });
    }
}
