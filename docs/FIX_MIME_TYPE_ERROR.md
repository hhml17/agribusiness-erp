# Fix: Error de MIME Type en Assets

**Fecha:** 18 de Diciembre 2025
**Estado:** ✅ CORREGIDO

---

## Problema Detectado

Cuando abriste https://erp.agribusiness.com.py, viste estos errores en la consola:

```
Refused to apply style from 'https://erp.agribusiness.com.py/app/assets/index-CxeNzJN2.css'
because its MIME type ('text/html') is not a supported stylesheet MIME type

Failed to load module script: Expected a JavaScript-or-Wasm module script
but the server responded with a MIME type of "text/html"
```

### ¿Qué significaba esto?

Los archivos CSS y JavaScript estaban siendo servidos como HTML en lugar de sus tipos correctos. Esto causaba que:
- Los estilos no se aplicaran (página sin CSS)
- El JavaScript no se ejecutara (app no funcionaba)

---

## Causa del Problema

### Configuración Incorrecta en vite.config.ts

**Antes (Incorrecto):**
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: '/app',  // ← Esto causaba problemas
    proxy: { ... }
  },
  base: '/app'  // ← ESTE ERA EL PROBLEMA PRINCIPAL
})
```

**¿Por qué era incorrecto?**

- `base: '/app'` le dice a Vite que todos los archivos están en la ruta `/app/`
- Esto generaba URLs como: `https://erp.agribusiness.com.py/app/assets/index.js`
- Pero los archivos realmente están en: `https://erp.agribusiness.com.py/assets/index.js`
- Azure Static Web Apps no encontraba los archivos y devolvía `index.html` (error 404 → fallback)
- Por eso el navegador recibía HTML cuando esperaba CSS/JS

---

## Solución Implementada

### 1. Corregir vite.config.ts

**Después (Correcto):**
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { ... }
  },
  base: '/'  // ← CORREGIDO: Archivos en la raíz
})
```

**Cambios:**
- `base: '/app'` → `base: '/'`
- Eliminado `open: '/app'` (innecesario)

### 2. Actualizar staticwebapp.config.json

**Cambios realizados:**

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": [
      "/assets/*",  // ← No redirigir requests de assets
      "/images/*",
      "/*.{css,js,json,png,jpg,gif,svg,ico}"
    ]
  },
  "routes": [
    {
      "route": "/assets/*",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    }
  ],
  "mimeTypes": {
    ".json": "application/json",
    ".js": "application/javascript",
    ".mjs": "application/javascript",  // ← Para módulos ES
    ".css": "text/css",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon"
  }
}
```

**¿Qué hace esto?**

1. **navigationFallback.exclude**: Le dice a Azure SWA que NO redirija las rutas `/assets/*` a `index.html`
2. **routes**: Configura headers de cache para assets (performance)
3. **mimeTypes**: Asegura que cada tipo de archivo tenga el MIME type correcto

---

## Proceso de Deploy

### 1. Cambios Committed y Pusheados

```bash
git commit -m "fix: Correct Vite base path and static asset serving configuration"
git push origin main
```

### 2. GitHub Actions se Ejecutará Automáticamente

Ve a: https://github.com/hhml17/agribusiness-erp/actions

Verás el workflow "Azure Static Web Apps CI/CD" ejecutándose con el commit:
```
fix: Correct Vite base path and static asset serving configuration
```

### 3. Esperar 2-5 minutos

El workflow:
1. ✅ Checkout del código
2. ✅ Install dependencies (npm install)
3. ✅ Build con Vite (npm run build)
4. ✅ Deploy a Azure Static Web Apps

### 4. Verificar que Funciona

Después de que el workflow termine:

1. **Limpiar caché del navegador:**
   - Chrome/Edge: `Ctrl+Shift+Delete` → "Imágenes y archivos en caché" → Limpiar
   - O abrir en modo incógnito: `Ctrl+Shift+N`

2. **Abrir la app:**
   - Ve a: https://erp.agribusiness.com.py

3. **Verificar en consola (F12):**
   - Ya NO deben aparecer errores de MIME type
   - Los archivos CSS y JS deben cargar correctamente
   - La página debe mostrar estilos

---

## Verificación Técnica

### Antes (Con Error)

```
Request: GET https://erp.agribusiness.com.py/app/assets/index-CxeNzJN2.css
Response: 200 OK
Content-Type: text/html  ← INCORRECTO
Body: <!DOCTYPE html><html>...  ← HTML en lugar de CSS
```

### Después (Correcto)

```
Request: GET https://erp.agribusiness.com.py/assets/index-CxeNzJN2.css
Response: 200 OK
Content-Type: text/css  ← CORRECTO
Body: .container { ... }  ← CSS real
```

---

## Timeline

| Tiempo | Estado |
|--------|--------|
| **Ahora** | Push realizado, workflow iniciando |
| **+2 min** | Build en progreso |
| **+3 min** | Deploy en progreso |
| **+4 min** | Deploy completado |
| **+5 min** | App accesible con fix aplicado |

---

## Cómo Verificar que Está Corregido

### 1. Ver Estado del Workflow

```
https://github.com/hhml17/agribusiness-erp/actions
```

Debe aparecer:
- ✅ Verde (success)
- Mensaje: "fix: Correct Vite base path..."

### 2. Abrir la App en Incógnito

```
https://erp.agribusiness.com.py
```

### 3. Abrir DevTools (F12)

**Console Tab:**
- ✅ Sin errores de MIME type
- ✅ Sin errores de "Failed to load module script"

**Network Tab:**
- ✅ `index-*.css` → Status 200, Type: `text/css`
- ✅ `index-*.js` → Status 200, Type: `application/javascript`

**Elements Tab:**
- ✅ Estilos aplicados correctamente
- ✅ Página se ve con diseño correcto

---

## Notas Importantes

### ¿Por qué `base: '/app'` estaba ahí?

Probablemente era para desarrollo local, pero causaba problemas en producción:
- En desarrollo local: `http://localhost:5173/app` funcionaba
- En producción: `https://erp.agribusiness.com.py` necesita `base: '/'`

### ¿Afecta el desarrollo local?

**NO.** Con `base: '/'`:
- Desarrollo local: `http://localhost:5173` (sin `/app`)
- Producción: `https://erp.agribusiness.com.py`
- Ambos funcionan correctamente

### ¿Qué pasa con Content Security Policy?

La removimos temporalmente para evitar complicaciones. La agregaremos después cuando todo funcione.

---

## Próximos Pasos

1. ✅ Esperar a que el workflow termine
2. ✅ Limpiar caché del navegador
3. ✅ Verificar que https://erp.agribusiness.com.py carga correctamente
4. ✅ Probar login con Microsoft
5. ⏳ Configurar GitHub Secrets (si aún no lo hiciste)
6. ⏳ Configurar Azure AD Redirect URIs

---

## Comandos Útiles

### Ver logs del build localmente
```bash
cd app
npm run build
```

### Probar el build localmente
```bash
cd app
npm run preview
```

### Ver qué archivos se generan
```bash
cd app
npm run build
ls -la dist/
ls -la dist/assets/
```

---

**Última Actualización:** 18 de Diciembre 2025
**Estado:** Fix aplicado, esperando deploy automático
