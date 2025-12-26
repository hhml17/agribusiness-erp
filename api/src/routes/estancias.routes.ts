import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validateTenant, requireUser } from '../middleware/tenant.js';
import {
    getEstancias,
    getEstancia,
    createEstancia,
    updateEstancia,
    deleteEstancia
} from '../controllers/estancias.controller.js';

const router = Router();

// All estancia routes require authentication and tenant validation
router.use(authenticateToken);
router.use(validateTenant);

/**
 * GET /api/estancias
 * Get all estancias for tenant
 * Query params: ?centroCostoId=uuid, ?activo=boolean
 */
router.get('/', getEstancias);

/**
 * GET /api/estancias/:id
 * Get single estancia by ID (includes centro de costo)
 */
router.get('/:id', getEstancia);

/**
 * POST /api/estancias
 * Create new estancia (requires USER role)
 */
router.post('/', requireUser, createEstancia);

/**
 * PUT /api/estancias/:id
 * Update estancia (requires USER role)
 */
router.put('/:id', requireUser, updateEstancia);

/**
 * DELETE /api/estancias/:id
 * Deactivate estancia (requires USER role)
 */
router.delete('/:id', requireUser, deleteEstancia);

export default router;
