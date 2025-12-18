import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create tenant
  const tenant = await prisma.tenant.upsert({
    where: { ruc: '80012345-6' },
    update: {},
    create: {
      nombre: 'Estancia Los Alamos',
      ruc: '80012345-6',
      direccion: 'Ruta 2, Km 45, Caaguazú',
      telefono: '+595981123456',
      email: 'contacto@estancialosalamos.com',
      activo: true
    }
  });
  console.log('✅ Tenant created:', tenant.nombre);

  // Create user
  const user = await prisma.usuario.upsert({
    where: { email: 'admin@estancialosalamos.com' },
    update: {},
    create: {
      email: 'admin@estancialosalamos.com',
      nombre: 'Juan',
      apellido: 'Pérez',
      azureAdId: 'test-azure-id-123',
      role: 'ADMIN',
      tenantId: tenant.id,
      activo: true
    }
  });
  console.log('✅ User created:', user.email);

  // Create productos
  const productos = await Promise.all([
    prisma.producto.create({
      data: {
        codigo: 'ALIM001',
        nombre: 'Alimento Balanceado 25kg',
        descripcion: 'Alimento para ganado bovino, alta proteína',
        categoria: 'Alimentos',
        unidadMedida: 'kg',
        precioCompra: 150000,
        precioVenta: 180000,
        stock: 500,
        stockMinimo: 100,
        tenantId: tenant.id
      }
    }),
    prisma.producto.create({
      data: {
        codigo: 'MED001',
        nombre: 'Vacuna Triple',
        descripcion: 'Vacuna para prevención de enfermedades',
        categoria: 'Medicamentos',
        unidadMedida: 'dosis',
        precioCompra: 25000,
        precioVenta: 35000,
        stock: 200,
        stockMinimo: 50,
        tenantId: tenant.id
      }
    }),
    prisma.producto.create({
      data: {
        codigo: 'FERT001',
        nombre: 'Fertilizante NPK 50kg',
        descripcion: 'Fertilizante completo para pasturas',
        categoria: 'Fertilizantes',
        unidadMedida: 'kg',
        precioCompra: 80000,
        precioVenta: 100000,
        stock: 300,
        stockMinimo: 80,
        tenantId: tenant.id
      }
    }),
    prisma.producto.create({
      data: {
        codigo: 'HER001',
        nombre: 'Herbicida Glifosato 20L',
        descripcion: 'Herbicida de amplio espectro',
        categoria: 'Herbicidas',
        unidadMedida: 'litros',
        precioCompra: 120000,
        precioVenta: 150000,
        stock: 50,
        stockMinimo: 20,
        tenantId: tenant.id
      }
    }),
    prisma.producto.create({
      data: {
        codigo: 'SAL001',
        nombre: 'Sal Mineral 25kg',
        descripcion: 'Suplemento mineral para ganado',
        categoria: 'Suplementos',
        unidadMedida: 'kg',
        precioCompra: 45000,
        precioVenta: 60000,
        stock: 15, // Bajo stock para testing
        stockMinimo: 30,
        tenantId: tenant.id
      }
    })
  ]);
  console.log(`✅ ${productos.length} productos created`);

  // Create clientes
  const clientes = await Promise.all([
    prisma.cliente.create({
      data: {
        codigo: 'CLI001',
        nombre: 'María González',
        ruc: '12345678-9',
        direccion: 'Asunción Centro',
        telefono: '+595981111111',
        email: 'maria@email.com',
        tenantId: tenant.id
      }
    }),
    prisma.cliente.create({
      data: {
        codigo: 'CLI002',
        nombre: 'Pedro Ramírez',
        ruc: '23456789-0',
        direccion: 'San Lorenzo',
        telefono: '+595981222222',
        email: 'pedro@email.com',
        tenantId: tenant.id
      }
    }),
    prisma.cliente.create({
      data: {
        codigo: 'CLI003',
        nombre: 'Ana Martínez',
        direccion: 'Lambaré',
        telefono: '+595981333333',
        email: 'ana@email.com',
        tenantId: tenant.id
      }
    })
  ]);
  console.log(`✅ ${clientes.length} clientes created`);

  // Create proveedores
  const proveedores = await Promise.all([
    prisma.proveedor.create({
      data: {
        codigo: 'PROV001',
        nombre: 'Agropecuaria del Sur S.A.',
        ruc: '80023456-7',
        direccion: 'San Lorenzo, Zona Industrial',
        telefono: '+595981555555',
        email: 'ventas@agrosur.com',
        tenantId: tenant.id
      }
    }),
    prisma.proveedor.create({
      data: {
        codigo: 'PROV002',
        nombre: 'Veterinaria Central',
        ruc: '80034567-8',
        direccion: 'Asunción, Av. España',
        telefono: '+595981666666',
        email: 'contacto@vetcentral.com',
        tenantId: tenant.id
      }
    }),
    prisma.proveedor.create({
      data: {
        codigo: 'PROV003',
        nombre: 'Fertilizantes Paraguay',
        ruc: '80045678-9',
        direccion: 'Villa Elisa',
        telefono: '+595981777777',
        email: 'info@fertpy.com',
        tenantId: tenant.id
      }
    })
  ]);
  console.log(`✅ ${proveedores.length} proveedores created`);

  // Create compras
  const compra1 = await prisma.compra.create({
    data: {
      numero: 'COM-2025-001',
      proveedorId: proveedores[0].id,
      tenantId: tenant.id,
      subtotal: 300000,
      impuesto: 30000,
      total: 330000,
      estado: 'RECIBIDA',
      observaciones: 'Primera compra de alimentos',
      items: {
        create: [
          {
            productoId: productos[0].id, // Alimento Balanceado
            cantidad: 2,
            precioUnit: 150000,
            subtotal: 300000
          }
        ]
      }
    }
  });
  console.log('✅ Compra created:', compra1.numero);

  // Update stock (simulating received purchase)
  await prisma.producto.update({
    where: { id: productos[0].id },
    data: { stock: { increment: 2 } }
  });

  // Create ventas
  const venta1 = await prisma.venta.create({
    data: {
      numero: 'VTA-2025-001',
      clienteId: clientes[0].id,
      tenantId: tenant.id,
      subtotal: 360000,
      impuesto: 36000,
      total: 396000,
      estado: 'COMPLETADA',
      observaciones: 'Primera venta del año',
      items: {
        create: [
          {
            productoId: productos[0].id, // Alimento Balanceado
            cantidad: 2,
            precioUnit: 180000,
            subtotal: 360000
          }
        ]
      }
    }
  });
  console.log('✅ Venta created:', venta1.numero);

  // Update stock (simulating sale)
  await prisma.producto.update({
    where: { id: productos[0].id },
    data: { stock: { decrement: 2 } }
  });

  const venta2 = await prisma.venta.create({
    data: {
      numero: 'VTA-2025-002',
      clienteId: clientes[1].id,
      tenantId: tenant.id,
      subtotal: 210000,
      impuesto: 21000,
      total: 231000,
      estado: 'COMPLETADA',
      items: {
        create: [
          {
            productoId: productos[1].id, // Vacuna Triple
            cantidad: 6,
            precioUnit: 35000,
            subtotal: 210000
          }
        ]
      }
    }
  });
  console.log('✅ Venta created:', venta2.numero);

  await prisma.producto.update({
    where: { id: productos[1].id },
    data: { stock: { decrement: 6 } }
  });

  // ==========================================
  // CONTABILIDAD - CENTROS DE COSTO
  // ==========================================

  const centrosCosto = await Promise.all([
    prisma.centroCosto.create({
      data: {
        codigo: 'ADM',
        nombre: 'Administración',
        descripcion: 'Gastos administrativos generales',
        tipo: 'ADMINISTRATIVO',
        tenantId: tenant.id
      }
    }),
    prisma.centroCosto.create({
      data: {
        codigo: 'BOV',
        nombre: 'Bovinos',
        descripcion: 'Producción de ganado bovino',
        tipo: 'PRODUCCION',
        tenantId: tenant.id
      }
    }),
    prisma.centroCosto.create({
      data: {
        codigo: 'PAST',
        nombre: 'Pasturas',
        descripcion: 'Mantenimiento y producción de pasturas',
        tipo: 'PRODUCCION',
        tenantId: tenant.id
      }
    }),
    prisma.centroCosto.create({
      data: {
        codigo: 'AGR',
        nombre: 'Agricultura',
        descripcion: 'Producción agrícola',
        tipo: 'PRODUCCION',
        tenantId: tenant.id
      }
    })
  ]);
  console.log(`✅ ${centrosCosto.length} centros de costo created`);

  // ==========================================
  // CONTABILIDAD - PLAN DE CUENTAS
  // ==========================================

  // Nivel 1 - ACTIVOS
  const activo = await prisma.planCuentas.create({
    data: {
      codigo: '1',
      nombre: 'ACTIVO',
      tipo: 'ACTIVO',
      naturaleza: 'DEUDORA',
      nivel: 1,
      aceptaMovimiento: false,
      tenantId: tenant.id
    }
  });

  // Nivel 2 - ACTIVO CORRIENTE
  const activoCorriente = await prisma.planCuentas.create({
    data: {
      codigo: '1.1',
      nombre: 'ACTIVO CORRIENTE',
      tipo: 'ACTIVO',
      naturaleza: 'DEUDORA',
      nivel: 2,
      cuentaPadreId: activo.id,
      aceptaMovimiento: false,
      tenantId: tenant.id
    }
  });

  // Nivel 3 - Caja y Bancos
  const cajaBancos = await prisma.planCuentas.create({
    data: {
      codigo: '1.1.01',
      nombre: 'CAJA Y BANCOS',
      tipo: 'ACTIVO',
      naturaleza: 'DEUDORA',
      nivel: 3,
      cuentaPadreId: activoCorriente.id,
      aceptaMovimiento: false,
      tenantId: tenant.id
    }
  });

  // Nivel 4 - Cuentas específicas
  await Promise.all([
    prisma.planCuentas.create({
      data: {
        codigo: '1.1.01.001',
        nombre: 'Caja General',
        tipo: 'ACTIVO',
        naturaleza: 'DEUDORA',
        nivel: 4,
        cuentaPadreId: cajaBancos.id,
        aceptaMovimiento: true,
        tenantId: tenant.id
      }
    }),
    prisma.planCuentas.create({
      data: {
        codigo: '1.1.01.002',
        nombre: 'Banco Continental - CTA CTE',
        tipo: 'ACTIVO',
        naturaleza: 'DEUDORA',
        nivel: 4,
        cuentaPadreId: cajaBancos.id,
        aceptaMovimiento: true,
        tenantId: tenant.id
      }
    })
  ]);

  // Nivel 3 - Inventarios
  const inventarios = await prisma.planCuentas.create({
    data: {
      codigo: '1.1.02',
      nombre: 'INVENTARIOS',
      tipo: 'ACTIVO',
      naturaleza: 'DEUDORA',
      nivel: 3,
      cuentaPadreId: activoCorriente.id,
      aceptaMovimiento: false,
      tenantId: tenant.id
    }
  });

  await Promise.all([
    prisma.planCuentas.create({
      data: {
        codigo: '1.1.02.001',
        nombre: 'Inventario de Alimentos',
        tipo: 'ACTIVO',
        naturaleza: 'DEUDORA',
        nivel: 4,
        cuentaPadreId: inventarios.id,
        centroCostoId: centrosCosto[1].id, // Bovinos
        aceptaMovimiento: true,
        tenantId: tenant.id
      }
    }),
    prisma.planCuentas.create({
      data: {
        codigo: '1.1.02.002',
        nombre: 'Inventario de Medicamentos',
        tipo: 'ACTIVO',
        naturaleza: 'DEUDORA',
        nivel: 4,
        cuentaPadreId: inventarios.id,
        centroCostoId: centrosCosto[1].id, // Bovinos
        aceptaMovimiento: true,
        tenantId: tenant.id
      }
    }),
    prisma.planCuentas.create({
      data: {
        codigo: '1.1.02.003',
        nombre: 'Inventario de Fertilizantes',
        tipo: 'ACTIVO',
        naturaleza: 'DEUDORA',
        nivel: 4,
        cuentaPadreId: inventarios.id,
        centroCostoId: centrosCosto[2].id, // Pasturas
        aceptaMovimiento: true,
        tenantId: tenant.id
      }
    })
  ]);

  // Nivel 1 - PASIVO
  const pasivo = await prisma.planCuentas.create({
    data: {
      codigo: '2',
      nombre: 'PASIVO',
      tipo: 'PASIVO',
      naturaleza: 'ACREEDORA',
      nivel: 1,
      aceptaMovimiento: false,
      tenantId: tenant.id
    }
  });

  const pasivoCorriente = await prisma.planCuentas.create({
    data: {
      codigo: '2.1',
      nombre: 'PASIVO CORRIENTE',
      tipo: 'PASIVO',
      naturaleza: 'ACREEDORA',
      nivel: 2,
      cuentaPadreId: pasivo.id,
      aceptaMovimiento: false,
      tenantId: tenant.id
    }
  });

  await prisma.planCuentas.create({
    data: {
      codigo: '2.1.01.001',
      nombre: 'Cuentas por Pagar Proveedores',
      tipo: 'PASIVO',
      naturaleza: 'ACREEDORA',
      nivel: 4,
      cuentaPadreId: pasivoCorriente.id,
      aceptaMovimiento: true,
      tenantId: tenant.id
    }
  });

  // Nivel 1 - PATRIMONIO
  const patrimonio = await prisma.planCuentas.create({
    data: {
      codigo: '3',
      nombre: 'PATRIMONIO',
      tipo: 'PATRIMONIO',
      naturaleza: 'ACREEDORA',
      nivel: 1,
      aceptaMovimiento: false,
      tenantId: tenant.id
    }
  });

  await prisma.planCuentas.create({
    data: {
      codigo: '3.1.01.001',
      nombre: 'Capital Social',
      tipo: 'PATRIMONIO',
      naturaleza: 'ACREEDORA',
      nivel: 4,
      cuentaPadreId: patrimonio.id,
      aceptaMovimiento: true,
      tenantId: tenant.id
    }
  });

  // Nivel 1 - INGRESOS
  const ingresos = await prisma.planCuentas.create({
    data: {
      codigo: '4',
      nombre: 'INGRESOS',
      tipo: 'INGRESO',
      naturaleza: 'ACREEDORA',
      nivel: 1,
      aceptaMovimiento: false,
      tenantId: tenant.id
    }
  });

  const ingresosOperacionales = await prisma.planCuentas.create({
    data: {
      codigo: '4.1',
      nombre: 'INGRESOS OPERACIONALES',
      tipo: 'INGRESO',
      naturaleza: 'ACREEDORA',
      nivel: 2,
      cuentaPadreId: ingresos.id,
      aceptaMovimiento: false,
      tenantId: tenant.id
    }
  });

  await Promise.all([
    prisma.planCuentas.create({
      data: {
        codigo: '4.1.01.001',
        nombre: 'Venta de Ganado',
        tipo: 'INGRESO',
        naturaleza: 'ACREEDORA',
        nivel: 4,
        cuentaPadreId: ingresosOperacionales.id,
        centroCostoId: centrosCosto[1].id, // Bovinos
        aceptaMovimiento: true,
        tenantId: tenant.id
      }
    }),
    prisma.planCuentas.create({
      data: {
        codigo: '4.1.01.002',
        nombre: 'Venta de Productos Agrícolas',
        tipo: 'INGRESO',
        naturaleza: 'ACREEDORA',
        nivel: 4,
        cuentaPadreId: ingresosOperacionales.id,
        centroCostoId: centrosCosto[3].id, // Agricultura
        aceptaMovimiento: true,
        tenantId: tenant.id
      }
    })
  ]);

  // Nivel 1 - GASTOS
  const gastos = await prisma.planCuentas.create({
    data: {
      codigo: '5',
      nombre: 'GASTOS',
      tipo: 'GASTO',
      naturaleza: 'DEUDORA',
      nivel: 1,
      aceptaMovimiento: false,
      tenantId: tenant.id
    }
  });

  const gastosOperacionales = await prisma.planCuentas.create({
    data: {
      codigo: '5.1',
      nombre: 'GASTOS OPERACIONALES',
      tipo: 'GASTO',
      naturaleza: 'DEUDORA',
      nivel: 2,
      cuentaPadreId: gastos.id,
      aceptaMovimiento: false,
      tenantId: tenant.id
    }
  });

  await Promise.all([
    prisma.planCuentas.create({
      data: {
        codigo: '5.1.01.001',
        nombre: 'Compra de Alimentos para Ganado',
        descripcion: 'Alimento balanceado y suplementos',
        tipo: 'GASTO',
        naturaleza: 'DEUDORA',
        nivel: 4,
        cuentaPadreId: gastosOperacionales.id,
        centroCostoId: centrosCosto[1].id, // Bovinos
        tipoGasto: 'COSTO',
        variabilidad: 'VARIABLE',
        aceptaMovimiento: true,
        tenantId: tenant.id
      }
    }),
    prisma.planCuentas.create({
      data: {
        codigo: '5.1.01.002',
        nombre: 'Medicamentos Veterinarios',
        tipo: 'GASTO',
        naturaleza: 'DEUDORA',
        nivel: 4,
        cuentaPadreId: gastosOperacionales.id,
        centroCostoId: centrosCosto[1].id, // Bovinos
        tipoGasto: 'COSTO',
        variabilidad: 'VARIABLE',
        aceptaMovimiento: true,
        tenantId: tenant.id
      }
    }),
    prisma.planCuentas.create({
      data: {
        codigo: '5.1.01.003',
        nombre: 'Fertilizantes y Herbicidas',
        tipo: 'GASTO',
        naturaleza: 'DEUDORA',
        nivel: 4,
        cuentaPadreId: gastosOperacionales.id,
        centroCostoId: centrosCosto[2].id, // Pasturas
        tipoGasto: 'COSTO',
        variabilidad: 'VARIABLE',
        aceptaMovimiento: true,
        tenantId: tenant.id
      }
    }),
    prisma.planCuentas.create({
      data: {
        codigo: '5.1.02.001',
        nombre: 'Sueldos y Jornales',
        tipo: 'GASTO',
        naturaleza: 'DEUDORA',
        nivel: 4,
        cuentaPadreId: gastosOperacionales.id,
        centroCostoId: centrosCosto[0].id, // Administración
        tipoGasto: 'COSTO',
        variabilidad: 'FIJO',
        aceptaMovimiento: true,
        tenantId: tenant.id
      }
    })
  ]);

  const planCuentas = await prisma.planCuentas.count({
    where: { tenantId: tenant.id }
  });
  console.log(`✅ ${planCuentas} cuentas contables created`);

  // ==========================================
  // CONTABILIDAD - ASIENTOS DE EJEMPLO
  // ==========================================

  // Asiento de apertura
  const asientoApertura = await prisma.asientoContable.create({
    data: {
      tenantId: tenant.id,
      numero: 1,
      fecha: new Date('2025-01-01'),
      descripcion: 'Asiento de apertura - Capital inicial',
      tipo: 'APERTURA',
      estado: 'CONTABILIZADO',
      contabilizadoPor: user.email,
      fechaContabilizado: new Date('2025-01-01'),
      lineas: {
        create: [
          {
            cuentaId: (await prisma.planCuentas.findFirst({
              where: { tenantId: tenant.id, codigo: '1.1.01.002' } // Banco
            }))!.id,
            debe: 50000000,
            haber: 0,
            descripcion: 'Efectivo inicial en banco'
          },
          {
            cuentaId: (await prisma.planCuentas.findFirst({
              where: { tenantId: tenant.id, codigo: '3.1.01.001' } // Capital
            }))!.id,
            debe: 0,
            haber: 50000000,
            descripcion: 'Capital social inicial'
          }
        ]
      }
    }
  });
  console.log(`✅ Asiento de apertura created: #${asientoApertura.numero}`);

  console.log('✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - 1 Tenant: ${tenant.nombre}`);
  console.log(`   - 1 User: ${user.email}`);
  console.log(`   - ${productos.length} Productos`);
  console.log(`   - ${clientes.length} Clientes`);
  console.log(`   - ${proveedores.length} Proveedores`);
  console.log(`   - 1 Compra`);
  console.log(`   - 2 Ventas`);
  console.log(`   - ${centrosCosto.length} Centros de Costo`);
  console.log(`   - ${planCuentas} Plan de Cuentas`);
  console.log(`   - 1 Asiento Contable`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
