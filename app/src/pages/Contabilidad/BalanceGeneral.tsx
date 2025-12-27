import { useState, useEffect } from 'react';
import contabilidadService from '../../services/contabilidad.service';
import type { BalanceGeneral as BalanceGeneralType } from '../../types/contabilidad';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Printer, Download, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const BalanceGeneral = () => {
  const [balance, setBalance] = useState<BalanceGeneralType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fechaHasta, setFechaHasta] = useState(new Date().toISOString().split('T')[0]);
  const [nivelFilter, setNivelFilter] = useState<number>(4);

  useEffect(() => {
    loadBalance();
  }, [fechaHasta, nivelFilter]);

  const loadBalance = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        fechaHasta: new Date(fechaHasta).toISOString(),
        nivel: nivelFilter,
      };

      const data = await contabilidadService.reportes.getBalance(params);
      setBalance(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar el balance');
      console.error('Error loading balance:', err);
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

  const handleExport = () => {
    alert('Exportar a Excel - Próximamente');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="text-center py-8 text-muted-foreground">Generando Balance General...</div>
      </div>
    );
  }

  if (error || !balance) {
    return (
      <div className="p-8 space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            {error || 'No se pudo cargar el balance'}
          </AlertDescription>
        </Alert>
        <Button onClick={loadBalance}>Reintentar</Button>
      </div>
    );
  }

  const isBalanced = Math.abs(balance.totalActivos - (balance.totalPasivos + balance.totalPatrimonio)) < 0.01;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Balance General</h1>
          <p className="text-muted-foreground mt-1">Al {formatDate(balance.fecha.toString())}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button onClick={loadBalance}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="no-print">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaHasta">Fecha hasta</Label>
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
                  <SelectItem value="1">Nivel 1 - Solo totales</SelectItem>
                  <SelectItem value="2">Nivel 2</SelectItem>
                  <SelectItem value="3">Nivel 3</SelectItem>
                  <SelectItem value="4">Nivel 4 - Detallado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-2">Total Activos</div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(balance.totalActivos)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-2">Total Pasivos + Patrimonio</div>
            <div className="text-2xl font-bold">{formatCurrency(balance.totalPasivos + balance.totalPatrimonio)}</div>
          </CardContent>
        </Card>
        <Card className={isBalanced ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              {isBalanced ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <div className="text-sm text-muted-foreground">Diferencia</div>
            </div>
            <div className="text-2xl font-bold mb-2">
              {formatCurrency(balance.totalActivos - (balance.totalPasivos + balance.totalPatrimonio))}
            </div>
            <Badge variant={isBalanced ? 'active' : 'inactive'}>
              {isBalanced ? 'Balanceado' : 'No balanceado'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main Balance Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ACTIVOS */}
        <Card>
          <div className="p-4 border-b bg-muted/50">
            <h2 className="text-xl font-bold">ACTIVOS</h2>
          </div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 text-sm font-semibold">Código</th>
                    <th className="text-left p-3 text-sm font-semibold">Cuenta</th>
                    <th className="text-right p-3 text-sm font-semibold">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {balance.activos.map((cuenta) => (
                    <tr key={cuenta.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 text-sm font-mono text-blue-600">{cuenta.codigo}</td>
                      <td className="p-3">{cuenta.nombre}</td>
                      <td className="p-3 text-right">{formatCurrency(cuenta.saldo)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-900 text-white font-bold">
                  <tr>
                    <td colSpan={2} className="p-4">TOTAL ACTIVOS</td>
                    <td className="p-4 text-right">{formatCurrency(balance.totalActivos)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* PASIVOS Y PATRIMONIO */}
        <Card>
          <div className="p-4 border-b bg-muted/50">
            <h2 className="text-xl font-bold">PASIVOS Y PATRIMONIO</h2>
          </div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 text-sm font-semibold">Código</th>
                    <th className="text-left p-3 text-sm font-semibold">Cuenta</th>
                    <th className="text-right p-3 text-sm font-semibold">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {/* PASIVOS */}
                  <tr className="bg-amber-50 dark:bg-amber-950">
                    <td colSpan={3} className="p-3 font-bold">PASIVOS</td>
                  </tr>
                  {balance.pasivos.map((cuenta) => (
                    <tr key={cuenta.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 text-sm font-mono text-blue-600">{cuenta.codigo}</td>
                      <td className="p-3">{cuenta.nombre}</td>
                      <td className="p-3 text-right">{formatCurrency(cuenta.saldo)}</td>
                    </tr>
                  ))}
                  <tr className="bg-muted font-semibold">
                    <td colSpan={2} className="p-3">Total Pasivos</td>
                    <td className="p-3 text-right">{formatCurrency(balance.totalPasivos)}</td>
                  </tr>

                  {/* PATRIMONIO */}
                  <tr className="bg-emerald-50 dark:bg-emerald-950">
                    <td colSpan={3} className="p-3 font-bold">PATRIMONIO</td>
                  </tr>
                  {balance.patrimonio.map((cuenta) => (
                    <tr key={cuenta.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 text-sm font-mono text-blue-600">{cuenta.codigo}</td>
                      <td className="p-3">{cuenta.nombre}</td>
                      <td className="p-3 text-right">{formatCurrency(cuenta.saldo)}</td>
                    </tr>
                  ))}
                  <tr className="bg-muted font-semibold">
                    <td colSpan={2} className="p-3">Total Patrimonio</td>
                    <td className="p-3 text-right">{formatCurrency(balance.totalPatrimonio)}</td>
                  </tr>
                </tbody>
                <tfoot className="bg-gray-900 text-white font-bold">
                  <tr>
                    <td colSpan={2} className="p-4">TOTAL PASIVOS + PATRIMONIO</td>
                    <td className="p-4 text-right">{formatCurrency(balance.totalPasivos + balance.totalPatrimonio)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Footer */}
      <div className="print-only text-center py-8 text-muted-foreground text-sm">
        <p className="mb-1">Generado el {new Date().toLocaleString('es-PY')}</p>
        <p>Sistema de Contabilidad - Agribusiness ERP</p>
      </div>
    </div>
  );
};

export default BalanceGeneral;
