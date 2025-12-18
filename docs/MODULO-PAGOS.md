# Módulo de Pagos y Órdenes de Compra

## Descripción General

El Módulo de Pagos es un sistema completo de gestión de compras y pagos que incluye flujos de aprobación, manejo de retenciones, gestión bancaria y conciliación. Está totalmente integrado con el módulo de contabilidad existente.

## Características Principales

### 1. Órdenes de Compra (OC)
- ✅ Creación de órdenes de compra con numeración automática (OC-YYYY-NNNN)
- ✅ Items de la orden con productos, cantidades y precios
- ✅ Flujo de aprobación: BORRADOR → PENDIENTE_APROBACION → APROBADA/RECHAZADA
- ✅ Tracking de solicitante y aprobador
- ✅ Motivos de rechazo
- ✅ Anulación de órdenes

### 2. Facturas de Compra
- ✅ Soporte para múltiples tipos de facturas:
  - NORMAL: Facturas regulares
  - ANTICIPO: Pagos adelantados
  - GASTO_NO_DEDUCIBLE: Gastos no deducibles de impuestos
  - CAJA_CHICA: Gastos menores de caja chica
- ✅ Vinculación opcional con órdenes de compra
- ✅ Tracking de pagos parciales y totales
- ✅ Manejo de IVA (10%, 5%, exentas)
- ✅ Control de saldo pendiente

### 3. Órdenes de Pago (OP)
- ✅ Numeración automática (OP-YYYY-NNNN)
- ✅ Múltiples métodos de pago:
  - EFECTIVO
  - TRANSFERENCIA
  - CHEQUE
  - CHEQUE_DIFERIDO
- ✅ Flujo completo de aprobación
- ✅ Retenciones de impuestos:
  - IVA (Impuesto al Valor Agregado)
  - IRE (Impuesto a la Renta Empresarial)
  - IRP y otros
- ✅ Integración con cuentas bancarias
- ✅ Generación automática de movimientos bancarios
- ✅ Integración con asientos contables

### 4. Gestión Bancaria
- ✅ Cuentas bancarias (corriente y caja de ahorro)
- ✅ Multi-moneda (PYG, USD)
- ✅ Chequeras con rangos de números
- ✅ Movimientos bancarios (ingresos y egresos)
- ✅ Tracking de estado (pendiente, conciliado, reversado)
- ✅ Control de saldo en tiempo real

### 5. Conciliación Bancaria (Preparado para futuro)
- 🔧 Extractos bancarios por período
- 🔧 Conciliación automática de movimientos
- 🔧 Carga de archivos de extracto

## Arquitectura de Base de Datos

### Modelos Principales

#### CuentaBancaria
```prisma
model CuentaBancaria {
  id               String
  tenantId         String
  banco            String           // Nombre del banco
  tipoCuenta       String           // CUENTA_CORRIENTE, CAJA_AHORRO
  numeroCuenta     String
  moneda           String           // PYG, USD
  saldoActual      Float
  cuentaContableId String?          // Integración con plan de cuentas
  activo           Boolean
  chequeras        Chequera[]
  movimientos      MovimientoBancario[]
  ordenesPago      OrdenPago[]
}
```

#### OrdenCompra
```prisma
model OrdenCompra {
  id              String
  tenantId        String
  numero          String              // OC-2025-0001
  fecha           DateTime
  proveedorId     String
  descripcion     String
  subtotal        Float
  iva             Float
  total           Float
  estado          String              // BORRADOR, PENDIENTE_APROBACION, APROBADA, RECHAZADA, ANULADA
  solicitadoPor   String?
  aprobadoPor     String?
  fechaAprobacion DateTime?
  motivoRechazo   String?
  items           ItemOrdenCompra[]
  facturas        FacturaCompra[]
}
```

#### FacturaCompra
```prisma
model FacturaCompra {
  id               String
  tenantId         String
  numero           String            // Número de factura del proveedor
  timbrado         String?
  fecha            DateTime
  proveedorId      String
  ordenCompraId    String?           // Opcional
  tipo             String            // NORMAL, ANTICIPO, GASTO_NO_DEDUCIBLE, CAJA_CHICA
  subtotal         Float
  iva10            Float
  iva5             Float
  exentas          Float
  total            Float
  saldoPendiente   Float
  estado           String            // PENDIENTE, PAGADA_PARCIAL, PAGADA_TOTAL, ANULADA
  ordenesPago      OrdenPago[]
}
```

#### OrdenPago
```prisma
model OrdenPago {
  id                String
  tenantId          String
  numero            String           // OP-2025-0001
  fecha             DateTime
  proveedorId       String?
  beneficiario      String
  facturaCompraId   String?
  metodoPago        String           // EFECTIVO, TRANSFERENCIA, CHEQUE, CHEQUE_DIFERIDO
  cuentaBancariaId  String?
  montoTotal        Float
  montoNeto         Float            // Después de retenciones
  retencionIVA      Float
  retencionIRE      Float
  estado            String           // BORRADOR, PENDIENTE_APROBACION, APROBADA, RECHAZADA, PAGADA, ANULADA
  solicitadoPor     String?
  aprobadoPor       String?
  fechaAprobacion   DateTime?
  fechaPago         DateTime?
  asientoContableId String?          // Integración con contabilidad
  retenciones       Retencion[]
  movimientos       MovimientoBancario[]
}
```

#### Retencion
```prisma
model Retencion {
  id                String
  tenantId          String
  ordenPagoId       String
  tipo              String           // IVA, IRE, IRP, OTRO
  numeroComprobante String?
  monto             Float
  porcentaje        Float?
  fechaEmision      DateTime
  rucBeneficiario   String?
}
```

#### MovimientoBancario
```prisma
model MovimientoBancario {
  id                 String
  tenantId           String
  cuentaBancariaId   String
  tipo               String          // CHEQUE, TRANSFERENCIA, EFECTIVO, DEPOSITO
  naturaleza         String          // EGRESO, INGRESO
  fecha              DateTime
  numeroReferencia   String?         // Número de cheque, transferencia, etc.
  monto              Float
  descripcion        String
  ordenPagoId        String?
  estado             String          // PENDIENTE, CONCILIADO, REVERSADO
  fechaConciliacion  DateTime?
}
```

## API Endpoints

### Cuentas Bancarias

#### GET /api/cuentas-bancarias
Obtener todas las cuentas bancarias.

**Query Parameters:**
- `banco` (string): Filtrar por nombre de banco
- `tipoCuenta` (string): CUENTA_CORRIENTE | CAJA_AHORRO
- `moneda` (string): PYG | USD
- `activo` (boolean): true | false

**Response:**
```json
{
  "success": true,
  "data": {
    "cuentas": [...],
    "total": 10
  }
}
```

#### POST /api/cuentas-bancarias
Crear nueva cuenta bancaria.

**Body:**
```json
{
  "banco": "Banco Regional",
  "tipoCuenta": "CUENTA_CORRIENTE",
  "numeroCuenta": "1234567890",
  "moneda": "PYG",
  "saldoActual": 50000000,
  "cuentaContableId": "uuid-cuenta-contable"
}
```

#### GET /api/cuentas-bancarias/:id/movimientos
Obtener movimientos de una cuenta bancaria.

**Query Parameters:**
- `fechaDesde` (string): Fecha inicio (YYYY-MM-DD)
- `fechaHasta` (string): Fecha fin (YYYY-MM-DD)
- `tipo` (string): CHEQUE | TRANSFERENCIA | EFECTIVO
- `page` (number): Página (default: 1)
- `limit` (number): Límite por página (default: 50)

#### GET /api/cuentas-bancarias/:id/chequeras
Obtener chequeras de una cuenta.

#### POST /api/cuentas-bancarias/:id/chequeras
Crear nueva chequera.

**Body:**
```json
{
  "numeroInicial": 1001,
  "numeroFinal": 1100
}
```

### Órdenes de Compra

#### GET /api/ordenes-compra
Listar órdenes de compra.

**Query Parameters:**
- `estado` (string): BORRADOR | PENDIENTE_APROBACION | APROBADA | RECHAZADA | ANULADA
- `proveedorId` (string): UUID del proveedor
- `fechaDesde` (string): Fecha desde
- `fechaHasta` (string): Fecha hasta
- `page` (number): Página
- `limit` (number): Límite

#### POST /api/ordenes-compra
Crear orden de compra.

**Body:**
```json
{
  "fecha": "2025-01-15",
  "proveedorId": "uuid-proveedor",
  "descripcion": "Compra de semillas",
  "observaciones": "Entregar en depósito central",
  "items": [
    {
      "productoId": "uuid-producto",
      "descripcion": "Semillas de soja",
      "cantidad": 1000,
      "precioUnitario": 5000
    }
  ],
  "solicitadoPor": "Juan Pérez"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "numero": "OC-2025-0001",
    "fecha": "2025-01-15T00:00:00Z",
    "estado": "BORRADOR",
    "subtotal": 5000000,
    "iva": 500000,
    "total": 5500000,
    ...
  },
  "message": "Orden de compra creada exitosamente"
}
```

#### PUT /api/ordenes-compra/:id/enviar-aprobacion
Enviar orden a aprobación (BORRADOR → PENDIENTE_APROBACION).

#### PUT /api/ordenes-compra/:id/aprobar
Aprobar orden de compra.

**Body:**
```json
{
  "aprobadoPor": "María González"
}
```

#### PUT /api/ordenes-compra/:id/rechazar
Rechazar orden de compra.

**Body:**
```json
{
  "motivoRechazo": "Precio excesivo, renegociar con proveedor"
}
```

#### PUT /api/ordenes-compra/:id/anular
Anular orden de compra.

### Facturas de Compra

#### GET /api/facturas-compra
Listar facturas de compra.

**Query Parameters:**
- `tipo` (string): NORMAL | ANTICIPO | GASTO_NO_DEDUCIBLE | CAJA_CHICA
- `estado` (string): PENDIENTE | PAGADA_PARCIAL | PAGADA_TOTAL | ANULADA
- `proveedorId` (string)
- `ordenCompraId` (string)
- `fechaDesde` (string)
- `fechaHasta` (string)

#### POST /api/facturas-compra
Crear factura de compra.

**Body:**
```json
{
  "numeroFactura": "001-001-0001234",
  "timbrado": "12345678",
  "fecha": "2025-01-15",
  "fechaVencimiento": "2025-02-15",
  "proveedorId": "uuid-proveedor",
  "ordenCompraId": "uuid-orden-compra",
  "tipo": "NORMAL",
  "descripcion": "Factura por compra de semillas",
  "subtotal": 5000000,
  "iva": 500000,
  "total": 5500000
}
```

#### PUT /api/facturas-compra/:id/marcar-pago
Registrar pago en factura.

**Body:**
```json
{
  "montoPagado": 2750000
}
```

#### PUT /api/facturas-compra/:id/anular
Anular factura.

**Body:**
```json
{
  "motivoAnulacion": "Factura emitida incorrectamente"
}
```

### Órdenes de Pago

#### GET /api/ordenes-pago
Listar órdenes de pago.

**Query Parameters:**
- `estado` (string)
- `metodoPago` (string): EFECTIVO | TRANSFERENCIA | CHEQUE | CHEQUE_DIFERIDO
- `proveedorId` (string)
- `fechaDesde` (string)
- `fechaHasta` (string)

#### POST /api/ordenes-pago
Crear orden de pago.

**Body:**
```json
{
  "fecha": "2025-01-15",
  "proveedorId": "uuid-proveedor",
  "beneficiario": "AGRICOLA SAN JOSE S.A.",
  "facturaCompraId": "uuid-factura",
  "metodoPago": "TRANSFERENCIA",
  "cuentaBancariaId": "uuid-cuenta-bancaria",
  "montoTotal": 5500000,
  "retencionIVA": 275000,
  "retencionIRE": 137500,
  "solicitadoPor": "Juan Pérez",
  "observaciones": "Pago por factura 001-001-0001234",
  "retenciones": [
    {
      "tipo": "IVA",
      "descripcion": "Retención IVA 5%",
      "monto": 275000,
      "porcentaje": 5,
      "numeroComprobante": "RET-001-00123"
    },
    {
      "tipo": "IRE",
      "descripcion": "Retención IRE 2.5%",
      "monto": 137500,
      "porcentaje": 2.5,
      "numeroComprobante": "RET-001-00124"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "numero": "OP-2025-0001",
    "montoTotal": 5500000,
    "montoNeto": 5087500,
    "estado": "BORRADOR",
    "retenciones": [...]
  },
  "message": "Orden de pago creada exitosamente"
}
```

#### PUT /api/ordenes-pago/:id/enviar-aprobacion
Enviar orden de pago a aprobación.

#### PUT /api/ordenes-pago/:id/aprobar
Aprobar orden de pago.

**Body:**
```json
{
  "aprobadoPor": "María González"
}
```

#### PUT /api/ordenes-pago/:id/rechazar
Rechazar orden de pago.

**Body:**
```json
{
  "motivoRechazo": "Monto incorrecto"
}
```

#### PUT /api/ordenes-pago/:id/marcar-pagada
Marcar orden como pagada y crear movimiento bancario.

**Body:**
```json
{
  "numeroCheque": "1001",
  "fechaPago": "2025-01-16",
  "observaciones": "Cheque entregado"
}
```

**Acciones automáticas:**
1. Crea movimiento bancario de egreso
2. Actualiza saldo de cuenta bancaria
3. Actualiza saldo pendiente de factura asociada
4. Cambia estado de orden a PAGADA

#### PUT /api/ordenes-pago/:id/anular
Anular orden de pago.

## Flujos de Trabajo

### Flujo Completo: Desde Orden de Compra hasta Pago

```
1. ORDEN DE COMPRA
   ↓
   Crear OC (estado: BORRADOR)
   ↓
   Enviar a aprobación (estado: PENDIENTE_APROBACION)
   ↓
   Aprobar OC (estado: APROBADA)

2. FACTURA DE COMPRA
   ↓
   Recibir factura del proveedor
   ↓
   Cargar factura vinculada a OC (estado: PENDIENTE)
   ↓
   Verificar datos y montos

3. ORDEN DE PAGO
   ↓
   Crear OP vinculada a factura (estado: BORRADOR)
   ↓
   Calcular retenciones (IVA, IRE)
   ↓
   Seleccionar método de pago y cuenta bancaria
   ↓
   Enviar a aprobación (estado: PENDIENTE_APROBACION)
   ↓
   Aprobar OP (estado: APROBADA)
   ↓
   Marcar como pagada (estado: PAGADA)
   ↓
   Sistema crea automáticamente:
   - Movimiento bancario
   - Actualiza saldo bancario
   - Actualiza saldo factura
   - Asiento contable (futuro)

4. CONCILIACIÓN (Futuro)
   ↓
   Cargar extracto bancario
   ↓
   Conciliar movimientos
   ↓
   Marcar como conciliado
```

### Flujo Simplificado: Pago sin Orden de Compra

```
1. FACTURA DE COMPRA
   ↓
   Cargar factura SIN orden de compra
   ↓
   Tipo: ANTICIPO | GASTO_NO_DEDUCIBLE | CAJA_CHICA

2. ORDEN DE PAGO
   ↓
   [Mismo flujo que arriba]
```

### Flujo de Aprobación

```
Estado Inicial: BORRADOR
   ↓
Usuario crea documento
   ↓
Usuario puede editar/modificar
   ↓
Usuario envía a aprobación
   ↓
Estado: PENDIENTE_APROBACION
   ↓
Aprobador revisa
   ↓
   ├─→ APROBAR → Estado: APROBADA
   └─→ RECHAZAR → Estado: RECHAZADA
       (con motivo de rechazo)

Notas:
- Solo se pueden editar documentos en estado BORRADOR
- Documentos aprobados no se pueden modificar
- Documentos rechazados pueden volver a BORRADOR
- Se puede anular en cualquier estado (excepto PAGADA con movimientos)
```

## Integración con Módulo de Contabilidad

### Cuentas Bancarias → Plan de Cuentas
- Cada cuenta bancaria puede vincularse a una cuenta contable
- Permite registrar movimientos directamente en contabilidad

### Órdenes de Pago → Asientos Contables
- Cada orden de pago pagada puede generar un asiento contable
- Campo `asientoContableId` vincula OP con asiento

### Ejemplo de Asiento Generado

```
Orden de Pago OP-2025-0001
Monto total: Gs. 5.500.000
Retención IVA: Gs. 275.000
Retención IRE: Gs. 137.500
Monto neto: Gs. 5.087.500

Asiento Contable:
DEBE:
  Gastos de Compra          Gs. 5.000.000
  IVA Crédito Fiscal        Gs.   500.000

HABER:
  Retención IVA por Pagar   Gs.   275.000
  Retención IRE por Pagar   Gs.   137.500
  Bancos - Cta. Cte. Reg.   Gs. 5.087.500
```

## Multi-Tenancy

Todos los modelos incluyen `tenantId` para aislamiento de datos:
- Cada consulta filtra automáticamente por tenant
- Las relaciones respetan el tenant
- No es posible acceder a datos de otros tenants

## Estados y Validaciones

### Validaciones de Negocio

#### Órdenes de Compra
- ❌ No se puede editar si estado ≠ BORRADOR
- ❌ No se puede aprobar si estado ≠ PENDIENTE_APROBACION
- ❌ No se puede crear factura si estado ≠ APROBADA
- ✅ Se puede anular en cualquier momento (excepto si tiene facturas pagadas)

#### Facturas de Compra
- ❌ No se puede editar si estado ≠ PENDIENTE
- ❌ No se puede anular si tiene pagos asociados en estado APROBADA o PAGADA
- ✅ El saldoPendiente se actualiza automáticamente con cada pago

#### Órdenes de Pago
- ❌ No se puede editar si estado ≠ BORRADOR
- ❌ No se puede aprobar si estado ≠ PENDIENTE_APROBACION
- ❌ No se puede marcar como pagada si estado ≠ APROBADA
- ❌ No se puede anular si estado = PAGADA (hay movimientos bancarios)
- ✅ Los métodos TRANSFERENCIA, CHEQUE, CHEQUE_DIFERIDO requieren cuenta bancaria
- ✅ El método EFECTIVO no requiere cuenta bancaria

## Frontend Service Layer

El servicio frontend (`pagos.service.ts`) proporciona métodos TypeScript type-safe:

```typescript
import { pagosService } from '@/services/pagos.service';

// Cuentas Bancarias
const cuentas = await pagosService.cuentasBancarias.getAll();
const cuenta = await pagosService.cuentasBancarias.create({
  banco: 'Banco Regional',
  tipoCuenta: 'CUENTA_CORRIENTE',
  numeroCuenta: '1234567890',
  moneda: 'PYG'
});

// Órdenes de Compra
const ordenes = await pagosService.ordenesCompra.getAll({ estado: 'APROBADA' });
await pagosService.ordenesCompra.aprobar(ordenId, 'María González');

// Facturas de Compra
const facturas = await pagosService.facturasCompra.getAll({ estado: 'PENDIENTE' });

// Órdenes de Pago
const pagos = await pagosService.ordenesPago.create({
  fecha: new Date(),
  beneficiario: 'AGRICOLA SAN JOSE S.A.',
  metodoPago: 'TRANSFERENCIA',
  montoTotal: 5500000,
  ...
});
```

## Próximos Pasos

### Implementación Pendiente

1. **Migración de Base de Datos**
   ```bash
   cd api
   npx prisma migrate dev --name add_payment_module
   ```

2. **Seed de Datos Iniciales**
   - Crear cuentas bancarias de ejemplo
   - Crear chequeras iniciales
   - Crear proveedores de prueba

3. **Frontend UI Components**
   - Dashboard de pagos
   - Formulario de orden de compra
   - Formulario de factura de compra
   - Formulario de orden de pago
   - Lista de cuentas bancarias
   - Vista de movimientos bancarios
   - Interfaz de conciliación

4. **Reportes**
   - Reporte de pagos por proveedor
   - Reporte de retenciones
   - Flujo de caja proyectado
   - Antigüedad de saldos

5. **Mejoras Futuras**
   - Carga masiva de facturas (Excel/CSV)
   - Generación automática de comprobantes de retención (PDF)
   - Notificaciones de aprobaciones pendientes
   - Dashboard de tesorería en tiempo real
   - Proyección de flujo de caja
   - Automatización de conciliación bancaria

## Soporte y Mantenimiento

### Logs y Debugging
- Todos los controllers incluyen console.error para debugging
- Los errores se devuelven con mensajes descriptivos
- El servidor incluye logging de requests

### Performance
- Paginación implementada en todas las listas
- Índices en campos de búsqueda frecuente
- Soft delete para mantener histórico sin impactar queries

### Seguridad
- Validación de tenant en todas las operaciones
- Validaciones de estado antes de transiciones
- Validaciones de existencia de registros relacionados
- No se pueden eliminar registros con dependencias

## Contacto

Para preguntas o soporte adicional sobre este módulo, consultar la documentación del proyecto principal o contactar al equipo de desarrollo.

---

**Documentación generada:** 2025-01-18

**Versión del módulo:** 1.0.0

**Estado:** ✅ Backend API completo | 🔧 Frontend UI pendiente | 🔧 Migración pendiente
