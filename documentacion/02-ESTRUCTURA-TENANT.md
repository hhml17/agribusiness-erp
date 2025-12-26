# 02 - ESTRUCTURA Y MODELO MULTI-TENANT

## 1. CONCEPTO DE MULTI-TENANCY

En **Agribusiness**, cada empresa ganadera cliente es un **tenant** independiente. Todos comparten la misma aplicación, pero sus datos están completamente aislados.

### Ventajas:
- ✅ Costo de infraestructura reducido
- ✅ Administración centralizada
- ✅ Updates automáticos para todos
- ✅ Escalabilidad horizontal
- ✅ Backup y recovery simplificado

### Responsabilidades:
- 🔒 Asegurar isolación de datos
- 🔐 Validar `tenantId` en cada request
- 📊 Permitir escalabilidad independiente por tenant

---

## 2. MODELOS DE MULTI-TENANCY

Analizamos 3 opciones para Agribusiness:

### Opción A: MULTI-SCHEMA (Una DB, Schema por Tenant)
```
┌─────────────────────────────────────┐
│      Azure SQL Server Database      │
├────────────────┬────────────────────┤
│  Schema       │  Schema            │
│  TENANT_001   │  TENANT_002        │
├──────────────┤├──────────────────┤│
│ bovino_t001  │ bovino_t002        ││
│ operacion_... │ operacion_...      ││
│ usuario_...   │ usuario_...        ││
└────────────┘└──────────────────┘│
└─────────────────────────────────────┘
```
**Ventajas:** Isolación de schema completa, fácil backup por tenant
**Desventajas:** Más complex ORM, más schemas que manejar

### Opción B: MULTI-DATABASE (Una DB por Tenant)
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ DB_TENANT001 │  │ DB_TENANT002 │  │ DB_TENANT003 │
├──────────────┤  ├──────────────┤  ├──────────────┤
│ bovino       │  │ bovino       │  │ bovino       │
│ operacion    │  │ operacion    │  │ operacion    │
│ usuario      │  │ usuario      │  │ usuario      │
└──────────────┘  └──────────────┘  └──────────────┘
```
**Ventajas:** Máxima isolación, escalado independiente
**Desventajas:** Costo de infraestructura alto, complejidad alta

### Opción C: SINGLE-SCHEMA (Recomendado) ⭐
```
┌──────────────────────────────────────────┐
│    Azure SQL Server Database - Single    │
├──────────────────────────────────────────┤
│  Tabla: bovino                           │
│  ├── id (PK)                             │
│  ├── tenantId (FK) ← Isolador            │
│  ├── numeroCaravana                      │
│  └── ... otros campos                    │
│                                           │
│  Tabla: operacion                        │
│  ├── id (PK)                             │
│  ├── tenantId (FK) ← Isolador            │
│  ├── tipoOperacion                       │
│  └── ... otros campos                    │
└──────────────────────────────────────────┘
```
**Ventajas:** Simple, mantenible, costo óptimo ✅
**Desventajas:** Requiere disciplina en validación de tenantId
**Recomendación:** ELEGIMOS ESTA OPCIÓN

---

## 3. IMPLEMENTACIÓN SINGLE-SCHEMA (Nuestra Elección)

### 3.1 Estructura de Base de Datos

Todas las tablas tendrán un campo `tenantId` como:
- Foreign Key a la tabla `tenant`
- Índice incluido en búsquedas (`tenantId + criterios`)
- Filtro obligatorio en todos los queries

```sql
-- Tabla base de tenants
CREATE TABLE tenant (
    id UUID PRIMARY KEY DEFAULT NEWID(),
    nombre VARCHAR(255) NOT NULL,
    razonSocial VARCHAR(255),
    ruc VARCHAR(20) UNIQUE,
    monedaPrincipal VARCHAR(3) DEFAULT 'PYG', -- PYG o USD
    paisDefault VARCHAR(2),
    estado VARCHAR(20) DEFAULT 'activo', -- activo, suspendido, cancelado
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);

-- Ejemplo: Tabla de bovinos
CREATE TABLE bovino (
    id UUID PRIMARY KEY DEFAULT NEWID(),
    tenantId UUID NOT NULL FOREIGN KEY REFERENCES tenant(id),
    numeroCaravana VARCHAR(20) NOT NULL,
    raza VARCHAR(100),
    tipoAnimal VARCHAR(50),
    -- ... más campos
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    
    -- Índice crítico para aislación
    UNIQUE(tenantId, numeroCaravana),
    INDEX IDX_BOVINO_TENANT_ESTADO (tenantId, estadoActual)
);
```

### 3.2 Patrón en Prisma

```prisma
// prisma/schema.prisma

model Tenant {
  id                String    @id @default(uuid())
  nombre            String
  razonSocial       String?
  ruc               String    @unique
  monedaPrincipal   String    @default("PYG") // PYG, USD
  paisDefault       String?
  estado            String    @default("activo")
  
  // Relaciones
  usuarios          Usuario[]
  bovinosData       Bovino[]
  operaciones       Operacion[]
  asentosContables  AsientoContable[]
  // ... otras relaciones
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

model Bovino {
  id                String    @id @default(uuid())
  tenantId          String    // ← OBLIGATORIO
  tenant            Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  numeroCaravana    String
  raza              String?
  tipoAnimal        String
  // ... campos
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@unique([tenantId, numeroCaravana]) // Garantiza unicidad por tenant
  @@index([tenantId, estadoActual])    // Index para performance
}

model Operacion {
  id                String    @id @default(uuid())
  tenantId          String    // ← OBLIGATORIO
  tenant            Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  tipoOperacion     String
  fecha             DateTime
  // ... campos
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([tenantId, fecha])
  @@index([tenantId, tipoOperacion])
}

// Similar para todas las tablas multi-tenant
```

---

## 4. VALIDACIÓN DE TENANTID (CRÍTICO)

Cada endpoint debe validar que el usuario pertenece al `tenantId` solicitado.

### 4.1 Middleware de Autenticación

```typescript
// backend/src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/azure-ad';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    tenantId: string; // Tenant del usuario logueado
    roles: string[];
  };
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    // Verificar token con Azure AD
    const decoded = await verifyToken(token);
    
    // Obtener usuario desde DB (incluye tenantId)
    const user = await prisma.usuario.findUnique({
      where: { azureAdId: decoded.oid },
      include: {
        roles: true,
        tenant: true
      }
    });

    if (!user || !user.activo) {
      return res.status(403).json({ error: 'Usuario no encontrado o inactivo' });
    }

    // Inyectar usuario en request
    req.user = {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId, // ← Importante: se obtiene del usuario
      roles: user.roles.map(r => r.nombre)
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'No autorizado' });
  }
}
```

### 4.2 Validación en Controlador

```typescript
// backend/src/controllers/bovino.controller.ts

import { AuthenticatedRequest } from '../middleware/auth';

export async function getBovinos(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { tenantId } = req.params; // tenantId de la URL
    
    // ★★★ VALIDACIÓN CRÍTICA ★★★
    if (tenantId !== req.user.tenantId) {
      return res.status(403).json({ 
        error: 'No tienes acceso a este tenant' 
      });
    }

    // Query ahora está automaticamente limitado a este tenant
    const bovinosData = await bovino.findMany({
      where: {
        tenantId: req.user.tenantId, // Usar del usuario autenticado
        estadoActual: 'Vivo'
      },
      select: {
        id: true,
        numeroCaravana: true,
        raza: true,
        tipoAnimal: true,
        peso: true
      }
    });

    res.json(bovinosData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### 4.3 Patrón de Servicio

```typescript
// backend/src/services/bovino.service.ts

export class BovinoService {
  
  // Método PRIVADO que valida tenantId
  private validateTenant(userTenantId: string, requestTenantId: string) {
    if (userTenantId !== requestTenantId) {
      throw new UnauthorizedError('Acceso denegado a este tenant');
    }
  }

  // Métodos PÚBLICOS que reciben userTenantId
  async getBovinos(userTenantId: string, filtros?: any) {
    // Automáticamente filtra por userTenantId
    return prisma.bovino.findMany({
      where: {
        tenantId: userTenantId,
        ...filtros
      }
    });
  }

  async createBovino(userTenantId: string, datos: BovinoCreateInput) {
    // Inyecta tenantId automáticamente
    return prisma.bovino.create({
      data: {
        ...datos,
        tenantId: userTenantId // ← Se asigna automáticamente
      }
    });
  }

  async updateBovino(
    userTenantId: string,
    bovinoId: string,
    datos: BovinoUpdateInput
  ) {
    // Valida que el bovino pertenece al tenant
    const bovino = await prisma.bovino.findUnique({
      where: { id: bovinoId }
    });

    this.validateTenant(userTenantId, bovino.tenantId);

    return prisma.bovino.update({
      where: { id: bovinoId },
      data: datos
    });
  }
}
```

---

## 5. FLUJO DE REGISTRO DE NUEVO TENANT

```
1. Admin de Agribusiness completa formulario:
   ├── Nombre empresa
   ├── RUC
   ├── Moneda principal (PYG/USD)
   └── Email admin del tenant

2. Sistema crea registro en tabla TENANT
   └── Retorna tenantId

3. Crear usuarios administrativos
   ├── Email admin
   ├── Nombre
   └── Asignar rol "Tenant Admin"

4. Crear roles por defecto
   ├── Tenant Admin
   ├── Gerente General
   ├── Contador
   ├── Operativo
   └── Visualizador

5. Crear centros de costo base
   ├── Centro "General"
   └── Opcionalmente importar estancias

6. Configurar parámetros iniciales
   ├── Rango fiscal
   ├── Números de comprobantes
   └── Configuración de reportes

7. Enviar email al admin con:
   ├── URL de la aplicación
   ├── Instructions para login
   └── Guide para primeros pasos
```

---

## 6. ISOLACIÓN DE DATOS - EJEMPLO PRÁCTICO

### Escenario: Dos tenants, cada uno con ganado

**Base de datos (Vista lógica):**
```
TABLA: bovino

id    | tenantId | numeroCaravana | raza        | peso
------|----------|-----------------|------------|------
u1    | t1       | 001             | Angus      | 450
u2    | t1       | 002             | Angus      | 480
u3    | t2       | 001             | Brahman    | 520
u4    | t2       | 002             | Brahman    | 550
```

**Usuario A (pertenece a tenantId=t1):**
- LOGIN → Backend verifica en Azure AD → Encuentra usuario
- Obtiene tenantId = `t1`
- Solicita `GET /api/t1/bovinosData`
- Middleware valida: user.tenantId (`t1`) == params.tenantId (`t1`) ✅
- Service hace query: `WHERE tenantId = 't1'`
- Resultado: Solo u1 y u2 ✅

**Usuario B (pertenece a tenantId=t2):**
- LOGIN → Similar proceso
- Obtiene tenantId = `t2`
- Solicita `GET /api/t1/bovinosData` (intentando acceder a datos de t1)
- Middleware valida: user.tenantId (`t2`) != params.tenantId (`t1`) ❌
- Retorna 403 Forbidden ❌

**Usuario B intenta acceso legítimo:**
- Solicita `GET /api/t2/bovinosData`
- Middleware valida: user.tenantId (`t2`) == params.tenantId (`t2`) ✅
- Service hace query: `WHERE tenantId = 't2'`
- Resultado: Solo u3 y u4 ✅

---

## 7. CONSIDERACIONES ESPECIALES

### 7.1 Reportes Multi-tenant (Admin)
El admin de Agribusiness puede ver métricas globales:
```typescript
// Solo para admin global (no tenant-specific)
async function getEstadisticasGlobales() {
  return {
    totalTenants: await prisma.tenant.count(),
    totalBovinosData: await prisma.bovino.count(),
    totalOperaciones: await prisma.operacion.count(),
    // SIN filtro de tenantId
  };
}
```

### 7.2 Auditoría y Logs
```typescript
// Cada acción se loguea con tenantId
async function logAuditoria(
  tenantId: string,
  usuarioId: string,
  accion: string,
  entidad: string,
  detalles: any
) {
  await prisma.auditLog.create({
    data: {
      tenantId, // ← Importante para auditoría
      usuarioId,
      accion,
      entidad,
      detalles,
      timestamp: new Date()
    }
  });
}
```

### 7.3 Backups
Cada backup incluye datos de todos los tenants:
```bash
# Backup completo (incluye todos los tenants)
az sql db backup create \
  --server agribusiness \
  --database agribusiness-db \
  --backup-name backup-2025-03-20

# Para restaurar un tenant específico:
# 1. Restaurar a DB temporal
# 2. Extraer datos con WHERE tenantId = 'X'
# 3. Restaurar en DB principal
```

---

## 8. SEGURIDAD MULTI-TENANT

| Amenaza | Mitigación |
|---------|-----------|
| SQL Injection | Usar Prisma ORM + Prepared Statements |
| Tenant A ve datos de B | Validación de tenantId en middleware + service |
| Permisos mal asignados | RBAC granular + auditoría |
| Token robado | Verificación en Azure AD + expiration corta |
| Admin modifica otro tenant | Validación en todas operaciones |

---

## 9. PERFORMANCE MULTI-TENANT

### Estrategias:

**Indexación Obligatoria:**
```sql
CREATE INDEX IDX_TENANT_PRIMARY ON bovino(tenantId, id);
CREATE INDEX IDX_TENANT_ESTADO ON bovino(tenantId, estadoActual);
CREATE INDEX IDX_TENANT_FECHA ON operacion(tenantId, fecha);
```

**Particionamiento (Fase 2):**
Si llega a 100M+ registros, particionar por tenantId.

**Caché:**
- Redis para consultas frecuentes por tenant
- TTL corto (5 min) para reportes
- Invalidar en mutations

---

## 10. MIGRACIÓN A MULTI-TENANT

Si algún día necesitas migrar de single-tenant a multi-tenant:

1. **Agregar columna tenantId a todas las tablas**
   ```sql
   ALTER TABLE bovino ADD COLUMN tenantId UUID;
   ```

2. **Asignar tenantId a registros existentes**
   ```sql
   UPDATE bovino SET tenantId = '00000000-0000-0000-0000-000000000001';
   ```

3. **Hacer tenantId NOT NULL y agregar FK**
   ```sql
   ALTER TABLE bovino 
   ALTER COLUMN tenantId UUID NOT NULL;
   ALTER TABLE bovino 
   ADD CONSTRAINT FK_BOVINO_TENANT 
   FOREIGN KEY (tenantId) REFERENCES tenant(id);
   ```

4. **Actualizar aplicación con validaciones**

5. **Testing exhaustivo**

---

## RESUMEN

✅ **Modelo Elegido:** Single-Schema Multi-Tenant
✅ **Isolador:** Campo `tenantId` en todas las tablas
✅ **Validación:** Middleware + Service + Query filters
✅ **Seguridad:** Imposible acceder a datos de otro tenant sin exploits complejos
✅ **Performance:** Indices en (tenantId, criterios)
✅ **Escalabilidad:** Cada tenant crece independientemente

**Próximo:** Revisar [03-ROLES-PERMISOS.md](./03-ROLES-PERMISOS.md) para entender cómo se manejan permisos dentro de cada tenant.

---

**Actualizado:** Diciembre 2025
**Autor:** Hans
**Estado:** Definido
