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

## Comprobantes y limpieza (23-oct-2026, `supabase/libro-comprobantes.sql`)
- Un gasto puede adjuntar su comprobante (JPG, PNG, WEBP o PDF hasta 4 MB) al registrarse o corregirse desde el libro; el renglón muestra «Ver comprobante».
- Un gasto con comprobante no se mueve entre pedidos ni entre pedido y generales (el archivo pertenece a su registro): se borra y se registra de nuevo.
- Finanzas ya no muestra la sección anterior de «Movimientos generales» ni su formulario: el libro de la caja los reemplaza.

## Desglose de «Por repartir» (27-nov-2026, `supabase/caja-utilidad-detalle.sql`)
- La tarjeta «Por repartir · utilidad cerrada» se toca y abre el desglose; se cierra tocándola otra vez o con «Cerrar».
- **Pedidos cerrados:** por pedido, venta − costo = utilidad, el reparto pactado y lo que le toca a JP y a García; luego los gastos e ingresos generales al 50/50, cada reparto ya pagado y el total «Por repartir hoy» (igual a la tarjeta).
- **Utilidad por cerrar:** pedidos aceptados, confirmados, en producción o entregados sin cierre, fuera de papelera. Muestra venta, cobrado, lo que falta cobrar, gastos registrados, costo cotizado y la utilidad hasta hoy (mismo costo que el tablero: el cotizado del material hasta que lo gastado lo supere, más los gastos extra). Los que no tienen costo cotizado ni gastos no se suman.
- «Si se cerraran hoy, les tocaría»: lo por repartir más la utilidad por cerrar de cada socio.
- El folio abre el pedido. `zain_caja_utilidad_detalle()` es solo lectura; si no estuviera en la base, la caja carga igual sin el desglose.
- Pruebas: `tests/caja-utilidad-detalle.test.mjs` (PGlite: el desglose suma exactamente lo de `zain_caja_resumen`) y `tests/caja-utilidad-browser.cjs` (390 y 1280 px).

## Todas las tarjetas se tocan (27-nov-2026)
- Caja ZAIN, Oficina JP, Oficina García, Juan Pablo y García abren debajo «De dónde sale»: entradas, salidas y saldo, y los movimientos agrupados por tipo (cobros, gastos de pedidos, gastos generales, transferencias, reembolsos, repartos) con su subtotal; cada grupo se abre.
- En los socios, lo que pagó de su bolsa suma (ZAIN le debe) y lo que recibió del negocio resta; los repartos no cuentan.
- Se calcula del mismo libro que los saldos; si no cuadrara con la tarjeta (libro recortado a los últimos 500), lo avisa.
- «Ver en el libro de movimientos» filtra el libro por esa cuenta. Prueba: `tests/libro-signos-browser.cjs`.

## «Por repartir» solo con lo pendiente (27-nov-2026, JP)
- Ya no muestra todo el historial: solo los pedidos cerrados que falta repartir y lo próximo a repartir (aprobados sin cerrar).
- Los repartos no van ligados a pedidos: lo pagado y los generales cubren primero los cierres más antiguos. Lo que falta son los cierres más recientes; el que quedó a medias dice «ya se repartió una parte» y muestra solo lo que falta. Si a un socio se le repartió de más, sale «Repartido de más» en negativo. La suma siempre es igual a la tarjeta.
