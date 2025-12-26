import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/facturas-emitidas
 * Get all facturas emitidas for the authenticated tenant
 * Query params: ?estado=EMITIDA|ANULADA, ?talonarioId=uuid
 */
export async function getFacturasEmitidas(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { estado, talonarioId, fechaDesde, fechaHasta } = req.query;

        const where: any = { tenantId };

        if (estado) {
            where.estado = estado;
        }

        if (talonarioId) {
            where.talonarioId = talonarioId;
        }

        if (fechaDesde || fechaHasta) {
            where.fecha = {};
            if (fechaDesde) {
                where.fecha.gte = new Date(fechaDesde as string);
            }
            if (fechaHasta) {
                where.fecha.lte = new Date(fechaHasta as string);
            }
        }

        const facturas = await prisma.facturaEmitida.findMany({
            where,
            include: {
                talonario: {
                    select: {
                        numeroTimbrado: true,
                        tipoComprobante: true
                    }
                }
            },
            orderBy: { fecha: 'desc' },
            take: 100 // Limit to 100 most recent
        });

        res.json(facturas);
    } catch (error) {
        console.error('Error fetching facturas emitidas:', error);
        res.status(500).json({ error: 'Failed to fetch facturas emitidas' });
    }
}

/**
 * GET /api/facturas-emitidas/:id
 * Get single factura emitida by ID
 */
export async function getFacturaEmitida(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { id } = req.params;

        const factura = await prisma.facturaEmitida.findFirst({
            where: { id, tenantId },
            include: {
                talonario: true
            }
        });

        if (!factura) {
            return res.status(404).json({ error: 'Factura emitida not found' });
        }

        res.json(factura);
    } catch (error) {
        console.error('Error fetching factura emitida:', error);
        res.status(500).json({ error: 'Failed to fetch factura emitida' });
    }
}

/**
 * POST /api/facturas-emitidas
 * Create new factura emitida
 */
export async function createFacturaEmitida(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const {
            talonarioId,
            tipoComprobante,
            actorId,
            nombreCliente,
            rucCliente,
            direccionCliente,
            fecha,
            fechaVencimiento,
            condicionVenta,
            subtotal,
            iva10,
            iva5,
            exentas,
            total,
            moneda,
            descripcion,
            observaciones
        } = req.body;

        // Validation
        if (!talonarioId || !tipoComprobante || !nombreCliente || !fecha ||
            !condicionVenta || !subtotal || !total || !moneda) {
            return res.status(400).json({
                error: 'Required fields are missing'
            });
        }

        // Verify talonario exists and belongs to tenant
        const talonario = await prisma.talonario.findFirst({
            where: { id: talonarioId, tenantId }
        });

        if (!talonario) {
            return res.status(404).json({ error: 'Talonario not found' });
        }

        // Check if talonario is active
        if (!talonario.activo) {
            return res.status(400).json({ error: 'Talonario is not active' });
        }

        // Check if talonario is not agotado
        if (talonario.agotado) {
            return res.status(400).json({ error: 'Talonario is depleted' });
        }

        // Check if talonario is within validity period
        const fechaEmision = new Date(fecha);
        if (fechaEmision < talonario.fechaVigenciaDesde || fechaEmision > talonario.fechaVigenciaHasta) {
            return res.status(400).json({
                error: 'Fecha is outside talonario validity period'
            });
        }

        // Get next numero
        const numeroFactura = talonario.siguienteNumero;
        const numeroCompleto = `${talonario.establecimiento}-${talonario.puntoVenta}-${String(numeroFactura).padStart(7, '0')}`;

        // Create factura within transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create factura
            const factura = await tx.facturaEmitida.create({
                data: {
                    tenantId,
                    talonarioId,
                    establecimiento: talonario.establecimiento,
                    puntoVenta: talonario.puntoVenta,
                    numeroFactura,
                    numeroCompleto,
                    tipoComprobante,
                    actorId,
                    nombreCliente,
                    rucCliente,
                    direccionCliente,
                    fecha: new Date(fecha),
                    fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : undefined,
                    condicionVenta,
                    subtotal: parseFloat(subtotal),
                    iva10: iva10 ? parseFloat(iva10) : 0,
                    iva5: iva5 ? parseFloat(iva5) : 0,
                    exentas: exentas ? parseFloat(exentas) : 0,
                    total: parseFloat(total),
                    moneda,
                    estado: 'EMITIDA',
                    descripcion,
                    observaciones
                }
            });

            // Update talonario siguiente numero
            const agotado = (numeroFactura + 1) > talonario.numeroFinal;
            await tx.talonario.update({
                where: { id: talonarioId },
                data: {
                    siguienteNumero: numeroFactura + 1,
                    agotado
                }
            });

            return factura;
        });

        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating factura emitida:', error);
        res.status(500).json({ error: 'Failed to create factura emitida' });
    }
}

/**
 * PUT /api/facturas-emitidas/:id/anular
 * Anular factura emitida
 */
export async function anularFacturaEmitida(req: Request, res: Response) {
    try {
        const tenantId = req.headers['x-tenant-id'] as string;
        const { id } = req.params;
        const { motivoAnulacion } = req.body;

        if (!motivoAnulacion) {
            return res.status(400).json({
                error: 'motivoAnulacion is required'
            });
        }

        // Check if factura exists and belongs to tenant
        const existing = await prisma.facturaEmitida.findFirst({
            where: { id, tenantId }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Factura emitida not found' });
        }

        // Check if already anulada
        if (existing.estado === 'ANULADA') {
            return res.status(400).json({
                error: 'Factura is already anulada'
            });
        }

        const factura = await prisma.facturaEmitida.update({
            where: { id },
            data: {
                estado: 'ANULADA',
                fechaAnulacion: new Date(),
                motivoAnulacion
            }
        });

        res.json({ message: 'Factura anulada successfully', factura });
    } catch (error) {
        console.error('Error anulando factura:', error);
        res.status(500).json({ error: 'Failed to anular factura' });
    }
}
