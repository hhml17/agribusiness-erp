import { useState, useEffect } from 'react';
import contabilidadService from '../../services/contabilidad.service';
import type { LibroMayor as LibroMayorType, PlanCuentas } from '../../types/contabilidad';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardFooter } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Printer, RefreshCw, BookOpen } from 'lucide-react';

const LibroMayor = () => {
  const [mayor, setMayor] = useState<LibroMayorType | null>(null);
  const [cuentas, setCuentas] = useState<PlanCuentas[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cuentaId, setCuentaId] = useState('');
  const [fechaDesde, setFechaDesde] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [fechaHasta, setFechaHasta] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadCuentas();
  }, []);

  useEffect(() => {
    if (cuentaId) {
      loadMayor();
    }
  }, [cuentaId, fechaDesde, fechaHasta]);

  const loadCuentas = async () => {
    try {
      const data = await contabilidadService.planCuentas.getAll({
        aceptaMovimiento: true,
        activo: true
      });
      setCuentas(data.cuentas);
    } catch (err: any) {
      console.error('Error loading cuentas:', err);
    }
  };

  const loadMayor = async () => {
    if (!cuentaId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await contabilidadService.reportes.getMayor({
        cuentaId,
        fechaDesde: new Date(fechaDesde).toISOString(),
        fechaHasta: new Date(fechaHasta).toISOString(),
      });
      setMayor(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar el libro mayor');
      console.error('Error loading mayor:', err);
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
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Libro Mayor</h1>
          {mayor && (
            <p className="text-muted-foreground mt-1">
              {mayor.cuenta.codigo} - {mayor.cuenta.nombre}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {mayor && (
            <>
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
              <Button onClick={loadMayor}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualizar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filtros */}
      <Card className="no-print">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="cuenta">Cuenta</Label>
              <Select value={cuentaId} onValueChange={setCuentaId}>
                <SelectTrigger id="cuenta">
                  <SelectValue placeholder="Seleccione una cuenta..." />
                </SelectTrigger>
                <SelectContent>
                  {cuentas.map((cuenta) => (
                    <SelectItem key={cuenta.id} value={cuenta.id}>
                      {cuenta.codigo} - {cuenta.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
          </div>
        </CardContent>
      </Card>

      {/* Estado */}
      {!cuentaId && !loading && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center space-y-4">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Seleccione una cuenta para ver su libro mayor</p>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="text-center py-8 text-muted-foreground">Cargando libro mayor...</div>
      )}

      {error && (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={loadMayor}>Reintentar</Button>
        </div>
      )}

      {/* Reporte */}
      {mayor && !loading && (
        <>
          {/* Info de la cuenta */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Código</div>
                  <div className="font-semibold">{mayor.cuenta.codigo}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Nombre</div>
                  <div className="font-semibold">{mayor.cuenta.nombre}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Tipo</div>
                  <Badge variant="outline">{mayor.cuenta.tipo}</Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Naturaleza</div>
                  <div className="font-semibold">{mayor.cuenta.naturaleza}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Movimientos */}
          <Card>
            {mayor.movimientos.length === 0 ? (
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  No hay movimientos en el período seleccionado
                </div>
              </CardContent>
            ) : (
              <>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-3 font-semibold">Fecha</th>
                          <th className="text-left p-3 font-semibold">Asiento</th>
                          <th className="text-left p-3 font-semibold">Descripción</th>
                          <th className="text-left p-3 font-semibold">Doc. Ref.</th>
                          <th className="text-left p-3 font-semibold">Centro Costo</th>
                          <th className="text-right p-3 font-semibold">Debe</th>
                          <th className="text-right p-3 font-semibold">Haber</th>
                          <th className="text-right p-3 font-semibold">Saldo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mayor.movimientos.map((mov, index) => (
                          <tr key={index} className="border-b hover:bg-muted/50">
                            <td className="p-3 text-sm">{formatDate(mov.fecha)}</td>
                            <td className="p-3 text-sm font-semibold">#{mov.asientoNumero}</td>
                            <td className="p-3">{mov.descripcion}</td>
                            <td className="p-3 text-sm text-muted-foreground">{mov.documentoRef || '-'}</td>
                            <td className="p-3 text-sm">
                              {mov.centroCosto ? (
                                <Badge variant="outline" className="text-xs">
                                  {mov.centroCosto.codigo}
                                </Badge>
                              ) : '-'}
                            </td>
                            <td className="p-3 text-right">
                              {mov.debe > 0 ? formatCurrency(mov.debe) : '-'}
                            </td>
                            <td className="p-3 text-right">
                              {mov.haber > 0 ? formatCurrency(mov.haber) : '-'}
                            </td>
                            <td className="p-3 text-right font-semibold">
                              {formatCurrency(mov.saldo)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-900 text-white font-bold">
                        <tr>
                          <td colSpan={5} className="p-4">TOTALES</td>
                          <td className="p-4 text-right">{formatCurrency(mayor.totales.debe)}</td>
                          <td className="p-4 text-right">{formatCurrency(mayor.totales.haber)}</td>
                          <td className="p-4 text-right">{formatCurrency(mayor.totales.saldoFinal)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </CardContent>

                {/* Resumen */}
                <CardFooter className="flex justify-between items-center py-4">
                  <span className="text-sm text-muted-foreground">
                    {mayor.movimientos.length} movimientos en el período
                  </span>
                  <span className="text-sm">
                    Saldo final: <strong>{formatCurrency(mayor.totales.saldoFinal)}</strong>
                  </span>
                </CardFooter>
              </>
            )}
          </Card>
        </>
      )}

      {/* Print Footer */}
      <div className="print-only text-center py-8 text-muted-foreground text-sm">
        <p className="mb-1">Generado el {new Date().toLocaleString('es-PY')}</p>
        <p>Sistema de Contabilidad - Agribusiness ERP</p>
      </div>
    </div>
  );
};

export default LibroMayor;
