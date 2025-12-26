# 📋 PROMPT PARA AGENTE IA - LISTO PARA COPIAR-PEGAR

Usa este prompt cuando necesites continuar con un agente de IA (Claude, ChatGPT, o tu asistente preferido).

---

## COPIA Y PEGA ESTO EN LA IA

```
PROYECTO: Agribusiness ERP Ganadero Multi-tenant
USUARIO: Hans (hhml17)
REPOSITORIO: https://github.com/hhml17/agribusiness-erp
FECHA ACTUALIZACIÓN: 18 de Diciembre 2025

=== INFRAESTRUCTURA AZURE ACTUALIZADA ===

REPOSITORIOS:
- Frontend Público (Landing + BI): https://github.com/hhml17/agribusiness
- Frontend ERP (Privado): https://github.com/hhml17/agribusiness-erp ← ACTUAL

AZURE STATIC WEB APPS:
- Público: agribusiness.com.py
- ERP: erp.agribusiness.com.py
  - URL temporal: https://thankful-ground-083e4cb10.3.azurestaticapps.net
  - Grupo de recursos: Agribusiness
  - Suscripción: Suscripción de Azure 1 (4422590a-9442-4ac4-b334-0e7f7b536803)
  - SKU: Free
  - Origen: main (GitHub)

=== CONTEXTO COMPLETO ===

TECNOLOGÍAS DECIDIDAS:
- Frontend: React 18 + TypeScript + Vite + MSAL (Microsoft Entra)
- Backend: Node.js + Express + Prisma ORM + TypeScript
- Database: SQL Server en Azure (Básico DTU 5, $0 primer año)
- Hosting: Azure Static Web Apps (Frontend) + App Service F1 (Backend)
- Autenticación: Microsoft Entra (Azure AD)
- Infraestructura: Multi-tenant con tenantId, RBAC implementado

INFRAESTRUCTURA AZURE ACTUAL:
- Servidor SQL: agribusiness.database.windows.net
- Database: agribusiness (Básico DTU 5)
- Admin: hans@agribusiness.com.py
- Conectividad: Pública con Azure services permitidos

=== ESTADO ACTUAL DEL CÓDIGO ===

IMPLEMENTADO (35%):
✅ Frontend base React con Login
✅ Backend Express con controllers: Tenants, Productos, Clientes, Proveedores, Ventas, Compras
✅ Backend API con controllers: Plan Cuentas, Centro Costo, Asientos, Reportes Contables
✅ Prisma ORM configurado con schema contable completo
✅ Middleware de autenticación
✅ Multi-tenant architecture
✅ RBAC (Role-Based Access Control)
✅ SQL Server en Azure creado
✅ Frontend services para módulo contable (contabilidad.service.ts)
✅ API Client configurado con interceptores de auth y tenant

EN PROGRESO (5%):
🔄 Backend: API corriendo en http://localhost:3001 (verificar si está activo)
🔄 Frontend: Corriendo en http://localhost:5173 (con errores de conexión)

NO IMPLEMENTADO (60%) - CRÍTICO:
❌ Backend API: Endpoints de contabilidad no responden (API probablemente no corriendo)
❌ Schema Prisma: Falta módulo Ganado (CategoriaGanado, Ganado, MovimientoGanado, etc.)
❌ Controllers para Ganado, Nacimientos, Mortandad
❌ Integración automática: Movimientos → Asientos contables
❌ Frontend: Pantallas de Contabilidad (Plan Cuentas, Asientos, Balance, P&L)
❌ Frontend: Módulo de Ganado completo
❌ Tests unitarios
❌ CI/CD pipeline con GitHub Actions
❌ Environment variables por stage
❌ Sincronización local ↔ Azure SQL

=== ESTRUCTURA DEL REPOSITORIO ===

/agribusiness
├── /html/                  Landing page
├── /portal/                Portal BI (estático)
├── /app/                   Frontend React
│   ├── src/
│   │   ├── config/
│   │   │   ├── authConfig.ts
│   │   │   └── apiClient.ts          ✅ Configurado con interceptores
│   │   ├── services/
│   │   │   ├── api/                  ✅ Services: productos, clientes, proveedores, ventas, compras, tenants
│   │   │   └── contabilidad.service.ts ✅ Service completo para contabilidad
│   │   ├── types/
│   │   │   └── contabilidad.ts       ✅ Types completos
│   │   ├── pages/Login.tsx, Dashboard.tsx
│   │   └── App.tsx
│   └── vite.config.ts
├── /api/                   Backend Express (NUEVO)
│   ├── src/
│   │   ├── controllers/              ✅ 10 controllers implementados:
│   │   │   ├── asientoContable.controller.ts
│   │   │   ├── centroCosto.controller.ts
│   │   │   ├── planCuentas.controller.ts
│   │   │   ├── reportes.controller.ts
│   │   │   └── (6 controllers comerciales más)
│   │   ├── routes/                   ✅ Routes para todos los controllers
│   │   ├── config/                   ✅ Config de tenant
│   │   ├── middleware/               ⚠️  Auth middleware parcial
│   │   ├── server.ts                 ✅ Server configurado
│   │   └── prisma/
│   │       └── schema.prisma         ✅ COMPLETO con módulo contable
│   └── package.json
└── /docs/Plan/             Documentación del proyecto

=== PROBLEMAS A RESOLVER ===

PROBLEMA 1 (CRÍTICO): Backend API no responde
- Frontend en http://localhost:5173 no puede conectar con backend
- Backend debería correr en http://localhost:3001
- Error: "The requested module does not provide an export named 'default'" → ✅ RESUELTO
- Solución: Verificar que backend esté corriendo con `npm start` en /api/

PROBLEMA 2: Schema Prisma incompleto para Ganado
- ✅ Módulo Contable completo (PlanCuentas, AsientoContable, CentroCosto, etc.)
- ❌ Necesita: CategoriaGanado, Ganado, MovimientoGanado, Nacimiento, Mortandad
- Referencia: Documento "PLAN_MODULO_GANADO_DETALLADO.md"

PROBLEMA 3: Base de datos no inicializada
- Schema existe pero DB probablemente vacía
- Necesita: npx prisma migrate dev
- Necesita: npx prisma db seed (con datos de prueba)

PROBLEMA 4: Frontend sin pantallas de Contabilidad
- Services creados ✅
- Faltan: Componentes y páginas para Plan Cuentas, Asientos, Balance, P&L

PROBLEMA 5: Sincronización local ↔ Azure
- Local: SQLite o SQL Server local
- Azure: SQL Server
- Solución: Usar DATABASE_URL en .env para alternar

PROBLEMA 6: Autenticación parcial
- Login funciona en frontend
- Middleware de auth existe pero puede no estar validando correctamente
- Falta validación de tokens en algunos endpoints

PROBLEMA 7: Tests faltan
- No hay tests unitarios
- No hay tests de integración

PROBLEMA 8: CI/CD falta
- No hay GitHub Actions
- Deployments son manuales

=== TAREAS PRIORITARIAS (ORDEN) ===

SEMANA 1:
1. Expandir schema.prisma con modelos faltantes
2. Crear GanadoService
3. Crear Ganado controllers
4. Seedear datos iniciales

SEMANA 2:
5. Frontend: Crear screens de Ganado
6. Tests unitarios
7. Integración local ↔ Azure

SEMANA 3:
8. Módulo Contable
9. Integración automática: Movimientos → Asientos

SEMANA 4:
10. Reportes y KPIs
11. Dashboard completo

=== DECISIONES YA TOMADAS ===

1. ✅ Node.js Express > Azure Functions (porque MVP, multi-tenant, development speed)
2. ✅ SQL Server en Azure > Alternativas (porque tienes 1 año gratis + relacional perfecto)
3. ✅ Básico DTU 5 > Hiperescala (porque suficiente para MVP, más barato)
4. ✅ Database con tenantId > Separate databases (porque simpler, escalable)
5. ✅ Prisma ORM > Raw SQL (porque type-safe, migraciones automáticas)

NO CAMBIAR ESTAS DECISIONES - son correctas.

=== REGLAS DE DESARROLLO ===

LOCAL DEVELOPMENT:
- Usar SQL Server Express en máquina local
- DATABASE_URL en .env.local apunta a SQL Server local
- npm run dev para frontend
- npm start para backend
- npx prisma studio para ver BD visualmente

PRODUCTION (Azure):
- DATABASE_URL en GitHub Secrets apunta a Azure SQL
- Deployments vía GitHub Actions (automático al push)
- Migraciones automáticas en deploy

TESTING:
- Tests en /azure-functions/src/__tests__/
- Tests de servicios
- Tests de controllers
- Tests de integración

=== PRÓXIMOS PASOS INMEDIATOS ===

AHORA MISMO (Próximos 30 minutos):
1. ✅ Fix import error en contabilidad.service.ts → COMPLETADO
2. ⚠️  Verificar backend corriendo: cd api && npm start
3. ⚠️  Verificar DB inicializada: cd api && npx prisma migrate dev
4. ⚠️  Seed datos de prueba: cd api && npx prisma db seed
5. ⚠️  Test endpoints: curl http://localhost:3001/api/contable/plan-cuentas

HOY (Próximas 4-6 horas):
6. Crear primera pantalla de Contabilidad (Plan de Cuentas)
7. Probar integración Frontend ↔ Backend
8. Debug errores de conexión

MAÑANA (48 horas):
9. Expandir schema.prisma con módulo Ganado (PLAN_MODULO_GANADO_DETALLADO.md)
10. Crear migration: npx prisma migrate dev --name "add_ganado_modulo"
11. Crear GanadoService y controllers
12. Test endpoints de Ganado

DESPUÉS (Semana 1-2):
13. Frontend screens de Ganado
14. Frontend screens de Contabilidad completas
15. Tests unitarios
16. CI/CD básico

=== PREGUNTAS FRECUENTES ESPERADAS ===

P: ¿Funciona en local después de crear en Azure?
R: Sí, si usas variables de entorno correctas:
   - .env.local: DATABASE_URL para SQL Server local
   - .env.production: DATABASE_URL para Azure SQL
   
P: ¿Se pierden datos si cambio BD?
R: No, cada BD es independiente. Seedea datos de nuevo en Azure.

P: ¿Cómo sincronizo schema entre local y Azure?
R: npx prisma migrate deploy (ejecuta todas las migraciones pendientes)

P: ¿Si migrations falla en Azure qué hago?
R: Ver logs en GitHub Actions, revisar migration SQL, crear migration nueva

P: ¿Necesito guardar .env en GitHub?
R: NO - agregarlo a .gitignore
   Las credenciales van en GitHub Secrets

=== DOCUMENTOS DE REFERENCIA ===

En /docs/Plan/ encuentras:
1. PLAN_ACCION_CONTABILIDAD_PRIMERO.md - ⭐ Plan de implementación módulo contable
2. PLAN_MODULO_GANADO_DETALLADO.md - Schema + Código completo módulo ganado
3. PLAN_48_HORAS_EMPEZAR_HOY.md - Plan ejecutable (48h)
4. RESUMEN_DECISIONES_ARQUITECTURA.md - Decisiones técnicas
5. ANALISIS_GAP_Y_RECOMENDACIONES.md - Qué falta
6. GUIA_IMPORTAR_GITHUB_AZURE.md - Deployment
7. GUIA_SEGURIDAD_SQL_DATABASE.md - Seguridad BD
8. ANALISIS_BASICO_DTU5_VS_HIPERESCALA.md - Decisión BD
9. PROMPT_MAESTRO_AGENTE_IA.md - Contexto detallado
10. PROMPT_COPIAR_PEGAR_IA.md - Este archivo (actualizado 17/12/2025)

=== CÓMO USAR ESTE PROMPT ===

Este prompt contiene TODO el contexto del proyecto.

Cuando necesites:
1. Ayuda con una feature específica → Menciona qué documento consultar
2. Implementar módulo → Pregunta "Implementa basándome en PLAN_MODULO_GANADO_DETALLADO.md"
3. Resolver error → Describe el error y el documento relevante
4. Continuar donde dejó → "Continuemos con [tarea] del PLAN_48_HORAS_EMPEZAR_HOY.md"

=== INFORMACIÓN DEL USUARIO ===

Nombre: Hans
Email: hans@agribusiness.com.py
País: Paraguay
Timezone: Probablemente PY (UTC-4)
Experiencia: Avanzada (entiende arquitectura, multi-tenant, full-stack)
Preferencia: Código ejecutable listo para copy-paste
Velocidad: Rápido - prefiere avanzar en lugar de explicaciones largas

=== FIN DEL CONTEXTO ===

Con este contexto tienes TODO lo que necesitas para:
- Entender el proyecto
- Identificar qué falta
- Generar código específico
- Crear tasks claras
- Ayudar a resolver problemas

¿Cómo puedo ayudarte con Agribusiness hoy?
```

---

## CÓMO USAR

### Opción 1: A Través de Email o Documento

1. Copia el texto entre las líneas ``` arriba
2. Pégalo en un nuevo chat con IA (Claude, ChatGPT, Gemini, etc)
3. La IA tendrá contexto completo

### Opción 2: En un Chat Existente

Copia esta versión más corta:

```
Continuamos con el Proyecto Agribusiness ERP.

CONTEXTO RÁPIDO:
- Frontend: React + Vite + Microsoft Entra
- Backend: Node.js + Express + Prisma
- DB: SQL Server en Azure (DTU 5, free primer año)
- GitHub: hhml17/agribusiness

ESTADO:
✅ Hecho: 30% (frontend base, backend 6 controllers, schema básico)
❌ Falta: 70% (módulo ganado, contable, tests, frontend ganado)

DOCUMENTOS CON INFO:
1. PROMPT_MAESTRO_AGENTE_IA.md - Contexto completo
2. PLAN_MODULO_GANADO_DETALLADO.md - Schema + código
3. PLAN_48_HORAS_EMPEZAR_HOY.md - Qué hacer próximas 48h

¿Qué necesitas hacer?
```

### Opción 3: Para Problemas Específicos

```
Proyecto: Agribusiness ERP (hhml17/agribusiness)

PROBLEMA: [Tu problema específico]

CONTEXTO: [Breve descripción]

DOCUMENTOS RELEVANTES:
- [Documento 1]
- [Documento 2]

¿Cómo lo resuelvo?
```

---

## ACTUALIZAR ESTE PROMPT

Cada vez que termines una fase o hagas cambios, actualiza:

```
ESTADO ACTUAL:
- Cambios completados
- Qué se rompió (si algo)
- Nuevos problemas encontrados

PRÓXIMO PASO:
- Siguiente tarea
- Bloqueadores actuales
```

---

© 2025 - Prompt Agribusiness ERP
