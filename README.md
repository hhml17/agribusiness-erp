# Agribusiness ERP - Sistema de Gestión Ganadera Multi-tenant

Sistema ERP completo para gestión de establecimientos ganaderos con módulos de contabilidad, inventario, ventas, compras y gestión de ganado.

## Información del Proyecto

- **Repositorio:** https://github.com/hhml17/agribusiness-erp
- **URL Producción:** https://erp.agribusiness.com.py
- **URL Temporal:** https://thankful-ground-083e4cb10.3.azurestaticapps.net
- **Usuario:** Hans (hhml17)
- **Email:** hans@agribusiness.com.py

## Stack Tecnológico

### Frontend
- React 18 + TypeScript
- Vite (Build tool)
- MSAL (Microsoft Authentication Library)
- Axios (HTTP client)
- React Router (Routing)

### Backend
- Node.js + Express
- Prisma ORM
- TypeScript
- JWT Authentication

### Base de Datos
- Azure SQL Server (Brazil South)
- Server: `agribusiness.database.windows.net`
- Database: `agribusiness`
- Tier: Básico DTU 5

### Infraestructura
- Azure Static Web Apps (Frontend)
- Azure App Service (Backend - por desplegar)
- Microsoft Entra ID (Authentication)
- GitHub Actions (CI/CD)

## Arquitectura

### Multi-tenant
- Cada establecimiento es un tenant separado
- Aislamiento de datos mediante `tenantId`
- Soporte para múltiples organizaciones

### Role-Based Access Control (RBAC)
- Roles: Administrador, Gerente, Operador, Contador
- Permisos granulares por módulo
- Middleware de autorización en backend

## Estructura del Proyecto

```
/agribusiness-erp/
├── .github/
│   └── workflows/              # GitHub Actions workflows
├── app/                        # Frontend React
│   ├── public/
│   │   └── staticwebapp.config.json  # Azure Static Web App config
│   ├── src/
│   │   ├── config/             # Configuración (auth, API client)
│   │   ├── services/           # Services para llamadas al backend
│   │   ├── types/              # TypeScript types
│   │   ├── pages/              # Páginas/Componentes
│   │   └── App.tsx
│   ├── .env                    # Variables de entorno (local)
│   ├── .env.example            # Template de variables de entorno
│   └── .env.production         # Variables de entorno (producción)
├── api/                        # Backend Express
│   ├── src/
│   │   ├── controllers/        # Controladores (endpoints)
│   │   ├── routes/             # Rutas de API
│   │   ├── middleware/         # Middleware (auth, tenant, etc.)
│   │   ├── config/             # Configuración
│   │   ├── prisma/
│   │   │   └── schema.prisma   # Schema de base de datos
│   │   └── server.ts           # Servidor Express
│   └── .env                    # Variables de entorno backend
└── docs/                       # Documentación
    ├── CONFIGURACION_AZURE_STATIC_WEB_APP.md
    ├── CHECKLIST_CONFIGURACION_MANUAL.md
    └── Plan/                   # Planes de desarrollo
```

## Estado Actual del Desarrollo

### Implementado (35%)
- ✅ Frontend base React con Login
- ✅ Backend Express con controllers: Tenants, Productos, Clientes, Proveedores, Ventas, Compras
- ✅ Backend API con controllers: Plan Cuentas, Centro Costo, Asientos, Reportes Contables
- ✅ Prisma ORM configurado con schema contable completo
- ✅ Middleware de autenticación
- ✅ Multi-tenant architecture
- ✅ RBAC (Role-Based Access Control)
- ✅ SQL Server en Azure creado
- ✅ Frontend services para módulo contable
- ✅ API Client configurado con interceptores

### En Progreso (5%)
- 🔄 Deploy a Azure Static Web Apps
- 🔄 Configuración de dominio personalizado

### Pendiente (60%)
- ❌ Schema Prisma: Módulo Ganado (CategoriaGanado, Ganado, MovimientoGanado, etc.)
- ❌ Controllers para Ganado, Nacimientos, Mortandad
- ❌ Integración automática: Movimientos → Asientos contables
- ❌ Frontend: Pantallas de Contabilidad (Plan Cuentas, Asientos, Balance, P&L)
- ❌ Frontend: Módulo de Ganado completo
- ❌ Tests unitarios y de integración
- ❌ Deploy del backend a Azure App Service
- ❌ CI/CD completo para backend

## Instalación y Desarrollo Local

### Prerrequisitos
- Node.js 18+
- npm o yarn
- SQL Server (Express o Azure)
- Cuenta de Azure con Static Web App configurada

### Frontend

```bash
cd app
npm install
cp .env.example .env
# Edita .env con tus credenciales
npm run dev
```

El frontend estará disponible en: http://localhost:5173

### Backend

```bash
cd api
npm install
cp .env.example .env
# Edita .env con tu connection string de SQL Server
npx prisma generate
npx prisma migrate dev
npm start
```

El backend estará disponible en: http://localhost:3001

## Variables de Entorno

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3001/api
VITE_TENANT_ID=your-tenant-uuid
VITE_AZURE_CLIENT_ID=your-azure-client-id
VITE_AZURE_TENANT_ID=your-azure-tenant-id
VITE_REDIRECT_URI=http://localhost:5173
VITE_DEV_MODE=false
```

### Backend (.env)
```bash
DATABASE_URL="sqlserver://server:port;database=name;user=user;password=pass;encrypt=true"
JWT_SECRET=your-secret-key
PORT=3001
```

## Despliegue

### Frontend (Azure Static Web Apps)

El despliegue es automático mediante GitHub Actions:

1. Configura los secrets en GitHub (ver [CHECKLIST_CONFIGURACION_MANUAL.md](docs/CHECKLIST_CONFIGURACION_MANUAL.md))
2. Push a la rama `main`
3. GitHub Actions desplegará automáticamente

### Backend (Azure App Service)

Por implementar. Ver documentación en `/docs/Plan/`

## Documentación

- [Configuración de Azure Static Web App](docs/CONFIGURACION_AZURE_STATIC_WEB_APP.md)
- [Checklist de Configuración Manual](docs/CHECKLIST_CONFIGURACION_MANUAL.md)
- [Plan de Acción - Módulo Contabilidad](docs/Plan/PLAN_ACCION_CONTABILIDAD_PRIMERO.md)
- [Plan de Acción - Módulo Ganado](docs/Plan/PLAN_MODULO_GANADO_DETALLADO.md)
- [Prompt para Agente IA](docs/Plan/PROMPT_COPIAR_PEGAR_IA.md)

## Módulos del Sistema

### 1. Contabilidad
- Plan de Cuentas
- Asientos Contables
- Centro de Costos
- Balance General
- Estado de Resultados (P&L)
- Reportes contables

### 2. Ganado (Por implementar)
- Categorías de Ganado
- Inventario de Ganado
- Movimientos (Compras, Ventas, Traslados)
- Nacimientos
- Mortandad
- Trazabilidad

### 3. Ventas
- Clientes
- Productos
- Órdenes de Venta
- Facturación

### 4. Compras
- Proveedores
- Órdenes de Compra
- Recepción de Mercadería

### 5. Reportes y KPIs
- Dashboard ejecutivo
- KPIs por módulo
- Exportación a Excel/PDF

## Seguridad

- Autenticación mediante Microsoft Entra ID (Azure AD)
- Tokens JWT para API
- HTTPS en producción
- CORS configurado
- Headers de seguridad (CSP, X-Frame-Options, etc.)
- Aislamiento de datos por tenant

## Testing

Por implementar:
- Jest (Unit tests)
- React Testing Library (Frontend)
- Supertest (Backend API tests)

## Contribución

Este es un proyecto privado. Para contribuir:

1. Crea una rama desde `main`
2. Implementa tus cambios
3. Crea un Pull Request
4. Espera la revisión

## Licencia

Propietario: Hans (hhml17)

## Contacto

- Email: hans@agribusiness.com.py
- GitHub: https://github.com/hhml17
- Repositorio: https://github.com/hhml17/agribusiness-erp

---

Última actualización: 18 de Diciembre 2025
