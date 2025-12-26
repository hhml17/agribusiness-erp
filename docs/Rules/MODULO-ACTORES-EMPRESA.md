# MÓDULO DE ACTORES Y EMPRESA - DOCUMENTACIÓN TÉCNICA

## 1. VISIÓN GENERAL

Este documento describe la implementación de dos módulos críticos del sistema Agribusiness ERP:

1. **Módulo de Actores**: Gestión de personas físicas y jurídicas que pueden ser clientes, proveedores o asociados
2. **Módulo de Empresa**: Gestión de centros de costo, estancias y talonarios de facturación

---

## 2. MÓDULO DE ACTORES

### 2.1 Objetivo

Centralizar la gestión de todas las personas (físicas o jurídicas) que interactúan con la empresa, permitiendo que un mismo actor pueda tener múltiples roles simultáneamente.

### 2.2 Requerimientos Cumplidos

✅ Soporta **Persona Física** y **Persona Jurídica**
✅ Campos obligatorios: RUC (Tipo de Documento), Nro Documento, Nombre/Denominación Social, Nombre Fantasía
✅ Un actor puede ser marcado simultáneamente como **Proveedor**, **Cliente** o **Asociado**
✅ Configuración contable por **Moneda (USD/PYG)** para cada rol

### 2.3 Modelo de Datos

#### Actor (Tabla: `actores`)

```prisma
model Actor {
  id              String   @id @default(uuid())
  tenantId        String

  // Tipo de Persona
  tipoPersona     String   // FISICA, JURIDICA

  // Identificación (OBLIGATORIOS)
  tipoDocumento   String   // RUC, CI, PASAPORTE, OTRO
  numeroDocumento String   // Número del documento
  dv              String?  // Dígito verificador (para RUC)
  nombre          String   // Nombre completo o Denominación social
  nombreFantasia  String   // Nombre comercial

  // Datos persona física
  apellido        String?
  fechaNacimiento DateTime?
  estadoCivil     String?  // SOLTERO, CASADO, DIVORCIADO, VIUDO

  // Datos persona jurídica
  razonSocial        String?
  fechaConstitucion  DateTime?
  representanteLegal String?

  // Contacto
  email        String?
  telefono     String?
  celular      String?
  direccion    String?
  ciudad       String?
  departamento String?
  pais         String   @default("PY")

  // Roles (múltiples simultáneos)
  esCliente   Boolean @default(false)
  esProveedor Boolean @default(false)
  esAsociado  Boolean @default(false)

  // Estado
  activo      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  cuentasContablesPorRol ActorCuentaContable[]

  @@unique([tenantId, numeroDocumento])
  @@index([tenantId, tipoPersona])
  @@index([tenantId, esCliente])
  @@index([tenantId, esProveedor])
  @@index([tenantId, esAsociado])
}
```

#### ActorCuentaContable (Tabla: `actor_cuentas_contables`)

Permite configurar una cuenta contable diferente para cada rol y moneda.

```prisma
model ActorCuentaContable {
  id               String @id @default(uuid())
  tenantId         String
  actorId          String

  // Rol al que aplica
  rol              String  // CLIENTE, PROVEEDOR, ASOCIADO

  // Moneda
  moneda           String  // USD, PYG

  // Cuenta contable asociada
  cuentaContableId String
  cuentaContable   PlanCuentas @relation(...)

  descripcion      String?
  activo           Boolean  @default(true)

  @@unique([actorId, rol, moneda])
}
```

**Ejemplo de configuración:**

Un mismo actor puede tener:
- Como **Cliente**: Cuenta 1102-001-001 (Cuentas por Cobrar USD) y 1102-001-002 (Cuentas por Cobrar PYG)
- Como **Proveedor**: Cuenta 2101-001-001 (Cuentas por Pagar USD) y 2101-001-002 (Cuentas por Pagar PYG)
- Como **Asociado**: Cuenta 2301-001-001 (Capital Asociado USD)

---

## 3. MÓDULO DE EMPRESA

### 3.1 Objetivo

Mejorar la gestión de centros de costo y agregar funcionalidad de talonarios de facturación.

### 3.2 Requerimientos Cumplidos

✅ **Centros de Costo**: CRUD para estancias con nombres como "Fondo Cría - Estancia Don Federico"
✅ **Talonarios**: Gestión de Facturas y Notas de Crédito con Timbrado, Establecimiento y Punto de Venta

### 3.3 Modelo de Datos

#### EstanciaMejorada (Tabla: `estancias_mejoradas`)

```prisma
model EstanciaMejorada {
  id            String  @id @default(uuid())
  tenantId      String
  centroCostoId String

  // Identificación
  codigo        String  // Código único
  nombre        String  // "Fondo Cría - Estancia Don Federico"
  descripcion   String?

  // Ubicación
  direccion     String?
  ciudad        String?
  departamento  String?
  pais          String  @default("PY")

  // Datos técnicos
  superficie     Float?  // Hectáreas
  superficieUtil Float?  // Hectáreas útiles
  capacidadUA    Float?  // Unidades Animales
  tipoPropiedad  String  // PROPIA, ALQUILADA, COMPARTIDA

  // Datos de alquiler (si aplica)
  costoAlquiler    Float?
  monedaAlquiler   String?  // USD, PYG
  fechaVencimiento DateTime?

  // Responsable
  responsable String?
  telefono    String?
  email       String?

  activo      Boolean  @default(true)

  @@unique([tenantId, codigo])
}
```

#### Talonario (Tabla: `talonarios`)

Gestión de timbrados de la SET (Paraguay) para facturación.

```prisma
model Talonario {
  id          String @id @default(uuid())
  tenantId    String

  // Tipo de comprobante
  tipoComprobante String  // FACTURA, NOTA_CREDITO, NOTA_DEBITO, AUTOFACTURA

  // Datos del timbrado (SET Paraguay)
  numeroTimbrado     String
  fechaVigenciaDesde DateTime
  fechaVigenciaHasta DateTime

  // Datos del establecimiento
  establecimiento String  // "001"
  puntoVenta      String  // "001"

  // Rango de numeración
  numeroInicial   Int
  numeroFinal     Int
  siguienteNumero Int     // Próximo número a usar

  // Estado
  activo    Boolean @default(true)
  agotado   Boolean @default(false)  // Se marca cuando siguienteNumero > numeroFinal

  @@unique([tenantId, numeroTimbrado, establecimiento, puntoVenta])
}
```

#### FacturaEmitida (Tabla: `facturas_emitidas`)

Facturas y notas de crédito emitidas por la empresa.

```prisma
model FacturaEmitida {
  id              String @id @default(uuid())
  tenantId        String
  talonarioId     String

  // Número de factura (formato: 001-001-0001234)
  establecimiento String
  puntoVenta      String
  numeroFactura   Int
  numeroCompleto  String  // "001-001-0001234"

  // Tipo
  tipoComprobante String  // FACTURA, NOTA_CREDITO, NOTA_DEBITO

  // Cliente
  actorId          String?
  nombreCliente    String
  rucCliente       String?
  direccionCliente String?

  // Fechas
  fecha            DateTime
  fechaVencimiento DateTime?

  // Condición de venta
  condicionVenta String  // CONTADO, CREDITO

  // Importes
  subtotal Float
  iva10    Float @default(0)
  iva5     Float @default(0)
  exentas  Float @default(0)
  total    Float

  // Moneda
  moneda String @default("PYG")  // PYG, USD

  // Estado
  estado          String  // EMITIDA, ANULADA, NOTA_CREDITO_APLICADA
  fechaAnulacion  DateTime?
  motivoAnulacion String?

  @@unique([tenantId, numeroCompleto])
}
```

---

## 4. CASOS DE USO

### 4.1 Crear Actor (Persona Física - Cliente)

```typescript
const actor = await prisma.actor.create({
  data: {
    tenantId: "tenant-id",
    tipoPersona: "FISICA",
    tipoDocumento: "CI",
    numeroDocumento: "1234567",
    nombre: "Juan",
    apellido: "Pérez",
    nombreFantasia: "Juan Pérez",
    esCliente: true,
    email: "juan@example.com",
    telefono: "0981123456"
  }
});
```

### 4.2 Crear Actor (Persona Jurídica - Proveedor y Cliente)

```typescript
const actor = await prisma.actor.create({
  data: {
    tenantId: "tenant-id",
    tipoPersona: "JURIDICA",
    tipoDocumento: "RUC",
    numeroDocumento: "80012345",
    dv: "6",
    nombre: "Empresa ABC S.A.",
    nombreFantasia: "ABC",
    razonSocial: "Empresa ABC Sociedad Anónima",
    esCliente: true,
    esProveedor: true,
    representanteLegal: "María González",
    email: "contacto@abc.com.py"
  }
});
```

### 4.3 Configurar Cuentas Contables para un Actor

```typescript
// Configurar cuenta para rol de cliente en USD
await prisma.actorCuentaContable.create({
  data: {
    tenantId: "tenant-id",
    actorId: "actor-id",
    rol: "CLIENTE",
    moneda: "USD",
    cuentaContableId: "cuenta-cxc-usd-id",
    descripcion: "Cuentas por Cobrar - USD"
  }
});

// Configurar cuenta para rol de cliente en PYG
await prisma.actorCuentaContable.create({
  data: {
    tenantId: "tenant-id",
    actorId: "actor-id",
    rol: "CLIENTE",
    moneda: "PYG",
    cuentaContableId: "cuenta-cxc-pyg-id",
    descripcion: "Cuentas por Cobrar - PYG"
  }
});

// Configurar cuenta para rol de proveedor en USD
await prisma.actorCuentaContable.create({
  data: {
    tenantId: "tenant-id",
    actorId: "actor-id",
    rol: "PROVEEDOR",
    moneda: "USD",
    cuentaContableId: "cuenta-cxp-usd-id",
    descripcion: "Cuentas por Pagar - USD"
  }
});
```

### 4.4 Crear Talonario de Facturas

```typescript
const talonario = await prisma.talonario.create({
  data: {
    tenantId: "tenant-id",
    tipoComprobante: "FACTURA",
    numeroTimbrado: "12345678",
    fechaVigenciaDesde: new Date("2025-01-01"),
    fechaVigenciaHasta: new Date("2025-12-31"),
    establecimiento: "001",
    puntoVenta: "001",
    numeroInicial: 1,
    numeroFinal: 10000,
    siguienteNumero: 1,
    descripcion: "Talonario principal de facturas"
  }
});
```

### 4.5 Emitir Factura

```typescript
// Obtener siguiente número del talonario
const talonario = await prisma.talonario.findUnique({
  where: { id: "talonario-id" }
});

const numeroFactura = talonario.siguienteNumero;
const numeroCompleto = `${talonario.establecimiento}-${talonario.puntoVenta}-${String(numeroFactura).padStart(7, '0')}`;

// Crear factura
const factura = await prisma.facturaEmitida.create({
  data: {
    tenantId: "tenant-id",
    talonarioId: "talonario-id",
    establecimiento: talonario.establecimiento,
    puntoVenta: talonario.puntoVenta,
    numeroFactura: numeroFactura,
    numeroCompleto: numeroCompleto,
    tipoComprobante: "FACTURA",
    actorId: "actor-cliente-id",
    nombreCliente: "Juan Pérez",
    rucCliente: "1234567-8",
    fecha: new Date(),
    condicionVenta: "CONTADO",
    subtotal: 1000000,
    iva10: 100000,
    total: 1100000,
    moneda: "PYG",
    estado: "EMITIDA"
  }
});

// Actualizar siguiente número del talonario
await prisma.talonario.update({
  where: { id: "talonario-id" },
  data: {
    siguienteNumero: numeroFactura + 1,
    agotado: numeroFactura + 1 > talonario.numeroFinal
  }
});
```

### 4.6 Crear Estancia Mejorada

```typescript
const estancia = await prisma.estanciaMejorada.create({
  data: {
    tenantId: "tenant-id",
    centroCostoId: "centro-costo-id",
    codigo: "EST-001",
    nombre: "Fondo Cría - Estancia Don Federico",
    descripcion: "Estancia dedicada a la cría de ganado bovino",
    ciudad: "San Pedro",
    departamento: "San Pedro",
    superficie: 1500,
    superficieUtil: 1200,
    capacidadUA: 800,
    tipoPropiedad: "PROPIA",
    responsable: "Pedro González",
    telefono: "0971123456"
  }
});
```

---

## 5. ENDPOINTS API

### 5.1 Actores

```
GET    /api/:tenantId/actores              # Listar actores
GET    /api/:tenantId/actores/:id          # Obtener actor
POST   /api/:tenantId/actores              # Crear actor
PUT    /api/:tenantId/actores/:id          # Actualizar actor
DELETE /api/:tenantId/actores/:id          # Eliminar actor

# Filtros disponibles
GET /api/:tenantId/actores?tipoPersona=FISICA
GET /api/:tenantId/actores?esCliente=true
GET /api/:tenantId/actores?esProveedor=true
GET /api/:tenantId/actores?esAsociado=true

# Cuentas contables del actor
GET    /api/:tenantId/actores/:id/cuentas  # Listar cuentas
POST   /api/:tenantId/actores/:id/cuentas  # Agregar cuenta
DELETE /api/:tenantId/actores/:id/cuentas/:cuentaId  # Eliminar cuenta
```

### 5.2 Estancias

```
GET    /api/:tenantId/estancias            # Listar estancias
GET    /api/:tenantId/estancias/:id        # Obtener estancia
POST   /api/:tenantId/estancias            # Crear estancia
PUT    /api/:tenantId/estancias/:id        # Actualizar estancia
DELETE /api/:tenantId/estancias/:id        # Eliminar estancia
```

### 5.3 Talonarios

```
GET    /api/:tenantId/talonarios           # Listar talonarios
GET    /api/:tenantId/talonarios/:id       # Obtener talonario
POST   /api/:tenantId/talonarios           # Crear talonario
PUT    /api/:tenantId/talonarios/:id       # Actualizar talonario
DELETE /api/:tenantId/talonarios/:id       # Eliminar talonario
```

### 5.4 Facturas Emitidas

```
GET    /api/:tenantId/facturas-emitidas    # Listar facturas
GET    /api/:tenantId/facturas-emitidas/:id # Obtener factura
POST   /api/:tenantId/facturas-emitidas    # Emitir factura
PUT    /api/:tenantId/facturas-emitidas/:id/anular  # Anular factura
```

---

## 6. VALIDACIONES

### 6.1 Actor

```typescript
const crearActorSchema = z.object({
  tipoPersona: z.enum(['FISICA', 'JURIDICA']),
  tipoDocumento: z.enum(['RUC', 'CI', 'PASAPORTE', 'OTRO']),
  numeroDocumento: z.string().min(1),
  nombre: z.string().min(1),
  nombreFantasia: z.string().min(1),

  // Condicional: si es persona física
  apellido: z.string().optional(),
  fechaNacimiento: z.date().optional(),
  estadoCivil: z.enum(['SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO']).optional(),

  // Condicional: si es persona jurídica
  razonSocial: z.string().optional(),
  fechaConstitucion: z.date().optional(),
  representanteLegal: z.string().optional(),

  esCliente: z.boolean().default(false),
  esProveedor: z.boolean().default(false),
  esAsociado: z.boolean().default(false)
});
```

### 6.2 Talonario

```typescript
const crearTalonarioSchema = z.object({
  tipoComprobante: z.enum(['FACTURA', 'NOTA_CREDITO', 'NOTA_DEBITO', 'AUTOFACTURA']),
  numeroTimbrado: z.string().length(8),
  fechaVigenciaDesde: z.date(),
  fechaVigenciaHasta: z.date(),
  establecimiento: z.string().length(3),
  puntoVenta: z.string().length(3),
  numeroInicial: z.number().int().min(1),
  numeroFinal: z.number().int().min(1)
}).refine(data => data.fechaVigenciaHasta > data.fechaVigenciaDesde, {
  message: "Fecha de vigencia hasta debe ser posterior a la fecha desde"
}).refine(data => data.numeroFinal >= data.numeroInicial, {
  message: "Número final debe ser mayor o igual al número inicial"
});
```

---

## 7. ÍNDICES Y PERFORMANCE

### 7.1 Índices Críticos

```sql
-- Actor
CREATE INDEX idx_actor_tenant_tipo ON actores(tenantId, tipoPersona);
CREATE INDEX idx_actor_tenant_cliente ON actores(tenantId, esCliente);
CREATE INDEX idx_actor_tenant_proveedor ON actores(tenantId, esProveedor);

-- Talonario
CREATE INDEX idx_talonario_tenant_tipo ON talonarios(tenantId, tipoComprobante);
CREATE INDEX idx_talonario_tenant_activo ON talonarios(tenantId, activo);

-- Factura Emitida
CREATE INDEX idx_factura_tenant_estado ON facturas_emitidas(tenantId, estado);
CREATE INDEX idx_factura_talonario ON facturas_emitidas(talonarioId);
```

---

## 8. PRÓXIMOS PASOS

1. ✅ Modelos de datos creados en Prisma
2. ⏳ Crear migración de base de datos
3. ⏳ Implementar endpoints API
4. ⏳ Crear componentes React para UI
5. ⏳ Tests unitarios y de integración

---

**Actualizado:** Diciembre 26, 2025
**Autor:** Hans
**Estado:** En desarrollo
