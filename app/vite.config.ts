import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Copy staticwebapp.config.json to dist after build
    {
      name: 'copy-static-web-app-config',
      closeBundle() {
        try {
          copyFileSync(
            resolve(__dirname, 'public/staticwebapp.config.json'),
            resolve(__dirname, 'dist/staticwebapp.config.json')
          )
          console.log('✓ Copied staticwebapp.config.json to dist/')
        } catch (err) {
          console.warn('⚠ Could not copy staticwebapp.config.json:', err)
        }
      }
    }
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    },
    headers: {
      'Content-Type': 'text/javascript; charset=utf-8'
    }
  },
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'msal-vendor': ['@azure/msal-browser', '@azure/msal-react']
        },
        // Ensure correct file extensions
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 600,
    // Ensure source maps for debugging
    sourcemap: true
  }
})
