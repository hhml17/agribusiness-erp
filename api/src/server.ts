import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './config/database.js';

// Import routes - Commercial
import tenantsRoutes from './routes/tenants.routes.js';
import productosRoutes from './routes/productos.routes.js';
import clientesRoutes from './routes/clientes.routes.js';
import proveedoresRoutes from './routes/proveedores.routes.js';
import ventasRoutes from './routes/ventas.routes.js';
import comprasRoutes from './routes/compras.routes.js';

// Import routes - Accounting
import planCuentasRoutes from './routes/planCuentas.routes.js';
import centroCostoRoutes from './routes/centroCosto.routes.js';
import asientoContableRoutes from './routes/asientoContable.routes.js';
import reportesRoutes from './routes/reportes.routes.js';

// Import routes - Payment Module
import cuentaBancariaRoutes from './routes/cuentaBancaria.routes.js';
import ordenCompraRoutes from './routes/ordenCompra.routes.js';
import facturaCompraRoutes from './routes/facturaCompra.routes.js';
import ordenPagoRoutes from './routes/ordenPago.routes.js';

// Load environment variables
dotenv.config();

// Export prisma for backward compatibility
export { prisma };

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// MIDDLEWARE
// ==========================================

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ==========================================
// ROUTES
// ==========================================

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API routes
app.get('/api', (req, res) => {
    res.json({
        message: 'Agribusiness API v1.0',
        endpoints: {
            health: '/health',
            tenants: '/api/tenants',
            // Commercial
            productos: '/api/productos',
            clientes: '/api/clientes',
            proveedores: '/api/proveedores',
            ventas: '/api/ventas',
            compras: '/api/compras',
            // Accounting
            planCuentas: '/api/plan-cuentas',
            centrosCosto: '/api/centros-costo',
            asientos: '/api/asientos',
            reportes: '/api/reportes',
            // Payment Module
            cuentasBancarias: '/api/cuentas-bancarias',
            ordenesCompra: '/api/ordenes-compra',
            facturasCompra: '/api/facturas-compra',
            ordenesPago: '/api/ordenes-pago'
        }
    });
});

// Mount routes - Commercial
app.use('/api/tenants', tenantsRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/compras', comprasRoutes);

// Mount routes - Accounting
app.use('/api/plan-cuentas', planCuentasRoutes);
app.use('/api/centros-costo', centroCostoRoutes);
app.use('/api/asientos', asientoContableRoutes);
app.use('/api/reportes', reportesRoutes);

// Mount routes - Payment Module
app.use('/api/cuentas-bancarias', cuentaBancariaRoutes);
app.use('/api/ordenes-compra', ordenCompraRoutes);
app.use('/api/facturas-compra', facturaCompraRoutes);
app.use('/api/ordenes-pago', ordenPagoRoutes);

// ==========================================
// ERROR HANDLING
// ==========================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`
    });
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// ==========================================
// START SERVER
// ==========================================

const server = app.listen(PORT, () => {
    console.log('🚀 Agribusiness API Server');
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ Server is running`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
    });
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
    });
    await prisma.$disconnect();
    process.exit(0);
});

export default app;

