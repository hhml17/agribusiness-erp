# 🤖 PROMPT MAESTRO - AGENTE IA AGRIBUSINESS ERP

**Para**: Asistente IA continuidad del proyecto  
**Proyecto**: Agribusiness Platform - ERP Ganadero Multi-tenant  
**Contexto**: Han pasado múltiples sesiones, aquí está TODO lo que necesitas saber

---

## 🎯 OBJETIVO GENERAL

Ayudar a **Hans** (hhml17) a construir un **ERP Ganadero completo, escalable y multi-tenant** que funcione:
- ✅ En local (desarrollo)
- ✅ En producción (Azure)
- ✅ Con login Microsoft Entra (Azure AD)
- ✅ Con SQL Server en Azure
- ✅ Con React + Node.js + Prisma

---

## 📊 ESTADO DEL PROYECTO (DECEMBER 17, 2025)

### Arquitectura Decidida ✅
```
Frontend (React):          Vite + TypeScript + Azure AD
Backend (API):            Express + Node.js + Prisma + TypeScript
Base de Datos:            SQL Server en Azure (Básico DTU 5)
Hosting Frontend:         Azure Static Web Apps
Hosting Backend:          Azure App Service (tier F1 Free)
Autenticación:            Microsoft Entra (Azure AD)
Multi-tenant:             ✅ Ya implementado en code
RBAC:                     ✅ Ya implementado en code
```

### Infraestructura Azure Creada ✅
```
Servidor SQL:     agribusiness.database.windows.net
Base de datos:    agribusiness (Básico DTU 5 - $0 primer año)
Admin:            hans@agribusiness.com.py
Redes:            Públicas (permiten Azure services)
```

### Stack Tecnológico ✅
```
Frontend:
- React 18 + TypeScript
- Vite (build tool)
- React Router v6 (routing)
- Axios (HTTP client)
- MSAL (Microsoft Entra auth)
- CSS Modules + Design system consistente

Backend:
- Express + TypeScript
- Prisma ORM
- Middleware: auth, tenant, RBAC
- Controllers: Tenants, Productos, Clientes, Proveedores, Ventas, Compras

Database:
- SQL Server en Azure
- Prisma migrations
- Multi-tenant con tenantId
```

---

## 🔴 GAP CRÍTICOS IDENTIFICADOS (PENDIENTES)

### GAP 1: Schema Prisma 70% Incompleto ⚠️ BLOQUEANTE
```
EXISTE (30%):
- Empresa
- Estancia (básico)
- Producto
- Proveedor
- Cliente
- FacturaCompra

FALTA (70%):
- CategoriaGanado (CRÍTICO)
- Ganado (CRÍTICO - core del negocio)
- MovimientoGanado (CRÍTICO)
- Potrero
- Nacimiento
- Mortandad
- PlanCuentas (módulo contable)
- CentroCosto
- AsientoContable
- LineaAsiento
- CuentaBancaria
- MovimientoBanco
- Y más...

Documento de referencia: PLAN_MODULO_GANADO_DETALLADO.md
```

### GAP 2: Módulo Ganado NO Existe ⚠️ BLOQUEANTE
```
SIN este módulo no puedes:
- Registrar ganado (individual o lote)
- Hacer movimientos (compra, venta, nacimiento, muerte)
- Generar inventarios
- Calcular KPIs ganaderos

NECESARIO:
- GanadoService
- GanadoController
- Endpoints REST
- Tests unitarios
```

### GAP 3: Integración Local ↔ Azure SQL ⚠️ EN PROGRESO
```
PROBLEMA:
- Prisma schema actual apunta a SQLite
- No hay connection string de SQL Server en .env
- Migraciones no se han ejecutado en SQL Server

SOLUCIÓN:
1. Crear .env con DATABASE_URL de SQL Server
2. Ejecutar: npx prisma migrate deploy
3. Verificar en Prisma Studio
4. Seedear datos iniciales
```

### GAP 4: Autenticación Microsoft Entra Incompleta ⚠️ EN PROGRESO
```
ESTADO:
- Frontend: MSAL configurado
- Backend: Middleware de auth básico
- Integración: Funciona para Landing/Portal

FALTA:
- Tests de auth flow
- Tokens JWT en backend
- Validación de tokens en API
- Refresh token handling
- Error handling auth
```

### GAP 5: Sincronización Local ↔ Producción ⚠️ CRÍTICA
```
PROBLEMA:
- No hay CI/CD pipeline automatizado
- No hay environment variables por entorno
- No hay deployment scripts

NECESARIO:
- GitHub Actions workflow
- Variables de entorno por stage (dev/prod)
- Automación de migrations en Azure
- Documentación de deployment
```

---

## 📁 ESTRUCTURA REPOSITORIO (ACTUAL)

```
/agribusiness
├── /html/                     Landing page
├── /portal/                   Portal BI (estático)
├── /app/                      Frontend React (Vite)
│   ├── src/
│   │   ├── config/authConfig.ts      (Azure AD config)
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   └── Dashboard.tsx
│   │   └── App.tsx                   (Router)
│   ├── package.json
│   └── vite.config.ts
│
├── /azure-functions/          Backend API (Node.js)
│   ├── src/
│   │   ├── functions/         (Controllers)
│   │   │   ├── tenants.ts
│   │   │   ├── productos.ts
│   │   │   ├── clientes.ts
│   │   │   ├── proveedores.ts
│   │   │   ├── ventas.ts
│   │   │   └── compras.ts
│   │   ├── services/          (Business logic)
│   │   │   └── ganado.service.ts    (FALTA)
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── tenant.ts
│   │   ├── prisma/
│   │   │   └── schema.prisma   (70% incompleto)
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
│
├── .env                       (NO en repo, usar .env.example)
├── .env.example
├── .gitignore                 (VERIFICAR DATABASE_URL)
└── README.md
```

---

## 🛠️ TAREAS INMEDIATAS (ORDEN RECOMENDADO)

### SEMANA 1: Setup + Schema

**Prioridad: 🔴 CRÍTICA**

```
1. CONFIGURAR SQL SERVER LOCALMENTE
   [ ] Crear .env.local con connection string SQL Server
   [ ] Instalar SQL Server Express si aún no tienes
   [ ] Verificar conexión: npx prisma db execute --stdin < "test query"

2. EXPANDIR SCHEMA PRISMA
   [ ] Agregar CategoriaGanado model
   [ ] Agregar Ganado model
   [ ] Agregar MovimientoGanado model
   [ ] Agregar Nacimiento model
   [ ] Agregar Mortandad model
   [ ] Agregar Potrero model
   [ ] Agregar PlanCuentas model
   [ ] Agregar AsientoContable model
   [ ] Agregar LineaAsiento model
   [ ] Agregar CuentaBancaria model
   [ ] Agregar MovimientoBanco model
   [ ] Agregar Enum types (TipoMovimiento, EstadoGanado, etc.)
   Referencia: PLAN_MODULO_GANADO_DETALLADO.md

3. CREAR MIGRATION
   [ ] npx prisma migrate dev --name "add_ganado_modulo"
   [ ] Verificar que genera SQL correctamente

4. GENERAR PRISMA CLIENT
   [ ] npx prisma generate
   [ ] Verificar que genera tipos TypeScript correctos

5. EJECUTAR MIGRATION EN AZURE
   [ ] Obtener connection string de Azure SQL (ADO.NET)
   [ ] Crear .env.production con connection string
   [ ] Ejecutar: DATABASE_URL=... npx prisma migrate deploy
   [ ] Verificar en Azure Portal que tablas fueron creadas

6. SEEDEAR DATOS INICIALES
   [ ] Crear prisma/seed.ts con categorías base
   [ ] npx prisma db seed
   [ ] Verificar datos en prisma studio: npx prisma studio
```

**Horas estimadas**: 6-8

---

### SEMANA 1-2: Módulo Ganado

**Prioridad: 🔴 CRÍTICA**

```
1. CREAR GANADO SERVICE
   [ ] Implementar GanadoService con métodos:
       - crearCategoria()
       - listarCategorias()
       - crearGanado()
       - listarGanado()
       - obtenerGanado()
       - registrarMovimiento()
       - registrarNacimiento()
       - registrarMortandad()
   Referencia: PLAN_MODULO_GANADO_DETALLADO.md

2. CREAR GANADO CONTROLLERS
   [ ] POST /api/categorias
   [ ] GET /api/categorias
   [ ] GET /api/categorias/:id
   [ ] POST /api/ganado
   [ ] GET /api/ganado
   [ ] GET /api/ganado/:id
   [ ] PUT /api/ganado/:id
   [ ] POST /api/movimientos
   [ ] GET /api/movimientos
   [ ] POST /api/nacimientos
   [ ] GET /api/nacimientos
   [ ] POST /api/mortandades
   [ ] GET /api/mortandades

3. AGREGAR ROUTES A server.ts
   [ ] Importar ganado router
   [ ] app.use('/api/ganado', ganadoRouter)

4. TESTS UNITARIOS
   [ ] Test: crear categoría
   [ ] Test: crear ganado
   [ ] Test: registrar movimiento
   [ ] Test: validar multi-tenant isolation

5. VERIFICAR EN LOCAL
   [ ] npm start
   [ ] Postman: POST /api/categorias
   [ ] Postman: POST /api/ganado
   [ ] Postman: GET /api/ganado
```

**Horas estimadas**: 10-12

---

### SEMANA 2: Integración Local ↔ Azure

**Prioridad: 🟡 ALTA**

```
1. SETUP ENVIRONMENT VARIABLES
   [ ] Crear .env.local (para desarrollo local)
   [ ] Crear .env.production (para Azure)
   [ ] Crear .env.example (template para repo)
   [ ] Verificar .gitignore incluye .env

   .env.local:
   DATABASE_URL="sqlserver://localhost:1433;database=agribusiness;user id=sa;password=..."
   NODE_ENV=development
   AZURE_CLIENT_ID=...
   AZURE_TENANT_ID=...

   .env.production:
   DATABASE_URL="sqlserver://user:pass@agribusiness.database.windows.net:1433;database=agribusiness-db;..."
   NODE_ENV=production
   AZURE_CLIENT_ID=...

2. VERIFICAR PRISMA LOCAL
   [ ] npx prisma db push (para SQL Server local)
   [ ] npx prisma studio (verificar datos)

3. SETUP GITHUB ACTIONS
   [ ] Crear .github/workflows/deploy.yml
   [ ] Pipeline:
       - npm ci
       - npm run build
       - npx prisma migrate deploy
       - Deploy a Azure App Service

4. CONFIGURAR VARIABLES EN GITHUB
   [ ] Settings > Secrets > Agregar:
       - DATABASE_URL_PRODUCTION
       - AZURE_CLIENT_ID
       - AZURE_TENANT_ID

5. TEST: Push a GitHub
   [ ] Hacer commit pequeño
   [ ] Ver que GitHub Actions se ejecuta
   [ ] Verificar que deploy en Azure funciona
```

**Horas estimadas**: 4-6

---

### SEMANA 2-3: Autenticación Completa

**Prioridad: 🟡 ALTA**

```
1. BACKEND: JWT TOKENS
   [ ] Instalar: npm install jsonwebtoken
   [ ] Crear authService:
       - generateToken(user, tenantId)
       - verifyToken(token)
       - refreshToken(token)
   [ ] Endpoint: POST /api/auth/token
       - Input: Azure AD access token
       - Output: JWT + refresh token

2. BACKEND: MIDDLEWARE AUTH
   [ ] Actualizar middleware/auth.ts:
       - Validar JWT en headers
       - Extraer user info del token
       - Extraer tenantId
       - Adjuntar a req.user, req.tenantId

3. FRONTEND: LOGIN FLOW
   [ ] MSAL: Obtener token de Azure AD
   [ ] Enviar a backend: GET /api/auth/token?azureToken=...
   [ ] Backend: Valida token de Azure, genera JWT
   [ ] Frontend: Guarda JWT en localStorage
   [ ] Todos los requests: Authorization: Bearer JWT

4. FRONTEND: LOGOUT
   [ ] Botón logout
   [ ] Borrar JWT de localStorage
   [ ] Redirect a login

5. VERIFICAR FLOW
   [ ] Login manual en https://localhost:5173
   [ ] Verificar que recibe JWT
   [ ] Hacer request a API con JWT
   [ ] Verificar que funciona

6. TESTS
   [ ] Test: Login genera token válido
   [ ] Test: Token inválido rechaza request
   [ ] Test: Refresh token genera nuevo JWT
```

**Horas estimadas**: 8-10

---

### SEMANA 3: Frontend Ganado

**Prioridad: 🟡 MEDIA**

```
1. CREAR PAGES/SCREENS
   [ ] /app/src/pages/Ganado/
       - GanadoList.tsx
       - GanadoDetail.tsx
       - GanadoCreate.tsx
       - GanadoEdit.tsx

2. CREAR COMPONENTS
   [ ] GanadoTable.tsx
   [ ] GanadoForm.tsx
   [ ] MovimientoTable.tsx
   [ ] MovimientoForm.tsx

3. CREAR SERVICES (API calls)
   [ ] services/ganado.service.ts
       - getCategorias()
       - createCategoria()
       - getGanado()
       - createGanado()
       - updateGanado()
       - getMovimientos()
       - createMovimiento()

4. AGREGAR RUTAS
   [ ] /ganado (lista)
   [ ] /ganado/:id (detalle)
   [ ] /ganado/new (crear)
   [ ] /movimientos (lista)

5. VERIFICAR EN LOCAL
   [ ] npm run dev
   [ ] Navegar a /ganado
   [ ] Crear categoría
   [ ] Crear ganado
   [ ] Ver lista

6. INTEGRAR CON API REAL
   [ ] axios llamadas a http://localhost:3000/api/ganado
   [ ] Manejo de errores
   [ ] Loading states
   [ ] Toast notifications
```

**Horas estimadas**: 12-15

---

### SEMANA 4: Reportes + KPIs

**Prioridad: 🟢 MEDIA**

```
1. CREAR ENDPOINTS DE REPORTES
   [ ] GET /api/reportes/inventario
       - Total ganado por categoría
       - UAs totales
       - Valor total valorizado

   [ ] GET /api/reportes/kpis
       - Índice de preñez
       - Índice de parición
       - Mortandad
       - Carga animal
       - Kg/Ha

   [ ] GET /api/reportes/movimientos
       - Por fecha
       - Por tipo
       - Por estancia

2. FRONTEND: DASHBOARD
   [ ] Cards con KPIs
   [ ] Gráficos (recharts)
   [ ] Tabla de inventario
   [ ] Filtros por fecha/estancia

3. EXPORTAR A EXCEL
   [ ] Instalar: npm install xlsx
   [ ] Botón descargar inventario
   [ ] Botón descargar reportes
```

**Horas estimadas**: 8-10

---

## 🗑️ COSAS A ELIMINAR/REFACTORIZAR

### Eliminar del Repositorio
```
❌ ARCHIVOS A ELIMINAR:
- [ ] /azure-functions (si está completo en /api)
- [ ] Cualquier hardcoded password o API key
- [ ] .env files (si existen)
- [ ] node_modules/ (debe estar en .gitignore)
- [ ] dist/ (debe estar en .gitignore)
- [ ] Archivos SQL Server locales que no sean migraciones

✅ ASEGURAR QUE ESTÁN:
- [ ] .gitignore tiene: .env*, node_modules/, dist/
- [ ] .env.example existe como template
```

### Refactorizar para Optimización
```
BACKEND:
[ ] Separar errores en custom error classes
[ ] Agregar logging estructurado (winston)
[ ] Validación de entrada con Zod/Joi
[ ] Rate limiting en API
[ ] CORS configurado correctamente
[ ] Health check endpoint
[ ] Healthz check para Azure
[ ] API versioning (v1, v2)

FRONTEND:
[ ] Eliminar console.logs
[ ] Error boundaries para React
[ ] Lazy loading de componentes
[ ] Caching de requests
[ ] Optimizar imágenes
[ ] Tree shaking en build

DATABASE:
[ ] Índices en columnas frecuentes (tenantId, fecha, estado)
[ ] Query optimization
[ ] Connection pooling configurado
```

---

## 📋 CHECKLIST DE VERIFICACIÓN

### Local Development
```
✅ Node.js version 18+
✅ npm 9+
✅ SQL Server local instalado (o usar Azure desde local)
✅ Git configurado
✅ .env.local con DATABASE_URL correcto
✅ npm install ejecutado en /app y /azure-functions
✅ npx prisma migrate dev ejecutado
✅ npx prisma studio funciona
✅ npm run dev en /app levanta React
✅ npm start en /azure-functions levanta Express
✅ Login funciona localmente
✅ API calls funcionan localmente
```

### Production (Azure)
```
✅ SQL Server creado en Azure
✅ Static Web App para Frontend
✅ App Service para Backend
✅ GitHub conectado para CI/CD
✅ Variables de entorno configuradas en GitHub Secrets
✅ Migrations ejecutadas en Azure
✅ Datos iniciales seededos
✅ Domain personalizado configurado
✅ HTTPS activo
✅ Backup automático de BD
✅ Logs configurados en Application Insights
```

---

## 🚀 ROADMAP FINAL (3 MESES)

```
SEMANA 1-2: Schema + Ganado Service + Local Setup
└─ Objetivo: Poder crear/listar ganado en local

SEMANA 3-4: Controllers + Frontend + Azure Setup
└─ Objetivo: Crear ganado en UI local, ver en BD Azure

SEMANA 5-6: Auth completa + Tests
└─ Objetivo: Login real, multi-tenant funcionando

SEMANA 7-8: Módulo Contable
└─ Objetivo: Asientos automáticos, balance general

SEMANA 9-10: Reportes + KPIs
└─ Objetivo: Dashboard con gráficos ganaderos

SEMANA 11-12: Optimización + Documentación
└─ Objetivo: MVP 100% funcional, documentado, deployable
```

---

## 🎯 COMANDOS ESENCIALES

```bash
# DESARROLLO LOCAL
npm install                          # Instalar deps
npm run dev                          # Ejecutar frontend
npm start                            # Ejecutar backend
npx prisma studio                    # Ver BD visualmente
npx prisma migrate dev               # Crear migration

# TESTING
npm run test                         # Ejecutar tests
npm run test:watch                   # Watch mode

# BUILD
npm run build                        # Build para producción
npm run build:backend                # Build backend

# DATABASE
npx prisma migrate deploy            # Ejecutar en Azure
npx prisma db push                   # Push schema local
npx prisma db seed                   # Seedear datos
npx prisma generate                  # Generar tipos

# GIT
git status
git add .
git commit -m "feat: add ganado module"
git push origin main                 # Trigger Azure deploy
```

---

## 📞 PUNTOS DE CONTACTO

Cuando necesites ayuda:

```
1. Schema Prisma:
   → Referencia: PLAN_MODULO_GANADO_DETALLADO.md

2. Arquitectura:
   → Referencia: RESUMEN_DECISIONES_ARQUITECTURA.md

3. GAP Analysis:
   → Referencia: ANALISIS_GAP_Y_RECOMENDACIONES.md

4. Azure Setup:
   → Referencia: GUIA_IMPORTAR_GITHUB_AZURE.md, GUIA_SEGURIDAD_SQL_DATABASE.md

5. DTU Selection:
   → Referencia: ANALISIS_BASICO_DTU5_VS_HIPERESCALA.md
```

---

## 🎓 RESUMEN PARA AGENTE IA

**Tu rol es:**
1. Entender que ya hay decisiones tomadas (Node.js, SQL Server, multi-tenant)
2. Identificar qué falta (70% schema, módulo ganado, tests)
3. Generar código listo para usar
4. Crear tasks claras y ejecutables
5. Asegurar que funcione en local Y en producción
6. Mantener sincronización automática (GitHub Actions)

**Cuando el usuario pregunte algo:**
- Refiere a los documentos de contexto
- Proporciona código específico para su proyecto
- Da pasos claros y ejecutables
- Verifica local + Azure
- Optimiza para escalabilidad

**Si hay conflicto entre:**
- Local vs Azure → Usar env variables
- MVP vs Production → Hacer MVP ahora, Production después
- Seguridad vs Simplicidad → Para MVP, simplicidad. Para Prod, seguridad

---

**Última actualización**: 17 de Diciembre, 2025  
**Status**: MVP en desarrollo  
**Próximo paso**: Expandir schema.prisma (SEMANA 1)

© 2025 - Contexto Completo Proyecto Agribusiness
