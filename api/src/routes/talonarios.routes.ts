import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validateTenant, requireUser } from '../middleware/tenant.js';
import {
    getTalonarios,
    getTalonario,
    createTalonario,
    updateTalonario,
    deleteTalonario
} from '../controllers/talonarios.controller.js';

const router = Router();

// All talonario routes require authentication and tenant validation
router.use(authenticateToken);
router.use(validateTenant);

/**
 * GET /api/talonarios
 * Get all talonarios for tenant
 * Query params: ?tipoComprobante=FACTURA|NOTA_CREDITO, ?activo=boolean
 */
router.get('/', getTalonarios);

/**
 * GET /api/talonarios/:id
 * Get single talonario by ID (includes recent facturas)
 */
router.get('/:id', getTalonario);

/**
 * POST /api/talonarios
 * Create new talonario (requires USER role)
 */
router.post('/', requireUser, createTalonario);

/**
 * PUT /api/talonarios/:id
 * Update talonario (requires USER role)
 */
router.put('/:id', requireUser, updateTalonario);

/**
 * DELETE /api/talonarios/:id
 * Deactivate talonario (requires USER role)
 */
router.delete('/:id', requireUser, deleteTalonario);

export default router;
