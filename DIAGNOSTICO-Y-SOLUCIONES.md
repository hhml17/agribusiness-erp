# 🔧 DIAGNÓSTICO Y SOLUCIONES - Agribusiness ERP

**Fecha:** 23 de Diciembre 2025
**Estado:** 🔴 SISTEMA NO FUNCIONAL - PROBLEMAS CRÍTICOS IDENTIFICADOS

---

## 🚨 PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. Backend - Errores de Compilación TypeScript

**Problema:**
El backend no compila debido a inconsistencia entre nombres de modelos en Prisma:

- **Schema Prisma (schema.prisma):** Usa PascalCase y @@map para nombres de tabla
  - Ejemplo: `model AsientoContable` mapea a tabla `asientos_contables`
- **Prisma Client Generado:** Usa PascalCase para acceder a modelos
  - Ejemplo: `prisma.asientoContable` (CORRECTO según schema)
- **Controladores:** Están usando nombres incorrectos mezclados
  - Algunos usan camelCase: `prisma.asientoContable`
  - Algunos usan snake_case: `prisma.asientos_contables`

**Error Example:**
```
Property 'asientoContable' does not exist on type 'PrismaClient'.
Did you mean 'asientos_contables'?
```

**Archivos Afectados (106 errores):**
- `src/controllers/asientoContable.controller.ts` - 12 errores
- `src/controllers/centroCosto.controller.ts` - 9 errores
- `src/controllers/clientes.controller.ts` - 8 errores
- `src/controllers/compras.controller.ts` - 18 errores
- `src/controllers/cuentaBancaria.controller.ts` - 6 errores
- `src/controllers/facturaCompra.controller.ts` - 8 errores
- `src/controllers/ganado.controller.ts` - 10 errores
- `src/controllers/ordenCompra.controller.ts` - 10 errores
- `src/controllers/ordenPago.controller.ts` - 8 errores
- `src/controllers/planCuentas.controller.ts` - 7 errores
- `src/controllers/productos.controller.ts` - 4 errores
- `src/controllers/proveedores.controller.ts` - 4 errores
- `src/controllers/reportes.controller.ts` - 6 errores
- `src/controllers/tenants.controller.ts` - 7 errores
- `src/controllers/ventas.controller.ts` - 9 errores
- `src/middleware/tenant.ts` - 2 errores

**Solución:**

#### Opción A: Usar PascalCase en todos lados (RECOMENDADO)
Cambiar el Prisma schema para usar PascalCase sin @@map:

```prisma
// EN VEZ DE:
model AsientoContable {
  ...
  @@map("asientos_contables")
}

// USAR:
model AsientoContable {
  ...
  // Sin @@map, usa el nombre del modelo para la tabla
}
```

**Pros:**
- Sigue convención de Prisma y TypeScript
- Nombres más limpios y consistentes
- No requiere cambios en controladores existentes

**Contras:**
- Requiere migrar la base de datos para renombrar tablas
- Las tablas actuales están en snake_case

#### Opción B: Usar camelCase para acceder a modelos
Actualizar todos los controladores para usar camelCase:

```typescript
// EN VEZ DE:
const asiento = await prisma.asientoContable.findMany();

// USAR:
const asiento = await prisma.asientoContable.findMany(); // <- CORRECTO según Prisma Client generado
```

**Pros:**
- No requiere cambios en base de datos
- Sigue convención de Prisma Client

**Contras:**
- Requiere actualizar 106 líneas de código

#### Opción C: Actualizar @@map para que coincida con camelCase
Cambiar el schema para que los modelos usen camelCase:

```prisma
model asientoContable {  // <- camelCase
  ...
  @@map("asientos_contables")
}
```

**DECISIÓN RECOMENDADA: Opción A** (PascalCase sin @@map)
- Más limpio y estándar
- Requiere migración pero es la solución a largo plazo correcta

---

### 2. Base de Datos - Tablas Faltantes

**Problema:**
El schema de Prisma tiene 24 modelos, pero la base de datos solo tiene 13 tablas.

**Tablas Existentes (13):**
1. tenants
2. usuarios
3. productos
4. clientes
5. proveedores
6. ventas
7. venta_items
8. compras
9. compra_items
10. plan_cuentas
11. centros_costo
12. asientos_contables
13. lineas_asiento

**Tablas Faltantes (11 - Módulo de Pagos):**
1. cuentas_bancarias
2. chequeras
3. cheques
4. ordenes_compra
5. items_orden_compra
6. facturas_compra
7. ordenes_pago
8. retenciones
9. movimientos_bancarios
10. extractos_bancarios
11. lineas_extracto_bancario

**Tablas Faltantes (Ganado - si no están):**
- categoria_ganado
- ganado
- movimiento_ganado

**Solución:**

Aplicar migración SQL que ya fue generada:
```bash
cd /Users/hansharder/Documents/GitHub/agribusiness-erp/api

# OPCIÓN 1: Prisma Migrate (requiere shadow database)
npx prisma migrate dev --name add_payment_module

# OPCIÓN 2: Prisma DB Push (desarrollo, sin migraciones)
npx prisma db push

# OPCIÓN 3: SQL Manual (más control)
# Ejecutar el archivo: prisma/migrations/add_payment_module.sql
# En Azure Portal > SQL Database > Query Editor
```

**Archivo de Migración Generado:**
`/Users/hansharder/Documents/GitHub/agribusiness-erp/api/prisma/migrations/add_payment_module.sql`

---

### 3. Frontend Producción - MIME Type Error

**Problema:**
```
Failed to load module script: Expected a JavaScript module script
but the server responded with a MIME type of "application/octet-stream"
```

**Diagnóstico:**
- Azure Static Web Apps está sirviendo archivos JavaScript con Content-Type incorrecto
- El archivo `staticwebapp.config.json` está configurado correctamente
- **PROBLEMA:** El archivo NO se copió al directorio `dist/` durante el último build
- Vite no está copiando la configuración automáticamente

**Verificación:**
```bash
# Verificar si existe en dist
ls -la /Users/hansharder/Documents/GitHub/agribusiness-erp/app/dist/staticwebapp.config.json

# Si NO existe, ese es el problema
```

**Solución:**

1. **Verificar vite.config.ts tiene el plugin de copia:**

```typescript
// app/vite.config.ts
import { copyFileSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-static-web-app-config',
      closeBundle() {
        try {
          copyFileSync(
            resolve(__dirname, 'public/staticwebapp.config.json'),
            resolve(__dirname, 'dist/staticwebapp.config.json')
          )
          console.log('✓ Copied staticwebapp.config.json to dist/')
        } catch (err) {
          console.warn('⚠ Could not copy staticwebapp.config.json:', err)
        }
      }
    }
  ]
})
```

2. **Hacer rebuild:**

```bash
cd /Users/hansharder/Documents/GitHub/agribusiness-erp/app
rm -rf dist/
npm run build
```

3. **Verificar que se copió:**

```bash
ls -la dist/staticwebapp.config.json
# Debe existir el archivo
```

4. **Commit y push:**

```bash
cd /Users/hansharder/Documents/GitHub/agribusiness-erp
git add app/dist/staticwebapp.config.json
git commit -m "fix: ensure staticwebapp.config.json is in dist"
git push origin main
```

5. **Esperar deployment de Azure** (5-10 minutos)

---

### 4. Frontend Desarrollo - No Carga Aplicación

**Problema:**
Localhost muestra solo HTML sin cargar React.

**Posibles Causas:**
1. Cache de Vite corrupto
2. Dependencias desactualizadas
3. Errores de TypeScript bloqueantes
4. Puerto ocupado

**Solución:**

```bash
cd /Users/hansharder/Documents/GitHub/agribusiness-erp/app

# 1. Limpiar todo
rm -rf node_modules/.vite
rm -rf dist/

# 2. Reinstalar dependencias
npm install

# 3. Iniciar dev server
npm run dev
```

Si sigue fallando:

```bash
# Verificar puerto 5173 no está ocupado
lsof -i :5173
# Si está ocupado, matar proceso
kill -9 <PID>

# O usar puerto diferente
npm run dev -- --port 5174
```

---

### 5. Backend - Se Cierra Inmediatamente

**Problema:**
El servidor inicia pero se cierra sin mensaje de error visible.

**Posibles Causas:**
1. Error en conexión a base de datos
2. Prisma Client no generado o desactualizado
3. Variable de entorno DATABASE_URL incorrecta o faltante
4. Error no capturado en código de inicialización

**Solución:**

He agregado logging mejorado en `src/config/database.ts`. Ahora al ejecutar verás:

```bash
cd /Users/hansharder/Documents/GitHub/agribusiness-erp/api

# Regenerar Prisma Client
npx prisma generate

# Verificar variables de entorno
cat .env | grep DATABASE_URL

# Compilar (si se arreglan errores de TS)
npm run build

# Iniciar con logging
npm start
```

**Logging Mejorado:**
```
✅ Database connected successfully
📊 Database URL: agribusiness.database.windows.net
```

O si falla:
```
❌ Database connection failed:
Error: <mensaje de error>
DATABASE_URL configured: true/false
```

---

## 🎯 PLAN DE RESOLUCIÓN - PASO A PASO

### PASO 1: Arreglar Schema de Prisma (CRÍTICO)

**Decisión:** Usar PascalCase para tablas (sin @@map)

**Acciones:**
1. [ ] Crear branch nueva: `git checkout -b fix/prisma-schema-consistency`
2. [ ] Actualizar `api/prisma/schema.prisma`:
   - Remover todos los `@@map()` de modelos principales
   - Las tablas se llamarán igual que los modelos en PascalCase
3. [ ] Crear migración:
   ```bash
   cd api
   npx prisma migrate dev --name standardize_table_names
   ```
4. [ ] Regenerar Prisma Client: `npx prisma generate`
5. [ ] Compilar backend: `npm run build`
6. [ ] Verificar que compila sin errores

**Alternativa (Si no se puede renombrar tablas):**
1. [ ] Dejar @@map como está
2. [ ] Actualizar TODOS los controladores para usar nombres correctos
3. [ ] Buscar y reemplazar:
   - `prisma.asientoContable` → `prisma.asientoContable` (verificar que sea camelCase correcto)
   - Repetir para todos los modelos

### PASO 2: Aplicar Migración de Módulo de Pagos

**Acciones:**
1. [ ] Verificar conexión a Azure SQL:
   ```bash
   cd api
   npx prisma db pull
   ```
2. [ ] Aplicar migración:
   ```bash
   npx prisma db push
   ```
3. [ ] Verificar tablas se crearon:
   ```bash
   npx prisma studio
   # Verificar que existen las 24 tablas
   ```

### PASO 3: Arreglar Frontend Producción

**Acciones:**
1. [ ] Verificar vite.config.ts tiene plugin de copia
2. [ ] Rebuild frontend:
   ```bash
   cd app
   rm -rf dist/
   npm run build
   ls -la dist/staticwebapp.config.json  # DEBE existir
   ```
3. [ ] Commit y push:
   ```bash
   git add app/dist/staticwebapp.config.json
   git commit -m "fix: ensure staticwebapp.config.json in dist"
   git push
   ```
4. [ ] Esperar deployment en Azure (5-10 min)
5. [ ] Verificar https://erp.agribusiness.com.py

### PASO 4: Arreglar Frontend Desarrollo

**Acciones:**
1. [ ] Limpiar cache:
   ```bash
   cd app
   rm -rf node_modules/.vite dist/
   ```
2. [ ] Reinstalar:
   ```bash
   npm install
   ```
3. [ ] Iniciar dev:
   ```bash
   npm run dev
   ```
4. [ ] Abrir http://localhost:5173
5. [ ] Verificar que carga la app React

### PASO 5: Verificar Backend

**Acciones:**
1. [ ] Con schema arreglado, compilar:
   ```bash
   cd api
   npm run build
   ```
2. [ ] Iniciar backend:
   ```bash
   npm start
   ```
3. [ ] Verificar logs:
   ```
   ✅ Database connected successfully
   ✅ Server is running
   ```
4. [ ] Probar endpoint health:
   ```bash
   curl http://localhost:3001/health
   ```

### PASO 6: Pruebas End-to-End

**Acciones:**
1. [ ] Probar login
2. [ ] Crear un registro de prueba en cada módulo
3. [ ] Verificar que datos se guardan en BD
4. [ ] Verificar reportes funcionan

---

## 📋 COMANDOS RÁPIDOS DE DIAGNÓSTICO

### Backend
```bash
cd /Users/hansharder/Documents/GitHub/agribusiness-erp/api

# Ver si compila
npm run build

# Ver estado de BD
npx prisma db pull

# Ver datos
npx prisma studio

# Regenerar client
npx prisma generate

# Ver logs detallados
npm start 2>&1 | tee backend.log
```

### Frontend
```bash
cd /Users/hansharder/Documents/GitHub/agribusiness-erp/app

# Limpiar y rebuild
rm -rf dist/ node_modules/.vite && npm install && npm run build

# Ver si staticwebapp.config.json se copió
ls -la dist/staticwebapp.config.json

# Iniciar dev
npm run dev
```

### Base de Datos
```bash
cd /Users/hansharder/Documents/GitHub/agribusiness-erp/api

# Conexión
npx prisma db pull

# Aplicar cambios
npx prisma db push

# Ver diferencias
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma
```

---

## ✅ CRITERIOS DE ÉXITO

El sistema estará **ARREGLADO** cuando:

1. ✅ **Backend compila sin errores TypeScript**
   - `npm run build` completa exitosamente
   - 0 errores de tipos

2. ✅ **Backend inicia y permanece corriendo**
   - Muestra "✅ Database connected"
   - Muestra "✅ Server is running"
   - No se cierra automáticamente

3. ✅ **Base de datos tiene todas las tablas**
   - 24 tablas en total
   - Incluye las 11 del módulo de pagos

4. ✅ **Frontend desarrollo funciona**
   - `npm run dev` inicia sin errores
   - http://localhost:5173 carga la app React
   - Se pueden ver componentes

5. ✅ **Frontend producción funciona**
   - https://erp.agribusiness.com.py carga sin MIME errors
   - Aplicación React se muestra correctamente
   - No hay errores en consola del navegador

6. ✅ **Integración funciona**
   - Frontend puede comunicarse con backend
   - Se pueden crear/leer/actualizar datos
   - Los datos persisten en la base de datos

---

## 🔍 VERIFICACIÓN POST-ARREGLO

Ejecutar estos comandos para verificar todo está bien:

```bash
# 1. Backend compila
cd /Users/hansharder/Documents/GitHub/agribusiness-erp/api
npm run build
echo "✅ Backend compiló" || echo "❌ Backend NO compiló"

# 2. Prisma Client generado
npx prisma generate
echo "✅ Prisma Client generado"

# 3. Frontend compila
cd /Users/hansharder/Documents/GitHub/agribusiness-erp/app
npm run build
echo "✅ Frontend compiló" || echo "❌ Frontend NO compiló"

# 4. staticwebapp.config.json copiado
test -f dist/staticwebapp.config.json && echo "✅ Config copiado" || echo "❌ Config NO copiado"

# 5. Backend arranca
cd /Users/hansharder/Documents/GitHub/agribusiness-erp/api
timeout 5 npm start &
sleep 3
curl -s http://localhost:3001/health && echo "✅ Backend responde" || echo "❌ Backend NO responde"
```

---

**Próximos Pasos:**
1. Decidir enfoque para Prisma schema (PascalCase vs mantener @@map)
2. Ejecutar PASO 1 del plan de resolución
3. Continuar secuencialmente hasta que todo funcione

**Última actualización:** 23 Diciembre 2025
