import { useState, useEffect } from 'react';
import { cuentaContableService } from '../../services/api';
import { Alert, type AlertType } from '../../components';
import type { CuentaContable, CreateCuentaContableInput, TipoCuenta } from '../../types/cuentaContable';

export function PlanCuentasPage() {
  const [cuentas, setCuentas] = useState<CuentaContable[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCuenta, setEditingCuenta] = useState<CuentaContable | null>(null);
  const [alert, setAlert] = useState<{ type: AlertType; message: string } | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [formData, setFormData] = useState<CreateCuentaContableInput>({
    codigo: '',
    nombre: '',
    tipo: 'ACTIVO',
    nivel: 1,
    descripcion: '',
  });

  useEffect(() => {
    loadCuentas();
  }, [showInactive]);

  const loadCuentas = async () => {
    try {
      setLoading(true);
      const data = await cuentaContableService.getAll({ activo: showInactive ? undefined : true });
      setCuentas(data);
    } catch (error: any) {
      console.error('Error loading cuentas contables:', error);
      setAlert({
        type: 'error',
        message: 'Error al cargar cuentas contables. Por favor intente nuevamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (cuenta?: CuentaContable) => {
    if (cuenta) {
      setEditingCuenta(cuenta);
      setFormData({
        codigo: cuenta.codigo,
        nombre: cuenta.nombre,
        tipo: cuenta.tipo,
        nivel: cuenta.nivel,
        descripcion: cuenta.descripcion || '',
        cuentaPadreId: cuenta.cuentaPadreId || undefined,
      });
    } else {
      setEditingCuenta(null);
      setFormData({
        codigo: '',
        nombre: '',
        tipo: 'ACTIVO',
        nivel: 1,
        descripcion: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCuenta(null);
    setFormData({
      codigo: '',
      nombre: '',
      tipo: 'ACTIVO',
      nivel: 1,
      descripcion: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCuenta) {
        await cuentaContableService.update(editingCuenta.id, formData);
        setAlert({
          type: 'success',
          message: 'Cuenta contable actualizada exitosamente'
        });
      } else {
        await cuentaContableService.create(formData);
        setAlert({
          type: 'success',
          message: 'Cuenta contable creada exitosamente'
        });
      }
      await loadCuentas();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving cuenta contable:', error);

      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      let userMessage = errorMessage;

      if (errorMessage.includes('ya existe') || errorMessage.includes('código')) {
        userMessage = 'Ya existe una cuenta contable con este código';
      } else if (error.response?.status === 409) {
        userMessage = 'Ya existe una cuenta contable con este código';
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
    if (!confirm('¿Está seguro de desactivar esta cuenta contable?')) {
      return;
    }

    try {
      await cuentaContableService.delete(id);
      setAlert({
        type: 'success',
        message: 'Cuenta contable desactivada exitosamente'
      });
      await loadCuentas();
    } catch (error: any) {
      console.error('Error deleting cuenta contable:', error);

      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      let userMessage = errorMessage;

      if (errorMessage.includes('cuentas hijas')) {
        userMessage = 'No se puede desactivar una cuenta con cuentas hijas activas';
      } else if (errorMessage.includes('movimientos')) {
        userMessage = 'No se puede desactivar una cuenta con movimientos registrados';
      }

      setAlert({
        type: 'error',
        message: userMessage
      });
    }
  };

  const handleReactivate = async (id: string) => {
    if (!confirm('¿Está seguro de reactivar esta cuenta contable?')) {
      return;
    }

    try {
      await cuentaContableService.update(id, { activo: true });
      setAlert({
        type: 'success',
        message: 'Cuenta contable reactivada exitosamente'
      });
      await loadCuentas();
    } catch (error: any) {
      console.error('Error reactivating cuenta contable:', error);
      setAlert({
        type: 'error',
        message: 'Error al reactivar cuenta contable'
      });
    }
  };

  const getTipoLabel = (tipo: TipoCuenta): string => {
    const labels: Record<TipoCuenta, string> = {
      ACTIVO: 'Activo',
      PASIVO: 'Pasivo',
      PATRIMONIO: 'Patrimonio',
      INGRESO: 'Ingreso',
      EGRESO: 'Egreso',
    };
    return labels[tipo] || tipo;
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="plan-cuentas-page">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="page-header">
        <h1>Plan de Cuentas Contables</h1>
        <div className="header-actions">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            Mostrar inactivas
          </label>
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            + Nueva Cuenta Contable
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
              <th>Nivel</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cuentas.length === 0 ? (
              <tr>
                <td colSpan={7} className="no-data">
                  No hay cuentas contables registradas
                </td>
              </tr>
            ) : (
              cuentas.map((cuenta) => (
                <tr key={cuenta.id} className={!cuenta.activo ? 'inactive-row' : ''}>
                  <td>{cuenta.codigo}</td>
                  <td>{cuenta.nombre}</td>
                  <td>{getTipoLabel(cuenta.tipo)}</td>
                  <td>{cuenta.nivel}</td>
                  <td>{cuenta.descripcion || '-'}</td>
                  <td>
                    <span className={`badge ${cuenta.activo ? 'badge-active' : 'badge-inactive'}`}>
                      {cuenta.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="actions">
                    {cuenta.activo ? (
                      <>
                        <button
                          className="btn-edit"
                          onClick={() => handleOpenModal(cuenta)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(cuenta.id)}
                          title="Desactivar"
                        >
                          ❌
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn-reactivate"
                        onClick={() => handleReactivate(cuenta.id)}
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
              <h2>{editingCuenta ? 'Editar Cuenta Contable' : 'Nueva Cuenta Contable'}</h2>
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
                  disabled={!!editingCuenta}
                  placeholder="Ej: 1.1.01.001"
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
                  placeholder="Ej: Caja General"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tipo">
                  Tipo <span className="required">*</span>
                </label>
                <select
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoCuenta })}
                  required
                >
                  <option value="ACTIVO">Activo</option>
                  <option value="PASIVO">Pasivo</option>
                  <option value="PATRIMONIO">Patrimonio</option>
                  <option value="INGRESO">Ingreso</option>
                  <option value="EGRESO">Egreso</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="nivel">
                  Nivel <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="nivel"
                  value={formData.nivel}
                  onChange={(e) => setFormData({ ...formData, nivel: parseInt(e.target.value) })}
                  required
                  min="1"
                  max="5"
                  disabled={!!editingCuenta}
                />
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={3}
                  placeholder="Descripción de la cuenta contable..."
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingCuenta ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
