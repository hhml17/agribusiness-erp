# Estándar del Plan de Cuentas Contables

## Resumen Ejecutivo

Este documento define el estándar del Plan de Cuentas Contables que debe seguir el sistema Agribusiness ERP, basado en las normativas contables de Paraguay y el Balance General estándar.

## Estructura de Niveles

El Plan de Cuentas sigue una estructura jerárquica de 4 niveles principales:

### Nivel 1: Tipo de Cuenta
Define la naturaleza fundamental de la cuenta contable.

**Códigos:**
- `1` - ACTIVO
- `2` - PASIVO
- `3` - PATRIMONIO NETO
- `4` - INGRESOS
- `5` - EGRESOS (o GASTOS)

**Características:**
- Son cuentas padre de máximo nivel
- **NO aceptan movimientos** (`aceptaMovimiento = false`)
- Solo para agrupación y clasificación
- Aparecen en estados financieros como títulos principales

### Nivel 2: Clasificación
Subdivide cada tipo de cuenta según criterios contables.

**Ejemplos:**
- `1.01` - ACTIVO CORRIENTE
- `1.02` - ACTIVO NO CORRIENTE
- `2.01` - PASIVO CORRIENTE
- `2.02` - PASIVO NO CORRIENTE
- `3.01` - CAPITAL
- `4.01` - INGRESOS OPERACIONALES
- `5.01` - EGRESOS OPERACIONALES

**Características:**
- Son cuentas de clasificación
- **NO aceptan movimientos** (`aceptaMovimiento = false`)
- Agrupan cuentas relacionadas
- Distinción importante: Corriente vs No Corriente (criterio de liquidez a 12 meses)

### Nivel 3: Grupo Contable
Define grupos específicos de cuentas relacionadas.

**Ejemplos:**
- `1.01.01` - DISPONIBILIDADES
- `1.01.02` - INVERSIONES TEMPORALES
- `1.01.03` - INVENTARIOS
- `1.01.04` - CRÉDITOS POR VENTAS
- `2.01.01` - DEUDAS COMERCIALES
- `2.01.02` - DEUDAS FISCALES
- `5.01.01` - GASTOS DE PERSONAL
- `5.01.02` - GASTOS DE ORGANIZACIÓN

**Características:**
- Son cuentas de agrupación
- **NO aceptan movimientos** (`aceptaMovimiento = false`)
- Permiten clasificación detallada para reportes
- Base para análisis financiero por rubros

### Nivel 4: Cuenta de Detalle (Cuenta de Mayor)
Son las cuentas que efectivamente registran transacciones.

**Ejemplos:**
- `1.01.01.01` - CAJA
- `1.01.01.02` - BANCOS
- `1.01.01.03` - INVERSIONES A CORTO PLAZO
- `1.01.03.01` - MERCADERÍAS
- `1.01.03.02` - MATERIAS PRIMAS
- `1.01.03.03` - PRODUCTOS TERMINADOS
- `2.01.01.01` - PROVEEDORES LOCALES
- `5.01.01.01` - SUELDOS Y JORNALES
- `5.01.01.02` - APORTES PATRONALES

**Características:**
- Son cuentas de movimiento
- **SÍ aceptan movimientos** (`aceptaMovimiento = true`)
- **ÚNICO NIVEL que puede asignarse a productos, transacciones, asientos contables**
- Representan el nivel más detallado del plan de cuentas
- Cada cuenta tiene un saldo individual que se refleja en el libro mayor

### Nivel 5+ (Opcional): Subcuentas
Algunas empresas pueden requerir mayor detalle.

**Ejemplos:**
- `1.01.01.02.001` - BANCO ITAÚ - CTA CTE
- `1.01.01.02.002` - BANCO CONTINENTAL - CTA CTE
- `1.01.03.01.001` - MERCADERÍAS - RUBRO A
- `1.01.03.01.002` - MERCADERÍAS - RUBRO B

**Características:**
- Nivel opcional según necesidad de la empresa
- **SÍ aceptan movimientos** (`aceptaMovimiento = true`)
- Permite detalle adicional (por banco, por rubro, por centro de costo, etc.)
- **También pueden asignarse a productos y transacciones**

## Reglas de Validación para Productos

### Validación Backend (API)

**Archivo:** `api/src/services/productos.service.ts`

Cada producto DEBE tener asignadas exactamente **3 cuentas contables**:

1. **Cuenta de Inventario** (Tipo: ACTIVO)
   - Registra el valor del inventario del producto
   - Generalmente bajo `1.01.03` (INVENTARIOS)
   - Ejemplo: `1.01.03.01` - Mercaderías

2. **Cuenta de Costo** (Tipo: EGRESO)
   - Registra el costo cuando se vende o consume el producto
   - Generalmente bajo `5.01` (EGRESOS OPERACIONALES)
   - Ejemplo: `5.01.03.01` - Costo de Mercaderías Vendidas

3. **Cuenta de Ingreso** (Tipo: INGRESO)
   - Registra el ingreso cuando se vende el producto
   - Generalmente bajo `4.01` (INGRESOS OPERACIONALES)
   - Ejemplo: `4.01.01.01` - Ventas de Mercaderías

### Criterios de Validación

Para que una cuenta pueda ser asignada a un producto, DEBE cumplir:

1. ✅ `activo = true` - La cuenta debe estar activa
2. ✅ `aceptaMovimiento = true` - Debe aceptar movimientos (no ser cuenta padre/grupo)
3. ✅ `nivel >= 4` - SOLO cuentas de nivel 4 o superior
4. ✅ `tipo` debe coincidir con el uso:
   - ACTIVO para cuenta de inventario
   - EGRESO para cuenta de costo
   - INGRESO para cuenta de ingreso

**Código de validación:**
```typescript
if (cuenta.nivel < 4) {
  throw new Error(`${nombreCampo}: Solo se pueden asignar cuentas de nivel 4 o superior (cuentas de detalle). Esta cuenta es de nivel ${cuenta.nivel}`);
}
```

### Validación Frontend

**Archivo:** `app/src/components/CuentaContableSelect.tsx`

El componente filtra automáticamente las cuentas para mostrar solo las válidas:

```typescript
const cuentasValidas = data.filter(c => c.aceptaMovimiento && c.nivel >= 4);
```

Esto asegura que el usuario **solo pueda seleccionar** cuentas de nivel 4 o superior.

## Beneficios de esta Estructura

### 1. Cumplimiento Normativo
- Sigue estándares contables de Paraguay
- Compatible con Balance General y Estado de Resultados estándar
- Facilita auditorías y presentación a organismos fiscales

### 2. Integridad de Datos
- Previene asignación incorrecta de cuentas a productos
- Asegura que solo cuentas de detalle tengan movimientos
- Mantiene jerarquía correcta para reportes consolidados

### 3. Reportes Precisos
- Permite consolidación automática por niveles
- Balance General se genera sumando niveles inferiores
- Análisis por rubros (nivel 3) y clasificación (nivel 2)

### 4. Flexibilidad
- Permite agregar subcuentas (nivel 5+) según necesidad
- Estructura escalable para empresas de cualquier tamaño
- Compatibilidad con centros de costo y otras dimensiones

## Ejemplos Prácticos

### Ejemplo 1: Producto "Ganado Bovino"

**Configuración:**
- **Código Producto:** `PROD-001`
- **Nombre:** Ganado Bovino
- **Cuenta Inventario:** `1.01.03.05` - Inventario Ganado Bovino (ACTIVO, Nivel 4)
- **Cuenta Costo:** `5.01.05.01` - Costo de Ganado Vendido (EGRESO, Nivel 4)
- **Cuenta Ingreso:** `4.01.01.05` - Ventas de Ganado (INGRESO, Nivel 4)

**Cuando se compra ganado:**
```
DEBE: 1.01.03.05 - Inventario Ganado Bovino
HABER: 1.01.01.02 - Bancos (o cuenta de pago)
```

**Cuando se vende ganado:**
```
Venta:
DEBE: 1.01.01.02 - Bancos (o cuenta cobro)
HABER: 4.01.01.05 - Ventas de Ganado

Costo:
DEBE: 5.01.05.01 - Costo de Ganado Vendido
HABER: 1.01.03.05 - Inventario Ganado Bovino
```

### Ejemplo 2: Producto "Semillas de Soja"

**Configuración:**
- **Código Producto:** `PROD-002`
- **Nombre:** Semillas de Soja
- **Cuenta Inventario:** `1.01.03.02` - Materias Primas (ACTIVO, Nivel 4)
- **Cuenta Costo:** `5.01.03.01` - Costo de Materias Primas (EGRESO, Nivel 4)
- **Cuenta Ingreso:** `4.01.01.02` - Ventas de Insumos Agrícolas (INGRESO, Nivel 4)

## Errores Comunes a Evitar

### ❌ Error 1: Asignar cuenta de nivel 1, 2 o 3
```
Producto X -> Cuenta: 1.01 (ACTIVO CORRIENTE)
```
**Problema:** Nivel 2 es cuenta de clasificación, NO acepta movimientos.

**Correcto:**
```
Producto X -> Cuenta: 1.01.03.01 (Mercaderías - Nivel 4)
```

### ❌ Error 2: Asignar cuenta con `aceptaMovimiento = false`
```
Producto Y -> Cuenta: 1.01.03 (INVENTARIOS - Grupo)
```
**Problema:** Cuenta de grupo, diseñada para consolidación.

**Correcto:**
```
Producto Y -> Cuenta: 1.01.03.01 (Mercaderías específicas - Nivel 4)
```

### ❌ Error 3: Tipo incorrecto de cuenta
```
Producto Z -> Cuenta Inventario: 5.01.01.01 (Sueldos - EGRESO)
```
**Problema:** La cuenta de inventario debe ser tipo ACTIVO, no EGRESO.

**Correcto:**
```
Producto Z -> Cuenta Inventario: 1.01.03.01 (ACTIVO - Nivel 4)
```

## Implementación Técnica

### Schema Prisma

```prisma
model Producto {
  // ... otros campos

  // Relaciones con Plan de Cuentas
  cuentaInventarioId String?
  cuentaInventario   PlanCuentas? @relation("ProductoInventario", fields: [cuentaInventarioId], references: [id])

  cuentaCostoId String?
  cuentaCosto   PlanCuentas? @relation("ProductoCosto", fields: [cuentaCostoId], references: [id])

  cuentaIngresoId String?
  cuentaIngreso   PlanCuentas? @relation("ProductoIngreso", fields: [cuentaIngresoId], references: [id])
}

model PlanCuentas {
  id                String   @id @default(uuid())
  codigo            String
  nombre            String
  tipo              TipoCuenta
  nivel             Int
  aceptaMovimiento  Boolean
  activo            Boolean  @default(true)

  // Relaciones inversas
  productosInventario Producto[] @relation("ProductoInventario")
  productosCosto      Producto[] @relation("ProductoCosto")
  productosIngreso    Producto[] @relation("ProductoIngreso")
}

enum TipoCuenta {
  ACTIVO
  PASIVO
  PATRIMONIO
  INGRESO
  EGRESO
}
```

### Servicio de Validación

El servicio `productos.service.ts` implementa la función `validateCuentaContable()` que verifica todos los criterios antes de permitir la asignación.

### Componente Frontend

El componente `CuentaContableSelect.tsx` filtra automáticamente para mostrar solo cuentas válidas según el tipo y nivel requerido.

## Referencias

- Balance General - Anexo 1 (Estándar contable Paraguay)
- Normas Internacionales de Información Financiera (NIIF)
- Resolución General N° 4814 (Modelo de Balance)

## Actualización

**Fecha:** 26 de diciembre de 2025
**Versión:** 1.0
**Autor:** Sistema Agribusiness ERP

---

## Notas para Desarrolladores

1. **NUNCA** permitir asignación de cuentas de nivel < 4 a productos
2. **SIEMPRE** validar `aceptaMovimiento = true` antes de asignar
3. **VERIFICAR** que el tipo de cuenta coincida con el uso (ACTIVO para inventario, etc.)
4. **MANTENER** la jerarquía correcta al crear nuevas cuentas
5. **DOCUMENTAR** cualquier desviación del estándar con justificación clara

Esta estructura asegura integridad contable, facilita reportes y cumple con normativas vigentes.
