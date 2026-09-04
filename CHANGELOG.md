# Changelog

## Registro de cambios

### 04/09/2026 - Módulos Asambleas, Encuestas, Ventas y Configuración (migración completa)
- **Added**: Página **Asambleas**:
  - Filtros Todos / Ordinarias / Extraordinarias
  - Cards ordenadas por fecha (más reciente primero) con chip de tipo, temario y acuerdos (nl2br)
  - Lista de asistentes por parcela (chips numéricos) con "Marcar todos"
  - Modal crear/editar asamblea: fecha, tipo, temario, acuerdos y asistentes (chips de parcelas)
  - Editar/eliminar admin con confirmación
- **Added**: Página **Encuestas**:
  - Filtros Abiertas / Cerradas (por fecha de término)
  - Votación por parcela (una vez por parcela, aviso "Ya votaste"), quorum con indicador
  - Barras de resultados con % por opción, alternativas "A favor"/"En contra" o personalizadas
  - Modal crear/editar encuesta (alternativas no editables con votos), editar/eliminar admin
- **Added**: Página **Ventas** (Publicaciones):
  - Filtros por categoría (Todas/Productos/Servicios) y estado (Todos/Disponibles/Vendidos)
  - Grid de cards con foto (clic para ver en modal), precio formateado, parcela y contacto
  - Modal publicar/editar venta con foto opcional (URL.createObjectURL) y estado Disponible/Vendido
- **Added**: Página **Configuración** (solo admin):
  - Creación masiva de parcelas (cantidad + prefijo) con detección de cambios y renombrado opcional
  - Datos de pago (Home → Cómo pagar) editables y guardados en config
  - Chips editables con autosave: Categorías de Documentos, Rubros de Proveedores y Conceptos de Ingresos/Egresos (items en uso con candado)
- **Changed**: Tabs Asambleas, Encuestas, Ventas y Configuración activadas en la navegación. Se completa la migración de todos los módulos del frontend original (queda pendiente auth real y auditoría)

### 04/09/2026 - Módulo Documentos
- **Added**: Página **Documentos**:
  - Filtros por categoría: "Todos" + categorías desde `config.categorias_documentos` (Estatuto, Actas, Contratos, Seguros, Planos)
  - Items con ícono por categoría, nombre, meta (categoría · fecha), acciones admin (editar/eliminar con confirmación)
  - Botón "info" para ver la descripción del documento en un modal, y link "Ver documento" si hay archivo adjunto
  - Modal crear/editar documento: nombre, categoría (desde config), descripción obligatoria y archivo (URL.createObjectURL en demo, fiel al patrón del módulo Finanzas)
- **Changed**: Tab "Documentos" activada en la navegación. `documentos` agregado a los datos del DataContext (demo/prod) con CRUD

### 04/09/2026 - Módulo Noticias
- **Added**: Página **Noticias**:
  - Filtros: Vigentes / Destacadas / No vigentes / Todas
  - Cards de noticia con título, fecha, descripción y link a archivo adjunto (si existe)
  - Acciones admin: pinnea/despinnea en Home (`push_pin`), editar y eliminar con confirmación
  - Modal crear/editar noticia: título, "Vigente hasta", descripción y switch "Destacar en Home" (admin). No edita archivo (fiel al original)
- **Added**: Sección **Noticias destacadas** en Home (pinneadas vigentes, hasta 3), que estaba pendiente por depender de este módulo
- **Changed**: Tab "Noticias" activada en la navegación. `noticias` agregado a los datos del DataContext (demo/prod) con CRUD

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
