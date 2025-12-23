# 📋 PLAN DE TRABAJO - Agribusiness ERP

**Fecha:** 23 de Diciembre 2025
**Estado del Sistema:** 🔴 NO FUNCIONAL
**Prioridad:** CRÍTICA

---

## 🚨 PROBLEMAS ACTUALES

### 1. Frontend en Producción (erp.agribusiness.com.py)
**Error:** `Failed to load module script: Expected a JavaScript module but server responded with MIME type "application/octet-stream"`

**Diagnóstico:**
- Azure Static Web Apps no está sirviendo correctamente los archivos JavaScript
- El archivo `staticwebapp.config.json` está correctamente configurado en el código
- **PROBLEMA:** No se copió al directorio `dist/` durante el último build
- La configuración de MIME types no se está aplicando

**Solución:**
1. Verificar que `vite.config.ts` tiene el plugin de copia
2. Hacer rebuild completo del frontend
3. Verificar que `staticwebapp.config.json` se copie a `dist/`
4. Hacer commit y push para trigger deploy en Azure

### 2. Frontend en Desarrollo (localhost)
**Estado:** Muestra HTML pero no carga la aplicación React

**Diagnóstico:**
- El servidor de desarrollo Vite está corriendo
- Los módulos no se están cargando correctamente
- Posible problema con rutas de archivos o configuración de Vite

**Solución:**
1. Limpiar cache de Vite: `rm -rf node_modules/.vite`
2. Reinstalar dependencias: `npm install`
3. Verificar que no hay errores de TypeScript bloqueantes
4. Iniciar dev server: `npm run dev`

### 3. Backend (API)
**Estado:** Inicia pero se cierra inmediatamente

**Diagnóstico:**
- El servidor compila y arranca (muestra "Server is running")
- Se cierra justo después sin error visible
- **Posibles causas:**
  - Error en conexión a base de datos
  - Prisma Client no está generado correctamente
  - Falta alguna variable de entorno crítica

**Solución:**
1. Verificar conexión a Azure SQL
2. Regenerar Prisma Client
3. Verificar variables de entorno en `.env`
4. Agregar más logging para ver dónde falla

### 4. Base de Datos
**Estado:** ⚠️ Parcialmente configurada

**Diagnóstico:**
- Conexión a Azure SQL está configurada
- Solo existen 13 tablas base (no incluye módulo de pagos)
- Faltan 11 tablas del módulo de pagos
- Schema en Prisma tiene 24 modelos pero BD solo tiene 13 tablas

**Solución:**
1. Aplicar migración pendiente para crear las 11 tablas faltantes
2. Verificar que todas las tablas se crearon correctamente
3. Crear datos seed de ejemplo

### 5. Documentación
**Estado:** ⚠️ Desorganizada - Demasiados archivos

**Archivos actuales:**
```
Raíz:
- CHANGELOG-PAGOS.md
- DEPLOYMENT.md
- ESTADO-BASE-DATOS.md
- README.md

/docs:
- BRAVE_BROWSER_CONFIGURATION.md
- CHECKLIST_CONFIGURACION_MANUAL.md
- CONFIGURACION_AZURE_STATIC_WEB_APP.md
- DIAGRAMAS-MODULO-PAGOS.md
- EJEMPLOS-API-PAGOS.md
- EXPLICACION_ARQUITECTURA_AZURE.md
- FIX_MIME_TYPE_ERROR.md
- INSTRUCCIONES_DEPLOY_RAPIDO.md
- INSTRUCCIONES_FINALES_CONFIGURACION.md
- MODULO-PAGOS.md
- RESUMEN_ACTUALIZACION_18_DIC_2025.md
- TROUBLESHOOTING_ERR_BLOCKED_BY_CLIENT.md
- /Plan (subdirectorio)
- /Sesiones (subdirectorio)
```

**Problema:** Información duplicada, documentos obsoletos, difícil de navegar

---

## 🎯 PLAN DE ACCIÓN - PRIORIDADES

### FASE 1: ESTABILIZACIÓN DEL SISTEMA (CRÍTICO)
**Objetivo:** Hacer que el sistema vuelva a funcionar
**Tiempo estimado:** Inmediato

#### Tarea 1.1: Arreglar Backend
- [ ] Verificar y corregir conexión a base de datos
- [ ] Regenerar Prisma Client
- [ ] Agregar logging detallado para diagnosticar cierre
- [ ] Probar conexión a Azure SQL
- [ ] Confirmar que el servidor se mantiene corriendo

#### Tarea 1.2: Aplicar Migración de Base de Datos
- [ ] Ejecutar migración para crear 11 tablas del módulo de pagos
- [ ] Verificar que todas las tablas se crearon
- [ ] Regenerar Prisma Client con nuevas tablas
- [ ] Probar queries básicos

#### Tarea 1.3: Arreglar Frontend Desarrollo
- [ ] Limpiar cache de Vite
- [ ] Verificar configuración de vite.config.ts
- [ ] Corregir errores de TypeScript si existen
- [ ] Confirmar que la app carga en localhost

#### Tarea 1.4: Arreglar Frontend Producción
- [ ] Verificar que plugin de copia está en vite.config.ts
- [ ] Hacer build completo: `npm run build`
- [ ] Confirmar que staticwebapp.config.json está en dist/
- [ ] Commit y push cambios
- [ ] Esperar deployment de Azure
- [ ] Verificar que https://erp.agribusiness.com.py funciona

### FASE 2: ORGANIZACIÓN Y DOCUMENTACIÓN
**Objetivo:** Consolidar y organizar documentación
**Tiempo estimado:** Después de estabilizar

#### Tarea 2.1: Consolidar Documentación
Crear estructura nueva:
```
/docs
  /00-INICIO
    - README.md (Punto de entrada principal)
    - ARQUITECTURA.md (Consolidar EXPLICACION_ARQUITECTURA_AZURE.md)

  /01-SETUP
    - INSTALACION.md (Guía paso a paso)
    - CONFIGURACION-AZURE.md (Consolidar docs de Azure)
    - VARIABLES-ENTORNO.md

  /02-DESARROLLO
    - GUIA-DESARROLLO.md
    - ESTRUCTURA-PROYECTO.md
    - MIGRACIONES-BD.md

  /03-MODULOS
    - MODULO-CONTABILIDAD.md
    - MODULO-PAGOS.md (Consolidar 3 docs de pagos)
    - MODULO-INVENTARIO.md
    - MODULO-GANADO.md

  /04-DEPLOYMENT
    - DEPLOYMENT.md (Mantener y mejorar)
    - TROUBLESHOOTING.md (Consolidar todos los FIX y TROUBLE docs)

  /05-API
    - API-REFERENCE.md (Consolidar EJEMPLOS-API-PAGOS.md)
    - DIAGRAMAS.md (Consolidar diagramas)

  /archive
    - (Mover docs obsoletos aquí)
```

#### Tarea 2.2: Eliminar Duplicados
- [ ] Identificar información duplicada
- [ ] Consolidar en un solo documento
- [ ] Mover docs obsoletos a /archive

### FASE 3: VALIDACIÓN Y TESTING
**Objetivo:** Asegurar que todo funciona correctamente
**Tiempo estimado:** Después de estabilizar y organizar

#### Tarea 3.1: Testing Backend
- [ ] Probar todos los endpoints existentes
- [ ] Verificar multi-tenancy funciona
- [ ] Probar CRUD de cada módulo
- [ ] Verificar logging y errores

#### Tarea 3.2: Testing Frontend
- [ ] Verificar login funciona
- [ ] Probar navegación entre módulos
- [ ] Verificar que formularios funcionan
- [ ] Probar en diferentes navegadores

#### Tarea 3.3: Testing Integración
- [ ] Verificar flujo completo de datos
- [ ] Probar workflow de órdenes de compra
- [ ] Probar workflow de facturas y pagos
- [ ] Verificar reportes contables

### FASE 4: DATOS SEED Y DEMO
**Objetivo:** Tener datos de ejemplo para pruebas
**Tiempo estimado:** Después de validación

#### Tarea 4.1: Crear Script de Seed
- [ ] Crear tenant de ejemplo
- [ ] Crear usuarios de prueba
- [ ] Crear productos de ejemplo
- [ ] Crear clientes y proveedores
- [ ] Crear cuentas bancarias
- [ ] Crear plan de cuentas básico

#### Tarea 4.2: Datos de Workflow
- [ ] Crear órdenes de compra de ejemplo
- [ ] Crear facturas de ejemplo
- [ ] Crear órdenes de pago de ejemplo
- [ ] Crear asientos contables de ejemplo

---

## 📊 ESTADO DE MÓDULOS

### ✅ Módulos Implementados (Backend)
1. **Core/Tenants** - Multi-tenancy
2. **Inventario** - Productos
3. **Clientes** - Gestión de clientes
4. **Proveedores** - Gestión de proveedores
5. **Ventas** - Ventas y facturación
6. **Compras** - Compras básicas
7. **Contabilidad** - Plan de cuentas, centros de costo, asientos
8. **Ganado** - Gestión de ganado
9. **Pagos** - Órdenes de compra, facturas, órdenes de pago, cuentas bancarias *(código listo, falta crear tablas en BD)*

### ⚠️ Módulos Parciales (Frontend)
- La mayoría de módulos tienen componentes básicos
- Falta integración completa con backend
- Falta implementar módulo de pagos en frontend

### ❌ Pendientes
- Módulo de Reportes avanzados
- Módulo de Dashboard con gráficos
- Módulo de Usuarios y permisos
- Conciliación bancaria completa

---

## 🔧 CONFIGURACIÓN ACTUAL

### Backend (API)
- **Puerto:** 3001
- **Framework:** Express + TypeScript
- **ORM:** Prisma
- **Base de datos:** Azure SQL Server
- **Servidor:** agribusiness.database.windows.net
- **Base de datos:** agribusiness

### Frontend (App)
- **Framework:** React 18 + TypeScript
- **Build:** Vite
- **Router:** React Router v6
- **UI:** Material-UI (MUI)
- **Hosting:** Azure Static Web Apps
- **URL Producción:** https://erp.agribusiness.com.py
- **URL Dev:** http://localhost:5173

### Base de Datos
- **Proveedor:** Azure SQL Server
- **Versión:** 12.0
- **Ubicación:** Brazil South
- **Administrador:** agribusiness
- **Autenticación:** SQL + Azure AD
- **Acceso público:** Habilitado
- **TLS:** 1.2 mínimo

---

## 📋 CHECKLIST INMEDIATO (SIGUIENTE PASO)

### 🔴 CRÍTICO - Hacer AHORA
1. [ ] **Diagnosticar por qué el backend se cierra**
   - Agregar try-catch y logging detallado
   - Verificar conexión a BD
   - Ver si Prisma Client funciona

2. [ ] **Aplicar migración de base de datos**
   - Crear las 11 tablas faltantes del módulo de pagos
   - Verificar que se crearon correctamente

3. [ ] **Arreglar build del frontend**
   - Verificar que staticwebapp.config.json se copia
   - Hacer build y deploy

4. [ ] **Probar sistema completo**
   - Backend responde en puerto 3001
   - Frontend carga en producción
   - Conexión BD funciona

### 🟡 IMPORTANTE - Hacer después de crítico
5. [ ] **Consolidar documentación**
   - Crear estructura nueva en /docs
   - Mover archivos a categorías
   - Eliminar duplicados

6. [ ] **Crear datos seed**
   - Script para poblar BD con ejemplos
   - Facilitar testing y demos

---

## 🎓 NOTAS TÉCNICAS

### Conexión a Base de Datos
```bash
# Variables de entorno necesarias
DATABASE_URL="sqlserver://agribusiness.database.windows.net:1433;database=agribusiness;user=agribusiness;password=XXX;encrypt=true;trustServerCertificate=false"
SHADOW_DATABASE_URL="sqlserver://agribusiness.database.windows.net:1433;database=agribusiness_shadow;user=agribusiness;password=XXX;encrypt=true"
```

### Comandos Útiles
```bash
# Backend
cd api
npm run build        # Compilar TypeScript
npm start            # Iniciar servidor
npx prisma generate  # Regenerar Prisma Client
npx prisma db push   # Aplicar cambios de schema a BD

# Frontend
cd app
npm run dev          # Desarrollo
npm run build        # Build producción
npm run preview      # Preview build local

# Base de datos
cd api
npx prisma studio    # UI para ver datos
npx prisma db pull   # Traer schema desde BD
npx prisma migrate dev  # Crear migración
```

---

## 📞 CONTACTO Y SOPORTE

**Servidor Azure SQL:**
- Host: agribusiness.database.windows.net
- Admin: agribusiness
- Azure AD: hans@agribusiness.com.py

**GitHub Repository:**
- /Users/hansharder/Documents/GitHub/agribusiness-erp

---

## ✅ CRITERIOS DE ÉXITO

El sistema estará **FUNCIONAL** cuando:
1. ✅ Backend inicia y se mantiene corriendo sin cerrarse
2. ✅ Frontend carga correctamente en https://erp.agribusiness.com.py
3. ✅ Frontend carga correctamente en localhost
4. ✅ Base de datos tiene las 24 tablas (13 existentes + 11 nuevas)
5. ✅ Se puede hacer login y navegar
6. ✅ Se puede crear/leer/actualizar/eliminar registros básicos
7. ✅ Documentación está organizada y es fácil de navegar

---

**Última actualización:** 23 Diciembre 2025
**Próxima revisión:** Después de completar Fase 1
