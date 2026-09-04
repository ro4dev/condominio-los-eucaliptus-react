# Changelog

## Registro de cambios

### 04/09/2026 - Módulo Home
- **Added**: Página **Home** (vista admin):
  - Stats del periodo: Esperado, Recaudado, Egresos y cantidad de morosos
  - Card "Recaudación del periodo": cuota vigente + recaudado/esperado + barra de progreso con porcentaje
  - Card "Cómo pagar": modal con datos bancarios (`config.datos_pago`) con copiado por campo y "Copiar datos" (portapapeles), y QR si existe
  - Card "Parcelas morosas": grid de morosos (número, deuda, periodos pendientes) que abre detalle de deuda por periodo; los admins pueden "Registrar pago" desde ahí
  - Registro de pago desde la deuda (reusa `savePago`)
- **Changed**: Tab "Home" activada y seteada como pestaña inicial de la app. Las noticias destacadas se dejan fuera por ahora (dependen del módulo Noticias, aún no migrado)

### 04/09/2026 - Módulo Parcelas
- **Added**: Página **Parcelas**:
  - Grid de parcelas ordenado por número, con Rol, Metros², chip de estado (Habitada/Desocupada/En construcción), contador de propietarios y botón "Ver propietarios"
  - Popup de propietarios de una parcela (teléfono, email, RUT) con acciones agregar/editar/eliminar (admin)
  - CRUD de parcelas (número, rol, metros², estado) y de propietarios (nombre, RUT, parcela, teléfono, email, tipo) mediante modales
  - Botón "+ Agregar Parcela" (admin). Las parcelas no se eliminan (son bienes físicos), solo se editan
- **Changed**: Tab "Parcelas" activada en la navegación

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
