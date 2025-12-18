/**
 * Cuentas Bancarias Routes
 */

import { Router } from 'express';
import {
  getCuentasBancarias,
  getCuentaBancariaById,
  createCuentaBancaria,
  updateCuentaBancaria,
  deleteCuentaBancaria,
  getMovimientosCuenta,
  getChequeras,
  createChequera,
  getCheques,
} from '../controllers/cuentaBancaria.controller';

const router = Router();

// Cuentas Bancarias
router.get('/', getCuentasBancarias);
router.get('/:id', getCuentaBancariaById);
router.post('/', createCuentaBancaria);
router.put('/:id', updateCuentaBancaria);
router.delete('/:id', deleteCuentaBancaria);

// Movimientos de cuenta
router.get('/:id/movimientos', getMovimientosCuenta);

// Chequeras
router.get('/:id/chequeras', getChequeras);
router.post('/:id/chequeras', createChequera);

// Cheques
router.get('/chequeras/:id/cheques', getCheques);

export default router;
