# 03 - SISTEMA DE ROLES Y PERMISOS (RBAC)

## 1. INTRODUCCIÓN AL RBAC

**Role-Based Access Control (RBAC)** es un modelo de seguridad donde los usuarios se asignan a **roles**, y los roles tienen **permisos** específicos.

En Agribusiness:
- Cada usuario pertenece a 1 o más roles (dentro de su tenant)
- Cada rol tiene un conjunto de permisos
- Los permisos controlan qué acciones puede hacer un usuario

### Ventajas:
- ✅ Simple de entender y mantener
- ✅ Flexible (fácil agregar nuevos roles)
- ✅ Escalable (no es attribute-based)
- ✅ Alineado con estructura organizacional real

---

## 2. ROLES PREDEFINIDOS

Basados en el análisis de tu negocio y mejores prácticas (Azure, AWS), definimos estos roles principales:

### 2.1 TENANT ADMIN (Súper Administrador del Tenant)

**Descripción:** Máximo nivel de acceso dentro del tenant. Gestiona usuarios, roles y configuración.

**Permisos:**
```
ADMINISTRACIÓN
├── tenant_config_view
├── tenant_config_edit
├── usuario_create
├── usuario_edit
├── usuario_delete
├── usuario_view
├── rol_create
├── rol_edit
├── rol_delete
├── rol_view
└── auditoria_view

TODAS LAS OPERACIONES
├── * (wildcard - acceso a todo)
```

**Quién lo usa:**
- Dueño de la empresa
- Administrador de sistemas interno
- Contador jefe

**Usuarios esperados:** 1-2 por tenant

---

### 2.2 GERENTE GENERAL

**Descripción:** Líder operativo y financiero. Acceso a reportes y decisiones de negocio.

**Permisos:**
```
GANADO
├── bovino_view
├── bovino_report
├── operacion_view (no create/edit)
└── operacion_report

FINANCIERO
├── asiento_view
├── reporte_financiero_view
├── balance_general_view
├── estado_resultados_view
├── flujo_caja_view
└── analisis_financiero

REPORTES
├── dashboard_view
├── reportes_executivos_view
└── exportar_excel

USUARIOS
├── usuario_view (no edit)
└── rol_view (no edit)
```

**Quién lo usa:**
- Gerente de operaciones
- Gerente comercial

**Usuarios esperados:** 2-3 por tenant

---

### 2.3 CONTADOR / AUXILIAR CONTABLE

**Descripción:** Gestión completa de contabilidad y reportes financieros.

**Permisos:**
```
GANADO
├── bovino_view (solo para costeo)
└── operacion_view (solo para impacto contable)

FINANCIERO
├── asiento_create
├── asiento_edit (si no está conciliado)
├── asiento_delete (si no está conciliado)
├── asiento_view
├── plan_cuentas_view
├── banco_operaciones_view
├── banco_operaciones_edit
├── reconciliacion_bancaria_create
├── reconciliacion_bancaria_edit
├── impuesto_declaracion_view
└── impuesto_declaracion_edit

REPORTES
├── reporte_financiero_view
├── balance_general_view
├── estado_resultados_view
├── comprobante_view
└── exportar_excel

OPERACIONES
├── operacion_view (para ver impacto contable)
└── operacion_enlazar_contable (vincular operación a asiento)

USUARIOS
└── usuario_view (no edit)
```

**Quién lo usa:**
- Contador
- Auxiliar de contabilidad

**Usuarios esperados:** 2-3 por tenant

---

### 2.4 ENCARGADO OPERATIVO (Veterinario, Capataz)

**Descripción:** Gestión del día a día del ganado, registros de operaciones.

**Permisos:**
```
GANADO
├── bovino_create
├── bovino_edit
├── bovino_view
├── bovino_peso_registrar (registrar pesada)
├── bovino_movimiento_registrar
├── inventario_view
├── lote_create
├── lote_edit
├── lote_view
└── lote_movimiento

OPERACIONES
├── operacion_create
├── operacion_edit (solo propias, si no procesada)
├── operacion_view
├── operacion_compra_registrar
├── operacion_venta_registrar
├── operacion_faena_registrar
└── operacion_movimiento

REPORTES
├── reporte_pecuario_view
├── inventario_actual_view
├── operaciones_mes_view
└── excel_export_limitado (solo últimos 30 días)

OTROS
└── usuario_view (no edit)
```

**Quién lo usa:**
- Capataz
- Veterinario / Asistente técnico
- Responsable de estancia

**Usuarios esperados:** 3-5 por tenant

---

### 2.5 COMERCIAL (Vendedor, Comprador)

**Descripción:** Gestión de compras y ventas, negociación con proveedores/clientes.

**Permisos:**
```
OPERACIONES COMERCIALES
├── operacion_compra_view
├── operacion_compra_create
├── operacion_compra_edit (solo propias)
├── operacion_compra_confirmar
├── operacion_venta_view
├── operacion_venta_create
├── operacion_venta_edit (solo propias)
├── operacion_venta_confirmar
├── cliente_view
├── cliente_create
├── cliente_edit
├── proveedor_view
├── proveedor_create
└── proveedor_edit

GANADO
├── bovino_view
├── inventario_view
└── bovino_disponible_para_venta

REPORTES
├── operaciones_pendientes_view
├── clientes_proveedores_view
├── compras_ventas_resumen
└── comisiones_view

FINANCIERO
├── precio_unitario_view
├── cotizacion_moneda_view (para cálculos)
└── estado_cuentas_view

USUARIOS
└── usuario_view (no edit)
```

**Quién lo usa:**
- Vendedor de ganado
- Comprador de insumos
- Responsable comercial

**Usuarios esperados:** 2-4 por tenant

---

### 2.6 VISUALIZADOR / REPORTERO (Read-Only)

**Descripción:** Acceso a reportes y dashboards sin poder modificar datos.

**Permisos:**
```
LECTURA GENERAL
├── bovino_view
├── operacion_view
├── asiento_view
├── usuario_view
└── todo_view (EXCEPTO configuración)

REPORTES
├── dashboard_view
├── reportes_financiero_view
├── reportes_pecuario_view
├── reportes_operativo_view
├── inventario_view
└── exportar_excel

PROHIBIDO EXPLÍCITAMENTE
├── *_create (NINGÚN)
├── *_edit (NINGÚN)
├── *_delete (NINGÚN)
├── configuracion_edit (NINGÚN)
└── usuario_edit (NINGÚN)
```

**Quién lo usa:**
- Dueño ocasional
- Asesor externo
- Inversionista

**Usuarios esperados:** 1-2 por tenant

---

## 3. PERMISOS GRANULARES

Los permisos están organizados por **módulo** y **acción**:

### Formato: `modulo_accion`

```
MODULO = bovino, operacion, financiero, usuario, configuracion
ACCION = view, create, edit, delete, report, export
```

### Lista Completa de Permisos:

```
BOVINO
├── bovino:view              # Ver individuos
├── bovino:create            # Crear individuos
├── bovino:edit              # Editar individuos
├── bovino:delete            # Eliminar individuos
├── bovino:peso:registrar    # Registrar pesadas
├── bovino:reproductor       # Marcar como reproductor
├── bovino:report            # Ver reportes pecuarios
└── bovino:export

OPERACION
├── operacion:view           # Ver operaciones
├── operacion:create         # Crear operaciones
├── operacion:edit           # Editar operaciones
├── operacion:delete         # Eliminar operaciones (borrador)
├── operacion:confirmar      # Pasar a estado confirmada
├── operacion:compra:view
├── operacion:compra:create
├── operacion:venta:view
├── operacion:venta:create
├── operacion:faena:view
├── operacion:faena:create
├── operacion:nacimiento:view
├── operacion:nacimiento:create
├── operacion:muerte:view
├── operacion:muerte:create
├── operacion:permiso_senacsa
├── operacion:report
└── operacion:export

FINANCIERO
├── asiento:view
├── asiento:create
├── asiento:edit
├── asiento:delete
├── asiento:confirmar
├── asiento:reversar
├── banco:view
├── banco:operaciones:create
├── banco:operaciones:reconciliar
├── cuentas:view
├── cuentas:edit (solo admin)
├── impuesto:view
├── impuesto:ddjj:crear
├── flujo:caja:view
├── balance:general:view
├── estado:resultado:view
└── analisis:financiero

USUARIO
├── usuario:view
├── usuario:create
├── usuario:edit
├── usuario:delete
├── usuario:asignar_rol
├── usuario:desactivar
└── usuario:auditoria

CONFIGURACION
├── config:tenant:view
├── config:tenant:edit
├── config:centro_costo:view
├── config:centro_costo:create
├── config:centro_costo:edit
├── config:centro_costo:delete
├── config:estancia:view
├── config:estancia:create
├── config:estancia:edit
├── config:estancia:delete
└── config:import_datos
```

---

## 4. MODELO DE DATOS - ROLES Y PERMISOS

```prisma
model Rol {
  id          String    @id @default(uuid())
  tenantId    String    @db.Uuid
  tenant      Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  nombre      String    // "Tenant Admin", "Gerente", etc
  descripcion String?
  
  // Relación many-to-many con permisos
  permisos    Permiso[] @relation("RolPermiso")
  
  // Relación many-to-many con usuarios
  usuarios    Usuario[] @relation("UsuarioRol")
  
  activo      Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@unique([tenantId, nombre]) // Un rol por nombre por tenant
  @@index([tenantId])
}

model Permiso {
  id          String    @id @default(uuid())
  
  // Permiso global (no está vinculado a tenant)
  codigo      String    @unique // "bovino:view", "asiento:create", etc
  nombre      String
  descripcion String?
  
  modulo      String    // "bovino", "operacion", "financiero", etc
  accion      String    // "view", "create", "edit", "delete", "report"
  
  roles       Rol[]     @relation("RolPermiso")
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([modulo])
}

model Usuario {
  id          String    @id @default(uuid())
  tenantId    String
  tenant      Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  azureAdId   String    @unique // ID del usuario en Azure AD
  email       String
  nombre      String
  apellido    String?
  
  // Relación many-to-many con roles
  roles       Rol[]     @relation("UsuarioRol")
  
  activo      Boolean   @default(true)
  ultimoLogin DateTime?
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@unique([tenantId, email])
  @@index([tenantId])
  @@index([activo])
}

// Tabla intermedia (generada automáticamente por Prisma en many-to-many)
// No necesita ser declarada explícitamente, pero se llama: RolPermiso
// Con campos: rolId, permisoId, ambos con @relation
```

---

## 5. INICIALIZACIÓN DE ROLES EN NUEVO TENANT

Cuando se crea un nuevo tenant, se crean automáticamente los roles predefinidos:

```typescript
// backend/src/services/tenant.service.ts

async function crearTenantConRolesDefecto(datosN ew: TenantCreateInput) {
  return prisma.$transaction(async (tx) => {
    // 1. Crear tenant
    const tenant = await tx.tenant.create({
      data: {
        ...datosNew,
        estado: 'activo'
      }
    });

    // 2. Obtener permisos globales
    const permisos = await tx.permiso.findMany();

    // 3. Definir roles con sus permisos
    const rolesACrear = [
      {
        nombre: 'Tenant Admin',
        descripcion: 'Administrador completo del tenant',
        permisosCodigos: permisos.map(p => p.codigo) // Todos
      },
      {
        nombre: 'Gerente General',
        descripcion: 'Líder operativo y financiero',
        permisosCodigos: [
          'bovino:view',
          'bovino:report',
          'operacion:view',
          'operacion:report',
          'asiento:view',
          'financiero:balance:view',
          'financiero:estado:resultado:view',
          // ... más permisos
        ]
      },
      {
        nombre: 'Contador',
        descripcion: 'Gestión de contabilidad',
        permisosCodigos: [
          'asiento:view',
          'asiento:create',
          'asiento:edit',
          'asiento:confirmar',
          'banco:view',
          'banco:operaciones:create',
          // ... más permisos
        ]
      },
      // ... más roles
    ];

    // 4. Crear roles
    for (const rolDef of rolesACrear) {
      const permisosDelRol = permisos.filter(p =>
        rolDef.permisosCodigos.includes(p.codigo)
      );

      await tx.rol.create({
        data: {
          tenantId: tenant.id,
          nombre: rolDef.nombre,
          descripcion: rolDef.descripcion,
          permisos: {
            connect: permisosDelRol.map(p => ({ id: p.id }))
          }
        }
      });
    }

    return tenant;
  });
}
```

---

## 6. VALIDACIÓN DE PERMISOS EN ENDPOINTS

### 6.1 Middleware de Autorización

```typescript
// backend/src/middleware/authorization.ts

export function requirePermissions(...permisosCodigos: string[]) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Obtener usuario con roles y permisos
      const usuario = await prisma.usuario.findUnique({
        where: { id: req.user.id },
        include: {
          roles: {
            include: {
              permisos: true
            }
          }
        }
      });

      // Obtener todos los permisos del usuario
      const permisosUsuario = new Set<string>();
      usuario.roles.forEach(rol => {
        rol.permisos.forEach(permiso => {
          permisosUsuario.add(permiso.codigo);
        });
      });

      // Verificar que tiene al menos uno de los permisos requeridos
      const tienePermiso = permisosCodigos.some(codigo =>
        permisosUsuario.has(codigo)
      );

      if (!tienePermiso) {
        return res.status(403).json({
          error: 'No tienes permisos para esta acción',
          permisosRequeridos: permisosCodigos,
          permisosActuales: Array.from(permisosUsuario)
        });
      }

      // Pasar permisos al siguiente middleware/controller
      req.user.permisos = permisosUsuario;
      next();
    } catch (error) {
      res.status(500).json({ error: 'Error al validar permisos' });
    }
  };
}
```

### 6.2 Uso en Rutas

```typescript
// backend/src/routes/bovino.routes.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { requirePermissions } from '../middleware/authorization';
import { getBovinosData, createBovino, updateBovino } from '../controllers/bovino';

const router = Router();

// Ver bovinosData
router.get(
  '/:tenantId/bovinosData',
  authMiddleware,
  requirePermissions('bovino:view'),
  getBovinosData
);

// Crear bovino
router.post(
  '/:tenantId/bovinosData',
  authMiddleware,
  requirePermissions('bovino:create'),
  createBovino
);

// Editar bovino
router.put(
  '/:tenantId/bovinosData/:bovinoId',
  authMiddleware,
  requirePermissions('bovino:edit'),
  updateBovino
);

export default router;
```

---

## 7. CACHÉ DE PERMISOS

Por performance, caché los permisos en la sesión:

```typescript
// backend/src/utils/permissions.cache.ts

import NodeCache from 'node-cache';

const permisosCache = new NodeCache({ stdTTL: 3600 }); // 1 hora

export async function obtenerPermisosUsuario(usuarioId: string) {
  const cacheKey = `permisos_${usuarioId}`;
  
  // Intentar obtener del caché
  const permisosCacheado = permisosCache.get<Set<string>>(cacheKey);
  if (permisosCacheado) {
    return permisosCacheado;
  }

  // Si no está en caché, obtener de DB
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    include: {
      roles: {
        include: {
          permisos: true
        }
      }
    }
  });

  const permisos = new Set<string>();
  usuario.roles.forEach(rol => {
    rol.permisos.forEach(p => {
      permisos.add(p.codigo);
    });
  });

  // Guardar en caché
  permisosCache.set(cacheKey, permisos);

  return permisos;
}

// Limpiar caché cuando cambian permisos (ej: cambio de rol)
export function invalidarPermisosCache(usuarioId: string) {
  permisosCache.del(`permisos_${usuarioId}`);
}
```

---

## 8. AUDITORÍA DE ACCIONES

Registrar quién hizo qué y cuándo:

```typescript
// backend/src/utils/auditoria.ts

export async function registrarAccion(
  tenantId: string,
  usuarioId: string,
  accion: string,
  recurso: string,
  recursoid: string,
  resultado: 'exito' | 'error',
  detalles?: any
) {
  await prisma.auditLog.create({
    data: {
      tenantId,
      usuarioId,
      accion,
      recurso,
      recursoid,
      resultado,
      detalles,
      timestamp: new Date(),
      ipAddress: getClientIP(), // middleware debe inyectar esto
      userAgent: getUserAgent()
    }
  });
}

// Usar en controladores
export async function createBovino(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    // ... lógica de creación ...
    
    const bovinoCreado = await bovinoService.create(...);
    
    await registrarAccion(
      req.user.tenantId,
      req.user.id,
      'CREAR',
      'bovino',
      bovinoCreado.id,
      'exito',
      { caravana: bovinoCreado.numeroCaravana }
    );
    
    res.json(bovinoCreado);
  } catch (error) {
    await registrarAccion(
      req.user.tenantId,
      req.user.id,
      'CREAR',
      'bovino',
      '',
      'error',
      { error: error.message }
    );
    res.status(500).json({ error: error.message });
  }
}
```

---

## 9. PANEL DE ADMINISTRACIÓN DE ROLES

El Tenant Admin puede:
1. Ver todos los roles
2. Crear nuevos roles
3. Asignar/desasignar permisos
4. Ver qué usuarios tienen cada rol
5. Ver auditoría de cambios de roles

```typescript
// backend/src/controllers/rol.controller.ts

// Ver todos los roles del tenant
export async function getRoles(req: AuthenticatedRequest, res: Response) {
  const roles = await prisma.rol.findMany({
    where: { tenantId: req.user.tenantId },
    include: {
      permisos: {
        select: { codigo: true, nombre: true }
      },
      _count: {
        select: { usuarios: true }
      }
    }
  });

  res.json(roles);
}

// Crear nuevo rol personalizado
export async function createRol(req: AuthenticatedRequest, res: Response) {
  const { nombre, descripcion, permisosCodigos } = req.body;

  const rol = await prisma.rol.create({
    data: {
      tenantId: req.user.tenantId,
      nombre,
      descripcion,
      permisos: {
        connect: permisosCodigos.map(codigo => ({ codigo }))
      }
    },
    include: { permisos: true }
  });

  res.json(rol);
}

// Asignar rol a usuario
export async function asignarRolAUsuario(
  req: AuthenticatedRequest,
  res: Response
) {
  const { usuarioId, rolId } = req.body;

  const usuario = await prisma.usuario.update({
    where: { id: usuarioId },
    data: {
      roles: {
        connect: { id: rolId }
      }
    },
    include: { roles: true }
  });

  await registrarAccion(
    req.user.tenantId,
    req.user.id,
    'ASIGNAR_ROL',
    'usuario',
    usuarioId,
    'exito',
    { rolId }
  );

  res.json(usuario);
}
```

---

## 10. INTEGRACIÓN CON AZURE AD

### 10.1 Sincronización de Grupos Azure AD con Roles Locales

```typescript
// backend/src/utils/azure-ad-sync.ts

export async function sincronizarPermisosDesdeAzureAD(usuarioId: string) {
  // 1. Obtener usuario de Azure AD
  const usuarioAzure = await microsoftGraph.users.get(usuarioId);

  // 2. Obtener grupos del usuario en Azure AD
  const gruposAzure = await microsoftGraph.users.memberOf(usuarioId);

  // 3. Mapear grupos Azure AD a roles locales
  const rolesAAsignar = gruposAzure
    .map(grupo => MAPEO_GRUPOS_AZURE_A_ROLES[grupo.displayName])
    .filter(Boolean);

  // 4. Actualizar roles locales
  const usuario = await prisma.usuario.update({
    where: { azureAdId: usuarioId },
    data: {
      roles: {
        // Desconectar todos
        disconnect: (await prisma.usuario.findUnique({
          where: { azureAdId: usuarioId },
          select: { roles: { select: { id: true } } }
        })).roles,
        // Conectar nuevos
        connect: rolesAAsignar.map(nombreRol => ({
          nombre_tenantId: {
            nombre: nombreRol,
            tenantId: usuario.tenantId
          }
        }))
      }
    }
  });

  return usuario;
}

// Mapeo: se define en configuración
const MAPEO_GRUPOS_AZURE_A_ROLES: Record<string, string> = {
  'GanaGerentes': 'Gerente General',
  'GanaContadores': 'Contador',
  'GanaOperativos': 'Encargado Operativo',
  // ...
};
```

---

## RESUMEN DE ROLES

| Rol | Admin | Crear Datos | Editar Datos | Ver Reportes | Contabilidad |
|-----|-------|-------------|--------------|--------------|--------------|
| Tenant Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Gerente General | ❌ | ❌ | ❌ | ✅ | ✅ (lectura) |
| Contador | ❌ | ✅ (contable) | ✅ (contable) | ✅ (fin) | ✅ |
| Operativo | ❌ | ✅ (ganado) | ✅ (ganado) | ✅ (pecuario) | ❌ |
| Comercial | ❌ | ✅ (compra/venta) | ✅ (propias) | ✅ (comercial) | ❌ |
| Visualizador | ❌ | ❌ | ❌ | ✅ | ✅ (lectura) |

---

**Próximo:** Revisar [04-SCHEMA-DATABASE.md](./04-SCHEMA-DATABASE.md) para el diseño de la base de datos.

---

**Actualizado:** Diciembre 2025
**Autor:** Hans
**Estado:** Definido
