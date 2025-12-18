import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { validateTenant, requireUser } from '../middleware/tenant';
import {
    getClientes,
    getCliente,
    createCliente,
    updateCliente,
    deleteCliente
} from '../controllers/clientes.controller';

const router = Router();

// All cliente routes require authentication and tenant validation
router.use(authenticateToken);
router.use(validateTenant);

/**
 * GET /api/clientes
 * Get all clientes for tenant
 * Query params: ?activo=boolean
 */
router.get('/', getClientes);

/**
 * GET /api/clientes/:id
 * Get single cliente by ID (includes recent ventas)
 */
router.get('/:id', getCliente);

/**
 * POST /api/clientes
 * Create new cliente (requires USER role)
 */
router.post('/', requireUser, createCliente);

/**
 * PUT /api/clientes/:id
 * Update cliente (requires USER role)
 */
router.put('/:id', requireUser, updateCliente);

/**
 * DELETE /api/clientes/:id
 * Deactivate cliente (requires USER role)
 */
router.delete('/:id', requireUser, deleteCliente);

export default router;
