# 📚 API Documentation - Agribusiness ERP

## 🌐 Base URL
```
Development: http://localhost:5000
Production: https://api.agribusiness.com
```

## 🔐 Authentication

All API endpoints require authentication using Azure AD Bearer token.

### Headers Required
```http
Authorization: Bearer <azure_ad_token>
X-Tenant-ID: <tenant_uuid>
Content-Type: application/json
```

### Authentication Flow
1. User logs in via Azure AD (MSAL)
2. Frontend receives access token
3. Include token in `Authorization` header
4. Include active tenant ID in `X-Tenant-ID` header

---

## 📋 Endpoints Overview

| Resource | Base Path | Description |
|----------|-----------|-------------|
| Health | `/health` | API health check |
| Tenants | `/api/tenants` | Company/Organization management |
| Productos | `/api/productos` | Inventory/Products |
| Clientes | `/api/clientes` | Customers |
| Proveedores | `/api/proveedores` | Suppliers |
| Ventas | `/api/ventas` | Sales |
| Compras | `/api/compras` | Purchases |

---

## 🏥 Health Check

### GET /health
Check API health status

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-17T12:00:00.000Z",
  "uptime": 3600
}
```

---

## 🏢 Tenants

### GET /api/tenants
Get all tenants for authenticated user

**Response:**
```json
[
  {
    "id": "uuid",
    "nombre": "Estancia Los Alamos",
    "ruc": "80012345-6",
    "direccion": "Ruta 2, Km 45",
    "telefono": "+595981123456",
    "email": "contacto@estancia.com",
    "activo": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### GET /api/tenants/:id
Get single tenant by ID

### POST /api/tenants
Create new tenant

**Request Body:**
```json
{
  "nombre": "Estancia Los Alamos",
  "ruc": "80012345-6",
  "direccion": "Ruta 2, Km 45",
  "telefono": "+595981123456",
  "email": "contacto@estancia.com"
}
```

### PUT /api/tenants/:id
Update tenant (Admin only)

### DELETE /api/tenants/:id
Deactivate tenant (Admin only)

---

## 📦 Productos

### GET /api/productos
Get all productos for tenant

**Query Parameters:**
- `categoria` (optional): Filter by category
- `activo` (optional): Filter by active status (true/false)

**Response:**
```json
[
  {
    "id": "uuid",
    "codigo": "PROD001",
    "nombre": "Alimento Balanceado 25kg",
    "descripcion": "Alimento para ganado bovino",
    "categoria": "Alimentos",
    "unidadMedida": "kg",
    "precioCompra": 150000,
    "precioVenta": 180000,
    "stock": 500,
    "stockMinimo": 100,
    "activo": true,
    "tenantId": "uuid",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### GET /api/productos/bajo-stock
Get productos with stock below minimum

### GET /api/productos/:id
Get single producto by ID

### POST /api/productos
Create new producto (User role required)

**Request Body:**
```json
{
  "codigo": "PROD001",
  "nombre": "Alimento Balanceado 25kg",
  "descripcion": "Alimento para ganado bovino",
  "categoria": "Alimentos",
  "unidadMedida": "kg",
  "precioCompra": 150000,
  "precioVenta": 180000,
  "stock": 500,
  "stockMinimo": 100
}
```

### PUT /api/productos/:id
Update producto (User role required)

### DELETE /api/productos/:id
Deactivate producto (User role required)

---

## 👥 Clientes

### GET /api/clientes
Get all clientes for tenant

**Query Parameters:**
- `activo` (optional): Filter by active status (true/false)

**Response:**
```json
[
  {
    "id": "uuid",
    "codigo": "CLI001",
    "nombre": "Juan Pérez",
    "ruc": "12345678-9",
    "direccion": "Asunción",
    "telefono": "+595981111111",
    "email": "juan@email.com",
    "activo": true,
    "tenantId": "uuid",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### GET /api/clientes/:id
Get single cliente by ID (includes recent 10 ventas)

### POST /api/clientes
Create new cliente (User role required)

**Request Body:**
```json
{
  "codigo": "CLI001",
  "nombre": "Juan Pérez",
  "ruc": "12345678-9",
  "direccion": "Asunción",
  "telefono": "+595981111111",
  "email": "juan@email.com"
}
```

### PUT /api/clientes/:id
Update cliente (User role required)

### DELETE /api/clientes/:id
Deactivate cliente (User role required)

---

## 🏭 Proveedores

### GET /api/proveedores
Get all proveedores for tenant

**Query Parameters:**
- `activo` (optional): Filter by active status (true/false)

**Response:**
```json
[
  {
    "id": "uuid",
    "codigo": "PROV001",
    "nombre": "Agropecuaria del Sur",
    "ruc": "80023456-7",
    "direccion": "San Lorenzo",
    "telefono": "+595981222222",
    "email": "ventas@agrosur.com",
    "activo": true,
    "tenantId": "uuid",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### GET /api/proveedores/:id
Get single proveedor by ID (includes recent 10 compras)

### POST /api/proveedores
Create new proveedor (User role required)

**Request Body:**
```json
{
  "codigo": "PROV001",
  "nombre": "Agropecuaria del Sur",
  "ruc": "80023456-7",
  "direccion": "San Lorenzo",
  "telefono": "+595981222222",
  "email": "ventas@agrosur.com"
}
```

### PUT /api/proveedores/:id
Update proveedor (User role required)

### DELETE /api/proveedores/:id
Deactivate proveedor (User role required)

---

## 💰 Ventas

### GET /api/ventas
Get all ventas for tenant

**Query Parameters:**
- `estado` (optional): PENDIENTE | COMPLETADA | CANCELADA
- `desde` (optional): Start date (ISO format)
- `hasta` (optional): End date (ISO format)

**Response:**
```json
[
  {
    "id": "uuid",
    "numero": "VTA001",
    "fecha": "2025-01-15T10:00:00.000Z",
    "clienteId": "uuid",
    "cliente": {
      "id": "uuid",
      "nombre": "Juan Pérez"
    },
    "subtotal": 360000,
    "impuesto": 36000,
    "total": 396000,
    "estado": "COMPLETADA",
    "observaciones": null,
    "tenantId": "uuid",
    "items": [
      {
        "id": "uuid",
        "productoId": "uuid",
        "producto": {
          "codigo": "PROD001",
          "nombre": "Alimento Balanceado 25kg"
        },
        "cantidad": 2,
        "precioUnit": 180000,
        "subtotal": 360000
      }
    ],
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  }
]
```

### GET /api/ventas/:id
Get single venta by ID

### POST /api/ventas
Create new venta (User role required)

**Important:** Stock is automatically decremented when venta is created

**Request Body:**
```json
{
  "numero": "VTA001",
  "clienteId": "uuid",
  "items": [
    {
      "productoId": "uuid",
      "cantidad": 2,
      "precioUnit": 180000
    }
  ],
  "observaciones": "Entrega urgente"
}
```

### PUT /api/ventas/:id
Update venta status (User role required)

**Request Body:**
```json
{
  "estado": "COMPLETADA",
  "observaciones": "Entregado"
}
```

### DELETE /api/ventas/:id
Cancel venta (User role required)

**Important:** Stock is automatically restored when venta is cancelled

---

## 🛒 Compras

### GET /api/compras
Get all compras for tenant

**Query Parameters:**
- `estado` (optional): PENDIENTE | RECIBIDA | CANCELADA
- `desde` (optional): Start date (ISO format)
- `hasta` (optional): End date (ISO format)

**Response:**
```json
[
  {
    "id": "uuid",
    "numero": "COM001",
    "fecha": "2025-01-10T08:00:00.000Z",
    "proveedorId": "uuid",
    "proveedor": {
      "id": "uuid",
      "nombre": "Agropecuaria del Sur"
    },
    "subtotal": 300000,
    "impuesto": 30000,
    "total": 330000,
    "estado": "RECIBIDA",
    "observaciones": null,
    "tenantId": "uuid",
    "items": [
      {
        "id": "uuid",
        "productoId": "uuid",
        "producto": {
          "codigo": "PROD001",
          "nombre": "Alimento Balanceado 25kg"
        },
        "cantidad": 2,
        "precioUnit": 150000,
        "subtotal": 300000
      }
    ],
    "createdAt": "2025-01-10T08:00:00.000Z",
    "updatedAt": "2025-01-10T08:00:00.000Z"
  }
]
```

### GET /api/compras/:id
Get single compra by ID

### POST /api/compras
Create new compra (User role required)

**Important:** Stock is NOT updated on creation. Update to RECIBIDA to increment stock.

**Request Body:**
```json
{
  "numero": "COM001",
  "proveedorId": "uuid",
  "items": [
    {
      "productoId": "uuid",
      "cantidad": 10,
      "precioUnit": 150000
    }
  ],
  "observaciones": "Pedido especial"
}
```

### PUT /api/compras/:id
Update compra status (User role required)

**Important:** When status changes to RECIBIDA, stock is automatically incremented

**Request Body:**
```json
{
  "estado": "RECIBIDA",
  "observaciones": "Mercadería recibida en buen estado"
}
```

### DELETE /api/compras/:id
Cancel compra (User role required)

**Important:** If compra was RECIBIDA, stock is automatically decremented

---

## 🔒 Role-Based Access Control

### Roles
- **VIEWER**: Read-only access
- **USER**: Read + Write (CRUD operations)
- **ADMIN**: Full access including tenant management

### Endpoint Permissions

| Endpoint | VIEWER | USER | ADMIN |
|----------|--------|------|-------|
| GET (all) | ✅ | ✅ | ✅ |
| POST | ❌ | ✅ | ✅ |
| PUT | ❌ | ✅ | ✅ |
| DELETE | ❌ | ✅ | ✅ |
| Tenant Management | ❌ | ❌ | ✅ |

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "error": "Codigo and nombre are required"
}
```

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions. USER role required."
}
```

### 404 Not Found
```json
{
  "error": "Producto not found"
}
```

### 409 Conflict
```json
{
  "error": "Producto with this codigo already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to fetch productos"
}
```

---

## 🧪 Testing

### Using cURL

```bash
# Health check
curl http://localhost:5000/health

# Get productos (with auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "X-Tenant-ID: YOUR_TENANT_ID" \
     http://localhost:5000/api/productos

# Create producto
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "X-Tenant-ID: YOUR_TENANT_ID" \
     -H "Content-Type: application/json" \
     -d '{"codigo":"PROD001","nombre":"Test Product","precioCompra":100,"precioVenta":150,"unidadMedida":"kg"}' \
     http://localhost:5000/api/productos
```

### Using Postman

1. Import collection from `/api/postman-collection.json`
2. Set environment variables:
   - `BASE_URL`: http://localhost:5000
   - `AUTH_TOKEN`: Your Azure AD token
   - `TENANT_ID`: Your tenant UUID

---

## 🚀 Running the API

### Development
```bash
cd api
npm install
npm run dev
```

### Production
```bash
cd api
npm install
npm run build
npm start
```

### Environment Variables

Create `.env` file in `/api`:

```bash
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="file:./dev.db"

# CORS
CORS_ORIGIN=http://localhost:3000

# Azure AD (Optional - for server-side validation)
AZURE_CLIENT_ID=your_client_id
AZURE_TENANT_ID=organizations
```

---

## 📊 Database

### Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio
```

---

## 🔄 Multi-Tenant Architecture

Every request must include `X-Tenant-ID` header. All queries are automatically scoped to the tenant:

```typescript
// Automatic tenant filtering
const productos = await prisma.producto.findMany({
  where: { tenantId }
})
```

**Row-Level Security** ensures users can only access data from their tenant.

---

## 📝 Changelog

### v1.0.0 (2025-12-17)
- ✅ Complete CRUD for 6 resources
- ✅ Multi-tenant architecture
- ✅ Azure AD authentication
- ✅ Role-based access control
- ✅ Automatic stock management
- ✅ TypeScript support
- ✅ Prisma ORM integration
