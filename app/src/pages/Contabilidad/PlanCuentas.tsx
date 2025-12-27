import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import contabilidadService from '../../services/contabilidad.service';
import type { PlanCuentas as PlanCuentasType, TipoCuenta } from '../../types/contabilidad';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { RefreshCw, Plus, Eye, Pencil, BookOpen, ChevronDown } from 'lucide-react';

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
      ACTIVO: 'text-green-600 bg-green-50',
      PASIVO: 'text-red-600 bg-red-50',
      PATRIMONIO: 'text-purple-600 bg-purple-50',
      INGRESO: 'text-blue-600 bg-blue-50',
      GASTO: 'text-amber-600 bg-amber-50',
    };
    return colors[tipo] || 'text-gray-600 bg-gray-50';
  };

  const renderCuentaTree = (cuenta: PlanCuentasType) => {
    const paddingLeft = `${cuenta.nivel * 1.5}rem`;
    const hasChildren = cuenta.cuentasHijas && cuenta.cuentasHijas.length > 0;

    return (
      <div key={cuenta.id} className={`border-b hover:bg-muted/50 ${!cuenta.activo ? 'opacity-50' : ''}`}>
        <div className="flex items-center justify-between p-4" style={{ paddingLeft }}>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              {hasChildren && <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              <span className="font-mono text-sm text-blue-600">{cuenta.codigo}</span>
              <span className="font-semibold">{cuenta.nombre}</span>
            </div>
            {cuenta.descripcion && (
              <div className="text-sm text-muted-foreground ml-6">{cuenta.descripcion}</div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge className={getTipoCuentaColor(cuenta.tipo)}>
              {cuenta.tipo}
            </Badge>
            <Badge variant="outline">
              {cuenta.naturaleza}
            </Badge>
            {cuenta.centroCosto && (
              <Badge variant="outline" className="text-xs">
                {cuenta.centroCosto.codigo}
              </Badge>
            )}
            {cuenta.aceptaMovimiento && (
              <Badge variant="active" className="text-xs">Movimiento</Badge>
            )}
          </div>

          <div className="flex items-center gap-1 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => alert(`Ver detalles de: ${cuenta.nombre}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => alert(`Editar: ${cuenta.nombre}`)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Link to={`/contabilidad/mayor?cuenta=${cuenta.id}`}>
              <Button variant="ghost" size="sm">
                <BookOpen className="h-4 w-4" />
              </Button>
            </Link>
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
      <div className="p-8 space-y-6">
        <div className="text-center py-8 text-muted-foreground">Cargando plan de cuentas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 space-y-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={loadCuentas}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Plan de Cuentas</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadCuentas}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
          <Button onClick={() => alert('Crear nueva cuenta')}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cuenta
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(stats).map(([tipo, count]) => (
          <Card key={tipo}>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">{tipo}</div>
              <div className={`text-2xl font-bold ${getTipoCuentaColor(tipo as TipoCuenta).split(' ')[0]}`}>
                {count}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                type="text"
                placeholder="Código o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={tipoFilter || 'all'} onValueChange={(v) => setTipoFilter(v === 'all' ? '' : v as TipoCuenta)}>
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ACTIVO">ACTIVO</SelectItem>
                  <SelectItem value="PASIVO">PASIVO</SelectItem>
                  <SelectItem value="PATRIMONIO">PATRIMONIO</SelectItem>
                  <SelectItem value="INGRESO">INGRESO</SelectItem>
                  <SelectItem value="GASTO">GASTO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nivel">Nivel</Label>
              <Select value={nivelFilter ? nivelFilter.toString() : 'all'} onValueChange={(v) => setNivelFilter(v === 'all' ? '' : parseInt(v))}>
                <SelectTrigger id="nivel">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="1">Nivel 1</SelectItem>
                  <SelectItem value="2">Nivel 2</SelectItem>
                  <SelectItem value="3">Nivel 3</SelectItem>
                  <SelectItem value="4">Nivel 4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Filtros adicionales</Label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOnlyActive}
                    onChange={(e) => setShowOnlyActive(e.target.checked)}
                    className="rounded"
                  />
                  Solo activas
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm opacity-0">Spacer</Label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOnlyMovement}
                    onChange={(e) => setShowOnlyMovement(e.target.checked)}
                    className="rounded"
                  />
                  Solo con movimiento
                </label>
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Mostrando <strong>{filteredCuentas.length}</strong> de <strong>{cuentas.length}</strong> cuentas
          </div>
        </CardContent>
      </Card>

      {/* Lista de cuentas */}
      <Card>
        <CardContent className="p-0">
          {filteredCuentas.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No se encontraron cuentas con los filtros aplicados
            </div>
          ) : (
            <div>
              {filteredCuentas.map(cuenta => renderCuentaTree(cuenta))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanCuentas;
