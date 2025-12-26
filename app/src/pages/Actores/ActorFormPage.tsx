import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card } from '../../components';
import { actoresService } from '../../services/api/actoresService';
import type { Actor, CreateActorInput, UpdateActorInput } from '../../types/actores';
import '../../styles/pages/ActorForm.css';

type TabType = 'perfil' | 'contactos' | 'documentos';

export function ActorFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [activeTab, setActiveTab] = useState<TabType>('perfil');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form data
  const [formData, setFormData] = useState<Partial<CreateActorInput>>({
    tipoPersona: 'FISICA',
    tipoDocumento: 'RUC',
    numeroDocumento: '',
    dv: '',
    nombre: '',
    apellido: '',
    nombreFantasia: '',
    razonSocial: '',
    esCliente: false,
    esProveedor: false,
    esAsociado: false,
    fechaFundacion: '',
    sectorIndustrial: '',
    categoriaComercial: '',
    nacionalidad: 'Paraguay',
    paisResidencia: 'Paraguay',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    codigoPostal: '',
  });

  // Metadata
  const [metadata, setMetadata] = useState({
    creadoEl: '',
    creadoPor: '',
    actualizadoEl: '',
    actualizadoPor: '',
  });

  useEffect(() => {
    if (isEditing && id) {
      loadActor(id);
    }
  }, [id, isEditing]);

  const loadActor = async (actorId: string) => {
    try {
      setLoading(true);
      const actor = await actoresService.getById(actorId);
      setFormData({
        tipoPersona: actor.tipoPersona,
        tipoDocumento: actor.tipoDocumento,
        numeroDocumento: actor.numeroDocumento,
        dv: actor.dv || '',
        nombre: actor.nombre,
        apellido: actor.apellido || '',
        nombreFantasia: actor.nombreFantasia,
        razonSocial: actor.razonSocial || '',
        esCliente: actor.esCliente,
        esProveedor: actor.esProveedor,
        esAsociado: actor.esAsociado,
        fechaFundacion: actor.fechaFundacion || '',
        sectorIndustrial: actor.sectorIndustrial || '',
        categoriaComercial: actor.categoriaComercial || '',
        nacionalidad: actor.nacionalidad || 'Paraguay',
        paisResidencia: actor.paisResidencia || 'Paraguay',
        telefono: actor.telefono || '',
        email: actor.email || '',
        direccion: actor.direccion || '',
        ciudad: actor.ciudad || '',
        codigoPostal: actor.codigoPostal || '',
      });

      setMetadata({
        creadoEl: new Date(actor.creadoEl).toLocaleString('es-PY'),
        creadoPor: actor.creadoPor || 'Sistema',
        actualizadoEl: new Date(actor.actualizadoEl).toLocaleString('es-PY'),
        actualizadoPor: actor.actualizadoPor || 'Sistema',
      });
    } catch (error) {
      console.error('Error loading actor:', error);
      alert('Error al cargar el actor');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateActorInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: 'esCliente' | 'esProveedor' | 'esAsociado') => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!formData.numeroDocumento) {
      alert('El número de documento es obligatorio');
      return;
    }

    if (!formData.nombre) {
      alert('El nombre es obligatorio');
      return;
    }

    if (!formData.nombreFantasia) {
      alert('El nombre fantasía es obligatorio');
      return;
    }

    if (formData.tipoPersona === 'JURIDICA' && !formData.razonSocial) {
      alert('La razón social es obligatoria para personas jurídicas');
      return;
    }

    try {
      setSaving(true);

      if (isEditing && id) {
        await actoresService.update(id, formData as UpdateActorInput);
        alert('Actor actualizado exitosamente');
      } else {
        await actoresService.create(formData as CreateActorInput);
        alert('Actor creado exitosamente');
      }

      navigate('/actores');
    } catch (error: any) {
      console.error('Error saving actor:', error);
      alert(`Error al guardar: ${error.response?.data?.message || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{isEditing ? 'Editar Actor' : 'Nuevo Actor'}</h1>
        <p>Gestión de actor en el sistema. Ya sea cliente, proveedor o asociado</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Metadata Section */}
        {isEditing && (
          <Card className="metadata-card">
            <div className="metadata-grid">
              <div className="metadata-item">
                <label>Creado el:</label>
                <span>{metadata.creadoEl}</span>
              </div>
              <div className="metadata-item">
                <label>Creado por:</label>
                <span>{metadata.creadoPor}</span>
              </div>
              <div className="metadata-item">
                <label>Actualizado el:</label>
                <span>{metadata.actualizadoEl}</span>
              </div>
              <div className="metadata-item">
                <label>Actualizado por:</label>
                <span>{metadata.actualizadoPor}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Tabs Navigation */}
        <div className="tabs-container">
          <div className="tabs-nav">
            <button
              type="button"
              className={`tab-button ${activeTab === 'perfil' ? 'active' : ''}`}
              onClick={() => setActiveTab('perfil')}
            >
              Perfil
            </button>
            <button
              type="button"
              className={`tab-button ${activeTab === 'contactos' ? 'active' : ''}`}
              onClick={() => setActiveTab('contactos')}
            >
              Contactos
            </button>
            <button
              type="button"
              className={`tab-button ${activeTab === 'documentos' ? 'active' : ''}`}
              onClick={() => setActiveTab('documentos')}
            >
              Documentos
            </button>
          </div>

          {/* Tab Content */}
          <Card>
            {/* PERFIL TAB */}
            {activeTab === 'perfil' && (
              <div className="tab-content">
                <h3>Información del Actor</h3>

                {/* Tipo de Persona */}
                <div className="form-section">
                  <h4>Tipo de persona:</h4>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="tipoPersona"
                        value="FISICA"
                        checked={formData.tipoPersona === 'FISICA'}
                        onChange={(e) => handleInputChange('tipoPersona', e.target.value)}
                      />
                      Persona Física
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="tipoPersona"
                        value="JURIDICA"
                        checked={formData.tipoPersona === 'JURIDICA'}
                        onChange={(e) => handleInputChange('tipoPersona', e.target.value)}
                      />
                      Persona Jurídica
                    </label>
                  </div>
                </div>

                {/* Tipo de Actor */}
                <div className="form-section">
                  <h4>Tipo de actor:</h4>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.esProveedor || false}
                        onChange={() => handleCheckboxChange('esProveedor')}
                      />
                      Proveedor
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.esCliente || false}
                        onChange={() => handleCheckboxChange('esCliente')}
                      />
                      Cliente
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.esAsociado || false}
                        onChange={() => handleCheckboxChange('esAsociado')}
                      />
                      Asociado
                    </label>
                  </div>
                </div>

                {/* Documento */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="tipoDocumento">
                      Tipo Documento <span className="required">*</span>
                    </label>
                    <select
                      id="tipoDocumento"
                      className="form-control"
                      value={formData.tipoDocumento}
                      onChange={(e) => handleInputChange('tipoDocumento', e.target.value)}
                      required
                    >
                      <option value="RUC">RUC</option>
                      <option value="CI">CI</option>
                      <option value="PASAPORTE">Pasaporte</option>
                      <option value="OTRO">Otro</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="numeroDocumento">
                      Nro Documento <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="numeroDocumento"
                      className="form-control"
                      value={formData.numeroDocumento}
                      onChange={(e) => handleInputChange('numeroDocumento', e.target.value)}
                      placeholder="80012345"
                      required
                    />
                  </div>

                  {formData.tipoDocumento === 'RUC' && (
                    <div className="form-group form-group-small">
                      <label htmlFor="dv">DV</label>
                      <input
                        type="text"
                        id="dv"
                        className="form-control"
                        value={formData.dv}
                        onChange={(e) => handleInputChange('dv', e.target.value)}
                        placeholder="6"
                        maxLength={1}
                      />
                    </div>
                  )}
                </div>

                {/* Nombres según tipo de persona */}
                {formData.tipoPersona === 'FISICA' ? (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="nombre">
                          Nombre <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          id="nombre"
                          className="form-control"
                          value={formData.nombre}
                          onChange={(e) => handleInputChange('nombre', e.target.value)}
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
                          onChange={(e) => handleInputChange('apellido', e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="form-group">
                    <label htmlFor="razonSocial">
                      Nombre/Denominación Social <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="razonSocial"
                      className="form-control"
                      value={formData.razonSocial}
                      onChange={(e) => handleInputChange('razonSocial', e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="nombreFantasia">
                    Nombre Fantasía <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="nombreFantasia"
                    className="form-control"
                    value={formData.nombreFantasia}
                    onChange={(e) => handleInputChange('nombreFantasia', e.target.value)}
                    required
                  />
                </div>

                {/* Datos adicionales */}
                {formData.tipoPersona === 'JURIDICA' && (
                  <>
                    <div className="form-group">
                      <label htmlFor="fechaFundacion">Fecha Fundación</label>
                      <input
                        type="date"
                        id="fechaFundacion"
                        className="form-control"
                        value={formData.fechaFundacion}
                        onChange={(e) => handleInputChange('fechaFundacion', e.target.value)}
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="sectorIndustrial">Sector Industrial</label>
                        <select
                          id="sectorIndustrial"
                          className="form-control"
                          value={formData.sectorIndustrial}
                          onChange={(e) => handleInputChange('sectorIndustrial', e.target.value)}
                        >
                          <option value="">Seleccionar...</option>
                          <option value="Comercial">Comercial</option>
                          <option value="Industrial">Industrial</option>
                          <option value="Servicios">Servicios</option>
                          <option value="Agropecuario">Agropecuario</option>
                          <option value="Financiero">Financiero</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="categoriaComercial">Categoría</label>
                        <input
                          type="text"
                          id="categoriaComercial"
                          className="form-control"
                          value={formData.categoriaComercial}
                          onChange={(e) => handleInputChange('categoriaComercial', e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="nacionalidad">Nacionalidad</label>
                    <select
                      id="nacionalidad"
                      className="form-control"
                      value={formData.nacionalidad}
                      onChange={(e) => handleInputChange('nacionalidad', e.target.value)}
                    >
                      <option value="Paraguay">Paraguay</option>
                      <option value="Argentina">Argentina</option>
                      <option value="Brasil">Brasil</option>
                      <option value="Uruguay">Uruguay</option>
                      <option value="Chile">Chile</option>
                      <option value="Bolivia">Bolivia</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="paisResidencia">País</label>
                    <select
                      id="paisResidencia"
                      className="form-control"
                      value={formData.paisResidencia}
                      onChange={(e) => handleInputChange('paisResidencia', e.target.value)}
                    >
                      <option value="Paraguay">Paraguay</option>
                      <option value="Argentina">Argentina</option>
                      <option value="Brasil">Brasil</option>
                      <option value="Uruguay">Uruguay</option>
                      <option value="Chile">Chile</option>
                      <option value="Bolivia">Bolivia</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* CONTACTOS TAB */}
            {activeTab === 'contactos' && (
              <div className="tab-content">
                <h3>Información de Contacto</h3>

                <div className="form-group">
                  <label htmlFor="telefono">Teléfono</label>
                  <input
                    type="tel"
                    id="telefono"
                    className="form-control"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    placeholder="+595 21 123456"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contacto@ejemplo.com.py"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="direccion">Dirección</label>
                  <textarea
                    id="direccion"
                    className="form-control"
                    rows={3}
                    value={formData.direccion}
                    onChange={(e) => handleInputChange('direccion', e.target.value)}
                    placeholder="Calle, número, barrio..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="ciudad">Ciudad</label>
                    <input
                      type="text"
                      id="ciudad"
                      className="form-control"
                      value={formData.ciudad}
                      onChange={(e) => handleInputChange('ciudad', e.target.value)}
                      placeholder="Asunción"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="codigoPostal">Código Postal</label>
                    <input
                      type="text"
                      id="codigoPostal"
                      className="form-control"
                      value={formData.codigoPostal}
                      onChange={(e) => handleInputChange('codigoPostal', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* DOCUMENTOS TAB */}
            {activeTab === 'documentos' && (
              <div className="tab-content">
                <h3>Documentos</h3>
                <div className="documents-placeholder">
                  <p>Funcionalidad de carga de documentos disponible próximamente</p>
                  <ul>
                    <li>Copia de RUC</li>
                    <li>Cédula de identidad</li>
                    <li>Constancia de inscripción</li>
                    <li>Contratos</li>
                    <li>Otros documentos adjuntos</li>
                  </ul>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/actores')}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Actor'}
          </Button>
        </div>
      </form>
    </div>
  );
}
