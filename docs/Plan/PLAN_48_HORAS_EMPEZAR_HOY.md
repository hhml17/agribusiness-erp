# ⚡ PLAN ACCIÓN: PRÓXIMAS 48 HORAS

**Para**: Hans (hhml17)  
**Objetivo**: Tener local funcionando con SQL Server + Ganado module básico  
**Tiempo**: Viernes 17-18 de Diciembre (48 horas)  
**Resultado esperado**: Push a GitHub y ver deploy automático en Azure

---

## HOY (Viernes 17 - Tarde/Noche)

### HORA 1-2: Setup SQL Server Local

**Objetivo**: Poder conectar desde Prisma a SQL Server

#### Opción A: SQL Server Express (Recommended si no tienes)
```bash
# Windows:
# 1. Descargar SQL Server Express:
#    https://www.microsoft.com/es-es/sql-server/sql-server-downloads
# 2. Instalar (typical)
# 3. SQL Server Management Studio también

# Verificar que funciona:
sqlcmd -S localhost -U sa -P YourPassword123!

# Si funciona, deberías ver:
# 1>
```

**O si ya tienes SQL Server:** 
```bash
# Verificar conexión:
sqlcmd -S localhost\SQLEXPRESS -U sa -P YourPassword123!
```

#### Crear base de datos local:
```sql
CREATE DATABASE agribusiness;
GO
```

#### Actualizar .env.local:
```bash
# /agribusiness/.env.local
DATABASE_URL="sqlserver://localhost:1433;database=agribusiness;user id=sa;password=YourPassword123!;encrypt=true;trustServerCertificate=true;"
NODE_ENV=development
AZURE_CLIENT_ID=6df64cf9-c03e-43ed-93fa-fd61ca10dc84
AZURE_TENANT_ID=organizations
```

#### Verificar conexión desde Node:
```bash
cd /azure-functions

# Instalar dotenv si no está
npm install dotenv

# Crear archivo test:
# test-db.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const result = await prisma.$queryRaw`SELECT @@VERSION`;
    console.log('✅ Connected!', result);
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();

# Ejecutar:
node test-db.js
# Deberías ver: ✅ Connected! (con versión de SQL)
```

**Checkpoints:**
- [ ] SQL Server está corriendo
- [ ] sqlcmd conecta
- [ ] BD agribusiness existe
- [ ] Node.js conecta desde Prisma

---

### HORA 3-4: Expandir Schema Prisma (CRÍTICO)

**Archivo a editar**: `/azure-functions/src/prisma/schema.prisma`

**Lo que vamos a hacer:**
1. Copiar y pegar el schema expandido (te lo doy abajo)
2. Crear migration
3. Ejecutar localmente

#### Schema.prisma COMPLETO

Reemplaza TODO tu schema actual con esto:

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlserver"
  url      = env("DATABASE_URL")
}

// ==========================================
// CONFIGURACIÓN BASE
// ==========================================

model Empresa {
  id            String   @id @default(cuid())
  tenantId      String
  codigo        String
  nombre        String
  ruc           String?
  tipoEmpresa   String   @default("FONDO_INVERSION") // FONDO_INVERSION, ESTANCIA
  activo        Boolean  @default(true)
  
  estancias     Estancia[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([tenantId, codigo])
  @@index([tenantId])
}

model Estancia {
  id            String   @id @default(cuid())
  tenantId      String
  empresaId     String
  codigo        String
  nombre        String
  areaTotal     Decimal?
  areaExplotada Decimal?
  ubicacion     String?
  activo        Boolean  @default(true)
  
  empresa       Empresa  @relation(fields: [empresaId], references: [id], onDelete: Cascade)
  potreros      Potrero[]
  ganado        Ganado[]
  movimientos   MovimientoGanado[]
  movOrigenGanado    MovimientoGanado[] @relation("MovOrigen")
  movDestinoGanado   MovimientoGanado[] @relation("MovDestino")
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([tenantId, codigo])
  @@index([tenantId])
}

model Potrero {
  id            String   @id @default(cuid())
  tenantId      String
  estanciaId    String
  codigo        String
  nombre        String
  areaHa        Decimal?
  tipoSuelo     String?
  activo        Boolean  @default(true)
  
  estancia      Estancia @relation(fields: [estanciaId], references: [id], onDelete: Cascade)
  ganado        Ganado[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([tenantId, estanciaId, codigo])
  @@index([tenantId, estanciaId])
}

// ==========================================
// MÓDULO GANADO
// ==========================================

model CategoriaGanado {
  id              String   @id @default(cuid())
  tenantId        String
  codigo          String
  nombre          String
  especie         String   @default("BOVINO") // BOVINO, EQUINO
  sexo            String?  // MACHO, HEMBRA
  tipo            String   @default("PRODUCCION") // PRODUCCION, PERMANENTE, REPRODUCCION
  pesoPromedioKg  Decimal?
  edadMinMeses    Int?
  edadMaxMeses    Int?
  coeficienteUA   Decimal  @default(1.0)
  activo          Boolean  @default(true)
  
  ganado          Ganado[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([tenantId, codigo])
  @@index([tenantId])
}

model Ganado {
  id              String   @id @default(cuid())
  tenantId        String
  
  // Identificación
  caravana        String?
  lote            String?
  
  // Clasificación
  categoriaId     String
  categoria       CategoriaGanado @relation(fields: [categoriaId], references: [id], onDelete: Restrict)
  raza            String?
  
  // Ubicación
  estanciaId      String
  potreroId       String?
  
  estancia        Estancia @relation(fields: [estanciaId], references: [id], onDelete: Restrict)
  potrero         Potrero? @relation(fields: [potreroId], references: [id])
  
  // Datos biométricos
  pesoActualKg    Decimal?
  fechaPesaje     DateTime?
  fechaNacimiento DateTime?
  
  // Estado
  estado          String   @default("EN_CAMPO")
  
  // Valores
  costoUnitarioUSD  Decimal?
  valorActualUSD    Decimal?
  
  // Genealogía
  madreId         String?
  padreId         String?
  
  // Origen
  origenTipo      String?  // NACIMIENTO, COMPRA, TRANSFERENCIA
  documentoOrigen String?
  
  // Auditoría
  fechaIngreso    DateTime @default(now())
  fechaSalida     DateTime?
  
  movimientos     MovimientoGanado[]
  nacimientos     Nacimiento[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([tenantId, estanciaId, estado])
  @@index([tenantId, categoriaId])
}

model MovimientoGanado {
  id              String   @id @default(cuid())
  tenantId        String
  
  tipo            String   // NACIMIENTO, COMPRA, VENTA, FAENA, TRANSFERENCIA, MORTANDAD
  fecha           DateTime @default(now())
  
  ganadoId        String?
  ganado          Ganado?  @relation(fields: [ganadoId], references: [id])
  
  categoriaId     String?
  cantidad        Int      @default(1)
  pesoTotalKg     Decimal?
  
  estanciaOrigenId    String?
  estanciaDestinoId   String?
  
  estanciaOrigen      Estancia? @relation("MovOrigen", fields: [estanciaOrigenId], references: [id])
  estanciaDestino     Estancia? @relation("MovDestino", fields: [estanciaDestinoId], references: [id])
  
  valorUnitarioUSD    Decimal?
  valorTotalUSD       Decimal?
  
  documentoRef    String?
  numeroGuia      String?
  observaciones   String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([tenantId, fecha])
  @@index([tenantId, tipo])
}

model Nacimiento {
  id              String   @id @default(cuid())
  tenantId        String
  
  fecha           DateTime @default(now())
  estanciaId      String
  
  criaId          String?
  cria            Ganado?  @relation(fields: [criaId], references: [id])
  sexoCria        String?
  pesoCriaKg      Decimal?
  
  madreId         String?
  madre           Ganado?  @relation(fields: [madreId], references: [id])
  
  tipoParto       String   @default("NORMAL") // NORMAL, ASISTIDO, CESAREA
  numeroParicion  Int?
  resultadoParto  String   @default("EXITOSO")
  notas           String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([tenantId, fecha])
}

model Mortandad {
  id              String   @id @default(cuid())
  tenantId        String
  
  fecha           DateTime @default(now())
  ganadoId        String?
  categoriaId     String?
  estanciaId      String
  cantidad        Int      @default(1)
  
  causa           String   // ENFERMEDAD, ACCIDENTE, DEPREDADOR
  causaDetalle    String?
  valorPerdidoUSD Decimal?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([tenantId, fecha])
}

// ==========================================
// MÓDULO COMERCIAL (Existente)
// ==========================================

model Producto {
  id            String   @id @default(cuid())
  tenantId      String
  codigo        String
  nombre        String
  descripcion   String?
  precioUnitario Decimal
  stock         Int      @default(0)
  activo        Boolean  @default(true)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([tenantId, codigo])
  @@index([tenantId])
}

model Proveedor {
  id            String   @id @default(cuid())
  tenantId      String
  codigo        String
  nombre        String
  ruc           String?
  direccion     String?
  activo        Boolean  @default(true)
  
  facturas      FacturaCompra[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([tenantId, codigo])
  @@index([tenantId])
}

model Cliente {
  id            String   @id @default(cuid())
  tenantId      String
  codigo        String
  nombre        String
  ruc           String?
  direccion     String?
  activo        Boolean  @default(true)
  
  ventas        Venta[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([tenantId, codigo])
  @@index([tenantId])
}

model FacturaCompra {
  id              String   @id @default(cuid())
  tenantId        String
  
  numero          String
  timbrado        String?
  fechaEmision    DateTime @default(now())
  
  proveedorId     String
  proveedor       Proveedor @relation(fields: [proveedorId], references: [id])
  
  moneda          String   @default("PYG")
  subtotal        Decimal  @default(0)
  iva             Decimal  @default(0)
  total           Decimal  @default(0)
  saldo           Decimal  @default(0)
  
  estado          String   @default("PENDIENTE") // PENDIENTE, PARCIAL, PAGADA
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([tenantId, numero])
  @@index([tenantId, fechaEmision])
}

model Venta {
  id              String   @id @default(cuid())
  tenantId        String
  
  numero          String
  fechaEmision    DateTime @default(now())
  
  clienteId       String
  cliente         Cliente  @relation(fields: [clienteId], references: [id])
  
  moneda          String   @default("PYG")
  subtotal        Decimal  @default(0)
  iva             Decimal  @default(0)
  total           Decimal  @default(0)
  saldo           Decimal  @default(0)
  
  estado          String   @default("PENDIENTE")
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([tenantId, numero])
  @@index([tenantId, fechaEmision])
}

// ==========================================
// TENANTS
// ==========================================

model Tenant {
  id            String   @id @default(cuid())
  
  nombre        String
  dominio       String?  @unique
  
  activo        Boolean  @default(true)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([activo])
}
```

#### Ejecutar migration:
```bash
cd /azure-functions

# Crear migration
npx prisma migrate dev --name "add_ganado_full_module"

# Debería decir:
# ✔ Generated Prisma Client
# ✔ Created migration 0_add_ganado_full_module

# Verificar esquema en prisma studio:
npx prisma studio

# Deberías ver todas las nuevas tablas
```

**Checkpoints:**
- [ ] Schema.prisma actualizado
- [ ] Migration creada exitosamente
- [ ] Prisma studio abre y ve las nuevas tablas
- [ ] Datos existen en BD (aunque vacía)

---

### HORA 5: Seedear Datos Iniciales

**Archivo**: `/azure-functions/prisma/seed.ts`

Crea este archivo:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const TENANT_ID = 'tenant-agribusiness-001';

  console.log('🌱 Seeding...');

  // Crear empresa
  const empresa = await prisma.empresa.upsert({
    where: { tenantId_codigo: { tenantId: TENANT_ID, codigo: 'AGR001' } },
    update: {},
    create: {
      tenantId: TENANT_ID,
      codigo: 'AGR001',
      nombre: 'Agribusiness Demo',
      ruc: '123456789',
      tipoEmpresa: 'FONDO_INVERSION',
    },
  });

  console.log('✅ Empresa:', empresa);

  // Crear estancia
  const estancia = await prisma.estancia.upsert({
    where: { tenantId_codigo: { tenantId: TENANT_ID, codigo: 'EST001' } },
    update: {},
    create: {
      tenantId: TENANT_ID,
      empresaId: empresa.id,
      codigo: 'EST001',
      nombre: 'La Petrona',
      areaTotal: 1000,
      areaExplotada: 800,
    },
  });

  console.log('✅ Estancia:', estancia);

  // Crear categorías
  const categorias = [
    { codigo: 'VACA_CRIA', nombre: 'Vaca de Cría', especie: 'BOVINO', sexo: 'HEMBRA', tipo: 'PERMANENTE' },
    { codigo: 'TORO_PADRE', nombre: 'Toro Padre', especie: 'BOVINO', sexo: 'MACHO', tipo: 'PERMANENTE' },
    { codigo: 'TERNERO_M', nombre: 'Ternero Macho', especie: 'BOVINO', sexo: 'MACHO', tipo: 'PRODUCCION' },
  ];

  for (const cat of categorias) {
    const categoria = await prisma.categoriaGanado.upsert({
      where: { tenantId_codigo: { tenantId: TENANT_ID, codigo: cat.codigo } },
      update: {},
      create: {
        tenantId: TENANT_ID,
        ...cat,
      },
    });
    console.log(`✅ Categoría: ${categoria.nombre}`);
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

#### Ejecutar seed:
```bash
cd /azure-functions
npx prisma db seed

# Output:
# 🌱 Seeding...
# ✅ Empresa: { id: '...', nombre: 'Agribusiness Demo' }
# ✅ Estancia: { id: '...', nombre: 'La Petrona' }
# ✅ Categoría: Vaca de Cría
# ✅ Categoría: Toro Padre
# ✅ Categoría: Ternero Macho
# ✅ Seeding complete!
```

**Checkpoints:**
- [ ] prisma/seed.ts existe
- [ ] npx prisma db seed funciona
- [ ] Datos aparecen en Prisma Studio

---

## MAÑANA (Sábado 18 - Mañana/Tarde)

### HORA 6-8: Crear GanadoService + Controllers

**Archivo 1**: `/azure-functions/src/services/ganado.service.ts`

```typescript
import { PrismaClient } from '@prisma/client';

export class GanadoService {
  constructor(private prisma: PrismaClient, private tenantId: string) {}

  // CATEGORÍAS
  async crearCategoria(data: {
    codigo: string;
    nombre: string;
    especie: string;
    tipo: string;
  }) {
    return this.prisma.categoriaGanado.create({
      data: {
        tenantId: this.tenantId,
        ...data,
      },
    });
  }

  async listarCategorias() {
    return this.prisma.categoriaGanado.findMany({
      where: { tenantId: this.tenantId, activo: true },
    });
  }

  // GANADO
  async crearGanado(data: {
    categoriaId: string;
    estanciaId: string;
    pesoActualKg?: number;
    fechaNacimiento?: Date;
  }) {
    return this.prisma.ganado.create({
      data: {
        tenantId: this.tenantId,
        estado: 'EN_CAMPO',
        origenTipo: 'NACIMIENTO',
        fechaIngreso: new Date(),
        ...data,
      },
      include: {
        categoria: true,
        estancia: true,
      },
    });
  }

  async listarGanado(filtros?: {
    estanciaId?: string;
    categoriaId?: string;
    estado?: string;
  }) {
    return this.prisma.ganado.findMany({
      where: {
        tenantId: this.tenantId,
        ...filtros,
      },
      include: {
        categoria: true,
        estancia: true,
      },
    });
  }

  async obtenerGanado(id: string) {
    return this.prisma.ganado.findUnique({
      where: { id },
      include: {
        categoria: true,
        estancia: true,
      },
    });
  }

  // MOVIMIENTOS
  async registrarMovimiento(data: {
    tipo: string;
    ganadoId?: string;
    cantidad?: number;
    estanciaOrigenId?: string;
    estanciaDestinoId?: string;
    valorUnitarioUSD?: number;
    observaciones?: string;
  }) {
    return this.prisma.movimientoGanado.create({
      data: {
        tenantId: this.tenantId,
        fecha: new Date(),
        ...data,
      },
      include: {
        ganado: true,
      },
    });
  }

  async listarMovimientos(filtros?: {
    tipo?: string;
    desde?: Date;
    hasta?: Date;
  }) {
    return this.prisma.movimientoGanado.findMany({
      where: {
        tenantId: this.tenantId,
        ...(filtros?.tipo && { tipo: filtros.tipo }),
        ...(filtros?.desde && { fecha: { gte: filtros.desde } }),
      },
      orderBy: { fecha: 'desc' },
    });
  }

  // NACIMIENTOS
  async registrarNacimiento(data: {
    estanciaId: string;
    sexoCria: string;
    tipoParto: string;
    madreId?: string;
  }) {
    return this.prisma.nacimiento.create({
      data: {
        tenantId: this.tenantId,
        fecha: new Date(),
        ...data,
      },
    });
  }
}
```

**Archivo 2**: `/azure-functions/src/functions/ganado.ts`

```typescript
import { Router, Request, Response } from 'express';
import { GanadoService } from '../services/ganado.service';

const router = Router();

// CATEGORÍAS
router.post('/', async (req: Request, res: Response) => {
  try {
    const service = new GanadoService(req.prisma, req.tenantId);
    const resultado = await service.crearGanado(req.body);
    res.status(201).json(resultado);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const service = new GanadoService(req.prisma, req.tenantId);
    const resultado = await service.listarGanado(req.query as any);
    res.json(resultado);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const service = new GanadoService(req.prisma, req.tenantId);
    const resultado = await service.obtenerGanado(req.params.id);
    res.json(resultado);
  } catch (error: any) {
    res.status(404).json({ error: 'No encontrado' });
  }
});

export default router;
```

**Archivo 3**: `/azure-functions/src/server.ts`

En tu archivo server.ts, agregar esta línea:

```typescript
import ganadoRouter from './functions/ganado';

// ... en app.use:
app.use('/api/ganado', ganadoRouter);
```

**Checkpoints:**
- [ ] GanadoService creado
- [ ] Ganado controller creado
- [ ] Routes agregadas a server.ts
- [ ] npm run build sin errores

---

### HORA 9-10: Verificar en Local + Push a GitHub

**Test Local:**
```bash
# Terminal 1: Backend
cd /azure-functions
npm start
# Debería decir: Server running on http://localhost:3000

# Terminal 2: Test API
curl -X GET http://localhost:3000/api/ganado \
  -H "Authorization: Bearer fake-token" \
  -H "X-Tenant-Id: tenant-agribusiness-001"

# Debería retornar: []
```

**Push a GitHub:**
```bash
cd /agribusiness

git status
git add .
git commit -m "feat: add ganado module with prisma schema"
git push origin main

# GitHub Actions debería ejecutarse automáticamente
# Ver en: GitHub > Actions > último workflow
```

**Checkpoints:**
- [ ] Backend levanta localmente
- [ ] API responde
- [ ] Code pushea sin errores
- [ ] GitHub Actions comienza a ejecutarse

---

## RESULTADO ESPERADO

Al finalizar estas 48 horas:

```
✅ SQL Server local funcionando
✅ Schema Prisma actualizado (20+ modelos)
✅ Migration creada y ejecutada
✅ Datos iniciales seededos
✅ GanadoService implementado
✅ Controllers básicos funcionando
✅ API endpoints activos en local
✅ Code en GitHub
✅ GitHub Actions desplegando a Azure

Estado: MVP Fase 1 completada
Próximo paso: Crear endpoints adicionales (MOVIMIENTOS, NACIMIENTOS)
```

---

## 🎯 SI ALGO NO FUNCIONA

**Error: "Cannot find module 'prisma'"**
```bash
cd /azure-functions
npm install @prisma/client prisma
```

**Error: "Database connection failed"**
```bash
# Verificar .env.local tiene DATABASE_URL correcto
# Verificar SQL Server está corriendo
# Verificar no hay espacios en el password
```

**Error: "Migration failed"**
```bash
# Ver error específico:
npx prisma migrate dev --name "fix"
# Revisar error
# Posible: Conflicto de tipo de dato
# Solución: Eliminar BD y crear nueva
```

**Error: "Port 3000 already in use"**
```bash
# Cambiar puerto en server.ts
const PORT = 3001;
```

---

## 📞 PRÓXIMAS SESIONES

Una vez completado esto:

**Sesión 2**:
- [ ] Frontend: Crear pantalla de Ganado
- [ ] Integrar API real
- [ ] Login con Microsoft Entra

**Sesión 3**:
- [ ] Módulo Contable (PlanCuentas, Asientos)
- [ ] Integración automática de movimientos → asientos

**Sesión 4**:
- [ ] Reportes y KPIs
- [ ] Dashboard

---

© 2025 - Plan 48 horas
