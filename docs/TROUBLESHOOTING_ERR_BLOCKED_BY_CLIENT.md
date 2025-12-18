# Troubleshooting: ERR_BLOCKED_BY_CLIENT

**Error:** `Failed to load resource: net::ERR_BLOCKED_BY_CLIENT`

**Fecha:** 18 de Diciembre 2025

---

## ¿Qué es este Error?

Este error aparece cuando el navegador o una extensión bloquea la carga de recursos (JavaScript, CSS, imágenes, etc.). **NO es un problema del código**, sino de extensiones o configuraciones del navegador.

---

## Causas Comunes

### 1. Bloqueadores de Anuncios (Más Común)
- **AdBlock**
- **uBlock Origin**
- **AdBlock Plus**
- **AdGuard**

### 2. Extensiones de Privacidad
- **Privacy Badger**
- **Ghostery**
- **Disconnect**

### 3. Antivirus o Firewall
- Algunos antivirus bloquean recursos de sitios desconocidos

### 4. Configuraciones del Navegador
- Configuración de privacidad muy estricta
- Bloqueo de trackers

---

## Soluciones

### Solución 1: Desactivar Bloqueadores de Anuncios (Recomendado)

#### En Chrome/Edge:

1. **Clic en el ícono de la extensión** (arriba a la derecha)
2. **Busca AdBlock, uBlock u otra extensión similar**
3. **Clic derecho > "Gestionar extensión"**
4. **Desactivar en este sitio:**
   - Agrega `erp.agribusiness.com.py` a la lista blanca
   - O desactiva la extensión temporalmente

#### Método rápido:
1. Clic en el ícono del bloqueador (shield o similar)
2. Selecciona "Pausar en este sitio" o "Whitelist"
3. Refresca la página (F5)

---

### Solución 2: Modo Incógnito sin Extensiones

1. Abre una ventana de incógnito: `Ctrl+Shift+N` (Windows/Linux) o `Cmd+Shift+N` (Mac)
2. Las extensiones generalmente están desactivadas en modo incógnito
3. Abre: https://erp.agribusiness.com.py

---

### Solución 3: Deshabilitar Todas las Extensiones

#### En Chrome/Edge:

1. Ve a: `chrome://extensions/` o `edge://extensions/`
2. Desactiva **todas** las extensiones temporalmente
3. Refresca https://erp.agribusiness.com.py
4. Si funciona, activa las extensiones una por una para identificar cuál causa el problema

---

### Solución 4: Otro Navegador

Prueba en un navegador diferente:
- **Chrome** → **Edge**
- **Firefox** → **Chrome**
- **Safari** → **Chrome**

Si funciona en otro navegador, confirma que el problema es una extensión.

---

## Verificar Qué Recurso Está Bloqueado

### Método 1: DevTools (F12)

1. Abre DevTools: `F12`
2. Ve a la pestaña **"Console"**
3. Busca mensajes rojos con `ERR_BLOCKED_BY_CLIENT`
4. Te dirá exactamente qué archivo fue bloqueado

Ejemplo:
```
Failed to load resource: net::ERR_BLOCKED_BY_CLIENT
https://erp.agribusiness.com.py/assets/index-abc123.js
```

### Método 2: Network Tab

1. Abre DevTools: `F12`
2. Ve a la pestaña **"Network"**
3. Refresca la página (F5)
4. Busca archivos con estado `(blocked:client)` en rojo

---

## Para Desarrolladores

Si eres desarrollador y quieres evitar que los bloqueadores causen problemas:

### 1. No usar nombres sospechosos

❌ **Evitar:**
- `analytics.js`
- `tracking.js`
- `ads.js`
- `facebook.js`
- `google-analytics.js`

✅ **Usar:**
- `main.js`
- `app.js`
- `bundle.js`
- Nombres generados por Vite (hash aleatorio)

### 2. Configurar lista blanca para tu dominio

En producción, agrega instrucciones para que los usuarios agreguen tu dominio a la lista blanca:

```
Agrega erp.agribusiness.com.py a la lista blanca de tu bloqueador de anuncios
```

---

## Estado Actual del Proyecto

### ✅ Configuración Correcta

Nuestro proyecto **NO tiene código de tracking o analytics**, por lo que el error es causado por:
- Extensiones bloqueando JavaScript genérico
- Configuración muy estricta del navegador

### Archivos que Pueden ser Bloqueados

Vite genera archivos con nombres aleatorios:
```
/assets/index-abc123.js
/assets/index-xyz789.css
```

Algunos bloqueadores agresivos pueden bloquear **cualquier** JavaScript, incluso el de tu propia aplicación.

---

## Solución Definitiva para Usuarios

### Para Usuarios del ERP:

**Opción 1: Whitelist (Recomendado)**
```
1. Clic en el ícono del bloqueador (arriba a la derecha)
2. Seleccionar "Deshabilitar en erp.agribusiness.com.py"
3. Recargar la página
```

**Opción 2: Modo Incógnito**
```
1. Ctrl+Shift+N (Windows/Linux) o Cmd+Shift+N (Mac)
2. Abrir: https://erp.agribusiness.com.py
```

**Opción 3: Otro Navegador**
```
Usar Chrome, Edge o Firefox sin extensiones
```

---

## FAQ

### P: ¿Es seguro desactivar mi bloqueador de anuncios?

**R:** Sí, **solo para erp.agribusiness.com.py**. Es tu propia aplicación, no tiene anuncios ni trackers.

### P: ¿El error aparece en todos los navegadores?

**R:** No. Solo aparece en navegadores con extensiones de bloqueo instaladas.

### P: ¿Afecta la funcionalidad de la app?

**R:** Sí. Si se bloquea el JavaScript principal, la app no cargará correctamente.

### P: ¿Puedo ignorar el error?

**R:** No. Debes resolverlo para que la aplicación funcione.

---

## Logs para Debugging

Si el error persiste después de desactivar extensiones, proporciona estos logs:

### 1. Console Errors (F12 > Console)
```
[Screenshot o copia del error completo]
```

### 2. Network Tab (F12 > Network)
```
[Lista de archivos bloqueados]
```

### 3. Navegador y Versión
```
Ejemplo: Chrome 120.0.6099.129
```

### 4. Extensiones Instaladas
```
Lista de extensiones activas
```

---

## Resumen

| Problema | Solución |
|----------|----------|
| **Bloqueador de anuncios** | Agregar `erp.agribusiness.com.py` a whitelist |
| **Extensiones de privacidad** | Desactivar temporalmente |
| **Configuración estricta** | Usar modo incógnito |
| **Antivirus bloqueando** | Agregar excepción para el dominio |

---

**Solución Rápida (30 segundos):**
1. Abre modo incógnito: `Ctrl+Shift+N`
2. Ve a: https://erp.agribusiness.com.py
3. Si funciona → El problema es una extensión
4. Identifica qué extensión y agrégala a whitelist

---

**Última Actualización:** 18 de Diciembre 2025
