import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ordenCompraService, productoService, actoresService, centroCostoService, cotizacionService } from '../../services/api';
import { Alert, type AlertType } from '../../components';
import type { CreateOrdenCompraInput, CreateItemOrdenCompraInput, TotalesDNIT } from '../../types/ordenCompra';
import type { Producto } from '../../types/producto';
import type { Actor } from '../../types/actor';
import type { CentroCosto } from '../../types/centroCosto';
import { MONEDAS_DISPONIBLES, formatCurrency as formatMoneda, type CodigoMoneda } from '../../types/moneda';

export function OrdenCompraForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: AlertType; message: string } | null>(null);

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

  return (
    <div className="orden-compra-form">
      {alert && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      <div className="page-header">
        <h1>{isEditing ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}</h1>
        <button type="button" className="btn-secondary" onClick={() => navigate('/compras/ordenes')}>
          ← Volver
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ========== ENCABEZADO ========== */}
        <div className="form-section">
          <h3 className="form-section-title">📋 Información General</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="proveedorId">
                Proveedor <span className="required">*</span>
              </label>
              <select
                id="proveedorId"
                value={formData.proveedorId}
                onChange={(e) => setFormData({ ...formData, proveedorId: e.target.value })}
                required
              >
                <option value="">Seleccionar proveedor...</option>
                {proveedores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.codigo} - {p.nombre} ({p.ruc})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fecha">
                Fecha <span className="required">*</span>
              </label>
              <input
                type="date"
                id="fecha"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="moneda">
                Moneda <span className="required">*</span>
              </label>
              <select
                id="moneda"
                value={formData.moneda}
                onChange={(e) => handleMonedaChange(e.target.value as CodigoMoneda)}
                required
              >
                {MONEDAS_DISPONIBLES.filter(m => m.activa).map((moneda) => (
                  <option key={moneda.codigo} value={moneda.codigo}>
                    {moneda.codigo} - {moneda.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="cotizacion">
                Cotización a PYG <span className="required">*</span>
              </label>
              <input
                type="number"
                id="cotizacion"
                value={formData.cotizacion}
                onChange={(e) => setFormData({ ...formData, cotizacion: parseFloat(e.target.value) || 1 })}
                min="0"
                step="0.01"
                required
                disabled={formData.moneda === 'PYG'}
              />
              <small>
                {formData.moneda === 'PYG' ? 'Moneda base' : `1 ${formData.moneda} = ${formData.cotizacion} PYG`}
              </small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="descripcion">Descripción</label>
              <input
                type="text"
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción general de la orden"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="observaciones">Observaciones</label>
              <textarea
                id="observaciones"
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                rows={3}
                placeholder="Observaciones adicionales"
              />
            </div>
          </div>
        </div>

        {/* ========== AGREGAR ITEMS ========== */}
        <div className="form-section">
          <h3 className="form-section-title">📦 Agregar Item</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="producto">Producto (Opcional)</label>
              <select
                id="producto"
                value={itemEnEdicion.productoId || ''}
                onChange={(e) => handleProductoChange(e.target.value)}
              >
                <option value="">Seleccionar producto o escribir descripción...</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.codigo} - {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="descripcion">
                Descripción <span className="required">*</span>
              </label>
              <input
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

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cantidad">
                Cantidad <span className="required">*</span>
              </label>
              <input
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

            <div className="form-group">
              <label htmlFor="unidadMedida">
                Unidad de Medida <span className="required">*</span>
              </label>
              <select
                id="unidadMedida"
                value={itemEnEdicion.unidadMedida}
                onChange={(e) =>
                  setItemEnEdicion({ ...itemEnEdicion, unidadMedida: e.target.value })
                }
                required
              >
                <option value="UNIDAD">Unidad</option>
                <option value="KG">Kilogramos (KG)</option>
                <option value="L">Litros (L)</option>
                <option value="TON">Toneladas (TON)</option>
                <option value="M3">Metros Cúbicos (M3)</option>
                <option value="GLOBAL">Global</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="precioUnitario">
                Precio Unitario <span className="required">*</span>
              </label>
              <input
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

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="centroCostoId">
                Centro de Costo <span className="required">*</span>
              </label>
              <select
                id="centroCostoId"
                value={itemEnEdicion.centroCostoId}
                onChange={(e) =>
                  setItemEnEdicion({ ...itemEnEdicion, centroCostoId: e.target.value })
                }
                required
              >
                <option value="">Seleccionar centro de costo...</option>
                {centrosCosto.map((cc) => (
                  <option key={cc.id} value={cc.id}>
                    {cc.codigo} - {cc.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tasaIva">
                Tasa IVA <span className="required">*</span>
              </label>
              <select
                id="tasaIva"
                value={itemEnEdicion.tasaIva}
                onChange={(e) =>
                  setItemEnEdicion({ ...itemEnEdicion, tasaIva: parseFloat(e.target.value) })
                }
                required
              >
                <option value="10">10% (Gravado)</option>
                <option value="5">5% (Reducido)</option>
                <option value="0">0% (Exento)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Total Item</label>
              <input
                type="text"
                value={formatCurrency(
                  calcularTotalItem(
                    itemEnEdicion.cantidad,
                    itemEnEdicion.precioUnitario,
                    itemEnEdicion.tasaIva
                  )
                )}
                disabled
                style={{ fontWeight: 'bold' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            {editingIndex !== null && (
              <button type="button" className="btn-secondary" onClick={handleCancelarEdicion}>
                Cancelar
              </button>
            )}
            <button type="button" className="btn-primary" onClick={handleAgregarItem}>
              {editingIndex !== null ? '✏️ Actualizar Item' : '+ Agregar Item'}
            </button>
          </div>
        </div>

        {/* ========== LISTA DE ITEMS ========== */}
        {formData.items.length > 0 && (
          <div className="form-section">
            <h3 className="form-section-title">📋 Items de la Orden</h3>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Descripción</th>
                    <th>Cantidad</th>
                    <th>Unidad</th>
                    <th style={{ textAlign: 'right' }}>Precio Unit.</th>
                    <th>Centro Costo</th>
                    <th>IVA</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                    <th style={{ textAlign: 'right' }}>IVA Monto</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => {
                    const subtotal = calcularSubtotalItem(item.cantidad, item.precioUnitario);
                    const ivaMonto = calcularIvaItem(subtotal, item.tasaIva);
                    const total = subtotal + ivaMonto;
                    const centroCosto = centrosCosto.find((cc) => cc.id === item.centroCostoId);

                    return (
                      <tr key={index}>
                        <td>{item.lineaNumero}</td>
                        <td>{item.descripcion}</td>
                        <td>{item.cantidad}</td>
                        <td>{item.unidadMedida}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(item.precioUnitario)}</td>
                        <td>{centroCosto?.codigo}</td>
                        <td>{item.tasaIva}%</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(subtotal)}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(ivaMonto)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                          {formatCurrency(total)}
                        </td>
                        <td className="actions">
                          <button
                            type="button"
                            className="btn-edit"
                            onClick={() => handleEditarItem(index)}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="btn-delete"
                            onClick={() => handleEliminarItem(index)}
                            title="Eliminar"
                          >
                            ❌
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========== TOTALES DNIT ========== */}
        {formData.items.length > 0 && (
          <div className="form-section">
            <h3 className="form-section-title">💰 Totales en {formData.moneda}</h3>

            <div className="totales-grid">
              <div className="total-item">
                <label>Gravado 10%:</label>
                <span>{formatMoneda(totales.gravado10, formData.moneda)}</span>
              </div>
              <div className="total-item">
                <label>IVA 10%:</label>
                <span>{formatMoneda(totales.iva10, formData.moneda)}</span>
              </div>
              <div className="total-item">
                <label>Gravado 5%:</label>
                <span>{formatMoneda(totales.gravado5, formData.moneda)}</span>
              </div>
              <div className="total-item">
                <label>IVA 5%:</label>
                <span>{formatMoneda(totales.iva5, formData.moneda)}</span>
              </div>
              <div className="total-item">
                <label>Exentas:</label>
                <span>{formatMoneda(totales.exentas, formData.moneda)}</span>
              </div>
              <div className="total-item total-general">
                <label>TOTAL {formData.moneda}:</label>
                <span>{formatMoneda(totales.totalGeneral, formData.moneda)}</span>
              </div>
            </div>

            {formData.moneda !== 'PYG' && (
              <>
                <h3 className="form-section-title" style={{ marginTop: '1.5rem' }}>
                  💱 Totales Convertidos a PYG (Cotización: {formData.cotizacion})
                </h3>

                <div className="totales-grid">
                  <div className="total-item">
                    <label>Gravado 10%:</label>
                    <span>{formatMoneda(totalesBase.gravado10, 'PYG')}</span>
                  </div>
                  <div className="total-item">
                    <label>IVA 10%:</label>
                    <span>{formatMoneda(totalesBase.iva10, 'PYG')}</span>
                  </div>
                  <div className="total-item">
                    <label>Gravado 5%:</label>
                    <span>{formatMoneda(totalesBase.gravado5, 'PYG')}</span>
                  </div>
                  <div className="total-item">
                    <label>IVA 5%:</label>
                    <span>{formatMoneda(totalesBase.iva5, 'PYG')}</span>
                  </div>
                  <div className="total-item">
                    <label>Exentas:</label>
                    <span>{formatMoneda(totalesBase.exentas, 'PYG')}</span>
                  </div>
                  <div className="total-item total-general">
                    <label>TOTAL PYG:</label>
                    <span>{formatMoneda(totalesBase.totalGeneral, 'PYG')}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ========== ACCIONES ========== */}
        <div className="modal-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/compras/ordenes')}
            disabled={loading}
          >
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={loading || formData.items.length === 0}>
            {loading ? 'Guardando...' : 'Guardar Orden de Compra'}
          </button>
        </div>
      </form>
    </div>
  );
}
