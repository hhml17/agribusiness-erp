import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Global error handler
window.addEventListener('error', (event) => {
  console.error('🔴 Global Error:', event.error);
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif; background: #fee; color: #c00;">
      <h1>❌ Error de Carga</h1>
      <p><strong>Mensaje:</strong> ${event.error?.message || event.message}</p>
      <p><strong>Archivo:</strong> ${event.filename}</p>
      <p><strong>Línea:</strong> ${event.lineno}:${event.colno}</p>
      <pre style="background: #fff; padding: 10px; overflow: auto;">${event.error?.stack || 'No stack trace'}</pre>
    </div>
  `;
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🔴 Unhandled Promise Rejection:', event.reason);
});

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (error) {
  console.error('🔴 Error al renderizar:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif; background: #fee; color: #c00;">
      <h1>❌ Error al Iniciar la Aplicación</h1>
      <p><strong>Error:</strong> ${error instanceof Error ? error.message : String(error)}</p>
      <pre style="background: #fff; padding: 10px; overflow: auto;">${error instanceof Error ? error.stack : ''}</pre>
    </div>
  `;
}
