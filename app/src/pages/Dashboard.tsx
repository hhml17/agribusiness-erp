import { useMsal } from '@azure/msal-react';
import { useState, useEffect } from 'react';

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
