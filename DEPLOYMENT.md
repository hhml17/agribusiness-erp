# Guía de Deployment - Agribusiness ERP

## Problema Actual: MIME Type Error

Si ves este error en producción:
```
Failed to load module script: Expected a JavaScript-or-Wasm module script
but the server responded with a MIME type of "application/octet-stream"
```

### Solución

El error ocurre porque Azure Static Web Apps no está sirviendo los archivos JavaScript con el Content-Type correcto. Hemos actualizado la configuración pero necesitas hacer un nuevo build y deployment.

## Pasos para Deployment

### 1. Build Local (Testing)

```bash
# Desde la raíz del proyecto
cd app

# Limpiar build anterior
rm -rf dist

# Build de producción
npm run build

# Verificar que staticwebapp.config.json se copió
ls -la dist/staticwebapp.config.json

# Deberías ver el mensaje:
# ✓ Copied staticwebapp.config.json to dist/
```

### 2. Preview Local

```bash
# Instalar serve si no lo tienes
npm install -g serve

# Servir el build localmente
serve -s dist -l 3000

# Abrir http://localhost:3000
# Verificar que no hay errores de MIME type en la consola
```

### 3. Deployment a Azure

#### Opción A: Usando GitHub Actions (Recomendado)

```bash
# Simplemente push tus cambios
git add .
git commit -m "fix: update build config and MIME types"
git push origin main

# GitHub Actions automáticamente:
# 1. Hace build de la app
# 2. Copia staticwebapp.config.json
# 3. Deploya a Azure
```

#### Opción B: Deployment Manual con Azure CLI

```bash
# Instalar Azure CLI si no lo tienes
# https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

# Login a Azure
az login

# Build
cd app
npm run build

# Deploy
az staticwebapp deploy \
  --name agribusiness-erp \
  --resource-group your-resource-group \
  --source ./dist \
  --token $AZURE_STATIC_WEB_APPS_API_TOKEN
```

### 4. Verificación Post-Deployment

1. **Abrir la aplicación en producción**
   - URL: https://erp.agribusiness.com.py

2. **Abrir DevTools (F12)**
   - Ir a la pestaña Network
   - Filtrar por "JS"
   - Recargar la página (Ctrl+Shift+R)

3. **Verificar Headers**
   - Click en cualquier archivo .js
   - Ir a la pestaña "Headers"
   - Verificar que `Content-Type: text/javascript; charset=utf-8`

4. **Verificar Console**
   - No debería haber errores de MIME type
   - La aplicación debería cargar correctamente

### 5. Limpiar Caché (Si es necesario)

Si después del deployment aún ves el error:

```bash
# En el navegador:
# Chrome/Edge: Ctrl+Shift+Delete → Clear cache
# Firefox: Ctrl+Shift+Delete → Clear cache

# O abrir en modo incógnito:
# Chrome/Edge: Ctrl+Shift+N
# Firefox: Ctrl+Shift+P
```

## Configuración de GitHub Actions

Verificar que `.github/workflows/azure-static-web-apps-*.yml` incluya:

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
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd app
          npm ci

      - name: Build
        run: |
          cd app
          npm run build

      - name: Deploy to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/app/dist"
          api_location: ""
          output_location: ""
```

## Troubleshooting

### Error persiste después del deployment

1. **Verificar que staticwebapp.config.json está en dist:**
   ```bash
   # En GitHub Actions logs, buscar:
   ✓ Copied staticwebapp.config.json to dist/
   ```

2. **Verificar configuración en Azure Portal:**
   - Ir a Azure Portal
   - Buscar tu Static Web App
   - Configuration → revisar que no haya overrides

3. **Forzar rebuild completo:**
   ```bash
   cd app
   rm -rf dist node_modules package-lock.json
   npm install
   npm run build
   ```

### Archivos con hash incorrecto

Si los archivos se generan con nombres extraños:

```bash
# Verificar en vite.config.ts que tengas:
entryFileNames: 'assets/[name]-[hash].js',
chunkFileNames: 'assets/[name]-[hash].js',
```

### 404 en vite.svg

Verificar que `public/vite.svg` existe:
```bash
ls -la app/public/vite.svg
```

Si no existe, cambiar en `index.html`:
```html
<!-- De: -->
<link rel="icon" type="image/svg+xml" href="/vite.svg" />

<!-- A: -->
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
```

## Cambios Realizados

### 1. vite.config.ts
- ✅ Plugin para copiar staticwebapp.config.json a dist
- ✅ Headers correctos en dev server
- ✅ Naming correcto de chunks
- ✅ Source maps habilitados

### 2. staticwebapp.config.json
- ✅ Content-Type: text/javascript; charset=utf-8
- ✅ Routes para /*.js y /*.mjs
- ✅ Routes para /assets/*.js y /assets/*.mjs
- ✅ MIME types actualizados
- ✅ Response overrides para SPA routing
- ✅ Cache-Control para assets

## Monitoreo

### Logs de Azure Static Web Apps

```bash
# Ver logs de deployment
az staticwebapp show \
  --name agribusiness-erp \
  --resource-group your-resource-group

# Ver logs de funciones (si tienes API)
az staticwebapp functions show \
  --name agribusiness-erp \
  --resource-group your-resource-group
```

### Application Insights (Opcional)

Si tienes Application Insights configurado:
1. Azure Portal → Application Insights
2. Logs → Buscar errores de MIME type
3. Performance → Verificar tiempos de carga

## Checklist Final

Antes de dar por resuelto:

- [ ] Build local exitoso con mensaje de copia de config
- [ ] Preview local sin errores en consola
- [ ] Push a GitHub
- [ ] GitHub Actions completado exitosamente
- [ ] Deployment a Azure exitoso
- [ ] Verificación en producción:
  - [ ] Sin errores MIME type
  - [ ] Content-Type correcto en Network tab
  - [ ] vite.svg carga correctamente (o está comentado)
  - [ ] Aplicación funcional
  - [ ] Routing SPA funciona
- [ ] Cache limpiado en navegador de prueba
- [ ] Probado en modo incógnito

## Soporte

Si el problema persiste:
1. Verificar GitHub Actions logs
2. Verificar Azure Portal logs
3. Abrir un issue en el repositorio con:
   - Screenshot del error
   - Screenshot de Network tab
   - Screenshot de Headers del archivo .js
   - URL del deployment

---

**Última actualización:** 2025-01-18
**Versión:** 1.0.0
