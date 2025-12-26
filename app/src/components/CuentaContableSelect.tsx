import { useEffect, useState } from 'react';
import { cuentaContableService } from '../services/api';
import type { CuentaContable, TipoCuenta } from '../types/cuentaContable';

interface CuentaContableSelectProps {
  value: string;
  onChange: (value: string) => void;
  tipo: TipoCuenta;
  label: string;
  required?: boolean;
  error?: string;
}

export function CuentaContableSelect({
  value,
  onChange,
  tipo,
  label,
  required = false,
  error
}: CuentaContableSelectProps) {
  const [cuentas, setCuentas] = useState<CuentaContable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCuentas();
  }, [tipo]);

  const loadCuentas = async () => {
    try {
      setLoading(true);
      const data = await cuentaContableService.getAll({
        activo: true,
        tipo
      });

      // Filtrar solo cuentas de nivel 4 o superior (cuentas de detalle según estándar contable)
      // Nivel 1: Tipo (ACTIVO, PASIVO, etc.)
      // Nivel 2: Clasificación (Corriente, No Corriente)
      // Nivel 3: Grupo (Disponibilidades, Inversiones, etc.)
      // Nivel 4+: Cuentas de detalle (CAJA, BANCOS, etc.) - Solo estas aceptan movimientos
      const cuentasValidas = data.filter(c => c.aceptaMovimiento && c.nivel >= 4);
      setCuentas(cuentasValidas);
    } catch (error) {
      console.error('Error loading cuentas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-group">
      <label htmlFor={`cuenta-${tipo}`}>
        {label} {required && <span className="required">*</span>}
      </label>
      <select
        id={`cuenta-${tipo}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={loading}
      >
        <option value="">
          {loading ? 'Cargando...' : 'Seleccione una cuenta'}
        </option>
        {cuentas.map((cuenta) => (
          <option key={cuenta.id} value={cuenta.id}>
            {cuenta.codigo} - {cuenta.nombre}
          </option>
        ))}
      </select>
      {error && <div className="error-message">{error}</div>}
      {cuentas.length === 0 && !loading && (
        <div className="text-muted mt-1">
          No hay cuentas de tipo {tipo} disponibles para seleccionar
        </div>
      )}
    </div>
  );
}
