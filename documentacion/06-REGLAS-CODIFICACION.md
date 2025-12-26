# 06 - REGLAS DE CODIFICACIÓN - PROYECTO AGRIBUSINESS ERP

## 1. PERFIL TECNOLÓGICO OBLIGATORIO

### 1.1 Versiones y Runtime

```
├── Node.js:        22.x LTS (mandatorio)
├── TypeScript:     5.x+
├── Prisma:        7.x (último)
├── React:         18.x+ (frontend)
├── Package.json:  "type": "module" (obligatorio)
└── Target ES:     ES2022 (NodeNext)
```

### 1.2 Package.json Base

```json
{
  "name": "agribusiness-backend",
  "version": "1.0.0",
  "type": "module",
  "engines": {
    "node": ">=22.0.0"
  },
  "scripts": {
    "dev": "NODE_ENV=development node --loader ts-node/esm --watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "node --loader ts-node/esm prisma/seed.ts",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write src"
  },
  "dependencies": {
    "@prisma/client": "^7.x.x",
    "express": "^4.x.x",
    "cors": "^2.x.x",
    "dotenv": "^16.x.x",
    "zod": "^3.x.x",
    "jsonwebtoken": "^9.x.x",
    "axios": "^1.x.x"
  },
  "devDependencies": {
    "@types/node": "^22.x.x",
    "@types/express": "^4.x.x",
    "typescript": "^5.x.x",
    "ts-node": "^10.x.x",
    "prisma": "^7.x.x",
    "prettier": "^3.x.x"
  }
}
```

### 1.3 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "NodeNext",
    "resolveJsonModule": true,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@controllers/*": ["src/controllers/*"],
      "@services/*": ["src/services/*"],
      "@middleware/*": ["src/middleware/*"],
      "@utils/*": ["src/utils/*"],
      "@config/*": ["src/config/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "prisma"]
}
```

---

## 2. REGLAS CRÍTICAS DE DESARROLLO

### 2.1 REGLA #1: Importaciones con Extensión `.js` (OBLIGATORIO)

**TODA importación relativa (archivos locales) DEBE incluir la extensión `.js`.**

Este es un REQUISITO de Node.js con ESM nativo. Sin la extensión, Node.js lanzará `ERR_MODULE_NOT_FOUND`.

#### ✅ CORRECTO:

```typescript
// backend/src/index.ts
import express from 'express';
import { prisma } from './config/database.js';
import { authMiddleware } from './middleware/auth.js';
import { BovinoController } from './controllers/bovino.js';
import type { Request, Response } from 'express';

// backend/src/controllers/bovino.ts
import { BovinoService } from '../services/bovino.js';
import { crearBovinoSchema } from '../validators/bovino.js';
import type { AuthRequest } from '../types/auth.js';

// backend/src/services/bovino.ts
import { prisma } from '../config/database.js';
import { registrarAccion } from '../utils/auditoria.js';
```

#### ❌ INCORRECTO (FALLARÁ):

```typescript
// NUNCA HACER ESTO
import { prisma } from './config/database';       // ❌ Sin .js
import { BovinoService } from '../services/bovino'; // ❌ Sin .js
import type { AuthRequest } from '../types/auth';   // ❌ Sin .js
```

#### Patrón Correcto Completo:

```typescript
// backend/src/routes/bovino.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requirePermissions } from '../middleware/authorization.js';
import {
  getBovinosData,
  createBovino,
  getBovino
} from '../controllers/bovino.js';

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

export default router;
```

### 2.2 REGLA #2: Instancia de Prisma (OBLIGATORIO)

**La instancia del cliente de Prisma SIEMPRE debe definirse de esta forma:**

#### ✅ CORRECTO:

```typescript
// backend/src/config/database.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL as string
});

// Manejo de conexión en desarrollo
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e: any) => {
    console.log('Query: ' + e.query);
    console.log('Params: ' + JSON.stringify(e.params));
    console.log('Duration: ' + e.duration + 'ms');
  });
}

// Desconectar al salir
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
```

#### ❌ INCORRECTO:

```typescript
// NUNCA HACER ESTO
const prisma = new PrismaClient(); // ❌ Sin datasourceUrl

// O esto
import prisma from '@prisma/client'; // ❌ Sintaxis incorrecta
```

### 2.3 REGLA #3: Prohibición Absoluta de CommonJS

**NO USAR `require()` NI `module.exports` bajo ninguna circunstancia.**

Usamos ESM nativo exclusivamente.

#### ✅ CORRECTO (ESM):

```typescript
// Importaciones
import express from 'express';
import { prisma } from './config/database.js';
import type { Request, Response } from 'express';

// Exportaciones
export const bovinoService = new BovinoService();
export default router;
export type { CreateBovinoInput };
```

#### ❌ INCORRECTO (CommonJS):

```typescript
// PROHIBIDO
const express = require('express');           // ❌ require()
module.exports = { bovinoService };           // ❌ module.exports
exports.default = router;                     // ❌ exports
const { prisma } = require('./config/db');    // ❌ require()
```

### 2.4 REGLA #4: Compatibilidad Azure App Service

**El servidor debe estar listo para Azure.**

#### ✅ CORRECTO:

```typescript
// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(express.json());
app.use(cors());

// Rutas
import bovinoRoutes from './routes/bovino.routes.js';
app.use('/api', bovinoRoutes);

// Health check para Azure
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

// Manejo elegante de señales (CRÍTICO para Azure)
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} recibido, cerrando gracefully...`);
  
  server.close(async () => {
    console.log('HTTP server cerrado');
    
    // Cerrar conexión Prisma
    await prisma.$disconnect();
    console.log('Prisma desconectado');
    
    process.exit(0);
  });
  
  // Timeout de 30 segundos
  setTimeout(() => {
    console.error('Forzando cierre...');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

#### .env Configuración:

```bash
# .env.example
PORT=3001
NODE_ENV=development
DATABASE_URL=sqlserver://server:password@agribusiness.database.windows.net:1433;database=agribusiness-db;encrypt=true;trustServerCertificate=false;connection timeout=30

AZURE_AD_TENANT_ID=your-tenant-id
AZURE_AD_CLIENT_ID=your-client-id
AZURE_AD_CLIENT_SECRET=your-secret

LOG_LEVEL=info
```

### 2.5 REGLA #5: Manejo de Errores

**TODOS los controladores DEBEN usar try/catch.**

#### ✅ CORRECTO:

```typescript
// backend/src/controllers/bovino.ts
import { Request, Response } from 'express';
import { bovinoService } from '../services/bovino.js';
import { crearBovinoSchema } from '../validators/bovino.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        tenantId: string;
        email: string;
        roles: string[];
        permisos: Set<string>;
      };
    }
  }
}

export async function getBovinosData(req: Request, res: Response): Promise<void> {
  try {
    const { tenantId } = req.params;

    // Validación crítica
    if (!req.user || tenantId !== req.user.tenantId) {
      res.status(403).json({
        error: 'No tienes acceso a este tenant'
      });
      return;
    }

    const bovinosData = await bovinoService.getBovinosData(req.user.tenantId);
    res.json(bovinosData);
  } catch (error: any) {
    console.error('Error en getBovinosData:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export async function createBovino(req: Request, res: Response): Promise<void> {
  try {
    // Validación
    const validationResult = crearBovinoSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        error: 'Validación fallida',
        details: validationResult.error.errors
      });
      return;
    }

    const bovino = await bovinoService.createBovino(
      req.user!.tenantId,
      validationResult.data
    );

    res.status(201).json(bovino);
  } catch (error: any) {
    console.error('Error en createBovino:', error.message);
    res.status(500).json({
      error: 'Error al crear bovino',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export async function updateBovino(req: Request, res: Response): Promise<void> {
  try {
    const { tenantId, id } = req.params;

    if (tenantId !== req.user?.tenantId) {
      res.status(403).json({ error: 'Acceso denegado' });
      return;
    }

    const bovino = await bovinoService.updateBovino(
      req.user.tenantId,
      id,
      req.body
    );

    res.json(bovino);
  } catch (error: any) {
    console.error('Error en updateBovino:', error.message);
    res.status(500).json({ error: error.message });
  }
}
```

---

## 3. ESTRUCTURA DE CARPETAS CON ESM

```
backend/
├── src/
│   ├── index.ts                    # Entry point
│   ├── server.ts                   # Configuración Express
│   │
│   ├── config/
│   │   ├── database.ts            # PrismaClient (OBLIGATORIO)
│   │   ├── azure-ad.ts
│   │   ├── logger.ts
│   │   └── constants.ts
│   │
│   ├── middleware/
│   │   ├── auth.ts                # Con import './database.js'
│   │   ├── authorization.ts
│   │   └── errorHandler.ts
│   │
│   ├── routes/
│   │   ├── index.ts
│   │   └── bovino.routes.ts       # Con import '../controllers/bovino.js'
│   │
│   ├── controllers/
│   │   └── bovino.ts              # Con import '../services/bovino.js'
│   │
│   ├── services/
│   │   └── bovino.ts              # Con import '../config/database.js'
│   │
│   ├── validators/
│   │   └── bovino.ts
│   │
│   ├── utils/
│   │   ├── auditoria.ts
│   │   └── helpers.ts
│   │
│   └── types/
│       ├── models.ts
│       ├── api.ts
│       └── auth.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts                    # Con import '../src/config/database.js'
│   └── migrations/
│
├── dist/                          # Output compilado (JavaScript)
├── package.json                   # "type": "module" OBLIGATORIO
├── tsconfig.json                  # Configurado para ESM
├── .env.example
└── .env (no versionar)
```

---

## 4. EJEMPLOS COMPLETOS CON ESM

### 4.1 Service (Prisma)

```typescript
// backend/src/services/bovino.ts
import { prisma } from '../config/database.js';
import { registrarAccion } from '../utils/auditoria.js';
import type { CreateBovinoInput, UpdateBovinoInput } from '../types/models.js';

export class BovinoService {
  async getBovinosData(tenantId: string) {
    return prisma.bovino.findMany({
      where: { tenantId, estadoActual: 'Vivo' },
      select: {
        id: true,
        numeroCaravana: true,
        tipoAnimal: true,
        raza: true,
        peso: true
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
        estadoActual: 'Vivo'
      }
    });
  }

  async updateBovino(tenantId: string, bovinoId: string, datos: UpdateBovinoInput) {
    return prisma.bovino.update({
      where: { id: bovinoId },
      data: datos
    });
  }

  async deleteBovino(tenantId: string, bovinoId: string) {
    return prisma.bovino.delete({
      where: { id: bovinoId }
    });
  }
}

export const bovinoService = new BovinoService();
```

### 4.2 Middleware (Con Prisma)

```typescript
// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/azure-ad.js';
import { prisma } from '../config/database.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        tenantId: string;
        email: string;
        roles: string[];
        permisos: Set<string>;
      };
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      res.status(401).json({ error: 'Token requerido' });
      return;
    }

    const decoded = await verifyToken(token);

    const user = await prisma.usuario.findUnique({
      where: { azureAdId: decoded.oid },
      include: {
        roles: {
          include: { permisos: true }
        }
      }
    });

    if (!user || !user.activo) {
      res.status(403).json({ error: 'Usuario no encontrado' });
      return;
    }

    req.user = {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      roles: user.roles.map(r => r.nombre),
      permisos: new Set(user.roles.flatMap(r => r.permisos.map(p => p.codigo)))
    };

    next();
  } catch (error: any) {
    console.error('Error en authMiddleware:', error.message);
    res.status(401).json({ error: 'No autorizado' });
  }
}
```

### 4.3 Routes (Con Importaciones)

```typescript
// backend/src/routes/bovino.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requirePermissions } from '../middleware/authorization.js';
import {
  getBovinosData,
  createBovino,
  getBovino,
  updateBovino,
  deleteBovino
} from '../controllers/bovino.js';

const router = Router();

// GET - Lista de bovinosdata
router.get(
  '/:tenantId/bovinosData',
  authMiddleware,
  requirePermissions('bovino:view'),
  getBovinosData
);

// GET - Detalle bovino
router.get(
  '/:tenantId/bovinosData/:id',
  authMiddleware,
  requirePermissions('bovino:view'),
  getBovino
);

// POST - Crear bovino
router.post(
  '/:tenantId/bovinosData',
  authMiddleware,
  requirePermissions('bovino:create'),
  createBovino
);

// PUT - Actualizar bovino
router.put(
  '/:tenantId/bovinosData/:id',
  authMiddleware,
  requirePermissions('bovino:edit'),
  updateBovino
);

// DELETE - Eliminar bovino
router.delete(
  '/:tenantId/bovinosData/:id',
  authMiddleware,
  requirePermissions('bovino:delete'),
  deleteBovino
);

export default router;
```

### 4.4 Main Server (index.ts)

```typescript
// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './config/database.js';
import { authMiddleware } from './middleware/auth.js';
import bovinoRoutes from './routes/bovino.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middlewares globales
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api', bovinoRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Error Handler Global
app.use((err: any, req: express.Request, res: express.Response) => {
  console.error('Error no capturado:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║  🌾 AGRIBUSINESS ERP - Backend            ║
║  ✅ Server iniciado exitosamente          ║
║  🔗 http://localhost:${PORT}             ║
║  🌍 Ambiente: ${NODE_ENV}                    ║
║  📚 Docs: http://localhost:${PORT}/api    ║
╚════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} recibido, iniciando cierre graceful...`);

  server.close(async () => {
    console.log('✅ HTTP server cerrado');

    await prisma.$disconnect();
    console.log('✅ Prisma desconectado');

    process.exit(0);
  });

  // Timeout de forzado después de 30 segundos
  setTimeout(() => {
    console.error('❌ Forzando cierre despues de 30s...');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

---

## 5. COMPILACIÓN Y EJECUCIÓN

### 5.1 Configurar npm scripts

```json
{
  "scripts": {
    "dev": "NODE_ENV=development node --loader ts-node/esm --watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "node --loader ts-node/esm prisma/seed.ts",
    "test": "node --loader ts-node/esm --test 'tests/**/*.test.ts'",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write 'src/**/*.ts'"
  }
}
```

### 5.2 Compilación

```bash
# Generar tipos de Prisma
npm run prisma:generate

# Compilar TypeScript a JavaScript
npm run build

# Output en dist/ - archivos .js listos para ejecutar
```

### 5.3 Ejecución

```bash
# Desarrollo (con watch y ts-node)
npm run dev

# Producción (compilado)
npm run build
npm start

# Prisma
npm run prisma:migrate   # Crear/aplicar migraciones
npm run prisma:seed      # Ejecutar seed
```

---

## 6. CHECKLIST DE CUMPLIMIENTO

Antes de hacer commit, verificar:

```
□ TODAS las importaciones locales incluyen .js
  Ej: import { X } from './path/file.js';

□ NO hay require() en ningún archivo
  Ej: const X = require('...'); ❌

□ NO hay module.exports
  Ej: module.exports = X; ❌

□ Prisma instanciado correctamente
  Ej: new PrismaClient({ datasourceUrl: process.env.DATABASE_URL })

□ package.json tiene "type": "module"

□ tsconfig.json tiene:
  - "module": "ES2022"
  - "moduleResolution": "NodeNext"

□ Servidor escucha en process.env.PORT || 3001

□ Manejo de SIGTERM y SIGINT implementado

□ try/catch en todos los controllers

□ Errores tipados como 'any' o 'Error'

□ Node.js 22.x instalado localmente
```

---

## 7. TROUBLESHOOTING COMÚN

### Error: `ERR_MODULE_NOT_FOUND`

**Causa:** Falta extensión `.js` en importación
**Solución:** Añadir `.js` a la importación relativa

```typescript
// ❌ ANTES
import { prisma } from './config/database';

// ✅ DESPUÉS
import { prisma } from './config/database.js';
```

### Error: `Cannot find module '@prisma/client'`

**Causa:** Prisma client no generado
**Solución:**
```bash
npm run prisma:generate
```

### Error: `ERR_UNSUPPORTED_DIR_IMPORT`

**Causa:** Intentar importar carpeta sin index.ts
**Solución:** Usar ruta completa a archivo `.ts`

```typescript
// ❌ ANTES
import { service } from '../services';

// ✅ DESPUÉS
import { service } from '../services/bovino.js';
```

### Error en desarrollo: `ERR_UNKNOWN_FILE_EXTENSION`

**Causa:** ts-node no configurado correctamente
**Solución:** Usar flag `--loader`
```bash
node --loader ts-node/esm src/index.ts
```

---

## 8. INTEGRACIÓN CON CLAUDE CODE

Al solicitar código a Claude Code, incluir al inicio:

```
⚠️ IMPORTANTE - Reglas de Codificación Obligatorias:

1. Node.js 22.x + ESM (type: "module")
2. TODAS las importaciones relativas DEBEN incluir .js
   Ej: import { X } from './path/file.js';
3. NO usar require() - solo import/export
4. Prisma: new PrismaClient({ datasourceUrl: ... })
5. Puerto: process.env.PORT || 3001
6. Manejo de SIGTERM/SIGINT para graceful shutdown
7. try/catch en todos los controllers

Generar código siguiendo estos estándares.
```

---

## RESUMEN EJECUTIVO

| Aspecto | Regla | Ejemplo |
|---------|-------|---------|
| **Importaciones** | Incluir .js | `import { X } from './file.js'` |
| **Exports** | ESM | `export const X = ...` |
| **Prisma** | Con datasourceUrl | `new PrismaClient({ datasourceUrl: ... })` |
| **Node.js** | 22.x LTS | `"engines": { "node": ">=22.0.0" }` |
| **Package.json** | "type": "module" | Obligatorio |
| **Puerto** | Variable | `process.env.PORT \|\| 3001` |
| **Shutdown** | Graceful | SIGTERM + SIGINT handlers |
| **Errores** | try/catch | En todos los controllers |

---

**¡ESTAS REGLAS SON OBLIGATORIAS PARA TODOS LOS ARCHIVOS DEL PROYECTO!**

**Creado:** Diciembre 26, 2025
**Versión:** 1.0
**Estado:** CRÍTICO - Aplicar a todo código nuevo
