# 01 - VISIÓN Y ARQUITECTURA DEL SISTEMA

## 1. VISIÓN ESTRATÉGICA

**Agribusiness** es una plataforma ERP integral para la gestión completa de operaciones ganaderas, diseñada como un sistema agnóstico que puede adaptarse a cualquier tipo de negocio agrícola.

### Objetivos Principales:
1. Centralizar toda la información operativa y financiera de la empresa ganadera
2. Proporcionar visibilidad en tiempo real del estado del ganado y operaciones
3. Automatizar procesos contables y financieros
4. Generar reportes ejecutivos para toma de decisiones
5. Asegurar cumplimiento legal (SENACSA)
6. Reducir tiempos de gestión y análisis

---

## 2. PRINCIPIOS ARQUITECTÓNICOS

### 2.1 Multi-Tenancy
- Cada organización (empresa ganadera) es un **tenant** independiente
- Isolación completa de datos entre tenants
- Uso de `tenantId` en todas las tablas operativas
- Schema compartido pero datos completamente segregados

### 2.2 Escalabilidad
- Arquitectura por módulos independientes
- Servicios desacoplados
- Base de datos normalizada
- Índices optimizados para reportes

### 2.3 Seguridad
- Autenticación via Azure AD (OAuth 2.0)
- Authorization basada en roles (RBAC)
- Auditoría de acciones críticas
- Encriptación en tránsito (HTTPS)
- Validación de entrada en todos los endpoints

### 2.4 Confiabilidad
- Transacciones ACID en operaciones críticas
- Logs estructurados
- Manejo de errores granular
- Recovery plan documentado

---

## 3. ESTRUCTURA GENERAL DEL SISTEMA

```
┌─────────────────────────────────────────────────────────┐
│                   CAPA DE PRESENTACIÓN                  │
│  React SPA (TypeScript) - Responsive, Modern UI          │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  CAPA DE API/NEGOCIO                     │
│  Node.js Express - Endpoints REST con validación         │
│  - Autenticación y Autorización                          │
│  - Validación de datos                                   │
│  - Lógica de negocio                                     │
│  - Integración SENACSA, Azure                            │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  CAPA DE DATOS                           │
│  Azure SQL Server - Prisma ORM                           │
│  - Tablas normalizadas                                   │
│  - Vistas para reportes                                  │
│  - Índices de performance                                │
└─────────────────────────────────────────────────────────┘
```

---

## 4. COMPONENTES PRINCIPALES

### 4.1 Frontend (React + TypeScript)
**Responsabilidades:**
- Interfaz de usuario intuitiva
- Validación en cliente
- State management (React Query)
- Componentes reutilizables
- Gráficos y dashboards

**Estructura:**
```
frontend/
├── src/
│   ├── components/         # Botones, inputs, tablas, etc.
│   ├── modules/           # Por área de negocio
│   │   ├── tenant-admin/
│   │   ├── ganado/
│   │   ├── operaciones/
│   │   ├── financiero/
│   │   └── reportes/
│   ├── hooks/             # useAuth, useTenant, useFetch
│   ├── services/          # API client
│   ├── utils/             # helpers
│   ├── pages/             # Páginas principales
│   └── App.tsx
```

### 4.2 Backend (Node.js + Express)
**Responsabilidades:**
- Endpoints REST para todas las operaciones
- Autenticación/Autorización
- Validación de datos
- Lógica de negocio
- Integración con servicios externos

**Estructura:**
```
backend/
├── src/
│   ├── controllers/       # Lógica de endpoints
│   ├── services/         # Lógica de negocio
│   ├── middleware/       # Auth, validación, error handling
│   ├── models/           # Prisma schema
│   ├── routes/           # Definición de rutas
│   ├── utils/            # helpers, validators
│   └── index.ts          # Entry point
```

### 4.3 Base de Datos (Azure SQL Server)
**Responsabilidades:**
- Almacenamiento persistente
- Integridad de datos
- Performance de queries
- Reportes agregados

**Características:**
- Schema relacional normalizado
- Vistas materializadas para reportes
- Índices optimizados
- Triggers para auditoría

---

## 5. FLUJO DE DATOS

### 5.1 Autenticación
```
1. Usuario ingresa credenciales
2. Frontend redirige a Azure AD (OAuth 2.0)
3. Azure AD autentica y retorna token
4. Frontend envía token en headers
5. Backend valida token y obtiene usuario
6. Backend carga roles y permisos
7. Requets autorizado → procede
```

### 5.2 Operación CRUD Típica
```
1. Frontend envía GET/POST/PUT/DELETE a API
2. Backend recibe en Controller
3. Controller valida entrada (Zod/Joi)
4. Service ejecuta lógica de negocio
5. Service usa Prisma para DB
6. DB retorna resultado
7. Service mapea a DTO
8. Controller retorna JSON
9. Frontend actualiza estado local
```

### 5.3 Reporte Típico
```
1. Usuario solicita reporte (ej: Balance General)
2. Frontend envía filtros (rango fecha, tenant)
3. Backend ejecuta query compleja (JOIN múltiples tablas)
4. DB retorna datos agregados
5. Backend calcula totales y porcentajes
6. Frontend recibe y renderiza gráficos
7. Usuario puede exportar a Excel
```

---

## 6. MODELO DE DATOS - CONCEPTOS CLAVE

### 6.1 Tenant
Representa una organización (empresa ganadera) que usa el sistema.
```
Tenant
├── id: UUID
├── nombre: string
├── razonSocial: string
├── ruc: string
├── monedaPrincipal: enum (PYG, USD)
├── paisDefault: string
├── createdAt: datetime
└── updatedAt: datetime
```

### 6.2 Usuario
Personas que acceden al sistema dentro de un tenant.
```
Usuario
├── id: UUID
├── tenantId: UUID (FK)
├── azureAdId: string (único)
├── email: string
├── nombre: string
├── apellido: string
├── roles: Role[] (many-to-many)
├── activo: boolean
├── createdAt: datetime
└── updatedAt: datetime
```

### 6.3 Rol (definido en cada tenant)
Conjunto de permisos que se asignan a usuarios.
```
Rol
├── id: UUID
├── tenantId: UUID (FK)
├── nombre: string (Tenant Admin, Gerente, Contador, etc)
├── descripcion: string
├── permisos: Permiso[] (many-to-many)
├── activo: boolean
├── createdAt: datetime
└── updatedAt: datetime
```

### 6.4 Centro de Costo / Estancia
Agrupación de operaciones para costeo.
```
CentroCosto
├── id: UUID
├── tenantId: UUID (FK)
├── codigo: string (ej: "CE", "PR", "LP")
├── nombre: string
├── descripcion: string
├── ubicacion: string
├── tipoEstancia: enum (propia, alquilada)
└── activo: boolean

Estancia
├── id: UUID
├── tenantId: UUID (FK)
├── centroId: UUID (FK)
├── nombre: string
└── detalles: json
```

### 6.5 Bovino (Ganado)
Animales individuales y lotes.
```
Bovino
├── id: UUID
├── tenantId: UUID (FK)
├── numeroCaravana: string (único por tenant)
├── tipoAnimal: enum (Toro, Vaca, Ternero, Vaquillona, etc)
├── raza: string
├── peso: decimal
├── fecha_pesada: date
├── sexo: enum (M, F)
├── fechaNacimiento: date
├── madreId: UUID (FK Bovino) - null si es dato importado
├── padreId: UUID (FK Bovino) - null si es dato importado
├── estadoActual: enum (Vivo, Vendido, Muerto, Escapado)
├── centroId: UUID (FK)
├── propietario: string
├── valor: decimal
├── moneda: enum (PYG, USD)
└── auditoria: {createdAt, updatedAt, createdBy}
```

### 6.6 Operación
Movimientos de ganado (compra, venta, nacimiento, muerte, etc).
```
Operacion
├── id: UUID
├── tenantId: UUID (FK)
├── tipoOperacion: enum (Compra, Venta, Nacimiento, Muerte, Faena, Consumo)
├── fecha: date
├── descripcion: string
├── bovinosAfectados: Bovino[] (many-to-many con Operacion_Bovino)
├── cantidad: integer
├── precioUnitario: decimal
├── moneda: enum (PYG, USD)
├── totalPYG: decimal (calculado)
├── totalUSD: decimal (calculado)
├── contraparte: string (nombre cliente/proveedor)
├── comprobante: string (número factura)
├── centroDesde: UUID (FK)
├── centroHasta: UUID (FK) - null en ventas
├── estado: enum (Pendiente, Confirmada, Cancelada)
├── requierePermiso: boolean
├── numeroPermisoSENACSA: string
├── createdBy: UUID (FK Usuario)
└── auditoria: {createdAt, updatedAt}
```

### 6.7 Asiento Contable
Registros en el diario contable.
```
AsientoContable
├── id: UUID
├── tenantId: UUID (FK)
├── fecha: date
├── numero: integer (secuencial)
├── descripcion: string
├── detalles: DetalleAsiento[]
├── totalDebe: decimal
├── totalHaber: decimal
├── estado: enum (Borrador, Confirmado, Reversado)
├── vinculadoAOperacion: UUID (FK Operacion) - nullable
├── createdBy: UUID (FK Usuario)
└── auditoria: {createdAt, updatedAt}

DetalleAsiento
├── id: UUID
├── asientoId: UUID (FK)
├── cuentaId: UUID (FK)
├── debe: decimal (0 si haber > 0)
├── haber: decimal (0 si debe > 0)
└── descripcion: string
```

---

## 7. CICLO DE VIDA DEL TENANT

### Fase 1: Creación
1. Admin de Agribusiness crea nuevo tenant
2. Se crean tablas/schema si es necesario
3. Se asigna administrador del tenant
4. Se crean roles por defecto

### Fase 2: Configuración
1. Admin del tenant configura parámetros (moneda, rangos fiscales)
2. Crea usuarios y asigna roles
3. Define centros de costo y estancias
4. Importa ganado inicial (Excel)
5. Configura plan de cuentas

### Fase 3: Operación
1. Usuarios ingresan operaciones diarias
2. Sistema calcula automáticamente impactos contables
3. Reportes en tiempo real disponibles
4. Exportación periódica a Excel

### Fase 4: Cierre/Análisis
1. Cierre de período
2. Generación de reportes financieros
3. Análisis de resultados
4. Planificación para siguiente período

---

## 8. CONSIDERACIONES DE PERFORMANCE

### Indexación Crítica:
- `bovino(tenantId, estadoActual)` - para inventario vivo
- `operacion(tenantId, fecha, tipoOperacion)` - para reportes por período
- `asientoContable(tenantId, fecha, cuentaId)` - para reportes contables
- `usuario(tenantId, activo)` - para listados de usuarios

### Vistas Materializadas (Reportes):
- `vw_inventario_actual` - Ganado vivo actual por tenant
- `vw_resultados_por_centro` - P&L por centro de costo
- `vw_movimientos_por_mes` - Resumen de operaciones mensual

### Caché en Frontend:
- Estados normalizados en React Query
- Cache de 5 minutos para reportes no críticos
- Revalidación en mutations

---

## 9. DECISIONES CLAVE

| Decisión | Alternativas | Razón |
|----------|-------------|-------|
| Multi-schema por tenant vs Multi-database | Multi-db | Costo y admin más simple |
| Prisma ORM vs SQL puro | SQL puro | Type safety y migrations |
| JWT vs Sessions | Sessions | Mejor para multi-tenant con Azure AD |
| React vs Vue | Vue | Mayor ecosistema y comunidad |
| Monorepo vs Multirepo | Multirepo | Simplicidad y despliegue independiente |

---

## 10. LIMITACIONES Y RIESGOS

### Limitaciones Conocidas:
- Azure SQL Server DTU 5 puede limitar concurrencia en reportes pesados
- No hay caching distribuido (Redis) en fase 1
- Exportación Excel limitada a 100k registros

### Riesgos Identificados:
- Fallo en autenticación Azure AD → usuarios sin acceso
- Datos inconsistentes si operaciones simultáneas
- Performance degradada si muchos tenants con datos históricos

### Mitigaciones:
- Testing exhaustivo de integración Azure AD
- Transacciones explícitas en operaciones críticas
- Índices y vistas materializadas para reportes
- Plan de archiving de datos históricos

---

## 11. ROADMAP DE FASES

```
FASE 1 (Semanas 1-3): Infraestructura
├── Setup Azure (SQL, AD, Storage)
├── Schema base de datos
├── Autenticación Azure AD
└── CRUD básico de datos

FASE 2 (Semanas 4-6): Ganado
├── Gestión de individuos
├── Lotes de ganado
├── Movimientos (compra/venta)
└── Reportes pecuarios

FASE 3 (Semanas 7-8): Financiero
├── Plan de cuentas
├── Asientos contables automáticos
├── Reportes financieros
└── Multi-moneda

FASE 4 (Semanas 9-10): Operaciones y Reportes
├── Módulo comercial (compras/ventas)
├── Reportes ejecutivos
├── Dashboard
└── Exportación Excel

FASE 5: Optimizaciones y Producción
├── Performance testing
├── Security hardening
├── Documentación final
└── Go-live
```

---

**Actualizado:** Diciembre 2025
**Autor:** Hans
**Estado:** Definido
