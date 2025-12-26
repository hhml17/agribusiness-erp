# INSTRUCCIONES PARA COMPLETAR MÓDULOS DE ACTORES Y EMPRESA

## ✅ TRABAJO COMPLETADO

Se han implementado exitosamente los siguientes componentes:

### 1. Modelos de Base de Datos (Prisma)

✅ **Actor** - Gestión de personas físicas y jurídicas
- Soporta tipos: FISICA, JURIDICA
- Campos obligatorios: tipoDocumento, numeroDocumento, nombre, nombreFantasia
- Roles múltiples: esCliente, esProveedor, esAsociado

✅ **ActorCuentaContable** - Configuración contable por rol y moneda
- Permite configurar cuenta contable diferente para cada rol (CLIENTE, PROVEEDOR, ASOCIADO)
- Soporte para múltiples monedas (USD, PYG)

✅ **EstanciaMejorada** - Centros de costo mejorados
- Código único por estancia
- Datos técnicos: superficie, capacidad UA, tipo de propiedad
- Datos de alquiler (si aplica)

✅ **Talonario** - Control de timbrados de facturación
- Gestión de timbrados SET Paraguay
- Control de numeración secuencial
- Establecimiento y punto de venta

✅ **FacturaEmitida** - Facturas y notas de crédito
- Numeración automática desde talonario
- Estados: EMITIDA, ANULADA, NOTA_CREDITO_APLICADA
- Vinculación con actores (clientes)

### 2. API Backend (Node.js + Express)

✅ **Controllers creados:**
- [actores.controller.ts](../api/src/controllers/actores.controller.ts)
- [estancias.controller.ts](../api/src/controllers/estancias.controller.ts)
- [talonarios.controller.ts](../api/src/controllers/talonarios.controller.ts)
- [facturasEmitidas.controller.ts](../api/src/controllers/facturasEmitidas.controller.ts)

✅ **Routes creados:**
- [actores.routes.ts](../api/src/routes/actores.routes.ts)
- [estancias.routes.ts](../api/src/routes/estancias.routes.ts)
- [talonarios.routes.ts](../api/src/routes/talonarios.routes.ts)
- [facturasEmitidas.routes.ts](../api/src/routes/facturasEmitidas.routes.ts)

✅ **Rutas registradas en servidor:**
- `/api/actores` - Gestión de actores
- `/api/actores/:id/cuentas` - Gestión de cuentas contables por actor
- `/api/estancias` - Gestión de estancias mejoradas
- `/api/talonarios` - Gestión de talonarios
- `/api/facturas-emitidas` - Emisión y gestión de facturas

### 3. Documentación

✅ [MODULO-ACTORES-EMPRESA.md](./Rules/MODULO-ACTORES-EMPRESA.md) - Documentación técnica completa

---

## ⏳ PRÓXIMOS PASOS

### Paso 1: Crear Migración de Base de Datos

```bash
cd api

# Crear migración
npx prisma migrate dev --name add_actores_empresa_modules

# Esto creará las tablas:
# - actores
# - actor_cuentas_contables
# - estancias_mejoradas
# - talonarios
# - facturas_emitidas
```

**Nota:** Asegúrate de que la base de datos esté configurada correctamente en el archivo `.env`

### Paso 2: Verificar que el Backend Inicia Correctamente

```bash
cd api
npm start

# Deberías ver:
# 🚀 Agribusiness API Server
# 📡 Port: 5000
# ✅ Server is running
```

Luego verifica los endpoints en: `http://localhost:5000/api`

### Paso 3: Pruebas de API con cURL o Postman

#### 3.1 Crear un Actor (Persona Física - Cliente)

```bash
curl -X POST http://localhost:5000/api/actores \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: YOUR_TENANT_ID" \
  -d '{
    "tipoPersona": "FISICA",
    "tipoDocumento": "CI",
    "numeroDocumento": "1234567",
    "nombre": "Juan",
    "apellido": "Pérez",
    "nombreFantasia": "Juan Pérez",
    "esCliente": true,
    "email": "juan@example.com",
    "telefono": "0981123456"
  }'
```

#### 3.2 Crear un Actor (Persona Jurídica - Proveedor)

```bash
curl -X POST http://localhost:5000/api/actores \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: YOUR_TENANT_ID" \
  -d '{
    "tipoPersona": "JURIDICA",
    "tipoDocumento": "RUC",
    "numeroDocumento": "80012345",
    "dv": "6",
    "nombre": "Empresa ABC S.A.",
    "nombreFantasia": "ABC",
    "razonSocial": "Empresa ABC Sociedad Anónima",
    "esProveedor": true,
    "representanteLegal": "María González",
    "email": "contacto@abc.com.py"
  }'
```

#### 3.3 Crear Estancia Mejorada

```bash
curl -X POST http://localhost:5000/api/estancias \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: YOUR_TENANT_ID" \
  -d '{
    "centroCostoId": "YOUR_CENTRO_COSTO_ID",
    "codigo": "EST-001",
    "nombre": "Fondo Cría - Estancia Don Federico",
    "descripcion": "Estancia dedicada a la cría de ganado bovino",
    "ciudad": "San Pedro",
    "departamento": "San Pedro",
    "superficie": 1500,
    "superficieUtil": 1200,
    "capacidadUA": 800,
    "tipoPropiedad": "PROPIA",
    "responsable": "Pedro González",
    "telefono": "0971123456"
  }'
```

#### 3.4 Crear Talonario

```bash
curl -X POST http://localhost:5000/api/talonarios \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: YOUR_TENANT_ID" \
  -d '{
    "tipoComprobante": "FACTURA",
    "numeroTimbrado": "12345678",
    "fechaVigenciaDesde": "2025-01-01",
    "fechaVigenciaHasta": "2025-12-31",
    "establecimiento": "001",
    "puntoVenta": "001",
    "numeroInicial": 1,
    "numeroFinal": 10000,
    "descripcion": "Talonario principal de facturas"
  }'
```

#### 3.5 Emitir Factura

```bash
curl -X POST http://localhost:5000/api/facturas-emitidas \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: YOUR_TENANT_ID" \
  -d '{
    "talonarioId": "YOUR_TALONARIO_ID",
    "tipoComprobante": "FACTURA",
    "nombreCliente": "Juan Pérez",
    "rucCliente": "1234567-8",
    "fecha": "2025-12-26",
    "condicionVenta": "CONTADO",
    "subtotal": 1000000,
    "iva10": 100000,
    "total": 1100000,
    "moneda": "PYG"
  }'
```

### Paso 4: Crear Componentes React (Frontend)

Ahora necesitas crear los componentes React para la interfaz de usuario. Estructura sugerida:

```
app/src/
├── pages/
│   ├── Actores/
│   │   ├── ActoresListPage.tsx
│   │   ├── ActorFormPage.tsx
│   │   └── ActorDetailPage.tsx
│   ├── Estancias/
│   │   ├── EstanciasListPage.tsx
│   │   └── EstanciaFormPage.tsx
│   ├── Talonarios/
│   │   ├── TalonariosListPage.tsx
│   │   └── TalonarioFormPage.tsx
│   └── Facturacion/
│       ├── FacturasListPage.tsx
│       └── EmitirFacturaPage.tsx
├── components/
│   ├── Actores/
│   │   ├── ActorCard.tsx
│   │   ├── ActorForm.tsx
│   │   ├── ActorCuentasTable.tsx
│   │   └── ActorCuentaForm.tsx
│   ├── Estancias/
│   │   ├── EstanciaCard.tsx
│   │   └── EstanciaForm.tsx
│   └── Talonarios/
│       ├── TalonarioCard.tsx
│       └── TalonarioForm.tsx
└── services/
    ├── actoresService.ts
    ├── estanciasService.ts
    ├── talonariosService.ts
    └── facturasService.ts
```

### Paso 5: Configurar Navegación

Agregar las nuevas páginas al router de React:

```typescript
// app/src/App.tsx o router config

import ActoresListPage from './pages/Actores/ActoresListPage';
import EstanciasListPage from './pages/Estancias/EstanciasListPage';
import TalonariosListPage from './pages/Talonarios/TalonariosListPage';

// ... en tu configuración de rutas:
{
  path: '/actores',
  element: <ActoresListPage />
},
{
  path: '/actores/:id',
  element: <ActorDetailPage />
},
{
  path: '/estancias',
  element: <EstanciasListPage />
},
{
  path: '/talonarios',
  element: <TalonariosListPage />
},
{
  path: '/facturacion',
  element: <FacturasListPage />
}
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Backend
- [x] Modelos Prisma creados
- [x] Controllers implementados
- [x] Routes implementados
- [x] Rutas registradas en servidor
- [x] Cliente Prisma generado
- [ ] Migración de BD ejecutada
- [ ] Endpoints probados con Postman/cURL
- [ ] Tests unitarios escritos

### Frontend
- [ ] Servicios API creados
- [ ] Páginas de listado implementadas
- [ ] Formularios de creación/edición
- [ ] Componentes reutilizables
- [ ] Navegación configurada
- [ ] Validación de formularios
- [ ] Manejo de errores

### Documentación
- [x] Documentación técnica completa
- [x] Casos de uso documentados
- [x] Ejemplos de API
- [ ] Guía de usuario (UI)

---

## 🔍 ENDPOINTS DISPONIBLES

### Actores
```
GET    /api/actores
GET    /api/actores/:id
POST   /api/actores
PUT    /api/actores/:id
DELETE /api/actores/:id
GET    /api/actores/:id/cuentas
POST   /api/actores/:id/cuentas
DELETE /api/actores/:id/cuentas/:cuentaId
```

### Estancias
```
GET    /api/estancias
GET    /api/estancias/:id
POST   /api/estancias
PUT    /api/estancias/:id
DELETE /api/estancias/:id
```

### Talonarios
```
GET    /api/talonarios
GET    /api/talonarios/:id
POST   /api/talonarios
PUT    /api/talonarios/:id
DELETE /api/talonarios/:id
```

### Facturas Emitidas
```
GET    /api/facturas-emitidas
GET    /api/facturas-emitidas/:id
POST   /api/facturas-emitidas
PUT    /api/facturas-emitidas/:id/anular
```

---

## 🚨 CONSIDERACIONES IMPORTANTES

1. **Multi-tenancy**: Todos los endpoints requieren el header `x-tenant-id`
2. **Autenticación**: Se debe implementar el middleware de autenticación
3. **Validaciones**: Los controllers tienen validaciones básicas, considera agregar Zod schemas
4. **Transacciones**: La emisión de facturas usa transacciones de Prisma para garantizar consistencia
5. **Soft Delete**: Los deletes son soft deletes (activo = false)
6. **Numeración**: Los talonarios manejan numeración secuencial automática

---

## 📚 DOCUMENTACIÓN ADICIONAL

- [MODULO-ACTORES-EMPRESA.md](./Rules/MODULO-ACTORES-EMPRESA.md) - Documentación técnica detallada
- [06-REGLAS-CODIFICACION.md](./Rules/06-REGLAS-CODIFICACION.md) - Reglas de codificación del proyecto
- [04-SCHEMA-DATABASE.md](./Rules/04-SCHEMA-DATABASE.md) - Schema completo de base de datos

---

## 🎯 PRÓXIMAS MEJORAS SUGERIDAS

1. **Validación con Zod**: Agregar schemas de validación completos
2. **Tests**: Implementar tests unitarios y de integración
3. **Búsqueda avanzada**: Agregar filtros y búsqueda full-text
4. **Exportación**: Permitir exportar a Excel/PDF
5. **Auditoría**: Registrar todos los cambios en tabla de auditoría
6. **Notificaciones**: Alertas cuando talonarios estén por agotarse
7. **Dashboard**: Métricas y gráficos de actores y facturación

---

**Creado:** Diciembre 26, 2025
**Autor:** Claude Code + Hans
**Estado:** Backend completo - Frontend pendiente
