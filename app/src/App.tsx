import { MsalProvider, AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './config/authConfig';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { Inventario } from './pages/Inventario';
import DashboardContable from './pages/Contabilidad/DashboardContable';
import PlanCuentas from './pages/Contabilidad/PlanCuentas';
import AsientosContables from './pages/Contabilidad/AsientosContables';
import BalanceGeneral from './pages/Contabilidad/BalanceGeneral';
import EstadoResultados from './pages/Contabilidad/EstadoResultados';
import LibroMayor from './pages/Contabilidad/LibroMayor';
import './App.css';

// Initialize MSAL
const msalInstance = new PublicClientApplication(msalConfig);

function App() {
    return (
        <MsalProvider instance={msalInstance}>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/app/login" element={
                        <UnauthenticatedTemplate>
                            <Login />
                        </UnauthenticatedTemplate>
                    } />

                    {/* Protected Routes */}
                    <Route path="/app/dashboard" element={
                        <AuthenticatedTemplate>
                            <Dashboard />
                        </AuthenticatedTemplate>
                    } />

                    {/* Inventario Route - Dev mode allows unauthenticated access */}
                    <Route path="/app/inventario" element={<Inventario />} />

                    {/* Contabilidad Routes */}
                    <Route path="/app/contabilidad" element={
                        <AuthenticatedTemplate>
                            <DashboardContable />
                        </AuthenticatedTemplate>
                    } />
                    <Route path="/app/contabilidad/plan-cuentas" element={
                        <AuthenticatedTemplate>
                            <PlanCuentas />
                        </AuthenticatedTemplate>
                    } />
                    <Route path="/app/contabilidad/asientos" element={
                        <AuthenticatedTemplate>
                            <AsientosContables />
                        </AuthenticatedTemplate>
                    } />
                    <Route path="/app/contabilidad/balance" element={
                        <AuthenticatedTemplate>
                            <BalanceGeneral />
                        </AuthenticatedTemplate>
                    } />
                    <Route path="/app/contabilidad/estado-resultados" element={
                        <AuthenticatedTemplate>
                            <EstadoResultados />
                        </AuthenticatedTemplate>
                    } />
                    <Route path="/app/contabilidad/mayor" element={
                        <AuthenticatedTemplate>
                            <LibroMayor />
                        </AuthenticatedTemplate>
                    } />

                    {/* Default route */}
                    <Route path="/app" element={
                        <>
                            <AuthenticatedTemplate>
                                <Navigate to="/app/dashboard" replace />
                            </AuthenticatedTemplate>
                            <UnauthenticatedTemplate>
                                <Navigate to="/app/login" replace />
                            </UnauthenticatedTemplate>
                        </>
                    } />

                    {/* Redirect unknown routes */}
                    <Route path="*" element={<Navigate to="/app" replace />} />
                </Routes>
            </BrowserRouter>
        </MsalProvider>
    );
}

export default App;
