import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ordenCompraService, productoService, actoresService, centroCostoService, cotizacionService } from '../../services/api';
import type { CreateOrdenCompraInput, CreateItemOrdenCompraInput, TotalesDNIT } from '../../types/ordenCompra';
import type { Producto } from '../../types/producto';
import type { Actor } from '../../types/actor';
import type { CentroCosto } from '../../types/centroCosto';
import { MONEDAS_DISPONIBLES, formatCurrency as formatMoneda, type CodigoMoneda } from '../../types/moneda';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { ArrowLeft, Plus, Edit, Trash2, AlertCircle, CheckCircle, Info } from 'lucide-react';

export function OrdenCompraForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info' | 'warning'; message: string } | null>(null);

  // Catálogos
  const [proveedores, setProveedores] = useState<Actor[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [centrosCosto, setCentrosCosto] = useState<CentroCosto[]>([]);

  // Form data
  const [formData, setFormData] = useState<CreateOrdenCompraInput>({
    proveedorId: '',
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
    observaciones: '',
    moneda: 'PYG', // Moneda por defecto
    cotizacion: 1, // Cotización por defecto (1 para PYG)
    items: [],
  });

  // Totales calculados
  const [totales, setTotales] = useState<TotalesDNIT>({
    gravado10: 0,
    iva10: 0,
    gravado5: 0,
    iva5: 0,
    exentas: 0,
    totalGeneral: 0,
  });

  // Totales convertidos a moneda base
  const [totalesBase, setTotalesBase] = useState<TotalesDNIT>({
    gravado10: 0,
    iva10: 0,
    gravado5: 0,
    iva5: 0,
    exentas: 0,
    totalGeneral: 0,
  });

  // Item en edición
  const [itemEnEdicion, setItemEnEdicion] = useState<CreateItemOrdenCompraInput>({
    lineaNumero: 0,
    descripcion: '',
    cantidad: 1,
    unidadMedida: 'UNIDAD',
    precioUnitario: 0,
    productoId: '',
    centroCostoId: '',
    tasaIva: 10,
    cantidadControl: undefined,
    unidadControl: '',
  });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    loadCatalogos();
  }, []);

  useEffect(() => {
    calcularTotales();
  }, [formData.items, formData.cotizacion]);

  const loadCatalogos = async () => {
    try {
      const [proveedoresData, productosData, centrosData] = await Promise.all([
        actoresService.getAll({ tipo: 'PROVEEDOR', activo: true }),
        productoService.getAll({ activo: true }),
        centroCostoService.getAll({ activo: true }),
      ]);

      setProveedores(proveedoresData);
      setProductos(productosData);
      setCentrosCosto(centrosData);
    } catch (error: any) {
      console.error('Error loading catalogos:', error);
      setAlert({
        type: 'error',
        message: 'Error al cargar catálogos. Por favor recargue la página.',
      });
    }
  };

  const calcularTotales = () => {
    const totalesCalculados = ordenCompraService.calcularTotales(formData.items);
    setTotales(totalesCalculados);

    // Calcular totales en moneda base
    const totalesEnBase = ordenCompraService.convertirAMonedaBase(totalesCalculados, formData.cotizacion);
    setTotalesBase(totalesEnBase);
  };

  const handleMonedaChange = async (moneda: CodigoMoneda) => {
    setFormData({ ...formData, moneda });

    // Si es PYG, cotización = 1
    if (moneda === 'PYG') {
      setFormData({ ...formData, moneda, cotizacion: 1 });
      return;
    }

    // Buscar última cotización
    try {
      const cotizacion = await cotizacionService.getUltima(moneda, 'PYG');
      if (cotizacion) {
        setFormData({ ...formData, moneda, cotizacion: cotizacion.tasaCompra });
        setAlert({
          type: 'info',
          message: `Cotización ${moneda}/PYG: ${cotizacion.tasaCompra} (${new Date(cotizacion.fecha).toLocaleDateString()})`,
        });
      } else {
        setAlert({
          type: 'warning',
          message: `No hay cotización registrada para ${moneda}/PYG. Ingrese manualmente.`,
        });
      }
    } catch (error) {
      console.error('Error obteniendo cotización:', error);
      setAlert({
        type: 'warning',
        message: `Error al obtener cotización. Ingrese manualmente.`,
      });
    }
  };

  const handleProductoChange = (productoId: string) => {
    const producto = productos.find((p) => p.id === productoId);
    if (producto) {
      setItemEnEdicion({
        ...itemEnEdicion,
        productoId,
        descripcion: producto.nombre,
        unidadMedida: producto.unidadCompra,
        tasaIva: producto.tasaIva,
        unidadControl: producto.unidadControl || '',
      });
    } else {
      setItemEnEdicion({
        ...itemEnEdicion,
        productoId: '',
      });
    }
  };

  const handleAgregarItem = () => {
    // Validaciones
    if (!itemEnEdicion.descripcion.trim()) {
      setAlert({ type: 'error', message: 'La descripción es requerida' });
      return;
    }
    if (itemEnEdicion.cantidad <= 0) {
      setAlert({ type: 'error', message: 'La cantidad debe ser mayor a 0' });
      return;
    }
    if (itemEnEdicion.precioUnitario <= 0) {
      setAlert({ type: 'error', message: 'El precio unitario debe ser mayor a 0' });
      return;
    }
    if (!itemEnEdicion.centroCostoId) {
      setAlert({ type: 'error', message: 'El centro de costo es requerido' });
      return;
    }

    const nuevoItem: CreateItemOrdenCompraInput = {
      ...itemEnEdicion,
      lineaNumero: editingIndex !== null ? itemEnEdicion.lineaNumero : formData.items.length + 1,
    };

    let nuevosItems: CreateItemOrdenCompraInput[];
    if (editingIndex !== null) {
      // Actualizar item existente
      nuevosItems = [...formData.items];
      nuevosItems[editingIndex] = nuevoItem;
      setEditingIndex(null);
    } else {
      // Agregar nuevo item
      nuevosItems = [...formData.items, nuevoItem];
    }

    setFormData({ ...formData, items: nuevosItems });

    // Limpiar formulario de item
    setItemEnEdicion({
      lineaNumero: 0,
      descripcion: '',
      cantidad: 1,
      unidadMedida: 'UNIDAD',
      precioUnitario: 0,
      productoId: '',
      centroCostoId: '',
      tasaIva: 10,
      cantidadControl: undefined,
      unidadControl: '',
    });
  };

  const handleEditarItem = (index: number) => {
    setItemEnEdicion(formData.items[index]);
    setEditingIndex(index);
  };

  const handleEliminarItem = (index: number) => {
    const nuevosItems = formData.items.filter((_, i) => i !== index);
    // Renumerar líneas
    const itemsRenumerados = nuevosItems.map((item, i) => ({
      ...item,
      lineaNumero: i + 1,
    }));
    setFormData({ ...formData, items: itemsRenumerados });
  };

  const handleCancelarEdicion = () => {
    setItemEnEdicion({
      lineaNumero: 0,
      descripcion: '',
      cantidad: 1,
      unidadMedida: 'UNIDAD',
      precioUnitario: 0,
      productoId: '',
      centroCostoId: '',
      tasaIva: 10,
      cantidadControl: undefined,
      unidadControl: '',
    });
    setEditingIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.proveedorId) {
      setAlert({ type: 'error', message: 'El proveedor es requerido' });
      return;
    }
    if (formData.items.length === 0) {
      setAlert({ type: 'error', message: 'Debe agregar al menos un item' });
      return;
    }

    try {
      setLoading(true);
      await ordenCompraService.create(formData);
      setAlert({
        type: 'success',
        message: 'Orden de compra creada exitosamente',
      });
      // Redirigir después de 1 segundo
      setTimeout(() => {
        navigate('/compras/ordenes');
      }, 1000);
    } catch (error: any) {
      console.error('Error creating orden:', error);
      const errorMessage = error.response?.data?.error || error.message;
      setAlert({
        type: 'error',
        message: `Error al crear orden: ${errorMessage}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const calcularSubtotalItem = (cantidad: number, precio: number) => {
    return cantidad * precio;
  };

  const calcularIvaItem = (subtotal: number, tasaIva: number) => {
    return subtotal * (tasaIva / 100);
  };

  const calcularTotalItem = (cantidad: number, precio: number, tasaIva: number) => {
    const subtotal = calcularSubtotalItem(cantidad, precio);
    const iva = calcularIvaItem(subtotal, tasaIva);
    return subtotal + iva;
  };

  const getAlertIcon = (type: typeof alert.type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (type: typeof alert.type) => {
    if (type === 'error') return 'destructive';
    return 'default';
  };

  return (
    <div className="p-8 space-y-6">
      {alert && (
        <Alert variant={getAlertVariant(alert.type)} className="mb-4">
          {getAlertIcon(alert.type)}
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
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditing ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}
        </h1>
        <Button variant="outline" onClick={() => navigate('/compras/ordenes')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ========== ENCABEZADO ========== */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              📋 Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="proveedorId">
                  Proveedor <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.proveedorId}
                  onValueChange={(value) => setFormData({ ...formData, proveedorId: value })}
                  required
                >
                  <SelectTrigger id="proveedorId">
                    <SelectValue placeholder="Seleccionar proveedor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {proveedores.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.codigo} - {p.nombre} ({p.ruc})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha">
                  Fecha <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  id="fecha"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="moneda">
                  Moneda <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.moneda}
                  onValueChange={(value: CodigoMoneda) => handleMonedaChange(value)}
                  required
                >
                  <SelectTrigger id="moneda">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONEDAS_DISPONIBLES.map((moneda) => (
                      <SelectItem key={moneda.codigo} value={moneda.codigo}>
                        {moneda.codigo} - {moneda.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.moneda !== 'PYG' && (
                <div className="space-y-2">
                  <Label htmlFor="cotizacion">
                    Cotización a PYG <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    id="cotizacion"
                    value={formData.cotizacion}
                    onChange={(e) => setFormData({ ...formData, cotizacion: parseFloat(e.target.value) || 1 })}
                    min="0"
                    step="0.01"
                    required
                    placeholder="Ej: 7500"
                  />
                  <p className="text-xs text-muted-foreground">
                    1 {formData.moneda} = X PYG
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                type="text"
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción general de la orden"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                rows={3}
                placeholder="Observaciones adicionales"
              />
            </div>
          </CardContent>
        </Card>

        {/* ========== AGREGAR ITEMS ========== */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              📦 Agregar Item
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="producto">Producto (Opcional)</Label>
                <Select
                  value={itemEnEdicion.productoId || 'none'}
                  onValueChange={(value) => handleProductoChange(value === 'none' ? '' : value)}
                >
                  <SelectTrigger id="producto">
                    <SelectValue placeholder="Seleccionar producto o escribir descripción..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Seleccionar producto o escribir descripción...</SelectItem>
                    {productos.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.codigo} - {p.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">
                  Descripción <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="text"
                  id="descripcion"
                  value={itemEnEdicion.descripcion}
                  onChange={(e) =>
                    setItemEnEdicion({ ...itemEnEdicion, descripcion: e.target.value })
                  }
                  required
                  placeholder="Descripción del artículo"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cantidad">
                  Cantidad <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  id="cantidad"
                  value={itemEnEdicion.cantidad}
                  onChange={(e) =>
                    setItemEnEdicion({ ...itemEnEdicion, cantidad: parseFloat(e.target.value) || 0 })
                  }
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unidadMedida">
                  Unidad de Medida <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={itemEnEdicion.unidadMedida}
                  onValueChange={(value) =>
                    setItemEnEdicion({ ...itemEnEdicion, unidadMedida: value })
                  }
                  required
                >
                  <SelectTrigger id="unidadMedida">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNIDAD">Unidad</SelectItem>
                    <SelectItem value="KG">Kilogramos (KG)</SelectItem>
                    <SelectItem value="L">Litros (L)</SelectItem>
                    <SelectItem value="TON">Toneladas (TON)</SelectItem>
                    <SelectItem value="M3">Metros Cúbicos (M3)</SelectItem>
                    <SelectItem value="GLOBAL">Global</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="precioUnitario">
                  Precio Unitario <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  id="precioUnitario"
                  value={itemEnEdicion.precioUnitario}
                  onChange={(e) =>
                    setItemEnEdicion({
                      ...itemEnEdicion,
                      precioUnitario: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="centroCostoId">
                  Centro de Costo <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={itemEnEdicion.centroCostoId}
                  onValueChange={(value) =>
                    setItemEnEdicion({ ...itemEnEdicion, centroCostoId: value })
                  }
                  required
                >
                  <SelectTrigger id="centroCostoId">
                    <SelectValue placeholder="Seleccionar centro de costo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {centrosCosto.map((cc) => (
                      <SelectItem key={cc.id} value={cc.id}>
                        {cc.codigo} - {cc.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tasaIva">
                  Tasa IVA <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={String(itemEnEdicion.tasaIva)}
                  onValueChange={(value) =>
                    setItemEnEdicion({ ...itemEnEdicion, tasaIva: parseFloat(value) })
                  }
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

            <div className="flex gap-2 justify-end">
              {editingIndex !== null && (
                <Button type="button" variant="outline" onClick={handleCancelarEdicion}>
                  Cancelar
                </Button>
              )}
              <Button type="button" onClick={handleAgregarItem}>
                {editingIndex !== null ? (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    Actualizar Item
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Item
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ========== LISTA DE ITEMS ========== */}
        {formData.items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                📋 Items de la Orden
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="w-[100px]">Cantidad</TableHead>
                      <TableHead className="w-[100px]">Unidad</TableHead>
                      <TableHead className="w-[120px] text-right">Precio Unit.</TableHead>
                      <TableHead className="w-[120px]">Centro Costo</TableHead>
                      <TableHead className="w-[80px]">IVA</TableHead>
                      <TableHead className="w-[120px] text-right">Subtotal</TableHead>
                      <TableHead className="w-[120px] text-right">IVA Monto</TableHead>
                      <TableHead className="w-[120px] text-right">Total</TableHead>
                      <TableHead className="w-[100px] text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.items.map((item, index) => {
                      const subtotal = calcularSubtotalItem(item.cantidad, item.precioUnitario);
                      const ivaMonto = calcularIvaItem(subtotal, item.tasaIva);
                      const total = subtotal + ivaMonto;
                      const centroCosto = centrosCosto.find((cc) => cc.id === item.centroCostoId);

                      return (
                        <TableRow key={index}>
                          <TableCell>{item.lineaNumero}</TableCell>
                          <TableCell className="font-medium">{item.descripcion}</TableCell>
                          <TableCell>{item.cantidad}</TableCell>
                          <TableCell>{item.unidadMedida}</TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {formatCurrency(item.precioUnitario)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {centroCosto?.codigo}
                          </TableCell>
                          <TableCell>{item.tasaIva}%</TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {formatCurrency(subtotal)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {formatCurrency(ivaMonto)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm font-bold">
                            {formatCurrency(total)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditarItem(index)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEliminarItem(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========== TOTALES DNIT ========== */}
        {formData.items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                💰 Totales en {formData.moneda}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">Gravado 10%:</span>
                  <span className="font-mono font-semibold">{formatMoneda(totales.gravado10, formData.moneda)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">IVA 10%:</span>
                  <span className="font-mono font-semibold">{formatMoneda(totales.iva10, formData.moneda)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">Gravado 5%:</span>
                  <span className="font-mono font-semibold">{formatMoneda(totales.gravado5, formData.moneda)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">IVA 5%:</span>
                  <span className="font-mono font-semibold">{formatMoneda(totales.iva5, formData.moneda)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">Exentas:</span>
                  <span className="font-mono font-semibold">{formatMoneda(totales.exentas, formData.moneda)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg col-span-2 md:col-span-3">
                  <span className="text-base font-bold">TOTAL {formData.moneda}:</span>
                  <span className="text-xl font-mono font-bold text-primary">
                    {formatMoneda(totales.totalGeneral, formData.moneda)}
                  </span>
                </div>
              </div>

              {formData.moneda !== 'PYG' && (
                <>
                  <div className="mt-6 mb-3">
                    <h4 className="text-md font-semibold flex items-center gap-2">
                      💱 Totales Convertidos a PYG (Cotización: {formData.cotizacion})
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium text-muted-foreground">Gravado 10%:</span>
                      <span className="font-mono font-semibold">{formatMoneda(totalesBase.gravado10, 'PYG')}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium text-muted-foreground">IVA 10%:</span>
                      <span className="font-mono font-semibold">{formatMoneda(totalesBase.iva10, 'PYG')}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium text-muted-foreground">Gravado 5%:</span>
                      <span className="font-mono font-semibold">{formatMoneda(totalesBase.gravado5, 'PYG')}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium text-muted-foreground">IVA 5%:</span>
                      <span className="font-mono font-semibold">{formatMoneda(totalesBase.iva5, 'PYG')}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium text-muted-foreground">Exentas:</span>
                      <span className="font-mono font-semibold">{formatMoneda(totalesBase.exentas, 'PYG')}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg col-span-2 md:col-span-3">
                      <span className="text-base font-bold">TOTAL PYG:</span>
                      <span className="text-xl font-mono font-bold text-primary">
                        {formatMoneda(totalesBase.totalGeneral, 'PYG')}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* ========== ACCIONES ========== */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/compras/ordenes')}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading || formData.items.length === 0}>
            {loading ? 'Guardando...' : 'Guardar Orden de Compra'}
          </Button>
        </div>
      </form>
    </div>
  );
}
