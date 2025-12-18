# Configuración Azure Static Web App - Agribusiness ERP

**Fecha de Actualización:** 18 de Diciembre 2025

## Resumen

Este documento describe la configuración necesaria para el nuevo repositorio `agribusiness-erp` y su Azure Static Web App.

---

## 1. Información de la Azure Static Web App

### Detalles del Recurso
- **Nombre:** thankful-ground-083e4cb10
- **URL Temporal:** https://thankful-ground-083e4cb10.3.azurestaticapps.net
- **URL Producción:** erp.agribusiness.com.py (cuando el dominio esté configurado)
- **Grupo de Recursos:** Agribusiness
- **Suscripción:** Suscripción de Azure 1
- **ID de Suscripción:** 4422590a-9442-4ac4-b334-0e7f7b536803
- **Ubicación:** Global
- **SKU:** Free
- **Origen:** main branch (GitHub: hhml17/agribusiness-erp)

---

## 2. Configuración de GitHub Secrets

Para que el workflow de GitHub Actions funcione, necesitas agregar estos secrets en tu repositorio de GitHub:

### Ir a: `Settings > Secrets and variables > Actions > New repository secret`

Agregar los siguientes secrets:

| Secret Name | Valor | Descripción |
|------------|-------|-------------|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | [Obtener del Azure Portal] | Token de despliegue de Azure Static Web Apps |
| `VITE_API_URL_PROD` | `https://[tu-app-service].azurewebsites.net/api` | URL de tu backend en producción |
| `VITE_TENANT_ID` | `f055e681-6d0b-451c-beb9-155c316d3a75` | ID del tenant (Estancia Los Alamos) |
| `VITE_AZURE_CLIENT_ID` | `185a1a46-e8fe-4dc9-97b0-22629f47f8be` | Client ID de Azure AD |
| `VITE_AZURE_TENANT_ID` | `ddf2df3e-9f06-4201-a06c-b71c69f64818` | Tenant ID de Azure AD |

### Cómo obtener el Token de Azure Static Web Apps:

1. Ve al Azure Portal: https://portal.azure.com
2. Busca tu Static Web App: "thankful-ground-083e4cb10"
3. En el menú izquierdo, selecciona "Overview"
4. Haz clic en "Manage deployment token"
5. Copia el token y pégalo como secret en GitHub

---

## 3. Configuración de Azure AD (Microsoft Entra)

### Redirect URIs que debes configurar en Azure AD:

1. Ve al Azure Portal: https://portal.azure.com
2. Busca "Microsoft Entra ID" (Azure Active Directory)
3. Ve a "App registrations"
4. Busca tu aplicación (Client ID: `185a1a46-e8fe-4dc9-97b0-22629f47f8be`)
5. Ve a "Authentication"
6. Agrega estos Redirect URIs:

**Single-page application:**
- `http://localhost:5173` (desarrollo local)
- `https://thankful-ground-083e4cb10.3.azurestaticapps.net` (temporal)
- `https://erp.agribusiness.com.py` (producción, cuando esté listo)

**Logout URLs:**
- `http://localhost:5173` (desarrollo local)
- `https://erp.agribusiness.com.py` (producción)

---

## 4. Estructura de Archivos Actualizada

### Archivos Nuevos Creados:
```
/agribusiness-erp/
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml    ← NUEVO (workflow de CI/CD)
├── app/
│   ├── .env                              ← ACTUALIZADO (local dev)
│   ├── .env.example                      ← ACTUALIZADO (template)
│   ├── .env.production                   ← NUEVO (template para producción)
│   ├── public/
│   │   └── staticwebapp.config.json     ← NUEVO (config de Azure SWA)
│   └── src/
│       └── config/
│           └── authConfig.ts            ← ACTUALIZADO (URLs nuevas)
└── docs/
    ├── CONFIGURACION_AZURE_STATIC_WEB_APP.md  ← ESTE ARCHIVO
    └── Plan/
        └── PROMPT_COPIAR_PEGAR_IA.md    ← ACTUALIZADO (nuevo repo)
```

---

## 5. Variables de Entorno

### Desarrollo Local (.env)
```bash
VITE_API_URL=http://localhost:3001/api
VITE_TENANT_ID=f055e681-6d0b-451c-beb9-155c316d3a75
VITE_AZURE_CLIENT_ID=185a1a46-e8fe-4dc9-97b0-22629f47f8be
VITE_AZURE_TENANT_ID=ddf2df3e-9f06-4201-a06c-b71c69f64818
VITE_REDIRECT_URI=http://localhost:5173
VITE_DEV_USER_EMAIL=hans@agribusiness.com.py
VITE_DEV_MODE=false
```

### Producción (configuradas en GitHub Secrets)
```bash
VITE_API_URL=[URL de tu App Service]
VITE_TENANT_ID=f055e681-6d0b-451c-beb9-155c316d3a75
VITE_AZURE_CLIENT_ID=185a1a46-e8fe-4dc9-97b0-22629f47f8be
VITE_AZURE_TENANT_ID=ddf2df3e-9f06-4201-a06c-b71c69f64818
VITE_REDIRECT_URI=https://erp.agribusiness.com.py
VITE_DEV_MODE=false
```

---

## 6. Proceso de Despliegue

### Despliegue Automático:
1. Haz push a la rama `main`
2. GitHub Actions ejecutará automáticamente el workflow
3. La app se desplegará en Azure Static Web Apps
4. Puedes ver el progreso en: `Actions` tab en GitHub

### Despliegue Manual (si es necesario):
```bash
# Desde la raíz del proyecto
cd app
npm run build

# El contenido de app/dist/ se desplegará a Azure
```

---

## 7. Verificación Post-Despliegue

Después del primer despliegue, verifica:

1. **Frontend desplegado:**
   - Visita: https://thankful-ground-083e4cb10.3.azurestaticapps.net
   - Debe mostrar la página de login

2. **Autenticación funciona:**
   - Haz clic en "Login"
   - Debe redirigir a Microsoft login
   - Después del login, debe redirigir de vuelta a tu app

3. **API conectada (cuando esté desplegada):**
   - Verifica que las llamadas al backend funcionen
   - Revisa la consola del navegador para errores

---

## 8. Configuración del Dominio Personalizado

### Cuando el dominio `erp.agribusiness.com.py` esté listo:

1. Ve al Azure Portal
2. Busca tu Static Web App: "thankful-ground-083e4cb10"
3. En el menú izquierdo, selecciona "Custom domains"
4. Haz clic en "Add"
5. Ingresa: `erp.agribusiness.com.py`
6. Sigue las instrucciones para agregar el registro DNS:
   - Tipo: CNAME
   - Nombre: erp
   - Valor: thankful-ground-083e4cb10.3.azurestaticapps.net

7. Actualiza los Redirect URIs en Azure AD con el nuevo dominio

---

## 9. Troubleshooting

### El workflow de GitHub Actions falla:
- Verifica que el secret `AZURE_STATIC_WEB_APPS_API_TOKEN` esté configurado
- Verifica que todos los otros secrets estén configurados
- Revisa los logs en la pestaña "Actions" de GitHub

### Error de autenticación:
- Verifica que los Redirect URIs estén configurados en Azure AD
- Verifica que `VITE_AZURE_CLIENT_ID` y `VITE_AZURE_TENANT_ID` sean correctos

### Error al conectar con el backend:
- Verifica que `VITE_API_URL` apunte a la URL correcta
- Verifica que el backend esté corriendo y accesible

---

## 10. Próximos Pasos

1. **Configurar GitHub Secrets** (CRÍTICO)
   - Agregar `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - Agregar todas las variables de entorno de producción

2. **Primer Deploy**
   - Hacer push a `main` para trigger el workflow
   - Verificar que el despliegue sea exitoso

3. **Configurar Dominio**
   - Cuando `erp.agribusiness.com.py` esté listo
   - Agregar el custom domain en Azure

4. **Actualizar Azure AD**
   - Agregar todos los Redirect URIs
   - Configurar Logout URLs

5. **Deploy del Backend**
   - Crear Azure App Service para el backend
   - Actualizar `VITE_API_URL_PROD` con la URL del backend

---

## Contacto

Para preguntas o problemas:
- Usuario: Hans (hhml17)
- Email: hans@agribusiness.com.py
- Repositorio: https://github.com/hhml17/agribusiness-erp
