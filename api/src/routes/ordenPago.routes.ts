/**
 * Ordenes de Pago Routes
 */

import { Router } from 'express';
import {
  getOrdenesPago,
  getOrdenPagoById,
  createOrdenPago,
  updateOrdenPago,
  enviarAprobacion,
  aprobarOrdenPago,
  rechazarOrdenPago,
  marcarComoPagada,
  anularOrdenPago,
} from '../controllers/ordenPago.controller.js';

const router = Router();

router.get('/', getOrdenesPago);
router.get('/:id', getOrdenPagoById);
router.post('/', createOrdenPago);
router.put('/:id', updateOrdenPago);

// Workflow
router.put('/:id/enviar-aprobacion', enviarAprobacion);
router.put('/:id/aprobar', aprobarOrdenPago);
router.put('/:id/rechazar', rechazarOrdenPago);
router.put('/:id/marcar-pagada', marcarComoPagada);
router.put('/:id/anular', anularOrdenPago);

export default router;
