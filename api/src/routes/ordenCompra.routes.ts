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
} from '../controllers/ordenCompra.controller';

const router = Router();

router.get('/', getOrdenesCompra);
router.get('/:id', getOrdenCompraById);
router.post('/', createOrdenCompra);
router.put('/:id', updateOrdenCompra);

// Workflow
router.put('/:id/enviar-aprobacion', enviarAprobacion);
router.put('/:id/aprobar', aprobarOrdenCompra);
router.put('/:id/rechazar', rechazarOrdenCompra);
router.put('/:id/anular', anularOrdenCompra);

export default router;
