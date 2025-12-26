# Estado Actual de la Base de Datos

## ✅ Conexión Establecida

**Base de Datos:** Azure SQL Server
**Servidor:** agribusiness.database.windows.net
**Database:** agribusiness
**Estado:** ✅ CONECTADA Y FUNCIONANDO

### Verificación
```bash
cd api
npx prisma db pull
# ✔ Introspected 13 models and wrote them into prisma/schema.prisma in 1.16s
```

## 📊 Tablas Actuales en la Base de Datos

### Módulo Core (13 tablas existentes)
1. ✅ `tenants` - Multi-tenancy
2. ✅ `usuarios` - Usuarios del sistema
3. ✅ `productos` - Catálogo de productos
4. ✅ `clientes` - Clientes
5. ✅ `proveedores` - Proveedores
6. ✅ `ventas` - Ventas
7. ✅ `compras` - Compras
8. ✅ `plan_cuentas` - Plan de cuentas contable
9. ✅ `centros_costo` - Centros de costo
10. ✅ `asientos_contables` - Asientos contables
11. ✅ `lineas_asiento` - Líneas de asientos
12. ✅ `categorias_ganado` - Categorías de ganado
13. ✅ `ganado` - Registro de ganado

### Módulo de Pagos (0 tablas - PENDIENTE)
❌ `cuentas_bancarias` - NO EXISTE
❌ `chequeras` - NO EXISTE
❌ `cheques` - NO EXISTE
❌ `ordenes_compra` - NO EXISTE
❌ `items_orden_compra` - NO EXISTE
❌ `facturas_compra` - NO EXISTE
❌ `ordenes_pago` - NO EXISTE
❌ `retenciones` - NO EXISTE
❌ `movimientos_bancarios` - NO EXISTE
❌ `extractos_bancarios` - NO EXISTE
❌ `lineas_extracto_bancario` - NO EXISTE

## 🔴 Problema Actual

**Schema de Prisma** incluye 11 modelos nuevos del módulo de pagos.
**Base de Datos** NO tiene esas tablas creadas.

**Resultado:** Los endpoints del API de pagos fallarán con error de "tabla no existe".

## ✅ Solución: Crear y Aplicar Migración

### Opción 1: Migración Automática con Prisma (RECOMENDADA)

```bash
cd api

# 1. Crear migración desde el schema actual
npx prisma migrate dev --name add_payment_module

# Esto:
# - Compara schema.prisma con la BD actual
# - Genera SQL para crear las 11 tablas nuevas
# - Aplica la migración automáticamente
# - Actualiza Prisma Client
```

**⚠️ IMPORTANTE:** Requiere `SHADOW_DATABASE_URL` configurado en `.env`

### Opción 2: Migración Manual (Si no tienes shadow DB)

```bash
cd api

# 1. Generar SQL de la migración sin aplicar
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > migrations/add_payment_module.sql

# 2. Revisar el SQL generado
cat migrations/add_payment_module.sql

# 3. Aplicar manualmente en Azure SQL
# Usar Azure Portal → SQL Query Editor
# O usar sqlcmd desde terminal
```

### Opción 3: Deploy sin shadow DB (Producción)

```bash
cd api

# Solo aplica migraciones existentes, NO crea nuevas
npx prisma migrate deploy
```

## 📋 Pasos Recomendados (Orden)

### Paso 1: Configurar Shadow Database (Opcional pero recomendado)

En Azure Portal:
1. Ir a SQL Server → Databases
2. Crear nueva base de datos: `agribusiness_shadow`
3. Usar mismo server y credenciales

Actualizar `.env`:
```bash
SHADOW_DATABASE_URL="sqlserver://agribusiness.database.windows.net:1433;database=agribusiness_shadow;user=agribusiness;password=Agronegocios1;encrypt=true"
```

### Paso 2: Crear Migración

```bash
cd api

# Opción A: Con shadow DB
npx prisma migrate dev --name add_payment_module

# Opción B: Sin shadow DB (generar SQL)
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > add_payment_module.sql
```

### Paso 3: Aplicar Migración

```bash
# Si usaste opción A (automático)
# Ya está aplicada ✅

# Si usaste opción B (manual)
# Ejecutar add_payment_module.sql en Azure Portal
```

### Paso 4: Verificar Tablas Creadas

```bash
npx prisma db pull

# Debería mostrar: ✔ Introspected 24 models
# (13 existentes + 11 nuevas = 24 total)
```

### Paso 5: Generar Prisma Client

```bash
npx prisma generate
```

### Paso 6: Seed de Datos (Opcional)

```bash
npx prisma db seed
```

## 🔧 Configuración Actual del Proyecto

### Archivo: `api/prisma/schema.prisma`

✅ **Correctamente configurado con:**
- Provider: `sqlserver`
- 24 modelos definidos (13 existentes + 11 nuevos)
- Relaciones correctas
- Índices optimizados
- Multi-tenant en todos los modelos

### Archivo: `api/.env`

✅ **Conexión configurada:**
```bash
DATABASE_URL="sqlserver://agribusiness.database.windows.net:1433;database=agribusiness;user=agribusiness;password=Agronegocios1;encrypt=true"
```

❌ **Falta configurar:**
```bash
SHADOW_DATABASE_URL="sqlserver://..."
```

### Archivo: `api/src/config/database.ts`

✅ **Prisma Client configurado correctamente:**
```typescript
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});
```

## 📈 Optimizaciones de Recursos

### 1. Connection Pooling (Ya configurado en Prisma)

Prisma automáticamente maneja:
- ✅ Pool de conexiones
- ✅ Query batching
- ✅ Transacciones eficientes

### 2. Índices en Base de Datos

Schema incluye índices en:
```prisma
@@index([tenantId])           // Queries multi-tenant
@@index([tenantId, estado])   // Filtros frecuentes
@@index([proveedorId])        // Foreign keys
@@unique([tenantId, numero])  // Unicidad compuesta
```

### 3. Soft Delete Pattern

✅ Implementado con campo `activo`:
```prisma
activo Boolean @default(true)
```

Queries automáticamente filtran:
```typescript
where: { tenantId, activo: true }
```

### 4. Paginación

✅ Implementada en todos los endpoints:
```typescript
skip: (page - 1) * limit,
take: limit  // Default: 50
```

### 5. Select Specific Fields

✅ Solo incluye relaciones necesarias:
```typescript
include: {
  proveedor: true,
  items: { include: { producto: true } }
}
```

## 🚀 Scripts Útiles

### Crear archivo `api/package.json` con scripts:

```json
{
  "scripts": {
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:pull": "prisma db pull",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset"
  }
}
```

Uso:
```bash
npm run db:migrate     # Crear y aplicar migración
npm run db:deploy      # Solo aplicar migraciones (prod)
npm run db:studio      # Abrir GUI de BD
npm run db:seed        # Cargar datos de ejemplo
```

## 📊 Monitoreo de Recursos

### Azure Portal

1. **SQL Database → Monitoring:**
   - DTU/CPU usage
   - Storage usage
   - Active connections
   - Query performance

2. **Performance Recommendations:**
   - Missing indexes
   - Query optimization

### Prisma Logs

En desarrollo (ya configurado):
```typescript
log: ['query', 'error', 'warn']
```

Para producción (recomendado):
```typescript
log: ['error', 'warn']  // Solo errores
```

## 🔐 Seguridad

### Conexión Segura

✅ **Ya implementado:**
- `encrypt=true` en connection string
- SSL/TLS enforcement
- Azure AD authentication (opcional)

### Row-Level Security (Pendiente)

Implementar en Azure SQL:
```sql
CREATE SECURITY POLICY tenantPolicy
ADD FILTER PREDICATE dbo.fn_tenantAccessPredicate(tenantId)
ON dbo.ordenes_compra;
```

## 📝 Próximos Pasos Inmediatos

1. **Decidir enfoque de migración:**
   - [ ] Opción A: Configurar shadow DB y usar `migrate dev`
   - [ ] Opción B: Generar SQL y aplicar manualmente

2. **Aplicar migración:**
   - [ ] Crear las 11 tablas nuevas
   - [ ] Verificar que se crearon correctamente

3. **Seed datos de ejemplo:**
   - [ ] Cuentas bancarias
   - [ ] Proveedores
   - [ ] Productos

4. **Testing:**
   - [ ] Probar endpoints del API
   - [ ] Verificar relaciones
   - [ ] Verificar performance

## 🆘 Troubleshooting

### Error: "Table does not exist"

**Causa:** Migración no aplicada.
**Solución:** Ejecutar paso 2 y 3 arriba.

### Error: "Shadow database required"

**Causa:** Prisma no puede crear shadow DB automáticamente.
**Solución:** Configurar `SHADOW_DATABASE_URL` o usar opción B.

### Error: "Connection timeout"

**Causa:** Firewall de Azure bloqueando IP.
**Solución:** Azure Portal → SQL Server → Firewall → Add client IP.

### Queries lentas

**Solución:**
1. Verificar índices con `EXPLAIN PLAN`
2. Azure Portal → Query Performance Insight
3. Agregar índices faltantes

---

**Última actualización:** 2025-01-18
**Estado:** ✅ Conexión OK | ❌ Migración pendiente | ✅ Código listo
