# Variables de Entorno para Producción

Este documento detalla todas las variables de entorno necesarias para ejecutar Agribusiness ERP en producción (Azure Static Web Apps + GitHub Actions).

## 📋 Tabla de Contenidos

1. [Variables del Backend (API)](#variables-del-backend-api)
2. [Variables del Frontend (App)](#variables-del-frontend-app)
3. [Configuración en Azure Static Web Apps](#configuración-en-azure-static-web-apps)
4. [Configuración en GitHub Actions](#configuración-en-github-actions)
5. [Configuración en Azure Key Vault (Opcional)](#configuración-en-azure-key-vault-opcional)

---

## Variables del Backend (API)

### 1. Base de Datos

#### `DATABASE_URL`
- **Descripción**: Cadena de conexión a SQL Server en Azure
- **Formato**: `sqlserver://[server].database.windows.net:1433;database=[database_name];user=[username];password=[password];encrypt=true;trustServerCertificate=false;`
- **Ejemplo**:
  ```
  sqlserver://agribusiness-server.database.windows.net:1433;database=agribusiness_db;user=sqladmin;password=Tu_Password_Seguro_123!;encrypt=true;trustServerCertificate=false;
  ```
- **Dónde configurar**:
  - Azure Static Web Apps → Configuration → Application settings
  - GitHub Secrets (para migrations)

#### `SHADOW_DATABASE_URL` (Solo para desarrollo/migrations)
- **Descripción**: Base de datos temporal para Prisma Migrate
- **Formato**: Igual que DATABASE_URL pero apuntando a otra BD
- **Necesario**: Solo si ejecutas migraciones desde CI/CD
- **Ejemplo**:
  ```
  sqlserver://agribusiness-server.database.windows.net:1433;database=agribusiness_shadow;user=sqladmin;password=Tu_Password_Seguro_123!;encrypt=true;trustServerCertificate=false;
  ```

### 2. Autenticación (Azure AD / Entra ID)

#### `AZURE_AD_CLIENT_ID`
- **Descripción**: Application (client) ID de Azure AD
- **Dónde obtener**: Azure Portal → Azure Active Directory → App registrations → Tu app → Overview
- **Ejemplo**: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

#### `AZURE_AD_TENANT_ID`
- **Descripción**: Directory (tenant) ID de tu organización
- **Dónde obtener**: Azure Portal → Azure Active Directory → Overview
- **Ejemplo**: `12345678-1234-1234-1234-123456789012`

#### `AZURE_AD_CLIENT_SECRET` (Opcional - solo si usas client credentials flow)
- **Descripción**: Secret para autenticación de servicio a servicio
- **Dónde obtener**: Azure Portal → App registrations → Certificates & secrets
- **Ejemplo**: `AbCdEfGhIjKlMnOpQrStUvWxYz0123456789`
- **⚠️ CRÍTICO**: Nunca expongas este valor. Solo para backend.

### 3. Configuración de la Aplicación

#### `NODE_ENV`
- **Descripción**: Entorno de ejecución
- **Valor en producción**: `production`
- **Valor en desarrollo**: `development`

#### `PORT`
- **Descripción**: Puerto donde escucha el backend
- **Valor por defecto**: `3001`
- **Azure Static Web Apps**: Generalmente usa el puerto que Azure asigna automáticamente

#### `CORS_ORIGIN`
- **Descripción**: Orígenes permitidos para CORS
- **Valor en producción**: URL de tu Static Web App
- **Ejemplo**: `https://thankful-ground-083e4cb10.azurestaticapps.net`
- **Múltiples orígenes**: `https://app1.com,https://app2.com`

---

## Variables del Frontend (App)

### 1. API Backend

#### `VITE_API_URL`
- **Descripción**: URL del backend API
- **En Azure Static Web Apps**: Generalmente es `/api` (usa API integrada)
- **En desarrollo local**: `http://localhost:3001/api`
- **Ejemplo producción**: `https://thankful-ground-083e4cb10.azurestaticapps.net/api`

### 2. Autenticación Microsoft (MSAL)

#### `VITE_AZURE_AD_CLIENT_ID`
- **Descripción**: Application (client) ID para MSAL en el frontend
- **Mismo valor que**: `AZURE_AD_CLIENT_ID` (generalmente el mismo app registration)
- **Ejemplo**: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

#### `VITE_AZURE_AD_TENANT_ID`
- **Descripción**: Directory (tenant) ID
- **Mismo valor que**: `AZURE_AD_TENANT_ID`
- **Ejemplo**: `12345678-1234-1234-1234-123456789012`

#### `VITE_AZURE_AD_REDIRECT_URI`
- **Descripción**: URI de redirección después del login
- **En producción**: URL completa de tu app
- **Ejemplo**: `https://thankful-ground-083e4cb10.azurestaticapps.net`
- **⚠️ IMPORTANTE**: Debe estar registrada en Azure AD App Registration → Authentication

### 3. Configuración de Desarrollo (Opcional)

#### `VITE_DEV_MODE`
- **Descripción**: Modo de desarrollo sin autenticación
- **Valor en producción**: `false` o no configurar
- **Valor en desarrollo**: `true`

#### `VITE_DEV_USER_EMAIL`
- **Descripción**: Email del usuario de desarrollo
- **Solo en desarrollo**: No usar en producción
- **Ejemplo**: `demo@agribusiness.com.py`

---

## Configuración en Azure Static Web Apps

### Paso 1: Navegar a Application Settings

1. Ve a Azure Portal
2. Busca tu Static Web App: `thankful-ground-083e4cb10`
3. En el menú lateral → **Configuration**
4. Click en **Application settings**

### Paso 2: Agregar Variables

Click en **+ Add** y agrega cada variable:

```bash
# Backend API
DATABASE_URL=sqlserver://[tu-conexion]
AZURE_AD_CLIENT_ID=a1b2c3d4-e5f6-7890-abcd-ef1234567890
AZURE_AD_TENANT_ID=12345678-1234-1234-1234-123456789012
NODE_ENV=production
CORS_ORIGIN=https://thankful-ground-083e4cb10.azurestaticapps.net

# Frontend
VITE_API_URL=/api
VITE_AZURE_AD_CLIENT_ID=a1b2c3d4-e5f6-7890-abcd-ef1234567890
VITE_AZURE_AD_TENANT_ID=12345678-1234-1234-1234-123456789012
VITE_AZURE_AD_REDIRECT_URI=https://thankful-ground-083e4cb10.azurestaticapps.net
VITE_DEV_MODE=false
```

### Paso 3: Guardar y Reiniciar

1. Click en **Save**
2. La aplicación se reiniciará automáticamente

---

## Configuración en GitHub Actions

### Paso 1: Crear GitHub Secrets

1. Ve a tu repositorio en GitHub
2. Click en **Settings** → **Secrets and variables** → **Actions**
3. Click en **New repository secret**

### Paso 2: Agregar Secrets

Agrega los siguientes secrets:

#### Secrets para el Backend

```bash
DATABASE_URL
# Valor: sqlserver://[tu-conexion-completa]

AZURE_AD_CLIENT_ID
# Valor: a1b2c3d4-e5f6-7890-abcd-ef1234567890

AZURE_AD_TENANT_ID
# Valor: 12345678-1234-1234-1234-123456789012

AZURE_AD_CLIENT_SECRET (si lo usas)
# Valor: AbCdEfGhIjKlMnOpQrStUvWxYz0123456789
```

#### Secrets para el Frontend

```bash
VITE_API_URL
# Valor: /api

VITE_AZURE_AD_CLIENT_ID
# Valor: a1b2c3d4-e5f6-7890-abcd-ef1234567890

VITE_AZURE_AD_TENANT_ID
# Valor: 12345678-1234-1234-1234-123456789012

VITE_AZURE_AD_REDIRECT_URI
# Valor: https://thankful-ground-083e4cb10.azurestaticapps.net
```

#### Secret para Azure Deployment

```bash
AZURE_STATIC_WEB_APPS_API_TOKEN
# Valor: [token generado por Azure]
# Dónde obtener: Azure Portal → Static Web App → Overview → Manage deployment token
```

### Paso 3: Actualizar GitHub Actions Workflow

Tu archivo `.github/workflows/azure-static-web-apps-*.yml` debe usar estos secrets:

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true

      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/app"
          api_location: "/api"
          output_location: "dist"
        env:
          # Backend
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          AZURE_AD_CLIENT_ID: ${{ secrets.AZURE_AD_CLIENT_ID }}
          AZURE_AD_TENANT_ID: ${{ secrets.AZURE_AD_TENANT_ID }}
          NODE_ENV: production

          # Frontend
          VITE_API_URL: /api
          VITE_AZURE_AD_CLIENT_ID: ${{ secrets.VITE_AZURE_AD_CLIENT_ID }}
          VITE_AZURE_AD_TENANT_ID: ${{ secrets.VITE_AZURE_AD_TENANT_ID }}
          VITE_AZURE_AD_REDIRECT_URI: ${{ secrets.VITE_AZURE_AD_REDIRECT_URI }}
          VITE_DEV_MODE: false
```

---

## Configuración en Azure Key Vault (Opcional)

Para mayor seguridad, puedes almacenar secretos en Azure Key Vault.

### Paso 1: Crear Key Vault

```bash
az keyvault create \
  --name agribusiness-kv \
  --resource-group agribusiness-rg \
  --location eastus
```

### Paso 2: Agregar Secretos

```bash
# Database
az keyvault secret set --vault-name agribusiness-kv \
  --name "DatabaseUrl" \
  --value "sqlserver://[tu-conexion]"

# Azure AD
az keyvault secret set --vault-name agribusiness-kv \
  --name "AzureAdClientId" \
  --value "a1b2c3d4-e5f6-7890-abcd-ef1234567890"

az keyvault secret set --vault-name agribusiness-kv \
  --name "AzureAdTenantId" \
  --value "12345678-1234-1234-1234-123456789012"

az keyvault secret set --vault-name agribusiness-kv \
  --name "AzureAdClientSecret" \
  --value "AbCdEfGhIjKlMnOpQrStUvWxYz0123456789"
```

### Paso 3: Dar Acceso a Static Web App

```bash
# Obtener el principal ID de tu Static Web App
az staticwebapp show \
  --name thankful-ground-083e4cb10 \
  --query "identity.principalId" -o tsv

# Dar acceso al Key Vault
az keyvault set-policy --name agribusiness-kv \
  --object-id [PRINCIPAL_ID] \
  --secret-permissions get list
```

### Paso 4: Referenciar en Application Settings

En Azure Static Web Apps, usa referencias a Key Vault:

```bash
DATABASE_URL=@Microsoft.KeyVault(SecretUri=https://agribusiness-kv.vault.azure.net/secrets/DatabaseUrl/)
AZURE_AD_CLIENT_ID=@Microsoft.KeyVault(SecretUri=https://agribusiness-kv.vault.azure.net/secrets/AzureAdClientId/)
```

---

## Checklist de Deployment

### ✅ Antes de Deployar

- [ ] Database URL configurada y probada
- [ ] Azure AD App Registration creado
- [ ] Redirect URIs agregados en Azure AD
- [ ] Todos los secrets agregados en GitHub
- [ ] Workflow de GitHub Actions actualizado
- [ ] Variables de entorno en Azure Static Web Apps configuradas

### ✅ Después de Deployar

- [ ] Probar login con Azure AD
- [ ] Verificar conexión a base de datos
- [ ] Revisar logs en Azure Portal
- [ ] Probar CRUD de productos
- [ ] Verificar CORS funciona correctamente

---

## Troubleshooting

### Error: "Database connection failed"
- ✅ Verifica que `DATABASE_URL` esté correcta
- ✅ Chequea que el firewall de Azure SQL permite conexiones desde Azure
- ✅ Verifica usuario y contraseña

### Error: "CORS policy blocked"
- ✅ Verifica `CORS_ORIGIN` incluye tu dominio
- ✅ Asegúrate que no hay espacios extras en la variable

### Error: "Login redirect failed"
- ✅ Verifica `VITE_AZURE_AD_REDIRECT_URI` coincide con lo registrado en Azure AD
- ✅ Chequea que el App Registration tiene los permisos correctos

### Error: "Environment variable not found"
- ✅ Variables de frontend deben empezar con `VITE_`
- ✅ Reinicia la aplicación después de agregar variables
- ✅ En GitHub Actions, usa `${{ secrets.NOMBRE_SECRET }}`

---

## Seguridad

### 🔒 Buenas Prácticas

1. **Nunca comitees secrets** en el código
2. **Rota contraseñas** cada 90 días
3. **Usa principio de mínimo privilegio** para permisos de BD
4. **Habilita auditoría** en Azure SQL Database
5. **Usa HTTPS** siempre en producción
6. **Configura Content Security Policy** en headers

### 🚨 Secrets Expuestos

Si accidentalmente expones un secret:

1. **Inmediatamente** rotarlo en Azure
2. Actualizar en todos los lugares (GitHub, Azure)
3. Revisar logs de acceso
4. Considerar reiniciar la aplicación

---

## Contacto

Para preguntas sobre configuración de producción, contacta al equipo DevOps o revisa la documentación de Azure Static Web Apps:
- https://learn.microsoft.com/en-us/azure/static-web-apps/

**Última actualización**: 26 de diciembre de 2025
**Versión**: 1.0
