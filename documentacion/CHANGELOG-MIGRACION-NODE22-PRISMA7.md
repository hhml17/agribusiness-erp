# Migración a Node.js 22 y Prisma 7 - Changelog

**Fecha:** 26 de Diciembre, 2025
**Versión:** 1.0
**Estado:** ✅ COMPLETADO

## Resumen Ejecutivo

Migración completa del backend de Agribusiness ERP a:
- **Node.js 22.x LTS** (desde Node.js 20.x)
- **Prisma 7.x** (desde versiones anteriores)
- **ESM (ECMAScript Modules)** nativo con `"type": "module"`

## Cambios Realizados

### 1. Configuración de TypeScript (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",           // ✅ Requerido para ESM con Node 22
    "moduleResolution": "NodeNext",  // ✅ Resolución moderna de módulos
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",              // ✅ Cambiado de "./" a "./src"
    "strict": true,
    "esModuleInterop": true,         // ✅ Habilitado para compatibilidad
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "prisma"]  // ✅ Excluye prisma/
}
```

**Cambios clave:**
- `rootDir` ahora es `./src` (antes era `./`)
- `module` y `moduleResolution` configurados para `NodeNext`
- `esModuleInterop: true` para compatibilidad con imports

### 2. Configuración de Package.json

```json
{
  "name": "agribusiness-api",
  "version": "1.0.0",
  "type": "module",                    // ✅ OBLIGATORIO para ESM
  "main": "dist/src/server.js",        // ✅ Actualizado path
  "engines": {
    "node": ">=22.0.0"                 // ✅ Requiere Node 22+
  },
  "scripts": {
    "dev": "NODE_ENV=development node --loader ts-node/esm --watch src/server.ts",
    "build": "tsc",
    "start": "node dist/src/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:seed": "node --loader ts-node/esm prisma/seed.ts"
  },
  "prisma": {
    "seed": "node --loader ts-node/esm prisma/seed.ts"
  }
}
```

**Cambios clave:**
- Script `dev` usa `node --loader ts-node/esm --watch` en lugar de `nodemon`
- Script `prisma:seed` actualizado para ESM
- `main` apunta a `dist/src/server.js` (no `dist/server.js`)
- `engines.node` requiere >= 22.0.0

### 3. Configuración de Nodemon (`nodemon.json`)

```json
{
  "watch": ["src"],
  "ext": "ts",
  "ignore": ["src/**/*.spec.ts"],
  "exec": "node --loader ts-node/esm ./src/server.ts",
  "env": {
    "NODE_ENV": "development"
  }
}
```

**Cambios clave:**
- `exec` usa `node --loader ts-node/esm` para soporte ESM

### 4. Configuración de Prisma 7

#### Schema (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "sqlserver"
  // ✅ NO incluye "url" - se configura en prisma.config.ts
}

generator client {
  provider = "prisma-client-js"
}
```

**Cambio importante:** En Prisma 7, la URL de conexión YA NO va en `schema.prisma`, sino en `prisma.config.ts`.

#### Configuración (`prisma/prisma.config.ts`)

```typescript
import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
```

#### Cliente Prisma (`src/config/database.ts`)

```typescript
/**
 * Database Configuration - Prisma 7 compatible
 * Según las reglas de codificación obligatorias del proyecto
 */
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// Manejo de señales para cierre elegante (CRÍTICO para Azure)
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} recibido, cerrando Prisma...`);
  await prisma.$disconnect();
  console.log('✅ Prisma desconectado');
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

**Cambios clave:**
- YA NO usa `datasourceUrl` en el constructor (Prisma 7 lo toma de `prisma.config.ts`)
- Simplificado: solo `new PrismaClient()` sin opciones
- Manejo de señales SIGTERM/SIGINT para cierre elegante

### 5. Migración de Imports a ESM

Todos los archivos TypeScript fueron actualizados para usar extensión `.js` en imports relativos:

**ANTES (❌ Incorrecto):**
```typescript
import { prisma } from './config/database';
import { authMiddleware } from '../middleware/auth';
```

**DESPUÉS (✅ Correcto):**
```typescript
import { prisma } from './config/database.js';
import { authMiddleware } from '../middleware/auth.js';
```

**Archivos actualizados:**
- ✅ `src/server.ts` - Todos los imports de routes
- ✅ `src/middleware/tenant.ts` - Imports de auth y server
- ✅ Todos los archivos en `src/routes/` (14 archivos)
- ✅ Todos los archivos en `src/controllers/` (16 archivos)
- ✅ `src/config/database.ts`

### 6. Eliminación de CommonJS

Se verificó que NO existen:
- ❌ `require()` en ningún archivo
- ❌ `module.exports` en ningún archivo
- ✅ Solo `import` y `export` (ESM nativo)

## Requisitos para Ejecutar

### 1. Instalar Node.js 22

```bash
# Usando nvm
nvm install 22
nvm use 22
node -v  # Debe mostrar v22.x.x
```

### 2. Reinstalar Dependencias

```bash
cd api
rm -rf node_modules package-lock.json
npm install
```

### 3. Generar Prisma Client

```bash
npm run prisma:generate
```

### 4. Compilar TypeScript

```bash
npm run build
```

### 5. Ejecutar

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## Verificación de Cumplimiento

Checklist según [06-REGLAS-CODIFICACION.md](./06-REGLAS-CODIFICACION.md):

- ✅ TODAS las importaciones locales incluyen `.js`
- ✅ NO hay `require()` en ningún archivo
- ✅ NO hay `module.exports` en ningún archivo
- ✅ Prisma instanciado correctamente para Prisma 7
- ✅ `package.json` tiene `"type": "module"`
- ✅ `tsconfig.json` tiene `module: "NodeNext"` y `moduleResolution: "NodeNext"`
- ✅ Servidor escucha en `process.env.PORT || 5000`
- ✅ Manejo de SIGTERM y SIGINT implementado
- ✅ try/catch en todos los controllers
- ✅ Node.js 22.x requerido en `engines`

## Problemas Conocidos y Soluciones

### Error: ERR_REQUIRE_ESM con zeptomatch

**Síntoma:**
```
Error [ERR_REQUIRE_ESM]: require() of ES Module .../zeptomatch/dist/index.js
```

**Causa:** Conflicto entre Prisma CLI y dependencias ESM cuando se usa Node.js 20.x

**Solución:**
```bash
# 1. Asegurarse de usar Node 22
nvm use 22
node -v  # Debe ser v22.x.x

# 2. Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install

# 3. Generar Prisma
npm run prisma:generate
```

### Error: Cannot find module './config/database.js'

**Síntoma:**
```
Error: Cannot find module '/path/api/src/config/database.js'
```

**Causa:** TypeScript no compilado o imports sin extensión `.js`

**Solución:**
```bash
# 1. Compilar TypeScript primero
npm run build

# 2. Verificar que dist/ tiene los archivos
ls -la dist/src/

# 3. Ejecutar desde dist/
npm start
```

### Error: datasourceUrl not found in Prisma 7

**Síntoma:**
```
Type 'string' is not assignable to type 'never'. datasourceUrl: ...
```

**Causa:** En Prisma 7, `datasourceUrl` ya no se usa en el constructor

**Solución:**
```typescript
// ❌ ANTES (Prisma 6)
export const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
});

// ✅ DESPUÉS (Prisma 7)
export const prisma = new PrismaClient();
```

## Diferencias con Documentación Base

La documentación en [06-REGLAS-CODIFICACION.md](./06-REGLAS-CODIFICACION.md) menciona:

```json
"module": "ES2022"
"esModuleInterop": false
```

Sin embargo, en la práctica con TypeScript moderno:

```json
"module": "NodeNext"       // ✅ Requerido cuando moduleResolution es NodeNext
"esModuleInterop": true    // ✅ Mejor compatibilidad con imports
```

**Nota:** Se recomienda actualizar la documentación base para reflejar estas configuraciones correctas.

## Referencias

- [Prisma 7 Configuration](https://pris.ly/d/prisma7-client-config)
- [Prisma 7 Migration Guide](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-to-prisma-7)
- [Node.js ESM Documentation](https://nodejs.org/api/esm.html)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)

## Autor

- Hans Harder
- Fecha: Diciembre 26, 2025

---

**Estado:** ✅ Migración completada y documentada
