# CONFIGURACIÓN DE VARIABLES DE ENTORNO - PRODUCCIÓN

## 📋 ESTADO ACTUAL DEL PROBLEMA

### Error Identificado:
```
Failed to load module script: Expected a JavaScript-or-Wasm module script
but the server responded with a MIME type of "application/octet-stream"
```

**Causa:** Variables de entorno mal configuradas en GitHub Actions y Azure.

---

## 🔧 SOLUCIÓN: CONFIGURACIÓN CORRECTA

### 1. GITHUB SECRETS (Datos sensibles)

Ir a: `Settings` → `Secrets and variables` → `Actions` → `Secrets`

Configurar los siguientes **SECRETS**:

| Secret Name | Valor | Descripción |
|------------|-------|-------------|
| `AZURE_STATIC_WEB_APPS_API_TOKEN_THANKFUL_GROUND_083E4CB10` | (Ya existe) | Token de Azure Static Web Apps |
| `VITE_AZURE_AD_CLIENT_ID` | `185a1a46-e8fe-4dc9-97b0-22629f47f8be` | Client ID de Azure AD |
| `VITE_AZURE_AD_TENANT_ID` | `ddf2df3e-9f06-4201-a06c-b71c69f64818` | Tenant ID de Azure AD |

**ELIMINAR estos secrets (no se usan):**
- ❌ `VITE_API_URL_PROD` (mover a Variables)
- ❌ `VITE_AZURE_CLIENT_ID` (duplicado)
- ❌ `VITE_TENANT_ID` (no se usa)

---

### 2. GITHUB VARIABLES (Datos públicos)

Ir a: `Settings` → `Secrets and variables` → `Actions` → `Variables`

Configurar los siguientes **VARIABLES**:

| Variable Name | Valor | Descripción |
|--------------|-------|-------------|
| `VITE_API_URL_PROD` | `agribusiness-edcsezaycmhpckh6.brazilsouth-01.azurewebsites.net` | URL del backend (sin https://) |
| `VITE_REDIRECT_URI` | `https://erp.agribusiness.com.py` | URL del frontend en producción |
| `VITE_DEV_MODE` | `false` | Desactivar modo desarrollo |

**IMPORTANTE:**
- ✅ `VITE_API_URL_PROD` NO debe incluir `https://` ni `/api` (se agregan en el workflow)
- ✅ `VITE_REDIRECT_URI` SÍ debe incluir `https://`

---

### 3. AZURE STATIC WEB APP - Variables de Entorno

Ir a Azure Portal → Static Web App → `Configuration`

Configurar las siguientes variables:

| Variable | Valor | Origen |
|----------|-------|--------|
| `VITE_API_URL` | `https://agribusiness-edcsezaycmhpckh6.brazilsouth-01.azurewebsites.net/api` | Backend URL completa |
| `VITE_AZURE_CLIENT_ID` | `185a1a46-e8fe-4dc9-97b0-22629f47f8be` | Azure AD Client ID |
| `VITE_AZURE_TENANT_ID` | `ddf2df3e-9f06-4201-a06c-b71c69f64818` | Azure AD Tenant ID |
| `VITE_REDIRECT_URI` | `https://erp.agribusiness.com.py` | Frontend URL |
| `VITE_DEV_MODE` | `false` | Desactivar dev mode |

**ELIMINAR estas variables (no se usan en frontend):**
- ❌ `AZURE_AD_CLIENT_ID` (usar `VITE_AZURE_CLIENT_ID`)
- ❌ `AZURE_AD_TENANT_ID` (usar `VITE_AZURE_TENANT_ID`)
- ❌ `DATABASE_URL` (solo para backend)
- ❌ `VITE_API_URL_PROD` (no se usa directamente)
- ❌ `VITE_AZURE_AD_CLIENT_ID` (duplicado)
- ❌ `VITE_AZURE_AD_REDIRECT_URI` (duplicado)
- ❌ `VITE_AZURE_AD_TENANT_ID` (duplicado)

---

### 4. AZURE APP SERVICE (Backend API) - Variables de Entorno

Ir a Azure Portal → App Service → `Configuration` → `Application settings`

Configurar las siguientes variables:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `DATABASE_URL` | `sqlserver://...` | Connection string de SQL Server |
| `NODE_ENV` | `production` | Ambiente de producción |
| `PORT` | `8080` | Puerto del servidor |
| `CORS_ORIGIN` | `https://erp.agribusiness.com.py` | Origen permitido para CORS |
| `AZURE_AD_CLIENT_ID` | `185a1a46-e8fe-4dc9-97b0-22629f47f8be` | Para validación de tokens |
| `AZURE_AD_TENANT_ID` | `ddf2df3e-9f06-4201-a06c-b71c69f64818` | Para validación de tokens |

**MANTENER estas (son de Azure):**
- ✅ `APPLICATIONINSIGHTS_CONNECTION_STRING`
- ✅ `ApplicationInsightsAgent_EXTENSION_VERSION`
- ✅ `XDT_MicrosoftApplicationInsights_Mode`

---

## 🚀 PASOS PARA APLICAR LA SOLUCIÓN

### Paso 1: Actualizar GitHub Secrets y Variables

```bash
# 1. Ve a: https://github.com/TU_USUARIO/agribusiness-erp/settings/secrets/actions
# 2. Configura los SECRETS según la tabla arriba
# 3. Ve a: https://github.com/TU_USUARIO/agribusiness-erp/settings/variables/actions
# 4. Configura las VARIABLES según la tabla arriba
```

### Paso 2: Verificar Archivo de Workflow

El workflow ya fue actualizado en este commit. Verifica que tenga:

```yaml
env:
  VITE_API_URL: https://${{ vars.VITE_API_URL_PROD }}/api
  VITE_AZURE_CLIENT_ID: ${{ secrets.VITE_AZURE_AD_CLIENT_ID }}
  VITE_AZURE_TENANT_ID: ${{ secrets.VITE_AZURE_AD_TENANT_ID }}
  VITE_REDIRECT_URI: ${{ vars.VITE_REDIRECT_URI }}
  VITE_DEV_MODE: ${{ vars.VITE_DEV_MODE }}
```

### Paso 3: Commit y Push

```bash
git add .
git commit -m "fix: corregir configuración de variables de entorno para producción"
git push origin main
```

### Paso 4: Verificar Deploy en GitHub Actions

1. Ve a: `Actions` en GitHub
2. Espera a que el workflow termine
3. Verifica que no haya errores

### Paso 5: Verificar la Aplicación

1. Abre: https://erp.agribusiness.com.py
2. Abre la consola del navegador (F12)
3. Verifica que no haya errores de MIME type
4. Verifica que el login funcione correctamente

---

## 🔍 VERIFICACIÓN POST-DEPLOY

### En el Navegador (Frontend):

Abre la consola (F12) y ejecuta:

```javascript
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('VITE_AZURE_CLIENT_ID:', import.meta.env.VITE_AZURE_CLIENT_ID);
console.log('VITE_REDIRECT_URI:', import.meta.env.VITE_REDIRECT_URI);
console.log('VITE_DEV_MODE:', import.meta.env.VITE_DEV_MODE);
```

**Resultado esperado:**
```
VITE_API_URL: https://agribusiness-edcsezaycmhpckh6.brazilsouth-01.azurewebsites.net/api
VITE_AZURE_CLIENT_ID: 185a1a46-e8fe-4dc9-97b0-22629f47f8be
VITE_REDIRECT_URI: https://erp.agribusiness.com.py
VITE_DEV_MODE: false
```

### Test del Backend API:

```bash
curl https://agribusiness-edcsezaycmhpckh6.brazilsouth-01.azurewebsites.net/health
```

**Resultado esperado:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-26T...",
  "database": {
    "connected": true
  }
}
```

---

## ❌ ERRORES COMUNES Y SOLUCIONES

### Error 1: "MIME type of application/octet-stream"

**Causa:** Variables de entorno no configuradas correctamente
**Solución:** Verificar que todas las variables `VITE_*` estén configuradas

### Error 2: "CORS policy error"

**Causa:** `CORS_ORIGIN` en backend no coincide con URL del frontend
**Solución:** Verificar que `CORS_ORIGIN=https://erp.agribusiness.com.py` en App Service

### Error 3: "Authentication failed"

**Causa:** Client ID o Tenant ID incorrectos
**Solución:** Verificar que los IDs de Azure AD sean correctos

### Error 4: "Cannot read package.json"

**Causa:** Ruta incorrecta en workflow
**Solución:** Ya corregido en el workflow actualizado

---

## 📞 CHECKLIST FINAL

Antes de hacer commit, verifica:

- [ ] GitHub Secrets configurados correctamente
- [ ] GitHub Variables configuradas correctamente
- [ ] Workflow actualizado con las variables correctas
- [ ] Azure Static Web App limpiado de variables duplicadas
- [ ] Azure App Service con CORS_ORIGIN correcto
- [ ] Backend respondiendo en /health endpoint

---

**Última actualización:** 26 de Diciembre, 2025
**Autor:** Hans Harder
