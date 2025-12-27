import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { actoresService } from '../../services/api/actoresService';
import type { Actor } from '../../types/actores';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Eye, Pencil, Trash2, Plus, Users } from 'lucide-react';

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

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Personas</h1>
          <p className="text-muted-foreground mt-1">
            Administra personas físicas y jurídicas (Clientes, Proveedores, Asociados)
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Personas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">{actores.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{actores.filter(a => a.esCliente).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Proveedores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{actores.filter(a => a.esProveedor).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Asociados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600">{actores.filter(a => a.esAsociado).length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Listado de Personas</CardTitle>
          <div className="flex gap-2 items-center">
            <Select value={filtroRol} onValueChange={(value) => setFiltroRol(value as any)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filtrar por Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                <SelectItem value="CLIENTE">Clientes</SelectItem>
                <SelectItem value="PROVEEDOR">Proveedores</SelectItem>
                <SelectItem value="ASOCIADO">Asociados</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroTipo} onValueChange={(value) => setFiltroTipo(value as any)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filtrar por Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                <SelectItem value="FISICA">Persona Física</SelectItem>
                <SelectItem value="JURIDICA">Persona Jurídica</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => navigate('/actores/nuevo')} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Persona
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : actores.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay personas registradas
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo Doc</TableHead>
                  <TableHead>Nro Documento</TableHead>
                  <TableHead>Nombre Fantasía</TableHead>
                  <TableHead>Nombre Completo / Razón Social</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actores.map((actor) => (
                  <TableRow key={actor.id}>
                    <TableCell className="font-medium">{actor.tipoDocumento}</TableCell>
                    <TableCell className="font-mono">
                      {actor.numeroDocumento}{actor.dv ? `-${actor.dv}` : ''}
                    </TableCell>
                    <TableCell>{actor.nombreFantasia}</TableCell>
                    <TableCell>
                      {actor.tipoPersona === 'FISICA'
                        ? `${actor.nombre} ${actor.apellido || ''}`.trim()
                        : actor.razonSocial || actor.nombre}
                    </TableCell>
                    <TableCell>
                      <Badge variant={actor.tipoPersona === 'FISICA' ? 'default' : 'secondary'}>
                        {actor.tipoPersona}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {actor.esCliente && <Badge variant="outline" className="text-xs">Cliente</Badge>}
                        {actor.esProveedor && <Badge variant="outline" className="text-xs">Proveedor</Badge>}
                        {actor.esAsociado && <Badge variant="outline" className="text-xs">Asociado</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {actor.telefono && <div>{actor.telefono}</div>}
                        {actor.email && <div className="text-muted-foreground">{actor.email}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/actores/${actor.id}`)}
                          title="Ver"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/actores/${actor.id}/editar`)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(actor.id)}
                          title="Eliminar"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
