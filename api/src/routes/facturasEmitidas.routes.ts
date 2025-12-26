import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validateTenant, requireUser } from '../middleware/tenant.js';
import {
    getFacturasEmitidas,
    getFacturaEmitida,
    createFacturaEmitida,
    anularFacturaEmitida
} from '../controllers/facturasEmitidas.controller.js';

const router = Router();

// All factura emitida routes require authentication and tenant validation
router.use(authenticateToken);
router.use(validateTenant);

/**
 * GET /api/facturas-emitidas
 * Get all facturas emitidas for tenant
 * Query params: ?estado=EMITIDA|ANULADA, ?talonarioId=uuid, ?fechaDesde=date, ?fechaHasta=date
 */
router.get('/', getFacturasEmitidas);

/**
 * GET /api/facturas-emitidas/:id
 * Get single factura emitida by ID (includes talonario)
 */
router.get('/:id', getFacturaEmitida);

/**
 * POST /api/facturas-emitidas
 * Create new factura emitida (requires USER role)
 */
router.post('/', requireUser, createFacturaEmitida);

/**
 * PUT /api/facturas-emitidas/:id/anular
 * Anular factura emitida (requires USER role)
 */
router.put('/:id/anular', requireUser, anularFacturaEmitida);

export default router;
