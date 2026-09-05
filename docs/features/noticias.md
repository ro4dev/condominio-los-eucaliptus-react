# Noticias

## 1. Descripción general

Pestaña de comunicados del condominio con filtros por vigencia y destacadas, CRUD (solo admin) y pinneo para que una noticia aparezca en Home ("Noticias destacadas"). Renderiza los datos con escape de HTML.

ID del tab: `noticias`
Componente raíz: `src/components/noticias/NoticiasPage.tsx`

## 2. Componentes

| Archivo | Rol |
|---------|-----|
| `NoticiasPage.tsx` | Listado con filtros, acciones y card de noticia. |
| `NoticiaFormModal.tsx` | Agregar/editar noticia. |

## 3. Filtros

| Filtro | Criterio |
|--------|----------|
| Vigentes (default) | `!fecha_hasta \|\| fecha_hasta >= todayISO()` |
| Destacadas | `pinned === true` |
| No vigentes | negación de "Vigentes" |
| Todas | sin filtro |

Orden: por `fecha` (o `created_at`) descendente.

## 4. Card de noticia

- Título (escaped con `escHtml`), fecha (`formatDate`), descripción con saltos de línea (`nl2br`).
- Link "Ver archivo adjunto" si `archivo` está presente y pasa `safeUrl` (en el form **no** hay campo de archivo en la UI actual; el campo existe en el tipo `Noticia`).
- Acciones admin: pin/despin (`toggleNoticiaPinned`), editar, eliminar (con `confirm`).
- Empty state: "No hay noticias."

## 5. NoticiaFormModal

- Campos: Título (req), Vigente hasta (fecha, opcional), Descripción (req), "Destacar en Home" (switch, solo admin).
- Guarda con `saveNoticia(payload, isEdit)`.

## 6. Integración con Home

En `HomePage.tsx`, el bloque "Noticias destacadas" muestra hasta 3 noticias con `pinned === true` **y vigentes** (`!fecha_hasta || fecha_hasta >= hoy`), ordenadas por fecha desc. Solo el admin puede pinnear (el switch y el pin del listado se ocultan para no-admin).

## 7. Reglas de negocio

- Vigencia se define por la fecha `fecha_hasta` inclusiva (se compara con el día de hoy); sin `fecha_hasta`, la noticia es perpetua.
- El pinneo es un booleano `pinned`; no hay límite de destacadas en el listado, pero Home muestra máximo 3.

## 8. RLS / Privacidad

- Lectura: cualquier usuario (los datos vienen de `loadJson('NOTICIAS')` / tabla `noticias`).
- Escritura (crear/editar/borrar/pinnear): la UI restringe a admin, y cada operación queda en `audit_log`.