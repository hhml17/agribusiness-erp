import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { validateTenant, requireUser } from '../middleware/tenant';
import {
    getProductos,
    getProducto,
    createProducto,
    updateProducto,
    deleteProducto,
    getProductosBajoStock
} from '../controllers/productos.controller';

const router = Router();

// All producto routes require authentication and tenant validation
router.use(authenticateToken);
router.use(validateTenant);

/**
 * GET /api/productos
 * Get all productos for tenant
 * Query params: ?categoria=string&activo=boolean
 */
router.get('/', getProductos);

/**
 * GET /api/productos/bajo-stock
 * Get productos with low stock
 */
router.get('/bajo-stock', getProductosBajoStock);

/**
 * GET /api/productos/:id
 * Get single producto by ID
 */
router.get('/:id', getProducto);

/**
 * POST /api/productos
 * Create new producto (requires USER role)
 */
router.post('/', requireUser, createProducto);

/**
 * PUT /api/productos/:id
 * Update producto (requires USER role)
 */
router.put('/:id', requireUser, updateProducto);

/**
 * DELETE /api/productos/:id
 * Deactivate producto (requires USER role)
 */
router.delete('/:id', requireUser, deleteProducto);

export default router;
