# Home

## 1. Descripción general

Pestaña inicial del frontend React (primer tab, activa por defecto desde `App.tsx` con `useState<TabId>('home')`). Es la vista resumen del condominio: stats del periodo vigente, noticias destacadas (pinneadas), progreso de recaudación, la card "Cómo pagar" con datos de transferencia + QR y el listado de morosos. Reemplaza a Gastos Comunes como punto de entrada; la información de detalle vive en Finanzas.

ID del tab: `home`
Componente raíz: `src/components/home/HomePage.tsx`

## 2. Componentes

| Archivo | Rol |
|---------|-----|
| `HomePage.tsx` | Página; renderiza stats, recaudación, cómo pagar, morosos y noticias destacadas. |
| `ComoPagarModal.tsx` | Modal con datos de pago (copiar por fila o todos) y QR. |
| `DeudaModal.tsx` | Detalle de deuda por periodo, total y botón "Registrar pago" (solo admin). |
| `PagoFormModal.tsx` | Formulario de registro de pago (monto, fecha, comprobante opcional). |

## 3. Carga de datos

`HomePage` consume todo desde `useData()` (DataContext) y `useApp()`:

```ts
const { gastos, pagos, flujo, parcelas, propietarios, config, noticias, loading } = useData();
const { isAdmin, currentUserEmail } = useApp();
```

Mientras `loading` está en `true`, se muestran skeletons (`skeleton-stat`, `skeleton-card`).

**Periodo vigente** = el más reciente de `periodosFinanzas(gastos, flujo)` (primer elemento del array ordenado desc).

**Perfil de usuario**: si hay sesión y el usuario NO es admin, se busca su parcela por match `propietarios.find(p => p.email === currentUserEmail).parcela_id`. Con eso:
- Admin / sin login: stats globales del condominio.
- Propietario (`esPropietario`): stats filtrados a **su** parcela (`gastos.filter(g => g.parcela_id === miParcela)`).

## 4. Stats

| Perfil | Cards |
|--------|-------|
| Propietario | Pagado (periodo) · Cuota (periodo) · Estado (Al día/Deudor) · Deuda acumulada |
| Admin / sin login | Esperado (periodo) · Recaudado (periodo) · Egresos (periodo) · Morosos |

Valores calculados con `src/lib/finanzas.ts`:

| Valor | Fórmula |
|-------|---------|
| Esperado | `esperadoPorPeriodo(periodo, regsParcela)` |
| Recaudado | `recaudadoPorPeriodo(periodo, regsParcela, pagos)` |
| Egresos | `egresosMes(periodo, flujo)` |
| Morosos | `morosos(gastos, parcelas, pagos).length` |
| Estado | `estadoParcelaPago(miParcela, gastos, pagos)` |
| Deuda | `deudaParcela(miParcela, gastos, pagos)` |

## 5. Recaudación del periodo

Card con la cuota configurada (`cuotaDelPeriodo(periodo, config).monto`), el total recaudado/esperado y una barra de progreso (`.progress-track`/`.progress-fill`) con `pctRecaudado(periodo, gastos, pagos)`:

- `pct >= 90` → verde (`var(--color-positive)`)
- `pct >= 60` → ámbar (`#f59e0b`)
- `pct < 60` → rojo (`var(--md-sys-color-error)`)

Label: "X% de las cuotas del periodo pagadas".

## 6. Noticias destacadas

`pinnedNews` = noticias con `pinned === true` y vigentes (`!fecha_hasta || fecha_hasta >= todayISO()`), ordenadas por `fecha` (o `created_at`) desc, máx. 3. Se renderizan en la card "Noticias destacadas". Ver `noticias.md`.

## 7. Card "Cómo pagar" + modal (QR / transferencia)

### Datos de origen

Viven en `config.datos_pago` (key de Configuración, ver `config-admin.md`):

```ts
DatosPago {
  banco, tipo_cuenta, numero_cuenta, rut, titular, email, qr
}
```

### `ComoPagarModal`

Modal "Cómo pagar tu cuota" (`src/components/ui/Modal.tsx`) con:
- Fila por campo copiable (clic sobre el valor → `copyText` desde `lib/clipboard.ts`, fallback `document.execCommand('copy')`), con snackbar de feedback.
- Imagen QR (`safeUrl(d.qr)`) si está configurada.
- Botón "Copiar datos" que copia todos los campos en formato `Label: valor`.

Si no hay datos configurados, muestra "Sin datos de pago configurados."

**Nota**: el QR es estático (URL que sube el admin). No hay pasarela de pago dinámica.

## 8. Listado de morosos

`bloqueMorosos` usa `morosos(gastos, parcelas, pagos)` (parcelas con deuda > 0 ordenadas por número).

**Visibilidad**:
- **Admin**: ve todas las parcelas morosas en grid de cards (número, monto deuda, nº de periodos pendientes mediante `periodosPendientes`). Clic abre `DeudaModal`.
- **Propietario**: ve su propia parcela y su deuda, con la etiqueta "(tu parcela)".
- **Sin login**: no se muestra el bloque (requiere `currentUserEmail`); sí se ven stats globales y "Cómo pagar".

Empty states: "Todas las parcelas están al día." / "Tu parcela está al día."

### `DeudaModal`

Detalle de deuda por periodo (`deudaPorPeriodo`) + total. Si la parcela está al día pero tiene saldo a favor, lo indica. Para admin, si hay saldo pendiente muestra "Registrar pago" que abre `PagoFormModal` dirigido al gasto con mayor resto (`gastoObjetivo`).

### `PagoFormModal`

- Pre-llena el monto con el resto de la cuota (`montoCuota - sumPagosGasto`).
- Campos: Monto (≥0), Fecha (default hoy, `todayISO()`), Comprobante (foto, opcional).
- Comprobante: demo → `blobURLDemo` (object URL); prod → `subirArchivo(file, 'gastos_comunes', '')` a Storage Supabase.
- Guarda vía `savePago(payload)` de DataContext.

## 9. Reglas de negocio

- **Periodo vigente** = último periodo en gastos/flujo.
- **Moroso** = parcela con deuda acumulada > 0 (cualquier periodo).
- **"Cómo pagar" siempre visible** (incluso sin login): datos de pago públicos por definición.
- El bloque de morosos solo se muestra con sesión activa.
- El propietario solo ve información de su parcela; el match email ↔ `propietarios.email` es la misma convención que usa Encuestas.

## 10. RLS / Privacidad

- Home no hace queries directas: todo pasa por `loadFinanzasData()` / DataContext.
- El match email↔parcela depende de que `propietarios` sea seleccionable por `authenticated`. En demo esto no aplica (los datos son locales).
- El propietario no ve información de otras parcelas en la UI (la diferenciación es de frontend; la restricción real depende de las políticas RLS de Supabase, que no viven en este repo más que la de `audit_log`).