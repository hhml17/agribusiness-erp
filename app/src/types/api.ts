// ==========================================
// API Response Types
// ==========================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  message?: string;
}

// ==========================================
// Tenant Types
// ==========================================

export interface Tenant {
  id: string;
  nombre: string;
  ruc: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantInput {
  nombre: string;
  ruc: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}

export interface UpdateTenantInput extends Partial<CreateTenantInput> {
  activo?: boolean;
}

// ==========================================
// User Types
// ==========================================

export type UserRole = 'ADMIN' | 'USER' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido?: string;
  azureAdId?: string;
  role: UserRole;
  tenantId: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// Producto Types
// ==========================================

export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  unidadMedida: string;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  stockMinimo?: number;
  activo: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductoInput {
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  unidadMedida: string;
  precioCompra: number;
  precioVenta: number;
  stock?: number;
  stockMinimo?: number;
}

export interface UpdateProductoInput extends Partial<CreateProductoInput> {
  activo?: boolean;
}

export interface ProductoFilters {
  categoria?: string;
  activo?: boolean;
}

// ==========================================
// Cliente Types
// ==========================================

export interface Cliente {
  id: string;
  codigo: string;
  nombre: string;
  ruc?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  ventas?: Venta[];
}

export interface CreateClienteInput {
  codigo: string;
  nombre: string;
  ruc?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}

export interface UpdateClienteInput extends Partial<CreateClienteInput> {
  activo?: boolean;
}

export interface ClienteFilters {
  activo?: boolean;
}

// ==========================================
// Proveedor Types
// ==========================================

export interface Proveedor {
  id: string;
  codigo: string;
  nombre: string;
  ruc?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  compras?: Compra[];
}

export interface CreateProveedorInput {
  codigo: string;
  nombre: string;
  ruc?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}

export interface UpdateProveedorInput extends Partial<CreateProveedorInput> {
  activo?: boolean;
}

export interface ProveedorFilters {
  activo?: boolean;
}

// ==========================================
// Venta Types
// ==========================================

export type EstadoVenta = 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA';

export interface VentaItem {
  id: string;
  ventaId: string;
  productoId: string;
  producto?: Producto;
  cantidad: number;
  precioUnit: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface Venta {
  id: string;
  numero: string;
  fecha: string;
  clienteId?: string;
  cliente?: Cliente;
  subtotal: number;
  impuesto: number;
  total: number;
  estado: EstadoVenta;
  observaciones?: string;
  tenantId: string;
  items: VentaItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateVentaItemInput {
  productoId: string;
  cantidad: number;
  precioUnit?: number;
}

export interface CreateVentaInput {
  numero: string;
  clienteId?: string;
  items: CreateVentaItemInput[];
  observaciones?: string;
}

export interface UpdateVentaInput {
  estado?: EstadoVenta;
  observaciones?: string;
}

export interface VentaFilters {
  estado?: EstadoVenta;
  desde?: string;
  hasta?: string;
}

// ==========================================
// Compra Types
// ==========================================

export type EstadoCompra = 'PENDIENTE' | 'RECIBIDA' | 'CANCELADA';

export interface CompraItem {
  id: string;
  compraId: string;
  productoId: string;
  producto?: Producto;
  cantidad: number;
  precioUnit: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface Compra {
  id: string;
  numero: string;
  fecha: string;
  proveedorId?: string;
  proveedor?: Proveedor;
  subtotal: number;
  impuesto: number;
  total: number;
  estado: EstadoCompra;
  observaciones?: string;
  tenantId: string;
  items: CompraItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompraItemInput {
  productoId: string;
  cantidad: number;
  precioUnit?: number;
}

export interface CreateCompraInput {
  numero: string;
  proveedorId?: string;
  items: CreateCompraItemInput[];
  observaciones?: string;
}

export interface UpdateCompraInput {
  estado?: EstadoCompra;
  observaciones?: string;
}

export interface CompraFilters {
  estado?: EstadoCompra;
  desde?: string;
  hasta?: string;
}

// ==========================================
// Dashboard Types
// ==========================================

export interface DashboardMetrics {
  totalVentas: number;
  totalCompras: number;
  productosActivos: number;
  productosBajoStock: number;
  clientesActivos: number;
  proveedoresActivos: number;
  ventasMesActual: number;
  comprasMesActual: number;
}
