import { useState, useEffect } from 'react';
import contabilidadService from '../../services/contabilidad.service';
import type { PlanCuentas as PlanCuentasType, TipoCuenta } from '../../types/contabilidad';


const PlanCuentas = () => {
  const [cuentas, setCuentas] = useState<PlanCuentasType[]>([]);
  const [filteredCuentas, setFilteredCuentas] = useState<PlanCuentasType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [tipoFilter, setTipoFilter] = useState<TipoCuenta | ''>('');
  const [nivelFilter, setNivelFilter] = useState<number | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [showOnlyMovement, setShowOnlyMovement] = useState(false);

  useEffect(() => {
    loadCuentas();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [cuentas, tipoFilter, nivelFilter, searchTerm, showOnlyActive, showOnlyMovement]);

  const loadCuentas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contabilidadService.planCuentas.getAll({ includeHijas: true });
      setCuentas(data.cuentas);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar el plan de cuentas');
      console.error('Error loading plan de cuentas:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...cuentas];

    // Filtro por tipo
    if (tipoFilter) {
      filtered = filtered.filter(c => c.tipo === tipoFilter);
    }

    // Filtro por nivel
    if (nivelFilter) {
      filtered = filtered.filter(c => c.nivel === nivelFilter);
    }

    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.codigo.toLowerCase().includes(term) ||
        c.nombre.toLowerCase().includes(term) ||
        c.descripcion?.toLowerCase().includes(term)
      );
    }

    // Filtro por activo
    if (showOnlyActive) {
      filtered = filtered.filter(c => c.activo);
    }

    // Filtro por acepta movimiento
    if (showOnlyMovement) {
      filtered = filtered.filter(c => c.aceptaMovimiento);
    }

    setFilteredCuentas(filtered);
  };

  const getTipoCuentaColor = (tipo: TipoCuenta): string => {
    const colors: Record<TipoCuenta, string> = {
      ACTIVO: '#10b981',
      PASIVO: '#ef4444',
      PATRIMONIO: '#8b5cf6',
      INGRESO: '#3b82f6',
      GASTO: '#f59e0b',
    };
    return colors[tipo] || '#6b7280';
  };

  const renderCuentaTree = (cuenta: PlanCuentasType) => {
    const paddingLeft = `${cuenta.nivel * 1.5}rem`;
    const hasChildren = cuenta.cuentasHijas && cuenta.cuentasHijas.length > 0;

    return (
      <div key={cuenta.id} className="cuenta-tree-item">
        <div
          className={`cuenta-row nivel-${cuenta.nivel} ${!cuenta.activo ? 'inactive' : ''}`}
          style={{ paddingLeft }}
        >
          <div className="cuenta-info">
            <div className="cuenta-codigo-nombre">
              {hasChildren && <span className="expand-icon">▼</span>}
              <span className="cuenta-codigo">{cuenta.codigo}</span>
              <span className="cuenta-nombre">{cuenta.nombre}</span>
            </div>
            {cuenta.descripcion && (
              <div className="cuenta-descripcion">{cuenta.descripcion}</div>
            )}
          </div>

          <div className="cuenta-badges">
            <span
              className="badge badge-tipo"
              style={{ background: getTipoCuentaColor(cuenta.tipo) + '20', color: getTipoCuentaColor(cuenta.tipo) }}
            >
              {cuenta.tipo}
            </span>
            <span className="badge badge-naturaleza">
              {cuenta.naturaleza}
            </span>
            {cuenta.centroCosto && (
              <span className="badge badge-centro">
                {cuenta.centroCosto.codigo}
              </span>
            )}
            {cuenta.aceptaMovimiento && (
              <span className="badge badge-movimiento">✓ Movimiento</span>
            )}
          </div>

          <div className="cuenta-actions">
            <button
              className="btn-icon"
              title="Ver detalles"
              onClick={() => alert(`Ver detalles de: ${cuenta.nombre}`)}
            >
              👁️
            </button>
            <button
              className="btn-icon"
              title="Editar"
              onClick={() => alert(`Editar: ${cuenta.nombre}`)}
            >
              ✏️
            </button>
            <button
              className="btn-icon"
              title="Ver Mayor"
              onClick={() => alert(`Ver mayor de: ${cuenta.nombre}`)}
            >
              📚
            </button>
          </div>
        </div>
      </div>
    );
  };

  const getStatsByTipo = () => {
    const stats: Record<TipoCuenta, number> = {
      ACTIVO: 0,
      PASIVO: 0,
      PATRIMONIO: 0,
      INGRESO: 0,
      GASTO: 0,
    };

    cuentas.forEach(cuenta => {
      if (cuenta.activo) {
        stats[cuenta.tipo]++;
      }
    });

    return stats;
  };

  const stats = getStatsByTipo();

  if (loading) {
    return (
      <div className="plan-cuentas-container">
        <div className="loading">Cargando plan de cuentas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="plan-cuentas-container">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={loadCuentas} className="btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="plan-cuentas-container">
      <div className="page-header">
        <h1>Plan de Cuentas</h1>
        <div className="page-actions">
          <button className="btn-secondary" onClick={loadCuentas}>
            🔄 Actualizar
          </button>
          <button className="btn-primary" onClick={() => alert('Crear nueva cuenta')}>
            + Nueva Cuenta
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="stats-grid">
        {Object.entries(stats).map(([tipo, count]) => (
          <div key={tipo} className="stat-card">
            <div className="stat-label">{tipo}</div>
            <div
              className="stat-value"
              style={{ color: getTipoCuentaColor(tipo as TipoCuenta) }}
            >
              {count}
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="filter-group">
            <label>Buscar:</label>
            <input
              type="text"
              placeholder="Código o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Tipo:</label>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value as TipoCuenta | '')}
              className="filter-select"
            >
              <option value="">Todos</option>
              <option value="ACTIVO">ACTIVO</option>
              <option value="PASIVO">PASIVO</option>
              <option value="PATRIMONIO">PATRIMONIO</option>
              <option value="INGRESO">INGRESO</option>
              <option value="GASTO">GASTO</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Nivel:</label>
            <select
              value={nivelFilter}
              onChange={(e) => setNivelFilter(e.target.value ? parseInt(e.target.value) : '')}
              className="filter-select"
            >
              <option value="">Todos</option>
              <option value="1">Nivel 1</option>
              <option value="2">Nivel 2</option>
              <option value="3">Nivel 3</option>
              <option value="4">Nivel 4</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showOnlyActive}
                onChange={(e) => setShowOnlyActive(e.target.checked)}
              />
              Solo activas
            </label>
          </div>

          <div className="filter-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showOnlyMovement}
                onChange={(e) => setShowOnlyMovement(e.target.checked)}
              />
              Solo con movimiento
            </label>
          </div>
        </div>

        <div className="filters-summary">
          Mostrando <strong>{filteredCuentas.length}</strong> de <strong>{cuentas.length}</strong> cuentas
        </div>
      </div>

      {/* Lista de cuentas */}
      <div className="cuentas-card">
        {filteredCuentas.length === 0 ? (
          <div className="empty-state">
            <p>No se encontraron cuentas con los filtros aplicados</p>
          </div>
        ) : (
          <div className="cuentas-tree">
            {filteredCuentas.map(cuenta => renderCuentaTree(cuenta))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanCuentas;
