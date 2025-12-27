/**
 * Ordenes de Compra Routes
 */

import { Router } from 'express';
import {
  getOrdenesCompra,
  getOrdenCompraById,
  createOrdenCompra,
  updateOrdenCompra,
  enviarAprobacion,
  aprobarOrdenCompra,
  rechazarOrdenCompra,
  anularOrdenCompra,
} from '../controllers/ordenCompra.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateTenant, requireUser } from '../middleware/tenant.js';

const router = Router();

// All routes require authentication and tenant validation
router.use(authenticateToken);
router.use(validateTenant);

// GET routes - available to all authenticated users
router.get('/', getOrdenesCompra);
router.get('/:id', getOrdenCompraById);

// POST/PUT routes - require USER role (not just viewer)
router.post('/', requireUser, createOrdenCompra);
router.put('/:id', requireUser, updateOrdenCompra);

// Workflow - require USER role
router.put('/:id/enviar-aprobacion', requireUser, enviarAprobacion);
router.put('/:id/aprobar', requireUser, aprobarOrdenCompra);
router.put('/:id/rechazar', requireUser, rechazarOrdenCompra);
router.put('/:id/anular', requireUser, anularOrdenCompra);

export default router;
