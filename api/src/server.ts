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
import cuentaContableRoutes from './routes/cuentaContable.routes.js';
import asientoContableRoutes from './routes/asientoContable.routes.js';
import reportesRoutes from './routes/reportes.routes.js';

// Import routes - Payment Module
import cuentaBancariaRoutes from './routes/cuentaBancaria.routes.js';
import ordenCompraRoutes from './routes/ordenCompra.routes.js';
import facturaCompraRoutes from './routes/facturaCompra.routes.js';
import ordenPagoRoutes from './routes/ordenPago.routes.js';

// Import routes - Actores y Empresa Module
import actoresRoutes from './routes/actores.routes.js';
import estanciasRoutes from './routes/estancias.routes.js';
import talonariosRoutes from './routes/talonarios.routes.js';
import facturasEmitidasRoutes from './routes/facturasEmitidas.routes.js';

// Import routes - Users Module
import usersRoutes from './routes/users.routes.js';

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

// Health check with database connection test
app.get('/health', async (req, res) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
            connected: false,
            message: ''
        }
    };

    try {
        // Test database connection with a simple query
        await prisma.$queryRaw`SELECT 1 as test`;
        health.database.connected = true;
        health.database.message = 'Database connected successfully';
    } catch (error: any) {
        health.status = 'error';
        health.database.connected = false;
        health.database.message = `Database connection failed: ${error.message}`;
    }

    const statusCode = health.database.connected ? 200 : 503;
    res.status(statusCode).json(health);
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
            cuentasContables: '/api/cuentas-contables',
            asientos: '/api/asientos',
            reportes: '/api/reportes',
            // Payment Module
            cuentasBancarias: '/api/cuentas-bancarias',
            ordenesCompra: '/api/ordenes-compra',
            facturasCompra: '/api/facturas-compra',
            ordenesPago: '/api/ordenes-pago',
            // Actores y Empresa Module
            actores: '/api/actores',
            estancias: '/api/estancias',
            talonarios: '/api/talonarios',
            facturasEmitidas: '/api/facturas-emitidas',
            // Users Module
            users: '/api/users'
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
app.use('/api/cuentas-contables', cuentaContableRoutes);
app.use('/api/asientos', asientoContableRoutes);
app.use('/api/reportes', reportesRoutes);

// Mount routes - Payment Module
app.use('/api/cuentas-bancarias', cuentaBancariaRoutes);
app.use('/api/ordenes-compra', ordenCompraRoutes);
app.use('/api/facturas-compra', facturaCompraRoutes);
app.use('/api/ordenes-pago', ordenPagoRoutes);

// Mount routes - Actores y Empresa Module
app.use('/api/actores', actoresRoutes);
app.use('/api/estancias', estanciasRoutes);
app.use('/api/talonarios', talonariosRoutes);
app.use('/api/facturas-emitidas', facturasEmitidasRoutes);

// Mount routes - Users Module
app.use('/api/users', usersRoutes);

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

