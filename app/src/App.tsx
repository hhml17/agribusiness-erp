import { MsalProvider, AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicClientApplication, EventType } from '@azure/msal-browser';
import { msalConfig } from './config/authConfig';
import { Layout } from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { Inventario } from './pages/Inventario';
import DashboardContable from './pages/Contabilidad/DashboardContable';
import { PlanCuentasPage } from './pages/Contabilidad/PlanCuentasPage';
import AsientosContables from './pages/Contabilidad/AsientosContables';
import BalanceGeneral from './pages/Contabilidad/BalanceGeneral';
import EstadoResultados from './pages/Contabilidad/EstadoResultados';
import LibroMayor from './pages/Contabilidad/LibroMayor';
import { ActoresPage } from './pages/Actores/ActoresPage';
import { ActorFormPage } from './pages/Actores/ActorFormPage';
import ProfilePage from './pages/Profile/ProfilePage';
import { CentrosCostoPage } from './pages/Empresa/CentrosCostoPage';
import { ProductosPage } from './pages/Productos/ProductosPage';
import { OrdenCompraPage } from './pages/Compras/OrdenCompraPage';
import { OrdenCompraForm } from './pages/Compras/OrdenCompraForm';
import './App.css';

// Check if dev mode is enabled
const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';

// Initialize MSAL
const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL and handle redirect - CRITICAL for authentication flow
msalInstance.initialize().then(() => {
    // Handle the redirect promise from Azure AD
    msalInstance.handleRedirectPromise()
        .then((response) => {
            if (response) {
                console.log('Authentication successful:', response);
                msalInstance.setActiveAccount(response.account);
            } else {
                // Check if there's an already authenticated account
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

                    {/* Productos */}
                    <Route path="/productos" element={
                        isDevMode ? <Layout><ProductosPage /></Layout> : (
                            <AuthenticatedTemplate>
                                <Layout><ProductosPage /></Layout>
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
                    <Route path="/actores/nuevo" element={
                        isDevMode ? <Layout><ActorFormPage /></Layout> : (
                            <AuthenticatedTemplate>
                                <Layout><ActorFormPage /></Layout>
                            </AuthenticatedTemplate>
                        )
                    } />
                    <Route path="/actores/:id/editar" element={
                        isDevMode ? <Layout><ActorFormPage /></Layout> : (
                            <AuthenticatedTemplate>
                                <Layout><ActorFormPage /></Layout>
                            </AuthenticatedTemplate>
                        )
                    } />
                    <Route path="/actores/:id" element={
                        isDevMode ? <Layout><ActorFormPage /></Layout> : (
                            <AuthenticatedTemplate>
                                <Layout><ActorFormPage /></Layout>
                            </AuthenticatedTemplate>
                        )
                    } />

                    {/* Profile */}
                    <Route path="/profile" element={
                        isDevMode ? <Layout><ProfilePage /></Layout> : (
                            <AuthenticatedTemplate>
                                <Layout><ProfilePage /></Layout>
                            </AuthenticatedTemplate>
                        )
                    } />

                    {/* Empresa */}
                    <Route path="/empresa/centros-costo" element={
                        isDevMode ? <Layout><CentrosCostoPage /></Layout> : (
                            <AuthenticatedTemplate>
                                <Layout><CentrosCostoPage /></Layout>
                            </AuthenticatedTemplate>
                        )
                    } />

                    {/* Compras */}
                    <Route path="/compras/ordenes" element={
                        isDevMode ? <Layout><OrdenCompraPage /></Layout> : (
                            <AuthenticatedTemplate>
                                <Layout><OrdenCompraPage /></Layout>
                            </AuthenticatedTemplate>
                        )
                    } />
                    <Route path="/compras/ordenes/nueva" element={
                        isDevMode ? <Layout><OrdenCompraForm /></Layout> : (
                            <AuthenticatedTemplate>
                                <Layout><OrdenCompraForm /></Layout>
                            </AuthenticatedTemplate>
                        )
                    } />
                    <Route path="/compras/ordenes/:id/editar" element={
                        isDevMode ? <Layout><OrdenCompraForm /></Layout> : (
                            <AuthenticatedTemplate>
                                <Layout><OrdenCompraForm /></Layout>
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
                        isDevMode ? <Layout><PlanCuentasPage /></Layout> : (
                            <AuthenticatedTemplate>
                                <Layout><PlanCuentasPage /></Layout>
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
                    <Route path="/app" element={
                        isDevMode ? (
                            <Navigate to="/dashboard" replace />
                        ) : (
                            <>
                                <AuthenticatedTemplate>
                                    <Navigate to="/dashboard" replace />
                                </AuthenticatedTemplate>
                                <UnauthenticatedTemplate>
                                    <Navigate to="/login" replace />
                                </UnauthenticatedTemplate>
                            </>
                        )
                    } />
                    <Route path="/" element={
                        isDevMode ? (
                            <Navigate to="/dashboard" replace />
                        ) : (
                            <>
                                <AuthenticatedTemplate>
                                    <Navigate to="/dashboard" replace />
                                </AuthenticatedTemplate>
                                <UnauthenticatedTemplate>
                                    <Navigate to="/login" replace />
                                </UnauthenticatedTemplate>
                            </>
                        )
                    } />

                    {/* Redirect unknown routes */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </MsalProvider>
    );
}

export default App;
