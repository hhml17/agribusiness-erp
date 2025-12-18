import { useMsal } from '@azure/msal-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css';

interface Tenant {
    id: string;
    nombre: string;
    ruc: string;
    role: 'admin' | 'user' | 'viewer';
}

export default function Dashboard() {
    const { instance, accounts } = useMsal();
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [_tenants, setTenants] = useState<Tenant[]>([]);

    useEffect(() => {
        // TODO: Fetch user's tenants from API
        // Por ahora mock data
        setTenants([
            {
                id: '1',
                nombre: 'Estancia Demo',
                ruc: '80012345-6',
                role: 'admin'
            }
        ]);
        setSelectedTenant({
            id: '1',
            nombre: 'Estancia Demo',
            ruc: '80012345-6',
            role: 'admin'
        });
    }, []);

    const handleLogout = () => {
        instance.logoutRedirect();
    };

    const account = accounts[0];

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="dashboard-sidebar">
                <div className="sidebar-header">
                    <div className="app-icon">🌾</div>
                    <h2>Agribusiness ERP</h2>
                </div>

                {/* Tenant Selector */}
                {selectedTenant && (
                    <div className="tenant-selector">
                        <div className="tenant-info">
                            <div className="tenant-name">{selectedTenant.nombre}</div>
                            <div className="tenant-ruc">RUC: {selectedTenant.ruc}</div>
                            <div className="tenant-role">{selectedTenant.role}</div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="sidebar-nav">
                    <Link to="/app/dashboard" className="nav-item active">
                        <span className="nav-icon">📊</span>
                        Dashboard
                    </Link>
                    <Link to="/app/inventario" className="nav-item">
                        <span className="nav-icon">📦</span>
                        Inventario
                    </Link>
                    <Link to="/app/ventas" className="nav-item">
                        <span className="nav-icon">💰</span>
                        Ventas
                    </Link>
                    <Link to="/app/compras" className="nav-item">
                        <span className="nav-icon">🛒</span>
                        Compras
                    </Link>
                    <Link to="/app/clientes" className="nav-item">
                        <span className="nav-icon">👥</span>
                        Clientes
                    </Link>
                    <Link to="/app/proveedores" className="nav-item">
                        <span className="nav-icon">🏭</span>
                        Proveedores
                    </Link>
                    <Link to="/app/reportes" className="nav-item">
                        <span className="nav-icon">📈</span>
                        Reportes
                    </Link>
                    <Link to="/app/benchmarking" className="nav-item">
                        <span className="nav-icon">📉</span>
                        Benchmarking
                    </Link>
                </nav>

                {/* External Links */}
                <div className="sidebar-footer">
                    <a href="/portal" className="nav-item">
                        <span className="nav-icon">📊</span>
                        Portal BI
                    </a>
                    <a href="/" className="nav-item">
                        <span className="nav-icon">🏠</span>
                        Inicio
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                {/* Header */}
                <header className="dashboard-header">
                    <div className="header-left">
                        <h1>Dashboard</h1>
                    </div>
                    <div className="header-right">
                        <div className="user-menu">
                            <div className="user-info">
                                <div className="user-name">{account?.name || account?.username}</div>
                                <div className="user-email">{account?.username}</div>
                            </div>
                            <button onClick={handleLogout} className="btn-logout">
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="dashboard-content">
                    <div className="welcome-section">
                        <h2>Bienvenido al ERP Agribusiness</h2>
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

                    {/* Coming Soon Message */}
                    <div className="coming-soon">
                        <div className="coming-soon-icon">🚧</div>
                        <h3>Módulos en Desarrollo</h3>
                        <p>Los módulos de gestión estarán disponibles próximamente.</p>
                        <p className="text-muted">
                            Mientras tanto, puedes acceder al <a href="/portal">Portal BI</a> para ver tus reportes.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
