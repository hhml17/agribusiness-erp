# 04 - SCHEMA COMPLETO DE BASE DE DATOS (Prisma)

## 1. CONFIGURACIÓN INICIAL

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "windows", "linux"]
}

datasource db {
  provider = "sqlserver"
  url      = env("DATABASE_URL")
}
```

---

## 2. TABLAS GLOBALES (No Multi-Tenant)

```prisma
// ============= PERMISO =============
// Tabla global de permisos disponibles en el sistema
model Permiso {
  id          String    @id @default(uuid())
  codigo      String    @unique // "bovino:view", "asiento:create"
  nombre      String
  descripcion String?
  modulo      String    // "bovino", "operacion", "financiero", etc
  accion      String    // "view", "create", "edit", "delete", "report"
  
  roles       Rol[]     @relation("RolPermiso")
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([modulo])
}

// ============= PLAN DE CUENTAS GLOBAL =============
// Cuentas contables predefinidas (pueden ser personalizadas por tenant)
model PlanCuentasTemplate {
  id                String    @id @default(uuid())
  codigo            String    @unique // "1101" (Activo Circulante)
  nombre            String    // "Caja - Moneda Local"
  descripcion       String?
  tipo              String    // "Activo", "Pasivo", "Patrimonio", "Ingreso", "Egreso"
  subTipo           String?   // "Circulante", "NoCirculante", etc
  esMovible         Boolean   @default(true) // Si se puede usar en asientos
  esReserved        Boolean   @default(false) // Si es una cuenta especial del sistema
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@unique([codigo])
  @@index([tipo, subTipo])
}
```

---

## 3. TABLAS MULTI-TENANT

```prisma
// ============= TENANT =============
// Representa una organización (empresa ganadera) usando el sistema
model Tenant {
  id                    String    @id @default(uuid())
  
  // Información básica
  nombre                String
  razonSocial           String?
  ruc                   String    @unique
  dv                    String?   // Dígito verificador
  paisDefault           String    @default("PY")
  
  // Configuración
  monedaPrincipal       String    @default("PYG") // PYG, USD
  activo                Boolean   @default(true)
  estado                String    @default("activo") // activo, suspendido, cancelado
  
  // Contacto
  email                 String?
  telefono              String?
  direccion             String?
  ciudad                String?
  
  // Datos para reportes
  logoUrl               String?
  sistemaDesde          DateTime? // Fecha de inicio en el sistema
  ultimoMovimiento      DateTime?
  
  // Relaciones
  usuarios              Usuario[]
  roles                 Rol[]
  bovinosData           Bovino[]
  operaciones           Operacion[]
  operacionBovinoRel    OperacionBovino[]
  asentosContables      AsientoContable[]
  detalleAsientos       DetalleAsiento[]
  cuentasContables      CuentaContable[]
  centrosCosto          CentroCosto[]
  estancias             Estancia[]
  clientesProveedores   ClienteProveedor[]
  bancos                Banco[]
  cotizacionesMoneda    CotizacionMoneda[]
  auditLogs             AuditLog[]
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  deletedAt             DateTime? // Soft delete
  
  @@unique([ruc])
  @@index([activo])
  @@index([estado])
}

// ============= USUARIO =============
model Usuario {
  id                String    @id @default(uuid())
  tenantId          String    @db.Uuid
  tenant            Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  // Datos de Azure AD
  azureAdId         String    @unique // Object ID del usuario en Azure AD
  email             String
  nombre            String
  apellido          String?
  
  // Información del usuario
  activo            Boolean   @default(true)
  ultimoLogin       DateTime?
  loginCount        Int       @default(0)
  
  // Relaciones
  roles             Rol[]     @relation("UsuarioRol")
  asentosCreados    AsientoContable[] @relation("UsuarioCreador")
  operacionesCreadas Operacion[] @relation("UsuarioCreador")
  auditLogs         AuditLog[]
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@unique([tenantId, email])
  @@index([tenantId])
  @@index([activo])
  @@index([azureAdId])
}

// ============= ROL =============
// Roles específicos de cada tenant
model Rol {
  id          String    @id @default(uuid())
  tenantId    String    @db.Uuid
  tenant      Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  nombre      String    // "Tenant Admin", "Gerente", etc
  descripcion String?
  
  // Permisos asociados
  permisos    Permiso[] @relation("RolPermiso")
  usuarios    Usuario[] @relation("UsuarioRol")
  
  activo      Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@unique([tenantId, nombre])
  @@index([tenantId])
}

// ============= CENTRO DE COSTO =============
// Agrupaciones para costeo y análisis
model CentroCosto {
  id            String    @id @default(uuid())
  tenantId      String    @db.Uuid
  tenant        Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  codigo        String    // "CE", "PR", "LP", etc
  nombre        String    // "Fondo Cría - Estancia Cerrito"
  descripcion   String?
  tipoEstancia  String    // "propia", "alquilada", "compartida"
  
  // Relaciones
  estancias     Estancia[]
  bovinosData   Bovino[]
  operaciones   Operacion[]
  
  activo        Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@unique([tenantId, codigo])
  @@index([tenantId])
}

// ============= ESTANCIA =============
// Propiedades/lugares donde está el ganado
model Estancia {
  id              String    @id @default(uuid())
  tenantId        String    @db.Uuid
  tenant          Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  centroId        String    @db.Uuid
  centro          CentroCosto @relation(fields: [centroId], references: [id])
  
  nombre          String    // "La Petrona", "Procampo Ranch"
  ubicacion       String?
  superficie      Decimal?  @db.Decimal(10, 2) // Hectáreas
  telefono        String?
  responsable     String?
  
  // Relaciones
  bovinosData     Bovino[]
  potreros        Potrero[]
  
  activo          Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([tenantId])
  @@index([centroId])
}

// ============= POTRERO =============
// Subdivisiones dentro de estancias para rotación
model Potrero {
  id            String    @id @default(uuid())
  tenantId      String    @db.Uuid
  tenant        Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  estanciaId    String    @db.Uuid
  estancia      Estancia  @relation(fields: [estanciaId], references: [id])
  
  nombre        String    // "Potrero 1", "Comedero"
  superficie    Decimal?  @db.Decimal(10, 2)
  tipoForraje   String?   // "Pastura", "Campo natural", "Maíz"
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([tenantId])
  @@index([estanciaId])
}

// ============= BOVINO (GANADO) =============
// Individuos o grupos de ganado
model Bovino {
  id                    String    @id @default(uuid())
  tenantId              String    @db.Uuid
  tenant                Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  // Identificación
  numeroCaravana        String    // Número único de identificación
  nombreAlternativo     String?   // Apodo o nombre común
  
  // Datos físicos
  raza                  String?   // "Angus", "Brahman", "Nelore"
  tipoAnimal            String    // "Toro", "Vaca", "Ternero", "Vaquillona", "Equino", etc
  sexo                  String    // "M", "F"
  colorPelaje           String?   // "Negro", "Colorado", "Moro"
  senasPeculiares       String?   // Marcas, cicatrices, etc
  
  // Datos de edad/reproducción
  fechaNacimiento       DateTime?
  edadMeses             Int?
  madre                 Bovino?   @relation("HijoDeMadre", fields: [madreId], references: [id])
  madreId               String?   @db.Uuid
  padre                 Bovino?   @relation("HijoDePadre", fields: [padreId], references: [id])
  padreId               String?   @db.Uuid
  hijos                 Bovino[]  @relation("HijoDeMadre")
  hijosDe               Bovino[]  @relation("HijoDePadre")
  
  // Datos reproductivos
  esReproductor         Boolean   @default(false)
  partosPrevios         Int       @default(0)
  ultimoPartoPrevisto   DateTime?
  estadoReproductivo    String?   // "Servida", "Confirmada", "En amamantamiento"
  
  // Datos de peso
  peso                  Decimal?  @db.Decimal(8, 2) // kg
  fechaPesada           DateTime?
  pesoEstimado          Decimal?  @db.Decimal(8, 2)
  dse                   Decimal?  @db.Decimal(6, 2) // Unidades forrajeras
  adgEstimado           Decimal?  @db.Decimal(5, 2) // kg/día
  
  // Ubicación actual
  centroId              String    @db.Uuid
  centro                CentroCosto @relation(fields: [centroId], references: [id])
  estanciaId            String?   @db.Uuid
  potreroCurrent        String?   // Potrero actual
  
  // Valor comercial
  valor                 Decimal?  @db.Decimal(12, 2)
  monedaValor           String    @default("PYG")
  
  // Estado
  estadoActual          String    @default("Vivo") // "Vivo", "Vendido", "Muerto", "Escapado"
  fechaEstado           DateTime? // Cuándo cambió de estado
  motivoMuerte          String?   // Si estado es "Muerto"
  
  // Datos de compra (si fue importado)
  fechaCompra           DateTime?
  precioCompra          Decimal?  @db.Decimal(12, 2)
  proveedorCompra       String?
  
  // Fotos/documentos
  fotoUrl               String?
  documentoSENACSA      String?   // Número de documento
  
  // Operaciones vinculadas
  operacionesRelacion   OperacionBovino[]
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  
  @@unique([tenantId, numeroCaravana])
  @@index([tenantId])
  @@index([tenantId, estadoActual])
  @@index([tenantId, centroId])
  @@index([tenantId, tipoAnimal])
  @@index([tenantId, esReproductor])
}

// ============= OPERACIÓN =============
// Movimientos de ganado y operaciones comerciales
model Operacion {
  id                      String    @id @default(uuid())
  tenantId                String    @db.Uuid
  tenant                  Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  // Identificación
  numero                  Int       // Secuencial por tenant y tipo
  tipoOperacion           String    // "Compra", "Venta", "Faena", "Nacimiento", "Muerte", "Movimiento", "Consumo"
  subtipo                 String?   // "VentaDirecta", "SacaFaena", etc
  
  // Fechas
  fecha                   DateTime
  fechaConfirmacion       DateTime?
  
  // Descripción
  descripcion             String?
  referencia              String?   // "Referencia interna"
  
  // Datos comerciales
  contraparte             String    // Nombre del cliente/proveedor
  contraparteId           String?   @db.Uuid
  clienteProveedor        ClienteProveedor? @relation(fields: [contraparteId], references: [id])
  
  // Valores
  cantidad                Int       // Cantidad de animales
  precioUnitarioPYG       Decimal?  @db.Decimal(12, 2)
  precioUnitarioUSD       Decimal?  @db.Decimal(12, 2)
  totalPYG                Decimal   @db.Decimal(14, 2)
  totalUSD                Decimal   @db.Decimal(14, 2)
  cotizacionUsada         Decimal   @db.Decimal(8, 2) // Tasa de cambio usada
  
  // Ubicaciones
  centroDesde             String?   @db.Uuid // Para movimientos internos
  centroHasta             String?   @db.Uuid // Para movimientos internos
  
  // Documentación
  numeroComprobante       String?   // Factura, recibo, etc
  tipoComprobante         String?   // "Factura", "Recibo", "Nota de Crédito"
  
  // SENACSA
  requierePermiso         Boolean   @default(false)
  numeroPermisoSENACSA    String?   // Número de permiso de tránsito
  transportista           String?   // Empresa transportista
  patente                 String?   // Patente del vehículo
  
  // Estado
  estado                  String    @default("Pendiente") // "Pendiente", "Confirmada", "Procesada", "Cancelada"
  asentosCreados          Boolean   @default(false) // Si ya creó asientos contables
  
  // Análisis
  margenGanancia          Decimal?  @db.Decimal(8, 2)
  costoFlete              Decimal?  @db.Decimal(12, 2)
  costoComision           Decimal?  @db.Decimal(12, 2)
  
  // Relaciones
  bovinosRelacion         OperacionBovino[]
  asentosVinculados       AsientoContable[] @relation("OperacionAsiento")
  creador                 Usuario   @relation("UsuarioCreador", fields: [creadoPorId], references: [id])
  creadoPorId             String    @db.Uuid
  
  createdAt               DateTime  @default(now())
  updatedAt               DateTime  @updatedAt
  
  @@index([tenantId])
  @@index([tenantId, fecha])
  @@index([tenantId, tipoOperacion])
  @@index([tenantId, estado])
  @@index([tenantId, contraparte])
}

// ============= OPERACIÓN - BOVINO (Relación Many-to-Many) =============
// Vincula qué bovinosData están en cada operación
model OperacionBovino {
  id              String    @id @default(uuid())
  tenantId        String    @db.Uuid
  tenant          Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  operacionId     String    @db.Uuid
  operacion       Operacion @relation(fields: [operacionId], references: [id], onDelete: Cascade)
  
  bovinoId        String    @db.Uuid
  bovino          Bovino    @relation(fields: [bovinoId], references: [id])
  
  // Datos de la relación
  peso            Decimal?  @db.Decimal(8, 2) // Peso en operación
  precio          Decimal?  @db.Decimal(12, 2) // Precio específico si diferente
  
  @@unique([operacionId, bovinoId])
  @@index([tenantId])
  @@index([operacionId])
  @@index([bovinoId])
}

// ============= CLIENTE / PROVEEDOR =============
model ClienteProveedor {
  id              String    @id @default(uuid())
  tenantId        String    @db.Uuid
  tenant          Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  tipo            String    // "Cliente", "Proveedor", "Ambos"
  nombre          String
  razonSocial     String?
  ruc             String?
  
  // Contacto
  email           String?
  telefono        String?
  direccion       String?
  ciudad          String?
  
  // Datos comerciales
  limiteCredito   Decimal?  @db.Decimal(14, 2)
  diasPlazo       Int       @default(0)
  interesAtraso   Decimal?  @db.Decimal(5, 2)
  
  // Relaciones
  operaciones     Operacion[]
  
  activo          Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@unique([tenantId, ruc])
  @@index([tenantId])
  @@index([tipo])
}

// ============= CUENTA CONTABLE =============
// Plan de cuentas específico del tenant (personalizado)
model CuentaContable {
  id              String    @id @default(uuid())
  tenantId        String    @db.Uuid
  tenant          Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  codigo          String    // "1101-010-001"
  nombre          String    // "Caja - Moneda Local"
  descripcion     String?
  tipo            String    // "Activo", "Pasivo", "Patrimonio", "Ingreso", "Egreso"
  subTipo         String?   // "Circulante", "NoCirculante"
  
  // Valores actuales
  saldoActualPYG  Decimal   @default(0) @db.Decimal(14, 2)
  saldoActualUSD  Decimal   @default(0) @db.Decimal(14, 2)
  
  // Configuración
  esMovible       Boolean   @default(true)
  esBancaria      Boolean   @default(false)
  esImpuesto      Boolean   @default(false)
  cuentaPadre     String?   // Para cuentas analíticas
  
  // Relaciones
  detalles        DetalleAsiento[]
  
  activo          Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@unique([tenantId, codigo])
  @@index([tenantId])
  @@index([tipo, subTipo])
}

// ============= ASIENTO CONTABLE =============
// Registros en el diario contable
model AsientoContable {
  id                      String    @id @default(uuid())
  tenantId                String    @db.Uuid
  tenant                  Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  // Identificación
  numeroAsiento           Int       // Secuencial
  fecha                   DateTime
  descripcion             String
  referencia              String?   // "Venta #123", "Compra #456"
  
  // Detalles
  detalles                DetalleAsiento[]
  totalDebe               Decimal   @db.Decimal(14, 2)
  totalHaber              Decimal   @db.Decimal(14, 2)
  diferencia              Decimal   @default(0) @db.Decimal(14, 2) // Para validar que cuadra
  
  // Estado y auditoría
  estado                  String    @default("Borrador") // "Borrador", "Confirmado", "Reversado"
  confirmadoEn            DateTime?
  reversadoEn             DateTime?
  motivo_Reverso          String?
  
  // Vinculación
  operacionId             String?   @db.Uuid
  operacion               Operacion? @relation("OperacionAsiento", fields: [operacionId], references: [id])
  
  // Auditoría
  creador                 Usuario   @relation("UsuarioCreador", fields: [creadoPorId], references: [id])
  creadoPorId             String    @db.Uuid
  
  createdAt               DateTime  @default(now())
  updatedAt               DateTime  @updatedAt
  
  @@unique([tenantId, numeroAsiento])
  @@index([tenantId])
  @@index([tenantId, fecha])
  @@index([estado])
}

// ============= DETALLE ASIENTO CONTABLE =============
// Líneas individuales del asiento (Debe/Haber)
model DetalleAsiento {
  id                String    @id @default(uuid())
  tenantId          String    @db.Uuid
  tenant            Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  asientoId         String    @db.Uuid
  asiento           AsientoContable @relation(fields: [asientoId], references: [id], onDelete: Cascade)
  
  cuentaId          String    @db.Uuid
  cuenta            CuentaContable @relation(fields: [cuentaId], references: [id])
  
  // Valores
  debe              Decimal   @default(0) @db.Decimal(14, 2)
  haber             Decimal   @default(0) @db.Decimal(14, 2)
  descripcion       String?
  
  // Control
  moneda            String    @default("PYG")
  centroId          String?   @db.Uuid // Para análisis por centro
  
  @@index([tenantId])
  @@index([asientoId])
  @@index([cuentaId])
}

// ============= BANCO =============
// Cuentas bancarias del tenant
model Banco {
  id                String    @id @default(uuid())
  tenantId          String    @db.Uuid
  tenant            Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  nombre            String    // "BCP - Cuenta Corriente"
  codigoBanco       String?   // "130" para BCP
  numeroCuenta      String
  moneda            String    // "PYG", "USD"
  tipoCuenta        String    // "Corriente", "Ahorro"
  
  // Datos bancarios
  iban              String?
  swift             String?
  
  // Saldo
  saldoApertura     Decimal   @db.Decimal(14, 2)
  saldoActual       Decimal   @db.Decimal(14, 2)
  
  // Vinculación contable
  cuentaContableId  String?   @db.Uuid
  
  activo            Boolean   @default(true)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@unique([tenantId, numeroCuenta])
  @@index([tenantId])
}

// ============= COTIZACIÓN DE MONEDA =============
// Registro histórico de cotizaciones
model CotizacionMoneda {
  id                String    @id @default(uuid())
  tenantId          String    @db.Uuid
  tenant            Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  fecha             DateTime
  monedaDe          String    // "USD"
  monedaA           String    // "PYG"
  cotizacionCompra  Decimal   @db.Decimal(10, 4)
  cotizacionVenta   Decimal   @db.Decimal(10, 4)
  cotizacionPromedio Decimal  @db.Decimal(10, 4)
  
  fuente            String?   // "SET", "BCP", "MANUAL"
  
  @@index([tenantId])
  @@index([tenantId, fecha])
  @@unique([tenantId, fecha, monedaDe, monedaA])
}

// ============= AUDITORÍA =============
// Log de todas las acciones del sistema
model AuditLog {
  id                String    @id @default(uuid())
  tenantId          String    @db.Uuid
  tenant            Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  usuario           Usuario?  @relation(fields: [usuarioId], references: [id], onDelete: SetNull)
  usuarioId         String?   @db.Uuid
  
  // Acción
  accion            String    // "CREATE", "UPDATE", "DELETE", "LOGIN"
  recurso           String    // "Bovino", "Operacion", "Usuario"
  resourceoId       String?   // ID del recurso afectado
  
  // Detalles
  resultado         String    // "EXITO", "ERROR"
  detalles          String?   // JSON con cambios
  ipAddress         String?
  userAgent         String?
  
  timestamp         DateTime  @default(now())
  
  @@index([tenantId])
  @@index([tenantId, timestamp])
  @@index([recurso])
  @@index([usuarioId])
}
```

---

## 5. ÍNDICES CRÍTICOS

```prisma
// Para performance, agregar estos índices explícitamente:

model Bovino {
  // Existentes...
  @@index([tenantId, estadoActual]) // Inventario vivo
  @@index([tenantId, centroId]) // Por centro
  @@index([tenantId, tipoAnimal]) // Por tipo
  @@index([tenantId, esReproductor]) // Reproductores
  @@index([tenantId, fechaCompra]) // Histórico compras
}

model Operacion {
  // Existentes...
  @@index([tenantId, fecha]) // Por período
  @@index([tenantId, tipoOperacion]) // Por tipo
  @@index([tenantId, estado]) // Por estado
  @@index([contraparte]) // Búsquedas rápidas
}

model AsientoContable {
  // Existentes...
  @@index([tenantId, fecha]) // Reportes por período
  @@index([tenantId, estado]) // Asientos pendientes
}

model DetalleAsiento {
  // Existentes...
  @@index([asientoId, cuentaId]) // Para reportes
  @@index([centroId]) // Por centro de costo
}
```

---

## 6. RELACIONES CLAVE

```
Tenant (1) → (muchos) Usuario
Tenant (1) → (muchos) Rol
Tenant (1) → (muchos) Bovino
Tenant (1) → (muchos) Operacion
Tenant (1) → (muchos) AsientoContable

Usuario (muchos) → (muchos) Rol

Bovino (muchos) → (muchos) Operacion (vía OperacionBovino)

Operacion (1) → (muchos) OperacionBovino
Operacion (1) → (muchos) AsientoContable

AsientoContable (1) → (muchos) DetalleAsiento
DetalleAsiento (muchos) → (1) CuentaContable
```

---

## 7. ENUMERACIONES Y CONSTANTS

```typescript
// backend/src/constants/enums.ts

export const TIPOS_BOVINO = {
  TORO: 'Toro',
  VACA: 'Vaca',
  TERNERO: 'Ternero',
  TERNERA: 'Ternera',
  VAQUILLONA: 'Vaquillona',
  TORITO: 'Torito',
  EQUINO: 'Equino'
} as const;

export const ESTADO_BOVINO = {
  VIVO: 'Vivo',
  VENDIDO: 'Vendido',
  MUERTO: 'Muerto',
  ESCAPADO: 'Escapado'
} as const;

export const TIPOS_OPERACION = {
  COMPRA: 'Compra',
  VENTA: 'Venta',
  FAENA: 'Faena',
  NACIMIENTO: 'Nacimiento',
  MUERTE: 'Muerte',
  MOVIMIENTO: 'Movimiento',
  CONSUMO: 'Consumo'
} as const;

export const TIPO_CUENTA = {
  ACTIVO: 'Activo',
  PASIVO: 'Pasivo',
  PATRIMONIO: 'Patrimonio',
  INGRESO: 'Ingreso',
  EGRESO: 'Egreso'
} as const;

export const ESTADO_ASIENTO = {
  BORRADOR: 'Borrador',
  CONFIRMADO: 'Confirmado',
  REVERSADO: 'Reversado'
} as const;

export const MONEDAS = {
  PYG: 'PYG',
  USD: 'USD'
} as const;

export const TIPOS_COMPROBANTE = {
  FACTURA: 'Factura',
  RECIBO: 'Recibo',
  NOTA_CREDITO: 'Nota de Crédito',
  NOTA_DEBITO: 'Nota de Débito',
  REMITO: 'Remito'
} as const;
```

---

## 8. MIGRATION DE PRISMA

```bash
# Inicializar Prisma
npx prisma init

# Crear migración
npx prisma migrate dev --name init

# Aplicar en producción
npx prisma migrate deploy

# Generar client
npx prisma generate

# Ver estado
npx prisma migrate status

# Seed data
npx prisma db seed
```

---

## 9. SEED DATA INICIAL

```typescript
// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Crear permisos globales
  const permisos = await crearPermisos();
  
  // Crear tenant de prueba
  const tenant = await prisma.tenant.create({
    data: {
      nombre: 'Fondo Inversión IN Ganadero',
      razonSocial: 'Fondo de Inversión IN Ganadero Cría',
      ruc: '80000000-9',
      monedaPrincipal: 'USD',
      paisDefault: 'PY'
    }
  });
  
  // Crear roles
  const rolAdmin = await prisma.rol.create({
    data: {
      tenantId: tenant.id,
      nombre: 'Tenant Admin',
      descripcion: 'Administrador del tenant',
      permisos: {
        connect: permisos.map(p => ({ id: p.id }))
      }
    }
  });
  
  // Crear usuario admin
  const usuario = await prisma.usuario.create({
    data: {
      tenantId: tenant.id,
      azureAdId: 'test-user-id',
      email: 'admin@test.com',
      nombre: 'Admin',
      apellido: 'Test',
      roles: {
        connect: { id: rolAdmin.id }
      }
    }
  });
  
  // Crear centros de costo
  await crearCentrosCosto(tenant.id);
  
  // Crear plan de cuentas
  await crearPlanCuentas(tenant.id);
  
  console.log('✅ Seed completado');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
```

---

**Próximo:** Ver [05-API-ENDPOINTS.md](./05-API-ENDPOINTS.md) para definir los endpoints REST.

---

**Actualizado:** Diciembre 2025
