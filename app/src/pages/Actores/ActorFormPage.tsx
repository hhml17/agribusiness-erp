import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { AlertCircle, CheckCircle, FileText, User, Phone } from 'lucide-react';
import { actoresService } from '../../services/api/actoresService';
import type { Actor, CreateActorInput, UpdateActorInput } from '../../types/actores';

type TabType = 'perfil' | 'contactos' | 'documentos';

export function ActorFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [activeTab, setActiveTab] = useState<TabType>('perfil');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
    fechaConstitucion: '',
    sectorIndustrial: '',
    categoriaComercial: '',
    nacionalidad: 'Paraguay',
    pais: 'Paraguay',
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
        fechaConstitucion: actor.fechaConstitucion ? new Date(actor.fechaConstitucion).toISOString().split('T')[0] : '',
        sectorIndustrial: actor.sectorIndustrial || '',
        categoriaComercial: actor.categoriaComercial || '',
        nacionalidad: actor.nacionalidad || 'Paraguay',
        pais: actor.pais || 'Paraguay',
        telefono: actor.telefono || '',
        email: actor.email || '',
        direccion: actor.direccion || '',
        ciudad: actor.ciudad || '',
        codigoPostal: actor.codigoPostal || '',
      });

      // Helper function to format user name from email
      const formatUserName = (email?: string): string => {
        if (!email) return 'Sistema';
        // Extract name from email (before @) and capitalize
        const name = email.split('@')[0];
        return name.split('.').map(part =>
          part.charAt(0).toUpperCase() + part.slice(1)
        ).join(' ');
      };

      setMetadata({
        creadoEl: actor.createdAt ? new Date(actor.createdAt).toLocaleString('es-PY') : '',
        creadoPor: formatUserName(actor.createdBy),
        actualizadoEl: actor.updatedAt ? new Date(actor.updatedAt).toLocaleString('es-PY') : '',
        actualizadoPor: formatUserName(actor.updatedBy),
      });
    } catch (error) {
      console.error('Error loading actor:', error);
      setAlert({ type: 'error', message: 'Error al cargar el actor' });
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
      setAlert({ type: 'error', message: 'El número de documento es obligatorio' });
      return;
    }

    if (!formData.nombreFantasia) {
      setAlert({ type: 'error', message: 'El nombre fantasía es obligatorio' });
      return;
    }

    // Validaciones específicas por tipo de persona
    if (formData.tipoPersona === 'FISICA') {
      if (!formData.nombre) {
        setAlert({ type: 'error', message: 'El nombre es obligatorio' });
        return;
      }
    } else {
      // Persona Jurídica
      if (!formData.razonSocial) {
        setAlert({ type: 'error', message: 'La razón social es obligatoria para personas jurídicas' });
        return;
      }
      // Copiar razonSocial a nombre para el backend
      formData.nombre = formData.razonSocial;
    }

    try {
      setSaving(true);

      // Filter out fields that don't exist in the Prisma schema
      const {
        sectorIndustrial,
        categoriaComercial,
        nacionalidad,
        codigoPostal,
        ...validData
      } = formData;

      // Convert empty strings to undefined for optional fields
      const cleanData = {
        ...validData,
        fechaConstitucion: validData.fechaConstitucion || undefined,
        fechaNacimiento: validData.fechaNacimiento || undefined,
        razonSocial: validData.razonSocial || undefined,
        apellido: validData.apellido || undefined,
        estadoCivil: validData.estadoCivil || undefined,
        representanteLegal: validData.representanteLegal || undefined,
        email: validData.email || undefined,
        telefono: validData.telefono || undefined,
        celular: validData.celular || undefined,
        direccion: validData.direccion || undefined,
        ciudad: validData.ciudad || undefined,
        departamento: validData.departamento || undefined,
      };

      if (isEditing && id) {
        await actoresService.update(id, cleanData as UpdateActorInput);
        setAlert({
          type: 'success',
          message: 'Persona actualizada exitosamente'
        });
        setTimeout(() => navigate('/actores'), 1500);
      } else {
        await actoresService.create(cleanData as CreateActorInput);
        setAlert({
          type: 'success',
          message: 'Persona creada exitosamente'
        });
        setTimeout(() => navigate('/actores'), 1500);
      }
    } catch (error: any) {
      console.error('Error saving actor:', error);

      // Obtener mensaje de error del servidor
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;

      // Personalizar mensajes de error comunes
      let userMessage = errorMessage;
      if (errorMessage.includes('already exists') || errorMessage.includes('ya existe')) {
        userMessage = 'Ya existe una persona registrada con este número de documento';
      } else if (errorMessage.includes('required') || errorMessage.includes('requerido')) {
        userMessage = 'Por favor complete todos los campos obligatorios';
      } else if (error.response?.status === 409) {
        userMessage = 'Ya existe una persona registrada con este número de documento';
      } else if (error.response?.status === 400) {
        userMessage = errorMessage || 'Los datos ingresados no son válidos';
      }

      setAlert({
        type: 'error',
        message: userMessage
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="text-center py-8 text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {alert && (
        <Alert variant={alert.type === 'error' ? 'destructive' : 'default'}>
          {alert.type === 'error' ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <AlertTitle>{alert.type === 'error' ? 'Error' : 'Éxito'}</AlertTitle>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Editar Persona' : 'Nueva Persona'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestión de persona en el sistema. Ya sea cliente, proveedor o asociado
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
                      <label htmlFor="fechaConstitucion">Fecha Constitución</label>
                      <input
                        type="date"
                        id="fechaConstitucion"
                        className="form-control"
                        value={formData.fechaConstitucion}
                        onChange={(e) => handleInputChange('fechaConstitucion', e.target.value)}
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
                    <label htmlFor="pais">País</label>
                    <select
                      id="pais"
                      className="form-control"
                      value={formData.pais}
                      onChange={(e) => handleInputChange('pais', e.target.value)}
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
