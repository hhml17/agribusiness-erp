# 🌾 Agribusiness ERP

Sistema de Gestión Empresarial para el sector Agropecuario.

## 📋 Descripción

ERP multi-tenant desarrollado con React + TypeScript + Vite, diseñado específicamente para empresas del sector agropecuario. Incluye gestión de inventario, ventas, compras, clientes, proveedores y benchmarking financiero.

## 🚀 Stack Tecnológico

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Autenticación**: Azure AD (MSAL.js)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Estilos**: CSS Modules (design system consistente con Portal BI)

## 📁 Estructura del Proyecto

```
/app
├── /src
│   ├── /config
│   │   └── authConfig.ts          # Configuración Azure AD
│   ├── /pages
│   │   ├── Login.tsx              # Página de login
│   │   └── Dashboard.tsx          # Dashboard principal
│   ├── /styles
│   │   ├── Login.css              # Estilos login
│   │   └── Dashboard.css          # Estilos dashboard
│   ├── App.tsx                    # Componente principal con routing
│   └── App.css                    # Estilos base y variables
├── vite.config.ts                 # Configuración Vite
├── tsconfig.json                  # Configuración TypeScript
└── package.json                   # Dependencias
```

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Build para producción
npm run build

# Preview build
npm run preview
```

## 🔐 Autenticación

El ERP utiliza **Azure AD** para autenticación, compartiendo la misma configuración que el Portal BI para garantizar SSO (Single Sign-On) consistente.

**Client ID**: `6df64cf9-c03e-43ed-93fa-fd61ca10dc84`
**Authority**: `https://login.microsoftonline.com/organizations`

## 🎯 Características Implementadas

### ✅ Fase 1 - Setup (Completado)

- [x] Proyecto Vite con React + TypeScript
- [x] Autenticación Azure AD con MSAL
- [x] React Router configurado
- [x] Página de Login
- [x] Dashboard principal con layout
- [x] Estilos consistentes con Portal BI
- [x] Sidebar de navegación
- [x] Header con usuario
- [x] Tenant selector (multi-tenant ready)

### 📋 Próximas Fases

#### Fase 2 - Backend API
- [ ] Setup Node.js + Express + TypeScript
- [ ] Prisma ORM con Azure SQL
- [ ] Middleware de autenticación
- [ ] Row-level security (tenantId)
- [ ] API CRUD básica

#### Fase 3 - Módulos ERP
- [ ] **Inventario**
  - [ ] Lista de productos
  - [ ] CRUD productos
  - [ ] Alertas de stock bajo
  - [ ] Movimientos de inventario
- [ ] **Ventas**
  - [ ] Punto de venta
  - [ ] Facturación
  - [ ] Historial de ventas
  - [ ] Reportes
- [ ] **Compras**
  - [ ] Órdenes de compra
  - [ ] Recepción de mercadería
  - [ ] Gestión de proveedores
- [ ] **Clientes**
  - [ ] CRUD clientes
  - [ ] Historial de compras
  - [ ] Cuentas corrientes
- [ ] **Proveedores**
  - [ ] CRUD proveedores
  - [ ] Historial de compras
  - [ ] Pagos pendientes

#### Fase 4 - Benchmarking
- [ ] Vista de comparación anónima
- [ ] Métricas del sector
- [ ] Gráficos comparativos
- [ ] Integración Power BI

## 🎨 Design System

El ERP utiliza el mismo design system que el Portal BI para mantener consistencia visual.

### Colores

```css
--color-primary: #2d5016       /* Verde agro */
--color-primary-hover: #234010
--color-primary-light: #3d6b1f
--color-success: #2d5016
--color-warning: #f57c00
--color-error: #d32f2f
--color-info: #0078d4
```

### Variables

Ver `src/App.css` para todas las variables CSS disponibles (colores, tipografía, espaciado, sombras, etc.)

## 🌐 Rutas

- `/app` - Redirige según autenticación
- `/app/login` - Página de login (solo no autenticados)
- `/app/dashboard` - Dashboard principal (solo autenticados)
- `/app/inventario` - Módulo inventario (próximamente)
- `/app/ventas` - Módulo ventas (próximamente)
- `/app/compras` - Módulo compras (próximamente)
- `/app/clientes` - Módulo clientes (próximamente)
- `/app/proveedores` - Módulo proveedores (próximamente)
- `/app/reportes` - Reportes (próximamente)
- `/app/benchmarking` - Benchmarking (próximamente)

## 🔗 Integración con Portal BI

El ERP está diseñado para integrarse perfectamente con el Portal BI existente:

- **SSO compartido**: Misma autenticación Azure AD
- **Links cruzados**: Navegación fluida entre Portal BI y ERP
- **Design consistente**: Mismos colores, tipografía y componentes
- **Datos compartidos**: Future API compartirá datos con Power BI

## 📊 Multi-Tenant

El sistema está diseñado como multi-tenant desde el inicio:

- Cada usuario puede pertenecer a múltiples empresas (tenants)
- El tenant activo se selecciona en el dashboard
- Todas las API calls incluyen el `X-Tenant-ID` header
- Row-level security en base de datos por tenantId

```typescript
interface Tenant {
    id: string
    nombre: string
    ruc: string
    role: 'admin' | 'user' | 'viewer'
}
```

## 🚧 Estado Actual

**Versión**: 0.1.0 (MVP Setup)
**Estado**: En desarrollo
**Frontend**: ✅ Setup completo
**Backend**: 📋 Pendiente
**Database**: 📋 Pendiente

## 📞 Soporte

- **WhatsApp**: +595 981 545146
- **Portal BI**: [/portal](/portal)
- **Guía de Uso**: [/portal/guia.html](/portal/guia.html)

---

© 2025 Agribusiness Consulting Platform
