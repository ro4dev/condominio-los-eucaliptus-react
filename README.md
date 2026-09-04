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
```

## Modo demo vs producción

- `DEMO_MODE = true`: carga JSON de `public/data/`, sin tocar Supabase.
- `DEMO_MODE = false`: carga de Supabase y envía cambios a la DB.

## Estado de la migración

| Módulo | Estado |
|--------|--------|
| Scaffolding + layout + tabs | ✅ |
| Finanzas (gráficos, periodo en curso, histórico, generación de cuotas, CRUD gastos/pagos) | ✅ |
| Resto de pestañas (Noticias, Documentos, Reclamos, Asambleas, Encuestas, etc.) | ⏳ Próximamente |

## Comandos

```bash
npm run dev      # dev server
npm run build    # typecheck (tsc -b) + build (vite build)
npm run lint     # oxlint
```
