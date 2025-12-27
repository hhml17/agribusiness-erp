import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordenCompraService } from '../../services/api';
import type { OrdenCompra } from '../../types/ordenCompra';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Eye, Pencil, CheckCircle, XCircle, Plus, AlertCircle } from 'lucide-react';

export function OrdenCompraPage() {
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [estadoFiltro, setEstadoFiltro] = useState<string>('');

  useEffect(() => {
    loadOrdenes();
  }, [estadoFiltro]);

  const loadOrdenes = async () => {
    try {
      setLoading(true);
      const filters = estadoFiltro ? { estado: estadoFiltro as any } : undefined;
      const data = await ordenCompraService.getAll(filters);
      setOrdenes(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error loading órdenes:', error);
      setOrdenes([]);
      setAlert({
        type: 'error',
        message: 'Error al cargar órdenes de compra. Por favor intente nuevamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (id: string) => {
    if (!confirm('¿Está seguro de aprobar esta orden de compra?')) {
      return;
    }

    try {
      await ordenCompraService.aprobar(id);
      setAlert({
        type: 'success',
        message: 'Orden de compra aprobada exitosamente'
      });
      await loadOrdenes();
    } catch (error: any) {
      console.error('Error aprobando orden:', error);
      const errorMessage = error.response?.data?.error || error.message;
      setAlert({
        type: 'error',
        message: `Error al aprobar orden: ${errorMessage}`
      });
    }
  };

  const handleAnular = async (id: string) => {
    const motivo = prompt('Ingrese el motivo de anulación:');
    if (!motivo) {
      return;
    }

    try {
      await ordenCompraService.anular(id, motivo);
      setAlert({
        type: 'success',
        message: 'Orden de compra anulada exitosamente'
      });
      await loadOrdenes();
    } catch (error: any) {
      console.error('Error anulando orden:', error);
      const errorMessage = error.response?.data?.error || error.message;
      setAlert({
        type: 'error',
        message: `Error al anular orden: ${errorMessage}`
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PY');
  };

  const getEstadoBadgeVariant = (estado: string): 'draft' | 'approved' | 'partial' | 'completed' | 'cancelled' | 'default' => {
    switch (estado) {
      case 'BORRADOR': return 'draft';
      case 'APROBADA': return 'approved';
      case 'PARCIAL': return 'partial';
      case 'COMPLETADA': return 'completed';
      case 'ANULADA': return 'cancelled';
      default: return 'default';
    }
  };

  return (
    <div className="p-8 space-y-6">
      {alert && (
        <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{alert.type === 'error' ? 'Error' : 'Éxito'}</AlertTitle>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Órdenes de Compra</h1>
          <p className="text-muted-foreground mt-1">Gestión de órdenes de compra DNIT</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Listado de Órdenes</CardTitle>
          <div className="flex gap-2 items-center">
            <Select value={estadoFiltro || 'all'} onValueChange={(v) => setEstadoFiltro(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="BORRADOR">Borrador</SelectItem>
                <SelectItem value="APROBADA">Aprobada</SelectItem>
                <SelectItem value="PARCIAL">Parcial</SelectItem>
                <SelectItem value="COMPLETADA">Completada</SelectItem>
                <SelectItem value="ANULADA">Anulada</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => navigate('/compras/ordenes/nueva')} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Orden
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : ordenes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay órdenes de compra registradas
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Gravado 10%</TableHead>
                  <TableHead className="text-right">IVA 10%</TableHead>
                  <TableHead className="text-right">Gravado 5%</TableHead>
                  <TableHead className="text-right">IVA 5%</TableHead>
                  <TableHead className="text-right">Exentas</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordenes.map((orden) => (
                  <TableRow
                    key={orden.id}
                    className={orden.estado === 'ANULADA' ? 'opacity-60 line-through' : ''}
                  >
                    <TableCell>
                      <button
                        className="text-primary hover:underline font-medium"
                        onClick={() => navigate(`/compras/ordenes/${orden.id}`)}
                      >
                        {orden.numero}
                      </button>
                    </TableCell>
                    <TableCell>{formatDate(orden.fecha)}</TableCell>
                    <TableCell>{orden.proveedorNombre}</TableCell>
                    <TableCell>
                      <Badge variant={getEstadoBadgeVariant(orden.estado)}>
                        {orden.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(orden.gravado10)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(orden.iva10)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(orden.gravado5)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(orden.iva5)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(orden.exentas)}</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(orden.totalOrden)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {orden.estado === 'BORRADOR' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/compras/ordenes/${orden.id}/editar`)}
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleAprobar(orden.id)}
                              title="Aprobar"
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleAnular(orden.id)}
                              title="Anular"
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {orden.estado === 'APROBADA' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/compras/ordenes/${orden.id}`)}
                            title="Ver Detalle"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
