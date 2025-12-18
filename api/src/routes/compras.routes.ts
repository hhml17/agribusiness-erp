import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { validateTenant, requireUser } from '../middleware/tenant';
import {
    getCompras,
    getCompra,
    createCompra,
    updateCompra,
    deleteCompra
} from '../controllers/compras.controller';

const router = Router();

// All compra routes require authentication and tenant validation
router.use(authenticateToken);
router.use(validateTenant);

/**
 * GET /api/compras
 * Get all compras for tenant
 * Query params: ?estado=PENDIENTE|RECIBIDA|CANCELADA&desde=2024-01-01&hasta=2024-12-31
 */
router.get('/', getCompras);

/**
 * GET /api/compras/:id
 * Get single compra by ID (includes proveedor and items)
 */
router.get('/:id', getCompra);

/**
 * POST /api/compras
 * Create new compra (requires USER role)
 */
router.post('/', requireUser, createCompra);

/**
 * PUT /api/compras/:id
 * Update compra status (requires USER role)
 * Updates stock when marked as RECIBIDA
 */
router.put('/:id', requireUser, updateCompra);

/**
 * DELETE /api/compras/:id
 * Cancel compra (requires USER role)
 * Restores stock if compra was received
 */
router.delete('/:id', requireUser, deleteCompra);

export default router;
