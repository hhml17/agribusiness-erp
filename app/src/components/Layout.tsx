import { useMsal } from '@azure/msal-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Layout.css';

interface Tenant {
  id: string;
  nombre: string;
  ruc: string;
  role: 'admin' | 'user' | 'viewer';
}

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

interface NavGroup {
  label: string;
  icon: string;
  items: NavItem[];
}

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { instance, accounts } = useMsal();
  const location = useLocation();
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Contabilidad', 'Personas', 'Configuración']));

  // Dev mode support
  const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';
  const devAccount = isDevMode && accounts.length === 0 ? {
    name: 'Usuario Demo',
    username: import.meta.env.VITE_DEV_USER_EMAIL || 'demo@agribusiness.com.py'
  } : null;

  useEffect(() => {
    // TODO: Fetch user's tenants from API
    setSelectedTenant({
      id: '1',
      nombre: 'Estancia Demo',
      ruc: '80012345-6',
      role: 'admin'
    });
  }, []);

  const handleLogout = () => {
    if (isDevMode) {
      window.location.href = '/login';
    } else {
      instance.logoutRedirect();
    }
  };

  const toggleGroup = (groupLabel: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupLabel)) {
      newExpanded.delete(groupLabel);
    } else {
      newExpanded.add(groupLabel);
    }
    setExpandedGroups(newExpanded);
  };

  const account = accounts.length > 0 ? accounts[0] : devAccount;

  // Estructura de navegación organizada por módulos
  const navigationGroups: NavGroup[] = [
    {
      label: 'Principal',
      icon: '🏠',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: '📊' },
      ]
    },
    {
      label: 'Personas',
      icon: '👥',
      items: [
        { label: 'Personas', path: '/actores', icon: '🧑‍🤝‍🧑' },
      ]
    },
    {
      label: 'Compras',
      icon: '🛒',
      items: [
        { label: 'Órdenes de Compra', path: '/compras/ordenes', icon: '📝' },
        { label: 'Facturas de Compra', path: '/compras/facturas', icon: '🧾' },
        { label: 'Órdenes de Pago', path: '/compras/pagos', icon: '💳' },
        { label: 'Recibos', path: '/compras/recibos', icon: '🧾' },
        { label: 'Proformas', path: '/compras/proformas', icon: '📄' },
      ]
    },
    {
      label: 'Ventas',
      icon: '💰',
      items: [
        { label: 'Facturación', path: '/ventas/facturacion', icon: '🧾' },
        { label: 'Talonarios', path: '/talonarios', icon: '📔' },
        { label: 'Facturas Emitidas', path: '/facturas-emitidas', icon: '📄' },
        { label: 'Ventas', path: '/ventas', icon: '💵' },
      ]
    },
    {
      label: 'Contabilidad',
      icon: '💼',
      items: [
        { label: 'Dashboard', path: '/contabilidad', icon: '📊' },
        { label: 'Asientos Contables', path: '/contabilidad/asientos', icon: '✍️' },
        { label: 'Libro Mayor', path: '/contabilidad/mayor', icon: '📖' },
        { label: 'Balance General', path: '/contabilidad/balance', icon: '⚖️' },
        { label: 'Estado de Resultados', path: '/contabilidad/estado-resultados', icon: '📈' },
      ]
    },
    {
      label: 'Bancos',
      icon: '🏦',
      items: [
        { label: 'Cuentas Bancarias', path: '/bancos/cuentas', icon: '💳' },
        { label: 'Movimientos', path: '/bancos/movimientos', icon: '💸' },
        { label: 'Conciliaciones', path: '/bancos/conciliaciones', icon: '✅' },
        { label: 'Chequeras', path: '/bancos/chequeras', icon: '📔' },
      ]
    },
    {
      label: 'Configuración',
      icon: '⚙️',
      items: [
        { label: 'Productos', path: '/productos', icon: '📦' },
        { label: 'Centros de Costo', path: '/empresa/centros-costo', icon: '🏗️' },
        { label: 'Plan de Cuentas', path: '/contabilidad/plan-cuentas', icon: '📋' },
        { label: 'Talonarios', path: '/talonarios', icon: '📔' },
      ]
    },
    {
      label: 'Reportes',
      icon: '📈',
      items: [
        { label: 'Reportes', path: '/reportes', icon: '📊' },
        { label: 'Benchmarking', path: '/benchmarking', icon: '📉' },
      ]
    },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

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
          {navigationGroups.map((group) => (
            <div key={group.label} className="nav-group">
              <button
                className="nav-group-header"
                onClick={() => toggleGroup(group.label)}
              >
                <span className="nav-group-icon">{group.icon}</span>
                <span className="nav-group-label">{group.label}</span>
                <span className={`nav-group-arrow ${expandedGroups.has(group.label) ? 'expanded' : ''}`}>
                  ▼
                </span>
              </button>
              {expandedGroups.has(group.label) && (
                <div className="nav-group-items">
                  {group.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`nav-item ${isActivePath(item.path) ? 'active' : ''}`}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* External Links */}
        <div className="sidebar-footer">
          <a href="/portal" className="nav-item">
            <span className="nav-icon">📊</span>
            Portal BI
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1>{location.pathname === '/dashboard' ? 'Dashboard' : ''}</h1>
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
          {children}
        </div>
      </main>
    </div>
  );
}
