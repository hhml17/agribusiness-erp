#!/bin/bash

# Script para arreglar nombres de modelos Prisma en controladores
# Los modelos en Prisma Client usan camelCase

echo "🔧 Arreglando nombres de modelos Prisma en controladores..."

# Directorio de controladores y middleware
CONTROLLERS_DIR="src/controllers"
MIDDLEWARE_DIR="src/middleware"

# Función para hacer los reemplazos
fix_file() {
  local file=$1
  echo "  Procesando: $file"

  # Backup
  cp "$file" "$file.bak"

  # Reemplazos - IMPORTANTE: El orden importa para evitar reemplazos dobles

  # AsientoContable -> asientoContable
  sed -i '' 's/prisma\.AsientoContable/prisma.asientoContable/g' "$file"

  # CentroCosto -> centroCosto
  sed -i '' 's/prisma\.CentroCosto/prisma.centroCosto/g' "$file"

  # PlanCuentas -> planCuentas
  sed -i '' 's/prisma\.PlanCuentas/prisma.planCuentas/g' "$file"

  # LineaAsiento -> lineaAsiento
  sed -i '' 's/prisma\.LineaAsiento/prisma.lineaAsiento/g' "$file"

  # Cliente -> cliente
  sed -i '' 's/prisma\.Cliente/prisma.cliente/g' "$file"

  # Proveedor -> proveedor
  sed -i '' 's/prisma\.Proveedor/prisma.proveedor/g' "$file"

  # Producto -> producto
  sed -i '' 's/prisma\.Producto/prisma.producto/g' "$file"

  # Compra -> compra
  sed -i '' 's/prisma\.Compra/prisma.compra/g' "$file"

  # CompraItem -> compraItem
  sed -i '' 's/prisma\.CompraItem/prisma.compraItem/g' "$file"

  # Venta -> venta
  sed -i '' 's/prisma\.Venta/prisma.venta/g' "$file"

  # VentaItem -> ventaItem
  sed -i '' 's/prisma\.VentaItem/prisma.ventaItem/g' "$file"

  # Tenant -> tenant
  sed -i '' 's/prisma\.Tenant/prisma.tenant/g' "$file"

  # Usuario -> usuario
  sed -i '' 's/prisma\.Usuario/prisma.usuario/g' "$file"

  # CategoriaGanado -> categoriaGanado
  sed -i '' 's/prisma\.CategoriaGanado/prisma.categoriaGanado/g' "$file"

  # Ganado -> ganado
  sed -i '' 's/prisma\.Ganado/prisma.ganado/g' "$file"

  # MovimientoGanado -> movimientoGanado
  sed -i '' 's/prisma\.MovimientoGanado/prisma.movimientoGanado/g' "$file"

  # CuentaBancaria -> cuentaBancaria
  sed -i '' 's/prisma\.CuentaBancaria/prisma.cuentaBancaria/g' "$file"

  # Chequera -> chequera
  sed -i '' 's/prisma\.Chequera/prisma.chequera/g' "$file"

  # Cheque -> cheque
  sed -i '' 's/prisma\.Cheque/prisma.cheque/g' "$file"

  # OrdenCompra -> ordenCompra
  sed -i '' 's/prisma\.OrdenCompra/prisma.ordenCompra/g' "$file"

  # ItemOrdenCompra -> itemOrdenCompra
  sed -i '' 's/prisma\.ItemOrdenCompra/prisma.itemOrdenCompra/g' "$file"

  # FacturaCompra -> facturaCompra
  sed -i '' 's/prisma\.FacturaCompra/prisma.facturaCompra/g' "$file"

  # OrdenPago -> ordenPago
  sed -i '' 's/prisma\.OrdenPago/prisma.ordenPago/g' "$file"

  # Retencion -> retencion
  sed -i '' 's/prisma\.Retencion/prisma.retencion/g' "$file"

  # MovimientoBancario -> movimientoBancario
  sed -i '' 's/prisma\.MovimientoBancario/prisma.movimientoBancario/g' "$file"

  # ExtractoBancario -> extractoBancario
  sed -i '' 's/prisma\.ExtractoBancario/prisma.extractoBancario/g' "$file"

  # LineaExtractoBancario -> lineaExtractoBancario
  sed -i '' 's/prisma\.LineaExtractoBancario/prisma.lineaExtractoBancario/g' "$file"
}

# Procesar todos los controladores
for file in $CONTROLLERS_DIR/*.ts; do
  if [ -f "$file" ]; then
    fix_file "$file"
  fi
done

# Procesar middleware
for file in $MIDDLEWARE_DIR/*.ts; do
  if [ -f "$file" ]; then
    fix_file "$file"
  fi
done

echo "✅ Archivos procesados"
echo ""
echo "🧪 Verificando compilación..."
npm run build

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ ¡Compilación exitosa!"
  echo "🗑️  Eliminando backups..."
  find $CONTROLLERS_DIR -name "*.bak" -delete
  find $MIDDLEWARE_DIR -name "*.bak" -delete
  echo "✅ Listo!"
else
  echo ""
  echo "❌ Compilación falló. Restaurando backups..."
  for file in $CONTROLLERS_DIR/*.bak; do
    if [ -f "$file" ]; then
      mv "$file" "${file%.bak}"
    fi
  done
  for file in $MIDDLEWARE_DIR/*.bak; do
    if [ -f "$file" ]; then
      mv "$file" "${file%.bak}"
    fi
  done
  echo "⚠️  Archivos restaurados. Revisa los errores."
  exit 1
fi
