# 🌾 Agribusiness API

API Backend para el ERP Agropecuario - Multi-tenant REST API

## 📋 Descripción

API RESTful desarrollada con Node.js + Express + TypeScript + Prisma ORM, diseñada para soportar múltiples tenants (empresas) con row-level security.

## 🚀 Stack Tecnológico

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: SQL Server (Azure SQL compatible)
- **Authentication**: Azure AD (MSAL Node)

## 📁 Estructura del Proyecto

```
/api
├── /src
│   ├── /controllers          # Business logic
│   │   ├── tenants.controller.ts
│   │   └── productos.controller.ts
│   ├── /middleware           # Express middleware
│   │   ├── auth.ts           # Azure AD authentication
│   │   └── tenant.ts         # Multi-tenant validation
│   ├── /routes               # API routes
│   │   ├── tenants.routes.ts
│   │   └── productos.routes.ts
│   └── server.ts             # Main server file
├── /prisma
│   └── schema.prisma         # Database schema
├── .env.example              # Environment variables template
├── tsconfig.json             # TypeScript configuration
├── nodemon.json              # Nodemon configuration
└── package.json              # Dependencies
```

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Generar Prisma Client
npm run prisma:generate

# Ejecutar migraciones (requiere base de datos)
npm run prisma:migrate

# Iniciar servidor en modo desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar servidor de producción
npm start
```

## ⚙️ Configuración

### Variables de Entorno (.env)

```bash
# Server
PORT=5000
NODE_ENV=development

# Azure AD
AZURE_CLIENT_ID=6df64cf9-c03e-43ed-93fa-fd61ca10dc84
AZURE_TENANT_ID=organizations
AZURE_CLIENT_SECRET=your_client_secret

# Database
DATABASE_URL="sqlserver://localhost:1433;database=agribusiness_dev;user=sa;password=YourPassword123;encrypt=true;trustServerCertificate=true"

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 🔐 Autenticación

Todas las rutas protegidas requieren autenticación Azure AD mediante Bearer token:

```
Authorization: Bearer <token>
```

### Modo Desarrollo

En desarrollo, el middleware acepta cualquier token y usa un usuario mock.

### Modo Producción

En producción, los tokens son validados contra Azure AD.

## 🏢 Multi-Tenancy

Todas las operaciones requieren el header `X-Tenant-ID` para identificar el tenant:

```
X-Tenant-ID: <tenant-uuid>
```

El middleware valida:
- Que el tenant exista y esté activo
- Que el usuario tenga acceso al tenant
- Filtra automáticamente los datos por tenant (row-level security)

## 📡 Endpoints

### Health Check

```
GET /health
```

Respuesta:
```json
{
  "status": "ok",
  "timestamp": "2025-01-10T...",
  "uptime": 123.45
}
```

### Tenants

#### Listar tenants del usuario
```
GET /api/tenants
Headers: Authorization: Bearer <token>
```

Respuesta:
```json
[
  {
    "id": "uuid",
    "nombre": "Estancia Demo",
    "ruc": "80012345-6",
    "role": "ADMIN"
  }
]
```

#### Obtener tenant específico
```
GET /api/tenants/:id
Headers: Authorization: Bearer <token>
```

#### Crear tenant
```
POST /api/tenants
Headers: Authorization: Bearer <token>
Body: {
  "nombre": "Mi Estancia",
  "ruc": "80012345-6",
  "direccion": "Calle 123",
  "telefono": "+595981123456",
  "email": "info@estancia.com"
}
```

#### Actualizar tenant (Admin)
```
PUT /api/tenants/:id
Headers:
  Authorization: Bearer <token>
  X-Tenant-ID: <tenant-id>
Body: { ... }
```

#### Desactivar tenant (Admin)
```
DELETE /api/tenants/:id
Headers:
  Authorization: Bearer <token>
  X-Tenant-ID: <tenant-id>
```

### Productos

#### Listar productos
```
GET /api/productos
Headers:
  Authorization: Bearer <token>
  X-Tenant-ID: <tenant-id>
Query params:
  ?categoria=semillas
  &activo=true
```

Respuesta:
```json
[
  {
    "id": "uuid",
    "codigo": "PROD001",
    "nombre": "Semilla de Soja",
    "categoria": "semillas",
    "unidadMedida": "kg",
    "precioCompra": "100.00",
    "precioVenta": "150.00",
    "stock": "500.00",
    "stockMinimo": "100.00",
    "activo": true
  }
]
```

#### Obtener producto específico
```
GET /api/productos/:id
Headers:
  Authorization: Bearer <token>
  X-Tenant-ID: <tenant-id>
```

#### Crear producto (User/Admin)
```
POST /api/productos
Headers:
  Authorization: Bearer <token>
  X-Tenant-ID: <tenant-id>
Body: {
  "codigo": "PROD001",
  "nombre": "Semilla de Soja",
  "descripcion": "Semilla certificada",
  "categoria": "semillas",
  "unidadMedida": "kg",
  "precioCompra": 100.00,
  "precioVenta": 150.00,
  "stock": 500,
  "stockMinimo": 100
}
```

#### Actualizar producto (User/Admin)
```
PUT /api/productos/:id
Headers:
  Authorization: Bearer <token>
  X-Tenant-ID: <tenant-id>
Body: { ... }
```

#### Desactivar producto (User/Admin)
```
DELETE /api/productos/:id
Headers:
  Authorization: Bearer <token>
  X-Tenant-ID: <tenant-id>
```

#### Productos con bajo stock
```
GET /api/productos/bajo-stock
Headers:
  Authorization: Bearer <token>
  X-Tenant-ID: <tenant-id>
```

## 👥 Roles

- **ADMIN**: Acceso completo, puede gestionar tenants
- **USER**: Puede crear/editar/eliminar recursos
- **VIEWER**: Solo lectura

## 🗄️ Base de Datos

### Schema Prisma

El schema incluye los siguientes modelos:

- **Tenant**: Empresas/organizaciones
- **Usuario**: Usuarios con relación multi-tenant
- **Producto**: Inventario de productos
- **Cliente**: Clientes del tenant
- **Proveedor**: Proveedores del tenant
- **Venta / VentaItem**: Ventas y sus líneas
- **Compra / CompraItem**: Compras y sus líneas

Todos los modelos incluyen `tenantId` para row-level security.

### Migraciones

```bash
# Crear nueva migración
npm run prisma:migrate

# Ver base de datos en Prisma Studio
npm run prisma:studio
```

## 🔧 Desarrollo

### Scripts Disponibles

```bash
npm run dev              # Desarrollo con hot reload
npm run build            # Build para producción
npm start                # Iniciar servidor producción
npm run prisma:generate  # Generar Prisma Client
npm run prisma:migrate   # Ejecutar migraciones
npm run prisma:studio    # Abrir Prisma Studio
```

### Agregar Nuevos Endpoints

1. Crear controller en `/src/controllers/`
2. Crear routes en `/src/routes/`
3. Importar y montar routes en `server.ts`

Ejemplo:

```typescript
// src/controllers/clientes.controller.ts
export async function getClientes(req: TenantRequest, res: Response) {
  const clientes = await prisma.cliente.findMany({
    where: { tenantId: req.tenantId }
  });
  res.json(clientes);
}

// src/routes/clientes.routes.ts
import { Router } from 'express';
import { getClientes } from '../controllers/clientes.controller';

const router = Router();
router.use(authenticateToken);
router.use(validateTenant);
router.get('/', getClientes);
export default router;

// server.ts
import clientesRoutes from './routes/clientes.routes';
app.use('/api/clientes', clientesRoutes);
```

## 🚀 Despliegue

### Azure App Service

1. Crear App Service en Azure
2. Configurar variables de entorno
3. Configurar DATABASE_URL con Azure SQL
4. Deploy vía GitHub Actions o Azure CLI

### Docker (Opcional)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## 📊 Monitoreo

El servidor incluye:
- Health check endpoint (`/health`)
- Request logging en consola
- Graceful shutdown (SIGTERM/SIGINT)

## 🔒 Seguridad

- ✅ Azure AD authentication
- ✅ Multi-tenant row-level security
- ✅ Role-based access control (RBAC)
- ✅ CORS configurado
- ✅ Input validation
- ✅ SQL injection protection (Prisma ORM)

## 📝 TODO

- [ ] Implementar controllers de Clientes
- [ ] Implementar controllers de Proveedores
- [ ] Implementar controllers de Ventas
- [ ] Implementar controllers de Compras
- [ ] Agregar validación de inputs con Zod
- [ ] Implementar rate limiting
- [ ] Agregar logging con Winston
- [ ] Implementar tests unitarios (Jest)
- [ ] Documentación con Swagger/OpenAPI
- [ ] Implementar webhooks para eventos

## 📞 Soporte

- **WhatsApp**: +595 981 545146
- **Frontend ERP**: [/app](../app)
- **Portal BI**: [/portal](../portal)

---

© 2025 Agribusiness Consulting Platform
