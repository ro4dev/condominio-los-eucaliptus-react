# Autenticación y roles

## 1. Descripción general

Login, signup y logout contra Supabase Auth desde el cliente, más dos edge functions para la gestión de usuarios propietarios. En **modo demo** no hay auth: `isAdmin` siempre es `true` y los datos son locales. Sin variables de entorno, `supabaseClient` es `null` y el login informa que la auth no está configurada.

Componentes y archivos:
- `src/store/AppContext.tsx` — estado global de sesión y `isAdmin`.
- `src/components/auth/LoginModal.tsx` — formulario de login.
- `src/lib/supabase.ts` — cliente lazy (se crea solo si `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` existen).
- `supabase/functions/create-user/index.ts` — edge function Deno.
- `supabase/functions/delete-user/index.ts` — edge function Deno.

## 2. Estado de sesión (AppContext)

| Estado | Descripción |
|--------|-------------|
| `currentUserEmail` / `currentUserId` | Sesión activa (de `getSession()` y `onAuthStateChange`). |
| `isAdmin` | `user.app_metadata.role === 'admin'`. Con `demoMode` siempre `true`. |

Al cambiar `demoMode`, se re-lee la sesión. El efecto de `onAuthStateChange` actualiza email/id/rol ante cualquier evento de sesión y se limpia en el `unmount`.

**Admin vs propietario**: la distinción es exclusivamente por `app_metadata.role`. El admin se crea manualmente en el proyecto Supabase (no hay flujo de UI para crear admins).

## 3. Login / Signup / Logout

- `login(email, password)` → `signInWithPassword`. Errores mapeados: "Email o contraseña incorrectos" si el mensaje es `Invalid login credentials`; si auth no está configurada, devuelve error claro.
- `signup(email, password)` → `signUp` (existe en el contexto, sin UI asociada al momento).
- `logout()` → `signOut()`.
- `LoginModal`: email + password, botón deshabilitado mientras `busy`, error inline; si `!supabaseClient` muestra aviso de configuración.

## 4. `create-user` (edge function)

Crea un usuario propietario **y** su registro en `propietarios` de forma atómica:

1. `POST` con `{ email, nombre_completo, rut, telefono, tipo, parcela_id }` (email, nombre y rut requeridos).
2. **Contraseña derivada del RUT**: `rut.replace(/[\.\-]/g, '')` (ej. `12345678-9` → `123456789`). Valida política: ≥ 8 caracteres y al menos un número — si no, responde error.
3. Verifica que el email no exista ya entre usuarios (`auth.admin.listUsers`) → `409` si existe.
4. `auth.admin.createUser({ password, email_confirm: true, app_metadata: { role: 'propietario' }, user_metadata: { nombre_completo, tipo, parcela_id } })`.
5. Inserta el `propietarios`; **si falla, hace rollback** borrando el usuario de auth (`admin.deleteUser`).

Respuestas: `400` datos inválidos, `409` email duplicado, `500` fallo al insertar propietario.

Uso desde el cliente: `DataContext.savePropietario` lo invoca **solo al crear** (no al editar).

## 5. `delete-user` (edge function)

1. `POST` con `{ propietario_id }`.
2. Borra `propietarios` (retorna el registro; `404` si no existe, `500` si falla).
3. Busca el usuario por `email` del propietario y lo elimina (`auth.admin.deleteUser`).
4. Devuelve `{ success: true }`.

Uso: `DataContext.deletePropietario`.

## 6. Dónde el rol afecta la UI

| Área | Comportamiento |
|------|----------------|
| Tabs | `config` se oculta para `!isAdmin` (TabsNav + guard en App). |
| Home | Admin ve morosos globales; propietario ve solo su parcela. |
| Encuestas | El voto requiere sesión y parcela (mail match). |
| CRUDs | Botones de crear/editar/eliminar visibles solo para admin (Parcelas, Noticias, Documentos, Proveedores, Asambleas, Encuestas, Ventas, Config, Finanzas). |
| Comentarios / Ventas | Cualquiera puede crear; el borrado es solo admin. |
| Auditoría | La tabla `audit_log` solo responde SELECT a admin por RLS. |

## 7. Reglas de negocio

- No hay recuperación de contraseña ni confirmación de email en la UI (el edge function crea usuarios con `email_confirm: true`).
- La contraseña inicial del propietario es derivada de su RUT; si el RUT no cumple la política de contraseñas, la función rechaza la creación.
- En modo demo no se debe asumir ninguna de estas protecciones (datos locales).

## 8. RLS / Seguridad

- El cliente usa `anon` key (RLS debe estar habilitada por tabla).
- Las edge functions usan `SUPABASE_SERVICE_ROLE_KEY` → **solo deben ejecutarse desde el lado servidor** y son el único camino para crear usuarios auth.
- `audit_log`: políticas `audit_log_select` (admin) y `audit_log_insert` (cualquier autenticado), definidas en `supabase/migrations/001_audit_log.sql`.