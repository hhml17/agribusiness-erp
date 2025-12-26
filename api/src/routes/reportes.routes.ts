/**
 * Reportes Contables Routes
 */

import { Router } from 'express';
import {
  getBalanceGeneral,
  getEstadoResultados,
  getLibroMayor,
  getReporteCentroCosto,
} from '../controllers/reportes.controller.js';

const router = Router();

router.get('/balance', getBalanceGeneral);
router.get('/estado-resultados', getEstadoResultados);
router.get('/libro-mayor', getLibroMayor);
router.get('/centro-costo', getReporteCentroCosto);

export default router;
