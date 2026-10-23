# Caja ZAIN (tipo Tricount) — 23-oct-2026

En Gestión → Finanzas, arriba de todo, está **Caja y cuentas**:

- **Caja ZAIN**: el dinero del negocio. Incluye el IVA cobrado.
- **Juan Pablo / García**: «ZAIN le debe» si adelantó dinero de su bolsa; «Tiene dinero del negocio» si recibió un cobro o sacó dinero de la caja.
- **Por repartir**: la utilidad de pedidos **cerrados** (según el reparto de cada pedido) más el neto de gastos e ingresos generales al 50/50 (sin aportaciones de capital), menos lo ya repartido.

## Reglas de cálculo (`supabase/caja-zain.sql`, `zain_caja_libro` y `zain_caja_resumen`)
| Movimiento | Caja ZAIN | Socio |
|---|---|---|
| Cobro recibido por la caja | + | — |
| Cobro recibido por un socio | — | tiene dinero del negocio |
| Gasto pagado por la caja | − | — |
| Gasto pagado por un socio | — | ZAIN le debe |
| Reembolso a un socio | − | ZAIN le debe menos |
| Transferencia socio → caja | + | ZAIN le debe más |
| Transferencia caja → socio | − | ZAIN le debe menos |
| Reparto de utilidad | − | no es deuda; cuenta como repartido |

Identidad comprobada en `tests/caja.test.mjs`: caja − saldos de socios = ingresos − gastos − repartos.

- Los cobros existentes se toman como recibidos por la caja. En el libro, «Lo recibió» corrige quién los recibió de verdad.
- Las transferencias y los repartos se anulan con motivo; no se borran.
- El dinero de pedidos en papelera sí cuenta (es real) y se avisa.

## Pruebas
```powershell
$env:ZAIN_PGLITE_MODULE = 'file:///C:/Users/JP/AppData/Local/Temp/zain-ventas-qa-20261022/node_modules/@electric-sql/pglite/dist/index.js'
node --test tests/caja.test.mjs
```

## Libro flexible (23-oct-2026, `supabase/libro-flexible.sql`)
- «+ Registrar movimiento»: Cobro de pedido (por folio) · Gasto (de un pedido o general) · Ingreso · Reembolso · Transferencia · Reparto.
- Cada renglón del libro tiene **Editar** y **Borrar**. Editar puede cambiar todo, incluso el tipo o el pedido: el registro se mueve de tabla en una sola transacción (`zain_libro_operar`).
- Borrar anula gastos de pedido, generales y movimientos de caja; los cobros se eliminan porque otras consultas no conocen anulaciones. En todos los casos la copia queda en `zain_libro_historial` (antes y después).
- Un cobro necesita una revisión aceptada (llave foránea). Si el cliente no aceptó en su enlace, el equipo la acepta al registrar el cobro (`documento.aceptada_por = 'equipo'`): el pedido pasa a Aceptado y, si cubre el anticipo, a Confirmado.
- Movimientos de un pedido cerrado no se pueden cambiar: hay que reabrir su cierre en la pestaña Gastos.
- El saldo del pedido, su pestaña Cobro y lo que el cliente ve en su enlace se calculan de `zain_pagos`, así que se actualizan al instante.
