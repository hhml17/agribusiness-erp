import { Router } from 'express';
import { cuentaContableController } from '../controllers/cuentaContable.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateTenant, requireUser } from '../middleware/tenant.js';

const router = Router();

// All routes require authentication and tenant validation
router.use(authenticateToken);
router.use(validateTenant);

// GET routes - available to all authenticated users
router.get('/', cuentaContableController.getAll);
router.get('/:id', cuentaContableController.getById);

// POST/PUT/DELETE routes - require USER role (not just viewer)
router.post('/', requireUser, cuentaContableController.create);
router.put('/:id', requireUser, cuentaContableController.update);
router.delete('/:id', requireUser, cuentaContableController.delete);

export default router;
