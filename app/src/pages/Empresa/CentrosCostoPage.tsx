import { useState, useEffect } from 'react';
import { centroCostoService } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Plus, Pencil, X, CheckCircle, AlertCircle } from 'lucide-react';
import type { CentroCosto, CreateCentroCostoInput } from '../../types/centroCosto';

export function CentrosCostoPage() {
  const [centros, setCentros] = useState<CentroCosto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCentro, setEditingCentro] = useState<CentroCosto | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [formData, setFormData] = useState<CreateCentroCostoInput>({
    codigo: '',
    nombre: '',
    descripcion: '',
    tipo: '',
  });

  useEffect(() => {
    loadCentros();
  }, [showInactive]);

  const loadCentros = async () => {
    try {
      setLoading(true);
      const data = await centroCostoService.getAll({ activo: showInactive ? undefined : true });
      setCentros(data);
    } catch (error: any) {
      console.error('Error loading centros de costo:', error);
      setAlert({
        type: 'error',
        message: 'Error al cargar centros de costo. Por favor intente nuevamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (centro?: CentroCosto) => {
    if (centro) {
      setEditingCentro(centro);
      setFormData({
        codigo: centro.codigo,
        nombre: centro.nombre,
        descripcion: centro.descripcion || '',
        tipo: centro.tipo || '',
      });
    } else {
      setEditingCentro(null);
      setFormData({
        codigo: '',
        nombre: '',
        descripcion: '',
        tipo: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCentro(null);
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      tipo: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCentro) {
        await centroCostoService.update(editingCentro.id, formData);
        setAlert({
          type: 'success',
          message: 'Centro de costo actualizado exitosamente'
        });
      } else {
        await centroCostoService.create(formData);
        setAlert({
          type: 'success',
          message: 'Centro de costo creado exitosamente'
        });
      }
      await loadCentros();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving centro de costo:', error);

      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      let userMessage = errorMessage;

      if (errorMessage.includes('already exists') || errorMessage.includes('ya existe')) {
        userMessage = 'Ya existe un centro de costo con este código';
      } else if (error.response?.status === 409) {
        userMessage = 'Ya existe un centro de costo con este código';
      } else if (error.response?.status === 400) {
        userMessage = errorMessage || 'Los datos ingresados no son válidos';
      }

      setAlert({
        type: 'error',
        message: userMessage
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de desactivar este centro de costo?')) {
      return;
    }

    try {
      await centroCostoService.delete(id);
      setAlert({
        type: 'success',
        message: 'Centro de costo desactivado exitosamente'
      });
      await loadCentros();
    } catch (error: any) {
      console.error('Error deleting centro de costo:', error);

      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      let userMessage = errorMessage;

      if (errorMessage.includes('cuentas asignadas')) {
        userMessage = 'No se puede desactivar un centro de costo con cuentas asignadas';
      } else if (errorMessage.includes('movimientos registrados')) {
        userMessage = 'No se puede desactivar un centro de costo con movimientos registrados';
      }

      setAlert({
        type: 'error',
        message: userMessage
      });
    }
  };

  const handleReactivate = async (id: string) => {
    if (!confirm('¿Está seguro de reactivar este centro de costo?')) {
      return;
    }

    try {
      await centroCostoService.update(id, { activo: true });
      setAlert({
        type: 'success',
        message: 'Centro de costo reactivado exitosamente'
      });
      await loadCentros();
    } catch (error: any) {
      console.error('Error reactivating centro de costo:', error);
      setAlert({
        type: 'error',
        message: 'Error al reactivar centro de costo'
      });
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
          <h1 className="text-3xl font-bold tracking-tight">Centros de Costo</h1>
          <p className="text-muted-foreground mt-1">
            Gestión de centros de costo de la empresa
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Listado de Centros de Costo</CardTitle>
          <div className="flex gap-2 items-center">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-gray-300"
              />
              Mostrar inactivos
            </label>
            <Button onClick={() => handleOpenModal()} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Centro de Costo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : centros.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay centros de costo registrados
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {centros.map((centro) => (
                  <TableRow
                    key={centro.id}
                    className={!centro.activo ? 'opacity-60' : ''}
                  >
                    <TableCell className="font-medium">{centro.codigo}</TableCell>
                    <TableCell>{centro.nombre}</TableCell>
                    <TableCell className="text-muted-foreground">{centro.descripcion || '-'}</TableCell>
                    <TableCell>{centro.tipo || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={centro.activo ? 'active' : 'inactive'}>
                        {centro.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {centro.activo ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenModal(centro)}
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(centro.id)}
                              title="Desactivar"
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleReactivate(centro.id)}
                            title="Reactivar"
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
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

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCentro ? 'Editar Centro de Costo' : 'Nuevo Centro de Costo'}
            </DialogTitle>
            <DialogDescription>
              {editingCentro
                ? 'Actualiza la información del centro de costo.'
                : 'Ingresa los datos del nuevo centro de costo.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">
                Código <span className="text-destructive">*</span>
              </Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                required
                disabled={!!editingCentro}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Input
                id="tipo"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                placeholder="Ej: Producción, Administrativo, Ventas"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows={3}
                placeholder="Se usa para gastos realizados en..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingCentro ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
