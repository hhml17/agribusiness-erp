/**
 * Script de seed para crear cuentas contables de nivel 4
 * Estas son necesarias para poder asignar a productos
 *
 * Ejecutar con: npx tsx prisma/seed-cuentas-nivel4.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de cuentas contables de nivel 4...\n');

  // Obtener el primer tenant (para desarrollo)
  const tenant = await prisma.tenant.findFirst();

  if (!tenant) {
    console.error('❌ No se encontró ningún tenant. Por favor crea un tenant primero.');
    process.exit(1);
  }

  console.log(`✅ Usando tenant: ${tenant.nombre} (${tenant.ruc})\n`);

  const tenantId = tenant.id;

  // ==============================================
  // NIVEL 1: ACTIVO (1)
  // ==============================================
  const activo = await prisma.planCuentas.upsert({
    where: {
      tenantId_codigo: { tenantId, codigo: '1' }
    },
    update: {},
    create: {
      tenantId,
      codigo: '1',
      nombre: 'ACTIVO',
      tipo: 'ACTIVO',
      naturaleza: 'DEUDORA', // Activos tienen naturaleza deudora
      nivel: 1,
      aceptaMovimiento: false,
      activo: true
    }
  });
  console.log('✅ Nivel 1: ACTIVO');

  // ==============================================
  // NIVEL 2: ACTIVO CORRIENTE (1.01)
  // ==============================================
  const activoCorriente = await prisma.planCuentas.upsert({
    where: {
      tenantId_codigo: { tenantId, codigo: '1.01' }
    },
    update: {},
    create: {
      tenantId,
      codigo: '1.01',
      nombre: 'ACTIVO CORRIENTE',
      tipo: 'ACTIVO',
      naturaleza: 'DEUDORA',
      nivel: 2,
      aceptaMovimiento: false,
      activo: true,
      cuentaPadreId: activo.id
    }
  });
  console.log('✅ Nivel 2: ACTIVO CORRIENTE');

  // ==============================================
  // NIVEL 3: DISPONIBILIDADES (1.01.01)
  // ==============================================
  const disponibilidades = await prisma.planCuentas.upsert({
    where: {
      tenantId_codigo: { tenantId, codigo: '1.01.01' }
    },
    update: {},
    create: {
      tenantId,
      codigo: '1.01.01',
      nombre: 'DISPONIBILIDADES',
      tipo: 'ACTIVO',
      naturaleza: 'DEUDORA',
      nivel: 3,
      aceptaMovimiento: false,
      activo: true,
      cuentaPadreId: activoCorriente.id
    }
  });
  console.log('✅ Nivel 3: DISPONIBILIDADES');

  // ==============================================
  // NIVEL 3: INVENTARIOS (1.01.03)
  // ==============================================
  const inventarios = await prisma.planCuentas.upsert({
    where: {
      tenantId_codigo: { tenantId, codigo: '1.01.03' }
    },
    update: {},
    create: {
      tenantId,
      codigo: '1.01.03',
      nombre: 'INVENTARIOS',
      tipo: 'ACTIVO',
      naturaleza: 'DEUDORA',
      nivel: 3,
      aceptaMovimiento: false,
      activo: true,
      cuentaPadreId: activoCorriente.id
    }
  });
  console.log('✅ Nivel 3: INVENTARIOS');

  // ==============================================
  // NIVEL 4: CUENTAS DE ACTIVO (Detalle)
  // ==============================================
  const cuentasActivoNivel4 = [
    { codigo: '1.01.01.01', nombre: 'CAJA', padre: disponibilidades },
    { codigo: '1.01.01.02', nombre: 'BANCOS', padre: disponibilidades },
    { codigo: '1.01.03.01', nombre: 'MERCADERÍAS', padre: inventarios },
    { codigo: '1.01.03.02', nombre: 'MATERIAS PRIMAS', padre: inventarios },
    { codigo: '1.01.03.03', nombre: 'PRODUCTOS TERMINADOS', padre: inventarios },
    { codigo: '1.01.03.04', nombre: 'INSUMOS AGRÍCOLAS', padre: inventarios },
    { codigo: '1.01.03.05', nombre: 'INVENTARIO GANADO BOVINO', padre: inventarios },
    { codigo: '1.01.03.06', nombre: 'INVENTARIO GRANOS Y CEREALES', padre: inventarios },
  ];

  for (const cuenta of cuentasActivoNivel4) {
    await prisma.planCuentas.upsert({
      where: {
        tenantId_codigo: { tenantId, codigo: cuenta.codigo }
      },
      update: {},
      create: {
        tenantId,
        codigo: cuenta.codigo,
        nombre: cuenta.nombre,
        tipo: 'ACTIVO',
        naturaleza: 'DEUDORA',
        nivel: 4,
        aceptaMovimiento: true, // ✅ Nivel 4 SÍ acepta movimientos
        activo: true,
        cuentaPadreId: cuenta.padre.id
      }
    });
    console.log(`  ✅ ${cuenta.codigo} - ${cuenta.nombre}`);
  }

  // ==============================================
  // NIVEL 1: INGRESOS (4)
  // ==============================================
  const ingresos = await prisma.planCuentas.upsert({
    where: {
      tenantId_codigo: { tenantId, codigo: '4' }
    },
    update: {},
    create: {
      tenantId,
      codigo: '4',
      nombre: 'INGRESOS',
      tipo: 'INGRESO',
      naturaleza: 'ACREEDORA', // Ingresos tienen naturaleza acreedora
      nivel: 1,
      aceptaMovimiento: false,
      activo: true
    }
  });
  console.log('\n✅ Nivel 1: INGRESOS');

  // ==============================================
  // NIVEL 2: INGRESOS OPERACIONALES (4.01)
  // ==============================================
  const ingresosOperacionales = await prisma.planCuentas.upsert({
    where: {
      tenantId_codigo: { tenantId, codigo: '4.01' }
    },
    update: {},
    create: {
      tenantId,
      codigo: '4.01',
      nombre: 'INGRESOS OPERACIONALES',
      tipo: 'INGRESO',
      naturaleza: 'ACREEDORA',
      nivel: 2,
      aceptaMovimiento: false,
      activo: true,
      cuentaPadreId: ingresos.id
    }
  });
  console.log('✅ Nivel 2: INGRESOS OPERACIONALES');

  // ==============================================
  // NIVEL 3: VENTAS (4.01.01)
  // ==============================================
  const ventas = await prisma.planCuentas.upsert({
    where: {
      tenantId_codigo: { tenantId, codigo: '4.01.01' }
    },
    update: {},
    create: {
      tenantId,
      codigo: '4.01.01',
      nombre: 'VENTAS',
      tipo: 'INGRESO',
      naturaleza: 'ACREEDORA',
      nivel: 3,
      aceptaMovimiento: false,
      activo: true,
      cuentaPadreId: ingresosOperacionales.id
    }
  });
  console.log('✅ Nivel 3: VENTAS');

  // ==============================================
  // NIVEL 4: CUENTAS DE INGRESO (Detalle)
  // ==============================================
  const cuentasIngresoNivel4 = [
    { codigo: '4.01.01.01', nombre: 'VENTAS DE MERCADERÍAS', padre: ventas },
    { codigo: '4.01.01.02', nombre: 'VENTAS DE INSUMOS AGRÍCOLAS', padre: ventas },
    { codigo: '4.01.01.03', nombre: 'VENTAS DE PRODUCTOS TERMINADOS', padre: ventas },
    { codigo: '4.01.01.04', nombre: 'VENTAS DE GRANOS Y CEREALES', padre: ventas },
    { codigo: '4.01.01.05', nombre: 'VENTAS DE GANADO', padre: ventas },
  ];

  for (const cuenta of cuentasIngresoNivel4) {
    await prisma.planCuentas.upsert({
      where: {
        tenantId_codigo: { tenantId, codigo: cuenta.codigo }
      },
      update: {},
      create: {
        tenantId,
        codigo: cuenta.codigo,
        nombre: cuenta.nombre,
        tipo: 'INGRESO',
        naturaleza: 'ACREEDORA',
        nivel: 4,
        aceptaMovimiento: true, // ✅ Nivel 4 SÍ acepta movimientos
        activo: true,
        cuentaPadreId: cuenta.padre.id
      }
    });
    console.log(`  ✅ ${cuenta.codigo} - ${cuenta.nombre}`);
  }

  // ==============================================
  // NIVEL 1: EGRESOS (5)
  // ==============================================
  const egresos = await prisma.planCuentas.upsert({
    where: {
      tenantId_codigo: { tenantId, codigo: '5' }
    },
    update: {},
    create: {
      tenantId,
      codigo: '5',
      nombre: 'EGRESOS',
      tipo: 'EGRESO',
      naturaleza: 'DEUDORA', // Egresos/Gastos tienen naturaleza deudora
      nivel: 1,
      aceptaMovimiento: false,
      activo: true
    }
  });
  console.log('\n✅ Nivel 1: EGRESOS');

  // ==============================================
  // NIVEL 2: COSTO DE VENTAS (5.01)
  // ==============================================
  const costoVentas = await prisma.planCuentas.upsert({
    where: {
      tenantId_codigo: { tenantId, codigo: '5.01' }
    },
    update: {},
    create: {
      tenantId,
      codigo: '5.01',
      nombre: 'COSTO DE VENTAS',
      tipo: 'EGRESO',
      naturaleza: 'DEUDORA',
      nivel: 2,
      aceptaMovimiento: false,
      activo: true,
      cuentaPadreId: egresos.id
    }
  });
  console.log('✅ Nivel 2: COSTO DE VENTAS');

  // ==============================================
  // NIVEL 3: COSTO DE PRODUCTOS VENDIDOS (5.01.01)
  // ==============================================
  const costoProductosVendidos = await prisma.planCuentas.upsert({
    where: {
      tenantId_codigo: { tenantId, codigo: '5.01.01' }
    },
    update: {},
    create: {
      tenantId,
      codigo: '5.01.01',
      nombre: 'COSTO DE PRODUCTOS VENDIDOS',
      tipo: 'EGRESO',
      naturaleza: 'DEUDORA',
      nivel: 3,
      aceptaMovimiento: false,
      activo: true,
      cuentaPadreId: costoVentas.id
    }
  });
  console.log('✅ Nivel 3: COSTO DE PRODUCTOS VENDIDOS');

  // ==============================================
  // NIVEL 4: CUENTAS DE EGRESO (Detalle)
  // ==============================================
  const cuentasEgresoNivel4 = [
    { codigo: '5.01.01.01', nombre: 'COSTO DE MERCADERÍAS VENDIDAS', padre: costoProductosVendidos },
    { codigo: '5.01.01.02', nombre: 'COSTO DE INSUMOS VENDIDOS', padre: costoProductosVendidos },
    { codigo: '5.01.01.03', nombre: 'COSTO DE PRODUCTOS TERMINADOS VENDIDOS', padre: costoProductosVendidos },
    { codigo: '5.01.01.04', nombre: 'COSTO DE GRANOS VENDIDOS', padre: costoProductosVendidos },
    { codigo: '5.01.01.05', nombre: 'COSTO DE GANADO VENDIDO', padre: costoProductosVendidos },
  ];

  for (const cuenta of cuentasEgresoNivel4) {
    await prisma.planCuentas.upsert({
      where: {
        tenantId_codigo: { tenantId, codigo: cuenta.codigo }
      },
      update: {},
      create: {
        tenantId,
        codigo: cuenta.codigo,
        nombre: cuenta.nombre,
        tipo: 'EGRESO',
        naturaleza: 'DEUDORA',
        nivel: 4,
        aceptaMovimiento: true, // ✅ Nivel 4 SÍ acepta movimientos
        activo: true,
        cuentaPadreId: cuenta.padre.id
      }
    });
    console.log(`  ✅ ${cuenta.codigo} - ${cuenta.nombre}`);
  }

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('\n📊 Resumen:');
  console.log('  - Cuentas de ACTIVO nivel 4: 8 (para inventario)');
  console.log('  - Cuentas de INGRESO nivel 4: 5 (para ventas)');
  console.log('  - Cuentas de EGRESO nivel 4: 5 (para costo)');
  console.log('\n✅ Ahora puedes crear productos asignando estas cuentas.');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
