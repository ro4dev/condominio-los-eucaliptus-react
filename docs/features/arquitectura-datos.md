# Arquitectura de datos y estado

## 1. Descripción general

Cómo la app React carga, mantiene y persiste los datos. Reemplaza a `data.js` del frontend original: en vez de globals y renders manuales, todo vive en un DataContext con estado React y una capa de datos `src/lib/data.ts` que abstrae **demo** (JSON local) vs **prod** (Supabase).

## 2. Modo demo vs producción

Supervisado por `src/lib/appConfig.ts` (persistido en `localStorage`):

```ts
getDemoMode()  // localStorage 'demoMode' !== 'false'  → default true
getDarkTheme() // localStorage 'theme' === 'dark'
```

- **Demo**: `fetch` de `public/data/*.json` (13 datasets + config) con `cache: 'no-store'`. Los cambios se aplican solo al estado del contexto (no se persisten entre recargas).
- **Prod**: consultas a Supabase con el cliente autenticado; cada escritura hace `reload()` para re-sincronizar el estado.

El cliente Supabase (`src/lib/supabase.ts`) existe solo si `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` están definidas; si no, la app queda en modo demo de facto.

## 3. Tablas y archivos demo

Mapeo en `src/lib/data.ts` (`DATA_MAP`):

| Key | Demo (public/data) | Tabla Supabase |
|-----|--------------------|----------------|
| GASTOS | gastos.json | gastos |
| PAGOS | pagos.json | pagos |
| FLUJO | ingresos_egresos.json | flujo |
| PARCELAS | parcelas.json | parcelas |
| PROPIETARIOS | propietarios.json | propietarios |
| NOTICIAS | noticias.json | noticias |
| DOCUMENTOS | documentos.json | documentos |
| RECLAMOS | reclamos.json | reclamos |
| PROVEEDORES | proveedores.json | proveedores |
| ASAMBLEAS | asambleas.json | asambleas |
| ASAMBLEA_ASISTENTES | asamblea_asistentes.json | asamblea_asistentes |
| ENCUESTAS | encuestas.json | encuestas |
| ENCUESTAS_VOTOS | encuestas_votos.json | encuestas_votos |
| PUBLICACIONES | publicaciones.json | publicaciones |
| AUDIT_LOG | audit_log.json | audit_log |

`loadFinanzasData()` (`data.ts:102`) carga **todos** los datasets en paralelo (`Promise.all`) + `config` desde `config.json` o `config` (key/value → objeto).

## 4. DataContext (`src/store/DataContext.tsx`)

Es el único proveedor de datos de la app (envuelve toda la app en `src/main.tsx`, junto a `AppProvider` y `Snackbar`).

- Estado: `data: FinanzasData | null`, `loading: boolean`, `reload()`.
- Expone via `useData()` todos los arrays + funciones CRUD memoizadas (`useCallback`/`useMemo`).
- **Patrón de escritura** uniforme por entidad:
  - Demo: actualiza el estado local (INSERT/UPDATE/DELETE) y opcionalmente `logAudit`.
  - Prod: `supabase.from(tabla).insert/update/delete(...)`, luego `reload()` y snackbar de éxito/error.
- **Creación demo** de ids: `generateUUID()` (v4, `format.ts`).
- **Casos especiales**:
  - `savePropietario` (crear) → edge function `create-user`; `deletePropietario` → edge function `delete-user` (ver `auth.md`).
  - `generarCuotas` → forEach parcela (demo) o insert masivo (prod), sin duplicar parcelas con cuota en el periodo.
  - `saveAsamblea` → asamblea + reemplazo de asistentes (transacción de 3 pasos en prod).
  - `registrarVoto` → maneja constraint único `23505` ("Ya votaste").
  - `saveConfigValue` / `savePeriodos` → `upsert` en `config`.

## 5. Auditoría de cambios (`logAudit`)

Cada INSERT/UPDATE/DELETE registra entrada en `audit_log`:

```ts
logAudit(tabla, accion, registro) → { tabla, accion, registro_id, datos, usuario: currentUserEmail || 'anónimo' }
```

- `datos` pasa por **`sanitizeAudit`** (`format.ts`), que enmascara PII: `rut`, `telefono`, `email` → `'[oculto]'`. El resto del registro se guarda como JSONB.
- Demo: inserta al inicio del array `audit_log` del contexto.
- Prod: `supabase.from('audit_log').insert(entry)`; errores solo se loguean a consola.

**Tabla y RLS** (`supabase/migrations/001_audit_log.sql`):
- `CREATE TABLE IF NOT EXISTS audit_log` (id UUID pk, tabla, accion CHECK INSERT/UPDATE/DELETE, registro_id, datos JSONB, usuario, created_at).
- `audit_log_select`: `FOR SELECT` solo rol `admin`.
- `audit_log_insert`: `FOR INSERT` cualquier `authenticated`.

Se visualiza en `ConfigPage` → `AuditSection` (ver `config-admin.md`).

## 6. Procesamiento de archivos (`src/lib/storage.ts`)

- `subirArchivo(file, bucket, folder)`:
  1. Requiere usuario autenticado (si no: "Debes iniciar sesión.").
  2. **Comprime imágenes** (`browser-image-compression`, lazy import): máx 500 KB / 1920 px, con `useWebWorker`.
  3. Sube a `bucket/folder-or-userId/<timestamp>.<ext>` con `upties false`.
  4. Devuelve **URL firmada de 7 días** (`createSignedUrl(path, 7*24*60*60)`).
- `blobURLDemo(file)`: misma compresión pero devuelve un `URL.createObjectURL` para modo demo.

Buckets usados: `gastos_comunes` (gastos y pagos), `ingresos_egresos` (flujo), `documentos` (por categoría), `publicaciones` (fotos).

## 7. AppContext (`src/store/AppContext.tsx`)

Estado transversal (ver `auth.md`): `isDark`, `demoMode`, `snackbar` (`showSnackbar` con timeout 3s), sesión (`currentUserEmail`/`currentUserId`), `isAdmin`, `login`/`signup`/`logout`. El toggle de `isDark` agrega/quita la clase `dark` al `body` (los charts re-leen colores vía `useChartColors`).

## 8. Estructura de componentes (UI kit)

`src/components/ui`: `Button` (+ `IconButton`/`TextButton`), `Chip`, `EmptyState`, `Icon` (material-symbols-outlined), `Modal`, `Select`, `StatCard`, `Switch`; más `Snackbar` global y los componentes de layout `Header`/`TabsNav`/`ComingSoon`.

`App.tsx`: `activeTab` + `guard` que fuerza `home` si `!isAdmin` y el tab es `config`, y un `switch` que renderiza la página según `TabId`.

## 9. Reglas y notas

- Demo y prod comparten la misma lógica pura de finanzas (`src/lib/finanzas.ts`), formateo y sanitización; no hay ramas de cálculo.
- Los `allowed` de escritura del demo NO representan seguridad: en prod la RLS es la autoridad.
- La eliminación de un registro no borra objetos de Storage asociados.