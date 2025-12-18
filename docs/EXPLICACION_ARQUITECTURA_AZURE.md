# Explicación de la Arquitectura Azure - Agribusiness ERP

**Fecha:** 18 de Diciembre 2025

## Tu Configuración Actual (Correcta)

### 1. Azure AD App Registration (Autenticación)

**Nombre:** Agribusiness ERP - Frontend

```
Application (client) ID: 185a1a46-e8fe-4dc9-97b0-22629f47f8be
Object ID:              79373bee-2b46-49ba-92bf-93aa769d7b99
Directory (tenant) ID:  ddf2df3e-9f06-4201-a06c-b71c69f64818
Tipos de cuenta:        Varias organizaciones
```

**Redirect URIs configurados:**
- ✅ 3 SPA (Single-Page Application) URIs

**Propósito:**
- Esta es tu configuración de autenticación (Microsoft Entra ID / Azure AD)
- Permite que los usuarios hagan login con Microsoft
- Se usa en el frontend para autenticar usuarios

### 2. Azure Static Web App (Hosting del Frontend)

**Nombre:** thankful-ground-083e4cb10

```
URL de Producción: https://erp.agribusiness.com.py
URL Temporal:      https://thankful-ground-083e4cb10.3.azurestaticapps.net
Grupo de Recursos: Agribusiness
SKU:              Free
```

**Propósito:**
- Hospeda tu frontend React
- Sirve los archivos estáticos (HTML, JS, CSS)
- Maneja el routing de tu SPA
- Integrado con GitHub para CI/CD automático

---

## ¿Están Relacionados?

**SÍ, pero son cosas DIFERENTES:**

### Azure AD App Registration
- **Qué es:** Configuración de autenticación
- **Para qué:** Login de usuarios con Microsoft
- **Dónde se usa:** En tu código React (authConfig.ts)
- **No es un "hosting":** Solo maneja la autenticación

### Azure Static Web App
- **Qué es:** Servidor web para tu aplicación
- **Para qué:** Hospedar y servir tu frontend React
- **Dónde se usa:** Azure lo usa para publicar tu app
- **No maneja autenticación:** Solo sirve archivos

### ¿Cómo trabajan juntos?

```
Usuario abre: https://erp.agribusiness.com.py
    ↓
Azure Static Web App sirve tu React app
    ↓
React app usa Azure AD App Registration para login
    ↓
Usuario se autentica con Microsoft
    ↓
React app obtiene token de Azure AD
    ↓
React app usa token para llamar a tu backend API
```

---

## Workflows de GitHub Actions

Veo que tienes **DOS workflows**:

### 1. Workflow Generado por Azure (Existente)
**Archivo:** `.github/workflows/azure-static-web-apps-thankful-ground-083e4cb10.yml`

```yaml
- Nombre del secret: AZURE_STATIC_WEB_APPS_API_TOKEN_THANKFUL_GROUND_083E4CB10
- app_location: "./app"
- output_location: "build"
```

**Problema:** Este workflow fue generado automáticamente por Azure y tiene configuraciones que pueden no coincidir con tu proyecto.

### 2. Workflow Creado por Nosotros (Nuevo)
**Archivo:** `.github/workflows/azure-static-web-apps.yml`

```yaml
- Nombre del secret: AZURE_STATIC_WEB_APPS_API_TOKEN
- app_location: "/app"
- output_location: "dist"
- Variables de entorno inyectadas para producción
```

**Ventaja:** Configurado específicamente para tu proyecto con todas las variables de entorno correctas.

---

## Recomendación: Usar UN SOLO Workflow

Tenemos dos opciones:

### Opción 1: Usar el Workflow de Azure (Actualizado)
- Actualizar el workflow generado por Azure
- Agregar las variables de entorno
- Cambiar `output_location` de `"build"` a `"dist"`
- Cambiar el nombre del secret

### Opción 2: Usar Nuestro Workflow (Recomendado)
- Eliminar el workflow generado por Azure
- Usar el que creamos con todas las configuraciones correctas
- Actualizar el nombre del secret en GitHub

---

## Secrets de GitHub que Necesitas

Basado en el workflow de Azure, el secret debe llamarse:

```
AZURE_STATIC_WEB_APPS_API_TOKEN_THANKFUL_GROUND_083E4CB10
```

**Tu token:**
```
07c5db78047c6dbfd9c638b78c6bdd798d554bd77b206ebcd021b1a45affae2a03-b78a46fa-5338-4d57-b38f-7f54e9f63bf20102706083e4cb10
```

**PERO** si usamos nuestro workflow (Opción 2), el secret debe llamarse:
```
AZURE_STATIC_WEB_APPS_API_TOKEN
```

---

## ¿Qué es la "Aplicación dentro de Agribusiness ERP"?

En Azure Portal, cuando ves:

```
Aplicación administrada en directorio local: Agribusiness ERP - Frontend
```

Esto NO es una aplicación separada. Es simplemente:
- La misma Azure AD App Registration
- Mostrada en el contexto de tu directorio (tenant)
- Es una vista de la misma configuración

**No necesitas crear otra aplicación.**

---

## Configuración Correcta para Azure AD

### Redirect URIs que debes tener (3 SPA URIs):

1. `http://localhost:5173` (Desarrollo local)
2. `https://erp.agribusiness.com.py` (Producción)
3. `https://thankful-ground-083e4cb10.3.azurestaticapps.net` (URL temporal - opcional)

### Front-channel Logout URL:
- `https://erp.agribusiness.com.py`

---

## Azure Static Web App vs Azure AD App - Resumen Visual

```
┌─────────────────────────────────────────────────┐
│  USUARIO                                        │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
        https://erp.agribusiness.com.py
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│  AZURE STATIC WEB APP                           │
│  (thankful-ground-083e4cb10)                    │
│                                                 │
│  - Sirve React App (HTML, JS, CSS)             │
│  - Maneja routing (/login, /dashboard, etc.)   │
│  - NO maneja autenticación                     │
└─────────────────────┬───────────────────────────┘
                      │
                      │ React App cargada
                      ▼
┌─────────────────────────────────────────────────┐
│  REACT APP (Frontend)                           │
│                                                 │
│  - Usa MSAL library                            │
│  - Necesita Client ID de Azure AD              │
│  - Redirige a Microsoft para login             │
└─────────────────────┬───────────────────────────┘
                      │
                      │ Solicita autenticación
                      ▼
┌─────────────────────────────────────────────────┐
│  AZURE AD APP REGISTRATION                      │
│  (Agribusiness ERP - Frontend)                  │
│                                                 │
│  Client ID: 185a1a46-e8fe-4dc9-97b0-22629f47f8be│
│  Tenant ID: ddf2df3e-9f06-4201-a06c-b71c69f64818│
│                                                 │
│  - Maneja autenticación con Microsoft          │
│  - Valida Redirect URIs                        │
│  - Genera tokens de acceso                     │
└─────────────────────┬───────────────────────────┘
                      │
                      │ Devuelve token
                      ▼
┌─────────────────────────────────────────────────┐
│  REACT APP (con token)                          │
│                                                 │
│  - Usa token para llamar al backend            │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
        https://api.agribusiness.com.py/api
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│  BACKEND API (Por desplegar)                    │
│  (Azure App Service)                            │
│                                                 │
│  - Valida token de Azure AD                    │
│  - Procesa requests                            │
│  - Conecta con base de datos                   │
└─────────────────────────────────────────────────┘
```

---

## Resumen de IDs Importantes

| Componente | ID/Nombre | Propósito |
|------------|-----------|-----------|
| **Azure AD App** | 185a1a46-e8fe-4dc9-97b0-22629f47f8be | Client ID para autenticación |
| **Azure AD App** | 79373bee-2b46-49ba-92bf-93aa769d7b99 | Object ID (no se usa en código) |
| **Azure AD Tenant** | ddf2df3e-9f06-4201-a06c-b71c69f64818 | Tenant ID para autenticación |
| **Static Web App** | thankful-ground-083e4cb10 | Nombre del recurso en Azure |
| **Tenant de BD** | f055e681-6d0b-451c-beb9-155c316d3a75 | Tenant ID de tu estancia (Los Alamos) |

**IMPORTANTE:**
- Azure AD Tenant ID ≠ Tenant ID de BD
- Azure AD Tenant ID: Para autenticación con Microsoft
- Tenant ID de BD: Para multi-tenancy en tu aplicación (separar datos por estancia)

---

## Próximos Pasos

### 1. Decidir qué Workflow usar
- [ ] Usar workflow de Azure (actualizar)
- [ ] Usar nuestro workflow (eliminar el de Azure)

### 2. Configurar GitHub Secret con el nombre correcto
- [ ] Si usas workflow de Azure: `AZURE_STATIC_WEB_APPS_API_TOKEN_THANKFUL_GROUND_083E4CB10`
- [ ] Si usas nuestro workflow: `AZURE_STATIC_WEB_APPS_API_TOKEN`

### 3. Agregar los otros secrets
- [ ] `VITE_API_URL_PROD`
- [ ] `VITE_TENANT_ID`
- [ ] `VITE_AZURE_CLIENT_ID`
- [ ] `VITE_AZURE_TENANT_ID`

### 4. Verificar Redirect URIs en Azure AD
- [ ] Confirmar que los 3 URIs están configurados

---

## Preguntas Frecuentes

### P: ¿Debo crear otra aplicación en Azure AD?
**R:** NO. Ya tienes "Agribusiness ERP - Frontend" que es suficiente.

### P: ¿El Azure Static Web App necesita su propia App Registration?
**R:** NO. El Static Web App es solo hosting. Usa la App Registration de Azure AD para autenticación.

### P: ¿Por qué hay dos workflows de GitHub Actions?
**R:** Azure generó uno automáticamente cuando creaste el Static Web App. Nosotros creamos otro con mejor configuración. Debemos usar solo uno.

### P: ¿Qué pasa con los Redirect URIs?
**R:** Deben apuntar a donde se ejecuta tu frontend:
- `http://localhost:5173` para desarrollo
- `https://erp.agribusiness.com.py` para producción

---

**Última Actualización:** 18 de Diciembre 2025
