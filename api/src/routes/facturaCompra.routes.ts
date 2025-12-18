/**
 * Facturas de Compra Routes
 */

import { Router } from 'express';
import {
  getFacturasCompra,
  getFacturaCompraById,
  createFacturaCompra,
  updateFacturaCompra,
  marcarPago,
  anularFactura,
} from '../controllers/facturaCompra.controller';

const router = Router();

router.get('/', getFacturasCompra);
router.get('/:id', getFacturaCompraById);
router.post('/', createFacturaCompra);
router.put('/:id', updateFacturaCompra);

// Payment and status management
router.put('/:id/marcar-pago', marcarPago);
router.put('/:id/anular', anularFactura);

export default router;
