# Resumen Rápido - Variables de Entorno

## 📋 Checklist de Configuración

### Para Azure Static Web Apps

Ve a: **Azure Portal → Static Web App → Configuration → Application settings**

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `DATABASE_URL` | `sqlserver://...` | Conexión a SQL Server |
| `AZURE_AD_CLIENT_ID` | `a1b2c3d4-...` | Client ID de Azure AD |
| `AZURE_AD_TENANT_ID` | `12345678-...` | Tenant ID de Azure AD |
| `NODE_ENV` | `production` | Entorno de ejecución |
| `CORS_ORIGIN` | `https://tu-app.azurestaticapps.net` | Origen permitido para CORS |
| `VITE_API_URL` | `/api` | URL del backend |
| `VITE_AZURE_AD_CLIENT_ID` | `a1b2c3d4-...` | Client ID para frontend |
| `VITE_AZURE_AD_TENANT_ID` | `12345678-...` | Tenant ID para frontend |
| `VITE_AZURE_AD_REDIRECT_URI` | `https://tu-app.azurestaticapps.net` | URI de redirección |
| `VITE_DEV_MODE` | `false` | Desactivar modo desarrollo |

### Para GitHub Secrets

Ve a: **GitHub → Settings → Secrets → Actions → New repository secret**

| Secret | Ejemplo | Uso |
|--------|---------|-----|
| `DATABASE_URL` | `sqlserver://...` | Build y deploy |
| `AZURE_AD_CLIENT_ID` | `a1b2c3d4-...` | Autenticación |
| `AZURE_AD_TENANT_ID` | `12345678-...` | Autenticación |
| `VITE_AZURE_AD_CLIENT_ID` | `a1b2c3d4-...` | Frontend build |
| `VITE_AZURE_AD_TENANT_ID` | `12345678-...` | Frontend build |
| `VITE_AZURE_AD_REDIRECT_URI` | `https://...` | Frontend build |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | `[token]` | Deployment |

## 🚀 Pasos Rápidos

1. **Obtener valores de Azure AD:**
   ```
   Azure Portal → Azure Active Directory → App registrations → [Tu App]
   - Application (client) ID → usar en AZURE_AD_CLIENT_ID
   - Directory (tenant) ID → usar en AZURE_AD_TENANT_ID
   ```

2. **Obtener DATABASE_URL:**
   ```
   Azure Portal → SQL Database → Settings → Connection strings
   - Copiar ADO.NET
   - Convertir formato a Prisma: sqlserver://...
   ```

3. **Obtener deployment token:**
   ```
   Azure Portal → Static Web App → Overview
   - Click "Manage deployment token"
   - Copiar y agregar a GitHub Secrets
   ```

4. **Agregar Redirect URI en Azure AD:**
   ```
   Azure AD → App registrations → Authentication
   - Add platform → Single-page application
   - URI: https://tu-app.azurestaticapps.net
   ```

## 🔍 Verificación

Después de configurar, verifica:

- [ ] Build de GitHub Actions pasa sin errores
- [ ] Login con Azure AD funciona
- [ ] API responde correctamente
- [ ] No hay errores de CORS
- [ ] Productos se pueden crear/editar

## 📚 Documentación Completa

Ver: [VARIABLES-ENTORNO-PRODUCCION.md](./VARIABLES-ENTORNO-PRODUCCION.md)
