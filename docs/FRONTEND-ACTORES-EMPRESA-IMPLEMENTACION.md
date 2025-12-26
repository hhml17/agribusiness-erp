# IMPLEMENTACIÓN FRONTEND - MÓDULOS ACTORES Y EMPRESA

## ✅ ARCHIVOS CREADOS

### Tipos TypeScript
- ✅ [app/src/types/actores.ts](../app/src/types/actores.ts:1) - Tipos completos para Actor, Estancia, Talonario y FacturaEmitida

### Servicios API
- ✅ [app/src/services/api/actoresService.ts](../app/src/services/api/actoresService.ts:1)
- ✅ [app/src/services/api/estanciasService.ts](../app/src/services/api/estanciasService.ts:1)
- ✅ [app/src/services/api/talonariosService.ts](../app/src/services/api/talonariosService.ts:1)
- ✅ [app/src/services/api/facturasEmitidasService.ts](../app/src/services/api/facturasEmitidasService.ts:1)

### Páginas React
- ✅ [app/src/pages/Actores/ActoresPage.tsx](../app/src/pages/Actores/ActoresPage.tsx:1) - Página de lista de actores con filtros

---

## 📋 ARCHIVOS PENDIENTES DE CREAR

A continuación se detallan todos los archivos que necesitas crear para completar la implementación del frontend:

### 1. Página de Formulario de Actor

**Archivo:** `app/src/pages/Actores/ActorFormPage.tsx`

```tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card } from '../../components';
import { actoresService } from '../../services/api/actoresService';
import type { CreateActorInput, Actor, TipoPersona } from '../../types/actores';

export function ActorFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tipoPersona, setTipoPersona] = useState<TipoPersona>('FISICA');

  const [formData, setFormData] = useState<CreateActorInput>({
    tipoPersona: 'FISICA',
    tipoDocumento: 'CI',
    numeroDocumento: '',
    nombre: '',
    nombreFantasia: '',
    pais: 'PY',
  });

  useEffect(() => {
    if (id) {
      loadActor();
    }
  }, [id]);

  const loadActor = async () => {
    try {
      const actor = await actoresService.getById(id!);
      setFormData(actor);
      setTipoPersona(actor.tipoPersona);
    } catch (error) {
      console.error('Error loading actor:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (id) {
        await actoresService.update(id, formData);
      } else {
        await actoresService.create(formData);
      }
      navigate('/actores');
    } catch (error) {
      console.error('Error saving actor:', error);
      alert('Error al guardar el actor');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateActorInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{id ? 'Editar Actor' : 'Nuevo Actor'}</h1>
        <Button variant="secondary" onClick={() => navigate('/actores')}>
          Volver
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-4">
          <h2 className="text-xl font-semibold mb-4">Información Básica</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Tipo de Persona *</label>
              <select
                value={formData.tipoPersona}
                onChange={(e) => {
                  const tipo = e.target.value as TipoPersona;
                  setTipoPersona(tipo);
                  handleChange('tipoPersona', tipo);
                }}
                className="form-input"
                required
              >
                <option value="FISICA">Persona Física</option>
                <option value="JURIDICA">Persona Jurídica</option>
              </select>
            </div>

            <div>
              <label className="form-label">Tipo de Documento *</label>
              <select
                value={formData.tipoDocumento}
                onChange={(e) => handleChange('tipoDocumento', e.target.value)}
                className="form-input"
                required
              >
                <option value="CI">CI - Cédula de Identidad</option>
                <option value="RUC">RUC</option>
                <option value="PASAPORTE">Pasaporte</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>

            <div>
              <label className="form-label">Número de Documento *</label>
              <input
                type="text"
                value={formData.numeroDocumento}
                onChange={(e) => handleChange('numeroDocumento', e.target.value)}
                className="form-input"
                required
              />
            </div>

            {formData.tipoDocumento === 'RUC' && (
              <div>
                <label className="form-label">Dígito Verificador</label>
                <input
                  type="text"
                  value={formData.dv || ''}
                  onChange={(e) => handleChange('dv', e.target.value)}
                  className="form-input"
                  maxLength={1}
                />
              </div>
            )}

            <div>
              <label className="form-label">Nombre Fantasía *</label>
              <input
                type="text"
                value={formData.nombreFantasia}
                onChange={(e) => handleChange('nombreFantasia', e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>
        </Card>

        {tipoPersona === 'FISICA' ? (
          <Card className="mb-4">
            <h2 className="text-xl font-semibold mb-4">Datos de Persona Física</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Apellido</label>
                <input
                  type="text"
                  value={formData.apellido || ''}
                  onChange={(e) => handleChange('apellido', e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Fecha de Nacimiento</label>
                <input
                  type="date"
                  value={formData.fechaNacimiento || ''}
                  onChange={(e) => handleChange('fechaNacimiento', e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Estado Civil</label>
                <select
                  value={formData.estadoCivil || ''}
                  onChange={(e) => handleChange('estadoCivil', e.target.value)}
                  className="form-input"
                >
                  <option value="">Seleccionar...</option>
                  <option value="SOLTERO">Soltero</option>
                  <option value="CASADO">Casado</option>
                  <option value="DIVORCIADO">Divorciado</option>
                  <option value="VIUDO">Viudo</option>
                </select>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="mb-4">
            <h2 className="text-xl font-semibold mb-4">Datos de Persona Jurídica</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="form-label">Razón Social *</label>
                <input
                  type="text"
                  value={formData.razonSocial || ''}
                  onChange={(e) => handleChange('razonSocial', e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Nombre Comercial *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Fecha de Constitución</label>
                <input
                  type="date"
                  value={formData.fechaConstitucion || ''}
                  onChange={(e) => handleChange('fechaConstitucion', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="col-span-2">
                <label className="form-label">Representante Legal</label>
                <input
                  type="text"
                  value={formData.representanteLegal || ''}
                  onChange={(e) => handleChange('representanteLegal', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </Card>
        )}

        <Card className="mb-4">
          <h2 className="text-xl font-semibold mb-4">Roles</h2>
          <div className="flex gap-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.esCliente || false}
                onChange={(e) => handleChange('esCliente', e.target.checked)}
                className="form-checkbox mr-2"
              />
              Cliente
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.esProveedor || false}
                onChange={(e) => handleChange('esProveedor', e.target.checked)}
                className="form-checkbox mr-2"
              />
              Proveedor
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.esAsociado || false}
                onChange={(e) => handleChange('esAsociado', e.target.checked)}
                className="form-checkbox mr-2"
              />
              Asociado
            </label>
          </div>
        </Card>

        <Card className="mb-4">
          <h2 className="text-xl font-semibold mb-4">Información de Contacto</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Teléfono</label>
              <input
                type="tel"
                value={formData.telefono || ''}
                onChange={(e) => handleChange('telefono', e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Celular</label>
              <input
                type="tel"
                value={formData.celular || ''}
                onChange={(e) => handleChange('celular', e.target.value)}
                className="form-input"
              />
            </div>
            <div className="col-span-2">
              <label className="form-label">Dirección</label>
              <input
                type="text"
                value={formData.direccion || ''}
                onChange={(e) => handleChange('direccion', e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Ciudad</label>
              <input
                type="text"
                value={formData.ciudad || ''}
                onChange={(e) => handleChange('ciudad', e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Departamento</label>
              <input
                type="text"
                value={formData.departamento || ''}
                onChange={(e) => handleChange('departamento', e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/actores')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Guardando...' : id ? 'Actualizar' : 'Crear Actor'}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

---

### 2. Exportar servicios en index.ts

**Archivo:** `app/src/services/api/index.ts`

Agregar al final del archivo existente:

```typescript
// Actores y Empresa
export * from './actoresService';
export * from './estanciasService';
export * from './talonariosService';
export * from './facturasEmitidasService';
```

---

### 3. Actualizar App.tsx con las nuevas rutas

**Archivo:** `app/src/App.tsx`

Agregar las siguientes rutas:

```typescript
import { ActoresPage } from './pages/Actores/ActoresPage';
import { ActorFormPage } from './pages/Actores/ActorFormPage';

// En tu configuración de rutas:
<Route path="/actores" element={<ActoresPage />} />
<Route path="/actores/nuevo" element={<ActorFormPage />} />
<Route path="/actores/:id/editar" element={<ActorFormPage />} />
```

---

## 📦 COMPONENTES ADICIONALES SIMPLIFICADOS

Por limitaciones de espacio, aquí están las estructuras básicas de los componentes restantes:

### EstanciasPage.tsx
Similar a ActoresPage pero con columnas para:
- Código
- Nombre
- Centro de Costo
- Superficie
- Tipo de Propiedad
- Responsable

### TalonariosPage.tsx
Columnas:
- Tipo Comprobante
- Número Timbrado
- Establecimiento - Punto Venta
- Rango (Inicial-Final)
- Siguiente Número
- Estado (Activo/Agotado)

### FacturasEmitidasPage.tsx
Columnas:
- Número Completo (001-001-0001234)
- Fecha
- Cliente
- Total
- Moneda
- Estado
- Botón para Anular

---

## 🎨 ESTILOS CSS SUGERIDOS

Crear archivo `app/src/styles/pages/Actores.css`:

```css
.page-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
}

.page-header p {
  color: #6b7280;
  margin-top: 0.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stats-grid h3 {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.contact-info {
  font-size: 0.875rem;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-info {
  background-color: #dbeafe;
  color: #1e40af;
}

.badge-warning {
  background-color: #fef3c7;
  color: #92400e;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-checkbox {
  width: 1rem;
  height: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
}
```

---

## ⚡ SIGUIENTE PASO: PRUEBAS

Una vez creados todos los componentes:

1. **Iniciar el servidor backend:**
   ```bash
   cd api
   npm start
   ```

2. **Iniciar el servidor frontend:**
   ```bash
   cd app
   npm run dev
   ```

3. **Navegar a:** `http://localhost:5173/actores`

4. **Probar flujo completo:**
   - Crear nuevo actor (persona física)
   - Crear nuevo actor (persona jurídica)
   - Editar actor
   - Ver lista con filtros
   - Desactivar actor

---

## 📊 ESTADO DE IMPLEMENTACIÓN

### Backend ✅ 100% COMPLETO
- ✅ Modelos Prisma
- ✅ Controllers
- ✅ Routes
- ✅ Servidor configurado

### Frontend ⏳ 60% COMPLETO
- ✅ Tipos TypeScript
- ✅ Servicios API
- ✅ Página de lista de Actores
- ⏳ Formulario de Actor (código proporcionado arriba)
- ⏳ Páginas de Estancias
- ⏳ Páginas de Talonarios
- ⏳ Páginas de Facturas Emitidas
- ⏳ Configuración de rutas

---

**Siguiente acción recomendada:** Crear los archivos pendientes listados arriba y probar la integración completa.
