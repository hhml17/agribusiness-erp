import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import contabilidadService from '../../services/contabilidad.service';
import type { BalanceGeneral, EstadoResultados, AsientoContable } from '../../types/contabilidad';
import '../../styles/contabilidad.css';


const DashboardContable = () => {
  const [balance, setBalance] = useState<BalanceGeneral | null>(null);
  const [estadoResultados, setEstadoResultados] = useState<EstadoResultados | null>(null);
  const [ultimosAsientos, setUltimosAsientos] = useState<AsientoContable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with real API calls when backend is ready
      // Datos de prueba (mock data)
      setTimeout(() => {
        const mockBalance: BalanceGeneral = {
          fecha: new Date().toISOString(),
          activos: {
            total: 150000000,
            cuentas: [
              { id: '1', codigo: '1.1.1', nombre: 'Caja', saldo: 5000000, tipo: 'ACTIVO' },
              { id: '2', codigo: '1.1.2', nombre: 'Banco Itaú', saldo: 25000000, tipo: 'ACTIVO' },
              { id: '3', codigo: '1.2.1', nombre: 'Clientes', saldo: 40000000, tipo: 'ACTIVO' },
              { id: '4', codigo: '1.3.1', nombre: 'Inventario Ganadero', saldo: 80000000, tipo: 'ACTIVO' },
            ]
          },
          pasivos: {
            total: 50000000,
            cuentas: [
              { id: '5', codigo: '2.1.1', nombre: 'Proveedores', saldo: 30000000, tipo: 'PASIVO' },
              { id: '6', codigo: '2.2.1', nombre: 'Préstamo Bancario', saldo: 20000000, tipo: 'PASIVO' },
            ]
          },
          patrimonio: {
            total: 100000000,
            resultadoEjercicio: 15000000,
            cuentas: [
              { id: '7', codigo: '3.1.1', nombre: 'Capital Social', saldo: 85000000, tipo: 'PATRIMONIO' },
            ]
          },
          totales: {
            activos: 150000000,
            pasivosYPatrimonio: 150000000
          }
        };

        const mockEstado: EstadoResultados = {
          periodo: {
            desde: new Date(new Date().getFullYear(), 0, 1).toISOString(),
            hasta: new Date().toISOString()
          },
          ingresos: {
            total: 80000000,
            cuentas: [
              { id: '8', codigo: '4.1.1', nombre: 'Venta de Ganado', saldo: 60000000, tipo: 'INGRESO' },
              { id: '9', codigo: '4.1.2', nombre: 'Venta de Productos Agrícolas', saldo: 20000000, tipo: 'INGRESO' },
            ]
          },
          gastos: {
            total: 65000000,
            cuentas: [
              { id: '10', codigo: '5.1.1', nombre: 'Costos Operativos', saldo: 40000000, tipo: 'GASTO' },
              { id: '11', codigo: '5.1.2', nombre: 'Gastos Administrativos', saldo: 15000000, tipo: 'GASTO' },
              { id: '12', codigo: '5.1.3', nombre: 'Gastos Financieros', saldo: 10000000, tipo: 'GASTO' },
            ]
          },
          resultado: {
            utilidadNeta: 15000000,
            tipo: 'UTILIDAD'
          }
        };

        const mockAsientos: AsientoContable[] = [
          {
            id: '1',
            numero: 1,
            fecha: new Date().toISOString(),
            descripcion: 'Venta de ganado - Lote 001',
            tipo: 'OPERACION',
            estado: 'CONFIRMADO',
            totalDebe: 15000000,
            totalHaber: 15000000,
            lineas: [],
            tenantId: '',
            creadoPor: '',
            fechaCreacion: new Date().toISOString()
          },
          {
            id: '2',
            numero: 2,
            fecha: new Date().toISOString(),
            descripcion: 'Pago a proveedores',
            tipo: 'OPERACION',
            estado: 'CONFIRMADO',
            totalDebe: 5000000,
            totalHaber: 5000000,
            lineas: [],
            tenantId: '',
            creadoPor: '',
            fechaCreacion: new Date().toISOString()
          },
        ];

        setBalance(mockBalance);
        setEstadoResultados(mockEstado);
        setUltimosAsientos(mockAsientos);
        setLoading(false);
      }, 500);

    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar el dashboard');
      console.error('Error loading dashboard:', err);
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

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Cargando dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={loadDashboardData} className="btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Contable</h1>
          <p className="page-subtitle">Resumen de tu situación financiera</p>
        </div>
        <div className="page-actions">
          <Link to="/contabilidad/asientos/nuevo" className="btn btn-primary">
            + Nuevo Asiento
          </Link>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-auto">
        <div className="metric-card">
          <div className="metric-label">Total Activos</div>
          <div className="metric-value positive">
            {balance ? formatCurrency(balance.totales.activos) : '-'}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Total Pasivos</div>
          <div className="metric-value">
            {balance ? formatCurrency(balance.pasivos.total) : '-'}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Patrimonio</div>
          <div className="metric-value">
            {balance ? formatCurrency(balance.patrimonio.total) : '-'}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Resultado del Ejercicio</div>
          <div className={`metric-value ${estadoResultados && estadoResultados.resultado.utilidadNeta >= 0 ? 'positive' : 'negative'}`}>
            {estadoResultados ? formatCurrency(estadoResultados.resultado.utilidadNeta) : '-'}
          </div>
        </div>
      </div>

      {/* Estado de Resultados resumido */}
      {estadoResultados && (
        <div className="card">
          <div className="card-header">
            <h2>Estado de Resultados</h2>
            <span className="text-muted">
              {formatDate(estadoResultados.periodo.desde)} - {formatDate(estadoResultados.periodo.hasta)}
            </span>
          </div>
          <div className="card-body">
            <div className="results-summary">
              <div className="result-row">
                <span className="result-label">Ingresos Totales</span>
                <span className="result-value positive">
                  {formatCurrency(estadoResultados.ingresos.total)}
                </span>
              </div>
              <div className="result-row">
                <span className="result-label">Gastos Totales</span>
                <span className="result-value negative">
                  ({formatCurrency(estadoResultados.gastos.total)})
                </span>
              </div>
              <div className="result-row total">
                <span className="result-label">Utilidad/Pérdida Neta</span>
                <span className={`result-value ${estadoResultados.resultado.utilidadNeta >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(estadoResultados.resultado.utilidadNeta)}
                </span>
              </div>
            </div>
            <div className="card-footer">
              <Link to="/contabilidad/estado-resultados">Ver Estado de Resultados completo →</Link>
            </div>
          </div>
        </div>
      )}

      {/* Balance resumido */}
      {balance && (
        <div className="card">
          <div className="card-header">
            <h2>Balance General</h2>
            <span className="text-muted">Al {formatDate(balance.fecha)}</span>
          </div>
          <div className="card-body">
            <div className="balance-summary">
              <div className="balance-column">
                <h3>Activos</h3>
                <div className="balance-total">
                  {formatCurrency(balance.activos.total)}
                </div>
                <div className="balance-items">
                  {balance.activos.cuentas.slice(0, 5).map((cuenta) => (
                    <div key={cuenta.id} className="balance-item">
                      <span className="item-label">{cuenta.nombre}</span>
                      <span className="item-value">{formatCurrency(cuenta.saldo)}</span>
                    </div>
                  ))}
                  {balance.activos.cuentas.length > 5 && (
                    <div className="balance-item more">
                      <span className="text-muted">
                        y {balance.activos.cuentas.length - 5} cuentas más...
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="balance-column">
                <h3>Pasivos y Patrimonio</h3>
                <div className="balance-total">
                  {formatCurrency(balance.totales.pasivosYPatrimonio)}
                </div>
                <div className="balance-items">
                  <div className="balance-section">
                    <h4>Pasivos</h4>
                    {balance.pasivos.cuentas.slice(0, 3).map((cuenta) => (
                      <div key={cuenta.id} className="balance-item">
                        <span className="item-label">{cuenta.nombre}</span>
                        <span className="item-value">{formatCurrency(cuenta.saldo)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="balance-section">
                    <h4>Patrimonio</h4>
                    {balance.patrimonio.cuentas.slice(0, 2).map((cuenta) => (
                      <div key={cuenta.id} className="balance-item">
                        <span className="item-label">{cuenta.nombre}</span>
                        <span className="item-value">{formatCurrency(cuenta.saldo)}</span>
                      </div>
                    ))}
                    <div className="balance-item">
                      <span className="item-label">Resultado del Ejercicio</span>
                      <span className="item-value">
                        {formatCurrency(balance.patrimonio.resultadoEjercicio)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <Link to="/contabilidad/balance">Ver Balance General completo →</Link>
            </div>
          </div>
        </div>
      )}

      {/* Últimos asientos */}
      <div className="card">
        <div className="card-header">
          <h2>Últimos Asientos</h2>
          <Link to="/contabilidad/asientos" className="btn-link">
            Ver todos →
          </Link>
        </div>
        <div className="card-body">
          {ultimosAsientos.length === 0 ? (
            <div className="empty-state">
              <p>No hay asientos contables registrados</p>
              <Link to="/contabilidad/asientos/nuevo" className="btn-primary">
                Crear primer asiento
              </Link>
            </div>
          ) : (
            <div className="asientos-list">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Fecha</th>
                    <th>Descripción</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th className="text-right">Debe</th>
                    <th className="text-right">Haber</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {ultimosAsientos.map((asiento) => (
                    <tr key={asiento.id}>
                      <td>{asiento.numero}</td>
                      <td>{formatDate(asiento.fecha)}</td>
                      <td>{asiento.descripcion}</td>
                      <td>
                        <span className={`badge badge-${asiento.tipo.toLowerCase()}`}>
                          {asiento.tipo}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${asiento.estado.toLowerCase()}`}>
                          {asiento.estado}
                        </span>
                      </td>
                      <td className="text-right">{formatCurrency(asiento.totalDebe || 0)}</td>
                      <td className="text-right">{formatCurrency(asiento.totalHaber || 0)}</td>
                      <td>
                        <Link
                          to={`/contabilidad/asientos/${asiento.id}`}
                          className="btn-link"
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="quick-actions">
        <h2>Accesos Rápidos</h2>
        <div className="actions-grid">
          <Link to="/contabilidad/plan-cuentas" className="action-card">
            <div className="action-icon">📊</div>
            <div className="action-title">Plan de Cuentas</div>
            <div className="action-description">Gestionar cuentas contables</div>
          </Link>

          <Link to="/contabilidad/asientos" className="action-card">
            <div className="action-icon">📝</div>
            <div className="action-title">Asientos</div>
            <div className="action-description">Registrar movimientos</div>
          </Link>

          <Link to="/contabilidad/balance" className="action-card">
            <div className="action-icon">💰</div>
            <div className="action-title">Balance General</div>
            <div className="action-description">Ver situación financiera</div>
          </Link>

          <Link to="/contabilidad/estado-resultados" className="action-card">
            <div className="action-icon">📈</div>
            <div className="action-title">Estado de Resultados</div>
            <div className="action-description">Ver utilidad/pérdida</div>
          </Link>

          <Link to="/contabilidad/mayor" className="action-card">
            <div className="action-icon">📚</div>
            <div className="action-title">Libro Mayor</div>
            <div className="action-description">Consultar movimientos</div>
          </Link>

          <Link to="/contabilidad/centros-costo" className="action-card">
            <div className="action-icon">🏢</div>
            <div className="action-title">Centros de Costo</div>
            <div className="action-description">Gestionar centros</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardContable;
