# Configuración (admin)

## 1. Descripción general

Panel exclusivo de administradores con la configuración global del condominio: creación masiva de parcelas, datos de pago (usados en Home → "Cómo pagar"), chips editables de categorías/rubros/conceptos y **actividad reciente** (auditoría de cambios). No está en el `TabsNav` para no-admins y `App.tsx` fuerza el tab a `home` si un no-admin intenta acceder; además `ConfigPage` devuelve "No autorizado." si `!isAdmin`.

ID del tab: `config`
Componentes: `src/components/config/ConfigPage.tsx` y `src/components/config/AuditSection.tsx`

## 2. Creación masiva de parcelas

Inputs: **Cantidad** y **Prefijo**.

Flujo `aplicarParcelas()` (con validaciones: prefijo requerido, cantidad ≥ 1):
1. Si el prefijo cambió, renombra cada parcela que matchee `^(\D+)\s+(\d+)$` con el prefijo anterior → `nuevo prefijo N` (si el nuevo número no existe).
2. Calcula el set de números tras el rename.
3. Crea con `saveParcela({ numero, metros: '0', estado: 'Sin asignar' }, false)` cada número faltante `1..cantidad` (no duplica).
4. Persiste `config.parcelas_cantidad` y `config.parcelas_prefijo` vía `saveConfigValue`.

Reporta por `alert`: "Parcelas actualizadas (N creadas)." o "Sin cambios."

## 3. Datos de pago

Formulario local (`useState(pago)` pre-cargado de `config.datos_pago`) con campos: Banco, Tipo de cuenta, Número de cuenta, RUT, Titular, Email tesorería, **URL imagen QR**.

El botón **Guardar** persiste `saveConfigValue('datos_pago', pago)`.

Estos datos alimentan `Home` → `ComoPagarModal` (filas copiables + QR al hacer clic; ver `home.md` §7).

## 4. Chips editables

Tres grupos configurables:

| Key | Título | Default usado por la UI |
|-----|--------|------------------------|
| `categorias_documentos` | Categorías de Documentos | Estatuto, Actas, Contratos, Seguros, Planos |
| `rubros_proveedores` | Rubros de Proveedores | 11 rubros por defecto |
| `conceptos_flujo` | Conceptos de Ingresos/Egresos | — (para FlujoFormModal) |

- **Agregar**: modal con input; valida que no exista ("Ya existe ese elemento.") → `saveConfigValue(key, [...actual, v])`.
- **Eliminar**: clic en el chip; calcula `usados` (valores en uso por documentos, proveedores o flujo) y **bloquea** el borrado de los que están en uso (🔒, cursor not-allowed). Además confirma con `confirm`.

Los chips en uso se ven `opacity: 0.7`.

## 5. Auditoría de actividad (`AuditSection`)

Feed cronológico de cambios de las tablas `gastos`, `flujo`, `noticias`, `documentos`, `reclamos`, `proveedores`, `asambleas`, `encuestas`, `parcelas`, `propietarios`, `publicaciones`, `config`.

- Filtro por tabla (chips) o "Todas".
- Carga **paginada de a 20** (`AUDIT_CHUNK`) con botón "Cargar más" (rango en Supabase `q.range(a, a+19)`).
- Fila: usuario, acción (`INSERT`→"Creó" / `UPDATE`→"Actualizó" / `DELETE`→"Eliminó") con color de dot, tabla (label humano), fecha (`formatAuditDate` "dd/mm/aaaa hh:mm") y `registro_id` (primeros 8 chars).
- Icono `info` abre modal con el `JSON.stringify(datos)` escpado.
- Empty state: "Sin actividad registrada."; mientras carga con datos, "Cargando actividad...".

Demo: filtra sobre `audit_log` local del DataContext; prod: consulta la tabla `audit_log` (RLS solo admin, ver `arquitectura-datos.md`).

## 6. Acceso y roles

- `TabsNav` oculta el tab para `!isAdmin`.
- `App.tsx`: si el tab activo es `config` y `!isAdmin`, redirige a `home`.
- `ConfigPage`: guard doble `if (!isAdmin) return <div>No autorizado.</div>`.
- En **demo mode** `isAdmin` siempre es `true` (no hay login).

## 7. Reglas de negocio

- La creación masiva de parcelas **no borra** parcelas existentes; solo renombra (si cambia el prefijo) y completa hasta la cantidad.
- Los valores de config se guardan con `upsert` en la tabla `config` (`key`/`value`) en prod.
- Los chips en uso no se pueden borrar para evitar datos huérfanos.

## 8. RLS / Privacidad

- `ConfigPage` es frontend-only: la protección real de Configuración depende de que la sesión sea admin (los datos se leen igual con el cliente autenticado). El log de auditoría sí está protegido por RLS (`audit_log_select` habilita SELECT solo a `app_metadata.role = 'admin'`).