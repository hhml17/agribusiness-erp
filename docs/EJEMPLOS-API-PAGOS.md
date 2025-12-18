# Ejemplos de Uso - API de Pagos

Este documento contiene ejemplos prácticos de uso de la API del módulo de pagos con curl y JavaScript/TypeScript.

## Configuración

```bash
# Variables de entorno
export API_URL="http://localhost:3001"
export TENANT_ID="your-tenant-uuid"
export AUTH_TOKEN="your-auth-token"  # Si se implementa autenticación
```

## Cuentas Bancarias

### 1. Crear Cuenta Bancaria

```bash
curl -X POST $API_URL/api/cuentas-bancarias \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: $TENANT_ID" \
  -d '{
    "banco": "Banco Regional",
    "tipoCuenta": "CUENTA_CORRIENTE",
    "numeroCuenta": "1234567890",
    "moneda": "PYG",
    "saldoActual": 50000000,
    "cuentaContableId": "uuid-plan-cuenta"
  }'
```

**TypeScript:**
```typescript
const cuenta = await pagosService.cuentasBancarias.create({
  banco: "Banco Regional",
  tipoCuenta: "CUENTA_CORRIENTE",
  numeroCuenta: "1234567890",
  moneda: "PYG",
  saldoActual: 50000000,
  cuentaContableId: "uuid-plan-cuenta"
});

console.log(`Cuenta creada: ${cuenta.id}`);
```

### 2. Listar Cuentas Bancarias

```bash
curl -X GET "$API_URL/api/cuentas-bancarias?banco=Regional&moneda=PYG" \
  -H "x-tenant-id: $TENANT_ID"
```

**TypeScript:**
```typescript
const { cuentas, total } = await pagosService.cuentasBancarias.getAll({
  banco: "Regional",
  moneda: "PYG"
});

cuentas.forEach(cuenta => {
  console.log(`${cuenta.banco} - ${cuenta.numeroCuenta}: Gs. ${cuenta.saldoActual.toLocaleString()}`);
});
```

### 3. Crear Chequera

```bash
curl -X POST $API_URL/api/cuentas-bancarias/{CUENTA_ID}/chequeras \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: $TENANT_ID" \
  -d '{
    "numeroInicial": 1001,
    "numeroFinal": 1100
  }'
```

**TypeScript:**
```typescript
const chequera = await pagosService.cuentasBancarias.createChequera(cuentaId, {
  numeroInicial: 1001,
  numeroFinal: 1100
});

console.log(`Chequera creada: ${chequera.numeroInicial} - ${chequera.numeroFinal}`);
```

### 4. Consultar Movimientos

```bash
curl -X GET "$API_URL/api/cuentas-bancarias/{CUENTA_ID}/movimientos?fechaDesde=2025-01-01&fechaHasta=2025-01-31" \
  -H "x-tenant-id: $TENANT_ID"
```

**TypeScript:**
```typescript
const { movimientos, pagination } = await pagosService.cuentasBancarias.getMovimientos(cuentaId, {
  fechaDesde: "2025-01-01",
  fechaHasta: "2025-01-31",
  page: 1,
  limit: 20
});

movimientos.forEach(mov => {
  const signo = mov.naturaleza === 'INGRESO' ? '+' : '-';
  console.log(`${mov.fecha} | ${signo} Gs. ${mov.monto.toLocaleString()} | ${mov.descripcion}`);
});
```

## Órdenes de Compra

### 5. Crear Orden de Compra

```bash
curl -X POST $API_URL/api/ordenes-compra \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: $TENANT_ID" \
  -d '{
    "fecha": "2025-01-15",
    "proveedorId": "uuid-proveedor",
    "descripcion": "Compra de semillas de soja",
    "observaciones": "Entregar en depósito central",
    "items": [
      {
        "productoId": "uuid-producto-soja",
        "descripcion": "Semillas de soja RR",
        "cantidad": 1000,
        "precioUnitario": 5000
      },
      {
        "productoId": "uuid-producto-fertilizante",
        "descripcion": "Fertilizante NPK",
        "cantidad": 500,
        "precioUnitario": 8000
      }
    ],
    "solicitadoPor": "Juan Pérez"
  }'
```

**TypeScript:**
```typescript
const ordenCompra = await pagosService.ordenesCompra.create({
  fecha: new Date("2025-01-15"),
  proveedorId: proveedorId,
  descripcion: "Compra de semillas de soja",
  observaciones: "Entregar en depósito central",
  items: [
    {
      productoId: producto1Id,
      descripcion: "Semillas de soja RR",
      cantidad: 1000,
      precioUnitario: 5000
    },
    {
      productoId: producto2Id,
      descripcion: "Fertilizante NPK",
      cantidad: 500,
      precioUnitario: 8000
    }
  ],
  solicitadoPor: "Juan Pérez"
});

console.log(`Orden creada: ${ordenCompra.numero}`);
console.log(`Total: Gs. ${ordenCompra.total.toLocaleString()}`);
```

### 6. Flujo Completo de Aprobación de OC

```bash
# Paso 1: Enviar a aprobación
curl -X PUT $API_URL/api/ordenes-compra/{OC_ID}/enviar-aprobacion \
  -H "x-tenant-id: $TENANT_ID"

# Paso 2: Aprobar
curl -X PUT $API_URL/api/ordenes-compra/{OC_ID}/aprobar \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: $TENANT_ID" \
  -d '{
    "aprobadoPor": "María González"
  }'
```

**TypeScript:**
```typescript
// Paso 1: Enviar a aprobación
await pagosService.ordenesCompra.enviarAprobacion(ordenId);
console.log("Orden enviada a aprobación");

// Paso 2: Aprobar
const ordenAprobada = await pagosService.ordenesCompra.aprobar(ordenId, "María González");
console.log(`Orden ${ordenAprobada.numero} aprobada por ${ordenAprobada.aprobadoPor}`);
console.log(`Fecha de aprobación: ${ordenAprobada.fechaAprobacion}`);
```

### 7. Rechazar Orden de Compra

```bash
curl -X PUT $API_URL/api/ordenes-compra/{OC_ID}/rechazar \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: $TENANT_ID" \
  -d '{
    "motivoRechazo": "Precio excesivo, renegociar con proveedor"
  }'
```

**TypeScript:**
```typescript
const ordenRechazada = await pagosService.ordenesCompra.rechazar(
  ordenId,
  "Precio excesivo, renegociar con proveedor"
);

console.log(`Orden ${ordenRechazada.numero} rechazada`);
console.log(`Motivo: ${ordenRechazada.motivoRechazo}`);
```

## Facturas de Compra

### 8. Crear Factura Normal (con OC)

```bash
curl -X POST $API_URL/api/facturas-compra \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: $TENANT_ID" \
  -d '{
    "numeroFactura": "001-001-0001234",
    "timbrado": "12345678",
    "fecha": "2025-01-16",
    "fechaVencimiento": "2025-02-16",
    "proveedorId": "uuid-proveedor",
    "ordenCompraId": "uuid-orden-compra",
    "tipo": "NORMAL",
    "descripcion": "Factura por OC-2025-0001",
    "subtotal": 9000000,
    "iva": 900000,
    "total": 9900000
  }'
```

**TypeScript:**
```typescript
const factura = await pagosService.facturasCompra.create({
  numeroFactura: "001-001-0001234",
  timbrado: "12345678",
  fecha: new Date("2025-01-16"),
  fechaVencimiento: new Date("2025-02-16"),
  proveedorId: proveedorId,
  ordenCompraId: ordenCompraId,
  tipo: "NORMAL",
  descripcion: "Factura por OC-2025-0001",
  subtotal: 9000000,
  iva: 900000,
  total: 9900000
});

console.log(`Factura ${factura.numero} creada`);
console.log(`Total: Gs. ${factura.total.toLocaleString()}`);
console.log(`Saldo pendiente: Gs. ${factura.saldoPendiente.toLocaleString()}`);
```

### 9. Crear Factura sin OC (Anticipo)

```bash
curl -X POST $API_URL/api/facturas-compra \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: $TENANT_ID" \
  -d '{
    "numeroFactura": "001-001-0001235",
    "timbrado": "12345678",
    "fecha": "2025-01-16",
    "proveedorId": "uuid-proveedor",
    "tipo": "ANTICIPO",
    "descripcion": "Anticipo 50% para compra de maquinaria",
    "subtotal": 25000000,
    "iva": 2500000,
    "total": 27500000
  }'
```

**TypeScript:**
```typescript
const anticipo = await pagosService.facturasCompra.create({
  numeroFactura: "001-001-0001235",
  timbrado: "12345678",
  fecha: new Date("2025-01-16"),
  proveedorId: proveedorId,
  tipo: "ANTICIPO",
  descripcion: "Anticipo 50% para compra de maquinaria",
  subtotal: 25000000,
  iva: 2500000,
  total: 27500000
});
```

### 10. Consultar Facturas Pendientes

```bash
curl -X GET "$API_URL/api/facturas-compra?estado=PENDIENTE" \
  -H "x-tenant-id: $TENANT_ID"
```

**TypeScript:**
```typescript
const { facturas, pagination } = await pagosService.facturasCompra.getAll({
  estado: "PENDIENTE"
});

facturas.forEach(f => {
  console.log(`${f.numero} | ${f.proveedor.nombre} | Gs. ${f.saldoPendiente.toLocaleString()}`);
});
```

## Órdenes de Pago

### 11. Crear Orden de Pago Completa

```bash
curl -X POST $API_URL/api/ordenes-pago \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: $TENANT_ID" \
  -d '{
    "fecha": "2025-01-17",
    "proveedorId": "uuid-proveedor",
    "beneficiario": "AGRICOLA SAN JOSE S.A.",
    "facturaCompraId": "uuid-factura",
    "metodoPago": "TRANSFERENCIA",
    "cuentaBancariaId": "uuid-cuenta-bancaria",
    "montoTotal": 9900000,
    "retencionIVA": 495000,
    "retencionIRE": 247500,
    "solicitadoPor": "Juan Pérez",
    "observaciones": "Pago por factura 001-001-0001234",
    "retenciones": [
      {
        "tipo": "IVA",
        "descripcion": "Retención IVA 5%",
        "monto": 495000,
        "porcentaje": 5,
        "numeroComprobante": "RET-001-00123",
        "rucBeneficiario": "80012345-6"
      },
      {
        "tipo": "IRE",
        "descripcion": "Retención IRE 2.5%",
        "monto": 247500,
        "porcentaje": 2.5,
        "numeroComprobante": "RET-001-00124",
        "rucBeneficiario": "80012345-6"
      }
    ]
  }'
```

**TypeScript:**
```typescript
const ordenPago = await pagosService.ordenesPago.create({
  fecha: new Date("2025-01-17"),
  proveedorId: proveedorId,
  beneficiario: "AGRICOLA SAN JOSE S.A.",
  facturaCompraId: facturaId,
  metodoPago: "TRANSFERENCIA",
  cuentaBancariaId: cuentaId,
  montoTotal: 9900000,
  retencionIVA: 495000,
  retencionIRE: 247500,
  solicitadoPor: "Juan Pérez",
  observaciones: "Pago por factura 001-001-0001234",
  retenciones: [
    {
      tipo: "IVA",
      descripcion: "Retención IVA 5%",
      monto: 495000,
      porcentaje: 5,
      numeroComprobante: "RET-001-00123",
      rucBeneficiario: "80012345-6"
    },
    {
      tipo: "IRE",
      descripcion: "Retención IRE 2.5%",
      monto: 247500,
      porcentaje: 2.5,
      numeroComprobante: "RET-001-00124",
      rucBeneficiario: "80012345-6"
    }
  ]
});

console.log(`Orden de pago ${ordenPago.numero} creada`);
console.log(`Monto total: Gs. ${ordenPago.montoTotal.toLocaleString()}`);
console.log(`Retenciones: Gs. ${(ordenPago.retencionIVA + ordenPago.retencionIRE).toLocaleString()}`);
console.log(`Monto neto a pagar: Gs. ${ordenPago.montoNeto.toLocaleString()}`);
```

### 12. Flujo Completo de Pago

```bash
# Paso 1: Crear OP
OP_ID=$(curl -X POST $API_URL/api/ordenes-pago \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: $TENANT_ID" \
  -d '{ ... }' | jq -r '.data.id')

# Paso 2: Enviar a aprobación
curl -X PUT $API_URL/api/ordenes-pago/$OP_ID/enviar-aprobacion \
  -H "x-tenant-id: $TENANT_ID"

# Paso 3: Aprobar
curl -X PUT $API_URL/api/ordenes-pago/$OP_ID/aprobar \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: $TENANT_ID" \
  -d '{
    "aprobadoPor": "María González"
  }'

# Paso 4: Marcar como pagada
curl -X PUT $API_URL/api/ordenes-pago/$OP_ID/marcar-pagada \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: $TENANT_ID" \
  -d '{
    "numeroCheque": "1001",
    "fechaPago": "2025-01-18",
    "observaciones": "Transferencia realizada"
  }'
```

**TypeScript:**
```typescript
// Paso 1: Crear
const ordenPago = await pagosService.ordenesPago.create({ ... });
console.log(`✓ Orden ${ordenPago.numero} creada`);

// Paso 2: Enviar a aprobación
await pagosService.ordenesPago.enviarAprobacion(ordenPago.id);
console.log(`✓ Enviada a aprobación`);

// Paso 3: Aprobar
const aprobada = await pagosService.ordenesPago.aprobar(ordenPago.id, "María González");
console.log(`✓ Aprobada por ${aprobada.aprobadoPor}`);

// Paso 4: Marcar como pagada
const pagada = await pagosService.ordenesPago.marcarPagada(ordenPago.id, {
  numeroCheque: "1001",
  fechaPago: "2025-01-18",
  observaciones: "Transferencia realizada"
});

console.log(`✓ Orden de pago ${pagada.numero} marcada como PAGADA`);
console.log(`  Movimientos bancarios creados: ${pagada.movimientos.length}`);
console.log(`  Fecha de pago: ${pagada.fechaPago}`);
```

## Escenarios Completos

### Escenario 1: Compra con Orden de Compra

```typescript
async function flujoCompraCompleto() {
  // 1. Crear y aprobar orden de compra
  const oc = await pagosService.ordenesCompra.create({
    fecha: new Date(),
    proveedorId,
    descripcion: "Compra de insumos agrícolas",
    items: [
      {
        productoId: producto1Id,
        descripcion: "Semillas",
        cantidad: 1000,
        precioUnitario: 5000
      }
    ],
    solicitadoPor: "Juan Pérez"
  });
  console.log(`1. OC ${oc.numero} creada`);

  await pagosService.ordenesCompra.enviarAprobacion(oc.id);
  console.log(`2. OC enviada a aprobación`);

  const ocAprobada = await pagosService.ordenesCompra.aprobar(oc.id, "María González");
  console.log(`3. OC aprobada`);

  // 2. Registrar factura del proveedor
  const factura = await pagosService.facturasCompra.create({
    numeroFactura: "001-001-0001234",
    timbrado: "12345678",
    fecha: new Date(),
    fechaVencimiento: addDays(new Date(), 30),
    proveedorId,
    ordenCompraId: oc.id,
    tipo: "NORMAL",
    descripcion: `Factura por ${oc.numero}`,
    subtotal: oc.subtotal,
    iva: oc.iva,
    total: oc.total
  });
  console.log(`4. Factura ${factura.numero} registrada`);

  // 3. Crear y procesar orden de pago
  const op = await pagosService.ordenesPago.create({
    fecha: new Date(),
    proveedorId,
    beneficiario: "PROVEEDOR S.A.",
    facturaCompraId: factura.id,
    metodoPago: "TRANSFERENCIA",
    cuentaBancariaId,
    montoTotal: factura.total,
    retencionIVA: factura.total * 0.05,
    retencionIRE: factura.total * 0.025,
    solicitadoPor: "Juan Pérez",
    retenciones: [
      {
        tipo: "IVA",
        descripcion: "Retención IVA 5%",
        monto: factura.total * 0.05,
        porcentaje: 5
      },
      {
        tipo: "IRE",
        descripcion: "Retención IRE 2.5%",
        monto: factura.total * 0.025,
        porcentaje: 2.5
      }
    ]
  });
  console.log(`5. OP ${op.numero} creada (Neto: Gs. ${op.montoNeto.toLocaleString()})`);

  await pagosService.ordenesPago.enviarAprobacion(op.id);
  await pagosService.ordenesPago.aprobar(op.id, "María González");
  console.log(`6. OP aprobada`);

  const opPagada = await pagosService.ordenesPago.marcarPagada(op.id, {
    fechaPago: new Date().toISOString(),
    observaciones: "Transferencia bancaria ejecutada"
  });
  console.log(`7. OP marcada como PAGADA`);
  console.log(`✓ Proceso completo finalizado`);
}
```

### Escenario 2: Pago de Anticipo

```typescript
async function pagoAnticipo() {
  // 1. Registrar factura de anticipo (sin OC)
  const anticipo = await pagosService.facturasCompra.create({
    numeroFactura: "001-001-0001235",
    timbrado: "12345678",
    fecha: new Date(),
    proveedorId,
    tipo: "ANTICIPO",
    descripcion: "Anticipo 50% para compra de maquinaria",
    subtotal: 25000000,
    iva: 2500000,
    total: 27500000
  });
  console.log(`Anticipo ${anticipo.numero} registrado: Gs. ${anticipo.total.toLocaleString()}`);

  // 2. Crear y procesar orden de pago
  const op = await pagosService.ordenesPago.create({
    fecha: new Date(),
    proveedorId,
    beneficiario: "MAQUINARIAS S.A.",
    facturaCompraId: anticipo.id,
    metodoPago: "TRANSFERENCIA",
    cuentaBancariaId,
    montoTotal: anticipo.total,
    retencionIVA: anticipo.total * 0.05,
    retencionIRE: anticipo.total * 0.025,
    solicitadoPor: "Juan Pérez",
    retenciones: []
  });

  // Aprobar y pagar
  await pagosService.ordenesPago.enviarAprobacion(op.id);
  await pagosService.ordenesPago.aprobar(op.id, "María González");
  await pagosService.ordenesPago.marcarPagada(op.id, {
    fechaPago: new Date().toISOString()
  });

  console.log(`✓ Anticipo pagado: OP ${op.numero}`);
}
```

### Escenario 3: Pago con Cheque

```typescript
async function pagoConCheque() {
  const op = await pagosService.ordenesPago.create({
    fecha: new Date(),
    proveedorId,
    beneficiario: "PROVEEDOR ABC S.A.",
    facturaCompraId: facturaId,
    metodoPago: "CHEQUE",
    cuentaBancariaId,
    montoTotal: 5000000,
    solicitadoPor: "Juan Pérez"
  });

  await pagosService.ordenesPago.enviarAprobacion(op.id);
  await pagosService.ordenesPago.aprobar(op.id, "María González");

  // Marcar como pagada especificando número de cheque
  const opPagada = await pagosService.ordenesPago.marcarPagada(op.id, {
    numeroCheque: "1001",  // Número de la chequera
    fechaPago: new Date().toISOString(),
    observaciones: "Cheque entregado a proveedor"
  });

  console.log(`✓ Pago con cheque ${opPagada.movimientos[0].numeroReferencia}`);
}
```

## Consultas y Reportes

### Consultar Órdenes de Pago Pendientes de Aprobación

```typescript
const { ordenes } = await pagosService.ordenesPago.getAll({
  estado: "PENDIENTE_APROBACION"
});

console.log(`Órdenes pendientes de aprobación: ${ordenes.length}`);
ordenes.forEach(op => {
  console.log(`${op.numero} | ${op.beneficiario} | Gs. ${op.montoNeto.toLocaleString()}`);
  console.log(`  Solicitado por: ${op.solicitadoPor} | Fecha: ${op.fecha}`);
});
```

### Consultar Saldo de Cuenta Bancaria

```typescript
const cuenta = await pagosService.cuentasBancarias.getById(cuentaId);
console.log(`${cuenta.banco} - ${cuenta.numeroCuenta}`);
console.log(`Saldo actual: Gs. ${cuenta.saldoActual.toLocaleString()}`);
console.log(`Moneda: ${cuenta.moneda}`);
```

### Listar Movimientos del Mes

```typescript
const primerDia = new Date(2025, 0, 1);  // Enero 2025
const ultimoDia = new Date(2025, 0, 31);

const { movimientos } = await pagosService.cuentasBancarias.getMovimientos(cuentaId, {
  fechaDesde: primerDia.toISOString().split('T')[0],
  fechaHasta: ultimoDia.toISOString().split('T')[0]
});

let ingresos = 0;
let egresos = 0;

movimientos.forEach(mov => {
  if (mov.naturaleza === 'INGRESO') {
    ingresos += mov.monto;
  } else {
    egresos += mov.monto;
  }
});

console.log(`Movimientos de ${primerDia.toLocaleDateString()} al ${ultimoDia.toLocaleDateString()}`);
console.log(`Ingresos: Gs. ${ingresos.toLocaleString()}`);
console.log(`Egresos: Gs. ${egresos.toLocaleString()}`);
console.log(`Neto: Gs. ${(ingresos - egresos).toLocaleString()}`);
```

---

## Notas Importantes

1. **Headers Requeridos**: Todos los requests deben incluir `x-tenant-id`
2. **Fechas**: Usar formato ISO 8601 (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss.sssZ)
3. **Montos**: Siempre en números enteros (sin decimales para guaraníes)
4. **Estados**: Respetar los flujos de estado (ver diagramas)
5. **Validaciones**: El backend valida todos los cambios de estado y relaciones

## Códigos de Error Comunes

- `400`: Bad Request - Datos inválidos o estado incorrecto
- `404`: Not Found - Registro no encontrado
- `409`: Conflict - Registro duplicado o conflicto de estado
- `500`: Internal Server Error - Error del servidor

## Testing

Para ejecutar tests de la API, ver el archivo `tests/api/pagos.test.ts` (pendiente de implementación).
