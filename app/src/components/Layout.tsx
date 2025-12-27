import { useMsal } from '@azure/msal-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { ChevronDown, LogOut, BarChart3 } from 'lucide-react';

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
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        {/* App Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🌾</div>
            <h2 className="text-lg font-semibold text-foreground">Agribusiness ERP</h2>
          </div>
        </div>

        {/* Tenant Selector */}
        {selectedTenant && (
          <div className="p-4 border-b border-border bg-muted/50">
            <div className="space-y-1">
              <div className="font-medium text-sm text-foreground">{selectedTenant.nombre}</div>
              <div className="text-xs text-muted-foreground">RUC: {selectedTenant.ruc}</div>
              <div className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-md inline-block">
                {selectedTenant.role}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          {navigationGroups.map((group) => (
            <div key={group.label} className="mb-2">
              <button
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-md transition-colors"
                onClick={() => toggleGroup(group.label)}
              >
                <div className="flex items-center gap-2">
                  <span>{group.icon}</span>
                  <span>{group.label}</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    expandedGroups.has(group.label) ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedGroups.has(group.label) && (
                <div className="ml-2 mt-1 space-y-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                        isActivePath(item.path)
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* External Links */}
        <div className="p-2 border-t border-border">
          <a
            href="/portal"
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground rounded-md transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Portal BI</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-foreground">
              {location.pathname === '/dashboard' ? 'Dashboard' : ''}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">
                  {account?.name || account?.username}
                </div>
                <div className="text-xs text-muted-foreground">{account?.username}</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
