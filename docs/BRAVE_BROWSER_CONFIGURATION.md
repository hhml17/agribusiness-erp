# Configuración para Brave Browser

**Fecha:** 18 de Diciembre 2025

Brave Browser tiene protecciones de privacidad muy agresivas que pueden bloquear tu aplicación ERP. Aquí está cómo solucionarlo.

---

## 🛡️ Solución Rápida (30 segundos)

### Opción 1: Deshabilitar Brave Shields para tu sitio

1. **Abre:** https://erp.agribusiness.com.py
2. **En la barra de direcciones, busca el ícono del león (Brave Shields)**
3. **Haz clic en el león**
4. **Mueve el interruptor principal a "OFF"** (debe ponerse gris)
5. **La página se recargará automáticamente**

Visual:
```
🦁 (Ícono del león) → Click → Shields OFF ⬜
```

---

### Opción 2: Configuración Avanzada de Shields

Si quieres mantener algunas protecciones activas:

1. **Click en el león de Brave Shields**
2. **Configuración avanzada:**
   - **Bloqueo de trackers y anuncios:** ⬇️ Down (Permisivo)
   - **Bloqueo de scripts:** ⬇️ Down (Permitir todos)
   - **Bloqueo de cookies:** 🍪 Permitir todas
   - **Bloqueo de fingerprinting:** ⬇️ Down (Permitir todos)

---

## 🔧 Configuración Permanente

### Para que SIEMPRE funcione en Brave:

1. **Abre Brave Settings:**
   ```
   brave://settings/shields
   ```

2. **Agregar excepción:**
   - Scroll hasta "Sites that never use Shields"
   - Click en **"Add"**
   - Agrega: `erp.agribusiness.com.py`
   - Click en **"Add"**

---

## 🚀 Si Nada Funciona: Usar Modo Privado sin Shields

1. **Abre ventana privada con Tor:** `Ctrl+Shift+N` (Windows/Linux) o `Cmd+Shift+N` (Mac)
2. **En la ventana privada:**
   - Click en el león
   - Deshabilita Shields
3. **Abre:** https://erp.agribusiness.com.py

---

## 📝 Para Desarrolladores: Mejoras en el Código

Vamos a agregar configuraciones específicas para que Brave sea menos agresivo con nuestra app.

---

**Última actualización:** 18 de Diciembre 2025
