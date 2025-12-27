# 🚀 Guía Completa de Deployment en Azure

## 📋 Resumen de Infraestructura Actual

### ✅ Recursos a MANTENER:
1. **agribusiness** (SQL Server) - Brazil South
2. **agribusiness** (Base de datos SQL) - Brazil South
3. **agribusiness** (App Service) - Brazil South - **PARA BACKEND**
4. **agribusiness-erp** (Static Web App) - Central US - **PARA FRONTEND**
5. **plan-agribusiness** (App Service Plan F1) - Brazil South
6. **identity-agribusiness** (Managed Identity) - Brazil South
7. **appinsights-agribusiness** (Application Insights) - Brazil South
8. **Agribusiness Portal** (App Registration) - Entra ID
9. **Agribusiness ERP - Frontend** (App Registration) - Entra ID

### ❌ Recursos a ELIMINAR:
1. **agribusiness** (Static Web App vieja) - Central US - **DUPLICADA**
2. **free-sql-db-9614414** (Base de datos SQL) - **NO NECESARIA**
3. **ws-4422590a-brazilsout** (Log Analytics Workspace) - **DUPLICADO** (ya tienes con appinsights)

---

## 🏗️ Arquitectura Final

```
┌─────────────────────────────────────────────────────────────┐
│                     USUARIOS                                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  erp.agribusiness.com.py (Azure Static Web App)            │
│  - Frontend React + Vite                                    │
│  - MSAL Authentication                                       │
│  - Tailwind + Shadcn/UI                                     │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTPS
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  agribusiness.azurewebsites.net (App Service)              │
│  - Backend Node.js 22 + Express                             │
│  - API REST                                                  │
│  - Prisma ORM                                               │
└──────────────────┬──────────────────────────────────────────┘
                   │ SQL Connection
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  agribusiness.database.windows.net (Azure SQL)             │
│  - Database: agribusiness                                   │
│  - Multi-tenant data                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 PASO 1: Limpiar Recursos Duplicados

### 1.1 Eliminar Static Web App Vieja
```bash
# En Azure Portal:
# 1. Ir a "agribusiness" (Static Web App en Central US - la VIEJA)
# 2. Click en "Delete"
# 3. Confirmar eliminación
```

### 1.2 Eliminar Base de Datos No Usada
```bash
# En Azure Portal:
# 1. Ir a "free-sql-db-9614414"
# 2. Click en "Delete"
# 3. Confirmar eliminación
```

---

## 📝 PASO 2: Configurar Backend en App Service

### 2.1 Configuración de App Service "agribusiness"

**En Azure Portal → App Service → agribusiness → Configuration:**

#### Application Settings (Variables de Entorno):

```bash
# Base de Datos
DATABASE_URL=sqlserver://agribusiness.database.windows.net:1433;database=agribusiness;user=agribusiness@agribusiness;password=TU_PASSWORD_AQUI;encrypt=true;trustServerCertificate=false;hostNameInCertificate=*.database.windows.net;loginTimeout=30

# Azure AD / Microsoft Entra ID
AZURE_CLIENT_ID=67a98f45-8f1e-4212-9f0f-112dcd12d628
AZURE_TENANT_ID=TU_TENANT_ID_AQUI
AZURE_CLIENT_SECRET=TU_CLIENT_SECRET_AQUI

# API Configuration
NODE_ENV=production
PORT=8080

# CORS Origins (importante para que el frontend pueda conectarse)
ALLOWED_ORIGINS=https://erp.agribusiness.com.py,https://thankful-ground-083e4cb10.3.azurestaticapps.net

# JWT Secret (genera uno nuevo y seguro)
JWT_SECRET=tu_jwt_secret_super_seguro_aqui_minimo_32_caracteres
```

**Cómo obtener el password de la BD:**
```bash
# Opción 1: Si lo guardaste en algún lugar seguro (recomendado)
# Opción 2: Resetear password en Azure Portal:
# SQL Server → agribusiness → Settings → Reset password
```

### 2.2 Deployment Settings

**En Azure Portal → App Service → agribusiness → Deployment Center:**

1. **Source:** GitHub
2. **Organization:** hhml17
3. **Repository:** agribusiness-erp
4. **Branch:** main
5. **Build Provider:** GitHub Actions

Esto creará un workflow en `.github/workflows/` automáticamente.

### 2.3 Configuración de Runtime

**En Azure Portal → App Service → agribusiness → Configuration → General settings:**

```yaml
Stack: Node
Version: 22 LTS
Platform: Linux
Startup Command: npm start
```

---

## 📝 PASO 3: Crear Workflow de GitHub Actions para Backend

Crea el archivo `.github/workflows/azure-app-service-backend.yml`:

```yaml
name: Build and deploy Node.js app to Azure App Service - agribusiness

on:
  push:
    branches:
      - main
    paths:
      - 'api/**'
      - '.github/workflows/azure-app-service-backend.yml'
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js version
        uses: actions/setup-node@v4
        with:
          node-version: '22.x'

      - name: Install dependencies
        working-directory: ./api
        run: npm ci

      - name: Generate Prisma Client
        working-directory: ./api
        run: npm run prisma:generate

      - name: Build
        working-directory: ./api
        run: npm run build

      - name: Zip artifact for deployment
        working-directory: ./api
        run: |
          zip -r ../api-release.zip . \
            -x "*.git*" \
            -x "src/*" \
            -x "*.md" \
            -x ".env*"

      - name: Upload artifact for deployment job
        uses: actions/upload-artifact@v4
        with:
          name: node-app
          path: api-release.zip

  deploy:
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: 'Production'
      url: ${{ steps.deploy-to-webapp.outputs.webapp-url }}

    steps:
      - name: Download artifact from build job
        uses: actions/download-artifact@v4
        with:
          name: node-app

      - name: Unzip artifact for deployment
        run: unzip api-release.zip

      - name: 'Deploy to Azure Web App'
        id: deploy-to-webapp
        uses: azure/webapps-deploy@v3
        with:
          app-name: 'agribusiness'
          slot-name: 'Production'
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: .
```

---

## 📝 PASO 4: Configurar Secrets de GitHub

**En GitHub → Settings → Secrets and variables → Actions:**

### Secrets:
1. **AZURE_WEBAPP_PUBLISH_PROFILE**
   - Ir a Azure Portal → App Service → agribusiness
   - Click "Download publish profile"
   - Copiar todo el contenido XML
   - Pegar en GitHub Secret

2. **VITE_AZURE_CLIENT_ID** (ya lo tienes)
   ```
   185a1a46-e8fe-4dc9-97b0-22629f47f8be
   ```

3. **VITE_AZURE_TENANT_ID**
   - Obtener de Entra ID → Overview

### Variables:
1. **VITE_API_URL**
   ```
   https://agribusiness.azurewebsites.net/api
   ```

2. **VITE_REDIRECT_URI**
   ```
   https://erp.agribusiness.com.py
   ```

3. **VITE_DEV_MODE**
   ```
   false
   ```

---

## 📝 PASO 5: Actualizar Frontend Workflow

El workflow actual (`.github/workflows/azure-static-web-apps-thankful-ground-083e4cb10.yml`) ya está bien configurado, solo necesita las variables correctas.

**Verificar que tenga:**
```yaml
env:
  VITE_API_URL: ${{ vars.VITE_API_URL }}
  VITE_AZURE_CLIENT_ID: ${{ secrets.VITE_AZURE_CLIENT_ID }}
  VITE_AZURE_TENANT_ID: ${{ secrets.VITE_AZURE_TENANT_ID }}
  VITE_REDIRECT_URI: ${{ vars.VITE_REDIRECT_URI }}
  VITE_DEV_MODE: ${{ vars.VITE_DEV_MODE }}
```

---

## 📝 PASO 6: Configurar CORS en App Service

**En el código del backend (`api/src/server.ts`):**

```typescript
import cors from 'cors';

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'https://erp.agribusiness.com.py',
  'https://thankful-ground-083e4cb10.3.azurestaticapps.net'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

---

## 📝 PASO 7: Configurar Azure AD / Entra ID

### 7.1 Frontend App Registration (Agribusiness ERP - Frontend)

**En Entra ID → App registrations → Agribusiness ERP - Frontend:**

1. **Redirect URIs:**
   ```
   https://erp.agribusiness.com.py
   https://thankful-ground-083e4cb10.3.azurestaticapps.net
   http://localhost:5173  (para desarrollo)
   ```

2. **API Permissions:**
   - Microsoft Graph → User.Read (Delegated)
   - API Expuesta del Backend (si tienes)

3. **Token configuration:**
   - Add optional claims: email, preferred_username

### 7.2 Backend App Registration (Agribusiness Portal)

**En Entra ID → App registrations → Agribusiness Portal:**

1. **Expose an API:**
   - Application ID URI: `api://67a98f45-8f1e-4212-9f0f-112dcd12d628`
   - Add scope: `access_as_user`

2. **Certificates & secrets:**
   - Create new client secret
   - Copiar y guardar en AZURE_CLIENT_SECRET

---

## 📝 PASO 8: Deployment

### 8.1 Deploy Backend
```bash
# Hacer commit y push al branch main
git add .
git commit -m "feat: configure Azure App Service deployment"
git push origin main

# Esto disparará el workflow de GitHub Actions
# Monitorear en: https://github.com/hhml17/agribusiness-erp/actions
```

### 8.2 Deploy Frontend
```bash
# El workflow ya existente se disparará automáticamente
# También puedes hacer un deploy manual desde Azure Portal
```

---

## 📝 PASO 9: Verificación

### 9.1 Verificar Backend
```bash
# Test de health check
curl https://agribusiness.azurewebsites.net/api/health

# Debería retornar:
# {"status":"ok","timestamp":"..."}
```

### 9.2 Verificar Frontend
```bash
# Abrir en navegador
https://erp.agribusiness.com.py

# Verificar en DevTools Console que:
# - No hay errores de CORS
# - Las llamadas a API se hacen correctamente
# - La autenticación MSAL funciona
```

---

## 📝 PASO 10: Migración de Base de Datos

Si necesitas ejecutar migraciones de Prisma:

```bash
# Opción 1: Desde Azure App Service SSH
# Portal → App Service → SSH → Connect

cd /home/site/wwwroot
npm run prisma:migrate deploy

# Opción 2: Desde tu máquina local
# Con DATABASE_URL configurada
cd api
npx prisma migrate deploy
```

---

## 🔧 Troubleshooting

### Error: "MIME type application/octet-stream"
**Causa:** Archivos no servidos correctamente
**Solución:**
- Verificar que `output_location: "dist"` esté en el workflow
- Verificar que Vite construya en `app/dist/`

### Error: "Failed to load module script"
**Causa:** Build de Vite incompleto o variables de entorno faltantes
**Solución:**
- Verificar todas las variables VITE_ en GitHub Secrets/Variables
- Hacer clean build: `npm run build` localmente primero

### Error: CORS
**Causa:** Backend no permite origin del frontend
**Solución:**
- Verificar `ALLOWED_ORIGINS` en App Service Configuration
- Verificar código CORS en `server.ts`

### Error: 500 en API calls
**Causa:** DATABASE_URL incorrecta o permisos faltantes
**Solución:**
- Verificar connection string en App Service
- Verificar que Managed Identity tenga permisos en SQL Database
- Ver logs en Application Insights

---

## 📊 Monitoreo

### Application Insights
```
Portal → appinsights-agribusiness → Logs

# Query para ver errores
traces
| where severityLevel >= 3
| order by timestamp desc
| take 100
```

### App Service Logs
```
Portal → App Service → agribusiness → Log stream
```

---

## 🎯 Checklist Final

- [ ] Eliminar recursos duplicados (Static Web App vieja, free-sql-db)
- [ ] Configurar variables de entorno en App Service
- [ ] Configurar GitHub Secrets y Variables
- [ ] Crear workflow de backend
- [ ] Verificar workflow de frontend
- [ ] Configurar CORS en backend
- [ ] Configurar Redirect URIs en Entra ID
- [ ] Deploy backend (push a main)
- [ ] Deploy frontend (automático)
- [ ] Verificar health check de backend
- [ ] Verificar login en frontend
- [ ] Ejecutar migraciones de Prisma
- [ ] Verificar llamadas de API funcionando
- [ ] Monitorear en Application Insights

---

## 📞 Soporte

Si encuentras errores:
1. Revisar logs en Application Insights
2. Revisar GitHub Actions logs
3. Revisar App Service Log Stream
4. Verificar variables de entorno

**URLs Importantes:**
- Frontend: https://erp.agribusiness.com.py
- Backend: https://agribusiness.azurewebsites.net
- Database: agribusiness.database.windows.net
- GitHub: https://github.com/hhml17/agribusiness-erp
