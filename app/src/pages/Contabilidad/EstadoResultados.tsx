import { useState, useEffect } from 'react';
import contabilidadService from '../../services/contabilidad.service';
import type { EstadoResultados as EstadoResultadosType } from '../../types/contabilidad';

const EstadoResultados = () => {
  const [estado, setEstado] = useState<EstadoResultadosType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fechaDesde, setFechaDesde] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [fechaHasta, setFechaHasta] = useState(new Date().toISOString().split('T')[0]);
  const [nivelFilter, setNivelFilter] = useState<number>(4);

  useEffect(() => {
    loadEstadoResultados();
  }, [fechaDesde, fechaHasta, nivelFilter]);

  const loadEstadoResultados = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await contabilidadService.reportes.getEstadoResultados({
        fechaDesde: new Date(fechaDesde).toISOString(),
        fechaHasta: new Date(fechaHasta).toISOString(),
        nivel: nivelFilter,
      });
      setEstado(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar estado de resultados');
      console.error('Error loading estado resultados:', err);
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
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Generando Estado de Resultados...</div>
      </div>
    );
  }

  if (error || !estado) {
    return (
      <div className="page-container">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error || 'No se pudo cargar el estado de resultados'}</p>
          <button onClick={loadEstadoResultados} className="btn btn-primary">Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header no-print">
        <div>
          <h1 className="page-title">Estado de Resultados</h1>
          <p className="page-subtitle">
            {formatDate(estado.fechaDesde)} - {formatDate(estado.fechaHasta)}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => window.print()}>
            🖨️ Imprimir
          </button>
          <button className="btn btn-primary" onClick={loadEstadoResultados}>
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-section no-print">
        <div className="filters-row">
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
          <div className="filter-group">
            <label>Nivel de detalle:</label>
            <select
              value={nivelFilter}
              onChange={(e) => setNivelFilter(parseInt(e.target.value))}
              className="filter-select"
            >
              <option value="1">Nivel 1</option>
              <option value="2">Nivel 2</option>
              <option value="3">Nivel 3</option>
              <option value="4">Nivel 4 - Detallado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-3 mb-3">
        <div className="metric-card">
          <div className="metric-label">Ingresos Totales</div>
          <div className="metric-value positive">{formatCurrency(estado.totalIngresos)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Gastos Totales</div>
          <div className="metric-value negative">{formatCurrency(estado.totalGastos)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">{estado.utilidadNeta >= 0 ? 'UTILIDAD' : 'PÉRDIDA'}</div>
          <div className={`metric-value ${estado.utilidadNeta >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(estado.utilidadNeta)}
          </div>
        </div>
      </div>

      {/* Reporte */}
      <div className="card">
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Cuenta</th>
                <th className="text-right">Debe</th>
                <th className="text-right">Haber</th>
                <th className="text-right">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {/* INGRESOS */}
              <tr className="nivel-1">
                <td colSpan={5} style={{background: '#e0f2fe', fontWeight: 700, padding: '1rem'}}>
                  INGRESOS
                </td>
              </tr>
              {estado.ingresos.map((cuenta) => (
                <tr key={cuenta.id} className={`nivel-${cuenta.nivel}`}>
                  <td className="text-sm" style={{fontFamily: 'monospace', color: '#3b82f6'}}>{cuenta.codigo}</td>
                  <td>{cuenta.nombre}</td>
                  <td className="text-right">{formatCurrency(cuenta.debe)}</td>
                  <td className="text-right">{formatCurrency(cuenta.haber)}</td>
                  <td className="text-right font-semibold">{formatCurrency(cuenta.total)}</td>
                </tr>
              ))}
              <tr style={{background: '#f3f4f6', fontWeight: 700}}>
                <td colSpan={4}>Total Ingresos</td>
                <td className="text-right" style={{color: '#10b981'}}>{formatCurrency(estado.totalIngresos)}</td>
              </tr>

              {/* GASTOS */}
              <tr className="nivel-1">
                <td colSpan={5} style={{background: '#fef3c7', fontWeight: 700, padding: '1rem', marginTop: '2rem'}}>
                  GASTOS
                </td>
              </tr>
              {estado.gastos.map((cuenta) => (
                <tr key={cuenta.id} className={`nivel-${cuenta.nivel}`}>
                  <td className="text-sm" style={{fontFamily: 'monospace', color: '#3b82f6'}}>{cuenta.codigo}</td>
                  <td>{cuenta.nombre}</td>
                  <td className="text-right">{formatCurrency(cuenta.debe)}</td>
                  <td className="text-right">{formatCurrency(cuenta.haber)}</td>
                  <td className="text-right font-semibold">{formatCurrency(cuenta.total)}</td>
                </tr>
              ))}
              <tr style={{background: '#f3f4f6', fontWeight: 700}}>
                <td colSpan={4}>Total Gastos</td>
                <td className="text-right" style={{color: '#ef4444'}}>{formatCurrency(estado.totalGastos)}</td>
              </tr>

              {/* RESULTADO */}
              <tr style={{background: '#1f2937', color: 'white', fontWeight: 700, fontSize: '1.1rem'}}>
                <td colSpan={4} style={{padding: '1.25rem'}}>
                  {estado.utilidadNeta >= 0 ? 'UTILIDAD NETA' : 'PÉRDIDA NETA'}
                </td>
                <td className="text-right" style={{padding: '1.25rem'}}>
                  {formatCurrency(estado.utilidadNeta)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Footer */}
      <div className="print-only" style={{textAlign: 'center', padding: '2rem 0', color: '#6b7280', fontSize: '0.875rem'}}>
        <p style={{margin: '0.25rem 0'}}>Generado el {new Date().toLocaleString('es-PY')}</p>
        <p style={{margin: '0.25rem 0'}}>Sistema de Contabilidad - Agribusiness ERP</p>
      </div>
    </div>
  );
};

export default EstadoResultados;
