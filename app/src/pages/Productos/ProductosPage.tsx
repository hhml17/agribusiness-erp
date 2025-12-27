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
              <th>Tipo</th>
              <th>Unidad Compra</th>
              <th>IVA</th>
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
                  <td>{producto.tipoArticulo}</td>
                  <td>{producto.unidadCompra}</td>
                  <td>{producto.tasaIva}%</td>
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
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProducto ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button className="btn-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* ========== SECCIÓN 1: IDENTIFICACIÓN ========== */}
              <h3 className="form-section-title">📋 Identificación</h3>

              <div className="form-row">
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
                    placeholder="Ej: FERT001"
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
                    placeholder="Ej: Fertilizante NPK 50kg"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="categoria">Categoría</label>
                  <input
                    type="text"
                    id="categoria"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    placeholder="Ej: Fertilizantes, Agroquímicos, Alimentos"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="descripcion">Descripción</label>
                  <input
                    type="text"
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Descripción breve del producto"
                  />
                </div>
              </div>

              {/* ========== SECCIÓN 2: DATOS DNIT ========== */}
              <h3 className="form-section-title">📊 Datos DNIT Paraguay</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="tipoArticulo">
                    Tipo de Artículo <span className="required">*</span>
                  </label>
                  <select
                    id="tipoArticulo"
                    value={formData.tipoArticulo}
                    onChange={(e) => setFormData({ ...formData, tipoArticulo: e.target.value })}
                    required
                  >
                    <option value="INSUMO">Insumo</option>
                    <option value="ACTIVO_FIJO">Activo Fijo</option>
                    <option value="ANIMAL">Animal</option>
                    <option value="GASTO_DIRECTO">Gasto Directo</option>
                    <option value="SERVICIO">Servicio</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="tasaIva">
                    Tasa de IVA <span className="required">*</span>
                  </label>
                  <select
                    id="tasaIva"
                    value={formData.tasaIva}
                    onChange={(e) => setFormData({ ...formData, tasaIva: parseFloat(e.target.value) })}
                    required
                  >
                    <option value="10">10% (Gravado)</option>
                    <option value="5">5% (Reducido)</option>
                    <option value="0">0% (Exento)</option>
                  </select>
                </div>
              </div>

              {/* ========== SECCIÓN 3: UNIDADES DE MEDIDA ========== */}
              <h3 className="form-section-title">📏 Unidades de Medida</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="unidadCompra">
                    Unidad de Compra <span className="required">*</span>
                  </label>
                  <select
                    id="unidadCompra"
                    value={formData.unidadCompra}
                    onChange={(e) => setFormData({ ...formData, unidadCompra: e.target.value })}
                    required
                  >
                    <option value="GLOBAL">Global</option>
                    <option value="TON">Toneladas (TON)</option>
                    <option value="M3">Metros Cúbicos (M3)</option>
                    <option value="UNIDAD">Unidad</option>
                    <option value="KG">Kilogramos (KG)</option>
                    <option value="L">Litros (L)</option>
                  </select>
                  <small>Unidad usada en facturación y compras</small>
                </div>

                <div className="form-group">
                  <label htmlFor="unidadControl">Unidad de Control (Stock)</label>
                  <select
                    id="unidadControl"
                    value={formData.unidadControl}
                    onChange={(e) => setFormData({ ...formData, unidadControl: e.target.value })}
                  >
                    <option value="">Sin control específico</option>
                    <option value="L">Litros (L)</option>
                    <option value="KG">Kilogramos (KG)</option>
                    <option value="CABEZA">Cabezas (Ganado)</option>
                    <option value="UNIDAD">Unidades</option>
                  </select>
                  <small>Unidad usada para control de inventario</small>
                </div>

                <div className="form-group">
                  <label htmlFor="factorConversion">Factor de Conversión</label>
                  <input
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
                  <small>1 Unidad Compra = X Unidades Control</small>
                </div>
              </div>

              {/* ========== SECCIÓN 4: CONTROL DE INVENTARIO ========== */}
              <h3 className="form-section-title">📦 Control de Inventario</h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="checkbox-label-block">
                    <input
                      type="checkbox"
                      checked={formData.controlaStock}
                      onChange={(e) => setFormData({ ...formData, controlaStock: e.target.checked })}
                    />
                    Controla Stock
                  </label>
                  <small>Activar si este producto requiere control de inventario</small>
                </div>

                {formData.controlaStock && (
                  <>
                    <div className="form-group">
                      <label htmlFor="metodoValuacion">Método de Valuación</label>
                      <select
                        id="metodoValuacion"
                        value={formData.metodoValuacion}
                        onChange={(e) => setFormData({ ...formData, metodoValuacion: e.target.value })}
                      >
                        <option value="PROMEDIO">Promedio Ponderado</option>
                        <option value="FIFO">FIFO (Primero en Entrar, Primero en Salir)</option>
                        <option value="IDENTIFICADO">Identificado (Ganado)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="stockMinimo">Stock Mínimo</label>
                      <input
                        type="number"
                        id="stockMinimo"
                        value={formData.stockMinimo}
                        onChange={(e) => setFormData({ ...formData, stockMinimo: parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* ========== SECCIÓN 5: CARACTERÍSTICAS ESPECIALES ========== */}
              <h3 className="form-section-title">🌾 Características Especiales</h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="checkbox-label-block">
                    <input
                      type="checkbox"
                      checked={formData.esAnimal}
                      onChange={(e) => setFormData({
                        ...formData,
                        esAnimal: e.target.checked,
                        especieAnimal: e.target.checked ? formData.especieAnimal : ''
                      })}
                    />
                    Es Animal (Ganadería)
                  </label>
                </div>

                {formData.esAnimal && (
                  <div className="form-group">
                    <label htmlFor="especieAnimal">Especie Animal</label>
                    <select
                      id="especieAnimal"
                      value={formData.especieAnimal}
                      onChange={(e) => setFormData({ ...formData, especieAnimal: e.target.value })}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="BOVINO">Bovino</option>
                      <option value="EQUINO">Equino</option>
                      <option value="OVINO">Ovino</option>
                      <option value="PORCINO">Porcino</option>
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label className="checkbox-label-block">
                    <input
                      type="checkbox"
                      checked={formData.esInsumoAgricola}
                      onChange={(e) => setFormData({
                        ...formData,
                        esInsumoAgricola: e.target.checked,
                        categoriaAgricola: e.target.checked ? formData.categoriaAgricola : ''
                      })}
                    />
                    Es Insumo Agrícola
                  </label>
                </div>

                {formData.esInsumoAgricola && (
                  <div className="form-group">
                    <label htmlFor="categoriaAgricola">Categoría Agrícola</label>
                    <select
                      id="categoriaAgricola"
                      value={formData.categoriaAgricola}
                      onChange={(e) => setFormData({ ...formData, categoriaAgricola: e.target.value })}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="SEMILLA">Semilla</option>
                      <option value="FERTILIZANTE">Fertilizante</option>
                      <option value="AGROQUIMICO">Agroquímico</option>
                      <option value="HERBICIDA">Herbicida</option>
                    </select>
                  </div>
                )}
              </div>

              {/* ========== SECCIÓN 6: CUENTAS CONTABLES ========== */}
              <h3 className="form-section-title">💼 Cuentas Contables</h3>

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
