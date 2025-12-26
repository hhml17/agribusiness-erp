import { useState, useEffect } from 'react';
import { centroCostoService } from '../../services/api';
import { Alert, type AlertType } from '../../components';
import type { CentroCosto, CreateCentroCostoInput } from '../../types/centroCosto';

export function CentrosCostoPage() {
  const [centros, setCentros] = useState<CentroCosto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCentro, setEditingCentro] = useState<CentroCosto | null>(null);
  const [alert, setAlert] = useState<{ type: AlertType; message: string } | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [formData, setFormData] = useState<CreateCentroCostoInput>({
    codigo: '',
    nombre: '',
    descripcion: '',
    tipo: '',
  });

  useEffect(() => {
    loadCentros();
  }, [showInactive]);

  const loadCentros = async () => {
    try {
      setLoading(true);
      const data = await centroCostoService.getAll({ activo: showInactive ? undefined : true });
      setCentros(data);
    } catch (error: any) {
      console.error('Error loading centros de costo:', error);
      setAlert({
        type: 'error',
        message: 'Error al cargar centros de costo. Por favor intente nuevamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (centro?: CentroCosto) => {
    if (centro) {
      setEditingCentro(centro);
      setFormData({
        codigo: centro.codigo,
        nombre: centro.nombre,
        descripcion: centro.descripcion || '',
        tipo: centro.tipo || '',
      });
    } else {
      setEditingCentro(null);
      setFormData({
        codigo: '',
        nombre: '',
        descripcion: '',
        tipo: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCentro(null);
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      tipo: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCentro) {
        await centroCostoService.update(editingCentro.id, formData);
        setAlert({
          type: 'success',
          message: 'Centro de costo actualizado exitosamente'
        });
      } else {
        await centroCostoService.create(formData);
        setAlert({
          type: 'success',
          message: 'Centro de costo creado exitosamente'
        });
      }
      await loadCentros();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving centro de costo:', error);

      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      let userMessage = errorMessage;

      if (errorMessage.includes('already exists') || errorMessage.includes('ya existe')) {
        userMessage = 'Ya existe un centro de costo con este código';
      } else if (error.response?.status === 409) {
        userMessage = 'Ya existe un centro de costo con este código';
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
    if (!confirm('¿Está seguro de desactivar este centro de costo?')) {
      return;
    }

    try {
      await centroCostoService.delete(id);
      setAlert({
        type: 'success',
        message: 'Centro de costo desactivado exitosamente'
      });
      await loadCentros();
    } catch (error: any) {
      console.error('Error deleting centro de costo:', error);

      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      let userMessage = errorMessage;

      if (errorMessage.includes('cuentas asignadas')) {
        userMessage = 'No se puede desactivar un centro de costo con cuentas asignadas';
      } else if (errorMessage.includes('movimientos registrados')) {
        userMessage = 'No se puede desactivar un centro de costo con movimientos registrados';
      }

      setAlert({
        type: 'error',
        message: userMessage
      });
    }
  };

  const handleReactivate = async (id: string) => {
    if (!confirm('¿Está seguro de reactivar este centro de costo?')) {
      return;
    }

    try {
      await centroCostoService.update(id, { activo: true });
      setAlert({
        type: 'success',
        message: 'Centro de costo reactivado exitosamente'
      });
      await loadCentros();
    } catch (error: any) {
      console.error('Error reactivating centro de costo:', error);
      setAlert({
        type: 'error',
        message: 'Error al reactivar centro de costo'
      });
    }
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="centros-costo-page">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="page-header">
        <h1>Empresa: Centros de Costo</h1>
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
            + Nuevo Centro de Costo
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="centros-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {centros.length === 0 ? (
              <tr>
                <td colSpan={6} className="no-data">
                  No hay centros de costo registrados
                </td>
              </tr>
            ) : (
              centros.map((centro) => (
                <tr key={centro.id} className={!centro.activo ? 'inactive-row' : ''}>
                  <td>{centro.codigo}</td>
                  <td>{centro.nombre}</td>
                  <td>{centro.descripcion || '-'}</td>
                  <td>{centro.tipo || '-'}</td>
                  <td>
                    <span className={`badge ${centro.activo ? 'badge-active' : 'badge-inactive'}`}>
                      {centro.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="actions">
                    {centro.activo ? (
                      <>
                        <button
                          className="btn-edit"
                          onClick={() => handleOpenModal(centro)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(centro.id)}
                          title="Desactivar"
                        >
                          ❌
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn-reactivate"
                        onClick={() => handleReactivate(centro.id)}
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
              <h2>{editingCentro ? 'Editar Centro de Costo' : 'Nuevo Centro de Costo'}</h2>
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
                  disabled={!!editingCentro}
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
                />
              </div>

              <div className="form-group">
                <label htmlFor="tipo">Tipo</label>
                <input
                  type="text"
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  placeholder="Ej: Producción, Administrativo, Ventas"
                />
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={3}
                  placeholder="Se usa para gastos realizados en..."
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingCentro ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
