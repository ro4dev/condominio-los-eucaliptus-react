# Condominio Los Eucaliptus — React

Migración gradual del sistema de gestión de gastos comunes del condominio a **React + TypeScript + Vite**, manteniendo el patrón demo/prod y el diseño del frontend original (HTML/CSS/JS vanilla).

## Stack

- React 19 + TypeScript
- Vite 8
- Chart.js para gráficos
- Supabase JS client (auth, database, storage)
- CSS puro con variables (light/dark), sin frameworks de UI

## Estructura

```
src/
  main.tsx              # Proveedores (App + Data) + Snackbar
  App.tsx               # Header + TabsNav + página activa
  styles/               # tokens.css (variables), components.css, layout.css
  lib/
    types.ts            # Tipos de dominio
    format.ts           # formatMoney, formatDate, formatPeriodo, sanitizaciones
    finanzas.ts         # Lógica de finanzas (pagos, recaudado, deuda, cuotas)
    appConfig.ts        # demoMode, theme, periodOptions
    data.ts             # Carga demo (JSON) / prod (Supabase)
    supabase.ts         # Cliente lazy desde env
  store/
    AppContext.tsx      # isDark, demoMode, snackbar, isAdmin
    DataContext.tsx     # Datos + CRUD demo/prod
    components/
    ui/                 # Button, Chip, StatCard, Modal, Select, Switch, Icon, EmptyState, Snackbar
    layout/             # Header, TabsNav, ComingSoon
    finanzas/           # Página Finanzas completa + charts y modales
    parcelas/           # Página Parcelas (grid + CRUD parcelas/propietarios)
    home/               # Página Home (stats, recaudación, cómo pagar, morosos + noticias destacadas)
    noticias/           # Página Noticias (filtros + CRUD + destacar/pinnea)
    documentos/         # Página Documentos (filtros por categoría + CRUD + archivo)
    reclamos/           # Página Comentarios (Reclamos/Sugerencias + CRUD)
    proveedores/        # Página Proveedores (grid de cards + CRUD)
    asambleas/          # Página Asambleas (filtros + asistentes + CRUD)
    encuestas/          # Página Encuestas (votación + resultados + CRUD)
    ventas/             # Página Ventas (publicaciones con foto + filtros + CRUD)
    config/             # Página Configuración (parcelas bulk, datos de pago, chips)
```

## Modo demo vs producción

- `DEMO_MODE = true`: carga JSON de `public/data/`, sin tocar Supabase.
- `DEMO_MODE = false`: carga de Supabase y envía cambios a la DB.

## Estado de la migración

| Módulo | Estado |
|--------|--------|
| Scaffolding + layout + tabs | ✅ |
| Finanzas (gráficos, periodo en curso, histórico, generación de cuotas, CRUD gastos/pagos) | ✅ |
| Parcelas (grid, estado, propietarios, CRUD parcelas/propietarios) | ✅ |
| Home (stats, recaudación, cómo pagar, morosos, noticias destacadas, registro de pagos) | ✅ |
| Noticias (filtros vigentes/destacadas/no vigentes/todas, CRUD, destacar en Home) | ✅ |
| Documentos (filtros por categoría desde config, CRUD, archivo adjunto, ver descripción) | ✅ |
| Comentarios (reclamos/sugerencias, filtros, crear/eliminar) | ✅ |
| Proveedores (grid de cards con contacto, CRUD) | ✅ |
| Asambleas (filtros, temario/acuerdos, asistentes por parcela, CRUD) | ✅ |
| Encuestas (votación, quorum, resultados con barras, CRUD) | ✅ |
| Ventas (publicaciones con foto, filtros categoría/estado, CRUD) | ✅ |
| Configuración (creación masiva de parcelas, datos de pago, chips editables) | ✅ |
| Auth real (login/roles admin) y auditoría | ⏳ Pendiente |

## Comandos

```bash
npm run dev      # dev server
npm run build    # typecheck (tsc -b) + build (vite build)
npm run lint     # oxlint
```
