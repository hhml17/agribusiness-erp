import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/tenant';
import {
    getTenants,
    getTenant,
    createTenant,
    updateTenant,
    deactivateTenant
} from '../controllers/tenants.controller';

const router = Router();

// All tenant routes require authentication
router.use(authenticateToken);

/**
 * GET /api/tenants
 * Get all tenants for the authenticated user
 */
router.get('/', getTenants);

/**
 * GET /api/tenants/:id
 * Get single tenant by ID
 */
router.get('/:id', getTenant);

/**
 * POST /api/tenants
 * Create new tenant
 */
router.post('/', createTenant);

/**
 * PUT /api/tenants/:id
 * Update tenant (admin only)
 */
router.put('/:id', requireAdmin, updateTenant);

/**
 * DELETE /api/tenants/:id
 * Deactivate tenant (admin only)
 */
router.delete('/:id', requireAdmin, deactivateTenant);

export default router;
