import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validateTenant, requireUser } from '../middleware/tenant.js';
import {
    getActores,
    getActor,
    createActor,
    updateActor,
    deleteActor,
    getActorCuentas,
    createActorCuenta,
    deleteActorCuenta
} from '../controllers/actores.controller.js';

const router = Router();

// All actor routes require authentication and tenant validation
router.use(authenticateToken);
router.use(validateTenant);

/**
 * GET /api/actores
 * Get all actores for tenant
 * Query params: ?tipoPersona=FISICA|JURIDICA, ?esCliente=boolean, ?esProveedor=boolean, ?esAsociado=boolean, ?activo=boolean
 */
router.get('/', getActores);

/**
 * GET /api/actores/:id
 * Get single actor by ID (includes cuentas contables)
 */
router.get('/:id', getActor);

/**
 * POST /api/actores
 * Create new actor (requires USER role)
 */
router.post('/', requireUser, createActor);

/**
 * PUT /api/actores/:id
 * Update actor (requires USER role)
 */
router.put('/:id', requireUser, updateActor);

/**
 * DELETE /api/actores/:id
 * Deactivate actor (requires USER role)
 */
router.delete('/:id', requireUser, deleteActor);

/**
 * GET /api/actores/:id/cuentas
 * Get all cuentas contables for an actor
 */
router.get('/:id/cuentas', getActorCuentas);

/**
 * POST /api/actores/:id/cuentas
 * Add cuenta contable for an actor (requires USER role)
 */
router.post('/:id/cuentas', requireUser, createActorCuenta);

/**
 * DELETE /api/actores/:id/cuentas/:cuentaId
 * Delete cuenta contable for an actor (requires USER role)
 */
router.delete('/:id/cuentas/:cuentaId', requireUser, deleteActorCuenta);

export default router;
