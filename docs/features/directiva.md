# Directiva

## 1. Estado actual

**No existe info de la directiva en la app.** No hay lugar donde se deje (o muestre) información de los cargos (presidente, secretario, tesorero), su contacto, etc.

Realizado un barrido por `src/`, `public/`, `supabase/`, `docs/` y `README.md`, ninguna de las siguientes palabras aparece como feature: `directiva`, `directorio`, `director`, `board`, `junta`, `consejo`.

Único contenido relacionado, como dato de contacto, hoy vive en `public/data/config.json` → `datos_pago` (correo `tesoreria@eucaliptus.cl`), mostrado en el modal "Cómo pagar" de la Home. Es parte de la configuración de pago, no de la directiva.

## 2. Dónde vive

**No es una pestaña nueva.** Todo vive en la pestaña **Home**:

- **HomePage.tsx**: se agrega una card/sección "Directiva" que lista los cargos con su contacto.
- **Lectura**: visible para todos los usuarios logueados.
- **Edición**: los mismos botones de agregar/editar/quitar en la card, visibles **solo para admin** (mismo patrón CRUD que las demás páginas).

No se toca `tabs.ts` ni el `switch` de `App.tsx`.

## 3. Qué hace falta para implementarlo (patrón del resto de módulos)

| # | Pieza | Referencia de patrón |
|---|-------|----------------------|
| 1 | Card/sección "Directiva" en `src/components/home/HomePage.tsx` | modal "Cómo pagar" / cards de Asambleas |
| 2 | Interface `Directivo` en `src/lib/types.ts` | interfaces del archivo |
| 3 | Datos demo `public/data/directiva.json` + entrada en `DATA_MAP` de `src/lib/data.ts` | `asambleas.json` |
| 4 | Métodos CRUD en `src/store/DataContext.tsx` | `saveAsamblea`, `deleteAsamblea` |
| 5 | Para producción: tabla Supabase + migración en `supabase/migrations/` | `001_audit_log.sql` |

## 4. Campos de cada directivo (definido)

Siempre se muestra la **directiva actual** (no hay período ni foto):

- `nombre` (requerido)
- `cargo`: **Presidente / Secretario / Tesorero** (lista fija) + campo custom si hubiera otro cargo
- `telefono`
- `email`
- `extra`: campo de texto libre por si quieren agregar algo (p. ej. "Parcela 12" u otra cosa no prevista)

## 5. Reglas de negocio / privacidad

- **Lectura**: todos los usuarios logueados.
- **Escritura**: solo `admin`. El resto de módulos siguen esta misma regla (RI del botón solo afecta a UI; la RLS es la autoridad).
- **Auditoría**: los cambios se registran en `audit_log` (como en el resto de CRUD). `telefono`/`email` pasan por `sanitizeAudit` (PII → `[oculto]`).
- **RLS**: como otras tablas de la app, las políticas viven en Supabase (no en este repo).
