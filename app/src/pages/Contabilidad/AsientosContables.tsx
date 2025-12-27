import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import contabilidadService from '../../services/contabilidad.service';
import type { AsientoContable, TipoAsiento, EstadoAsiento } from '../../types/contabilidad';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { RefreshCw, Plus, Eye, Check, X, Pencil, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

const AsientosContables = () => {
  const [asientos, setAsientos] = useState<AsientoContable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [tipoFilter, setTipoFilter] = useState<TipoAsiento | ''>('');
  const [estadoFilter, setEstadoFilter] = useState<EstadoAsiento | ''>('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  useEffect(() => {
    loadAsientos();
  }, [currentPage, tipoFilter, estadoFilter, fechaDesde, fechaHasta]);

  const loadAsientos = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        limit: 20,
      };

      if (tipoFilter) params.tipo = tipoFilter;
      if (estadoFilter) params.estado = estadoFilter;
      if (fechaDesde) params.fechaDesde = new Date(fechaDesde).toISOString();
      if (fechaHasta) params.fechaHasta = new Date(fechaHasta).toISOString();

      const data = await contabilidadService.asientos.getAll(params);
      setAsientos(data.asientos);
      setCurrentPage(data.pagination.page);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar asientos');
      console.error('Error loading asientos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContabilizar = async (id: string) => {
    if (!confirm('¿Está seguro de contabilizar este asiento? Esta acción no se puede deshacer fácilmente.')) {
      return;
    }

    try {
      await contabilidadService.asientos.contabilizar(id);
      loadAsientos();
      alert('Asiento contabilizado exitosamente');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al contabilizar asiento');
    }
  };

  const handleAnular = async (id: string) => {
    const motivo = prompt('Ingrese el motivo de anulación:');
    if (!motivo) return;

    try {
      await contabilidadService.asientos.anular(id, motivo);
      loadAsientos();
      alert('Asiento anulado exitosamente');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al anular asiento');
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

  const getEstadoBadgeVariant = (estado: EstadoAsiento) => {
    const variants: Record<EstadoAsiento, any> = {
      BORRADOR: 'draft',
      CONTABILIZADO: 'approved',
      ANULADO: 'cancelled',
    };
    return variants[estado] || 'default';
  };

  const getTipoBadgeVariant = (tipo: TipoAsiento) => {
    return 'outline';
  };

  if (loading && asientos.length === 0) {
    return (
      <div className="p-8 space-y-6">
        <div className="text-center py-8 text-muted-foreground">Cargando asientos...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Asientos Contables</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAsientos} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Cargando...' : 'Actualizar'}
          </Button>
          <Link to="/app/contabilidad/asientos/nuevo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Asiento
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={() => setError(null)}>
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={tipoFilter}
                onValueChange={(v) => {
                  setTipoFilter(v as TipoAsiento | '');
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="DIARIO">DIARIO</SelectItem>
                  <SelectItem value="AJUSTE">AJUSTE</SelectItem>
                  <SelectItem value="CIERRE">CIERRE</SelectItem>
                  <SelectItem value="APERTURA">APERTURA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={estadoFilter}
                onValueChange={(v) => {
                  setEstadoFilter(v as EstadoAsiento | '');
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger id="estado">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="BORRADOR">BORRADOR</SelectItem>
                  <SelectItem value="CONTABILIZADO">CONTABILIZADO</SelectItem>
                  <SelectItem value="ANULADO">ANULADO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaDesde">Desde</Label>
              <Input
                id="fechaDesde"
                type="date"
                value={fechaDesde}
                onChange={(e) => {
                  setFechaDesde(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaHasta">Hasta</Label>
              <Input
                id="fechaHasta"
                type="date"
                value={fechaHasta}
                onChange={(e) => {
                  setFechaHasta(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Mostrando {asientos.length} de {total} asientos
            {tipoFilter && ` · Tipo: ${tipoFilter}`}
            {estadoFilter && ` · Estado: ${estadoFilter}`}
          </div>
        </CardContent>
      </Card>

      {/* Lista de asientos */}
      <Card>
        <CardContent className="p-0">
          {asientos.length === 0 ? (
            <div className="py-12 text-center space-y-4">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">No hay asientos contables registrados</p>
              <Link to="/app/contabilidad/asientos/nuevo">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear primer asiento
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-semibold">#</th>
                      <th className="text-left p-3 font-semibold">Fecha</th>
                      <th className="text-left p-3 font-semibold">Descripción</th>
                      <th className="text-left p-3 font-semibold">Tipo</th>
                      <th className="text-left p-3 font-semibold">Estado</th>
                      <th className="text-center p-3 font-semibold">Líneas</th>
                      <th className="text-right p-3 font-semibold">Debe</th>
                      <th className="text-right p-3 font-semibold">Haber</th>
                      <th className="text-center p-3 font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asientos.map((asiento) => (
                      <tr
                        key={asiento.id}
                        className={`border-b hover:bg-muted/50 ${asiento.estado === 'ANULADO' ? 'opacity-60' : ''}`}
                      >
                        <td className="p-3 font-bold">{asiento.numero}</td>
                        <td className="p-3 text-sm">{formatDate(asiento.fecha)}</td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <div>{asiento.descripcion}</div>
                            {asiento.documentoRef && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <FileText className="h-3 w-3" />
                                {asiento.documentoRef}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={getTipoBadgeVariant(asiento.tipo)}>
                            {asiento.tipo}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={getEstadoBadgeVariant(asiento.estado)}>
                            {asiento.estado}
                          </Badge>
                        </td>
                        <td className="p-3 text-center">{asiento.lineas.length}</td>
                        <td className="p-3 text-right font-medium">{formatCurrency(asiento.totalDebe || 0)}</td>
                        <td className="p-3 text-right font-medium">{formatCurrency(asiento.totalHaber || 0)}</td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1">
                            <Link to={`/app/contabilidad/asientos/${asiento.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {asiento.estado === 'BORRADOR' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleContabilizar(asiento.id)}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Link to={`/app/contabilidad/asientos/${asiento.id}/editar`}>
                                  <Button variant="ghost" size="sm">
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </>
                            )}
                            {asiento.estado === 'CONTABILIZADO' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAnular(asiento.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AsientosContables;
