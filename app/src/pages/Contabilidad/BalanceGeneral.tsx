import { useState, useEffect } from 'react';
import contabilidadService from '../../services/contabilidad.service';
import type { BalanceGeneral as BalanceGeneralType } from '../../types/contabilidad';


const BalanceGeneral = () => {
  const [balance, setBalance] = useState<BalanceGeneralType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fechaHasta, setFechaHasta] = useState(new Date().toISOString().split('T')[0]);
  const [nivelFilter, setNivelFilter] = useState<number>(4);

  useEffect(() => {
    loadBalance();
  }, [fechaHasta, nivelFilter]);

  const loadBalance = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        fechaHasta: new Date(fechaHasta).toISOString(),
        nivel: nivelFilter,
      };

      const data = await contabilidadService.reportes.getBalance(params);
      setBalance(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar el balance');
      console.error('Error loading balance:', err);
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

  const handleExport = () => {
    alert('Exportar a Excel - Próximamente');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="balance-container">
        <div className="loading">Generando Balance General...</div>
      </div>
    );
  }

  if (error || !balance) {
    return (
      <div className="balance-container">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error || 'No se pudo cargar el balance'}</p>
          <button onClick={loadBalance} className="btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="balance-container">
      <div className="page-header no-print">
        <div className="header-info">
          <h1>Balance General</h1>
          <p className="header-subtitle">Al {formatDate(balance.fecha)}</p>
        </div>
        <div className="page-actions">
          <button className="btn-secondary" onClick={handlePrint}>
            🖨️ Imprimir
          </button>
          <button className="btn-secondary" onClick={handleExport}>
            📥 Exportar
          </button>
          <button className="btn-primary" onClick={loadBalance}>
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section no-print">
        <div className="filters-row">
          <div className="filter-group">
            <label>Fecha hasta:</label>
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
              <option value="1">Nivel 1 - Solo totales</option>
              <option value="2">Nivel 2</option>
              <option value="3">Nivel 3</option>
              <option value="4">Nivel 4 - Detallado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Balance Summary */}
      <div className="balance-summary-cards">
        <div className="summary-card positive">
          <div className="summary-label">Total Activos</div>
          <div className="summary-value">{formatCurrency(balance.totalActivos)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Total Pasivos + Patrimonio</div>
          <div className="summary-value">{formatCurrency(balance.totalPasivos + balance.totalPatrimonio)}</div>
        </div>
        <div className={`summary-card ${Math.abs(balance.totalActivos - (balance.totalPasivos + balance.totalPatrimonio)) < 0.01 ? 'success' : 'danger'}`}>
          <div className="summary-label">Diferencia</div>
          <div className="summary-value">{formatCurrency(balance.totalActivos - (balance.totalPasivos + balance.totalPatrimonio))}</div>
          <div className="summary-status">
            {Math.abs(balance.totalActivos - (balance.totalPasivos + balance.totalPatrimonio)) < 0.01 ? '✓ Balanceado' : '⚠️ No balanceado'}
          </div>
        </div>
      </div>

      {/* Main Balance Report */}
      <div className="balance-report">
        <div className="balance-columns">
          {/* ACTIVOS */}
          <div className="balance-column">
            <div className="column-header">
              <h2>ACTIVOS</h2>
            </div>

            <table className="balance-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Cuenta</th>
                  <th className="text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {balance.activos.map((cuenta) => (
                  <tr key={cuenta.id} className={`nivel-${cuenta.nivel}`}>
                    <td className="cuenta-codigo">{cuenta.codigo}</td>
                    <td className="cuenta-nombre">{cuenta.nombre}</td>
                    <td className="text-right">{formatCurrency(cuenta.saldo)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td colSpan={2}>TOTAL ACTIVOS</td>
                  <td className="text-right">{formatCurrency(balance.totalActivos)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* PASIVOS Y PATRIMONIO */}
          <div className="balance-column">
            <div className="column-header">
              <h2>PASIVOS Y PATRIMONIO</h2>
            </div>

            <table className="balance-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Cuenta</th>
                  <th className="text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {/* PASIVOS */}
                <tr className="section-header">
                  <td colSpan={3}>PASIVOS</td>
                </tr>
                {balance.pasivos.map((cuenta) => (
                  <tr key={cuenta.id} className={`nivel-${cuenta.nivel}`}>
                    <td className="cuenta-codigo">{cuenta.codigo}</td>
                    <td className="cuenta-nombre">{cuenta.nombre}</td>
                    <td className="text-right">{formatCurrency(cuenta.saldo)}</td>
                  </tr>
                ))}
                <tr className="subtotal-row">
                  <td colSpan={2}>Total Pasivos</td>
                  <td className="text-right">{formatCurrency(balance.totalPasivos)}</td>
                </tr>

                {/* PATRIMONIO */}
                <tr className="section-header">
                  <td colSpan={3}>PATRIMONIO</td>
                </tr>
                {balance.patrimonio.map((cuenta) => (
                  <tr key={cuenta.id} className={`nivel-${cuenta.nivel}`}>
                    <td className="cuenta-codigo">{cuenta.codigo}</td>
                    <td className="cuenta-nombre">{cuenta.nombre}</td>
                    <td className="text-right">{formatCurrency(cuenta.saldo)}</td>
                  </tr>
                ))}
                <tr className="subtotal-row">
                  <td colSpan={2}>Total Patrimonio</td>
                  <td className="text-right">{formatCurrency(balance.totalPatrimonio)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td colSpan={2}>TOTAL PASIVOS + PATRIMONIO</td>
                  <td className="text-right">{formatCurrency(balance.totalPasivos + balance.totalPatrimonio)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Print Footer */}
      <div className="print-only print-footer">
        <p>Generado el {new Date().toLocaleString('es-PY')}</p>
        <p>Sistema de Contabilidad - Agribusiness ERP</p>
      </div>
    </div>
  );
};

export default BalanceGeneral;
