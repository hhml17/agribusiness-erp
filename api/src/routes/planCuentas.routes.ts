/**
 * Plan de Cuentas Routes
 */

import { Router } from 'express';
import {
  getPlanCuentas,
  getPlanCuentaById,
  createPlanCuenta,
  updatePlanCuenta,
  deletePlanCuenta,
  getPlanCuentasTree,
} from '../controllers/planCuentas.controller.js';

const router = Router();

router.get('/', getPlanCuentas);
router.get('/tree', getPlanCuentasTree);
router.get('/:id', getPlanCuentaById);
router.post('/', createPlanCuenta);
router.put('/:id', updatePlanCuenta);
router.delete('/:id', deletePlanCuenta);

export default router;
