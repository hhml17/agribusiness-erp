# 🔧 Solución Error MIME Type en Producción

## Problema Actual
```
Failed to load module script: Expected a JavaScript-or-Wasm module script
but the server responded with a MIME type of "application/octet-stream"
```

## ✅ Cambios Realizados

### 1. Configuración de Azure Static Web Apps
**Archivo creado:** `app/public/staticwebapp.config.json`

Este archivo configura:
- MIME types correctos para archivos JavaScript
- Routing para SPA (Single Page Application)
- Headers HTTP apropiados

### 2. Verificaciones Necesarias

#### A. Variables de Entorno en GitHub
Ve a: **GitHub → Settings → Secrets and variables → Actions**

**Secrets (valores sensibles):**
- ✅ `VITE_AZURE_CLIENT_ID` = `185a1a46-e8fe-4dc9-97b0-22629f47f8be`
- ✅ `VITE_AZURE_TENANT_ID` = Tu Tenant ID de Entra ID
- ✅ `AZURE_STATIC_WEB_APPS_API_TOKEN_THANKFUL_GROUND_083E4CB10` = (ya configurado)

**Variables (valores públicos):**
- ✅ `VITE_API_URL` = `https://agribusiness.azurewebsites.net/api`
- ✅ `VITE_REDIRECT_URI` = `https://erp.agribusiness.com.py`
- ✅ `VITE_DEV_MODE` = `false`

#### B. Verificar Build Local
```bash
cd app
npm run build
ls -la dist/

# Deberías ver:
# - index.html
# - staticwebapp.config.json
# - assets/ (con archivos .js, .css)
```

## 🚀 Pasos para Deploy

### Paso 1: Commit y Push
```bash
git add .
git commit -m "fix: configure Azure Static Web Apps MIME types and routing"
git push origin main
```

### Paso 2: Monitorear GitHub Actions
1. Ve a: https://github.com/hhml17/agribusiness-erp/actions
2. Busca el workflow "Azure Static Web Apps CI/CD"
3. Espera a que complete (toma ~3-5 minutos)
4. Verifica que el status sea ✅ (verde)

### Paso 3: Verificar Deployment
Una vez que GitHub Actions termine:

1. **Limpiar caché del navegador:**
   - Chrome/Edge: Ctrl+Shift+Delete → Borrar todo
   - O usa modo incógnito

2. **Probar la aplicación:**
   ```
   https://erp.agribusiness.com.py
   ```

3. **Verificar en DevTools Console:**
   - Presiona F12
   - Ve a la pestaña "Console"
   - No deberías ver errores de MIME type
   - Deberías ver la app cargando normalmente

## 🔍 Troubleshooting

### Si el error persiste después del deploy:

#### 1. Verificar que staticwebapp.config.json se copió
```bash
# En GitHub Actions logs, busca:
✓ Copied staticwebapp.config.json to dist/
```

#### 2. Verificar el contenido desplegado
1. Ve a Azure Portal → Static Web Apps → agribusiness-erp
2. Click en "Browse"
3. Abre DevTools (F12) → Network tab
4. Recarga la página
5. Click en cualquier archivo .js
6. Verifica en Headers:
   - **Content-Type:** debería ser `text/javascript`
   - **NO** debería ser `application/octet-stream`

#### 3. Si Content-Type sigue siendo incorrecto:

**Opción A: Forzar redeploy**
```bash
# Hacer un cambio trivial y push
git commit --allow-empty -m "chore: trigger redeploy"
git push origin main
```

**Opción B: Verificar el archivo de configuración**
Asegúrate que `app/public/staticwebapp.config.json` existe y tiene el contenido correcto.

**Opción C: Purgar caché de Azure CDN**
1. Azure Portal → Static Web Apps → agribusiness-erp
2. Settings → Configuration
3. Click "Purge content"

## 📊 URLs de Monitoreo

| Recurso | URL |
|---------|-----|
| Frontend Producción | https://erp.agribusiness.com.py |
| Frontend Staging | https://thankful-ground-083e4cb10.3.azurestaticapps.net |
| GitHub Actions | https://github.com/hhml17/agribusiness-erp/actions |
| Azure Static Web Apps | Portal → Static Web Apps → agribusiness-erp |

## ✅ Checklist Final

- [ ] `app/public/staticwebapp.config.json` existe
- [ ] Variables de entorno configuradas en GitHub
- [ ] Commit y push realizados
- [ ] GitHub Actions completó exitosamente
- [ ] Caché del navegador limpiada
- [ ] App carga sin errores de MIME type
- [ ] Login funciona correctamente
- [ ] API responde correctamente

## 🎯 Solución Alternativa (Si Todo Falla)

Si después de todos estos pasos el problema persiste, podemos:

1. **Migrar a Vercel o Netlify:** Plataformas que manejan mejor las SPAs de Vite
2. **Usar Azure Blob Storage + CDN:** Con configuración manual de MIME types
3. **Servir desde el mismo App Service del backend:** Node.js sirviendo el build estático

## 📞 Siguiente Paso

**AHORA MISMO:**
1. Ejecuta `git add .`
2. Ejecuta `git commit -m "fix: configure Azure Static Web Apps MIME types"`
3. Ejecuta `git push origin main`
4. Monitorea GitHub Actions
5. Prueba la aplicación después del deploy

**¿El deploy completó?**
Avísame y revisamos juntos los resultados.
