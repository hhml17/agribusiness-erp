# Changelog - Módulo de Pagos

Todos los cambios notables en el módulo de pagos serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [1.0.0] - 2025-01-18

### Añadido ✨

#### Backend API
- **Prisma Schema**: 11 nuevos modelos para el sistema de pagos
  - `CuentaBancaria`: Gestión de cuentas bancarias multi-moneda
  - `Chequera`: Manejo de chequeras con rangos de números
  - `Cheque`: Registro individual de cheques
  - `OrdenCompra`: Órdenes de compra con flujo de aprobación
  - `ItemOrdenCompra`: Líneas de items de órdenes de compra
  - `FacturaCompra`: Facturas de proveedores con tipos múltiples
  - `OrdenPago`: Órdenes de pago con retenciones
  - `Retencion`: Retenciones fiscales (IVA, IRE, IRP)
  - `MovimientoBancario`: Movimientos bancarios para conciliación
  - `ExtractoBancario`: Extractos bancarios por período
  - `LineaExtractoBancario`: Líneas de extracto bancario

- **Controllers Completos** (4):
  - `cuentaBancaria.controller.ts`: CRUD + chequeras + movimientos
  - `ordenCompra.controller.ts`: CRUD + workflow de aprobación
  - `facturaCompra.controller.ts`: CRUD + tracking de pagos
  - `ordenPago.controller.ts`: CRUD + workflow + retenciones + movimientos bancarios

- **Routes** (4):
  - `/api/cuentas-bancarias`: Gestión de cuentas bancarias
  - `/api/ordenes-compra`: Gestión de órdenes de compra
  - `/api/facturas-compra`: Gestión de facturas de compra
  - `/api/ordenes-pago`: Gestión de órdenes de pago

#### Frontend
- **TypeScript Service Layer**: `pagos.service.ts` con todos los métodos de API
- **Type Definitions**: Interfaces TypeScript completas para todas las entidades
- **API Client Integration**: Configurado con apiClient existente

#### Funcionalidades
- ✅ **Multi-tenant**: Aislamiento completo de datos por tenant
- ✅ **Soft Delete**: Patrón de borrado lógico en todos los modelos
- ✅ **Auto-numbering**: Numeración automática para OC y OP (formato: OC-YYYY-NNNN)
- ✅ **Workflows de Aprobación**:
  - BORRADOR → PENDIENTE_APROBACION → APROBADA/RECHAZADA
  - Tracking de solicitante y aprobador
  - Motivos de rechazo
- ✅ **Tipos de Factura**: NORMAL, ANTICIPO, GASTO_NO_DEDUCIBLE, CAJA_CHICA
- ✅ **Métodos de Pago**: EFECTIVO, TRANSFERENCIA, CHEQUE, CHEQUE_DIFERIDO
- ✅ **Retenciones Fiscales**: IVA, IRE, IRP con comprobantes
- ✅ **Gestión Bancaria**:
  - Multi-moneda (PYG, USD)
  - Chequeras con control de rangos
  - Movimientos con tipos (CHEQUE, TRANSFERENCIA, EFECTIVO, DEPOSITO)
  - Estados de conciliación (PENDIENTE, CONCILIADO, REVERSADO)
- ✅ **Integración Contable**:
  - Cuentas bancarias vinculadas a plan de cuentas
  - Órdenes de pago vinculadas a asientos contables

#### Validaciones de Negocio
- ✅ No se pueden editar documentos fuera de estado BORRADOR
- ✅ No se pueden aprobar documentos que no están en PENDIENTE_APROBACION
- ✅ No se pueden crear facturas para OC no aprobadas
- ✅ Métodos de pago con cuenta bancaria requieren cuenta válida
- ✅ Cálculo automático de monto neto después de retenciones
- ✅ Actualización automática de saldos bancarios al pagar
- ✅ Actualización automática de saldo pendiente en facturas

#### Documentación
- 📄 `docs/MODULO-PAGOS.md`: Documentación completa del módulo
- 📊 `docs/DIAGRAMAS-MODULO-PAGOS.md`: Diagramas ER, flujos y arquitectura
- 💡 `docs/EJEMPLOS-API-PAGOS.md`: Ejemplos prácticos de uso con curl y TypeScript
- 📝 `CHANGELOG-PAGOS.md`: Este archivo de cambios

### Cambiado 🔄

- **server.ts**: Añadidos imports y routes para módulo de pagos
- **Prisma Schema**: Añadidas relaciones desde Tenant, Proveedor, Producto

### Técnico 🔧

- **Base de Datos**: Azure SQL Server con Prisma ORM
- **Framework**: Express.js + TypeScript
- **Validaciones**: Joi/Zod (pendiente implementación)
- **Testing**: Pendiente implementación
- **Autenticación**: Integrado con sistema existente (x-tenant-id header)

### Pendiente 🔧

#### Próxima Versión (v1.1.0)
- [ ] Migración de base de datos (Prisma migrate)
- [ ] Seed de datos iniciales
- [ ] Frontend UI Components:
  - [ ] Dashboard de pagos
  - [ ] Formulario de Orden de Compra
  - [ ] Formulario de Factura de Compra
  - [ ] Formulario de Orden de Pago
  - [ ] Lista de Cuentas Bancarias
  - [ ] Vista de Movimientos Bancarios
- [ ] Reportes:
  - [ ] Pagos por proveedor
  - [ ] Retenciones generadas
  - [ ] Flujo de caja
  - [ ] Antigüedad de saldos

#### Futuras Versiones
- [ ] Generación automática de asientos contables
- [ ] Conciliación bancaria automatizada
- [ ] Carga masiva de facturas (Excel/CSV)
- [ ] Generación de comprobantes de retención (PDF)
- [ ] Notificaciones de aprobaciones pendientes
- [ ] Dashboard de tesorería en tiempo real
- [ ] Proyección de flujo de caja
- [ ] Multi-moneda con tipos de cambio
- [ ] Integración con homebanking
- [ ] API para extractos bancarios automáticos

### Seguridad 🔒

- Validación de tenant en todas las operaciones
- Soft delete para mantener auditoría
- Validaciones de estado en workflows
- Validaciones de relaciones entre entidades
- No se permiten eliminaciones con dependencias

### Performance ⚡

- Paginación en todas las listas (default: 50 items)
- Índices en campos de búsqueda frecuente:
  - `tenantId, estado` en órdenes
  - `tenantId, numero` para búsqueda rápida
  - `proveedorId` para filtros
  - `cuentaBancariaId` en movimientos
- Soft delete para evitar cascadas costosas

### Breaking Changes 💥

Ninguno - Primera versión del módulo.

## Instalación

### Backend

```bash
# Instalar dependencias
cd api
npm install

# Generar Prisma Client
npx prisma generate

# Ejecutar migración (pendiente)
# npx prisma migrate dev --name add_payment_module

# Iniciar servidor
npm run dev
```

### Frontend

```bash
# Instalar dependencias
cd app
npm install

# Iniciar desarrollo
npm run dev
```

## Testing

```bash
# Pendiente implementación
npm test
```

## Deployment

El módulo está listo para deployment una vez que se ejecute la migración de base de datos.

### Requisitos
- Node.js >= 18
- Azure SQL Database
- Variables de entorno configuradas

## Contribuidores

- **Backend API**: Claude Sonnet 4.5 + Hans Harder
- **Diseño de Schema**: Claude Sonnet 4.5
- **Documentación**: Claude Sonnet 4.5

## Licencia

Propietario - Todos los derechos reservados

---

**Fecha de release**: 2025-01-18
**Versión**: 1.0.0
**Estado**: ✅ Backend completo | 🔧 Frontend pendiente | 🔧 Migración pendiente
