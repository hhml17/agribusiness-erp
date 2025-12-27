import { useState, useEffect } from 'react';
import { productoService } from '../../services/api';
import { CuentaContableSelect } from '../../components';
import type { Producto, CreateProductoInput } from '../../types/producto';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { Badge } from '../../components/ui/badge';
import { Plus, Edit, Trash2, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';

export function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  // Estado inicial del formulario con todos los campos DNIT
  const initialFormData: CreateProductoInput = {
    codigo: '',
    nombre: '',
    descripcion: '',
    categoria: '',

    // DNIT - Datos Financieros
    tasaIva: 10,
    cuentaIvaId: '',

    // DNIT - Tipo de Artículo
    tipoArticulo: 'INSUMO',

    // DNIT - Doble Unidad de Medida
    unidadCompra: 'KG',
    unidadControl: '',
    factorConversion: undefined,

    // DNIT - Control de Inventario
    controlaStock: false,
    metodoValuacion: 'PROMEDIO',

    // DNIT - Ganadería
    esAnimal: false,
    especieAnimal: '',

    // DNIT - Agricultura
    esInsumoAgricola: false,
    categoriaAgricola: '',

    // Cuentas Contables
    cuentaInventarioId: '',
    cuentaCostoId: '',
    cuentaIngresoId: '',

    // Stock
    stockMinimo: 0,

    // LEGACY (compatibilidad)
    unidadMedida: '',
    precioCompra: 0,
    precioVenta: 0,
  };

  const [formData, setFormData] = useState<CreateProductoInput>(initialFormData);

  useEffect(() => {
    loadProductos();
  }, [showInactive]);

  const loadProductos = async () => {
    try {
      setLoading(true);
      const data = await productoService.getAll({ activo: showInactive ? undefined : true });
      setProductos(data);
    } catch (error: any) {
      console.error('Error loading productos:', error);
      setAlert({
        type: 'error',
        message: 'Error al cargar productos. Por favor intente nuevamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (producto?: Producto) => {
    if (producto) {
      setEditingProducto(producto);
      setFormData({
        codigo: producto.codigo,
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        categoria: producto.categoria || '',

        // DNIT
        tasaIva: producto.tasaIva,
        cuentaIvaId: producto.cuentaIvaId || '',
        tipoArticulo: producto.tipoArticulo,
        unidadCompra: producto.unidadCompra,
        unidadControl: producto.unidadControl || '',
        factorConversion: producto.factorConversion,
        controlaStock: producto.controlaStock,
        metodoValuacion: producto.metodoValuacion || 'PROMEDIO',
        esAnimal: producto.esAnimal,
        especieAnimal: producto.especieAnimal || '',
        esInsumoAgricola: producto.esInsumoAgricola,
        categoriaAgricola: producto.categoriaAgricola || '',

        // Cuentas
        cuentaInventarioId: producto.cuentaInventarioId || '',
        cuentaCostoId: producto.cuentaCostoId || '',
        cuentaIngresoId: producto.cuentaIngresoId || '',

        // Stock
        stockMinimo: producto.stockMinimo || 0,

        // LEGACY
        unidadMedida: producto.unidadMedida || '',
        precioCompra: producto.precioCompra || 0,
        precioVenta: producto.precioVenta || 0,
      });
    } else {
      setEditingProducto(null);
      setFormData(initialFormData);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProducto(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingProducto) {
        await productoService.update(editingProducto.id, formData);
        setAlert({
          type: 'success',
          message: 'Producto actualizado exitosamente'
        });
      } else {
        await productoService.create(formData);
        setAlert({
          type: 'success',
          message: 'Producto creado exitosamente'
        });
      }
      await loadProductos();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving producto:', error);

      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      let userMessage = errorMessage;

      if (errorMessage.includes('ya existe') || errorMessage.includes('código')) {
        userMessage = 'Ya existe un producto con este código';
      } else if (error.response?.status === 409) {
        userMessage = 'Ya existe un producto con este código';
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
    if (!confirm('¿Está seguro de desactivar este producto?')) {
      return;
    }

    try {
      await productoService.delete(id);
      setAlert({
        type: 'success',
        message: 'Producto desactivado exitosamente'
      });
      await loadProductos();
    } catch (error: any) {
      console.error('Error deleting producto:', error);

      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      let userMessage = errorMessage;

      if (errorMessage.includes('movimientos')) {
        userMessage = 'No se puede desactivar un producto con movimientos registrados';
      }

      setAlert({
        type: 'error',
        message: userMessage
      });
    }
  };

  const handleReactivate = async (id: string) => {
    if (!confirm('¿Está seguro de reactivar este producto?')) {
      return;
    }

    try {
      await productoService.update(id, { activo: true });
      setAlert({
        type: 'success',
        message: 'Producto reactivado exitosamente'
      });
      await loadProductos();
    } catch (error: any) {
      console.error('Error reactivating producto:', error);
      setAlert({
        type: 'error',
        message: 'Error al reactivar producto'
      });
    }
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
        <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded"
            />
            Mostrar inactivos
          </label>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
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
                  <TableHead>Unidad Compra</TableHead>
                  <TableHead>IVA</TableHead>
                  <TableHead>Cuenta Inventario</TableHead>
                  <TableHead>Cuenta Costo</TableHead>
                  <TableHead>Cuenta Ingreso</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No hay productos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  productos.map((producto) => (
                    <TableRow key={producto.id} className={!producto.activo ? 'opacity-60' : ''}>
                      <TableCell className="font-mono text-sm">{producto.codigo}</TableCell>
                      <TableCell className="font-medium">{producto.nombre}</TableCell>
                      <TableCell>{producto.tipoArticulo}</TableCell>
                      <TableCell>{producto.unidadCompra}</TableCell>
                      <TableCell>{producto.tasaIva}%</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {producto.cuentaInventario
                          ? `${producto.cuentaInventario.codigo} - ${producto.cuentaInventario.nombre}`
                          : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {producto.cuentaCosto
                          ? `${producto.cuentaCosto.codigo} - ${producto.cuentaCosto.nombre}`
                          : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {producto.cuentaIngreso
                          ? `${producto.cuentaIngreso.codigo} - ${producto.cuentaIngreso.nombre}`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={producto.activo ? 'active' : 'inactive'}>
                          {producto.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {producto.activo ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenModal(producto)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(producto.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReactivate(producto.id)}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ========== SECCIÓN 1: IDENTIFICACIÓN ========== */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                📋 Identificación
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">
                    Código <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    required
                    disabled={!!editingProducto}
                    placeholder="Ej: FERT001"
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
                    placeholder="Ej: Fertilizante NPK 50kg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría</Label>
                  <Input
                    id="categoria"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    placeholder="Ej: Fertilizantes, Agroquímicos, Alimentos"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Input
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Descripción breve del producto"
                  />
                </div>
              </div>
            </div>

            {/* ========== SECCIÓN 2: DATOS DNIT ========== */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                📊 Datos DNIT Paraguay
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipoArticulo">
                    Tipo de Artículo <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.tipoArticulo}
                    onValueChange={(value) => setFormData({ ...formData, tipoArticulo: value })}
                    required
                  >
                    <SelectTrigger id="tipoArticulo">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INSUMO">Insumo</SelectItem>
                      <SelectItem value="ACTIVO_FIJO">Activo Fijo</SelectItem>
                      <SelectItem value="ANIMAL">Animal</SelectItem>
                      <SelectItem value="GASTO_DIRECTO">Gasto Directo</SelectItem>
                      <SelectItem value="SERVICIO">Servicio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tasaIva">
                    Tasa de IVA <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={String(formData.tasaIva)}
                    onValueChange={(value) => setFormData({ ...formData, tasaIva: parseFloat(value) })}
                    required
                  >
                    <SelectTrigger id="tasaIva">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10% (Gravado)</SelectItem>
                      <SelectItem value="5">5% (Reducido)</SelectItem>
                      <SelectItem value="0">0% (Exento)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* ========== SECCIÓN 3: UNIDADES DE MEDIDA ========== */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                📏 Unidades de Medida
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unidadCompra">
                    Unidad de Compra <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.unidadCompra}
                    onValueChange={(value) => setFormData({ ...formData, unidadCompra: value })}
                    required
                  >
                    <SelectTrigger id="unidadCompra">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GLOBAL">Global</SelectItem>
                      <SelectItem value="TON">Toneladas (TON)</SelectItem>
                      <SelectItem value="M3">Metros Cúbicos (M3)</SelectItem>
                      <SelectItem value="UNIDAD">Unidad</SelectItem>
                      <SelectItem value="KG">Kilogramos (KG)</SelectItem>
                      <SelectItem value="L">Litros (L)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Unidad usada en facturación y compras</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unidadControl">Unidad de Control (Stock)</Label>
                  <Select
                    value={formData.unidadControl}
                    onValueChange={(value) => setFormData({ ...formData, unidadControl: value })}
                  >
                    <SelectTrigger id="unidadControl">
                      <SelectValue placeholder="Sin control específico" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin control específico</SelectItem>
                      <SelectItem value="L">Litros (L)</SelectItem>
                      <SelectItem value="KG">Kilogramos (KG)</SelectItem>
                      <SelectItem value="CABEZA">Cabezas (Ganado)</SelectItem>
                      <SelectItem value="UNIDAD">Unidades</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Unidad usada para control de inventario</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="factorConversion">Factor de Conversión</Label>
                  <Input
                    type="number"
                    id="factorConversion"
                    value={formData.factorConversion || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      factorConversion: e.target.value ? parseFloat(e.target.value) : undefined
                    })}
                    min="0"
                    step="0.001"
                    placeholder="Ej: 1000 (1 TON = 1000 KG)"
                  />
                  <p className="text-xs text-muted-foreground">1 Unidad Compra = X Unidades Control</p>
                </div>
              </div>
            </div>

            {/* ========== SECCIÓN 4: CONTROL DE INVENTARIO ========== */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                📦 Control de Inventario
              </h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="controlaStock"
                    checked={formData.controlaStock}
                    onCheckedChange={(checked) => setFormData({ ...formData, controlaStock: checked as boolean })}
                  />
                  <label
                    htmlFor="controlaStock"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Controla Stock
                  </label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  Activar si este producto requiere control de inventario
                </p>

                {formData.controlaStock && (
                  <div className="grid grid-cols-2 gap-4 ml-6">
                    <div className="space-y-2">
                      <Label htmlFor="metodoValuacion">Método de Valuación</Label>
                      <Select
                        value={formData.metodoValuacion}
                        onValueChange={(value) => setFormData({ ...formData, metodoValuacion: value })}
                      >
                        <SelectTrigger id="metodoValuacion">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PROMEDIO">Promedio Ponderado</SelectItem>
                          <SelectItem value="FIFO">FIFO (Primero en Entrar, Primero en Salir)</SelectItem>
                          <SelectItem value="IDENTIFICADO">Identificado (Ganado)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stockMinimo">Stock Mínimo</Label>
                      <Input
                        type="number"
                        id="stockMinimo"
                        value={formData.stockMinimo}
                        onChange={(e) => setFormData({ ...formData, stockMinimo: parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ========== SECCIÓN 5: CARACTERÍSTICAS ESPECIALES ========== */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                🌾 Características Especiales
              </h3>

              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="esAnimal"
                      checked={formData.esAnimal}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        esAnimal: checked as boolean,
                        especieAnimal: checked ? formData.especieAnimal : ''
                      })}
                    />
                    <label
                      htmlFor="esAnimal"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Es Animal (Ganadería)
                    </label>
                  </div>

                  {formData.esAnimal && (
                    <div className="space-y-2 ml-6">
                      <Label htmlFor="especieAnimal">Especie Animal</Label>
                      <Select
                        value={formData.especieAnimal}
                        onValueChange={(value) => setFormData({ ...formData, especieAnimal: value })}
                      >
                        <SelectTrigger id="especieAnimal">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BOVINO">Bovino</SelectItem>
                          <SelectItem value="EQUINO">Equino</SelectItem>
                          <SelectItem value="OVINO">Ovino</SelectItem>
                          <SelectItem value="PORCINO">Porcino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="esInsumoAgricola"
                      checked={formData.esInsumoAgricola}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        esInsumoAgricola: checked as boolean,
                        categoriaAgricola: checked ? formData.categoriaAgricola : ''
                      })}
                    />
                    <label
                      htmlFor="esInsumoAgricola"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Es Insumo Agrícola
                    </label>
                  </div>

                  {formData.esInsumoAgricola && (
                    <div className="space-y-2 ml-6">
                      <Label htmlFor="categoriaAgricola">Categoría Agrícola</Label>
                      <Select
                        value={formData.categoriaAgricola}
                        onValueChange={(value) => setFormData({ ...formData, categoriaAgricola: value })}
                      >
                        <SelectTrigger id="categoriaAgricola">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SEMILLA">Semilla</SelectItem>
                          <SelectItem value="FERTILIZANTE">Fertilizante</SelectItem>
                          <SelectItem value="AGROQUIMICO">Agroquímico</SelectItem>
                          <SelectItem value="HERBICIDA">Herbicida</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ========== SECCIÓN 6: CUENTAS CONTABLES ========== */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                💼 Cuentas Contables
              </h3>

              <div className="space-y-4">
                <CuentaContableSelect
                  label="Cuenta de Inventario (Activo)"
                  tipo="ACTIVO"
                  value={formData.cuentaInventarioId || ''}
                  onChange={(value) => setFormData({ ...formData, cuentaInventarioId: value })}
                  required={false}
                />

                <CuentaContableSelect
                  label="Cuenta de Costo (Gasto)"
                  tipo="GASTO"
                  value={formData.cuentaCostoId || ''}
                  onChange={(value) => setFormData({ ...formData, cuentaCostoId: value })}
                  required={false}
                />

                <CuentaContableSelect
                  label="Cuenta de Ingreso"
                  tipo="INGRESO"
                  value={formData.cuentaIngresoId || ''}
                  onChange={(value) => setFormData({ ...formData, cuentaIngresoId: value })}
                  required={false}
                />

                <CuentaContableSelect
                  label="Cuenta IVA Crédito Fiscal"
                  tipo="ACTIVO"
                  value={formData.cuentaIvaId || ''}
                  onChange={(value) => setFormData({ ...formData, cuentaIvaId: value })}
                  required={false}
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingProducto ? 'Actualizar' : 'Crear'} Producto
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
