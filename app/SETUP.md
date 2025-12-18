# Setup Frontend de Contabilidad

## Paso 1: Obtener Tenant ID

Primero necesitas obtener el Tenant ID de la base de datos. En el directorio `azure-functions`, ejecuta:

```bash
cd ../azure-functions
npx prisma studio
```

Esto abrirá Prisma Studio en http://localhost:5555

1. Ve a la tabla **Tenant**
2. Copia el **id** del tenant "IN GANADERO CRÍA"
3. Guárdalo para el siguiente paso

## Paso 2: Configurar Variables de Entorno

En el directorio `app`, edita el archivo `.env`:

```bash
cd ../app
```

Edita `.env` y agrega el Tenant ID que copiaste:

```
VITE_API_URL=http://localhost:7071/api
VITE_DEV_TENANT_ID=<PEGA-AQUI-EL-TENANT-ID>
VITE_DEV_USER_EMAIL=hans@agribusiness.com.py
```

## Paso 3: Configurar localStorage (Temporal)

Para desarrollo, necesitas configurar manualmente el tenant y user en localStorage.

Abre el navegador en http://localhost:5173 y ejecuta en la consola:

```javascript
localStorage.setItem('tenantId', 'PEGA-AQUI-EL-TENANT-ID');
localStorage.setItem('userEmail', 'hans@agribusiness.com.py');
```

## Paso 4: Iniciar el Backend

En una terminal, inicia Azure Functions:

```bash
cd ../azure-functions
npm start
```

El backend estará disponible en http://localhost:7071

## Paso 5: Iniciar el Frontend

En otra terminal, inicia Vite:

```bash
cd ../app
npm run dev
```

El frontend estará disponible en http://localhost:5173

## Rutas Disponibles

Una vez configurado, puedes acceder a:

- **Dashboard Contable**: http://localhost:5173/app/contabilidad
- **Plan de Cuentas**: http://localhost:5173/app/contabilidad/plan-cuentas
- **Asientos**: http://localhost:5173/app/contabilidad/asientos (próximamente)
- **Balance**: http://localhost:5173/app/contabilidad/balance (próximamente)
- **Estado de Resultados**: http://localhost:5173/app/contabilidad/estado-resultados (próximamente)
- **Libro Mayor**: http://localhost:5173/app/contabilidad/mayor (próximamente)

## Troubleshooting

### Error: "Unauthorized" o "No tenant ID"

Asegúrate de que:
1. El Tenant ID en `.env` es correcto
2. El localStorage tiene `tenantId` y `userEmail` configurados
3. El backend está corriendo en http://localhost:7071

### Error: CORS

Si ves errores de CORS, asegúrate de que Azure Functions está configurado para permitir requests desde http://localhost:5173

### Error: "Cannot find module"

Ejecuta:
```bash
npm install
```

## Próximos Pasos

1. ✅ Dashboard Contable
2. ✅ Plan de Cuentas
3. 🔜 Asientos Contables (en desarrollo)
4. 🔜 Balance General (en desarrollo)
5. 🔜 Estado de Resultados (en desarrollo)
6. 🔜 Libro Mayor (en desarrollo)
