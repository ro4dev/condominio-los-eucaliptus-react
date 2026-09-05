# Finanzas

## 1. Descripción general

Pestaña con todo el ciclo financiero: gráficos de recaudación y flujo, periodo en curso con % de recaudación, histórico de periodos, generación automática de cuotas y CRUD de gastos (cuotas), pagos y movimientos (ingresos/egresos). Es el módulo más completo de la app.

ID del tab: `finanzas`
Componente raíz: `src/components/finanzas/FinanzasPage.tsx`

## 2. Componentes

| Archivo | Rol |
|---------|-----|
| `FinanzasPage.tsx` | Orquestador: charts + secciones + modales. |
| `RecaudadoChart.tsx` | Chart.js: Esperado vs Recaudado por periodo (líneas). |
| `FlujoChart.tsx` | Chart.js: Ingresos vs Egresos por mes. |
| `useChartColors.ts` | Lee variables CSS de color, reacciona a dark/light (MutationObserver). |
| `PeriodoEnCurso.tsx` | Card del periodo vigente: stats, progreso, acciones. |
| `HistoricoPeriodos.tsx` | Tabla de periodos anteriores. |
| `CuotasPeriodoModal.tsx` | Cuotas de un periodo + estado de pago. |
| `PagosCuotaModal.tsx` | Pagos de una cuota (listado + registrar + eliminar). |
| `MovimientosPeriodoModal.tsx` | Movimientos ingreso/egreso de un mes. |
| `GastoFormModal.tsx` | Form de gasto/cuota. |
| `FlujoFormModal.tsx` | Form de movimiento. |
| `GenerarCuotasModal.tsx` | Generación masiva de cuotas por periodo. |
| `PeriodoModal.tsx` | Config de periodos (monto base + fondo reserva). |

Lógica financiera centralizada en `src/lib/finanzas.ts` (funciones puras; ver anexo).

## 3. Gráficos

Ambos usan Chart.js (`chart.js/auto`), con `useChartColors()` para los colores del tema.

- **RecaudadoChart**: agrupa `gastos` por periodo: `esp` (suma de montos) y `rec` (`recaudadoGasto`). Esperado en línea punteada (gris `muted`), Recaudado con relleno hacia abajo (`fill: '-1'`). Tooltips con `formatMoney`.
- **FlujoChart**: meses unión de `flujo` y `gastos`; `Ingresos = recaudadoPorPeriodo + flujo tipo Ingreso` (`ingresosMes`), `Egresos = flujo tipo Egreso` (`egresosMes`).

## 4. Periodo en curso

`PeriodoEnCurso` sobre `periodosFinanzas(gastos, flujo)[0]`:

- Stats: Esperado, Recaudado, Egresos, Saldo (`saldoPeriodo`); saldo negativo en rojo.
- Barra de progreso con `pct = rec/esperado*100` (mismo color por umbral que Home).
- Acciones (admin): **Cerrar periodo** → abre `GenerarCuotasModal` fijo al `siguientePeriodo(gastos)`; Cuotas; Movimientos; editar config del periodo (icono lápiz).

## 5. Histórico de periodos

`HistoricoPeriodos`: tabla de periodos anteriores (excluye el vigente). Columnas:

| Período | Monto (admin) | Esperado | Recaudado | Saldo | % |
|---------|---------------|----------|-----------|-------|---|
| `formatPeriodo` | de `config.periodos` | `esperadoPorPeriodo` | `recaudadoPorPeriodo` | `saldoPeriodo` (verde/rojo) | coloreado por umbral |

Acciones por fila: ver cuotas (receipt), ver movimientos (swap_vert), editar config periodo (admin).

## 6. Cuotas de un periodo (`CuotasPeriodoModal`)

- Header: chip del periodo + Esperado/Recaudado/% coloreado.
- Tabla de cuotas ordenadas por número de parcela (`localeCompare(..., { numeric: true })`), con `pagado/monto` por parcela.
- Color por estado (`isPagado`): verde pagado, ámbar pago parcial (`pagado > 0`), gris sin pagar.
- Acciones: ver pagos (todos); editar/eliminar cuota (admin).

## 7. Pagos de una cuota (`PagosCuotaModal`) e `isPagado`

Sección de pagos por cuota:

- Listado: monto con `formatMoney`, fecha `formatDate`, comprobante (link si `safeUrl(p.comprobante)`), eliminar (admin).
- Registrar pago (admin, solo si falta > 0): pre-llena el monto restante, fecha default hoy, comprobante opcional → `savePago`.

Estado de pago — lógica en `lib/finanzas.ts`:
- `pagoLegado`: cuota marcada `pagado === 'Sí'` sin pagos registrados (dato histórico del repo original).
- `isPagado`: legado **o** `sumPagosGasto(id) >= monto`.
- `recaudadoGasto`: `min(monto, pagos)` (el legado cuenta como monto completo).

## 8. Movimientos (`MovimientosPeriodoModal`)

- Header: chip del periodo + Ingresos (verde) y Egresos (rojo) del mes.
- Tabla Fecha / Tipo (chip) / Concepto (+descripción `nl2br`) / Monto, ordenada por fecha desc.
- Acciones editar/eliminar solo admin.

## 9. Formularios

### GastoFormModal (cuota)

- Campos: Periodo (select `periodOptions(-6,12)`), Parcela, Monto, Descripción, "Cuota pagada" (switch `pagado`), Comprobante (foto).
- Pre-fill: monto desde `cuotaDelPeriodo(periodo, config)` si no hay valor.
- Al crear, excluye parcelas que **ya tienen** gasto en el periodo (`usadasEnPeriodo`).
- `concepto` autogenerado: `GC_MM_YYYY_<numero>` (ej: `GC_03_2026_5`).
- Comprobante: demo → `blobURLDemo`; prod → `subirArchivo(file, 'gastos_comunes', periodo)`.
- Guarda con `saveGasto(payload, isEdit)`.

### FlujoFormModal (movimiento)

- Campos: Tipo (Ingreso/Egreso), Fecha, Concepto (select desde `config.conceptos_flujo`, **excluye** "Cuotas" y "Fondo reserva"), Monto, Descripción, Comprobante.
- Si no hay conceptos configurados, avisa ir a Configuración.
- Comprobante sube a bucket `ingresos_egresos` carpeta `YYYY-MM-Tipo`.
- Guarda con `saveFlujo(payload, isEdit)`.

### GenerarCuotasModal

- Genera una cuota por parcela para el periodo elegido (montos Gasto común + Fondo reserva, ambos opcionales ≥ 0).
- Pre-fill desde `config.periodos` (usa el config del periodo o el del mes anterior si no existe).
- **No modifica** parcelas que ya tengan cuota en ese periodo (`usadas`).
- `concepto`: `GC_MM_YYYY` y `GC_FR_MM_YYYY`; `descripcion`: "Cuota {mes/año}" y "Fondo reserva {mes/año}".
- Reporta vía snackbar cuántas cuotas se generaron o "Todas las parcelas ya tienen cuota para este periodo."
- En prod ejecuta un único `insert` masivo en `gastos` (`generarCuotas` de DataContext).

### PeriodoModal (config de periodos)

- Agregar o editar un periodo en `config.periodos` (monto + fondo_reserva).
- Evita duplicados ("Ese periodo ya está configurado."), ordena desc, guarda con `savePeriodos`.
- Es la fuente de la cuota mostrada en Home y del pre-fill de generación de cuotas.

## 10. Reglas de negocio

- **Periodo vigente** = último periodo en gastos/flujo; el flujo se mapea por `mesDeFecha`.
- Las cuotas recaudadas = sumatoria del recaudado por parcela; un pago puede ser parcial y puede haber múltiples pagos por cuota.
- Generar cuotas es **idempotente** por parcela/periodo (no duplica).
- Los conceptos de flujo "Cuotas" y "Fondo reserva" no se ofrecen en el form (se infieren de gastos).
- Saldo del periodo = ingresos del mes − egresos del mes.

## 11. RLS / Privacidad

- Escrituras en `gastos`, `pagos`, `flujo`, `config`: se hacen con el cliente autenticado del contexto; la permisología efectiva depende de las políticas RLS del proyecto Supabase (no versionadas en este repo salvo `audit_log`).
- Todo cambio queda registrado en `audit_log` vía `logAudit` (ver `arquitectura-datos.md`).