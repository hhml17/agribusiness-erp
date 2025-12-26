# 🔧 SOLUCIÓN - Frontend Local Muestra Solo HTML

## 🎯 PROBLEMA

Cuando abres `http://localhost:5174` ves el código HTML en lugar de la aplicación React.

**Lo que estás viendo:**
```html
<!doctype html>
<html lang="es">
  <head>
    <script type="module">...</script>
    ...
```

**Lo que deberías ver:**
La aplicación React cargada con la interfaz gráfica.

---

## 🔍 CAUSA DEL PROBLEMA

Hay **3 posibles causas**:

### Causa 1: Navegador mostrando código fuente
Si hiciste "Ver código fuente" (View Source) en lugar de solo abrir la URL.

### Causa 2: Error JavaScript bloqueando React
Algún error en el código JavaScript impide que React se cargue.

### Causa 3: Problema con módulos ES6
El navegador no puede cargar los módulos TypeScript/JSX.

---

## ✅ SOLUCIÓN PASO A PASO

### PASO 1: Verificar que NO estás viendo el código fuente

1. **Cierra el navegador completamente**
2. **Abre un navegador nuevo** (Chrome, Firefox, o Edge)
3. **Escribe directamente en la barra de direcciones:**
   ```
   http://localhost:5174
   ```
4. **Presiona Enter**

**NO hagas:**
- ❌ Click derecho > Ver código fuente
- ❌ Ctrl+U (ver fuente)
- ❌ Copiar/pegar desde otro lugar

---

### PASO 2: Abrir la Consola del Navegador

1. **Abre http://localhost:5174**
2. **Presiona F12** (o Click Derecho > Inspeccionar)
3. **Ve a la pestaña "Console"**

**Busca errores rojos**. Si ves alguno, anótalos.

**Errores comunes:**
- `Failed to resolve module`
- `Cannot find module`
- `Unexpected token`
- `SyntaxError`

---

### PASO 3: Limpiar Caché y Reiniciar

```bash
# 1. Detener el servidor Vite
# (Presiona Ctrl+C en la terminal donde está corriendo)

# 2. Limpiar cache de Vite
cd /Users/hansharder/Documents/GitHub/agribusiness-erp/app
rm -rf node_modules/.vite

# 3. Limpiar cache del navegador
# En Chrome: Ctrl+Shift+Delete > Borrar cache

# 4. Reiniciar servidor
npm run dev
```

---

### PASO 4: Verificar Main.tsx

Voy a verificar que el archivo main.tsx no tenga errores:

```bash
cd /Users/hansharder/Documents/GitHub/agribusiness-erp/app
cat src/main.tsx
```

**Debería verse así:**
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

### PASO 5: Probar con otro puerto

A veces el puerto 5174 tiene conflictos:

```bash
cd /Users/hansharder/Documents/GitHub/agribusiness-erp/app

# Detener servidor actual (Ctrl+C)

# Iniciar en puerto específico
npm run dev -- --port 5175
```

Luego abre: `http://localhost:5175`

---

## 🧪 DIAGNÓSTICO AVANZADO

Si los pasos anteriores no funcionan, ejecuta estos comandos:

### Verificar que Vite está sirviendo archivos correctamente

```bash
# Probar si Vite responde
curl http://localhost:5174/

# Probar si puede cargar main.tsx
curl http://localhost:5174/src/main.tsx

# Ver logs de Vite
# (en la terminal donde corre npm run dev)
```

---

### Verificar errores de TypeScript

```bash
cd /Users/hansharder/Documents/GitHub/agribusiness-erp/app

# Ver si hay errores de compilación
npx tsc --noEmit
```

Si hay errores, los verás listados. Muchos errores de TypeScript NO bloquean el dev server, pero algunos sí.

---

## 🔧 SOLUCIONES ALTERNATIVAS

### Opción A: Usar el Build de Producción Localmente

Si el dev server no funciona, puedes probar el build de producción:

```bash
cd /Users/hansharder/Documents/GitHub/agribusiness-erp/app

# Hacer build
npm run build

# Servir el build local
npx serve -s dist -p 5175
```

Luego abre: `http://localhost:5175`

Esto debería funcionar porque el build ya está hecho y no depende de módulos dinámicos.

---

### Opción B: Verificar Variables de Entorno

El frontend puede estar esperando variables de entorno que no existen:

```bash
cd /Users/hansharder/Documents/GitHub/agribusiness-erp/app

# Verificar archivo .env
cat .env

# Debería tener:
VITE_API_URL=http://localhost:3001
```

Si falta, créalo:

```bash
cat > .env << 'EOF'
VITE_API_URL=http://localhost:3001
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_TENANT_ID=your-tenant-id
EOF
```

---

## 📊 CHECKLIST DE VERIFICACIÓN

Verifica cada punto:

- [ ] El servidor Vite está corriendo (ves "ready in X ms")
- [ ] Abriste `http://localhost:5174` (no 5173)
- [ ] NO estás viendo el código fuente (View Source)
- [ ] La consola del navegador (F12) está abierta
- [ ] Buscaste errores rojos en la consola
- [ ] Limpiaste cache de Vite (`rm -rf node_modules/.vite`)
- [ ] Limpiaste cache del navegador
- [ ] Reiniciaste el servidor Vite

---

## 🎯 LO MÁS PROBABLE

Basándome en el síntoma (ver HTML crudo), lo **más probable** es que:

1. **Estás viendo el código fuente** en lugar de la página renderizada
   - Solución: Abre la URL directamente, no uses "Ver fuente"

2. **Hay un error JavaScript en la consola**
   - Solución: Abre F12, ve a Console, busca errores rojos

3. **El navegador tiene cache viejo**
   - Solución: Ctrl+Shift+R (recarga forzada)

---

## 🚀 PRUEBA RÁPIDA

**Ejecuta esto AHORA:**

```bash
# 1. Ve a la carpeta app
cd /Users/hansharder/Documents/GitHub/agribusiness-erp/app

# 2. Limpia cache
rm -rf node_modules/.vite

# 3. Para el servidor si está corriendo (Ctrl+C)

# 4. Inicia de nuevo
npm run dev
```

**Luego:**
1. Abre Chrome/Firefox/Edge
2. Presiona `Ctrl+Shift+N` (modo incógnito)
3. Ve a `http://localhost:5174`
4. Presiona `F12`
5. Mira la pestaña Console

**¿Qué ves?**
- ✅ Si ves la aplicación React → Funcionó
- ❌ Si ves HTML crudo → Copia los errores de Console y avísame
- ❌ Si ves errores rojos → Copia los errores y avísame

---

## 📞 NECESITO MÁS INFO

Para ayudarte mejor, necesito saber:

1. **¿Qué navegador estás usando?** (Chrome, Firefox, Edge, Safari, Brave)

2. **¿Qué ves en la pestaña Console (F12)?**
   - Copia cualquier error rojo que aparezca

3. **¿Cómo abriste la URL?**
   - ¿Escribiste directamente en la barra?
   - ¿Hiciste click en un link?
   - ¿Usaste "Ver código fuente"?

4. **¿Qué dice el servidor Vite en la terminal?**
   - ¿Muestra algún error?
   - ¿Dice "ready in X ms"?

---

## 💡 MIENTRAS TANTO

Mientras solucionamos el frontend local, **el backend SÍ está funcionando**.

Puedes probar los endpoints directamente:

```bash
# Health check
curl http://localhost:3001/health

# Lista de endpoints
curl http://localhost:3001/api

# Ver productos (necesita tenant-id)
curl -H "x-tenant-id: test" http://localhost:3001/api/productos
```

O abre en el navegador:
- http://localhost:3001/health
- http://localhost:3001/api

Esto te confirmará que al menos el backend funciona correctamente.

---

**Última actualización:** 26 Diciembre 2025 - 08:55
