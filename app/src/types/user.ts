// ==========================================
// User Profile Types
// ==========================================

export interface UserProfile {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  azureAdId: string;
  role: 'ADMIN' | 'USER' | 'VIEWER';
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
}

export interface UpdateUserProfileInput {
  nombre?: string;
  apellido?: string;
  email?: string;
}
