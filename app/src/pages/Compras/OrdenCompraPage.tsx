import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordenCompraService } from '../../services/api';
import { Alert, type AlertType } from '../../components';
import type { OrdenCompra } from '../../types/ordenCompra';

export function OrdenCompraPage() {
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: AlertType; message: string } | null>(null);
  const [estadoFiltro, setEstadoFiltro] = useState<string>('');

  useEffect(() => {
    loadOrdenes();
  }, [estadoFiltro]);

  const loadOrdenes = async () => {
    try {
      setLoading(true);
      const filters = estadoFiltro ? { estado: estadoFiltro as any } : undefined;
      const data = await ordenCompraService.getAll(filters);
      // Asegurar que data es un array
      setOrdenes(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error loading órdenes:', error);
      setOrdenes([]); // Set empty array on error
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

  const getEstadoBadgeClass = (estado: string) => {
    switch (estado) {
      case 'BORRADOR':
        return 'badge-draft';
      case 'APROBADA':
        return 'badge-approved';
      case 'PARCIAL':
        return 'badge-partial';
      case 'COMPLETADA':
        return 'badge-completed';
      case 'ANULADA':
        return 'badge-cancelled';
      default:
        return '';
    }
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="orden-compra-page">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="page-header">
        <h1>Órdenes de Compra</h1>
        <div className="header-actions">
          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos los estados</option>
            <option value="BORRADOR">Borrador</option>
            <option value="APROBADA">Aprobada</option>
            <option value="PARCIAL">Parcial</option>
            <option value="COMPLETADA">Completada</option>
            <option value="ANULADA">Anulada</option>
          </select>
          <button
            className="btn-primary"
            onClick={() => navigate('/compras/ordenes/nueva')}
          >
            + Nueva Orden de Compra
          </button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Número</th>
              <th>Fecha</th>
              <th>Proveedor</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Gravado 10%</th>
              <th style={{ textAlign: 'right' }}>IVA 10%</th>
              <th style={{ textAlign: 'right' }}>Gravado 5%</th>
              <th style={{ textAlign: 'right' }}>IVA 5%</th>
              <th style={{ textAlign: 'right' }}>Exentas</th>
              <th style={{ textAlign: 'right' }}>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.length === 0 ? (
              <tr>
                <td colSpan={11} className="no-data">
                  No hay órdenes de compra registradas
                </td>
              </tr>
            ) : (
              ordenes.map((orden) => (
                <tr
                  key={orden.id}
                  className={orden.estado === 'ANULADA' ? 'cancelled-row' : ''}
                >
                  <td>
                    <button
                      className="link-button"
                      onClick={() => navigate(`/compras/ordenes/${orden.id}`)}
                    >
                      {orden.numero}
                    </button>
                  </td>
                  <td>{formatDate(orden.fecha)}</td>
                  <td>{orden.proveedorNombre}</td>
                  <td>
                    <span className={`badge ${getEstadoBadgeClass(orden.estado)}`}>
                      {orden.estado}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {formatCurrency(orden.gravado10)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {formatCurrency(orden.iva10)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {formatCurrency(orden.gravado5)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {formatCurrency(orden.iva5)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {formatCurrency(orden.exentas)}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                    {formatCurrency(orden.totalOrden)}
                  </td>
                  <td className="actions">
                    {orden.estado === 'BORRADOR' && (
                      <>
                        <button
                          className="btn-edit"
                          onClick={() => navigate(`/compras/ordenes/${orden.id}/editar`)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-success"
                          onClick={() => handleAprobar(orden.id)}
                          title="Aprobar"
                        >
                          ✅
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleAnular(orden.id)}
                          title="Anular"
                        >
                          ❌
                        </button>
                      </>
                    )}
                    {orden.estado === 'APROBADA' && (
                      <button
                        className="btn-info"
                        onClick={() => navigate(`/compras/ordenes/${orden.id}`)}
                        title="Ver Detalle"
                      >
                        👁️
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
