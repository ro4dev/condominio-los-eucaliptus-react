# Ventas (Publicaciones)

## 1. Descripción general

Pestaña de clasificados del condominio ("Ventas"): los vecinos publican productos o servicios en venta con foto, precio, parcela y contacto. Filtros por categoría y estado. Cualquier usuario publica; admin edita/elimina.

ID del tab: `publicaciones` (label "Ventas")
Componente raíz: `src/components/ventas/VentasPage.tsx`

## 2. Componentes

| Archivo | Rol |
|---------|-----|
| `VentasPage.tsx` | Grid de cards + filtros + modal de foto. |
| `PublicacionFormModal.tsx` | Crear/editar publicación. |

## 3. Filtros

- **Categoría**: Todas / Productos / Servicios (default `todas`).
- **Estado**: Todos / Disponibles / Vendidos (default `Disponible`).
- Orden por `created_at` desc.

## 4. Card de publicación

- Foto: `object-fit: cover`, `loading="lazy"`; clic abre `Modal` con la imagen completa. Sin foto → placeholder "Sin imagen" (icono `image_not_supported`).
- Chips: categoría (Producto→primary, Servicio→neutral), estado (Disponible→positivo, Vendido→neutral). Cards vendidas con `opacity: 0.7`.
- Título, descripción (`nl2br`), precio (`formatMoney`, si no es null/''/undefined), parcela (icono `location_on`), contacto (icono `phone`).
- Acciones admin: editar / eliminar (`confirm`).
- Empty state: "No hay publicaciones con estos filtros."

## 5. PublicacionFormModal

- Campos: Título (req), Categoría (Producto/Servicio), Precio ($, opcional), Descripción, Parcela (`Select` opcional, placeholder "Sin especificar"), Estado (Disponible/Vendido), Contacto, Foto (opcional).
- Subida: demo → `blobURLDemo`; prod → `subirArchivo(file, 'publicaciones', '')`.
- Al crear setea `usuario = currentUserEmail || 'anónimo'` (también lo hace `savePublicacion` como fallback).
- Guarda con `savePublicacion(payload, isEdit)`.

## 6. Reglas de negocio

- Cualquier usuario (incluso sin sesión) puede **publicar**; la autoría queda a nombre de la sesión o `anónimo`.
- Solo admin edita y elimina cualquier publicación.
- El estado `Vendido` es un simple flag; no hay flujo de compra ni chat.

## 7. RLS / Privacidad

- Lectura pública de clasificados.
- Fotos en bucket `publicaciones` con URL firmada (7 días). La escritura queda en `audit_log`.