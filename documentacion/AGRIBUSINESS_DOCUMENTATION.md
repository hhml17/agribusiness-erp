# 🌾 AGRIBUSINESS ERP - DOCUMENTACIÓN COMPLETA

**Sistema de Gestión Integral para Operaciones Ganaderas Multi-Tenant**

---

## 📋 TABLA DE CONTENIDOS

### SECCIÓN 1: ARQUITECTURA Y ESTRATEGIA
1. [01-VISION-ARQUITECTURA.md](./01-VISION-ARQUITECTURA.md) - Visión general, objetivos y estrategia
2. [02-ESTRUCTURA-TENANT.md](./02-ESTRUCTURA-TENANT.md) - Modelo multi-tenant y organización
3. [03-ROLES-PERMISOS.md](./03-ROLES-PERMISOS.md) - Sistema de roles basado en Azure AD

### SECCIÓN 2: ESPECIFICACIONES TÉCNICAS
4. [04-SCHEMA-DATABASE.md](./04-SCHEMA-DATABASE.md) - Diseño completo de base de datos
5. [05-API-ENDPOINTS.md](./05-API-ENDPOINTS.md) - Especificación de endpoints REST
6. [06-COMPONENTES-FRONTEND.md](./06-COMPONENTES-FRONTEND.md) - Componentes React principales
7. [07-FLUJOS-NEGOCIO.md](./07-FLUJOS-NEGOCIO.md) - Procesos de negocio principales

### SECCIÓN 3: MÓDULOS FUNCIONALES
8. [08-MODULO-ADMINISTRACION.md](./08-MODULO-ADMINISTRACION.md) - Admin de tenant y configuración
9. [09-MODULO-GANADO.md](./09-MODULO-GANADO.md) - Gestión de inventario bovino
10. [10-MODULO-OPERACIONES.md](./10-MODULO-OPERACIONES.md) - Operaciones (compras, ventas, faena)
11. [11-MODULO-FINANCIERO.md](./11-MODULO-FINANCIERO.md) - Contabilidad y finanzas
12. [12-MODULO-REPORTES.md](./12-MODULO-REPORTES.md) - Reportes y análisis

### SECCIÓN 4: IMPLEMENTACIÓN
13. [13-ESTRUCTURA-CARPETAS.md](./13-ESTRUCTURA-CARPETAS.md) - Organización del proyecto
14. [14-GUIA-IMPLEMENTACION.md](./14-GUIA-IMPLEMENTACION.md) - Pasos de implementación
15. [15-INTEGRACIONES.md](./15-INTEGRACIONES.md) - Azure AD, SENACSA, Excel import

---

## 🎯 DESCRIPCIÓN GENERAL

**Agribusiness** es una plataforma ERP moderna diseñada específicamente para operaciones ganaderas, pero construida como un sistema agnóstico que puede adaptarse a cualquier tipo de negocio agrícola.

### Características Principales:
- ✅ Multi-tenant con isolación completa de datos por tenant
- ✅ Gestión integral de ganado (individual y por lote)
- ✅ Control financiero con multi-moneda (PYG/USD)
- ✅ Integración con Azure AD para autenticación empresarial
- ✅ Cumplimiento SENACSA para trazabilidad
- ✅ Reportes avanzados (financieros, pecuarios, de gestión)
- ✅ Sistema de roles y permisos granular

---

## 🔐 ROLES PRINCIPALES (FRAMEWORK AZURE)

```
TENANT ADMIN (Super Admin)
├── Gestión de organización
├── Configuración del tenant
├── Creación de usuarios y roles
├── Auditoría completa
└── Acceso a todos los módulos

GERENTE GENERAL
├── Planificación estratégica
├── Reportes ejecutivos
├── Control financiero
└── Gestión de operaciones

ENCARGADO OPERATIVO
├── Gestión de ganado
├── Registros de movimientos
├── Operaciones diarias
└── Reportes operacionales

CONTADOR/AUXILIAR CONTABLE
├── Registro contable
├── Conciliación bancaria
├── Impuestos y DDJJ
└── Estados financieros

VENDEDOR/COMPRADOR
├── Registro de operaciones
├── Gestión de clientes/proveedores
└── Reportes comerciales

VISUALIZADOR (Read-Only)
├── Consulta de reportes
├── Análisis de datos
└── Sin permisos de modificación
```

---

## 📊 MÓDULOS DEL SISTEMA

### 1. ADMINISTRACIÓN DE TENANT
Configuración inicial, gestión de usuarios, roles, centros de costo, estancias.

### 2. GESTIÓN DE GANADO
- Registro de individuos (caravanas, datos reproductivos)
- Lotes de ganado
- Movimientos (compra, venta, nacimiento, muerte)
- Trazabilidad SENACSA
- Reportes pecuarios

### 3. OPERACIONES COMERCIALES
- Compras y ventas
- Faena y procesamiento
- Consumo/donación
- Facturas y comprobantes
- Gestión de proveedores/clientes

### 4. GESTIÓN FINANCIERA
- Plan de cuentas
- Diario contable
- Bancos e inversiones
- Multi-moneda
- Análisis de flujo de caja
- TIR y análisis financiero

### 5. REPORTES Y ANÁLISIS
- Dashboard ejecutivo
- Estados de resultado
- Balance general
- Reportes por centros de costo
- Análisis pecuario-financiero
- Exportación a Excel

---

## 🛠️ STACK TECNOLÓGICO

**Frontend:**
- React 18+ con TypeScript
- Tailwind CSS / MUI para componentes
- Recharts para gráficos
- React Query para state management

**Backend:**
- Node.js + Express
- Prisma ORM
- Validación con Zod/Joi
- JWT + Azure AD integration

**Base de Datos:**
- Azure SQL Server (sql server basic DTU 5)
- Multi-schema para multi-tenant
- Vistas materializadas para reportes

**Infraestructura:**
- Azure App Service / Azure Functions (backend)
- Azure Static Web Apps (frontend)
- Azure Key Vault (secretos)
- Azure AD (autenticación)

---

## 📁 ESTRUCTURA DE CARPETAS

```
agribusiness/
├── docs/                          # Esta documentación
│   └── *.md (todos los archivos)
├── frontend/
│   ├── src/
│   │   ├── components/           # Componentes reutilizables
│   │   ├── modules/              # Por módulo del negocio
│   │   ├── hooks/                # Custom hooks
│   │   ├── services/             # Integración con API
│   │   ├── utils/                # Funciones auxiliares
│   │   └── pages/                # Páginas principales
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/          # Lógica de endpoints
│   │   ├── services/             # Lógica de negocio
│   │   ├── middleware/           # Autenticación, validación
│   │   ├── models/               # Prisma schema
│   │   ├── utils/                # Funciones auxiliares
│   │   └── routes/               # Definición de rutas
│   └── package.json
├── database/
│   ├── migrations/               # Migraciones Prisma
│   └── schema.prisma             # Schema de Prisma
├── scripts/
│   ├── import_ganado.py          # Import Excel de ganado
│   ├── import_operaciones.py     # Import Excel de operaciones
│   └── seed_data.js              # Datos iniciales
└── README.md
```

---

## 🚀 PRÓXIMOS PASOS

1. **Lee [01-VISION-ARQUITECTURA.md](./01-VISION-ARQUITECTURA.md)** - Entiende la visión general
2. **Lee [02-ESTRUCTURA-TENANT.md](./02-ESTRUCTURA-TENANT.md)** - Comprende el modelo multi-tenant
3. **Lee [03-ROLES-PERMISOS.md](./03-ROLES-PERMISOS.md)** - Define roles y permisos
4. **Lee [04-SCHEMA-DATABASE.md](./04-SCHEMA-DATABASE.md)** - Revisa el schema propuesto
5. **Lee [13-ESTRUCTURA-CARPETAS.md](./13-ESTRUCTURA-CARPETAS.md)** - Crea la estructura
6. **Usa [14-GUIA-IMPLEMENTACION.md](./14-GUIA-IMPLEMENTACION.md)** - Sigue el plan de implementación

---

## 📞 CONVENCIONES

- **Nomenclatura de tablas:** singular_minúscula (p.ej: `bovino`, `operacion`)
- **Nomenclatura de campos:** snake_case
- **IDs:** UUID v4 como PK
- **Timestamps:** createdAt, updatedAt en UTC
- **Moneda:** Campos separados para PYG y USD
- **Tenant:** tenantId en cada tabla (excepto tablas globales)

---

**Última actualización:** Diciembre 2025
**Versión:** 1.0
**Estado:** En desarrollo - 30% completado
