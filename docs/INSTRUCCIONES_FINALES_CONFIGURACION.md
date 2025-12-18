# 📋 Instrucciones Finales de Configuración

**Fecha:** 18 de Diciembre 2025
**Estado:** Listo para Deploy ✅

---

## Resumen de lo que Ya Está Hecho

✅ Código actualizado con nuevo repositorio y dominio
✅ Workflow de GitHub Actions configurado
✅ Variables de entorno configuradas en el código
✅ Documentación completa creada
✅ Archivos committed y pusheados a GitHub
✅ Dominio `erp.agribusiness.com.py` activo

---

## ⚠️ LO QUE NECESITAS HACER AHORA (5-10 minutos)

### Paso 1: Configurar GitHub Secrets

Abre: https://github.com/hhml17/agribusiness-erp/settings/secrets/actions

Haz clic en **"New repository secret"** y agrega estos 5 secrets:

#### Secret 1
```
Nombre: AZURE_STATIC_WEB_APPS_API_TOKEN_THANKFUL_GROUND_083E4CB10
Valor:  07c5db78047c6dbfd9c638b78c6bdd798d554bd77b206ebcd021b1a45affae2a03-b78a46fa-5338-4d57-b38f-7f54e9f63bf20102706083e4cb10
```

#### Secret 2
```
Nombre: VITE_API_URL_PROD
Valor:  https://api.agribusiness.com.py/api
```

#### Secret 3
```
Nombre: VITE_TENANT_ID
Valor:  f055e681-6d0b-451c-beb9-155c316d3a75
```

#### Secret 4
```
Nombre: VITE_AZURE_CLIENT_ID
Valor:  185a1a46-e8fe-4dc9-97b0-22629f47f8be
```

#### Secret 5
```
Nombre: VITE_AZURE_TENANT_ID
Valor:  ddf2df3e-9f06-4201-a06c-b71c69f64818
```

---

### Paso 2: Configurar Azure AD Redirect URIs

1. Ve a: https://portal.azure.com
2. Busca: **"Microsoft Entra ID"** (o "Azure Active Directory")
3. Click en: **"App registrations"**
4. Busca tu app: **"Agribusiness ERP - Frontend"**
   - Client ID: `185a1a46-e8fe-4dc9-97b0-22629f47f8be`
5. Click en: **"Authentication"** (en el menú izquierdo)
6. En la sección **"Single-page application"**:
   - Verifica que tengas estos URIs (agrega los que falten):
     - ✅ `http://localhost:5173`
     - ✅ `https://erp.agribusiness.com.py`
     - ⚠️ (Opcional) `https://thankful-ground-083e4cb10.3.azurestaticapps.net`
7. En **"Front-channel logout URL"**:
   - Agrega: `https://erp.agribusiness.com.py`
8. Click en **"Save"** (arriba)

---

### Paso 3: Trigger el Deploy

El workflow se ejecutará automáticamente cuando hagas push, pero ya lo hicimos.

Para forzar un nuevo deploy:

```bash
cd /Users/hansharder/Documents/GitHub/agribusiness-erp
git commit --allow-empty -m "chore: Trigger deploy"
git push origin main
```

O simplemente espera a que se ejecute automáticamente.

---

### Paso 4: Verificar el Deploy

1. **Ver el progreso:**
   - Ve a: https://github.com/hhml17/agribusiness-erp/actions
   - Verás el workflow "Azure Static Web Apps CI/CD" ejecutándose
   - Espera 2-5 minutos

2. **Verificar la app:**
   - Abre: https://erp.agribusiness.com.py
   - Debe cargar tu aplicación React
   - Debe mostrar la página de login

3. **Probar autenticación:**
   - Haz clic en el botón de login
   - Debe redirigir a Microsoft login
   - Ingresa con: `hans@agribusiness.com.py`
   - Debe redirigir de vuelta a tu app autenticado

---

## Configuración de Azure AD - Tu Información

### App Registration Actual

```
Nombre: Agribusiness ERP - Frontend
Application (client) ID: 185a1a46-e8fe-4dc9-97b0-22629f47f8be
Object ID: 79373bee-2b46-49ba-92bf-93aa769d7b99
Directory (tenant) ID: ddf2df3e-9f06-4201-a06c-b71c69f64818
Tipos de cuenta: Varias organizaciones
```

### ¿Necesitas crear otra aplicación?

**NO.** Ya tienes todo lo necesario.

La App Registration "Agribusiness ERP - Frontend" es única y suficiente para:
- Login de usuarios
- Autenticación con Microsoft
- Frontend y Backend (cuando lo despliegues)

---

## Arquitectura Actual

```
┌─────────────────────────────────────┐
│  Usuario                            │
└──────────────┬──────────────────────┘
               │
               ▼
    https://erp.agribusiness.com.py
               │
               ▼
┌─────────────────────────────────────┐
│  Azure Static Web App               │
│  (thankful-ground-083e4cb10)        │
│                                     │
│  - Sirve React App                  │
│  - Dominio: erp.agribusiness.com.py │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  React App + MSAL                   │
│                                     │
│  - Usa Azure AD para login          │
│  - Client ID: 185a1a46...           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Azure AD (Microsoft Entra ID)      │
│  Agribusiness ERP - Frontend        │
│                                     │
│  - Maneja autenticación             │
│  - Genera tokens                    │
└─────────────────────────────────────┘
```

---

## Troubleshooting

### Si el workflow falla en GitHub Actions:

1. **Verifica los secrets:**
   - Ve a: https://github.com/hhml17/agribusiness-erp/settings/secrets/actions
   - Verifica que todos los 5 secrets estén creados
   - Verifica que los nombres sean exactos (copiar/pegar)

2. **Revisa los logs:**
   - Ve a: https://github.com/hhml17/agribusiness-erp/actions
   - Click en el workflow fallido
   - Click en "Build and Deploy Job"
   - Busca el error en los logs

3. **Errores comunes:**
   - Token incorrecto → Verifica `AZURE_STATIC_WEB_APPS_API_TOKEN_THANKFUL_GROUND_083E4CB10`
   - Build falla → Revisa que `output_location: "dist"` sea correcto
   - Variables de entorno faltantes → Verifica los otros 4 secrets

### Si el login no funciona:

1. **Error de redirect:**
   - Verifica los Redirect URIs en Azure AD
   - Deben incluir exactamente: `https://erp.agribusiness.com.py`

2. **Error de CORS:**
   - Normal si el backend no está desplegado aún
   - No afecta el login

3. **Consola del navegador:**
   - Abre DevTools (F12)
   - Ve a la pestaña "Console"
   - Busca errores de MSAL

---

## Archivos Importantes de Referencia

| Archivo | Para qué sirve |
|---------|----------------|
| [EXPLICACION_ARQUITECTURA_AZURE.md](EXPLICACION_ARQUITECTURA_AZURE.md) | Entender cómo funciona todo |
| [INSTRUCCIONES_DEPLOY_RAPIDO.md](INSTRUCCIONES_DEPLOY_RAPIDO.md) | Instrucciones con el token |
| [CONFIGURACION_AZURE_STATIC_WEB_APP.md](CONFIGURACION_AZURE_STATIC_WEB_APP.md) | Guía detallada |
| [CHECKLIST_CONFIGURACION_MANUAL.md](CHECKLIST_CONFIGURACION_MANUAL.md) | Checklist paso a paso |

---

## URLs del Proyecto

| Tipo | URL | Estado |
|------|-----|--------|
| **Frontend (Producción)** | https://erp.agribusiness.com.py | ✅ Dominio activo |
| **Frontend (Temporal)** | https://thankful-ground-083e4cb10.3.azurestaticapps.net | ✅ Activo |
| **Frontend (Local)** | http://localhost:5173 | ⚠️ Desarrollo |
| **Backend (Producción)** | https://api.agribusiness.com.py/api | ❌ Por desplegar |
| **Backend (Local)** | http://localhost:3001 | ⚠️ Desarrollo |
| **Database** | agribusiness.database.windows.net | ✅ Activo |

---

## Próximos Pasos (Después del Deploy)

1. ✅ Frontend desplegado en erp.agribusiness.com.py
2. ⏳ Probar login con Microsoft
3. ⏳ Desplegar backend a Azure App Service
4. ⏳ Configurar subdomain api.agribusiness.com.py
5. ⏳ Conectar frontend con backend
6. ⏳ Inicializar base de datos con migraciones de Prisma
7. ⏳ Crear datos de prueba (seed)

---

## Comandos Útiles

### Ver estado de git
```bash
git status
```

### Forzar nuevo deploy
```bash
git commit --allow-empty -m "chore: Trigger deploy"
git push origin main
```

### Desarrollo local (Frontend)
```bash
cd app
npm run dev
```

### Desarrollo local (Backend)
```bash
cd api
npm start
```

---

## ✅ Checklist Final

Antes de verificar que todo funciona:

- [ ] Configuré los 5 GitHub Secrets
- [ ] Agregué los Redirect URIs en Azure AD
- [ ] Guardé el Logout URL en Azure AD
- [ ] El workflow de GitHub Actions terminó exitosamente
- [ ] Abrí https://erp.agribusiness.com.py y carga correctamente
- [ ] Probé el login con Microsoft y funciona

---

**🎉 Cuando todo esté ✅, tu frontend estará completamente desplegado y funcionando!**

**Próximo paso:** Desplegar el backend a Azure App Service

---

**Última Actualización:** 18 de Diciembre 2025
**Documentado por:** Claude Code Assistant
