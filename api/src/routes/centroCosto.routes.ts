/**
 * Centro de Costo Routes
 */

import { Router } from 'express';
import {
  getCentrosCosto,
  getCentroCostoById,
  createCentroCosto,
  updateCentroCosto,
  deleteCentroCosto,
} from '../controllers/centroCosto.controller';

const router = Router();

router.get('/', getCentrosCosto);
router.get('/:id', getCentroCostoById);
router.post('/', createCentroCosto);
router.put('/:id', updateCentroCosto);
router.delete('/:id', deleteCentroCosto);

export default router;
