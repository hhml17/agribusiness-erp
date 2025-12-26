# 13 - ESTRUCTURA DE CARPETAS DEL PROYECTO

## 1. VISIÓN GENERAL

```
agribusiness/
├── docs/                          # Documentación (esta carpeta)
├── frontend/                      # Aplicación React
├── backend/                       # Servidor Node.js/Express
├── database/                      # Migraciones y schema
├── scripts/                       # Scripts de utilidad
├── .github/                       # Configuración GitHub
└── README.md
```

---

## 2. ESTRUCTURA COMPLETA DEL FRONTEND

```
frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
│
├── src/
│   ├── components/               # Componentes reutilizables
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Breadcrumb.tsx
│   │   │   └── Loading.tsx
│   │   │
│   │   ├── forms/
│   │   │   ├── BovinoForm.tsx
│   │   │   ├── OperacionForm.tsx
│   │   │   ├── AsientoForm.tsx
│   │   │   └── FilterForm.tsx
│   │   │
│   │   ├── tables/
│   │   │   ├── BovinoTable.tsx
│   │   │   ├── OperacionTable.tsx
│   │   │   ├── UsuarioTable.tsx
│   │   │   └── DataTable.tsx (genérico)
│   │   │
│   │   ├── charts/
│   │   │   ├── LineChart.tsx
│   │   │   ├── BarChart.tsx
│   │   │   ├── PieChart.tsx
│   │   │   └── DashboardChart.tsx
│   │   │
│   │   ├── modals/
│   │   │   ├── ConfirmModal.tsx
│   │   │   ├── ExportModal.tsx
│   │   │   ├── PrintModal.tsx
│   │   │   └── UploadModal.tsx
│   │   │
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       ├── Checkbox.tsx
│   │       ├── DatePicker.tsx
│   │       ├── Tab.tsx
│   │       ├── Card.tsx
│   │       └── Alert.tsx
│   │
│   ├── modules/                 # Por área de negocio
│   │   │
│   │   ├── tenant-admin/        # Administración del tenant
│   │   │   ├── pages/
│   │   │   │   ├── DashboardAdmin.tsx
│   │   │   │   ├── UsuariosPage.tsx
│   │   │   │   ├── RolesPage.tsx
│   │   │   │   ├── ConfiguracionPage.tsx
│   │   │   │   └── CentrosCostoPage.tsx
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── UsuarioForm.tsx
│   │   │   │   ├── RolForm.tsx
│   │   │   │   └── ConfigTenantForm.tsx
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── usuario.service.ts
│   │   │   │   ├── rol.service.ts
│   │   │   │   └── configuracion.service.ts
│   │   │   │
│   │   │   └── hooks/
│   │   │       ├── useUsuarios.ts
│   │   │       ├── useRoles.ts
│   │   │       └── useTenantConfig.ts
│   │   │
│   │   ├── ganado/              # Gestión de ganado
│   │   │   ├── pages/
│   │   │   │   ├── InventarioPage.tsx
│   │   │   │   ├── DetalleBovinoPage.tsx
│   │   │   │   ├── LotesPage.tsx
│   │   │   │   ├── MovimientosPage.tsx
│   │   │   │   └── ReportesGanadoPage.tsx
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── BovinoForm.tsx
│   │   │   │   ├── BovinoCard.tsx
│   │   │   │   ├── BovinoTable.tsx
│   │   │   │   ├── LoteForm.tsx
│   │   │   │   ├── OperacionMovimiento.tsx
│   │   │   │   └── HistorialBovino.tsx
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── bovino.service.ts
│   │   │   │   ├── lote.service.ts
│   │   │   │   └── movimiento.service.ts
│   │   │   │
│   │   │   └── hooks/
│   │   │       ├── useBovinosData.ts
│   │   │       ├── useLotes.ts
│   │   │       ├── useInventario.ts
│   │   │       └── usePesadas.ts
│   │   │
│   │   ├── operaciones/         # Compras, ventas, faena
│   │   │   ├── pages/
│   │   │   │   ├── OperacionesPage.tsx
│   │   │   │   ├── ComprasPage.tsx
│   │   │   │   ├── VentasPage.tsx
│   │   │   │   ├── FaenaPage.tsx
│   │   │   │   ├── ComprobantesPage.tsx
│   │   │   │   └── ClientesProveedoresPage.tsx
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── OperacionForm.tsx
│   │   │   │   ├── CompraForm.tsx
│   │   │   │   ├── VentaForm.tsx
│   │   │   │   ├── FaenaForm.tsx
│   │   │   │   ├── OperacionTable.tsx
│   │   │   │   └── ClienteProveedorForm.tsx
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── operacion.service.ts
│   │   │   │   ├── compra.service.ts
│   │   │   │   ├── venta.service.ts
│   │   │   │   └── faena.service.ts
│   │   │   │
│   │   │   └── hooks/
│   │   │       ├── useOperaciones.ts
│   │   │       ├── useCompras.ts
│   │   │       └── useVentas.ts
│   │   │
│   │   ├── financiero/          # Contabilidad y reportes financieros
│   │   │   ├── pages/
│   │   │   │   ├── ContabilidadPage.tsx
│   │   │   │   ├── BalanceGeneralPage.tsx
│   │   │   │   ├── EstadoResultadosPage.tsx
│   │   │   │   ├── FlujoCajaPage.tsx
│   │   │   │   ├── AsentosPage.tsx
│   │   │   │   ├── BancosPage.tsx
│   │   │   │   └── TaxPage.tsx
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── AsientoForm.tsx
│   │   │   │   ├── AsientoTable.tsx
│   │   │   │   ├── BalanceGeneralView.tsx
│   │   │   │   ├── EstadoResultadosView.tsx
│   │   │   │   ├── FlujoCajaView.tsx
│   │   │   │   ├── BancoForm.tsx
│   │   │   │   └── ReconciliacionForm.tsx
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── asiento.service.ts
│   │   │   │   ├── banco.service.ts
│   │   │   │   ├── reportes-financiero.service.ts
│   │   │   │   └── impuesto.service.ts
│   │   │   │
│   │   │   └── hooks/
│   │   │       ├── useAsentos.ts
│   │   │       ├── useBancos.ts
│   │   │       ├── useReportesFinanciero.ts
│   │   │       └── useCotizacion.ts
│   │   │
│   │   └── reportes/            # Dashboards y reportes
│   │       ├── pages/
│   │       │   ├── DashboardPage.tsx
│   │       │   ├── ReportesExecutivosPage.tsx
│   │       │   ├── AnalisisGanadoPage.tsx
│   │       │   ├── AnalisisFinancieroPage.tsx
│   │       │   └── ExportacionesPage.tsx
│   │       │
│   │       ├── components/
│   │       │   ├── DashboardCards.tsx
│   │       │   ├── KPICard.tsx
│   │       │   ├── SummaryChart.tsx
│   │       │   ├── FilterReporte.tsx
│   │       │   └── ExportButton.tsx
│   │       │
│   │       ├── services/
│   │       │   ├── dashboard.service.ts
│   │       │   ├── reportes.service.ts
│   │       │   └── export.service.ts
│   │       │
│   │       └── hooks/
│   │           ├── useDashboard.ts
│   │           ├── useReportes.ts
│   │           └── useExport.ts
│   │
│   ├── hooks/                   # Custom hooks globales
│   │   ├── useAuth.ts            # Autenticación
│   │   ├── useTenant.ts          # Tenant actual
│   │   ├── useUser.ts            # Usuario logueado
│   │   ├── useNotification.ts    # Notificaciones
│   │   ├── useLoading.ts         # Estados loading
│   │   ├── useExport.ts          # Exportación
│   │   └── useQuery.ts           # React Query wrapper
│   │
│   ├── services/                # API client y servicios
│   │   ├── api.ts               # Instancia Axios configurada
│   │   ├── auth.service.ts       # Autenticación
│   │   ├── bovino.service.ts     # Llamadas API bovinosData
│   │   ├── operacion.service.ts  # Operaciones
│   │   ├── asiento.service.ts    # Asientos contables
│   │   └── ...
│   │
│   ├── utils/                   # Funciones auxiliares
│   │   ├── constants.ts          # Constantes (roles, tipos, etc)
│   │   ├── validators.ts         # Validadores
│   │   ├── formatters.ts         # Formateo de datos
│   │   ├── date-utils.ts         # Funciones de fecha
│   │   ├── number-utils.ts       # Funciones de números
│   │   ├── excel-export.ts       # Generación Excel
│   │   └── local-storage.ts      # Utilidades localStorage
│   │
│   ├── store/                   # State management (Zustand o Context)
│   │   ├── authStore.ts
│   │   ├── tenantStore.ts
│   │   ├── uiStore.ts (notificaciones, modal, etc)
│   │   └── filters.store.ts
│   │
│   ├── types/                   # TypeScript interfaces
│   │   ├── models.ts            # Tipos de datos principales
│   │   ├── api.ts               # Tipos de responses
│   │   ├── forms.ts             # Tipos de formularios
│   │   └── enums.ts             # Enumeradores
│   │
│   ├── styles/                  # Estilos globales
│   │   ├── globals.css
│   │   ├── variables.css
│   │   ├── theme.ts             # Tema Tailwind
│   │   └── animations.css
│   │
│   ├── pages/                   # Páginas principales (Layout wrapper)
│   │   ├── LoginPage.tsx
│   │   ├── NotFoundPage.tsx
│   │   ├── ErrorPage.tsx
│   │   └── UnauthorizedPage.tsx
│   │
│   ├── App.tsx                  # Componente principal
│   ├── App.css
│   ├── index.tsx                # Entry point
│   └── index.css
│
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts (o craco.config.js si es CRA)
└── .env.example
```

---

## 3. ESTRUCTURA COMPLETA DEL BACKEND

```
backend/
├── src/
│   ├── controllers/             # Controladores de rutas
│   │   ├── auth.controller.ts
│   │   ├── tenant.controller.ts
│   │   ├── usuario.controller.ts
│   │   ├── rol.controller.ts
│   │   ├── bovino.controller.ts
│   │   ├── operacion.controller.ts
│   │   ├── asiento.controller.ts
│   │   ├── banco.controller.ts
│   │   ├── reporte.controller.ts
│   │   └── import.controller.ts
│   │
│   ├── services/                # Lógica de negocio
│   │   ├── auth.service.ts
│   │   ├── tenant.service.ts
│   │   ├── usuario.service.ts
│   │   ├── rol.service.ts
│   │   ├── bovino.service.ts
│   │   ├── operacion.service.ts
│   │   ├── asiento.service.ts
│   │   ├── banco.service.ts
│   │   ├── reporte.service.ts
│   │   └── import.service.ts
│   │
│   ├── middleware/              # Middlewares
│   │   ├── auth.middleware.ts   # Verificar token JWT
│   │   ├── authorization.middleware.ts  # Verificar permisos
│   │   ├── errorHandler.middleware.ts   # Manejo de errores
│   │   ├── validation.middleware.ts     # Validación de entrada
│   │   ├── logging.middleware.ts        # Logs
│   │   └── tenant.middleware.ts         # Extracción de tenantId
│   │
│   ├── routes/                  # Definición de rutas
│   │   ├── index.ts             # Agrega todas las rutas
│   │   ├── auth.routes.ts
│   │   ├── tenant.routes.ts
│   │   ├── usuario.routes.ts
│   │   ├── rol.routes.ts
│   │   ├── bovino.routes.ts
│   │   ├── operacion.routes.ts
│   │   ├── asiento.routes.ts
│   │   ├── banco.routes.ts
│   │   ├── reporte.routes.ts
│   │   └── import.routes.ts
│   │
│   ├── models/                  # Prisma schema
│   │   └── schema.prisma        # Definición de modelos
│   │
│   ├── validators/              # Validadores Zod
│   │   ├── auth.validator.ts
│   │   ├── bovino.validator.ts
│   │   ├── operacion.validator.ts
│   │   ├── asiento.validator.ts
│   │   └── ...
│   │
│   ├── utils/                   # Funciones auxiliares
│   │   ├── azure-ad.ts          # Integración Azure AD
│   │   ├── jwt.ts               # Manejo JWT
│   │   ├── permissions.ts       # Validación permisos
│   │   ├── auditoria.ts         # Registro de auditoría
│   │   ├── mailer.ts            # Envío de emails
│   │   ├── excel-importer.ts    # Import de Excel
│   │   ├── senacsa.ts           # Integración SENACSA
│   │   ├── cotizacion.ts        # Obtener cotizaciones
│   │   ├── pdf-generator.ts     # Generación PDFs
│   │   └── helpers.ts           # Helpers generales
│   │
│   ├── types/                   # TypeScript types
│   │   ├── models.ts
│   │   ├── api.ts
│   │   ├── errors.ts
│   │   └── enums.ts
│   │
│   ├── constants/               # Constantes
│   │   ├── errors.ts
│   │   ├── roles.ts
│   │   ├── permisos.ts
│   │   ├── tipos-operacion.ts
│   │   └── ...
│   │
│   ├── config/                  # Configuración
│   │   ├── database.ts          # Conexión Prisma
│   │   ├── azure-ad.config.ts
│   │   ├── mail.config.ts
│   │   ├── logger.config.ts
│   │   └── ...
│   │
│   ├── jobs/                    # Tareas programadas (si aplica)
│   │   ├── cotizacion-diaria.job.ts
│   │   ├── cierre-diario.job.ts
│   │   └── backup.job.ts
│   │
│   ├── index.ts                 # Entry point
│   └── server.ts                # Configuración del servidor
│
├── prisma/
│   ├── schema.prisma            # Schema de datos
│   ├── seed.ts                  # Seed inicial
│   └── migrations/              # Migraciones automáticas
│
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   ├── integration/
│   │   ├── auth.test.ts
│   │   ├── bovino.test.ts
│   │   └── operacion.test.ts
│   └── setup.ts
│
├── package.json
├── tsconfig.json
├── .env.example
├── .env.development
├── .env.production
├── docker-compose.yml (opcional)
└── Dockerfile (opcional)
```

---

## 4. ESTRUCTURA DE BASE DE DATOS

```
database/
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_add_auditoria.sql
│   ├── 003_add_indices.sql
│   └── ...
│
├── views/
│   ├── vw_inventario_actual.sql
│   ├── vw_resultados_por_centro.sql
│   ├── vw_movimientos_mes.sql
│   └── ...
│
├── stored_procedures/
│   ├── sp_crear_asientos_operacion.sql
│   ├── sp_actualizar_inventario.sql
│   └── ...
│
└── schema.prisma (symlink a backend/prisma/)
```

---

## 5. ESTRUCTURA DE SCRIPTS

```
scripts/
├── import_ganado.py
│   # Importa individuos desde Excel
│   # Uso: python import_ganado.py --file ganado.xlsx --tenant-id XXX
│
├── import_operaciones.py
│   # Importa operaciones (compras, ventas) desde Excel
│   # Uso: python import_operaciones.py --file operaciones.xlsx
│
├── seed_data.js
│   # Crea datos iniciales (roles, permisos, tenants de prueba)
│   # Uso: node seed_data.js
│
├── generate_reports.ts
│   # Genera reportes en batch
│   # Uso: npx ts-node generate_reports.ts --month 2025-03
│
├── backup_database.sh
│   # Script de backup a Azure Storage
│   # Uso: ./backup_database.sh
│
├── migrate_database.sh
│   # Ejecuta migraciones de Prisma
│   # Uso: ./migrate_database.sh
│
└── requirements.txt (para scripts Python)
```

---

## 6. DOCUMENTACIÓN

```
docs/
├── AGRIBUSINESS_DOCUMENTATION.md     # Este índice
├── 01-VISION-ARQUITECTURA.md
├── 02-ESTRUCTURA-TENANT.md
├── 03-ROLES-PERMISOS.md
├── 04-SCHEMA-DATABASE.md
├── 05-API-ENDPOINTS.md
├── 06-COMPONENTES-FRONTEND.md
├── 07-FLUJOS-NEGOCIO.md
├── 08-MODULO-ADMINISTRACION.md
├── 09-MODULO-GANADO.md
├── 10-MODULO-OPERACIONES.md
├── 11-MODULO-FINANCIERO.md
├── 12-MODULO-REPORTES.md
├── 13-ESTRUCTURA-CARPETAS.md
├── 14-GUIA-IMPLEMENTACION.md
├── 15-INTEGRACIONES.md
├── API.md                            # Referencia API completa
├── DEPLOYMENT.md                     # Despliegue en Azure
├── TROUBLESHOOTING.md                # Resolución de problemas
└── CHANGELOG.md                      # Historial de cambios
```

---

## 7. CONFIGURACIÓN DEL PROYECTO

```
agribusiness/
├── .gitignore
├── .env.example                 # Variables de ejemplo
├── README.md                    # Instrucciones generales
├── CONTRIBUTING.md              # Guía para contribuir
├── LICENSE
├── package.json (root)          # Dependencias compartidas
├── .github/
│   ├── workflows/
│   │   ├── test.yml            # Tests automáticos
│   │   ├── lint.yml            # Linting
│   │   └── deploy.yml          # Deploy automático
│   └── ISSUE_TEMPLATE/
│       └── bug_report.md
│
└── docker-compose.yml           # Para desarrollo local
```

---

## 8. CONVENCIONES DE NOMBRES

### Carpetas
- `kebab-case`: `user-management`, `error-handler`
- Singular o plural según contenido: `components`, `services`, `hooks`

### Archivos
- `camelCase.ts`: `userService.ts`, `authMiddleware.ts`
- `PascalCase.tsx`: `UserForm.tsx`, `DashboardPage.tsx`

### Imports
```typescript
// Servicios
import { userService } from '@/services/user.service';

// Componentes
import UserForm from '@/components/user/UserForm';

// Hooks
import { useUser } from '@/hooks/useUser';

// Types
import type { User, Bovino } from '@/types/models';
```

---

## 9. RUTAS Y ALIAS (tsconfig.json)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@modules/*": ["src/modules/*"],
      "@hooks/*": ["src/hooks/*"],
      "@services/*": ["src/services/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"],
      "@constants/*": ["src/constants/*"]
    }
  }
}
```

---

## 10. CREAR ESTRUCTURA INICIAL

```bash
# Ejecutar desde la raíz del proyecto
mkdir -p agribusiness/{docs,frontend,backend,database,scripts}

# Frontend
cd frontend
mkdir -p src/{components,modules,hooks,services,utils,store,types,styles,pages}
mkdir -p src/components/{common,forms,tables,charts,modals,ui}
mkdir -p src/modules/{tenant-admin,ganado,operaciones,financiero,reportes}

# Backend
cd ../backend
mkdir -p src/{controllers,services,middleware,routes,models,validators,utils,types,config,constants,jobs}
mkdir -p prisma/migrations
mkdir -p tests/{unit,integration}

# Database
cd ../database
mkdir -p {migrations,views,stored_procedures}

# Scripts
cd ../scripts
touch import_ganado.py import_operaciones.py seed_data.js

echo "✅ Estructura creada exitosamente"
```

---

## 11. ORGANIZACIÓN POR MÓDULO DE NEGOCIO

Cada módulo en `frontend/src/modules/` y `backend/src/` sigue esta estructura:

```
modulo/
├── pages/           # Componentes/Controllers página
├── components/      # Componentes específicos del módulo
├── services/        # Servicios API del módulo
├── hooks/          # Custom hooks del módulo
├── types.ts        # Types específicos del módulo
└── constants.ts    # Constantes del módulo
```

**Ventajas:**
- Fácil encontrar código relacionado
- Desacoplado de otros módulos
- Se puede cargar lazy en frontend
- Independiente para testing

---

## 12. ARCHIVOS IMPORTANTES A CREAR

**Primero crear:**
1. `.env.example` - Variables de entorno
2. `README.md` - Guía de setup
3. `package.json` - Dependencias
4. `tsconfig.json` - Configuración TypeScript
5. `.gitignore` - Archivos ignorados

**Después de estructura:**
6. `backend/src/index.ts` - Entry point servidor
7. `frontend/src/App.tsx` - Componente principal
8. `database/schema.prisma` - Schema Prisma

---

## RESUMEN

Esta estructura:
✅ Escala bien (añadir módulos es simple)
✅ Es mantenible (fácil encontrar código)
✅ Facilita testing (servicios desacoplados)
✅ Permite desarrollo paralelo (frontend/backend independientes)
✅ Sigue convenciones de industria

**Próximo:** Usar [04-SCHEMA-DATABASE.md](./04-SCHEMA-DATABASE.md) para definir las tablas de Prisma.

---

**Actualizado:** Diciembre 2025
