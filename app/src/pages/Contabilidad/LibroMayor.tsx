import { useState, useEffect } from 'react';
import contabilidadService from '../../services/contabilidad.service';
import type { LibroMayor as LibroMayorType, PlanCuentas } from '../../types/contabilidad';

const LibroMayor = () => {
  const [mayor, setMayor] = useState<LibroMayorType | null>(null);
  const [cuentas, setCuentas] = useState<PlanCuentas[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cuentaId, setCuentaId] = useState('');
  const [fechaDesde, setFechaDesde] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [fechaHasta, setFechaHasta] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadCuentas();
  }, []);

  useEffect(() => {
    if (cuentaId) {
      loadMayor();
    }
  }, [cuentaId, fechaDesde, fechaHasta]);

  const loadCuentas = async () => {
    try {
      const data = await contabilidadService.planCuentas.getAll({
        aceptaMovimiento: true,
        activo: true
      });
      setCuentas(data.cuentas);
    } catch (err: any) {
      console.error('Error loading cuentas:', err);
    }
  };

  const loadMayor = async () => {
    if (!cuentaId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await contabilidadService.reportes.getMayor({
        cuentaId,
        fechaDesde: new Date(fechaDesde).toISOString(),
        fechaHasta: new Date(fechaHasta).toISOString(),
      });
      setMayor(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar el libro mayor');
      console.error('Error loading mayor:', err);
    } finally {
      setLoading(false);
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

  return (
    <div className="page-container">
      <div className="page-header no-print">
        <div>
          <h1 className="page-title">Libro Mayor</h1>
          {mayor && (
            <p className="page-subtitle">
              {mayor.cuenta.codigo} - {mayor.cuenta.nombre}
            </p>
          )}
        </div>
        <div className="page-actions">
          {mayor && (
            <>
              <button className="btn btn-secondary" onClick={() => window.print()}>
                🖨️ Imprimir
              </button>
              <button className="btn btn-primary" onClick={loadMayor}>
                🔄 Actualizar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-section no-print">
        <div className="filters-row">
          <div className="filter-group" style={{gridColumn: 'span 2'}}>
            <label>Cuenta:</label>
            <select
              value={cuentaId}
              onChange={(e) => setCuentaId(e.target.value)}
              className="filter-select"
            >
              <option value="">Seleccione una cuenta...</option>
              {cuentas.map((cuenta) => (
                <option key={cuenta.id} value={cuenta.id}>
                  {cuenta.codigo} - {cuenta.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Desde:</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label>Hasta:</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="filter-input"
            />
          </div>
        </div>
      </div>

      {/* Estado */}
      {!cuentaId && !loading && (
        <div className="empty-state">
          <p>Seleccione una cuenta para ver su libro mayor</p>
        </div>
      )}

      {loading && (
        <div className="loading">Cargando libro mayor...</div>
      )}

      {error && (
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={loadMayor} className="btn btn-primary">Reintentar</button>
        </div>
      )}

      {/* Reporte */}
      {mayor && !loading && (
        <>
          {/* Info de la cuenta */}
          <div className="card mb-3">
            <div className="card-body">
              <div className="grid grid-4">
                <div>
                  <div className="text-sm text-muted">Código</div>
                  <div className="font-semibold">{mayor.cuenta.codigo}</div>
                </div>
                <div>
                  <div className="text-sm text-muted">Nombre</div>
                  <div className="font-semibold">{mayor.cuenta.nombre}</div>
                </div>
                <div>
                  <div className="text-sm text-muted">Tipo</div>
                  <div>
                    <span className={`badge badge-${mayor.cuenta.tipo.toLowerCase()}`}>
                      {mayor.cuenta.tipo}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted">Naturaleza</div>
                  <div className="font-semibold">{mayor.cuenta.naturaleza}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Movimientos */}
          <div className="card">
            {mayor.movimientos.length === 0 ? (
              <div className="card-body">
                <div className="empty-state">
                  <p>No hay movimientos en el período seleccionado</p>
                </div>
              </div>
            ) : (
              <>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Asiento</th>
                        <th>Descripción</th>
                        <th>Doc. Ref.</th>
                        <th>Centro Costo</th>
                        <th className="text-right">Debe</th>
                        <th className="text-right">Haber</th>
                        <th className="text-right">Saldo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mayor.movimientos.map((mov, index) => (
                        <tr key={index}>
                          <td className="text-sm">{formatDate(mov.fecha)}</td>
                          <td className="text-sm font-semibold">#{mov.asientoNumero}</td>
                          <td>{mov.descripcion}</td>
                          <td className="text-sm text-muted">{mov.documentoRef || '-'}</td>
                          <td className="text-sm">
                            {mov.centroCosto ? (
                              <span className="badge" style={{fontSize: '0.7rem'}}>
                                {mov.centroCosto.codigo}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="text-right">
                            {mov.debe > 0 ? formatCurrency(mov.debe) : '-'}
                          </td>
                          <td className="text-right">
                            {mov.haber > 0 ? formatCurrency(mov.haber) : '-'}
                          </td>
                          <td className="text-right font-semibold">
                            {formatCurrency(mov.saldo)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot style={{background: '#1f2937', color: 'white', fontWeight: 700}}>
                      <tr>
                        <td colSpan={5} style={{padding: '1rem'}}>TOTALES</td>
                        <td className="text-right" style={{padding: '1rem'}}>
                          {formatCurrency(mayor.totales.debe)}
                        </td>
                        <td className="text-right" style={{padding: '1rem'}}>
                          {formatCurrency(mayor.totales.haber)}
                        </td>
                        <td className="text-right" style={{padding: '1rem'}}>
                          {formatCurrency(mayor.totales.saldoFinal)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Resumen */}
                <div className="card-footer">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted">
                      {mayor.movimientos.length} movimientos en el período
                    </span>
                    <span className="text-sm">
                      Saldo final: <strong>{formatCurrency(mayor.totales.saldoFinal)}</strong>
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Print Footer */}
      <div className="print-only" style={{textAlign: 'center', padding: '2rem 0', color: '#6b7280', fontSize: '0.875rem'}}>
        <p style={{margin: '0.25rem 0'}}>Generado el {new Date().toLocaleString('es-PY')}</p>
        <p style={{margin: '0.25rem 0'}}>Sistema de Contabilidad - Agribusiness ERP</p>
      </div>
    </div>
  );
};

export default LibroMayor;
