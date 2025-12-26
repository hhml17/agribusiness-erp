import { useState, useEffect } from 'react';
import { Table, Button, Modal, Card, type Column } from '../components';
import { productosService, type Producto, type CreateProductoInput } from '../services/api';

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
        ? await productosService.getBajoStock()
        : await productosService.getAll({ activo: true });
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
        await productosService.update(selectedProducto.id, formData);
      } else {
        await productosService.create(formData);
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
        await productosService.delete(id);
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

  const columns: Column<Producto>[] = [
    {
      key: 'codigo',
      header: 'Código',
      width: '100px',
    },
    {
      key: 'nombre',
      header: 'Nombre',
    },
    {
      key: 'categoria',
      header: 'Categoría',
      width: '150px',
    },
    {
      key: 'stock',
      header: 'Stock',
      width: '100px',
      render: (item) => (
        <span className={item.stockMinimo && item.stock <= item.stockMinimo ? 'stock-bajo' : ''}>
          {item.stock} {item.unidadMedida}
        </span>
      ),
    },
    {
      key: 'precioCompra',
      header: 'P. Compra',
      width: '120px',
      render: (item) => formatCurrency(item.precioCompra),
    },
    {
      key: 'precioVenta',
      header: 'P. Venta',
      width: '120px',
      render: (item) => formatCurrency(item.precioVenta),
    },
    {
      key: 'id',
      header: 'Acciones',
      width: '150px',
      render: (item) => (
        <div className="table-actions">
          <button className="btn-icon" onClick={() => handleEdit(item)} title="Editar">
            ✏️
          </button>
          <button className="btn-icon" onClick={() => handleDelete(item.id)} title="Eliminar">
            🗑️
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="inventario-page">
      <div className="page-header">
        <div>
          <h1>Inventario de Productos</h1>
          <p className="page-subtitle">Gestión de productos y stock</p>
        </div>
      </div>

      <Card
        actions={
          <div className="card-toolbar">
            <Button
              variant={showBajoStock ? 'secondary' : 'primary'}
              onClick={() => setShowBajoStock(!showBajoStock)}
              size="small"
            >
              {showBajoStock ? 'Ver Todos' : 'Stock Bajo'}
            </Button>
            <Button onClick={() => setShowModal(true)}>+ Nuevo Producto</Button>
          </div>
        }
      >
        <Table
          data={productos}
          columns={columns}
          loading={loading}
          emptyMessage={
            showBajoStock
              ? 'No hay productos con stock bajo'
              : 'No hay productos registrados'
          }
        />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedProducto ? 'Editar Producto' : 'Nuevo Producto'}
        size="medium"
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {selectedProducto ? 'Actualizar' : 'Crear'}
            </Button>
          </>
        }
      >
        <form className="producto-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="codigo">Código *</label>
              <input
                id="codigo"
                type="text"
                required
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="categoria">Categoría</label>
              <input
                id="categoria"
                type="text"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="nombre">Nombre *</label>
            <input
              id="nombre"
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              rows={3}
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="unidadMedida">Unidad de Medida *</label>
              <select
                id="unidadMedida"
                required
                value={formData.unidadMedida}
                onChange={(e) => setFormData({ ...formData, unidadMedida: e.target.value })}
              >
                <option value="kg">Kilogramos (kg)</option>
                <option value="litros">Litros</option>
                <option value="unidades">Unidades</option>
                <option value="dosis">Dosis</option>
                <option value="metros">Metros</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="stock">Stock Actual *</label>
              <input
                id="stock"
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="stockMinimo">Stock Mínimo</label>
              <input
                id="stockMinimo"
                type="number"
                min="0"
                step="0.01"
                value={formData.stockMinimo}
                onChange={(e) => setFormData({ ...formData, stockMinimo: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="precioCompra">Precio de Compra *</label>
              <input
                id="precioCompra"
                type="number"
                min="0"
                step="1"
                required
                value={formData.precioCompra}
                onChange={(e) => setFormData({ ...formData, precioCompra: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="precioVenta">Precio de Venta *</label>
              <input
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
        </form>
      </Modal>
    </div>
  );
}
