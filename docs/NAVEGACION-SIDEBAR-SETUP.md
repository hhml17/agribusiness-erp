# CONFIGURACIÓN DE NAVEGACIÓN CON SIDEBAR

## ✅ COMPONENTES CREADOS

Se han creado los siguientes archivos:

1. **[app/src/components/Layout.tsx](../app/src/components/Layout.tsx:1)** - Componente de layout con sidebar organizado
2. **[app/src/styles/Layout.css](../app/src/styles/Layout.css:1)** - Estilos del layout y sidebar

---

## 📋 ESTRUCTURA DE NAVEGACIÓN

El sidebar está organizado en los siguientes módulos con sus respectivas páginas:

### 🏠 Principal
- Dashboard

### 👥 Actores
- **Actores** (`/actores`) - ✅ Implementado
- Clientes (`/clientes`) - Pendiente
- Proveedores (`/proveedores`) - Pendiente

### 🛒 Compras
- Órdenes de Compra (`/compras/ordenes`)
- Facturas de Compra (`/compras/facturas`)
- Órdenes de Pago (`/compras/pagos`)
- Recibos (`/compras/recibos`)
- Proformas (`/compras/proformas`)

### 💰 Ventas
- Facturación (`/ventas/facturacion`)
- **Talonarios** (`/talonarios`) - Backend implementado
- **Facturas Emitidas** (`/facturas-emitidas`) - Backend implementado
- Ventas (`/ventas`)

### 💼 Contabilidad
- Dashboard (`/contabilidad`) - ✅ Implementado
- Plan de Cuentas (`/contabilidad/plan-cuentas`) - ✅ Implementado
- Asientos Contables (`/contabilidad/asientos`) - ✅ Implementado
- Libro Mayor (`/contabilidad/mayor`) - ✅ Implementado
- Balance General (`/contabilidad/balance`) - ✅ Implementado
- Estado de Resultados (`/contabilidad/estado-resultados`) - ✅ Implementado

### 🏦 Bancos
- Cuentas Bancarias (`/bancos/cuentas`)
- Movimientos (`/bancos/movimientos`)
- Conciliaciones (`/bancos/conciliaciones`)
- Chequeras (`/bancos/chequeras`)

### 🏢 Empresa
- **Estancias** (`/estancias`) - Backend implementado
- Centros de Costo (`/centros-costo`)

### 📦 Inventario
- Productos (`/inventario`) - ✅ Implementado

### 📈 Reportes
- Reportes (`/reportes`)
- Benchmarking (`/benchmarking`)

---

## 🔧 ACTUALIZAR App.tsx

Reemplaza el contenido de `app/src/App.tsx` con:

```typescript
import { MsalProvider, AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicClientApplication, EventType } from '@azure/msal-browser';
import { msalConfig } from './config/authConfig';
import { Layout } from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { Inventario } from './pages/Inventario';
import DashboardContable from './pages/Contabilidad/DashboardContable';
import PlanCuentas from './pages/Contabilidad/PlanCuentas';
import AsientosContables from './pages/Contabilidad/AsientosContables';
import BalanceGeneral from './pages/Contabilidad/BalanceGeneral';
import EstadoResultados from './pages/Contabilidad/EstadoResultados';
import LibroMayor from './pages/Contabilidad/LibroMayor';
import { ActoresPage } from './pages/Actores/ActoresPage';
import './App.css';

// Check if dev mode is enabled
const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';

// Initialize MSAL
const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL and handle redirect
msalInstance.initialize().then(() => {
    msalInstance.handleRedirectPromise()
        .then((response) => {
            if (response) {
                console.log('Authentication successful:', response);
                msalInstance.setActiveAccount(response.account);
            } else {
                const accounts = msalInstance.getAllAccounts();
                if (accounts.length > 0) {
                    msalInstance.setActiveAccount(accounts[0]);
                }
            }
        })
        .catch((error) => {
            console.error('Error handling redirect:', error);
        });
});

// Event callback for login success
msalInstance.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
        const payload = event.payload as any;
        const account = payload.account;
        msalInstance.setActiveAccount(account);
        console.log('Login success event:', account);
    }
});

function App() {
    return (
        <MsalProvider instance={msalInstance}>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/app/login" element={<Login />} />
                    <Route path="/login" element={<Login />} />

                    {/* Protected Routes with Layout */}
                    <Route path="/dashboard" element={
                        isDevMode ? <Layout><Dashboard /></Layout> : (
                            <AuthenticatedTemplate>
                                <Layout><Dashboard /></Layout>
                            </AuthenticatedTemplate>
                        )
                    } />

                    {/* Inventario */}
                    <Route path="/inventario" element={
                        isDevMode ? <Layout><Inventario /></Layout> : (
                            <AuthenticatedTemplate>
                                <Layout><Inventario /></Layout>
                            </AuthenticatedTemplate>
                        )
                    } />

                    {/* Actores */}
                    <Route path="/actores" element={
                        isDevMode ? <Layout><ActoresPage /></Layout> : (
                            <AuthenticatedTemplate>
                                <Layout><ActoresPage /></Layout>
                            </AuthenticatedTemplate>
                        )
                    } />

                    {/* Contabilidad */}
                    <Route path="/contabilidad" element={
                        isDevMode ? <Layout><DashboardContable /></Layout> : (
                            <AuthenticatedTemplate>
                                <Layout><DashboardContable /></Layout>
                            </AuthenticatedTemplate>
                        )
                    } />
                    <Route path="/contabilidad/plan-cuentas" element={
                        isDevMode ? <Layout><PlanCuentas /></Layout> : (
                            <AuthenticatedTemplate>
                                <Layout><PlanCuentas /></Layout>
                            </AuthenticatedTemplate>
                        )
                    } />
                    <Route path="/contabilidad/asientos" element={
                        isDevMode ? <Layout><AsientosContables /></Layout> : (
                            <AuthenticatedTemplate>
                                <Layout><AsientosContables /></Layout>
                            </AuthenticatedTemplate>
                        )
                    } />
                    <Route path="/contabilidad/balance" element={
                        isDevMode ? <Layout><BalanceGeneral /></Layout> : (
                            <AuthenticatedTemplate>
                                <Layout><BalanceGeneral /></Layout>
                            </AuthenticatedTemplate>
                        )
                    } />
                    <Route path="/contabilidad/estado-resultados" element={
                        isDevMode ? <Layout><EstadoResultados /></Layout> : (
                            <AuthenticatedTemplate>
                                <Layout><EstadoResultados /></Layout>
                            </AuthenticatedTemplate>
                        )
                    } />
                    <Route path="/contabilidad/mayor" element={
                        isDevMode ? <Layout><LibroMayor /></Layout> : (
                            <AuthenticatedTemplate>
                                <Layout><LibroMayor /></Layout>
                            </AuthenticatedTemplate>
                        )
                    } />

                    {/* Default routes */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/app" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </MsalProvider>
    );
}

export default App;
```

---

## 📝 ACTUALIZAR Dashboard.tsx

Elimina el sidebar del Dashboard.tsx ya que ahora se usa el Layout. Reemplaza con:

```typescript
import { useMsal } from '@azure/msal-react';
import { useState, useEffect } from 'react';
import '../styles/Dashboard.css';

export default function Dashboard() {
    const { accounts } = useMsal();
    const [isFirstLogin, setIsFirstLogin] = useState(false);

    const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';
    const devAccount = isDevMode && accounts.length === 0 ? {
        name: 'Usuario Demo',
        username: import.meta.env.VITE_DEV_USER_EMAIL || 'demo@agribusiness.com.py'
    } : null;

    useEffect(() => {
        const hasLoggedInBefore = localStorage.getItem('hasLoggedInBefore');
        if (!hasLoggedInBefore) {
            setIsFirstLogin(true);
            localStorage.setItem('hasLoggedInBefore', 'true');

            setTimeout(() => {
                setIsFirstLogin(false);
            }, 10000);
        }
    }, []);

    const account = accounts.length > 0 ? accounts[0] : devAccount;

    return (
        <>
            {isFirstLogin && (
                <div className="first-login-welcome">
                    <div className="welcome-icon">🎉</div>
                    <h2>¡Bienvenido por primera vez, {account?.name?.split(' ')[0] || 'Usuario'}!</h2>
                    <p>Gracias por unirte a Agribusiness ERP. Estamos emocionados de ayudarte a gestionar tu establecimiento agropecuario.</p>
                    <div className="welcome-features">
                        <div className="feature-item">
                            <span className="feature-icon">✅</span>
                            <span>Acceso autenticado con Microsoft</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">✅</span>
                            <span>Sistema multi-tenant configurado</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">✅</span>
                            <span>Dashboard personalizado listo</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="welcome-section">
                <h2>Bienvenido{account?.name ? `, ${account.name.split(' ')[0]}` : ''}</h2>
                <p>Sistema de gestión empresarial para el sector agropecuario</p>
            </div>

            {/* Quick Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-content">
                        <div className="stat-value">-</div>
                        <div className="stat-label">Productos en Stock</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                        <div className="stat-value">-</div>
                        <div className="stat-label">Ventas del Mes</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <div className="stat-value">-</div>
                        <div className="stat-label">Clientes Activos</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🏭</div>
                    <div className="stat-content">
                        <div className="stat-value">-</div>
                        <div className="stat-label">Proveedores</div>
                    </div>
                </div>
            </div>
        </>
    );
}
```

---

## 🚀 PROBAR LA NAVEGACIÓN

1. **Iniciar el servidor:**
   ```bash
   cd app
   npm run dev
   ```

2. **Navegar a:**
   ```
   http://localhost:5173/dashboard
   ```

3. **Verificar:**
   - ✅ El sidebar aparece a la izquierda
   - ✅ Los grupos de navegación están organizados
   - ✅ Los grupos se pueden expandir/contraer
   - ✅ Al hacer clic en "Actores" navega correctamente
   - ✅ Las páginas de Contabilidad funcionan
   - ✅ El layout se mantiene en todas las páginas

---

## 🎨 PERSONALIZACIÓN

### Cambiar grupos expandidos por defecto

En `app/src/components/Layout.tsx`, línea 30:

```typescript
const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
  new Set(['Principal', 'Contabilidad', 'Actores']) // Agrega los que quieras expandidos
);
```

### Cambiar colores del sidebar

En `app/src/styles/Layout.css`, modifica las variables CSS:

```css
.nav-item.active {
  background: var(--color-primary-light);
  color: var(--color-white);
  border-left-color: var(--color-primary);
}
```

---

## ✅ CARACTERÍSTICAS IMPLEMENTADAS

- ✅ Sidebar con navegación organizada en módulos
- ✅ Grupos expandibles/colapsables
- ✅ Indicador visual de página activa
- ✅ Layout reutilizable para todas las páginas
- ✅ Selector de tenant en el sidebar
- ✅ Información de usuario en el header
- ✅ Botón de logout
- ✅ Diseño responsive
- ✅ Íconos para cada módulo
- ✅ Transiciones suaves

---

**Actualizado:** Diciembre 26, 2025
