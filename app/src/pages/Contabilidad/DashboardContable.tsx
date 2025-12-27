import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contabilidadService } from '../../services/contabilidad.service';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  BarChart3,
  FileText,
  DollarSign,
  BookOpen,
  Building
} from 'lucide-react';
import type { BalanceGeneral, EstadoResultados, AsientoContable } from '../../types/contabilidad';

const DashboardContable = () => {
  const [balance, setBalance] = useState<BalanceGeneral | null>(null);
  const [estadoResultados, setEstadoResultados] = useState<EstadoResultados | null>(null);
  const [ultimosAsientos, setUltimosAsientos] = useState<AsientoContable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos reales del API
      const [balanceData, estadoData, asientosData] = await Promise.all([
        contabilidadService.reportes.getBalance(),
        contabilidadService.reportes.getEstadoResultados(),
        contabilidadService.asientos.getAll({ estado: 'CONTABILIZADO', limit: 5 })
      ]);

      setBalance(balanceData);
      setEstadoResultados(estadoData);
      setUltimosAsientos(asientosData.asientos || []);
      setLoading(false);

    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar el dashboard');
      console.error('Error loading dashboard:', err);
      setLoading(false);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-PY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="text-center py-8 text-muted-foreground">Cargando dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <Button onClick={loadDashboardData}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Contable</h1>
          <p className="text-muted-foreground mt-1">Resumen de tu situación financiera</p>
        </div>
        <Link to="/contabilidad/asientos/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Asiento
          </Button>
        </Link>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {balance ? formatCurrency(balance.totalActivos) : '-'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pasivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {balance ? formatCurrency(balance.totalPasivos) : '-'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Patrimonio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {balance ? formatCurrency(balance.totalPatrimonio) : '-'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resultado del Ejercicio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold flex items-center gap-2 ${estadoResultados && estadoResultados.utilidadNeta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {estadoResultados && estadoResultados.utilidadNeta >= 0 ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              {estadoResultados ? formatCurrency(estadoResultados.utilidadNeta) : '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estado de Resultados resumido */}
      {estadoResultados && (
        <Card>
          <CardHeader>
            <CardTitle>Estado de Resultados</CardTitle>
            <CardDescription>
              {formatDate(estadoResultados.fechaDesde.toString())} - {formatDate(estadoResultados.fechaHasta.toString())}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Ingresos Totales</span>
              <span className="font-bold text-green-600">
                {formatCurrency(estadoResultados.totalIngresos)}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Gastos Totales</span>
              <span className="font-bold text-red-600">
                ({formatCurrency(estadoResultados.totalGastos)})
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-semibold">Utilidad/Pérdida Neta</span>
              <span className={`font-bold text-lg ${estadoResultados.utilidadNeta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(estadoResultados.utilidadNeta)}
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/contabilidad/estado-resultados" className="text-sm text-primary hover:underline">
              Ver Estado de Resultados completo →
            </Link>
          </CardFooter>
        </Card>
      )}

      {/* Balance resumido */}
      {balance && (
        <Card>
          <CardHeader>
            <CardTitle>Balance General</CardTitle>
            <CardDescription>Al {formatDate(balance.fecha.toString())}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Activos</h3>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(balance.totalActivos)}
                </div>
                <div className="space-y-2">
                  {balance.activos.slice(0, 5).map((cuenta) => (
                    <div key={cuenta.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{cuenta.nombre}</span>
                      <span className="font-medium">{formatCurrency(cuenta.saldo)}</span>
                    </div>
                  ))}
                  {balance.activos.length > 5 && (
                    <div className="text-sm text-muted-foreground">
                      y {balance.activos.length - 5} cuentas más...
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Pasivos y Patrimonio</h3>
                <div className="text-2xl font-bold">
                  {formatCurrency(balance.totalPasivos + balance.totalPatrimonio)}
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Pasivos</h4>
                    <div className="space-y-2">
                      {balance.pasivos.slice(0, 3).map((cuenta) => (
                        <div key={cuenta.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{cuenta.nombre}</span>
                          <span className="font-medium">{formatCurrency(cuenta.saldo)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Patrimonio</h4>
                    <div className="space-y-2">
                      {balance.patrimonio.slice(0, 2).map((cuenta) => (
                        <div key={cuenta.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{cuenta.nombre}</span>
                          <span className="font-medium">{formatCurrency(cuenta.saldo)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/contabilidad/balance" className="text-sm text-primary hover:underline">
              Ver Balance General completo →
            </Link>
          </CardFooter>
        </Card>
      )}

      {/* Últimos asientos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Últimos Asientos</CardTitle>
          <Link to="/contabilidad/asientos">
            <Button variant="ghost" size="sm">
              Ver todos →
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {ultimosAsientos.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-muted-foreground">No hay asientos contables registrados</p>
              <Link to="/contabilidad/asientos/nuevo">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear primer asiento
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Debe</TableHead>
                  <TableHead className="text-right">Haber</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ultimosAsientos.map((asiento) => (
                  <TableRow key={asiento.id}>
                    <TableCell className="font-medium">{asiento.numero}</TableCell>
                    <TableCell>{formatDate(asiento.fecha)}</TableCell>
                    <TableCell>{asiento.descripcion}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {asiento.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {asiento.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(asiento.totalDebe || 0)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(asiento.totalHaber || 0)}</TableCell>
                    <TableCell>
                      <Link to={`/contabilidad/asientos/${asiento.id}`}>
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Accesos rápidos */}
      <Card>
        <CardHeader>
          <CardTitle>Accesos Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link to="/contabilidad/plan-cuentas">
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardContent className="pt-6 flex flex-col items-center text-center space-y-2">
                  <BarChart3 className="h-8 w-8 text-primary" />
                  <div className="font-semibold">Plan de Cuentas</div>
                  <p className="text-sm text-muted-foreground">Gestionar cuentas contables</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/contabilidad/asientos">
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardContent className="pt-6 flex flex-col items-center text-center space-y-2">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="font-semibold">Asientos</div>
                  <p className="text-sm text-muted-foreground">Registrar movimientos</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/contabilidad/balance">
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardContent className="pt-6 flex flex-col items-center text-center space-y-2">
                  <DollarSign className="h-8 w-8 text-primary" />
                  <div className="font-semibold">Balance General</div>
                  <p className="text-sm text-muted-foreground">Ver situación financiera</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/contabilidad/estado-resultados">
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardContent className="pt-6 flex flex-col items-center text-center space-y-2">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <div className="font-semibold">Estado de Resultados</div>
                  <p className="text-sm text-muted-foreground">Ver utilidad/pérdida</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/contabilidad/mayor">
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardContent className="pt-6 flex flex-col items-center text-center space-y-2">
                  <BookOpen className="h-8 w-8 text-primary" />
                  <div className="font-semibold">Libro Mayor</div>
                  <p className="text-sm text-muted-foreground">Consultar movimientos</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/contabilidad/centros-costo">
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardContent className="pt-6 flex flex-col items-center text-center space-y-2">
                  <Building className="h-8 w-8 text-primary" />
                  <div className="font-semibold">Centros de Costo</div>
                  <p className="text-sm text-muted-foreground">Gestionar centros</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardContable;
