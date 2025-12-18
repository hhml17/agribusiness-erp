/**
 * Reportes Contables Controller
 * Generación de reportes: Balance General, Estado de Resultados, Libro Mayor
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';

// GET /api/reportes/balance - Balance General
export const getBalanceGeneral = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { fechaHasta } = req.query;

    const fecha = fechaHasta ? new Date(fechaHasta as string) : new Date();

    // Obtener todas las cuentas con sus movimientos hasta la fecha
    const cuentas = await prisma.planCuentas.findMany({
      where: {
        tenantId,
        activo: true,
        tipo: {
          in: ['ACTIVO', 'PASIVO', 'PATRIMONIO'],
        },
      },
      include: {
        lineasAsiento: {
          where: {
            asiento: {
              estado: 'CONTABILIZADO',
              fecha: {
                lte: fecha,
              },
            },
          },
          select: {
            debe: true,
            haber: true,
          },
        },
      },
      orderBy: { codigo: 'asc' },
    });

    // Calcular saldos
    const cuentasConSaldo = cuentas.map((cuenta) => {
      const totalDebe = cuenta.lineasAsiento.reduce((sum, l) => sum + l.debe, 0);
      const totalHaber = cuenta.lineasAsiento.reduce((sum, l) => sum + l.haber, 0);

      let saldo = 0;
      if (cuenta.naturaleza === 'DEUDORA') {
        saldo = totalDebe - totalHaber;
      } else {
        saldo = totalHaber - totalDebe;
      }

      return {
        id: cuenta.id,
        codigo: cuenta.codigo,
        nombre: cuenta.nombre,
        tipo: cuenta.tipo,
        nivel: cuenta.nivel,
        naturaleza: cuenta.naturaleza,
        saldo,
        debe: totalDebe,
        haber: totalHaber,
      };
    });

    // Agrupar por tipo
    const balance = {
      activos: cuentasConSaldo.filter((c) => c.tipo === 'ACTIVO'),
      pasivos: cuentasConSaldo.filter((c) => c.tipo === 'PASIVO'),
      patrimonio: cuentasConSaldo.filter((c) => c.tipo === 'PATRIMONIO'),
      totalActivos: cuentasConSaldo
        .filter((c) => c.tipo === 'ACTIVO')
        .reduce((sum, c) => sum + c.saldo, 0),
      totalPasivos: cuentasConSaldo
        .filter((c) => c.tipo === 'PASIVO')
        .reduce((sum, c) => sum + c.saldo, 0),
      totalPatrimonio: cuentasConSaldo
        .filter((c) => c.tipo === 'PATRIMONIO')
        .reduce((sum, c) => sum + c.saldo, 0),
      fecha,
    };

    res.json(balance);
  } catch (error) {
    console.error('Error generating balance general:', error);
    res.status(500).json({ error: 'Error al generar balance general' });
  }
};

// GET /api/reportes/estado-resultados - Estado de Resultados (P&L)
export const getEstadoResultados = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { fechaDesde, fechaHasta } = req.query;

    const desde = fechaDesde ? new Date(fechaDesde as string) : new Date(new Date().getFullYear(), 0, 1);
    const hasta = fechaHasta ? new Date(fechaHasta as string) : new Date();

    // Obtener cuentas de ingresos y gastos con movimientos en el período
    const cuentas = await prisma.planCuentas.findMany({
      where: {
        tenantId,
        activo: true,
        tipo: {
          in: ['INGRESO', 'GASTO'],
        },
      },
      include: {
        lineasAsiento: {
          where: {
            asiento: {
              estado: 'CONTABILIZADO',
              fecha: {
                gte: desde,
                lte: hasta,
              },
            },
          },
          select: {
            debe: true,
            haber: true,
          },
        },
        centroCosto: true,
      },
      orderBy: { codigo: 'asc' },
    });

    // Calcular totales
    const cuentasConTotal = cuentas.map((cuenta) => {
      const totalDebe = cuenta.lineasAsiento.reduce((sum, l) => sum + l.debe, 0);
      const totalHaber = cuenta.lineasAsiento.reduce((sum, l) => sum + l.haber, 0);

      let total = 0;
      if (cuenta.tipo === 'INGRESO') {
        // Ingresos: haber - debe
        total = totalHaber - totalDebe;
      } else {
        // Gastos: debe - haber
        total = totalDebe - totalHaber;
      }

      return {
        id: cuenta.id,
        codigo: cuenta.codigo,
        nombre: cuenta.nombre,
        tipo: cuenta.tipo,
        nivel: cuenta.nivel,
        centroCosto: cuenta.centroCosto?.nombre,
        tipoGasto: cuenta.tipoGasto,
        variabilidad: cuenta.variabilidad,
        total,
        debe: totalDebe,
        haber: totalHaber,
      };
    });

    // Agrupar
    const ingresos = cuentasConTotal.filter((c) => c.tipo === 'INGRESO');
    const gastos = cuentasConTotal.filter((c) => c.tipo === 'GASTO');

    const totalIngresos = ingresos.reduce((sum, c) => sum + c.total, 0);
    const totalGastos = gastos.reduce((sum, c) => sum + c.total, 0);
    const utilidadNeta = totalIngresos - totalGastos;

    const estadoResultados = {
      ingresos,
      gastos,
      totalIngresos,
      totalGastos,
      utilidadNeta,
      fechaDesde: desde,
      fechaHasta: hasta,
    };

    res.json(estadoResultados);
  } catch (error) {
    console.error('Error generating estado resultados:', error);
    res.status(500).json({ error: 'Error al generar estado de resultados' });
  }
};

// GET /api/reportes/libro-mayor - Libro Mayor (por cuenta)
export const getLibroMayor = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { cuentaId, fechaDesde, fechaHasta } = req.query;

    if (!cuentaId) {
      return res.status(400).json({ error: 'Se requiere cuentaId' });
    }

    const desde = fechaDesde ? new Date(fechaDesde as string) : new Date(new Date().getFullYear(), 0, 1);
    const hasta = fechaHasta ? new Date(fechaHasta as string) : new Date();

    // Obtener la cuenta
    const cuenta = await prisma.planCuentas.findFirst({
      where: {
        id: cuentaId as string,
        tenantId,
      },
    });

    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    // Obtener movimientos
    const movimientos = await prisma.lineaAsiento.findMany({
      where: {
        cuentaId: cuentaId as string,
        asiento: {
          tenantId,
          estado: 'CONTABILIZADO',
          fecha: {
            gte: desde,
            lte: hasta,
          },
        },
      },
      include: {
        asiento: true,
        centroCosto: {
          select: {
            codigo: true,
            nombre: true,
          },
        },
      },
      orderBy: {
        asiento: {
          fecha: 'asc',
        },
      },
    });

    // Calcular saldo inicial (movimientos antes de fechaDesde)
    const movimientosAnteriores = await prisma.lineaAsiento.findMany({
      where: {
        cuentaId: cuentaId as string,
        asiento: {
          tenantId,
          estado: 'CONTABILIZADO',
          fecha: {
            lt: desde,
          },
        },
      },
      select: {
        debe: true,
        haber: true,
      },
    });

    const debeAnterior = movimientosAnteriores.reduce((sum, m) => sum + m.debe, 0);
    const haberAnterior = movimientosAnteriores.reduce((sum, m) => sum + m.haber, 0);
    const saldoInicial =
      cuenta.naturaleza === 'DEUDORA'
        ? debeAnterior - haberAnterior
        : haberAnterior - debeAnterior;

    // Calcular saldos acumulados
    let saldoAcumulado = saldoInicial;
    const movimientosConSaldo = movimientos.map((m) => {
      if (cuenta.naturaleza === 'DEUDORA') {
        saldoAcumulado += m.debe - m.haber;
      } else {
        saldoAcumulado += m.haber - m.debe;
      }

      return {
        fecha: m.asiento.fecha,
        asientoNumero: m.asiento.numero,
        descripcion: m.descripcion || m.asiento.descripcion,
        centroCosto: m.centroCosto,
        documentoRef: m.documentoRef || m.asiento.documentoRef,
        debe: m.debe,
        haber: m.haber,
        saldo: saldoAcumulado,
      };
    });

    const libroMayor = {
      cuenta: {
        codigo: cuenta.codigo,
        nombre: cuenta.nombre,
        tipo: cuenta.tipo,
        naturaleza: cuenta.naturaleza,
      },
      saldoInicial,
      movimientos: movimientosConSaldo,
      saldoFinal: saldoAcumulado,
      fechaDesde: desde,
      fechaHasta: hasta,
    };

    res.json(libroMayor);
  } catch (error) {
    console.error('Error generating libro mayor:', error);
    res.status(500).json({ error: 'Error al generar libro mayor' });
  }
};

// GET /api/reportes/centro-costo - Reporte por Centro de Costo
export const getReporteCentroCosto = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { centroCostoId, fechaDesde, fechaHasta } = req.query;

    const desde = fechaDesde ? new Date(fechaDesde as string) : new Date(new Date().getFullYear(), 0, 1);
    const hasta = fechaHasta ? new Date(fechaHasta as string) : new Date();

    const where: any = {
      asiento: {
        tenantId,
        estado: 'CONTABILIZADO',
        fecha: {
          gte: desde,
          lte: hasta,
        },
      },
    };

    if (centroCostoId) {
      where.centroCostoId = centroCostoId;
    }

    // Obtener movimientos por centro de costo
    const movimientos = await prisma.lineaAsiento.findMany({
      where,
      include: {
        cuenta: {
          select: {
            codigo: true,
            nombre: true,
            tipo: true,
            tipoGasto: true,
          },
        },
        centroCosto: true,
        asiento: {
          select: {
            numero: true,
            fecha: true,
            descripcion: true,
          },
        },
      },
      orderBy: {
        asiento: {
          fecha: 'asc',
        },
      },
    });

    // Agrupar por centro de costo
    const porCentro = movimientos.reduce((acc: any, m) => {
      const centro = m.centroCosto?.nombre || 'Sin Centro de Costo';
      if (!acc[centro]) {
        acc[centro] = {
          nombre: centro,
          codigo: m.centroCosto?.codigo,
          gastos: 0,
          ingresos: 0,
          movimientos: [],
        };
      }

      const monto = m.cuenta.tipo === 'GASTO' ? m.debe - m.haber : m.haber - m.debe;
      if (m.cuenta.tipo === 'GASTO') {
        acc[centro].gastos += monto;
      } else if (m.cuenta.tipo === 'INGRESO') {
        acc[centro].ingresos += monto;
      }

      acc[centro].movimientos.push({
        fecha: m.asiento.fecha,
        asientoNumero: m.asiento.numero,
        cuenta: `${m.cuenta.codigo} - ${m.cuenta.nombre}`,
        tipoCuenta: m.cuenta.tipo,
        tipoGasto: m.cuenta.tipoGasto,
        descripcion: m.descripcion || m.asiento.descripcion,
        debe: m.debe,
        haber: m.haber,
        monto,
      });

      return acc;
    }, {});

    res.json({
      centros: Object.values(porCentro),
      fechaDesde: desde,
      fechaHasta: hasta,
    });
  } catch (error) {
    console.error('Error generating reporte centro costo:', error);
    res.status(500).json({ error: 'Error al generar reporte por centro de costo' });
  }
};
