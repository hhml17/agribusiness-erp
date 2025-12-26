import { Router } from 'express';
import { productoController } from '../controllers/productos.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateTenant, requireUser } from '../middleware/tenant.js';

const router = Router();

// All routes require authentication and tenant validation
router.use(authenticateToken);
router.use(validateTenant);

// GET routes - available to all authenticated users
router.get('/', productoController.getAll);
router.get('/:id', productoController.getById);

// POST/PUT/DELETE routes - require USER role (not just viewer)
router.post('/', requireUser, productoController.create);
router.put('/:id', requireUser, productoController.update);
router.delete('/:id', requireUser, productoController.delete);

export default router;
