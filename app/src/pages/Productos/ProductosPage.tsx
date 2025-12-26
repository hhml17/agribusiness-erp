import { useState, useEffect } from 'react';
import { productoService } from '../../services/api';
import { Alert, CuentaContableSelect, type AlertType } from '../../components';
import type { Producto, CreateProductoInput } from '../../types/producto';

export function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [alert, setAlert] = useState<{ type: AlertType; message: string } | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [formData, setFormData] = useState<CreateProductoInput>({
    codigo: '',
    nombre: '',
    descripcion: '',
    unidadMedida: '',
    precioCompra: 0,
    precioVenta: 0,
    cuentaInventarioId: '',
    cuentaCostoId: '',
    cuentaIngresoId: '',
  });

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
        unidadMedida: producto.unidadMedida || '',
        precioCompra: producto.precioCompra || 0,
        precioVenta: producto.precioVenta || 0,
        cuentaInventarioId: producto.cuentaInventarioId,
        cuentaCostoId: producto.cuentaCostoId,
        cuentaIngresoId: producto.cuentaIngresoId,
      });
    } else {
      setEditingProducto(null);
      setFormData({
        codigo: '',
        nombre: '',
        descripcion: '',
        unidadMedida: '',
        precioCompra: 0,
        precioVenta: 0,
        cuentaInventarioId: '',
        cuentaCostoId: '',
        cuentaIngresoId: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProducto(null);
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      unidadMedida: '',
      precioCompra: 0,
      precioVenta: 0,
      cuentaInventarioId: '',
      cuentaCostoId: '',
      cuentaIngresoId: '',
    });
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="productos-page">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="page-header">
        <h1>Productos</h1>
        <div className="header-actions">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            Mostrar inactivos
          </label>
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            + Nuevo Producto
          </button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Unidad</th>
              <th>Precio Compra</th>
              <th>Precio Venta</th>
              <th>Cuenta Inventario</th>
              <th>Cuenta Costo</th>
              <th>Cuenta Ingreso</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 ? (
              <tr>
                <td colSpan={10} className="no-data">
                  No hay productos registrados
                </td>
              </tr>
            ) : (
              productos.map((producto) => (
                <tr key={producto.id} className={!producto.activo ? 'inactive-row' : ''}>
                  <td>{producto.codigo}</td>
                  <td>{producto.nombre}</td>
                  <td>{producto.unidadMedida || '-'}</td>
                  <td>{formatCurrency(producto.precioCompra || 0)}</td>
                  <td>{formatCurrency(producto.precioVenta || 0)}</td>
                  <td>
                    {producto.cuentaInventario
                      ? `${producto.cuentaInventario.codigo} - ${producto.cuentaInventario.nombre}`
                      : '-'}
                  </td>
                  <td>
                    {producto.cuentaCosto
                      ? `${producto.cuentaCosto.codigo} - ${producto.cuentaCosto.nombre}`
                      : '-'}
                  </td>
                  <td>
                    {producto.cuentaIngreso
                      ? `${producto.cuentaIngreso.codigo} - ${producto.cuentaIngreso.nombre}`
                      : '-'}
                  </td>
                  <td>
                    <span className={`badge ${producto.activo ? 'badge-active' : 'badge-inactive'}`}>
                      {producto.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="actions">
                    {producto.activo ? (
                      <>
                        <button
                          className="btn-edit"
                          onClick={() => handleOpenModal(producto)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(producto.id)}
                          title="Desactivar"
                        >
                          ❌
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn-reactivate"
                        onClick={() => handleReactivate(producto.id)}
                        title="Reactivar"
                      >
                        ✅
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProducto ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button className="btn-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="codigo">
                  Código <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  required
                  disabled={!!editingProducto}
                  placeholder="Ej: PROD001"
                />
              </div>

              <div className="form-group">
                <label htmlFor="nombre">
                  Nombre <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  placeholder="Ej: Ganado Bovino"
                />
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={3}
                  placeholder="Descripción del producto..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="unidadMedida">
                  Unidad de Medida <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="unidadMedida"
                  value={formData.unidadMedida}
                  onChange={(e) => setFormData({ ...formData, unidadMedida: e.target.value })}
                  required
                  placeholder="Ej: kg, unidades, litros"
                />
              </div>

              <div className="form-group">
                <label htmlFor="precioCompra">
                  Precio de Compra <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="precioCompra"
                  value={formData.precioCompra}
                  onChange={(e) => setFormData({ ...formData, precioCompra: parseFloat(e.target.value) })}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label htmlFor="precioVenta">
                  Precio de Venta <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="precioVenta"
                  value={formData.precioVenta}
                  onChange={(e) => setFormData({ ...formData, precioVenta: parseFloat(e.target.value) })}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #e0e0e0' }} />
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#2c3e50' }}>
                Cuentas Contables
              </h3>

              <CuentaContableSelect
                label="Cuenta de Inventario (Activo)"
                tipo="ACTIVO"
                value={formData.cuentaInventarioId}
                onChange={(value) => setFormData({ ...formData, cuentaInventarioId: value })}
                required
              />

              <CuentaContableSelect
                label="Cuenta de Costo (Egreso)"
                tipo="EGRESO"
                value={formData.cuentaCostoId}
                onChange={(value) => setFormData({ ...formData, cuentaCostoId: value })}
                required
              />

              <CuentaContableSelect
                label="Cuenta de Ingreso"
                tipo="INGRESO"
                value={formData.cuentaIngresoId}
                onChange={(value) => setFormData({ ...formData, cuentaIngresoId: value })}
                required
              />

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingProducto ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
