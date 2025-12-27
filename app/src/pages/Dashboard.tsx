import { useMsal } from '@azure/msal-react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Package, DollarSign, Users, Building2, PartyPopper, CheckCircle } from 'lucide-react';

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
        <div className="p-8 space-y-6">
            {isFirstLogin && (
                <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-950 dark:to-emerald-950 dark:border-green-800">
                    <PartyPopper className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <AlertTitle className="text-xl font-bold text-green-900 dark:text-green-100">
                        ¡Bienvenido por primera vez, {account?.name?.split(' ')[0] || 'Usuario'}!
                    </AlertTitle>
                    <AlertDescription className="mt-3 space-y-4">
                        <p className="text-green-800 dark:text-green-200">
                            Gracias por unirte a Agribusiness ERP. Estamos emocionados de ayudarte a gestionar tu establecimiento agropecuario.
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                <CheckCircle className="h-4 w-4" />
                                <span>Acceso autenticado con Microsoft</span>
                            </div>
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                <CheckCircle className="h-4 w-4" />
                                <span>Sistema multi-tenant configurado</span>
                            </div>
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                <CheckCircle className="h-4 w-4" />
                                <span>Dashboard personalizado listo</span>
                            </div>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    Bienvenido{account?.name ? `, ${account.name.split(' ')[0]}` : ''}
                </h1>
                <p className="text-muted-foreground">
                    Sistema de gestión empresarial para el sector agropecuario
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Productos en Stock
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">-</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Próximamente
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Ventas del Mes
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">-</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Próximamente
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Clientes Activos
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">-</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Próximamente
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Proveedores
                        </CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">-</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Próximamente
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
