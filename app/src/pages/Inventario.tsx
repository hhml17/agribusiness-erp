import { useState, useEffect } from 'react';
import { productoService, type Producto, type CreateProductoInput } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Pencil, Trash2, Package } from 'lucide-react';

export function Inventario() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [showBajoStock, setShowBajoStock] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateProductoInput>({
    codigo: '',
    nombre: '',
    descripcion: '',
    categoria: '',
    unidadMedida: 'kg',
    precioCompra: 0,
    precioVenta: 0,
    stock: 0,
    stockMinimo: 0,
  });

  useEffect(() => {
    loadProductos();
  }, [showBajoStock]);

  const loadProductos = async () => {
    try {
      setLoading(true);
      const data = showBajoStock
        ? await productoService.getBajoStock()
        : await productoService.getAll({ activo: true });
      setProductos(data);
    } catch (error) {
      console.error('Error loading productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedProducto) {
        await productoService.update(selectedProducto.id, formData);
      } else {
        await productoService.create(formData);
      }
      setShowModal(false);
      resetForm();
      loadProductos();
    } catch (error) {
      console.error('Error saving producto:', error);
    }
  };

  const handleEdit = (producto: Producto) => {
    setSelectedProducto(producto);
    setFormData({
      codigo: producto.codigo,
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      categoria: producto.categoria || '',
      unidadMedida: producto.unidadMedida,
      precioCompra: producto.precioCompra,
      precioVenta: producto.precioVenta,
      stock: producto.stock,
      stockMinimo: producto.stockMinimo || 0,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de desactivar este producto?')) {
      try {
        await productoService.delete(id);
        loadProductos();
      } catch (error) {
        console.error('Error deleting producto:', error);
      }
    }
  };

  const resetForm = () => {
    setSelectedProducto(null);
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      categoria: '',
      unidadMedida: 'kg',
      precioCompra: 0,
      precioVenta: 0,
      stock: 0,
      stockMinimo: 0,
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventario de Productos</h1>
          <p className="text-muted-foreground mt-1">Gestión de productos y stock</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Productos</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={showBajoStock ? 'secondary' : 'outline'}
              onClick={() => setShowBajoStock(!showBajoStock)}
              size="sm"
            >
              <Package className="mr-2 h-4 w-4" />
              {showBajoStock ? 'Ver Todos' : 'Stock Bajo'}
            </Button>
            <Button onClick={() => setShowModal(true)} size="sm">
              + Nuevo Producto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : productos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {showBajoStock ? 'No hay productos con stock bajo' : 'No hay productos registrados'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="w-[150px]">Categoría</TableHead>
                  <TableHead className="w-[100px]">Stock</TableHead>
                  <TableHead className="w-[120px]">P. Compra</TableHead>
                  <TableHead className="w-[120px]">P. Venta</TableHead>
                  <TableHead className="w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productos.map((producto) => (
                  <TableRow key={producto.id}>
                    <TableCell className="font-mono">{producto.codigo}</TableCell>
                    <TableCell className="font-medium">{producto.nombre}</TableCell>
                    <TableCell>{producto.categoria}</TableCell>
                    <TableCell>
                      <span className={producto.stockMinimo && producto.stock <= producto.stockMinimo ? 'text-destructive font-semibold' : ''}>
                        {producto.stock} {producto.unidadMedida}
                      </span>
                    </TableCell>
                    <TableCell>{formatCurrency(producto.precioCompra)}</TableCell>
                    <TableCell>{formatCurrency(producto.precioVenta)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(producto)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(producto.id)}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedProducto ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código *</Label>
                <Input
                  id="codigo"
                  type="text"
                  required
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría</Label>
                <Input
                  id="categoria"
                  type="text"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                rows={3}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unidadMedida">Unidad de Medida *</Label>
                <Select
                  value={formData.unidadMedida}
                  onValueChange={(value) => setFormData({ ...formData, unidadMedida: value })}
                  required
                >
                  <SelectTrigger id="unidadMedida">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilogramos (kg)</SelectItem>
                    <SelectItem value="litros">Litros</SelectItem>
                    <SelectItem value="unidades">Unidades</SelectItem>
                    <SelectItem value="dosis">Dosis</SelectItem>
                    <SelectItem value="metros">Metros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Actual *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockMinimo">Stock Mínimo</Label>
                <Input
                  id="stockMinimo"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.stockMinimo}
                  onChange={(e) => setFormData({ ...formData, stockMinimo: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="precioCompra">Precio de Compra *</Label>
                <Input
                  id="precioCompra"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={formData.precioCompra}
                  onChange={(e) => setFormData({ ...formData, precioCompra: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="precioVenta">Precio de Venta *</Label>
                <Input
                  id="precioVenta"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={formData.precioVenta}
                  onChange={(e) => setFormData({ ...formData, precioVenta: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit">
                {selectedProducto ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
