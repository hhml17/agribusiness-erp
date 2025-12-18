/**
 * Asiento Contable Routes
 */

import { Router } from 'express';
import {
  getAsientos,
  getAsientoById,
  createAsiento,
  updateAsiento,
  contabilizarAsiento,
  anularAsiento,
  deleteAsiento,
} from '../controllers/asientoContable.controller';

const router = Router();

router.get('/', getAsientos);
router.get('/:id', getAsientoById);
router.post('/', createAsiento);
router.put('/:id', updateAsiento);
router.post('/:id/contabilizar', contabilizarAsiento);
router.post('/:id/anular', anularAsiento);
router.delete('/:id', deleteAsiento);

export default router;
