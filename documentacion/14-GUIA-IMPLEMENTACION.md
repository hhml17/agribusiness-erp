# 14 - GUÍA DE IMPLEMENTACIÓN

## FASE 1: SETUP INICIAL (Semana 1-2)

### 1.1 Crear Repositorio y Estructura

```bash
# Clonar o crear repo
git clone https://github.com/hhml17/agribusiness.git
cd agribusiness

# Crear estructura de carpetas
mkdir -p docs frontend backend database scripts

# Copiar documentación
cp /path/to/docs/* docs/

# Inicializar git
git init
git add .
git commit -m "Initial commit - structure and documentation"
```

### 1.2 Configurar Backend (Node.js + Express)

```bash
cd backend

# Inicializar proyecto
npm init -y

# Instalar dependencias principales
npm install express cors dotenv
npm install -D typescript ts-node @types/node @types/express

# Instalar Prisma
npm install @prisma/client
npm install -D prisma

# Instalar validación y autenticación
npm install zod jsonwebtoken axios

# Instalar desarrollo
npm install -D nodemon prettier eslint

# Crear estructura
npx tsc --init
touch .env .env.example src/index.ts

# Crear carpetas
mkdir -p src/{controllers,services,middleware,routes,models,validators,utils,types,config,constants}
```

**package.json scripts:**
```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "ts-node prisma/seed.ts"
  }
}
```

### 1.3 Configurar Frontend (React + TypeScript)

```bash
cd ../frontend

# Crear proyecto Vite
npm create vite@latest . -- --template react-ts

# Instalar dependencias
npm install
npm install axios react-router-dom @tanstack/react-query zustand

# Instalar UI components
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Instalar herramientas
npm install -D typescript-eslint

# Crear estructura
mkdir -p src/{components,modules,hooks,services,utils,store,types,styles,pages}
```

### 1.4 Configurar Base de Datos (Azure SQL)

```bash
# En Azure Portal:
1. Crear SQL Server
2. Crear Base de Datos (agribusiness-db)
3. Configurar firewall para acceso local
4. Obtener connection string

# Crear archivo .env en backend/
DATABASE_URL="sqlserver://server:password@agribusiness.database.windows.net:1433;database=agribusiness-db;encrypt=true;trustServerCertificate=false;connection timeout=30"

# Inicializar Prisma
npx prisma init

# Copiar schema.prisma (desde documentación)
cp /path/to/04-SCHEMA-DATABASE.md prisma/schema.prisma

# Crear migración inicial
npx prisma migrate dev --name init

# Verificar conexión
npx prisma studio
```

---

## FASE 2: AUTENTICACIÓN AZURE AD (Semana 2-3)

### 2.1 Configurar Azure AD

```bash
# En Azure Portal:
1. Ir a Azure Active Directory
2. Registrar nueva aplicación (App Registration)
3. Anotar:
   - Application (client) ID
   - Directory (tenant) ID
4. Crear Client Secret
5. Configurar Redirect URI: http://localhost:3000/auth/callback
6. Otorgar permisos: User.Read, Directory.Read.All
```

### 2.2 Backend - Autenticación

```typescript
// backend/src/utils/azure-ad.ts

import axios from 'axios';
import jwt from 'jsonwebtoken';

const AZURE_AD_TENANT_ID = process.env.AZURE_AD_TENANT_ID;
const AZURE_AD_CLIENT_ID = process.env.AZURE_AD_CLIENT_ID;
const AZURE_AD_CLIENT_SECRET = process.env.AZURE_AD_CLIENT_SECRET;

export async function verifyToken(token: string) {
  try {
    // Obtener key pública de Azure AD
    const response = await axios.get(
      `https://login.microsoftonline.com/${AZURE_AD_TENANT_ID}/discovery/v2.0/keys`
    );
    
    // Verificar token con key pública
    const decoded = jwt.verify(token, getPublicKey(), {
      algorithms: ['RS256']
    });
    
    return decoded;
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
}

export async function exchangeCodeForToken(code: string, redirectUri: string) {
  const response = await axios.post(
    `https://login.microsoftonline.com/${AZURE_AD_TENANT_ID}/oauth2/v2.0/token`,
    {
      client_id: AZURE_AD_CLIENT_ID,
      client_secret: AZURE_AD_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      scope: 'https://graph.microsoft.com/.default'
    }
  );
  
  return response.data;
}

export async function getUserInfo(accessToken: string) {
  const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  return response.data;
}
```

### 2.3 Frontend - Autenticación

```typescript
// frontend/src/hooks/useAuth.ts

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si hay token en localStorage
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Validar token con backend
      fetch('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser(data.user);
          } else {
            localStorage.removeItem('auth_token');
            navigate('/login');
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [navigate]);

  const login = (code: string) => {
    return fetch('/api/auth/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    })
      .then(res => res.json())
      .then(data => {
        localStorage.setItem('auth_token', data.token);
        setUser(data.user);
        navigate('/dashboard');
      });
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    navigate('/login');
  };

  return { user, loading, login, logout };
}
```

---

## FASE 3: SETUP BÁSICO (Semana 3)

### 3.1 Middleware Base

```typescript
// backend/src/middleware/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/azure-ad';
import { prisma } from '../config/database';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ error: 'Sin token' });

    const decoded = await verifyToken(token);
    
    const user = await prisma.usuario.findUnique({
      where: { azureAdId: decoded.oid },
      include: { roles: { include: { permisos: true } } }
    });

    if (!user || !user.activo) {
      return res.status(403).json({ error: 'Usuario no encontrado' });
    }

    req.user = {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      roles: user.roles.map(r => r.nombre),
      permisos: user.roles
        .flatMap(r => r.permisos)
        .map(p => p.codigo)
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'No autorizado' });
  }
}
```

### 3.2 Ruta de Prueba

```typescript
// backend/src/routes/health.routes.ts

import { Router, Request, Response } from 'express';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

export default router;
```

### 3.3 Servidor Principal

```typescript
// backend/src/index.ts

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoutes from './routes/health.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(express.json());
app.use(cors());

// Rutas
app.use('/api', healthRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
```

### 3.4 Tests Iniciales

```bash
# Probar backend
curl http://localhost:3001/api/health

# Respuesta esperada:
{"status":"OK","timestamp":"2025-03-20T..."}
```

---

## FASE 4: CRUD BÁSICO - MÓDULO GANADO (Semana 4-5)

### 4.1 Validador de Bovino

```typescript
// backend/src/validators/bovino.validator.ts

import { z } from 'zod';

export const crearBovinoSchema = z.object({
  numeroCaravana: z.string().min(1, 'Caravana requerida'),
  tipoAnimal: z.enum(['Toro', 'Vaca', 'Ternero', 'Ternera', 'Vaquillona']),
  sexo: z.enum(['M', 'F']),
  raza: z.string().optional(),
  peso: z.number().min(0).optional(),
  centroId: z.string().uuid('Centro requerido')
});

export type CreateBovinoInput = z.infer<typeof crearBovinoSchema>;
```

### 4.2 Service de Bovino

```typescript
// backend/src/services/bovino.service.ts

import { prisma } from '../config/database';
import type { CreateBovinoInput } from '../validators/bovino.validator';

export class BovinoService {
  async getBovinosData(tenantId: string, filtros?: any) {
    return prisma.bovino.findMany({
      where: {
        tenantId,
        ...filtros
      },
      select: {
        id: true,
        numeroCaravana: true,
        tipoAnimal: true,
        raza: true,
        peso: true,
        estadoActual: true
      }
    });
  }

  async getBovinoById(tenantId: string, bovinoId: string) {
    return prisma.bovino.findUnique({
      where: { id: bovinoId }
    });
  }

  async createBovino(tenantId: string, datos: CreateBovinoInput) {
    return prisma.bovino.create({
      data: {
        ...datos,
        tenantId,
        estadoActual: 'Vivo',
        centroId: datos.centroId
      }
    });
  }

  async updateBovino(tenantId: string, bovinoId: string, datos: any) {
    return prisma.bovino.update({
      where: { id: bovinoId },
      data: datos
    });
  }
}

export const bovinoService = new BovinoService();
```

### 4.3 Controller de Bovino

```typescript
// backend/src/controllers/bovino.controller.ts

import { Request, Response } from 'express';
import { bovinoService } from '../services/bovino.service';
import { crearBovinoSchema } from '../validators/bovino.validator';

export async function getBovinosData(req: Request, res: Response) {
  try {
    const bovinosData = await bovinoService.getBovinosData(req.user.tenantId);
    res.json(bovinosData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createBovino(req: Request, res: Response) {
  try {
    const datos = crearBovinoSchema.parse(req.body);
    const bovino = await bovinoService.createBovino(req.user.tenantId, datos);
    res.status(201).json(bovino);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getBovino(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const bovino = await bovinoService.getBovinoById(req.user.tenantId, id);
    if (!bovino) return res.status(404).json({ error: 'No encontrado' });
    res.json(bovino);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### 4.4 Rutas de Bovino

```typescript
// backend/src/routes/bovino.routes.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermissions } from '../middleware/authorization.middleware';
import {
  getBovinosData,
  createBovino,
  getBovino
} from '../controllers/bovino.controller';

const router = Router();

router.get(
  '/:tenantId/bovinosData',
  authMiddleware,
  requirePermissions('bovino:view'),
  getBovinosData
);

router.post(
  '/:tenantId/bovinosData',
  authMiddleware,
  requirePermissions('bovino:create'),
  createBovino
);

router.get(
  '/:tenantId/bovinosData/:id',
  authMiddleware,
  requirePermissions('bovino:view'),
  getBovino
);

export default router;
```

### 4.5 Frontend - Página de Bovinosdata

```typescript
// frontend/src/modules/ganado/pages/InventarioPage.tsx

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBovinos } from '@/modules/ganado/hooks/useBovinosData';
import BovinoTable from '@/modules/ganado/components/BovinoTable';

export default function InventarioPage() {
  const { user } = useAuth();
  const { bovinosData, loading, error } = useBovinos(user?.tenantId);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Inventario de Ganado</h1>
      <BovinoTable data={bovinosData} />
    </div>
  );
}
```

---

## FASE 5: TESTING Y CIERRE

### 5.1 Tests Unitarios

```bash
cd backend
npm install -D jest @types/jest ts-jest
npx jest --init

# Escribir tests para services
npm test
```

### 5.2 Documentación de API

```bash
# Generar documentación Swagger
npm install swagger-jsdoc swagger-ui-express
npm install -D @types/swagger-jsdoc @types/swagger-ui-express
```

### 5.3 Deploy a Azure

```bash
# Crear Azure App Service
az appservice plan create \
  --name agribusiness-plan \
  --resource-group agribusiness-rg \
  --sku B1

az webapp create \
  --resource-group agribusiness-rg \
  --plan agribusiness-plan \
  --name agribusiness-backend \
  --runtime "node|18"

# Configurar variables de entorno
az webapp config appsettings set \
  --name agribusiness-backend \
  --resource-group agribusiness-rg \
  --settings \
    DATABASE_URL=$DATABASE_URL \
    AZURE_AD_TENANT_ID=$TENANT_ID \
    AZURE_AD_CLIENT_ID=$CLIENT_ID
```

---

## CHECKLIST POR FASE

### ✅ FASE 1 (Setup)
- [ ] Repo creado con estructura
- [ ] Backend inicializado con Express
- [ ] Frontend inicializado con React
- [ ] Azure SQL conectado
- [ ] Prisma schema aplicado
- [ ] Tests de conexión pasados

### ✅ FASE 2 (Autenticación)
- [ ] Azure AD app registrada
- [ ] Middleware de autenticación funcionando
- [ ] Login en frontend integrado
- [ ] Logout funcionando

### ✅ FASE 3 (Roles y Permisos)
- [ ] Permisos creados en DB
- [ ] Roles predefinidos creados
- [ ] Middleware de autorización funcionando
- [ ] Usuario admin creado

### ✅ FASE 4 (Ganado)
- [ ] CRUD completo de bovinos
- [ ] Validación de datos
- [ ] Tests pasados
- [ ] UI básica funcionando

### ✅ FASE 5 (Operaciones)
- [ ] CRUD de operaciones
- [ ] Vinculación bovino-operación
- [ ] Generación de asientos

### ✅ FASE 6 (Financiero)
- [ ] Plan de cuentas creado
- [ ] Asientos contables funcionando
- [ ] Reportes básicos

### ✅ FASE 7 (Reportes)
- [ ] Dashboard básico
- [ ] Exportación Excel
- [ ] Gráficos funcionales

---

## COMANDO ÚTILES

```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Tests
npm test

# Linting
npm run lint

# Migrations BD
npx prisma migrate dev
npx prisma studio

# Deploy
npm run deploy
```

---

**Próximo:** Consultar [14-INTEGRACIONES.md](./15-INTEGRACIONES.md) para integraciones con Azure AD, SENACSA, etc.

---

**Actualizado:** Diciembre 2025
