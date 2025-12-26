import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validateTenant, requireUser } from '../middleware/tenant.js';
import {
    getProveedores,
    getProveedor,
    createProveedor,
    updateProveedor,
    deleteProveedor
} from '../controllers/proveedores.controller.js';

const router = Router();

// All proveedor routes require authentication and tenant validation
router.use(authenticateToken);
router.use(validateTenant);

/**
 * GET /api/proveedores
 * Get all proveedores for tenant
 * Query params: ?activo=boolean
 */
router.get('/', getProveedores);

/**
 * GET /api/proveedores/:id
 * Get single proveedor by ID (includes recent compras)
 */
router.get('/:id', getProveedor);

/**
 * POST /api/proveedores
 * Create new proveedor (requires USER role)
 */
router.post('/', requireUser, createProveedor);

/**
 * PUT /api/proveedores/:id
 * Update proveedor (requires USER role)
 */
router.put('/:id', requireUser, updateProveedor);

/**
 * DELETE /api/proveedores/:id
 * Deactivate proveedor (requires USER role)
 */
router.delete('/:id', requireUser, deleteProveedor);

export default router;
