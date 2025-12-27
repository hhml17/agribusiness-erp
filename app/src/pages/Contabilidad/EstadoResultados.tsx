import { useState, useEffect } from 'react';
import contabilidadService from '../../services/contabilidad.service';
import type { EstadoResultados as EstadoResultadosType } from '../../types/contabilidad';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Printer, RefreshCw, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const EstadoResultados = () => {
  const [estado, setEstado] = useState<EstadoResultadosType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fechaDesde, setFechaDesde] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [fechaHasta, setFechaHasta] = useState(new Date().toISOString().split('T')[0]);
  const [nivelFilter, setNivelFilter] = useState<number>(4);

  useEffect(() => {
    loadEstadoResultados();
  }, [fechaDesde, fechaHasta, nivelFilter]);

  const loadEstadoResultados = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await contabilidadService.reportes.getEstadoResultados({
        fechaDesde: new Date(fechaDesde).toISOString(),
        fechaHasta: new Date(fechaHasta).toISOString(),
        nivel: nivelFilter,
      });
      setEstado(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar estado de resultados');
      console.error('Error loading estado resultados:', err);
    } finally {
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
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="text-center py-8 text-muted-foreground">Generando Estado de Resultados...</div>
      </div>
    );
  }

  if (error || !estado) {
    return (
      <div className="p-8 space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            {error || 'No se pudo cargar el estado de resultados'}
          </AlertDescription>
        </Alert>
        <Button onClick={loadEstadoResultados}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estado de Resultados</h1>
          <p className="text-muted-foreground mt-1">
            {formatDate(estado.fechaDesde.toString())} - {formatDate(estado.fechaHasta.toString())}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button onClick={loadEstadoResultados}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="no-print">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaDesde">Desde</Label>
              <Input
                id="fechaDesde"
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaHasta">Hasta</Label>
              <Input
                id="fechaHasta"
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nivel">Nivel de detalle</Label>
              <Select value={nivelFilter.toString()} onValueChange={(v) => setNivelFilter(parseInt(v))}>
                <SelectTrigger id="nivel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Nivel 1</SelectItem>
                  <SelectItem value="2">Nivel 2</SelectItem>
                  <SelectItem value="3">Nivel 3</SelectItem>
                  <SelectItem value="4">Nivel 4 - Detallado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Ingresos Totales</div>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(estado.totalIngresos)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Gastos Totales</div>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(estado.totalGastos)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${estado.utilidadNeta >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <DollarSign className={`h-6 w-6 ${estado.utilidadNeta >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{estado.utilidadNeta >= 0 ? 'UTILIDAD' : 'PÉRDIDA'}</div>
                <div className={`text-2xl font-bold ${estado.utilidadNeta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(estado.utilidadNeta)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reporte */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-semibold">Código</th>
                  <th className="text-left p-4 font-semibold">Cuenta</th>
                  <th className="text-right p-4 font-semibold">Debe</th>
                  <th className="text-right p-4 font-semibold">Haber</th>
                  <th className="text-right p-4 font-semibold">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {/* INGRESOS */}
                <tr className="bg-sky-50 dark:bg-sky-950">
                  <td colSpan={5} className="p-4 font-bold">INGRESOS</td>
                </tr>
                {estado.ingresos.map((cuenta) => (
                  <tr key={cuenta.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 text-sm font-mono text-blue-600">{cuenta.codigo}</td>
                    <td className="p-4">{cuenta.nombre}</td>
                    <td className="p-4 text-right">{formatCurrency(cuenta.debe)}</td>
                    <td className="p-4 text-right">{formatCurrency(cuenta.haber)}</td>
                    <td className="p-4 text-right font-semibold">{formatCurrency(cuenta.total)}</td>
                  </tr>
                ))}
                <tr className="bg-muted font-bold">
                  <td colSpan={4} className="p-4">Total Ingresos</td>
                  <td className="p-4 text-right text-green-600">{formatCurrency(estado.totalIngresos)}</td>
                </tr>

                {/* GASTOS */}
                <tr className="bg-amber-50 dark:bg-amber-950">
                  <td colSpan={5} className="p-4 font-bold">GASTOS</td>
                </tr>
                {estado.gastos.map((cuenta) => (
                  <tr key={cuenta.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 text-sm font-mono text-blue-600">{cuenta.codigo}</td>
                    <td className="p-4">{cuenta.nombre}</td>
                    <td className="p-4 text-right">{formatCurrency(cuenta.debe)}</td>
                    <td className="p-4 text-right">{formatCurrency(cuenta.haber)}</td>
                    <td className="p-4 text-right font-semibold">{formatCurrency(cuenta.total)}</td>
                  </tr>
                ))}
                <tr className="bg-muted font-bold">
                  <td colSpan={4} className="p-4">Total Gastos</td>
                  <td className="p-4 text-right text-red-600">{formatCurrency(estado.totalGastos)}</td>
                </tr>

                {/* RESULTADO */}
                <tr className="bg-gray-900 text-white font-bold text-lg">
                  <td colSpan={4} className="p-5">
                    {estado.utilidadNeta >= 0 ? 'UTILIDAD NETA' : 'PÉRDIDA NETA'}
                  </td>
                  <td className="p-5 text-right">
                    {formatCurrency(estado.utilidadNeta)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Print Footer */}
      <div className="print-only text-center py-8 text-muted-foreground text-sm">
        <p className="mb-1">Generado el {new Date().toLocaleString('es-PY')}</p>
        <p>Sistema de Contabilidad - Agribusiness ERP</p>
      </div>
    </div>
  );
};

export default EstadoResultados;
