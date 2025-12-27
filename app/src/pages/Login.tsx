import { useMsal } from '@azure/msal-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../config/authConfig';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Lock, ArrowLeft } from 'lucide-react';

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="space-y-4 text-center">
                    <div className="flex justify-center">
                        <div className="text-6xl">🌾</div>
                    </div>
                    <CardTitle className="text-3xl font-bold">Agribusiness ERP</CardTitle>
                    <CardDescription className="text-base">
                        Sistema de Gestión Empresarial Agrícola
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Button
                        onClick={handleLogin}
                        className="w-full gap-2 h-12 text-base"
                        size="lg"
                    >
                        <Lock className="h-5 w-5" />
                        Iniciar Sesión con Microsoft
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                        Usa tu cuenta Microsoft 365 o cuenta personal
                    </p>

                    <div className="pt-4 border-t">
                        <a
                            href="https://agribusiness.com.py"
                            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Volver al inicio
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
