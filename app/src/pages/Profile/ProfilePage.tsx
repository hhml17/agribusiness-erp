import { useState, useEffect } from 'react';
import { userService } from '../../services/api';
import type { UserProfile, UpdateUserProfileInput } from '../../types/user';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateUserProfileInput>({
    nombre: '',
    apellido: '',
    email: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await userService.getProfile();
      setProfile(data);
      setFormData({
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      alert('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre || !formData.apellido) {
      alert('El nombre y apellido son obligatorios');
      return;
    }

    try {
      setSaving(true);
      const updated = await userService.updateProfile(formData);
      setProfile(updated);
      setEditing(false);
      alert('Perfil actualizado exitosamente');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert(`Error al actualizar perfil: ${error.response?.data?.message || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        nombre: profile.nombre,
        apellido: profile.apellido,
        email: profile.email,
      });
    }
    setEditing(false);
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'badge-admin';
      case 'USER':
        return 'badge-user';
      case 'VIEWER':
        return 'badge-viewer';
      default:
        return 'badge-default';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'USER':
        return 'Usuario';
      case 'VIEWER':
        return 'Visualizador';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading">Cargando perfil...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="error">No se pudo cargar el perfil</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Mi Perfil</h1>
        {!editing && (
          <button
            className="btn-edit"
            onClick={() => setEditing(true)}
          >
            Editar Perfil
          </button>
        )}
      </div>

      <div className="profile-content">
        {/* Avatar Section */}
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {profile.nombre.charAt(0)}{profile.apellido.charAt(0)}
          </div>
          <div className="profile-name">
            {profile.nombre} {profile.apellido}
          </div>
          <div className="profile-email">{profile.email}</div>
          <div className={`profile-role-badge ${getRoleBadgeClass(profile.role)}`}>
            {getRoleLabel(profile.role)}
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <h2>Información Personal</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  className="form-control"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  disabled={!editing}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="apellido">Apellido</label>
                <input
                  type="text"
                  id="apellido"
                  className="form-control"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  disabled={!editing}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!editing}
              />
              <small className="form-text">El email está vinculado a tu cuenta de Azure AD</small>
            </div>
          </div>

          <div className="form-section">
            <h2>Información de la Cuenta</h2>

            <div className="info-grid">
              <div className="info-item">
                <label>Rol</label>
                <div className="info-value">
                  <span className={`role-badge ${getRoleBadgeClass(profile.role)}`}>
                    {getRoleLabel(profile.role)}
                  </span>
                </div>
              </div>

              <div className="info-item">
                <label>Estado</label>
                <div className="info-value">
                  <span className={`status-badge ${profile.activo ? 'status-active' : 'status-inactive'}`}>
                    {profile.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              <div className="info-item">
                <label>Fecha de Registro</label>
                <div className="info-value">
                  {new Date(profile.createdAt).toLocaleDateString('es-PY')}
                </div>
              </div>

              <div className="info-item">
                <label>Última Actualización</label>
                <div className="info-value">
                  {new Date(profile.updatedAt).toLocaleString('es-PY')}
                </div>
              </div>
            </div>
          </div>

          {editing && (
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-save"
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
