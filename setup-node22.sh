#!/bin/bash

# Script de Migración a Node.js 22
# Agribusiness ERP - Frontend y Backend
# Autor: Hans Harder
# Fecha: Diciembre 26, 2025

set -e  # Salir si hay algún error

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🚀 Migración a Node.js 22 - Agribusiness ERP                 ║"
echo "║  Frontend (React + Vite) + Backend (Node.js + Prisma)        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Función para mostrar mensajes con colores
info() {
    echo -e "\n\033[1;34m[INFO]\033[0m $1"
}

success() {
    echo -e "\033[1;32m[✓]\033[0m $1"
}

error() {
    echo -e "\033[1;31m[✗]\033[0m $1"
}

warning() {
    echo -e "\033[1;33m[!]\033[0m $1"
}

# Verificar que estamos en la raíz del proyecto
if [ ! -f ".nvmrc" ]; then
    error "Este script debe ejecutarse desde la raíz del proyecto"
    exit 1
fi

# Paso 1: Verificar/Cambiar a Node 22
info "Paso 1: Verificando versión de Node.js..."

if command -v nvm &> /dev/null; then
    success "nvm encontrado"
    info "Cambiando a Node.js 22..."

    # Cargar nvm
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

    # Cambiar a Node 22
    nvm use 22 || {
        warning "Node.js 22 no encontrado. Instalando..."
        nvm install 22
        nvm use 22
    }
else
    warning "nvm no encontrado. Verifica que Node.js 22 esté instalado manualmente"
fi

NODE_VERSION=$(node -v)
info "Versión actual de Node.js: $NODE_VERSION"

if [[ ! "$NODE_VERSION" =~ ^v22\. ]]; then
    error "Se requiere Node.js 22.x. Versión actual: $NODE_VERSION"
    error "Instala Node.js 22 con: nvm install 22 && nvm use 22"
    exit 1
fi

success "Node.js 22 activo ✓"

# Paso 2: Backend
info "Paso 2: Configurando Backend (API)..."

cd api

info "Limpiando instalación anterior del backend..."
rm -rf node_modules package-lock.json

info "Instalando dependencias del backend..."
npm install

success "Dependencias del backend instaladas ✓"

info "Generando Prisma Client..."
npm run prisma:generate || {
    error "Error al generar Prisma Client"
    exit 1
}

success "Prisma Client generado ✓"

info "Compilando TypeScript del backend..."
npm run build || {
    error "Error al compilar TypeScript del backend"
    exit 1
}

success "Backend compilado correctamente ✓"

cd ..

# Paso 3: Frontend
info "Paso 3: Configurando Frontend (App)..."

cd app

info "Limpiando instalación anterior del frontend..."
rm -rf node_modules package-lock.json

info "Instalando dependencias del frontend..."
npm install

success "Dependencias del frontend instaladas ✓"

info "Compilando TypeScript del frontend..."
npm run build || {
    error "Error al compilar TypeScript del frontend"
    exit 1
}

success "Frontend compilado correctamente ✓"

cd ..

# Resumen Final
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  ✅ MIGRACIÓN COMPLETADA EXITOSAMENTE                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
success "Node.js: $NODE_VERSION"
success "Backend: Compilado y listo"
success "Frontend: Compilado y listo"
success "Prisma Client: Generado"
echo ""
info "Próximos pasos:"
echo "  1. Backend (desarrollo):  cd api && npm run dev"
echo "  2. Frontend (desarrollo): cd app && npm run dev"
echo "  3. Backend (producción):  cd api && npm start"
echo "  4. Frontend (producción): cd app && npm run preview"
echo ""
info "Documentación:"
echo "  - Guía completa: MIGRACION-NODE22.md"
echo "  - Backend:       api/PASOS-FINALES-MIGRACION.md"
echo "  - Changelog:     documentacion/CHANGELOG-MIGRACION-NODE22-PRISMA7.md"
echo ""
success "¡Todo listo para desarrollo! 🚀"
