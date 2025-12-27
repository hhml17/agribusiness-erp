import { PrismaClient } from '@prisma/client';
import { convertirUnidad } from './productos.service.js';

const prisma = new PrismaClient();

// ==========================================
// INTERFACES - DNIT Compliant
// ==========================================

export interface CreateFacturaCompraInput {
  // Numeración DNIT
  timbrado: string;
  establecimiento: string;
  puntoExpedicion: string;
  numero: string;

  // Fechas
  fechaEmision: Date;
  fechaRecepcion: Date;
  fechaVencimiento?: Date;

  // Proveedor
  proveedorId: string;

  // Vinculación
  ordenCompraId?: string;

  // Tipo
  tipo?: string; // NORMAL, ANTICIPO, GASTO_NO_DEDUCIBLE, CAJA_CHICA

  // Moneda
  moneda?: string; // PYG, USD
  tipoCambio?: number;

  // Ítems
  items: CreateFacturaCompraDetalleInput[];

  // Adicional
  descripcion?: string;
  observaciones?: string;
}

export interface CreateFacturaCompraDetalleInput {
  lineaNumero: number;
  articuloId?: string;
  descripcion: string;
  cantidad: number;
  unidadMedida?: string; // Si no se proporciona, se toma del producto
  precioUnitario: number;
  centroCostoId: string;
  cuentaContableId?: string; // Si no se proporciona, se toma del producto
}

export interface FacturaCompraFilters {
  estado?: string;
  proveedorId?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  search?: string;
}

export interface TotalesDNIT {
  gravado10: number;
  iva10: number;
  gravado5: number;
  iva5: number;
  exentas: number;
  totalFactura: number;
}

// ==========================================
// FUNCIONES DE UTILIDAD
// ==========================================

/**
 * Genera el número completo de factura según formato DNIT
 * Formato: 001-002-0003456
 */
function generarNumeroCompleto(
  establecimiento: string,
  puntoExpedicion: string,
  numero: string
): string {
  // Asegurar formato de 3 dígitos para establecimiento y punto
  const est = establecimiento.padStart(3, '0');
  const pto = puntoExpedicion.padStart(3, '0');

  // Asegurar formato de 7 dígitos para número
  const num = numero.padStart(7, '0');

  return `${est}-${pto}-${num}`;
}

/**
 * Calcula totales segregados por tasa de IVA según DNIT
 */
function calcularTotalesDNIT(
  detalles: Array<{ subtotal: number; tasaIva: number; montoIva: number }>
): TotalesDNIT {
  let gravado10 = 0;
  let iva10 = 0;
  let gravado5 = 0;
  let iva5 = 0;
  let exentas = 0;

  for (const detalle of detalles) {
    if (detalle.tasaIva === 10) {
      gravado10 += detalle.subtotal;
      iva10 += detalle.montoIva;
    } else if (detalle.tasaIva === 5) {
      gravado5 += detalle.subtotal;
      iva5 += detalle.montoIva;
    } else {
      exentas += detalle.subtotal;
    }
  }

  const totalFactura = gravado10 + iva10 + gravado5 + iva5 + exentas;

  return {
    gravado10,
    iva10,
    gravado5,
    iva5,
    exentas,
    totalFactura
  };
}

// ==========================================
// SERVICIO DE FACTURAS DE COMPRA
// ==========================================

export const facturaCompraService = {
  /**
   * Obtiene todas las facturas con filtros
   */
  async getAll(tenantId: string, filters?: FacturaCompraFilters) {
    const where: any = { tenantId };

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    if (filters?.proveedorId) {
      where.proveedorId = filters.proveedorId;
    }

    if (filters?.fechaDesde || filters?.fechaHasta) {
      where.fechaEmision = {};
      if (filters.fechaDesde) {
        where.fechaEmision.gte = filters.fechaDesde;
      }
      if (filters.fechaHasta) {
        where.fechaEmision.lte = filters.fechaHasta;
      }
    }

    if (filters?.search) {
      where.OR = [
        { numeroCompleto: { contains: filters.search } },
        { proveedorRazonSocial: { contains: filters.search } },
        { descripcion: { contains: filters.search } }
      ];
    }

    return await prisma.facturaCompra.findMany({
      where,
      include: {
        proveedor: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            ruc: true
          }
        },
        ordenCompra: {
          select: {
            id: true,
            numero: true
          }
        },
        detalles: {
          include: {
            articulo: {
              select: {
                id: true,
                codigo: true,
                nombre: true
              }
            },
            centroCosto: {
              select: {
                id: true,
                codigo: true,
                nombre: true
              }
            }
          }
        }
      },
      orderBy: { fechaEmision: 'desc' }
    });
  },

  /**
   * Obtiene una factura por ID
   */
  async getById(id: string, tenantId: string) {
    const factura = await prisma.facturaCompra.findFirst({
      where: { id, tenantId },
      include: {
        proveedor: true,
        ordenCompra: true,
        detalles: {
          include: {
            articulo: true,
            centroCosto: true,
            cuentaContable: true
          },
          orderBy: { lineaNumero: 'asc' }
        },
        asiento: {
          include: {
            lineas: {
              include: {
                cuenta: true,
                centroCosto: true
              }
            }
          }
        }
      }
    });

    if (!factura) {
      throw new Error('Factura no encontrada');
    }

    return factura;
  },

  /**
   * Crea una nueva factura de compra con validaciones DNIT
   */
  async create(tenantId: string, data: CreateFacturaCompraInput, createdBy?: string) {
    // 1. Validar número único
    const numeroCompleto = generarNumeroCompleto(
      data.establecimiento,
      data.puntoExpedicion,
      data.numero
    );

    const existing = await prisma.facturaCompra.findFirst({
      where: {
        tenantId,
        timbrado: data.timbrado,
        numeroCompleto
      }
    });

    if (existing) {
      throw new Error(`Ya existe una factura con número ${numeroCompleto} y timbrado ${data.timbrado}`);
    }

    // 2. Obtener datos del proveedor
    const proveedor = await prisma.proveedor.findFirst({
      where: { id: data.proveedorId, tenantId }
    });

    if (!proveedor) {
      throw new Error('Proveedor no encontrado');
    }

    // 3. Procesar cada ítem y calcular totales
    const detallesData = [];
    const detallesParaTotales = [];

    for (const item of data.items) {
      // Obtener datos del artículo si existe
      let articulo = null;
      let tasaIva = 10; // Default
      let cuentaContableId = item.cuentaContableId;
      let unidadMedida = item.unidadMedida;

      if (item.articuloId) {
        articulo = await prisma.producto.findFirst({
          where: { id: item.articuloId, tenantId }
        });

        if (!articulo) {
          throw new Error(`Producto no encontrado: ${item.articuloId}`);
        }

        tasaIva = articulo.tasaIva;
        unidadMedida = unidadMedida || articulo.unidadCompra;

        // Si no se proporciona cuenta contable, usar la del producto
        if (!cuentaContableId) {
          if (!articulo.cuentaCostoId) {
            throw new Error(`El producto ${articulo.nombre} no tiene cuenta de costo configurada`);
          }
          cuentaContableId = articulo.cuentaCostoId;
        }
      }

      if (!cuentaContableId) {
        throw new Error(`Debe proporcionar una cuenta contable para el ítem ${item.lineaNumero}`);
      }

      // Calcular importes
      const subtotal = item.cantidad * item.precioUnitario;
      const montoIva = subtotal * (tasaIva / 100);
      const total = subtotal + montoIva;

      // Convertir a unidad de control si aplica
      let cantidadControl = null;
      let unidadControl = null;

      if (articulo && articulo.unidadControl) {
        const conversion = convertirUnidad(
          item.cantidad,
          articulo.unidadCompra,
          articulo.unidadControl,
          articulo.factorConversion
        );
        if (conversion) {
          cantidadControl = conversion.cantidadConvertida;
          unidadControl = conversion.unidadConvertida;
        }
      }

      detallesData.push({
        lineaNumero: item.lineaNumero,
        articuloId: item.articuloId,
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        unidadMedida: unidadMedida || 'UNIDAD',
        precioUnitario: item.precioUnitario,
        subtotal,
        tasaIva,
        montoIva,
        total,
        centroCostoId: item.centroCostoId,
        cuentaContableId,
        cantidadControl,
        unidadControl,
        pendienteIngreso: articulo?.controlaStock || false
      });

      detallesParaTotales.push({ subtotal, tasaIva, montoIva });
    }

    // 4. Calcular totales DNIT
    const totales = calcularTotalesDNIT(detallesParaTotales);

    // 5. Crear factura con detalles en transacción
    const factura = await prisma.$transaction(async (tx) => {
      const nuevaFactura = await tx.facturaCompra.create({
        data: {
          tenantId,
          timbrado: data.timbrado,
          establecimiento: data.establecimiento,
          puntoExpedicion: data.puntoExpedicion,
          numero: data.numero,
          numeroCompleto,
          fechaEmision: data.fechaEmision,
          fechaRecepcion: data.fechaRecepcion,
          fechaVencimiento: data.fechaVencimiento,
          proveedorId: data.proveedorId,
          proveedorRuc: proveedor.ruc || '',
          proveedorRazonSocial: proveedor.nombre,
          ordenCompraId: data.ordenCompraId,
          tipo: data.tipo || 'NORMAL',
          moneda: data.moneda || 'PYG',
          tipoCambio: data.tipoCambio || 1,
          gravado10: totales.gravado10,
          iva10: totales.iva10,
          gravado5: totales.gravado5,
          iva5: totales.iva5,
          exentas: totales.exentas,
          totalFactura: totales.totalFactura,
          estado: 'PENDIENTE',
          saldoPendiente: totales.totalFactura,
          descripcion: data.descripcion,
          observaciones: data.observaciones,
          createdBy
        }
      });

      // Crear detalles
      await tx.facturaCompraDetalle.createMany({
        data: detallesData.map(d => ({
          ...d,
          facturaId: nuevaFactura.id
        }))
      });

      return nuevaFactura;
    });

    return await this.getById(factura.id, tenantId);
  },

  /**
   * Valida una factura y genera asiento contable automático
   */
  async validar(id: string, tenantId: string, validatedBy?: string) {
    const factura = await this.getById(id, tenantId);

    if (factura.estado !== 'PENDIENTE') {
      throw new Error('Solo se pueden validar facturas en estado PENDIENTE');
    }

    if (factura.detalles.length === 0) {
      throw new Error('La factura no tiene ítems');
    }

    // Generar asiento contable
    const asiento = await this.generarAsientoContable(factura, tenantId);

    // Actualizar factura
    return await prisma.facturaCompra.update({
      where: { id },
      data: {
        estado: 'VALIDADA',
        asientoId: asiento.id,
        fechaContabilizacion: new Date(),
        validatedBy,
        validatedAt: new Date()
      },
      include: {
        detalles: true,
        asiento: {
          include: {
            lineas: {
              include: {
                cuenta: true
              }
            }
          }
        }
      }
    });
  },

  /**
   * Genera asiento contable automático según DNIT
   */
  async generarAsientoContable(factura: any, tenantId: string) {
    // 1. Obtener siguiente número de asiento
    const ultimoAsiento = await prisma.asientoContable.findFirst({
      where: { tenantId },
      orderBy: { numero: 'desc' }
    });

    const numeroAsiento = (ultimoAsiento?.numero || 0) + 1;

    // 2. Crear asiento
    const asiento = await prisma.$transaction(async (tx) => {
      const nuevoAsiento = await tx.asientoContable.create({
        data: {
          tenantId,
          numero: numeroAsiento,
          fecha: factura.fechaRecepcion,
          descripcion: `Factura Compra ${factura.numeroCompleto} - ${factura.proveedorRazonSocial}`,
          tipo: 'DIARIO',
          estado: 'CONTABILIZADO',
          documentoRef: factura.numeroCompleto,
          tipoDoc: 'FACTURA_COMPRA',
          contabilizadoPor: factura.validatedBy,
          fechaContabilizado: new Date(),
          totalDebe: 0,
          totalHaber: 0
        }
      });

      const lineas = [];
      let lineaNumero = 1;

      // 3. Líneas de DEBE - Por cada detalle de factura
      for (const detalle of factura.detalles) {
        lineas.push({
          asientoId: nuevoAsiento.id,
          cuentaId: detalle.cuentaContableId,
          debe: detalle.subtotal,
          haber: 0,
          descripcion: detalle.descripcion,
          centroCostoId: detalle.centroCostoId,
          documentoRef: `Línea ${detalle.lineaNumero}`
        });
        lineaNumero++;
      }

      // 4. Línea de DEBE - IVA Crédito Fiscal 10%
      if (factura.iva10 > 0) {
        const cuentaIva10 = await tx.planCuentas.findFirst({
          where: {
            tenantId,
            codigo: { startsWith: '1.1.3' }, // Cuenta de IVA Crédito
            nombre: { contains: '10%' }
          }
        });

        if (cuentaIva10) {
          lineas.push({
            asientoId: nuevoAsiento.id,
            cuentaId: cuentaIva10.id,
            debe: factura.iva10,
            haber: 0,
            descripcion: 'IVA Crédito Fiscal 10%',
            centroCostoId: null,
            documentoRef: null
          });
          lineaNumero++;
        }
      }

      // 5. Línea de DEBE - IVA Crédito Fiscal 5%
      if (factura.iva5 > 0) {
        const cuentaIva5 = await tx.planCuentas.findFirst({
          where: {
            tenantId,
            codigo: { startsWith: '1.1.3' }, // Cuenta de IVA Crédito
            nombre: { contains: '5%' }
          }
        });

        if (cuentaIva5) {
          lineas.push({
            asientoId: nuevoAsiento.id,
            cuentaId: cuentaIva5.id,
            debe: factura.iva5,
            haber: 0,
            descripcion: 'IVA Crédito Fiscal 5%',
            centroCostoId: null,
            documentoRef: null
          });
          lineaNumero++;
        }
      }

      // 6. Línea de HABER - Cuentas por Pagar
      const cuentaCxP = await tx.planCuentas.findFirst({
        where: {
          tenantId,
          codigo: { startsWith: '2.1' }, // Pasivo Corriente - Proveedores
          nombre: { contains: 'Proveedor' }
        }
      });

      if (!cuentaCxP) {
        throw new Error('No se encontró cuenta de Proveedores (Cuentas por Pagar)');
      }

      lineas.push({
        asientoId: nuevoAsiento.id,
        cuentaId: cuentaCxP.id,
        debe: 0,
        haber: factura.totalFactura,
        descripcion: `CxP - ${factura.proveedorRazonSocial}`,
        centroCostoId: null,
        documentoRef: factura.numeroCompleto
      });

      // 7. Crear todas las líneas
      await tx.lineaAsiento.createMany({
        data: lineas
      });

      // 8. Calcular totales
      const totalDebe = lineas.reduce((sum, l) => sum + l.debe, 0);
      const totalHaber = lineas.reduce((sum, l) => sum + l.haber, 0);

      // 9. Validar que cuadre
      if (Math.abs(totalDebe - totalHaber) > 0.01) {
        throw new Error(`Asiento descuadrado: Debe=${totalDebe}, Haber=${totalHaber}`);
      }

      // 10. Actualizar totales del asiento
      await tx.asientoContable.update({
        where: { id: nuevoAsiento.id },
        data: { totalDebe, totalHaber }
      });

      return nuevoAsiento;
    });

    return asiento;
  },

  /**
   * Anula una factura
   */
  async anular(id: string, tenantId: string, motivo: string) {
    const factura = await this.getById(id, tenantId);

    if (factura.estado === 'ANULADA') {
      throw new Error('La factura ya está anulada');
    }

    if (factura.ordenesPago && factura.ordenesPago.length > 0) {
      throw new Error('No se puede anular una factura con pagos registrados');
    }

    return await prisma.facturaCompra.update({
      where: { id },
      data: {
        estado: 'ANULADA',
        observaciones: `${factura.observaciones || ''}\nANULADA: ${motivo}`
      }
    });
  }
};
