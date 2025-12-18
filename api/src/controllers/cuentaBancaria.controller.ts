/**
 * Cuentas Bancarias Controller
 * Gestión de cuentas bancarias, chequeras y cheques
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';

// GET /api/cuentas-bancarias - Listar todas las cuentas bancarias
export const getCuentasBancarias = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { activo, banco, moneda } = req.query;

    const where: any = { tenantId };

    if (activo !== undefined) {
      where.activo = activo === 'true';
    }

    if (banco) {
      where.banco = { contains: banco as string };
    }

    if (moneda) {
      where.moneda = moneda as string;
    }

    const cuentas = await prisma.cuentaBancaria.findMany({
      where,
      include: {
        cuentaContable: {
          select: {
            codigo: true,
            nombre: true,
          },
        },
        _count: {
          select: {
            chequeras: true,
            movimientos: true,
          },
        },
      },
      orderBy: { banco: 'asc' },
    });

    res.json({
      success: true,
      data: {
        cuentas,
        total: cuentas.length,
      },
    });
  } catch (error) {
    console.error('Error fetching cuentas bancarias:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener cuentas bancarias',
    });
  }
};

// GET /api/cuentas-bancarias/:id - Obtener una cuenta bancaria por ID
export const getCuentaBancariaById = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { id } = req.params;

    const cuenta = await prisma.cuentaBancaria.findFirst({
      where: { id, tenantId },
      include: {
        cuentaContable: true,
        chequeras: {
          where: { activo: true },
          orderBy: { numeroInicial: 'desc' },
        },
        movimientos: {
          take: 10,
          orderBy: { fecha: 'desc' },
        },
      },
    });

    if (!cuenta) {
      return res.status(404).json({
        success: false,
        error: 'Cuenta bancaria no encontrada',
      });
    }

    res.json({
      success: true,
      data: cuenta,
    });
  } catch (error) {
    console.error('Error fetching cuenta bancaria:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener cuenta bancaria',
    });
  }
};

// POST /api/cuentas-bancarias - Crear nueva cuenta bancaria
export const createCuentaBancaria = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const {
      banco,
      tipoCuenta,
      numeroCuenta,
      moneda,
      saldoActual,
      cuentaContableId,
    } = req.body;

    // Validar que no exista una cuenta con el mismo número
    const existente = await prisma.cuentaBancaria.findFirst({
      where: {
        tenantId,
        numeroCuenta,
      },
    });

    if (existente) {
      return res.status(409).json({
        success: false,
        error: 'Ya existe una cuenta con ese número',
      });
    }

    const cuenta = await prisma.cuentaBancaria.create({
      data: {
        tenantId,
        banco,
        tipoCuenta,
        numeroCuenta,
        moneda: moneda || 'PYG',
        saldoActual: saldoActual || 0,
        cuentaContableId,
      },
      include: {
        cuentaContable: true,
      },
    });

    res.status(201).json({
      success: true,
      data: cuenta,
    });
  } catch (error) {
    console.error('Error creating cuenta bancaria:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear cuenta bancaria',
    });
  }
};

// PUT /api/cuentas-bancarias/:id - Actualizar cuenta bancaria
export const updateCuentaBancaria = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { id } = req.params;
    const {
      banco,
      tipoCuenta,
      numeroCuenta,
      moneda,
      saldoActual,
      cuentaContableId,
      activo,
    } = req.body;

    // Verificar que la cuenta existe
    const cuentaExistente = await prisma.cuentaBancaria.findFirst({
      where: { id, tenantId },
    });

    if (!cuentaExistente) {
      return res.status(404).json({
        success: false,
        error: 'Cuenta bancaria no encontrada',
      });
    }

    const cuenta = await prisma.cuentaBancaria.update({
      where: { id },
      data: {
        banco,
        tipoCuenta,
        numeroCuenta,
        moneda,
        saldoActual,
        cuentaContableId,
        activo,
      },
      include: {
        cuentaContable: true,
      },
    });

    res.json({
      success: true,
      data: cuenta,
    });
  } catch (error) {
    console.error('Error updating cuenta bancaria:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar cuenta bancaria',
    });
  }
};

// DELETE /api/cuentas-bancarias/:id - Desactivar cuenta bancaria (soft delete)
export const deleteCuentaBancaria = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { id } = req.params;

    const cuenta = await prisma.cuentaBancaria.findFirst({
      where: { id, tenantId },
    });

    if (!cuenta) {
      return res.status(404).json({
        success: false,
        error: 'Cuenta bancaria no encontrada',
      });
    }

    // Soft delete
    await prisma.cuentaBancaria.update({
      where: { id },
      data: { activo: false },
    });

    res.json({
      success: true,
      message: 'Cuenta bancaria desactivada exitosamente',
    });
  } catch (error) {
    console.error('Error deleting cuenta bancaria:', error);
    res.status(500).json({
      success: false,
      error: 'Error al desactivar cuenta bancaria',
    });
  }
};

// GET /api/cuentas-bancarias/:id/movimientos - Obtener movimientos de una cuenta
export const getMovimientosCuenta = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { id } = req.params;
    const { fechaDesde, fechaHasta, estado, page = 1, limit = 50 } = req.query;

    const where: any = {
      cuentaBancariaId: id,
      tenantId,
    };

    if (fechaDesde || fechaHasta) {
      where.fecha = {};
      if (fechaDesde) where.fecha.gte = new Date(fechaDesde as string);
      if (fechaHasta) where.fecha.lte = new Date(fechaHasta as string);
    }

    if (estado) {
      where.estado = estado;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [movimientos, total] = await Promise.all([
      prisma.movimientoBancario.findMany({
        where,
        include: {
          ordenPago: {
            select: {
              numero: true,
              beneficiario: true,
            },
          },
          cheque: {
            select: {
              numero: true,
              beneficiario: true,
            },
          },
        },
        orderBy: { fecha: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.movimientoBancario.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        movimientos,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching movimientos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener movimientos',
    });
  }
};

// ==========================================
// CHEQUERAS
// ==========================================

// GET /api/cuentas-bancarias/:id/chequeras - Obtener chequeras de una cuenta
export const getChequeras = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { id } = req.params;

    const chequeras = await prisma.chequera.findMany({
      where: {
        cuentaBancariaId: id,
        tenantId,
      },
      include: {
        _count: {
          select: {
            cheques: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: {
        chequeras,
        total: chequeras.length,
      },
    });
  } catch (error) {
    console.error('Error fetching chequeras:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener chequeras',
    });
  }
};

// POST /api/cuentas-bancarias/:id/chequeras - Crear nueva chequera
export const createChequera = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { id } = req.params;
    const { numeroInicial, numeroFinal } = req.body;

    if (numeroInicial >= numeroFinal) {
      return res.status(400).json({
        success: false,
        error: 'El número inicial debe ser menor que el número final',
      });
    }

    const chequera = await prisma.chequera.create({
      data: {
        tenantId,
        cuentaBancariaId: id,
        numeroInicial,
        numeroFinal,
        siguienteNumero: numeroInicial,
      },
    });

    res.status(201).json({
      success: true,
      data: chequera,
    });
  } catch (error) {
    console.error('Error creating chequera:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear chequera',
    });
  }
};

// GET /api/chequeras/:id/cheques - Obtener cheques de una chequera
export const getCheques = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estado } = req.query;

    const where: any = { chequeraId: id };

    if (estado) {
      where.estado = estado;
    }

    const cheques = await prisma.cheque.findMany({
      where,
      orderBy: { numero: 'asc' },
    });

    res.json({
      success: true,
      data: {
        cheques,
        total: cheques.length,
      },
    });
  } catch (error) {
    console.error('Error fetching cheques:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener cheques',
    });
  }
};
