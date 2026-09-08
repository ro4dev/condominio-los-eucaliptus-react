# Directiva

## 1. Estado actual

**No existe un módulo de Directiva en la app.** No hay pestaña, página, ruta, tipo, datos demo ni tabla Supabase donde se deje información de la directiva (presidente, secretario, tesorero, contacto, período, etc.).

Realizado un barrido por `src/`, `public/`, `supabase/`, `docs/` y `README.md`, ninguna de las siguientes palabras aparece como feature: `directiva`, `directorio`, `director`, `board`, `junta`, `consejo`.

Único contenido relacionado, como dato de contacto, hoy vive en `public/data/config.json` → `datos_pago` (correo `tesoreria@eucaliptus.cl`), mostrado en el modal "Cómo pagar" de la Home. Es parte de la configuración de pago, no de la directiva.

## 2. Qué hace falta para crear el módulo

Para que exista, debe seguir el patrón que ya usan los demás módulos (p. ej. Asambleas, Reclamos). Todo esto hace falta hoy:

| # | Pieza | Referencia de patrón |
|---|-------|----------------------|
| 1 | `TabId` + entrada en `src/components/layout/tabs.ts` | `asambleas`, `reclamos`, etc. |
| 2 | Página `DirectivaPage.tsx` + `case` en el `switch` de `src/App.tsx` | `AsambleasPage.tsx` |
| 3 | Interface `Directivo` en `src/lib/types.ts` | interfaces del archivo (182 líneas) |
| 4 | Datos demo `public/data/directiva.json` + entrada en `DATA_MAP` de `src/lib/data.ts` | `asambleas.json` |
| 5 | Métodos CRUD en `src/store/DataContext.tsx` | `saveAsamblea`, `deleteAsamblea` |
| 6 | Para producción: tabla Supabase + migración en `supabase/migrations/` | `001_audit_log.sql` |

## 3. Campos de cada directivo (definido)

Siempre se muestra la **directiva actual** (no hay período ni foto):

- `nombre` (requerido)
- `cargo`: **Presidente / Secretario / Tesorero** (lista fija) + campo custom si hubiera otro cargo
- `telefono`
- `email`
- `extra`: campo de texto libre por si quieren agregar algo (p. ej. "Parcela 12" u otra cosa no prevista)

## 4. Reglas de negocio / privacidad

- **Lectura**: todos los usuarios logueados.
- **Escritura**: solo `admin`. El resto de módulos siguen esta misma regla (RI del tab solo afecta a UI; la RLS es la autoridad).
- **Auditoría**: los cambios se registran en `audit_log` (como en el resto de CRUD). `telefono`/`email` pasan por `sanitizeAudit` (PII → `[oculto]`).
- **RLS**: como otras tablas de la app, las políticas viven en Supabase (no en este repo).
