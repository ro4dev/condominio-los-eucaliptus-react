# Comentarios (Reclamos / Sugerencias)

## 1. Descripción general

Pestaña que reemplaza a "Reclamos" del repo original: tanto administradores como propietarios pueden publicar reclamos o sugerencias. El público puede leer todo; solo el admin elimina.

ID del tab: `reclamos` (label "Comentarios")
Componente raíz: `src/components/reclamos/ReclamosPage.tsx`

## 2. Componentes

| Archivo | Rol |
|---------|-----|
| `ReclamosPage.tsx` | Listado con filtros y cards. |
| `ReclamoFormModal.tsx` | Formulario público de comentario. |

## 3. Filtros

- Todos (default) / Reclamos / Sugerencias.
- Orden por `fecha` (o `created_at`) desc.

## 4. Card de comentario

- Chip de tipo: **Sugerencia** → verde (`positive`), **Reclamo** → rojo (`error`).
- Fecha (`formatDate`), Asunto (bold), Descripción (`nl2br`, texo muted), Parcela origen (`numeroParcela`; "Anónimo" si no hay `parcela_id`).
- Eliminar: solo admin (con `confirm`).

## 5. Formulario (público)

- Botón "Agregar Comentario" visible **para todos** (no requiere admin).
- Campos: Tipo (Reclamo/Sugerencia), Parcela (`Select` obligatorio en la UI, aunque el tipo permite `null`), Asunto (req), Descripción (req).
- Guarda con `saveReclamo(payload)` (solo INSERT; no hay edición de comentarios en la UI actual).

## 6. Reglas de negocio

- Cualquier visitante puede leer y dejar comentarios; solo el admin puede borrarlos.
- No existe edición ni respuesta/resolución de reclamos en esta versión React.

## 7. RLS / Privacidad

- Lectura y escritura abiertas en la UI (INSERT directo a `reclamos`); la permisología real depende de políticas RLS. Cada creación/eliminación queda en `audit_log` (el INSERT lo registra `logAudit`).