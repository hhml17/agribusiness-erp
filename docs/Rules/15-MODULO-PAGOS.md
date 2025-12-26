# 15 - MÓDULO DE PAGOS Y ÓRDENES DE COMPRA

## 1. DESCRIPCIÓN GENERAL

El **Módulo de Pagos** es un sistema completo de gestión de compras y pagos que incluye flujos de aprobación, manejo de retenciones, gestión bancaria y conciliación. Está totalmente integrado con el módulo de contabilidad existente y permite un control integral del ciclo completo de compras, desde la orden hasta el pago final.

Este módulo proporciona:
- ✅ Gestión completa de órdenes de compra con aprobaciones
- ✅ Control de facturas de proveedores con múltiples tipos
- ✅ Procesamiento de órdenes de pago con retenciones automáticas
- ✅ Administración de cuentas bancarias y movimientos
- ✅ Sistema de chequeras para control de cheques
- ✅ Preparación para conciliación bancaria automatizada

**Referencias cruzadas:**
- Ver [04-SCHEMA-DATABASE.md](./04-SCHEMA-DATABASE.md) para modelos completos de base de datos
- Ver [11-MODULO-FINANCIERO.md](./11-MODULO-FINANCIERO.md) para integración contable
- Ver [05-API-ENDPOINTS.md](./05-API-ENDPOINTS.md) para especificación completa de API

---

## 2. CARACTERÍSTICAS PRINCIPALES

### 2.1 Órdenes de Compra (OC)

- ✅ Creación de órdenes de compra con numeración automática (OC-YYYY-NNNN)
- ✅ Items de la orden con productos, cantidades y precios
- ✅ Flujo de aprobación: BORRADOR → PENDIENTE_APROBACION → APROBADA/RECHAZADA
- ✅ Tracking de solicitante y aprobador
- ✅ Motivos de rechazo documentados
- ✅ Anulación de órdenes con control de estado

### 2.2 Facturas de Compra

**Tipos soportados:**
- **NORMAL**: Facturas regulares de proveedores
- **ANTICIPO**: Pagos adelantados a proveedores
- **GASTO_NO_DEDUCIBLE**: Gastos no deducibles de impuestos
- **CAJA_CHICA**: Gastos menores de caja chica

**Funcionalidades:**
- ✅ Vinculación opcional con órdenes de compra
- ✅ Tracking de pagos parciales y totales
- ✅ Manejo de IVA (10%, 5%, exentas)
- ✅ Control automático de saldo pendiente
- ✅ Estados: PENDIENTE, PAGADA_PARCIAL, PAGADA_TOTAL, ANULADA

### 2.3 Órdenes de Pago (OP)

- ✅ Numeración automática (OP-YYYY-NNNN)
- ✅ Flujo completo de aprobación
- ✅ Integración con cuentas bancarias
- ✅ Generación automática de movimientos bancarios
- ✅ Integración con asientos contables

**Métodos de pago:**
- EFECTIVO
- TRANSFERENCIA
- CHEQUE
- CHEQUE_DIFERIDO

**Retenciones de impuestos:**
- IVA (Impuesto al Valor Agregado)
- IRE (Impuesto a la Renta Empresarial)
- IRP (Impuesto a la Renta Personal)
- OTRO (Otras retenciones)

### 2.4 Gestión Bancaria

- ✅ Cuentas bancarias (corriente y caja de ahorro)
- ✅ Multi-moneda (PYG, USD)
- ✅ Chequeras con rangos de números
- ✅ Movimientos bancarios (ingresos y egresos)
- ✅ Tracking de estado (pendiente, conciliado, reversado)
- ✅ Control de saldo en tiempo real

### 2.5 Conciliación Bancaria

**Preparado para futuro:**
- 🔧 Extractos bancarios por período
- 🔧 Conciliación automática de movimientos
- 🔧 Carga de archivos de extracto

---

## 3. ARQUITECTURA DE BASE DE DATOS

### 3.1 Modelo: CuentaBancaria

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

**Propósito:**
- Gestionar las cuentas bancarias del tenant
- Integrar con el plan de cuentas contables
- Controlar saldos en tiempo real

### 3.2 Modelo: OrdenCompra

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

**Flujo de estados:**
1. BORRADOR - Se puede editar
2. PENDIENTE_APROBACION - Esperando aprobación
3. APROBADA - Puede generar facturas
4. RECHAZADA - Con motivo documentado
5. ANULADA - Cancelada

### 3.3 Modelo: FacturaCompra

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

**Control de pagos:**
- El sistema actualiza automáticamente `saldoPendiente` con cada pago
- El `estado` cambia según el saldo pendiente
- Permite pagos parciales y control de deuda

### 3.4 Modelo: OrdenPago

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

**Cálculo automático:**
- `montoNeto = montoTotal - retencionIVA - retencionIRE - (otras retenciones)`
- Las retenciones se registran en detalle en la tabla `Retencion`

### 3.5 Modelo: Retencion

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

**Documentación de retenciones:**
- Cada retención tiene su comprobante
- Se registra el porcentaje aplicado
- Se identifica al beneficiario (SET)

### 3.6 Modelo: MovimientoBancario

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

**Gestión de movimientos:**
- Se crean automáticamente al marcar una orden como pagada
- Actualizan el saldo de la cuenta bancaria
- Permiten conciliación posterior

---

## 4. API ENDPOINTS

### 4.1 Cuentas Bancarias

#### GET /api/cuentas-bancarias

**Descripción:** Obtener todas las cuentas bancarias del tenant.

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

**Descripción:** Crear nueva cuenta bancaria.

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

**Descripción:** Obtener movimientos de una cuenta bancaria con filtros.

**Query Parameters:**
- `fechaDesde` (string): Fecha inicio (YYYY-MM-DD)
- `fechaHasta` (string): Fecha fin (YYYY-MM-DD)
- `tipo` (string): CHEQUE | TRANSFERENCIA | EFECTIVO
- `page` (number): Página (default: 1)
- `limit` (number): Límite por página (default: 50)

#### GET /api/cuentas-bancarias/:id/chequeras

**Descripción:** Obtener chequeras de una cuenta.

#### POST /api/cuentas-bancarias/:id/chequeras

**Descripción:** Crear nueva chequera.

**Body:**
```json
{
  "numeroInicial": 1001,
  "numeroFinal": 1100
}
```

### 4.2 Órdenes de Compra

#### GET /api/ordenes-compra

**Descripción:** Listar órdenes de compra con filtros.

**Query Parameters:**
- `estado` (string): BORRADOR | PENDIENTE_APROBACION | APROBADA | RECHAZADA | ANULADA
- `proveedorId` (string): UUID del proveedor
- `fechaDesde` (string): Fecha desde
- `fechaHasta` (string): Fecha hasta
- `page` (number): Página
- `limit` (number): Límite

#### POST /api/ordenes-compra

**Descripción:** Crear orden de compra.

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
    "total": 5500000
  },
  "message": "Orden de compra creada exitosamente"
}
```

#### PUT /api/ordenes-compra/:id/enviar-aprobacion

**Descripción:** Enviar orden a aprobación (BORRADOR → PENDIENTE_APROBACION).

#### PUT /api/ordenes-compra/:id/aprobar

**Descripción:** Aprobar orden de compra.

**Body:**
```json
{
  "aprobadoPor": "María González"
}
```

#### PUT /api/ordenes-compra/:id/rechazar

**Descripción:** Rechazar orden de compra con motivo.

**Body:**
```json
{
  "motivoRechazo": "Precio excesivo, renegociar con proveedor"
}
```

#### PUT /api/ordenes-compra/:id/anular

**Descripción:** Anular orden de compra.

### 4.3 Facturas de Compra

#### GET /api/facturas-compra

**Descripción:** Listar facturas de compra.

**Query Parameters:**
- `tipo` (string): NORMAL | ANTICIPO | GASTO_NO_DEDUCIBLE | CAJA_CHICA
- `estado` (string): PENDIENTE | PAGADA_PARCIAL | PAGADA_TOTAL | ANULADA
- `proveedorId` (string)
- `ordenCompraId` (string)
- `fechaDesde` (string)
- `fechaHasta` (string)

#### POST /api/facturas-compra

**Descripción:** Crear factura de compra.

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

**Descripción:** Registrar pago en factura (actualiza saldo pendiente).

**Body:**
```json
{
  "montoPagado": 2750000
}
```

#### PUT /api/facturas-compra/:id/anular

**Descripción:** Anular factura.

**Body:**
```json
{
  "motivoAnulacion": "Factura emitida incorrectamente"
}
```

### 4.4 Órdenes de Pago

#### GET /api/ordenes-pago

**Descripción:** Listar órdenes de pago.

**Query Parameters:**
- `estado` (string)
- `metodoPago` (string): EFECTIVO | TRANSFERENCIA | CHEQUE | CHEQUE_DIFERIDO
- `proveedorId` (string)
- `fechaDesde` (string)
- `fechaHasta` (string)

#### POST /api/ordenes-pago

**Descripción:** Crear orden de pago con retenciones.

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

**Descripción:** Enviar orden de pago a aprobación.

#### PUT /api/ordenes-pago/:id/aprobar

**Descripción:** Aprobar orden de pago.

**Body:**
```json
{
  "aprobadoPor": "María González"
}
```

#### PUT /api/ordenes-pago/:id/rechazar

**Descripción:** Rechazar orden de pago.

**Body:**
```json
{
  "motivoRechazo": "Monto incorrecto"
}
```

#### PUT /api/ordenes-pago/:id/marcar-pagada

**Descripción:** Marcar orden como pagada y crear movimiento bancario.

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

**Descripción:** Anular orden de pago.

---

## 5. FLUJOS DE TRABAJO

### 5.1 Flujo Completo: Desde Orden de Compra hasta Pago

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

### 5.2 Flujo Simplificado: Pago sin Orden de Compra

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

### 5.3 Flujo de Aprobación

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

---

## 6. INTEGRACIÓN CON MÓDULO DE CONTABILIDAD

### 6.1 Cuentas Bancarias → Plan de Cuentas

- Cada cuenta bancaria puede vincularse a una cuenta contable
- Permite registrar movimientos directamente en contabilidad
- Campo `cuentaContableId` en CuentaBancaria

### 6.2 Órdenes de Pago → Asientos Contables

- Cada orden de pago pagada puede generar un asiento contable
- Campo `asientoContableId` vincula OP con asiento
- Generación automática de asientos (próxima implementación)

### 6.3 Ejemplo de Asiento Generado

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

---

## 7. MULTI-TENANCY

Todos los modelos incluyen `tenantId` para aislamiento de datos:
- Cada consulta filtra automáticamente por tenant
- Las relaciones respetan el tenant
- No es posible acceder a datos de otros tenants
- Índices compuestos incluyen tenantId para performance

---

## 8. ESTADOS Y VALIDACIONES

### 8.1 Validaciones de Negocio - Órdenes de Compra

- ❌ No se puede editar si estado ≠ BORRADOR
- ❌ No se puede aprobar si estado ≠ PENDIENTE_APROBACION
- ❌ No se puede crear factura si estado ≠ APROBADA
- ✅ Se puede anular en cualquier momento (excepto si tiene facturas pagadas)

### 8.2 Validaciones de Negocio - Facturas de Compra

- ❌ No se puede editar si estado ≠ PENDIENTE
- ❌ No se puede anular si tiene pagos asociados en estado APROBADA o PAGADA
- ✅ El saldoPendiente se actualiza automáticamente con cada pago
- ✅ El estado cambia automáticamente según saldo:
  - PENDIENTE: saldoPendiente = total
  - PAGADA_PARCIAL: 0 < saldoPendiente < total
  - PAGADA_TOTAL: saldoPendiente = 0

### 8.3 Validaciones de Negocio - Órdenes de Pago

- ❌ No se puede editar si estado ≠ BORRADOR
- ❌ No se puede aprobar si estado ≠ PENDIENTE_APROBACION
- ❌ No se puede marcar como pagada si estado ≠ APROBADA
- ❌ No se puede anular si estado = PAGADA (hay movimientos bancarios)
- ✅ Los métodos TRANSFERENCIA, CHEQUE, CHEQUE_DIFERIDO requieren cuenta bancaria
- ✅ El método EFECTIVO no requiere cuenta bancaria
- ✅ MontoNeto = MontoTotal - suma de retenciones

---

## 9. FRONTEND SERVICE LAYER

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

---

## 10. PRÓXIMOS PASOS

### 10.1 Implementación Pendiente

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

---

## 11. SOPORTE Y MANTENIMIENTO

### 11.1 Logs y Debugging

- Todos los controllers incluyen console.error para debugging
- Los errores se devuelven con mensajes descriptivos
- El servidor incluye logging de requests

### 11.2 Performance

- Paginación implementada en todas las listas
- Índices en campos de búsqueda frecuente
- Soft delete para mantener histórico sin impactar queries

### 11.3 Seguridad

- Validación de tenant en todas las operaciones
- Validaciones de estado antes de transiciones
- Validaciones de existencia de registros relacionados
- No se pueden eliminar registros con dependencias

---

## 12. REFERENCIAS

**Documentos relacionados:**
- [04-SCHEMA-DATABASE.md](./04-SCHEMA-DATABASE.md) - Schema completo de base de datos
- [05-API-ENDPOINTS.md](./05-API-ENDPOINTS.md) - Especificación completa de API
- [11-MODULO-FINANCIERO.md](./11-MODULO-FINANCIERO.md) - Módulo financiero y contable
- [14-GUIA-IMPLEMENTACION.md](./14-GUIA-IMPLEMENTACION.md) - Guía de implementación

---

## ANEXO A: DIAGRAMAS TÉCNICOS

### A.1 Diagrama de Entidad-Relación (ER)

```
┌─────────────────┐
│     Tenant      │
└────────┬────────┘
         │
         │ 1:N
         │
    ┌────┴────┬──────────┬────────────┬──────────────┐
    │         │          │            │              │
    │         │          │            │              │
┌───▼────┐  ┌─▼──────┐ ┌▼────────┐  ┌▼─────────┐  ┌▼────────────┐
│Proveedor│ │Producto│ │PlanCuentas│ │OrdenCompra│ │CuentaBancaria│
└───┬────┘  └───┬────┘ └────┬─────┘  └────┬──────┘ └────┬────────┘
    │           │            │             │             │
    │           │            │             │             │ 1:N
    │           │            │             │ 1:N         │
    │           │            │             │         ┌───▼───────┐
    │           │            │         ┌───▼─────┐   │ Chequera  │
    │           │            │         │ItemOC   │   └───────────┘
    │           │            │         │(1:N)    │
    │           └────────────┼─────────┴─────────┘
    │                        │             │
    │ N:1                    │ 0:1         │ 0:1
    │                        │             │
┌───▼──────────┐            │         ┌───▼──────────┐
│FacturaCompra │◄───────────┘         │              │
└───┬──────────┘                      │              │
    │                                 │              │
    │ 0:1                             │              │
    │                             ┌───▼──────────┐   │
    │                             │  OrdenPago   │   │
    └─────────────────────────────┤              │   │
                                  │              │◄──┘ 0:1
                                  └───┬──────────┘
                                      │
                              ┌───────┴────────┐
                              │                │
                          1:N │            1:N │
                              │                │
                    ┌─────────▼┐         ┌────▼──────────┐
                    │Retencion │         │MovimientoBanc.│
                    └──────────┘         └────┬──────────┘
                                              │ 0:1
                                              │
                                    ┌─────────▼────────┐
                                    │ExtractoBancario  │
                                    └──────────────────┘
```

### A.2 Diagrama de Estados: Orden de Compra

```
┌──────────┐
│ BORRADOR │  ← Estado inicial
└────┬─────┘
     │
     │ enviarAprobacion()
     │
┌────▼──────────────────┐
│ PENDIENTE_APROBACION  │
└────┬─────────┬────────┘
     │         │
     │         │ rechazar(motivo)
     │         │
     │     ┌───▼──────┐
     │     │RECHAZADA │
     │     └──────────┘
     │
     │ aprobar(aprobadoPor)
     │
┌────▼────┐
│APROBADA │ ─┐
└────┬────┘  │
     │       │ anular(motivo)
     │       │
     │   ┌───▼────┐
     │   │ANULADA │
     │   └────────┘
     │
     │ (puede crear FacturaCompra)
     │
     ▼
```

### A.3 Diagrama de Estados: Factura de Compra

```
┌───────────┐
│ PENDIENTE │  ← Estado inicial
└─────┬─────┘
      │
      ├─────────────────────┐
      │                     │
      │ marcarPago(monto)   │ anular(motivo)
      │                     │
      │  ┌──────────────┐   │   ┌────────┐
      ├─►│PAGADA_PARCIAL│   └──►│ANULADA │
      │  └──────┬───────┘       └────────┘
      │         │
      │         │ marcarPago(saldo restante)
      │         │
      │  ┌──────▼───────┐
      └─►│PAGADA_TOTAL  │
         └──────────────┘
```

### A.4 Diagrama de Estados: Orden de Pago

```
┌──────────┐
│ BORRADOR │  ← Estado inicial
└────┬─────┘
     │
     │ enviarAprobacion()
     │
┌────▼──────────────────┐
│ PENDIENTE_APROBACION  │
└────┬─────────┬────────┘
     │         │
     │         │ rechazar(motivo)
     │         │
     │     ┌───▼──────┐
     │     │RECHAZADA │
     │     └──────────┘
     │
     │ aprobar(aprobadoPor)
     │
┌────▼────┐
│APROBADA │
└────┬────┘
     │
     │ marcarComoPagada(datos)
     │ • Crea MovimientoBancario
     │ • Actualiza Saldo Banco
     │ • Actualiza Saldo Factura
     │
┌────▼────┐
│ PAGADA  │ ─── No se puede anular
└─────────┘
```

### A.5 Flujo de Proceso Completo

```
COMPRA CON ORDEN
════════════════

1. Crear Orden de Compra
   ┌─────────────────────────┐
   │ Items + Proveedor       │
   │ Estado: BORRADOR        │
   │ Numero: OC-2025-XXXX    │
   └────────┬────────────────┘
            │
            ▼
2. Flujo de Aprobación OC
   ┌─────────────────────────┐
   │ Enviar a Aprobación     │
   │ → Aprobador revisa      │
   │ → Aprueba o Rechaza     │
   └────────┬────────────────┘
            │ Estado: APROBADA
            ▼
3. Recibir Factura del Proveedor
   ┌─────────────────────────┐
   │ Cargar Factura          │
   │ • Número + Timbrado     │
   │ • Vincular a OC         │
   │ • IVA 10%, 5%, Exentas  │
   │ Estado: PENDIENTE       │
   └────────┬────────────────┘
            │
            ▼
4. Crear Orden de Pago
   ┌─────────────────────────┐
   │ Vincular a Factura      │
   │ • Método de Pago        │
   │ • Cuenta Bancaria       │
   │ • Retenciones IVA/IRE   │
   │ • Monto Neto            │
   │ Estado: BORRADOR        │
   │ Numero: OP-2025-XXXX    │
   └────────┬────────────────┘
            │
            ▼
5. Flujo de Aprobación OP
   ┌─────────────────────────┐
   │ Enviar a Aprobación     │
   │ → Aprobador revisa      │
   │ → Aprueba o Rechaza     │
   └────────┬────────────────┘
            │ Estado: APROBADA
            ▼
6. Ejecutar Pago
   ┌─────────────────────────┐
   │ Marcar como Pagada      │
   │ • Registra MovBancario  │
   │ • Actualiza Saldos      │
   │ • Genera Asiento        │
   │ Estado: PAGADA          │
   └─────────────────────────┘
```

### A.6 Diagrama de Secuencia: Pago Completo

```
Usuario  →  Frontend  →  Backend  →  Database  →  Sistema Contable
   │            │           │            │               │
   │ Crear OP   │           │            │               │
   ├───────────►│           │            │               │
   │            │ POST /op  │            │               │
   │            ├──────────►│            │               │
   │            │           │ INSERT OP  │               │
   │            │           ├───────────►│               │
   │            │           │◄───────────┤               │
   │            │◄──────────┤            │               │
   │◄───────────┤           │            │               │
   │            │           │            │               │
   │ Aprobar OP │           │            │               │
   ├───────────►│           │            │               │
   │            │ PATCH /op │            │               │
   │            ├──────────►│            │               │
   │            │           │ UPDATE OP  │               │
   │            │           ├───────────►│               │
   │            │           │◄───────────┤               │
   │            │◄──────────┤            │               │
   │◄───────────┤           │            │               │
   │            │           │            │               │
   │ Marcar Pagada          │            │               │
   ├───────────►│           │            │               │
   │            │ POST /pagar            │               │
   │            ├──────────►│            │               │
   │            │           │ BEGIN TX   │               │
   │            │           ├───────────►│               │
   │            │           │            │               │
   │            │           │ INSERT MovBancario         │
   │            │           ├───────────►│               │
   │            │           │            │               │
   │            │           │ UPDATE Banco.saldo         │
   │            │           ├───────────►│               │
   │            │           │            │               │
   │            │           │ UPDATE Factura.saldo       │
   │            │           ├───────────►│               │
   │            │           │            │               │
   │            │           │ INSERT Asiento             │
   │            │           ├───────────────────────────►│
   │            │           │            │               │
   │            │           │ COMMIT TX  │               │
   │            │           ├───────────►│               │
   │            │           │◄───────────┤               │
   │            │◄──────────┤            │               │
   │◄───────────┤           │            │               │
```

---

## ANEXO B: EJEMPLOS DE USO

Este anexo contiene ejemplos prácticos de uso de la API del módulo de pagos con curl y JavaScript/TypeScript.

### B.1 Configuración

```bash
# Variables de entorno
export API_URL="http://localhost:3001"
export TENANT_ID="your-tenant-uuid"
export AUTH_TOKEN="your-auth-token"
```

### B.2 Cuentas Bancarias

#### Crear Cuenta Bancaria

**curl:**
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

#### Listar Cuentas Bancarias

**curl:**
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

#### Crear Chequera

**curl:**
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

#### Consultar Movimientos

**curl:**
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

### B.3 Órdenes de Compra

#### Crear Orden de Compra

**curl:**
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

#### Flujo Completo de Aprobación de OC

**curl:**
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

#### Rechazar Orden de Compra

**curl:**
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

### B.4 Facturas de Compra

#### Crear Factura Normal (con OC)

**curl:**
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

#### Crear Factura sin OC (Anticipo)

**curl:**
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

#### Consultar Facturas Pendientes

**curl:**
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

### B.5 Órdenes de Pago

#### Crear Orden de Pago Completa

**curl:**
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

#### Flujo Completo de Pago

**curl:**
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

### B.6 Escenarios Completos

#### Escenario 1: Compra con Orden de Compra

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

#### Escenario 2: Pago de Anticipo

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

#### Escenario 3: Pago con Cheque

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
    numeroCheque: "1001",
    fechaPago: new Date().toISOString(),
    observaciones: "Cheque entregado a proveedor"
  });

  console.log(`✓ Pago con cheque ${opPagada.movimientos[0].numeroReferencia}`);
}
```

### B.7 Consultas y Reportes

#### Consultar Órdenes de Pago Pendientes de Aprobación

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

#### Consultar Saldo de Cuenta Bancaria

```typescript
const cuenta = await pagosService.cuentasBancarias.getById(cuentaId);
console.log(`${cuenta.banco} - ${cuenta.numeroCuenta}`);
console.log(`Saldo actual: Gs. ${cuenta.saldoActual.toLocaleString()}`);
console.log(`Moneda: ${cuenta.moneda}`);
```

#### Listar Movimientos del Mes

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

### B.8 Notas Importantes

1. **Headers Requeridos**: Todos los requests deben incluir `x-tenant-id`
2. **Fechas**: Usar formato ISO 8601 (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss.sssZ)
3. **Montos**: Siempre en números enteros (sin decimales para guaraníes)
4. **Estados**: Respetar los flujos de estado (ver ANEXO A)
5. **Validaciones**: El backend valida todos los cambios de estado y relaciones

### B.9 Códigos de Error Comunes

- `400`: Bad Request - Datos inválidos o estado incorrecto
- `404`: Not Found - Registro no encontrado
- `409`: Conflict - Registro duplicado o conflicto de estado
- `500`: Internal Server Error - Error del servidor

---

**Para preguntas o soporte adicional sobre este módulo, consultar la documentación del proyecto principal.**

---

**Documentación generada:** Diciembre 2025

**Versión del módulo:** 1.0.0

**Estado:** ✅ Backend API completo | 🔧 Frontend UI pendiente | 🔧 Migración pendiente
