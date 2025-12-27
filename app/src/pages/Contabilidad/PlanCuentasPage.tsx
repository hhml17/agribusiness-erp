import { useState, useEffect } from 'react';
import { cuentaContableService } from '../../services/api';
import type { CuentaContable, CreateCuentaContableInput, TipoCuenta } from '../../types/cuentaContable';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Plus, Edit, Trash2, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';

export function PlanCuentasPage() {
  const [cuentas, setCuentas] = useState<CuentaContable[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCuenta, setEditingCuenta] = useState<CuentaContable | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [formData, setFormData] = useState<CreateCuentaContableInput>({
    codigo: '',
    nombre: '',
    tipo: 'ACTIVO',
    nivel: 1,
    descripcion: '',
  });

  useEffect(() => {
    loadCuentas();
  }, [showInactive]);

  const loadCuentas = async () => {
    try {
      setLoading(true);
      const data = await cuentaContableService.getAll({ activo: showInactive ? undefined : true });
      setCuentas(data);
    } catch (error: any) {
      console.error('Error loading cuentas contables:', error);
      setAlert({
        type: 'error',
        message: 'Error al cargar cuentas contables. Por favor intente nuevamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (cuenta?: CuentaContable) => {
    if (cuenta) {
      setEditingCuenta(cuenta);
      setFormData({
        codigo: cuenta.codigo,
        nombre: cuenta.nombre,
        tipo: cuenta.tipo,
        nivel: cuenta.nivel,
        descripcion: cuenta.descripcion || '',
        cuentaPadreId: cuenta.cuentaPadreId || undefined,
      });
    } else {
      setEditingCuenta(null);
      setFormData({
        codigo: '',
        nombre: '',
        tipo: 'ACTIVO',
        nivel: 1,
        descripcion: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCuenta(null);
    setFormData({
      codigo: '',
      nombre: '',
      tipo: 'ACTIVO',
      nivel: 1,
      descripcion: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCuenta) {
        await cuentaContableService.update(editingCuenta.id, formData);
        setAlert({
          type: 'success',
          message: 'Cuenta contable actualizada exitosamente'
        });
      } else {
        await cuentaContableService.create(formData);
        setAlert({
          type: 'success',
          message: 'Cuenta contable creada exitosamente'
        });
      }
      await loadCuentas();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving cuenta contable:', error);

      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      let userMessage = errorMessage;

      if (errorMessage.includes('ya existe') || errorMessage.includes('código')) {
        userMessage = 'Ya existe una cuenta contable con este código';
      } else if (error.response?.status === 409) {
        userMessage = 'Ya existe una cuenta contable con este código';
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
    if (!confirm('¿Está seguro de desactivar esta cuenta contable?')) {
      return;
    }

    try {
      await cuentaContableService.delete(id);
      setAlert({
        type: 'success',
        message: 'Cuenta contable desactivada exitosamente'
      });
      await loadCuentas();
    } catch (error: any) {
      console.error('Error deleting cuenta contable:', error);

      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      let userMessage = errorMessage;

      if (errorMessage.includes('cuentas hijas')) {
        userMessage = 'No se puede desactivar una cuenta con cuentas hijas activas';
      } else if (errorMessage.includes('movimientos')) {
        userMessage = 'No se puede desactivar una cuenta con movimientos registrados';
      }

      setAlert({
        type: 'error',
        message: userMessage
      });
    }
  };

  const handleReactivate = async (id: string) => {
    if (!confirm('¿Está seguro de reactivar esta cuenta contable?')) {
      return;
    }

    try {
      await cuentaContableService.update(id, { activo: true });
      setAlert({
        type: 'success',
        message: 'Cuenta contable reactivada exitosamente'
      });
      await loadCuentas();
    } catch (error: any) {
      console.error('Error reactivating cuenta contable:', error);
      setAlert({
        type: 'error',
        message: 'Error al reactivar cuenta contable'
      });
    }
  };

  const getTipoLabel = (tipo: TipoCuenta): string => {
    const labels: Record<TipoCuenta, string> = {
      ACTIVO: 'Activo',
      PASIVO: 'Pasivo',
      PATRIMONIO: 'Patrimonio',
      INGRESO: 'Ingreso',
      EGRESO: 'Egreso',
    };
    return labels[tipo] || tipo;
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="text-center py-8 text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {alert && (
        <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="mb-4">
          {alert.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{alert.message}</AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAlert(null)}
            className="absolute top-2 right-2"
          >
            ×
          </Button>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Plan de Cuentas Contables</h1>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded"
            />
            Mostrar inactivas
          </label>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cuenta Contable
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cuentas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No hay cuentas contables registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  cuentas.map((cuenta) => (
                    <TableRow key={cuenta.id} className={!cuenta.activo ? 'opacity-60' : ''}>
                      <TableCell className="font-mono text-sm">{cuenta.codigo}</TableCell>
                      <TableCell className="font-medium">{cuenta.nombre}</TableCell>
                      <TableCell>{getTipoLabel(cuenta.tipo)}</TableCell>
                      <TableCell>{cuenta.nivel}</TableCell>
                      <TableCell className="text-muted-foreground">{cuenta.descripcion || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={cuenta.activo ? 'active' : 'inactive'}>
                          {cuenta.activo ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {cuenta.activo ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenModal(cuenta)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(cuenta.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReactivate(cuenta.id)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Formulario */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingCuenta ? 'Editar Cuenta Contable' : 'Nueva Cuenta Contable'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">
                  Código <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  placeholder="Ej: 1.1.01.001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nivel">
                  Nivel <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nivel"
                  type="number"
                  min="1"
                  max="9"
                  value={formData.nivel}
                  onChange={(e) => setFormData({ ...formData, nivel: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Nombre de la cuenta"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">
                Tipo de Cuenta <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: TipoCuenta) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVO">Activo</SelectItem>
                  <SelectItem value="PASIVO">Pasivo</SelectItem>
                  <SelectItem value="PATRIMONIO">Patrimonio</SelectItem>
                  <SelectItem value="INGRESO">Ingreso</SelectItem>
                  <SelectItem value="EGRESO">Egreso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción opcional de la cuenta"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingCuenta ? 'Actualizar' : 'Crear'} Cuenta
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
