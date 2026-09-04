# Changelog

## Registro de cambios

### 03/09/2026 - Inicio de migración a React + Módulo Finanzas completo
- **Added**: Scaffolding del proyecto en React + TypeScript + Vite (sin frameworks de UI, CSS puro con variables light/dark)
- **Added**: Sistema de datos demo/prod (JSON en `public/data/` o Supabase) con contexto React predictivo (DataContext)
- **Added**: Contexto de app (tema claro/oscuro, modo demo, snackbar; `isAdmin` asumido temporalmente hasta migrar auth)
- **Added**: Módulo **Finanzas** completo:
  - Gráficos Chart.js: "Recaudado vs Esperado por período" y "Ingresos vs Egresos por mes"
  - Card "Periodo en curso": esperado, recaudado, egresos, saldo, progreso y acciones (Cerrar periodo, Cuotas, Movimientos, Editar config)
  - "Histórico de períodos" con tabla de montos/esperado/recaudado/saldo/%
  - Modales: ver cuotas de un periodo (con pagos parciales), pagos de una cuota (registrar/eliminar), generar cuotas / cerrar periodo, editar/agregar config de periodo, agregar/editar/eliminar gasto con comprobante
  - CRUD de gastos y pagos (demo: persistencia local), cálculo de recaudado/esperado/deuda/morosos
- **Changed**: Navegación por pestañas mediante estado (sin react-router), fiel al frontend original. Las pestañas aún no migradas muestran placeholder "próximamente"
