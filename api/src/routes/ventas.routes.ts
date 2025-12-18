import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { validateTenant, requireUser } from '../middleware/tenant';
import {
    getVentas,
    getVenta,
    createVenta,
    updateVenta,
    deleteVenta
} from '../controllers/ventas.controller';

const router = Router();

// All venta routes require authentication and tenant validation
router.use(authenticateToken);
router.use(validateTenant);

/**
 * GET /api/ventas
 * Get all ventas for tenant
 * Query params: ?estado=PENDIENTE|COMPLETADA|CANCELADA&desde=2024-01-01&hasta=2024-12-31
 */
router.get('/', getVentas);

/**
 * GET /api/ventas/:id
 * Get single venta by ID (includes cliente and items)
 */
router.get('/:id', getVenta);

/**
 * POST /api/ventas
 * Create new venta (requires USER role)
 * Updates stock automatically
 */
router.post('/', requireUser, createVenta);

/**
 * PUT /api/ventas/:id
 * Update venta status (requires USER role)
 */
router.put('/:id', requireUser, updateVenta);

/**
 * DELETE /api/ventas/:id
 * Cancel venta and restore stock (requires USER role)
 */
router.delete('/:id', requireUser, deleteVenta);

export default router;
