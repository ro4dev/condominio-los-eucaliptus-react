# Parcelas

## 1. Descripción general

Módulo que administra las parcelas del condominio y sus propietarios. Vista de tabla con estado, rol y metros; modal por parcela para ver/editar/agregar propietarios; CRUD de parcelas (solo admin). La creación masiva y renombrado por prefijo vive en Configuración (ver `config-admin.md`).

ID del tab: `parcelas`
Componente raíz: `src/components/parcelas/ParcelasPage.tsx`

## 2. Componentes

| Archivo | Rol |
|---------|-----|
| `ParcelasPage.tsx` | Tabla de parcelas + estado de propietarios. |
| `ParcelaFormModal.tsx` | Agregar/editar parcela. |
| `PropietariosModal.tsx` | Lista de propietarios de una parcela. |
| `PropietarioFormModal.tsx` | Agregar/editar propietario. |

## 3. Vista de Parcelas

- Ordenadas por `numero` (parse numérico, `parseInt(numero.replace(/\D/g,''))`).
- Botón "Agregar Parcela" visible solo para admin.
- Columnas: **Parcela** (destacada), **Rol**, **Metros²** (`X m²`), **Estado** (chip), **Propietarios** (icono contador, abre modal), **acción editar** (admin).
- Chip de estado según texto: contiene "habit" → verde (`positive`); "construc" → ámbar (`warning`); else neutral.
- Empty state: "No hay parcelas registradas."

## 4. Propietarios

### PropietariosModal

- Lista los propietarios de la parcela: nombre + tipo, y por cada uno teléfono (`tel:`), email (`mailto:`) y RUT.
- Footer: **Agregar** (admin) → abre el form con la parcela fija (`parcelaIdFija`).
- Editar/eliminar: solo admin.

### PropietarioFormModal

- Campos: Nombre completo (req), RUT (req), Parcela (req; fija con input deshabilitado si viene de una parcela, si no `<Select>`), Teléfono, Email (req), Tipo (`Propietario | Inquilino | Administrador`).
- Guarda con `savePropietario(payload, isEdit)`.

## 5. ParcelaFormModal

- Campos: Número (req, **deshabilitado al editar**), Rol, Metros² (number ≥ 0), Estado (`Habitada | Desocupada | En construcción`).
- Guarda con `saveParcela(payload, isEdit)`.

## 6. Datos y lógica (DataContext)

Tablas: `parcelas` y `propietarios`.

- `saveParcela`: insert/update directo a `parcelas` (demo: estado local).
- `savePropietario`: 
  - **Edición**: update directo a `propietarios`.
  - **Creación en prod**: invoca la edge function **`create-user`** (ver `auth.md`), que crea el usuario de Supabase Auth (password derivado del RUT) y el registro en `propietarios`. No se inserta `propietarios` directo desde el cliente.
- `deletePropietario`: en prod invoca la edge function **`delete-user`** (borra el registro y el usuario de Auth). En demo solo elimina localmente.

## 7. Creación masiva de parcelas

En `src/components/config/ConfigPage.tsx` (solo admin) — detalle en `config-admin.md`:
- Renombra parcelas que matchean `^(\D+)\s+(\d+)$` con el prefijo anterior al nuevo prefijo.
- Crea las faltantes para llegar a `cantidad` con `metros: '0'` y `estado: 'Sin asignar'`.
- Persiste `config.parcelas_cantidad` y `config.parcelas_prefijo`.

## 8. Reglas de negocio

- El número de parcela identifica la parcela en todo el sistema (cuotas, morosos, asistentes, publicaciones).
- El estado es libre pero la UI lo normaliza por texto (habitada/construcción).
- Eliminar una parcela no borra en cascada cuotas/pagos asociados en la UI; es responsabilidad de la DB / uso deliberado.

## 9. RLS / Privacidad

- `propietarios` expone RUT/teléfono/email; las políticas RLS efectivas no viven en este repo (salvo `audit_log`). La UI exige sesión para entrar a Configuración, pero la vista de Parcelas es pública en la navegación React; el enmascarado de PII se aplica solo en el log de auditoría (`sanitizeAudit` oculta `rut`, `telefono`, `email`).