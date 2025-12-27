# 🚀 Pasos Rápidos para Deployment

## ⚡ Resumen Ejecutivo

Tu error actual es: **El workflow de GitHub Actions no encuentra package.json en la raíz del proyecto**

**Causa:** GitHub Actions busca en `/home/runner/work/agribusiness/agribusiness/package.json` pero tu proyecto tiene:
- Frontend en: `/app/package.json`
- Backend en: `/api/package.json`

**Solución:** Crear workflows separados para frontend y backend (ya lo hice).

---

## 📋 Checklist Rápido (30 minutos)

### ✅ PASO 1: Limpiar Recursos Duplicados (5 min)

En Azure Portal, eliminar:

1. **agribusiness** (Static Web App VIEJA en Central US)
   - ⚠️ NO elimines **agribusiness-erp** (la nueva)
2. **free-sql-db-9614414** (Base de datos no usada)

### ✅ PASO 2: Configurar App Service (10 min)

**Azure Portal → App Service → agribusiness → Configuration:**

Agregar estas variables:

```bash
DATABASE_URL=sqlserver://agribusiness.database.windows.net:1433;database=agribusiness;user=agribusiness;password=TU_PASSWORD;encrypt=true
AZURE_CLIENT_ID=67a98f45-8f1e-4212-9f0f-112dcd12d628
AZURE_TENANT_ID=TU_TENANT_ID
NODE_ENV=production
PORT=8080
ALLOWED_ORIGINS=https://erp.agribusiness.com.py
```

**Cómo obtener valores:**
- PASSWORD: Resetear en SQL Server si no lo recuerdas
- TENANT_ID: Entra ID → Overview → Tenant ID
- CLIENT_SECRET: Entra ID → App Registration → Certificates & secrets → New client secret

### ✅ PASO 3: Configurar GitHub Secrets (5 min)

**GitHub → Settings → Secrets and variables → Actions → New repository secret:**

1. **AZURE_WEBAPP_PUBLISH_PROFILE**
   - Azure Portal → App Service → agribusiness → Download publish profile
   - Copiar TODO el contenido XML y pegar

2. **VITE_AZURE_TENANT_ID**
   - Valor de Entra ID

**GitHub → Settings → Secrets and variables → Actions → Variables → New repository variable:**

1. **VITE_API_URL**
   ```
   https://agribusiness.azurewebsites.net/api
   ```

### ✅ PASO 4: Deploy (10 min)

```bash
# Hacer commit de los nuevos workflows
git add .
git commit -m "feat: configure Azure deployment workflows"
git push origin main
```

**Monitorear:**
- GitHub: https://github.com/hhml17/agribusiness-erp/actions
- Deberías ver 2 workflows corriendo:
  - ✅ Build and deploy Node.js app to Azure App Service
  - ✅ Azure Static Web Apps CI/CD

### ✅ PASO 5: Verificar (5 min)

```bash
# 1. Verificar backend
curl https://agribusiness.azurewebsites.net/api/health
# Debería retornar: {"status":"ok"}

# 2. Verificar frontend
# Abrir: https://erp.agribusiness.com.py
# Login debería funcionar
```

---

## 🔴 Si Hay Errores

### Error en GitHub Actions Backend:
```
Ver logs en: https://github.com/hhml17/agribusiness-erp/actions
```

Posibles causas:
- Falta AZURE_WEBAPP_PUBLISH_PROFILE → Agregarlo en GitHub Secrets
- Node version incorrecta → Verificar que sea 22.x

### Error 500 en API:
```
Ver logs en: Azure Portal → App Service → Log stream
```

Posibles causas:
- DATABASE_URL incorrecta → Verificar connection string
- Prisma Client no generado → Verificar workflow incluye `prisma:generate`

### Error CORS:
```
Ver en DevTools Console del navegador
```

Posibles causas:
- ALLOWED_ORIGINS no incluye el origin correcto
- Backend no está corriendo

---

## 📊 URLs Importantes

| Recurso | URL |
|---------|-----|
| Frontend Producción | https://erp.agribusiness.com.py |
| Frontend Staging | https://thankful-ground-083e4cb10.3.azurestaticapps.net |
| Backend API | https://agribusiness.azurewebsites.net/api |
| Database Server | agribusiness.database.windows.net |
| GitHub Repo | https://github.com/hhml17/agribusiness-erp |
| GitHub Actions | https://github.com/hhml17/agribusiness-erp/actions |

---

## 🎯 Arquitectura Final

```
erp.agribusiness.com.py (Static Web App - Frontend React)
           ↓
agribusiness.azurewebsites.net (App Service - Backend Node.js)
           ↓
agribusiness.database.windows.net (Azure SQL Database)
```

---

## 📞 Siguiente Paso

**AHORA MISMO:**
1. Abre Azure Portal
2. Ve a App Service → agribusiness → Configuration
3. Agrega las variables de entorno del PASO 2
4. Click "Save"
5. Haz git push del nuevo código
6. Monitorea en GitHub Actions

**¿Ya hiciste el push?**
Revisa: https://github.com/hhml17/agribusiness-erp/actions
