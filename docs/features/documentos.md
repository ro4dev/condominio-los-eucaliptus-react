# Documentos

## 1. Descripción general

Pestaña de documentos del condominio (estatuto, actas, contratos, seguros, planos, etc.) con filtro por categoría, CRUD (solo admin), descripción visible en modal y archivo adjunto descargable. Las categorías salen de la configuración global con defaults.

ID del tab: `documentos`
Componente raíz: `src/components/documentos/DocumentosPage.tsx`

## 2. Componentes

| Archivo | Rol |
|---------|-----|
| `DocumentosPage.tsx` | Listado con filtro por categoría y cards. |
| `DocumentoFormModal.tsx` | Agregar/editar documento. |

## 3. Categorías y filtro

Las categorías se leen de `config.categorias_documentos`; si no hay configuradas, se usan defaults:

```ts
const DEFAULT_CATS = ['Estatuto', 'Actas', 'Contratos', 'Seguros', 'Planos'];
```

Filtros: chips con `['Todos', ...categorias]`. Orden por `fecha` (o `created_at`) desc.

## 4. Card de documento

- Icono por categoría (`ICONS`: Estatuto→book, Actas→description, Contratos→contract, Seguros→shield, Planos→map; fallback `description`).
- Nombre (ellipsis), categoría · fecha.
- Acciones admin: editar, eliminar (`confirm`).
- Acción "ver descripción" (icono `info`) → `Modal` con el texto (`nl2br`, `white-space: pre-wrap`).
- Link "Ver documento" (icono `description`) abriendo `safeUrl(d.archivo)` en otra pestaña.
- Empty state: "No hay documentos en esta categoría."

## 5. DocumentoFormModal

- Campos: Nombre (req), Categoría (`Select` desde config o defaults, req), Descripción (req), Archivo (opcional).
- Subida: demo → `blobURLDemo`; prod → `subirArchivo(file, 'documentos', categoria)` (bucket `documentos`, carpeta = categoría).
- Al editar con archivo previo, muestra "Ver archivo actual".
- Guarda con `saveDocumento(payload, isEdit)`.

## 6. Reglas de negocio

- El campo `nombre` es de solo lectura en la UI del detalle (no editable por propietarios).
- Volver a subir archivo al editar reemplaza el `archivo` del registro (signed URL nueva).
- El archivo se guarda como URL firmada de Supabase Storage vigente por **7 días** (ver `arquitectura-datos.md`); no se elimina el objeto del bucket al borrar el documento.

## 7. RLS / Privacidad

- Lectura pública de metadatos y archivo (la URL firmada ya es de acceso autenticado/anónimo según el bucket).
- Escritura restringida a admin en la UI; cada cambio queda en `audit_log`.