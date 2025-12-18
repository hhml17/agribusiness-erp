# ✅ Checklist de Configuración Manual

**Fecha:** 18 de Diciembre 2025

Este checklist te guía paso a paso para configurar todo manualmente después de actualizar el código.

---

## 1. Obtener Token de Azure Static Web Apps

### Pasos:
1. Ve al Azure Portal: https://portal.azure.com
2. Busca tu Static Web App: **"thankful-ground-083e4cb10"**
3. En el menú izquierdo, selecciona **"Overview"**
4. Haz clic en **"Manage deployment token"**
5. Copia el token completo

### Resultado:
- [ ] Token copiado en el portapapeles

---

## 2. Configurar GitHub Secrets

### Ir a GitHub:
1. Abre: https://github.com/hhml17/agribusiness-erp
2. Ve a: **Settings > Secrets and variables > Actions**
3. Haz clic en **"New repository secret"**

### Secrets a Agregar:

#### Secret 1: Token de Azure Static Web Apps
- [ ] Nombre: `AZURE_STATIC_WEB_APPS_API_TOKEN`
- [ ] Valor: [El token que copiaste en el paso 1]

#### Secret 2: URL del API en producción
- [ ] Nombre: `VITE_API_URL_PROD`
- [ ] Valor: `https://api.agribusiness.com.py/api`
- [ ] Nota: Este será el URL del backend cuando lo despliegues.

#### Secret 3: Tenant ID
- [ ] Nombre: `VITE_TENANT_ID`
- [ ] Valor: `f055e681-6d0b-451c-beb9-155c316d3a75`

#### Secret 4: Azure Client ID
- [ ] Nombre: `VITE_AZURE_CLIENT_ID`
- [ ] Valor: `185a1a46-e8fe-4dc9-97b0-22629f47f8be`

#### Secret 5: Azure Tenant ID
- [ ] Nombre: `VITE_AZURE_TENANT_ID`
- [ ] Valor: `ddf2df3e-9f06-4201-a06c-b71c69f64818`

---

## 3. Configurar Azure AD (Microsoft Entra)

### Ir a Azure AD:
1. Ve al Azure Portal: https://portal.azure.com
2. Busca: **"Microsoft Entra ID"** (o "Azure Active Directory")
3. En el menú izquierdo, selecciona **"App registrations"**
4. Busca tu aplicación: Client ID `185a1a46-e8fe-4dc9-97b0-22629f47f8be`

### Configurar Authentication:
5. En el menú izquierdo, selecciona **"Authentication"**
6. En la sección **"Single-page application"**, haz clic en **"Add a platform"** (si no existe) o **"Add URI"**

### Redirect URIs a Agregar:
- [ ] `http://localhost:5173`
- [ ] `https://thankful-ground-083e4cb10.3.azurestaticapps.net`
- [ ] `https://erp.agribusiness.com.py`

### Logout URLs:
7. En la sección **"Front-channel logout URL"**, agrega:
- [ ] `https://erp.agribusiness.com.py`

### Guardar:
- [ ] Haz clic en **"Save"** al final de la página

---

## 4. Push del Código a GitHub

### Verificar cambios:
```bash
cd /Users/hansharder/Documents/GitHub/agribusiness-erp
git status
```

### Agregar y commit:
```bash
git add .
git commit -m "feat: Configure Azure Static Web App and update environment variables"
```

### Push a GitHub:
```bash
git push origin main
```

### Resultado:
- [ ] Código pusheado a GitHub
- [ ] Workflow de GitHub Actions se ejecuta automáticamente

---

## 5. Verificar Despliegue en GitHub Actions

### Ir a GitHub Actions:
1. Abre: https://github.com/hhml17/agribusiness-erp/actions
2. Verifica que el workflow **"Azure Static Web Apps CI/CD"** esté corriendo
3. Espera a que termine (puede tomar 2-5 minutos)

### Resultado:
- [ ] Workflow completado con éxito (✓ verde)
- [ ] Si hay errores (❌ rojo), revisa los logs

---

## 6. Verificar la App Desplegada

### Abrir la URL temporal:
1. Abre: https://thankful-ground-083e4cb10.3.azurestaticapps.net
2. Debe mostrar la página de login de tu aplicación

### Probar Login:
3. Haz clic en **"Login"**
4. Debe redirigir a Microsoft login
5. Ingresa con: `hans@agribusiness.com.py`
6. Después del login, debe redirigir de vuelta a tu app

### Resultado:
- [ ] Página de login se muestra correctamente
- [ ] Login con Microsoft funciona
- [ ] Redirección después del login funciona

---

## 7. Configurar Dominio Personalizado (Opcional - cuando esté listo)

### Cuando `erp.agribusiness.com.py` esté configurado en tu DNS:

1. Ve al Azure Portal
2. Busca tu Static Web App: **"thankful-ground-083e4cb10"**
3. En el menú izquierdo, selecciona **"Custom domains"**
4. Haz clic en **"Add"**
5. Ingresa: `erp.agribusiness.com.py`
6. Sigue las instrucciones para agregar el registro DNS

### Registro DNS (en tu proveedor de dominio):
- [ ] Tipo: `CNAME`
- [ ] Nombre: `erp`
- [ ] Valor: `thankful-ground-083e4cb10.3.azurestaticapps.net`
- [ ] TTL: `3600` (o el que prefieras)

### Esperar validación:
- [ ] Espera a que Azure valide el dominio (puede tomar hasta 48 horas)
- [ ] Cuando esté validado, aparecerá como "Valid" en Azure

---

## 8. Actualizar Azure AD con el Dominio Final

### Cuando el dominio esté validado:
1. Ve a Azure AD > App registrations
2. Busca tu app: `185a1a46-e8fe-4dc9-97b0-22629f47f8be`
3. Ve a **"Authentication"**
4. Verifica que `https://erp.agribusiness.com.py` esté en los Redirect URIs

### Resultado:
- [ ] Dominio personalizado funcionando
- [ ] Login funciona con el dominio personalizado

---

## 9. Próximos Pasos (Después de esto)

- [ ] Desplegar el backend (API) a Azure App Service
- [ ] Actualizar `VITE_API_URL_PROD` con la URL real del backend
- [ ] Probar la integración completa Frontend ↔ Backend
- [ ] Configurar la base de datos en Azure SQL
- [ ] Ejecutar migraciones de Prisma en Azure

---

## Troubleshooting

### Si el workflow de GitHub Actions falla:
1. Ve a: https://github.com/hhml17/agribusiness-erp/actions
2. Haz clic en el workflow fallido
3. Revisa los logs para ver el error específico
4. Errores comunes:
   - Token de Azure Static Web Apps incorrecto
   - Secrets no configurados
   - Error en la build (revisa los logs de npm)

### Si el login no funciona:
1. Verifica los Redirect URIs en Azure AD
2. Abre la consola del navegador (F12) y busca errores
3. Verifica que `VITE_AZURE_CLIENT_ID` sea correcto

### Si no puedes conectar con el backend:
1. Por ahora es normal (el backend no está desplegado aún)
2. Cuando despliegues el backend, actualiza `VITE_API_URL_PROD`

---

## Resumen

Al completar este checklist, tendrás:
- ✅ Azure Static Web App configurada
- ✅ GitHub Actions configurado para CI/CD automático
- ✅ Autenticación con Microsoft Entra funcionando
- ✅ Frontend desplegado en Azure
- ✅ Dominio personalizado (opcional)

**Siguiente paso:** Desplegar el backend (API) a Azure App Service
