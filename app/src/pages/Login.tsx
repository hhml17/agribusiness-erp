import { useMsal } from '@azure/msal-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../config/authConfig';
import '../styles/Login.css';

export default function Login() {
    const { instance, accounts } = useMsal();
    const navigate = useNavigate();

    // Redirect to dashboard if already authenticated
    useEffect(() => {
        if (accounts.length > 0) {
            console.log('Usuario ya autenticado, redirigiendo al dashboard...');
            navigate('/dashboard');
        }
    }, [accounts, navigate]);

    const handleLogin = async () => {
        try {
            await instance.loginRedirect(loginRequest);
        } catch (error) {
            console.error('Error en login:', error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-icon">🌾</div>
                <h1 className="login-title">Agribusiness ERP</h1>
                <p className="login-subtitle">Sistema de Gestión Empresarial Agrícola</p>

                <button onClick={handleLogin} className="btn-login">
                    🔐 Iniciar Sesión con Microsoft
                </button>

                <p className="login-hint">
                    Usa tu cuenta Microsoft 365 o cuenta personal
                </p>

                <div className="login-footer">
                    <a href="https://agribusiness.com.py" className="btn-back">← Volver al inicio</a>
                </div>
            </div>
        </div>
    );
}
