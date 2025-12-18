import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import contabilidadService from '../../services/contabilidad.service';
import type { AsientoContable, TipoAsiento, EstadoAsiento } from '../../types/contabilidad';


const AsientosContables = () => {
  const [asientos, setAsientos] = useState<AsientoContable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [tipoFilter, setTipoFilter] = useState<TipoAsiento | ''>('');
  const [estadoFilter, setEstadoFilter] = useState<EstadoAsiento | ''>('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  useEffect(() => {
    loadAsientos();
  }, [currentPage, tipoFilter, estadoFilter, fechaDesde, fechaHasta]);

  const loadAsientos = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        limit: 20,
      };

      if (tipoFilter) params.tipo = tipoFilter;
      if (estadoFilter) params.estado = estadoFilter;
      if (fechaDesde) params.fechaDesde = new Date(fechaDesde).toISOString();
      if (fechaHasta) params.fechaHasta = new Date(fechaHasta).toISOString();

      const data = await contabilidadService.asientos.getAll(params);
      setAsientos(data.asientos);
      setCurrentPage(data.pagination.page);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar asientos');
      console.error('Error loading asientos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContabilizar = async (id: string) => {
    if (!confirm('¿Está seguro de contabilizar este asiento? Esta acción no se puede deshacer fácilmente.')) {
      return;
    }

    try {
      await contabilidadService.asientos.contabilizar(id);
      loadAsientos();
      alert('Asiento contabilizado exitosamente');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al contabilizar asiento');
    }
  };

  const handleAnular = async (id: string) => {
    const motivo = prompt('Ingrese el motivo de anulación:');
    if (!motivo) return;

    try {
      await contabilidadService.asientos.anular(id, motivo);
      loadAsientos();
      alert('Asiento anulado exitosamente');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al anular asiento');
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-PY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getEstadoBadgeClass = (estado: EstadoAsiento): string => {
    const classes: Record<EstadoAsiento, string> = {
      BORRADOR: 'badge-borrador',
      CONTABILIZADO: 'badge-contabilizado',
      ANULADO: 'badge-anulado',
    };
    return classes[estado] || '';
  };

  const getTipoBadgeClass = (tipo: TipoAsiento): string => {
    const classes: Record<TipoAsiento, string> = {
      DIARIO: 'badge-diario',
      AJUSTE: 'badge-ajuste',
      CIERRE: 'badge-cierre',
      APERTURA: 'badge-apertura',
    };
    return classes[tipo] || '';
  };

  if (loading && asientos.length === 0) {
    return (
      <div className="asientos-container">
        <div className="loading">Cargando asientos...</div>
      </div>
    );
  }

  return (
    <div className="asientos-container">
      <div className="page-header">
        <h1>Asientos Contables</h1>
        <div className="page-actions">
          <button className="btn-secondary" onClick={loadAsientos} disabled={loading}>
            🔄 {loading ? 'Cargando...' : 'Actualizar'}
          </button>
          <Link to="/app/contabilidad/asientos/nuevo" className="btn-primary">
            + Nuevo Asiento
          </Link>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Filtros */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="filter-group">
            <label>Tipo:</label>
            <select
              value={tipoFilter}
              onChange={(e) => {
                setTipoFilter(e.target.value as TipoAsiento | '');
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="">Todos</option>
              <option value="DIARIO">DIARIO</option>
              <option value="AJUSTE">AJUSTE</option>
              <option value="CIERRE">CIERRE</option>
              <option value="APERTURA">APERTURA</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Estado:</label>
            <select
              value={estadoFilter}
              onChange={(e) => {
                setEstadoFilter(e.target.value as EstadoAsiento | '');
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="">Todos</option>
              <option value="BORRADOR">BORRADOR</option>
              <option value="CONTABILIZADO">CONTABILIZADO</option>
              <option value="ANULADO">ANULADO</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Desde:</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => {
                setFechaDesde(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Hasta:</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => {
                setFechaHasta(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-input"
            />
          </div>
        </div>

        <div className="filters-summary">
          Mostrando {asientos.length} de {total} asientos
          {tipoFilter && ` · Tipo: ${tipoFilter}`}
          {estadoFilter && ` · Estado: ${estadoFilter}`}
        </div>
      </div>

      {/* Lista de asientos */}
      <div className="asientos-card">
        {asientos.length === 0 ? (
          <div className="empty-state">
            <p>No hay asientos contables registrados</p>
            <Link to="/app/contabilidad/asientos/nuevo" className="btn-primary">
              Crear primer asiento
            </Link>
          </div>
        ) : (
          <>
            <div className="asientos-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Fecha</th>
                    <th>Descripción</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Líneas</th>
                    <th className="text-right">Debe</th>
                    <th className="text-right">Haber</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {asientos.map((asiento) => (
                    <tr key={asiento.id} className={asiento.estado === 'ANULADO' ? 'row-anulado' : ''}>
                      <td className="text-bold">{asiento.numero}</td>
                      <td>{formatDate(asiento.fecha)}</td>
                      <td>
                        <div className="asiento-descripcion">
                          {asiento.descripcion}
                          {asiento.documentoRef && (
                            <span className="doc-ref">📄 {asiento.documentoRef}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getTipoBadgeClass(asiento.tipo)}`}>
                          {asiento.tipo}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getEstadoBadgeClass(asiento.estado)}`}>
                          {asiento.estado}
                        </span>
                      </td>
                      <td className="text-center">{asiento.lineas.length}</td>
                      <td className="text-right">{formatCurrency(asiento.totalDebe || 0)}</td>
                      <td className="text-right">{formatCurrency(asiento.totalHaber || 0)}</td>
                      <td>
                        <div className="action-buttons">
                          <Link
                            to={`/app/contabilidad/asientos/${asiento.id}`}
                            className="btn-icon"
                            title="Ver detalles"
                          >
                            👁️
                          </Link>
                          {asiento.estado === 'BORRADOR' && (
                            <>
                              <button
                                onClick={() => handleContabilizar(asiento.id)}
                                className="btn-icon btn-success"
                                title="Contabilizar"
                              >
                                ✓
                              </button>
                              <Link
                                to={`/app/contabilidad/asientos/${asiento.id}/editar`}
                                className="btn-icon"
                                title="Editar"
                              >
                                ✏️
                              </Link>
                            </>
                          )}
                          {asiento.estado === 'CONTABILIZADO' && (
                            <button
                              onClick={() => handleAnular(asiento.id)}
                              className="btn-icon btn-danger"
                              title="Anular"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary btn-sm"
                >
                  ← Anterior
                </button>
                <span className="pagination-info">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-secondary btn-sm"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AsientosContables;
