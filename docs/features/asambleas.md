# Asambleas

## 1. Descripción general

Pestaña de asambleas (ordinarias y extraordinarias) con temario, acuerdos y registro de asistentes por parcela. CRUD solo admin.

ID del tab: `asambleas`
Componente raíz: `src/components/asambleas/AsambleasPage.tsx`

## 2. Componentes

| Archivo | Rol |
|---------|-----|
| `AsambleasPage.tsx` | Listado con filtros y cards. |
| `AsambleaFormModal.tsx` | Agregar/editar asamblea + asistentes. |

## 3. Filtros

- Todos (default) / Ordinarias / Extraordinarias.
- Orden por `fecha` desc (`${fecha}T00:00:00` comparado como string ISO).

## 4. Card de asamblea

- Chip tipo: **Extraordinaria** → ámbar (`warning`), **Ordinaria** → `primary`.
- Fecha (`formatDate`), **Temario** (`nl2br`), **Acuerdos** (si existen, `nl2br`).
- **Asistentes**: chips con el número de parcela de cada asistente (`parcela_id` → `numero`), ordenados numéricamente por parcela (ignora ids sin parcela).
- Acciones editar/eliminar (admin). El `confirm` de eliminar avisa que también se perderán los asistentes asociados.
- Empty state: "No hay asambleas."

## 5. AsambleaFormModal

- Campos: Fecha (req), Tipo (Ordinaria/Extraordinaria), Temario (req), Acuerdos, Asistentes.
- **Asistentes**: filas chips/parcelas con *toggle* individual y link "Seleccionar todas". Parcelas ordenadas numéricamente.
- En edición se precargan los asistentes actuales (`asistentesIds`).
- Guarda con `saveAsamblea(payload, sel)`.

## 6. Persistencia (DataContext)

`saveAsamblea` maneja asamblea + asistentes de forma atómica:
- Demo: actualiza/agrega la asamblea y **reemplaza** los `asamblea_asistentes` de esa asamblea.
- Prod:
  1. INSERT/UPDATE en `asambleas` (obtiene el `id` insertado).
  2. DELETE de `asamblea_asistentes` del id.
  3. INSERT de los nuevos asistentes (`{ asamblea_id, parcela_id }[]`).

`deleteAsamblea` borra primero `asamblea_asistentes` y luego la asamblea.

## 7. Reglas de negocio

- No hay límite de asistentes ni control de quorum mínimo en la UI (a diferencia de Encuestas).
- Editar asistentes sobrescribe el listado completo (no es diferencial).

## 8. RLS / Privacidad

- Lectura pública; escritura solo admin (UI) y en `audit_log`. Las políticas RLS de las tablas `asambleas`/`asamblea_asistentes` no viven en este repo.