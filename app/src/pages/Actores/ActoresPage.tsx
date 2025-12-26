import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Card, type Column } from '../../components';
import { actoresService } from '../../services/api/actoresService';
import type { Actor } from '../../types/actores';

export function ActoresPage() {
  const navigate = useNavigate();
  const [actores, setActores] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroRol, setFiltroRol] = useState<'TODOS' | 'CLIENTE' | 'PROVEEDOR' | 'ASOCIADO'>('TODOS');
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'FISICA' | 'JURIDICA'>('TODOS');

  useEffect(() => {
    loadActores();
  }, [filtroRol, filtroTipo]);

  const loadActores = async () => {
    try {
      setLoading(true);
      const filters: any = { activo: true };

      if (filtroRol !== 'TODOS') {
        if (filtroRol === 'CLIENTE') filters.esCliente = true;
        if (filtroRol === 'PROVEEDOR') filters.esProveedor = true;
        if (filtroRol === 'ASOCIADO') filters.esAsociado = true;
      }

      if (filtroTipo !== 'TODOS') {
        filters.tipoPersona = filtroTipo;
      }

      const data = await actoresService.getAll(filters);
      setActores(data);
    } catch (error) {
      console.error('Error loading actores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de desactivar este actor?')) {
      try {
        await actoresService.delete(id);
        loadActores();
      } catch (error) {
        console.error('Error deleting actor:', error);
      }
    }
  };

  const getRoles = (actor: Actor): string => {
    const roles = [];
    if (actor.esCliente) roles.push('Cliente');
    if (actor.esProveedor) roles.push('Proveedor');
    if (actor.esAsociado) roles.push('Asociado');
    return roles.join(', ');
  };

  const columns: Column<Actor>[] = [
    {
      key: 'tipoDocumento',
      header: 'Tipo Doc',
      render: (actor) => actor.tipoDocumento,
    },
    {
      key: 'numeroDocumento',
      header: 'Nro Documento',
      render: (actor) => actor.numeroDocumento + (actor.dv ? `-${actor.dv}` : ''),
    },
    {
      key: 'nombreFantasia',
      header: 'Nombre Fantasía',
      render: (actor) => actor.nombreFantasia,
    },
    {
      key: 'nombre',
      header: 'Nombre Completo / Razón Social',
      render: (actor) =>
        actor.tipoPersona === 'FISICA'
          ? `${actor.nombre} ${actor.apellido || ''}`.trim()
          : actor.razonSocial || actor.nombre,
    },
    {
      key: 'tipoPersona',
      header: 'Tipo',
      render: (actor) => (
        <span className={`badge badge-${actor.tipoPersona === 'FISICA' ? 'info' : 'warning'}`}>
          {actor.tipoPersona}
        </span>
      ),
    },
    {
      key: 'roles',
      header: 'Roles',
      render: (actor) => getRoles(actor),
    },
    {
      key: 'contacto',
      header: 'Contacto',
      render: (actor) => (
        <div className="contact-info">
          {actor.telefono && <div>{actor.telefono}</div>}
          {actor.email && <div className="text-sm text-gray-600">{actor.email}</div>}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (actor) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate(`/actores/${actor.id}`)}
          >
            Ver
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate(`/actores/${actor.id}/editar`)}
          >
            Editar
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(actor.id)}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gestión de Actores</h1>
        <p>Administra personas físicas y jurídicas (Clientes, Proveedores, Asociados)</p>
      </div>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Filtrar por Rol:</label>
              <select
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value as any)}
                className="form-select"
              >
                <option value="TODOS">Todos</option>
                <option value="CLIENTE">Clientes</option>
                <option value="PROVEEDOR">Proveedores</option>
                <option value="ASOCIADO">Asociados</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Filtrar por Tipo:</label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value as any)}
                className="form-select"
              >
                <option value="TODOS">Todos</option>
                <option value="FISICA">Persona Física</option>
                <option value="JURIDICA">Persona Jurídica</option>
              </select>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/actores/nuevo')}
          >
            + Nuevo Actor
          </Button>
        </div>

        <Table
          columns={columns}
          data={actores}
          loading={loading}
          emptyMessage="No hay actores registrados"
        />
      </Card>

      <div className="stats-grid mt-4">
        <Card>
          <h3>Total Actores</h3>
          <p className="text-3xl font-bold">{actores.length}</p>
        </Card>
        <Card>
          <h3>Clientes</h3>
          <p className="text-3xl font-bold">{actores.filter(a => a.esCliente).length}</p>
        </Card>
        <Card>
          <h3>Proveedores</h3>
          <p className="text-3xl font-bold">{actores.filter(a => a.esProveedor).length}</p>
        </Card>
        <Card>
          <h3>Asociados</h3>
          <p className="text-3xl font-bold">{actores.filter(a => a.esAsociado).length}</p>
        </Card>
      </div>
    </div>
  );
}
