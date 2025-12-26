import { Response } from 'express';
import { TenantRequest } from '../middleware/tenant.js';
import { cuentaContableService } from '../services/cuentaContable.service.js';

export const cuentaContableController = {
  async getAll(req: TenantRequest, res: Response) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) {
        return res.status(401).json({ error: 'No autorizado' });
      }

      const filters = {
        activo: req.query.activo === 'true' ? true : req.query.activo === 'false' ? false : undefined,
        tipo: req.query.tipo as string | undefined,
        nivel: req.query.nivel ? parseInt(req.query.nivel as string) : undefined
      };

      const cuentas = await cuentaContableService.getAll(tenantId, filters);
      res.json(cuentas);
    } catch (error: any) {
      console.error('Error getting cuentas contables:', error);
      res.status(500).json({ error: 'Error al obtener cuentas contables', message: error.message });
    }
  },

  async getById(req: TenantRequest, res: Response) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) {
        return res.status(401).json({ error: 'No autorizado' });
      }

      const { id } = req.params;
      const cuenta = await cuentaContableService.getById(id, tenantId);
      res.json(cuenta);
    } catch (error: any) {
      console.error('Error getting cuenta contable:', error);
      if (error.message === 'Cuenta contable no encontrada') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Error al obtener cuenta contable', message: error.message });
    }
  },

  async create(req: TenantRequest, res: Response) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) {
        return res.status(401).json({ error: 'No autorizado' });
      }

      const cuenta = await cuentaContableService.create(tenantId, req.body);
      res.status(201).json(cuenta);
    } catch (error: any) {
      console.error('Error creating cuenta contable:', error);

      if (error.message.includes('ya existe') || error.message.includes('código')) {
        return res.status(409).json({ error: error.message });
      }

      if (error.message.includes('no encontrada') || error.message.includes('inactiva') || error.message.includes('nivel')) {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ error: 'Error al crear cuenta contable', message: error.message });
    }
  },

  async update(req: TenantRequest, res: Response) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) {
        return res.status(401).json({ error: 'No autorizado' });
      }

      const { id } = req.params;
      const cuenta = await cuentaContableService.update(id, tenantId, req.body);
      res.json(cuenta);
    } catch (error: any) {
      console.error('Error updating cuenta contable:', error);

      if (error.message === 'Cuenta contable no encontrada') {
        return res.status(404).json({ error: error.message });
      }

      if (error.message.includes('no encontrado') || error.message.includes('inactiva')) {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ error: 'Error al actualizar cuenta contable', message: error.message });
    }
  },

  async delete(req: TenantRequest, res: Response) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) {
        return res.status(401).json({ error: 'No autorizado' });
      }

      const { id } = req.params;
      await cuentaContableService.delete(id, tenantId);
      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting cuenta contable:', error);

      if (error.message === 'Cuenta contable no encontrada') {
        return res.status(404).json({ error: error.message });
      }

      if (error.message.includes('cuentas hijas') || error.message.includes('movimientos')) {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ error: 'Error al desactivar cuenta contable', message: error.message });
    }
  }
};
