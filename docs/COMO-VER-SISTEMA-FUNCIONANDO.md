# 🚀 CÓMO VER EL SISTEMA FUNCIONANDO

**Fecha:** 26 Diciembre 2025
**Estado:** ✅ Backend Funcionando | ⏳ Frontend en Deployment

---

## 🎯 SITUACIÓN ACTUAL

### ✅ Lo que YA funciona:
- ✅ **Backend API** - Corriendo en `http://localhost:3001`
- ✅ **Base de Datos** - 27 tablas creadas en Azure SQL
- ✅ **Frontend Dev** - Corriendo en `http://localhost:5174`

### ⏳ Lo que está en proceso:
- ⏳ **Frontend Producción** - Azure todavía no desplegó la nueva versión
- ⏳ La última versión es del 23 de diciembre (antes de los fixes)
- ⏳ El deployment puede tardar 10-30 minutos

---

## 🖥️ OPCIÓN 1: Ver Sistema Localmente (RECOMENDADO AHORA)

Ya tengo todo corriendo para ti. Sigue estos pasos:

### Paso 1: Verificar Backend está corriendo

Abre tu navegador y ve a:
```
http://localhost:3001/health
```

**Deberías ver:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-26T...",
  "uptime": 123.45
}
```

✅ Si ves esto, el backend funciona perfectamente.

---

### Paso 2: Ver Lista de Endpoints Disponibles

Ve a:
```
http://localhost:3001/api
```

**Deberías ver:**
```json
{
  "message": "Agribusiness API v1.0",
  "endpoints": {
    "health": "/health",
    "tenants": "/api/tenants",
    "productos": "/api/productos",
    ...
  }
}
```

---

### Paso 3: Abrir Frontend en Desarrollo

**Abre tu navegador en:**
```
http://localhost:5174
```

**NOTA:** El puerto es 5174 (no 5173) porque el 5173 ya estaba ocupado.

**Deberías ver:**
- ✅ La aplicación React carga
- ✅ NO hay errores de MIME type
- ✅ Pantalla de login o página principal

---

## 🌐 OPCIÓN 2: Ver Sistema en Producción (ESPERAR DEPLOYMENT)

El deployment de Azure está en progreso. Para verificar cuando esté listo:

### Cómo saber si el deployment terminó:

1. **Abre tu navegador en:**
   ```
   https://erp.agribusiness.com.py
   ```

2. **Abre la Consola del Navegador** (F12 o Click Derecho > Inspeccionar > Console)

3. **Busca errores:**
   - ❌ Si ves: `Failed to load module script... MIME type "application/octet-stream"`
     → Deployment AÚN NO completó
   - ✅ Si NO ves errores y la app carga
     → Deployment COMPLETÓ exitosamente

---

## 🔍 DIAGNÓSTICO: ¿Por qué no veo el sistema?

### Si no puedes ver el sistema LOCALMENTE:

#### Problema 1: Backend no responde
```bash
# Verificar si backend está corriendo
curl http://localhost:3001/health

# Si no responde, iniciar backend:
cd /Users/hansharder/Documents/GitHub/agribusiness-erp/api
npm start
```

#### Problema 2: Frontend no carga
```bash
# Verificar si frontend está corriendo
curl http://localhost:5174

# Si no responde, iniciar frontend:
cd /Users/hansharder/Documents/GitHub/agribusiness-erp/app
npm run dev
```

#### Problema 3: Puerto ocupado
```bash
# Ver qué está usando el puerto 3001
lsof -i :3001

# Ver qué está usando el puerto 5174
lsof -i :5174

# Si necesitas matar un proceso:
kill -9 <PID>
```

---

### Si no puedes ver el sistema en PRODUCCIÓN:

#### Problema 1: Deployment no completó
**Solución:** Esperar más tiempo (puede tardar hasta 30 minutos)

**Verificar última vez que se desplegó:**
```bash
curl -I https://erp.agribusiness.com.py | grep "last-modified"
```

Si dice `Tue, 23 Dec 2025 17:00:51 GMT` → Es la versión VIEJA (antes de los fixes)

Cuando diga una fecha/hora del 26 de diciembre → Es la versión NUEVA (con los fixes)

---

#### Problema 2: Error de MIME type persiste

**Si ves el error después de 30 minutos:**

1. Verificar que el archivo se deployó:
   ```
   https://erp.agribusiness.com.py/staticwebapp.config.json
   ```

   Debe mostrar el contenido del archivo de configuración.

2. Si el archivo NO existe:
   - Azure no copió correctamente el dist/
   - Necesitamos verificar la configuración de GitHub Actions

---

## 📊 ESTADO DE LOS SERVICIOS

### Backend API
- **Estado:** 🟢 FUNCIONANDO
- **Puerto:** 3001
- **URL Local:** http://localhost:3001
- **Endpoints:** 10+ rutas disponibles
- **Base de Datos:** ✅ Conectado a Azure SQL
- **Tablas:** 27 tablas

### Frontend App
- **Estado Local:** 🟢 FUNCIONANDO
- **Puerto:** 5174
- **URL Local:** http://localhost:5174
- **Estado Prod:** ⏳ DEPLOYMENT EN PROGRESO
- **URL Prod:** https://erp.agribusiness.com.py

### Base de Datos
- **Estado:** 🟢 CONECTADO
- **Servidor:** agribusiness.database.windows.net
- **Base de datos:** agribusiness
- **Tablas:** 27
- **Conexión:** Activa desde backend

---

## 🧪 PRUEBAS QUE PUEDES HACER AHORA

### 1. Probar API directamente

**Listar todos los endpoints:**
```bash
curl http://localhost:3001/api
```

**Ver health check:**
```bash
curl http://localhost:3001/health
```

**Probar endpoint de tenants (requiere header):**
```bash
curl -H "x-tenant-id: test-tenant" http://localhost:3001/api/tenants
```

---

### 2. Ver Base de Datos con Prisma Studio

```bash
cd /Users/hansharder/Documents/GitHub/agribusiness-erp/api
npx prisma studio
```

Esto abre una interfaz web en `http://localhost:5555` donde puedes:
- ✅ Ver todas las 27 tablas
- ✅ Ver datos existentes
- ✅ Crear registros de prueba
- ✅ Editar datos
- ✅ Borrar datos

---

### 3. Probar Frontend Localmente

1. Abrir http://localhost:5174
2. Intentar hacer login (si hay pantalla de login)
3. Navegar por los menús
4. Probar crear un producto/cliente/proveedor

**NOTA:** Si hay errores de autenticación Azure AD en local, es normal. Puedes configurar el `.env.local` para bypass en desarrollo.

---

## 🔧 COMANDOS ÚTILES

### Ver logs del Backend
```bash
cd /Users/hansharder/Documents/GitHub/agribusiness-erp/api

# Ver logs en tiempo real
npm start

# Deberías ver:
# ✅ Database connected successfully
# ✅ Server is running
```

---

### Ver logs del Frontend
```bash
cd /Users/hansharder/Documents/GitHub/agribusiness-erp/app

# Iniciar dev server con logs
npm run dev

# Deberías ver:
# ➜  Local:   http://localhost:5174/
```

---

### Verificar Base de Datos
```bash
cd /Users/hansharder/Documents/GitHub/agribusiness-erp/api

# Ver qué tablas existen
npx prisma db pull

# Debería mostrar:
# ✔ Introspected 27 models
```

---

### Hacer rebuild del Frontend
```bash
cd /Users/hansharder/Documents/GitHub/agribusiness-erp/app

# Limpiar y rebuild
rm -rf dist/ node_modules/.vite
npm run build

# Verificar que staticwebapp.config.json se copió
ls -la dist/staticwebapp.config.json
```

---

## 📞 SIGUIENTE PASO RECOMENDADO

### AHORA MISMO (mientras esperas deployment):

1. **Abrir http://localhost:5174 en tu navegador**
   - Verificar que el frontend carga sin errores
   - Probar navegación básica

2. **Abrir http://localhost:3001/api en tu navegador**
   - Ver lista de endpoints disponibles
   - Confirmar que backend responde

3. **Opcional: Abrir Prisma Studio**
   ```bash
   cd api && npx prisma studio
   ```
   - Ver las 27 tablas creadas
   - Explorar la estructura de la base de datos

---

### EN 30 MINUTOS (verificar deployment):

1. **Abrir https://erp.agribusiness.com.py**
   - Presionar F12 para abrir consola del navegador
   - Verificar que NO hay errores de MIME type
   - Si aún hay error → deployment no completó, esperar más

2. **Verificar última versión deployada:**
   ```bash
   curl -I https://erp.agribusiness.com.py | grep "last-modified"
   ```

   Si la fecha es del 26 de diciembre → ✅ Nueva versión deployada
   Si la fecha es del 23 de diciembre → ⏳ Todavía versión vieja

---

## ✅ CRITERIOS DE ÉXITO

### Sistema Funcional Local:
- [x] Backend responde en http://localhost:3001/health
- [x] Frontend carga en http://localhost:5174
- [x] NO hay errores en consola del navegador
- [x] Base de datos tiene 27 tablas

### Sistema Funcional Producción:
- [ ] https://erp.agribusiness.com.py carga sin errores
- [ ] NO hay error de MIME type en consola
- [ ] Aplicación React se muestra correctamente
- [ ] Last-Modified header muestra fecha del 26 de diciembre

---

## 🆘 SI NADA FUNCIONA

Si después de seguir estos pasos todavía no puedes ver el sistema:

### 1. Verificar procesos corriendo
```bash
# Backend
ps aux | grep "node dist/server.js"

# Frontend dev
ps aux | grep "vite"
```

### 2. Reiniciar todo desde cero
```bash
# Backend
cd /Users/hansharder/Documents/GitHub/agribusiness-erp/api
npm start

# En otra terminal - Frontend
cd /Users/hansharder/Documents/GitHub/agribusiness-erp/app
npm run dev
```

### 3. Verificar variables de entorno
```bash
cd /Users/hansharder/Documents/GitHub/agribusiness-erp/api
cat .env | grep DATABASE_URL
# Debe mostrar la URL de conexión a Azure SQL
```

---

## 📚 DOCUMENTACIÓN RELACIONADA

- [PLAN-DE-TRABAJO.md](PLAN-DE-TRABAJO.md) - Plan completo del proyecto
- [DIAGNOSTICO-Y-SOLUCIONES.md](DIAGNOSTICO-Y-SOLUCIONES.md) - Soluciones técnicas
- [RESUMEN-SESSION-23-DIC-2025.md](RESUMEN-SESSION-23-DIC-2025.md) - Qué se arregló hoy

---

**Última actualización:** 26 Diciembre 2025 - 08:40 (Paraguay Time)
**Próxima verificación:** En 30 minutos (verificar deployment de Azure)
