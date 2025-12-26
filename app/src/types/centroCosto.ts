// ==========================================
// Centro de Costo Types
// ==========================================

export interface CentroCosto {
  id: string;
  tenantId: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCentroCostoInput {
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo?: string;
}

export interface UpdateCentroCostoInput extends Partial<CreateCentroCostoInput> {
  activo?: boolean;
}

export interface CentroCostoFilters {
  tipo?: string;
  activo?: boolean;
}
