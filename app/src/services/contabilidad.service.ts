import apiClient from '../config/apiClient';
import type {
  PlanCuentas,
  PlanCuentasFormData,
  CentroCosto,
  CentroCostoFormData,
  AsientoContable,
  AsientoFormData,
  BalanceGeneral,
  EstadoResultados,
  LibroMayor,
  ApiResponse,
} from '../types/contabilidad';

// ==========================================
// PLAN DE CUENTAS
// ==========================================

export const contabilidadService = {
  // Plan de Cuentas
  planCuentas: {
    async getAll(params?: {
      tipo?: string;
      nivel?: number;
      cuentaPadreId?: string;
      activo?: boolean;
      aceptaMovimiento?: boolean;
      includeHijas?: boolean;
    }): Promise<{ cuentas: PlanCuentas[]; total: number }> {
      const response = await apiClient.get<ApiResponse<{ cuentas: PlanCuentas[]; total: number }>>(
        '/api/plan-cuentas',
        { params }
      );
      return response.data.data;
    },

    async getById(id: string): Promise<PlanCuentas> {
      const response = await apiClient.get<ApiResponse<PlanCuentas>>(`/api/plan-cuentas/${id}`);
      return response.data.data;
    },

    async create(data: PlanCuentasFormData): Promise<PlanCuentas> {
      const response = await apiClient.post<ApiResponse<PlanCuentas>>('/api/plan-cuentas', data);
      return response.data.data;
    },

    async update(id: string, data: Partial<PlanCuentasFormData>): Promise<PlanCuentas> {
      const response = await apiClient.put<ApiResponse<PlanCuentas>>(`/api/plan-cuentas/${id}`, data);
      return response.data.data;
    },

    async delete(id: string): Promise<void> {
      await apiClient.delete(`/api/plan-cuentas/${id}`);
    },
  },

  // Centros de Costo
  centrosCosto: {
    async getAll(params?: {
      tipo?: string;
      activo?: boolean;
    }): Promise<{ centros: CentroCosto[]; total: number }> {
      const response = await apiClient.get<ApiResponse<{ centros: CentroCosto[]; total: number }>>(
        '/api/centros-costo',
        { params }
      );
      return response.data.data;
    },

    async getById(id: string): Promise<CentroCosto> {
      const response = await apiClient.get<ApiResponse<CentroCosto>>(`/api/centros-costo/${id}`);
      return response.data.data;
    },

    async create(data: CentroCostoFormData): Promise<CentroCosto> {
      const response = await apiClient.post<ApiResponse<CentroCosto>>('/api/centros-costo', data);
      return response.data.data;
    },

    async update(id: string, data: Partial<CentroCostoFormData>): Promise<CentroCosto> {
      const response = await apiClient.put<ApiResponse<CentroCosto>>(`/api/centros-costo/${id}`, data);
      return response.data.data;
    },
  },

  // Asientos Contables
  asientos: {
    async getAll(params?: {
      tipo?: string;
      estado?: string;
      fechaDesde?: string;
      fechaHasta?: string;
      page?: number;
      limit?: number;
    }): Promise<{
      asientos: AsientoContable[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }> {
      const response = await apiClient.get<
        ApiResponse<{
          asientos: AsientoContable[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
          };
        }>
      >('/api/asientos', { params });
      return response.data.data;
    },

    async getById(id: string): Promise<AsientoContable> {
      const response = await apiClient.get<ApiResponse<AsientoContable>>(`/api/asientos/${id}`);
      return response.data.data;
    },

    async create(data: AsientoFormData): Promise<AsientoContable> {
      const response = await apiClient.post<ApiResponse<AsientoContable>>('/api/asientos', data);
      return response.data.data;
    },

    async contabilizar(id: string): Promise<AsientoContable> {
      const response = await apiClient.put<ApiResponse<AsientoContable>>(`/api/asientos/${id}/contabilizar`);
      return response.data.data;
    },

    async anular(id: string, motivoAnulacion: string): Promise<AsientoContable> {
      const response = await apiClient.put<ApiResponse<AsientoContable>>(
        `/api/asientos/${id}/anular`,
        { motivoAnulacion }
      );
      return response.data.data;
    },
  },

  // Reportes
  reportes: {
    async getBalance(params?: {
      fechaHasta?: string;
      nivel?: number;
    }): Promise<BalanceGeneral> {
      const response = await apiClient.get<BalanceGeneral>('/api/reportes/balance', { params });
      return response.data;
    },

    async getEstadoResultados(params?: {
      fechaDesde?: string;
      fechaHasta?: string;
      nivel?: number;
    }): Promise<EstadoResultados> {
      const response = await apiClient.get<EstadoResultados>('/api/reportes/estado-resultados', {
        params,
      });
      return response.data;
    },

    async getMayor(params: {
      cuentaId: string;
      fechaDesde?: string;
      fechaHasta?: string;
    }): Promise<LibroMayor> {
      const response = await apiClient.get<LibroMayor>('/api/reportes/libro-mayor', { params });
      return response.data;
    },
  },
};

export default contabilidadService;
