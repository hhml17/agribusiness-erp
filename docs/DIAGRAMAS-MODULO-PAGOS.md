# Diagramas del Módulo de Pagos

## Diagrama de Entidad-Relación (ER)

```
┌─────────────────┐
│     Tenant      │
└────────┬────────┘
         │
         │ 1:N
         │
    ┌────┴────┬──────────┬────────────┬──────────────┐
    │         │          │            │              │
    │         │          │            │              │
┌───▼────┐  ┌─▼──────┐ ┌▼────────┐  ┌▼─────────┐  ┌▼────────────┐
│Proveedor│ │Producto│ │PlanCuentas│ │OrdenCompra│ │CuentaBancaria│
└───┬────┘  └───┬────┘ └────┬─────┘  └────┬──────┘ └────┬────────┘
    │           │            │             │             │
    │           │            │             │             │ 1:N
    │           │            │             │ 1:N         │
    │           │            │             │         ┌───▼───────┐
    │           │            │         ┌───▼─────┐   │ Chequera  │
    │           │            │         │ItemOC   │   └───────────┘
    │           │            │         │(1:N)    │
    │           └────────────┼─────────┴─────────┘
    │                        │             │
    │ N:1                    │ 0:1         │ 0:1
    │                        │             │
┌───▼──────────┐            │         ┌───▼──────────┐
│FacturaCompra │◄───────────┘         │              │
└───┬──────────┘                      │              │
    │                                 │              │
    │ 0:1                             │              │
    │                             ┌───▼──────────┐   │
    │                             │  OrdenPago   │   │
    └─────────────────────────────┤              │   │
                                  │              │◄──┘ 0:1
                                  └───┬──────────┘
                                      │
                              ┌───────┴────────┐
                              │                │
                          1:N │            1:N │
                              │                │
                    ┌─────────▼┐         ┌────▼──────────┐
                    │Retencion │         │MovimientoBanc.│
                    └──────────┘         └────┬──────────┘
                                              │ 0:1
                                              │
                                    ┌─────────▼────────┐
                                    │ExtractoBancario  │
                                    └──────────────────┘
```

## Diagrama de Estados: Orden de Compra

```
┌──────────┐
│ BORRADOR │  ← Estado inicial
└────┬─────┘
     │
     │ enviarAprobacion()
     │
┌────▼──────────────────┐
│ PENDIENTE_APROBACION  │
└────┬─────────┬────────┘
     │         │
     │         │ rechazar(motivo)
     │         │
     │     ┌───▼──────┐
     │     │RECHAZADA │
     │     └──────────┘
     │
     │ aprobar(aprobadoPor)
     │
┌────▼────┐
│APROBADA │ ─┐
└────┬────┘  │
     │       │ anular(motivo)
     │       │
     │   ┌───▼────┐
     │   │ANULADA │
     │   └────────┘
     │
     │ (puede crear FacturaCompra)
     │
     ▼
```

## Diagrama de Estados: Factura de Compra

```
┌───────────┐
│ PENDIENTE │  ← Estado inicial
└─────┬─────┘
      │
      ├─────────────────────┐
      │                     │
      │ marcarPago(monto)   │ anular(motivo)
      │                     │
      │  ┌──────────────┐   │   ┌────────┐
      ├─►│PAGADA_PARCIAL│   └──►│ANULADA │
      │  └──────┬───────┘       └────────┘
      │         │
      │         │ marcarPago(saldo restante)
      │         │
      │  ┌──────▼───────┐
      └─►│PAGADA_TOTAL  │
         └──────────────┘
```

## Diagrama de Estados: Orden de Pago

```
┌──────────┐
│ BORRADOR │  ← Estado inicial
└────┬─────┘
     │
     │ enviarAprobacion()
     │
┌────▼──────────────────┐
│ PENDIENTE_APROBACION  │
└────┬─────────┬────────┘
     │         │
     │         │ rechazar(motivo)
     │         │
     │     ┌───▼──────┐
     │     │RECHAZADA │
     │     └──────────┘
     │
     │ aprobar(aprobadoPor)
     │
┌────▼────┐
│APROBADA │
└────┬────┘
     │
     │ marcarComoPagada(datos)
     │ • Crea MovimientoBancario
     │ • Actualiza Saldo Banco
     │ • Actualiza Saldo Factura
     │
┌────▼────┐
│ PAGADA  │ ─── No se puede anular
└─────────┘
```

## Flujo de Proceso Completo

```
COMPRA CON ORDEN
════════════════

1. Crear Orden de Compra
   ┌─────────────────────────┐
   │ Items + Proveedor       │
   │ Estado: BORRADOR        │
   │ Numero: OC-2025-XXXX    │
   └────────┬────────────────┘
            │
            ▼
2. Flujo de Aprobación OC
   ┌─────────────────────────┐
   │ Enviar a Aprobación     │
   │ → Aprobador revisa      │
   │ → Aprueba o Rechaza     │
   └────────┬────────────────┘
            │ Estado: APROBADA
            ▼
3. Recibir Factura del Proveedor
   ┌─────────────────────────┐
   │ Cargar Factura          │
   │ • Número + Timbrado     │
   │ • Vincular a OC         │
   │ • IVA 10%, 5%, Exentas  │
   │ Estado: PENDIENTE       │
   └────────┬────────────────┘
            │
            ▼
4. Crear Orden de Pago
   ┌─────────────────────────┐
   │ Vincular a Factura      │
   │ • Método de Pago        │
   │ • Cuenta Bancaria       │
   │ • Retenciones IVA/IRE   │
   │ • Monto Neto            │
   │ Estado: BORRADOR        │
   │ Numero: OP-2025-XXXX    │
   └────────┬────────────────┘
            │
            ▼
5. Flujo de Aprobación OP
   ┌─────────────────────────┐
   │ Enviar a Aprobación     │
   │ → Aprobador revisa      │
   │ → Aprueba o Rechaza     │
   └────────┬────────────────┘
            │ Estado: APROBADA
            ▼
6. Ejecutar Pago
   ┌─────────────────────────┐
   │ Marcar como Pagada      │
   │ AUTOMÁTICO:             │
   │ ✓ Crea MovimientoBanc.  │
   │ ✓ Actualiza Saldo Banco │
   │ ✓ Actualiza Saldo Fact. │
   │ ✓ (Futuro) Asiento Cont.│
   │ Estado: PAGADA          │
   └─────────────────────────┘


COMPRA DIRECTA (Sin OC)
═══════════════════════

1. Cargar Factura Directa
   ┌─────────────────────────┐
   │ SIN Orden de Compra     │
   │ Tipos:                  │
   │ • NORMAL                │
   │ • ANTICIPO              │
   │ • GASTO_NO_DEDUCIBLE    │
   │ • CAJA_CHICA            │
   └────────┬────────────────┘
            │
            ▼
2. [Mismo flujo desde paso 4]
```

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                         │
│  ┌──────────────┐  ┌──────────────┐                │
│  │  React UI    │  │ TypeScript   │                │
│  │  Components  │◄─┤ Service      │                │
│  └──────────────┘  │ (pagos.ts)   │                │
│                    └──────┬───────┘                 │
└────────────────────────────┼────────────────────────┘
                             │
                             │ HTTP/REST
                             │
┌────────────────────────────▼────────────────────────┐
│                    BACKEND API                      │
│  ┌──────────────┐  ┌──────────────┐                │
│  │  Express.js  │  │ Controllers  │                │
│  │  Routes      │─►│ • cuentaBanc.│                │
│  └──────────────┘  │ • ordenCompra│                │
│                    │ • facturaCom.│                │
│                    │ • ordenPago  │                │
│                    └──────┬───────┘                 │
│                           │                         │
│                    ┌──────▼───────┐                 │
│                    │ Prisma ORM   │                 │
│                    └──────┬───────┘                 │
└────────────────────────────┼────────────────────────┘
                             │
                             │ SQL
                             │
┌────────────────────────────▼────────────────────────┐
│              AZURE SQL DATABASE                     │
│                                                     │
│  Tables:                                            │
│  • cuentas_bancarias                                │
│  • chequeras                                        │
│  • cheques                                          │
│  • ordenes_compra                                   │
│  • items_orden_compra                               │
│  • facturas_compra                                  │
│  • ordenes_pago                                     │
│  • retenciones                                      │
│  • movimientos_bancarios                            │
│  • extractos_bancarios                              │
│                                                     │
│  Multi-Tenant: tenantId en todas las tablas         │
│  Soft Delete: activo Boolean                        │
└─────────────────────────────────────────────────────┘
```

## Secuencia: Crear y Pagar Orden de Pago

```
Usuario    Frontend    Backend        Database       Banco
  │           │           │              │             │
  │  1. Crear OP         │              │             │
  ├──────────►│           │              │             │
  │           │ POST /api/ordenes-pago  │             │
  │           ├──────────►│              │             │
  │           │           │ INSERT OP    │             │
  │           │           ├─────────────►│             │
  │           │           │ INSERT Retenc│             │
  │           │           ├─────────────►│             │
  │           │           │◄─────────────┤             │
  │           │◄──────────┤              │             │
  │◄──────────┤           │              │             │
  │           │           │              │             │
  │  2. Enviar a Aprobación               │             │
  ├──────────►│           │              │             │
  │           │ PUT /ordenes-pago/:id/enviar-aprobacion│
  │           ├──────────►│              │             │
  │           │           │ UPDATE estado│             │
  │           │           ├─────────────►│             │
  │           │           │◄─────────────┤             │
  │           │◄──────────┤              │             │
  │◄──────────┤           │              │             │
  │           │           │              │             │
  │  3. Aprobar          │              │             │
  ├──────────►│           │              │             │
  │           │ PUT /ordenes-pago/:id/aprobar           │
  │           ├──────────►│              │             │
  │           │           │ UPDATE       │             │
  │           │           ├─────────────►│             │
  │           │           │◄─────────────┤             │
  │           │◄──────────┤              │             │
  │◄──────────┤           │              │             │
  │           │           │              │             │
  │  4. Marcar como Pagada│              │             │
  ├──────────►│           │              │             │
  │           │ PUT /ordenes-pago/:id/marcar-pagada     │
  │           ├──────────►│              │             │
  │           │           │ BEGIN TRANSACTION          │
  │           │           ├─────────────►│             │
  │           │           │              │             │
  │           │           │ INSERT MovimientoBancario  │
  │           │           ├─────────────►│             │
  │           │           │              │             │
  │           │           │ UPDATE Saldo Cuenta        │
  │           │           ├─────────────►│             │
  │           │           │              │             │
  │           │           │ UPDATE Saldo Factura       │
  │           │           ├─────────────►│             │
  │           │           │              │             │
  │           │           │ UPDATE OP estado=PAGADA    │
  │           │           ├─────────────►│             │
  │           │           │              │             │
  │           │           │ COMMIT       │             │
  │           │           ├─────────────►│             │
  │           │           │◄─────────────┤             │
  │           │◄──────────┤              │             │
  │◄──────────┤           │              │             │
  │           │           │              │             │
  │  5. (Manual) Ejecutar en Banco      │             │
  ├──────────────────────────────────────┼────────────►│
  │           │           │              │   Cheque/  │
  │           │           │              │   Transfer.│
  │           │           │              │             │
  │  6. (Futuro) Conciliar               │             │
  ├──────────►│           │              │             │
  │           │ PUT /movimientos/:id/conciliar         │
  │           ├──────────►│              │             │
  │           │           │ UPDATE estado=CONCILIADO   │
  │           │           ├─────────────►│             │
```

## Integración Contable (Futuro)

```
OrdenPago              AsientoContable
(PAGADA)               (AUTO-GENERADO)
    │                        │
    │                        │
    │  Datos:                │  Asiento:
    │  • Factura: 5.500.000  │
    │  • Ret.IVA:   275.000  │  DEBE:
    │  • Ret.IRE:   137.500  │    Gastos        5.000.000
    │  • Neto:    5.087.500  │    IVA Crédito     500.000
    │                        │
    │                        │  HABER:
    │                        │    Ret.IVA Pagar   275.000
    │                        │    Ret.IRE Pagar   137.500
    │                        │    Bancos        5.087.500
    │                        │
    └────────────┬───────────┘
                 │
                 │ Vinculación
                 │
         asientoContableId
```

## Conciliación Bancaria (Futuro)

```
Sistema                 Extracto Bancario
═══════                 ═════════════════

MovimientosBancarios    Lineas Extracto
┌────────────────┐      ┌────────────────┐
│ Fecha          │  ┌──►│ Fecha          │
│ Monto          │  │   │ Monto          │
│ Descripción    │  │   │ Descripción    │
│ Nro.Referencia │  │   │ Nro.Operación  │
│ Estado:PENDIENTE─┘   │                │
└────────────────┘      └────────────────┘
        │                       │
        └───────────┬───────────┘
                    │
                    ▼
            Matching Algorithm
            ┌──────────────┐
            │ • Fecha ±2d  │
            │ • Monto =    │
            │ • Número     │
            └──────┬───────┘
                   │
                   ▼
            ┌──────────────┐
            │ UPDATE       │
            │ estado:      │
            │ CONCILIADO   │
            └──────────────┘
```

---

**Nota:** Estos diagramas están en formato texto (ASCII) para facilitar su inclusión en archivos markdown. Para presentaciones, se recomienda recrearlos en herramientas como draw.io, Lucidchart, o Mermaid.
