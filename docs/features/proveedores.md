# Proveedores

## 1. Descripción general

Pestaña de proveedores de servicios del condominio en formato grid de cards, con rubro y datos de contacto. CRUD restringido a admin.

ID del tab: `proveedores`
Componente raíz: `src/components/proveedores/ProveedoresPage.tsx`

## 2. Componentes

| Archivo | Rol |
|---------|-----|
| `ProveedoresPage.tsx` | Grid de cards y acciones. |
| `ProveedorFormModal.tsx` | Agregar/editar proveedor. |

## 3. Vista

- Grid responsive (`repeat(auto-fill, minmax(260px, 1fr))`).
- Card: chip del **rubro**, nombre destacado, y filas con icono para: contacto (person), teléfono (`tel:`), email (`mailto:`), Web/Instagram (link si `safeUrl`, sino texto).
- Observaciones al pie (gris).
- Acciones editar/eliminar (admin) en la cabecera de la card.
- Empty state: "No hay proveedores registrados."

## 4. Rubros

Se leen de `config.rubros_proveedores`; default si no hay config:

```ts
const DEFAULT_RUBROS = ['Jardinería', 'Plomería', 'Electricidad', 'Albañilería', 'Pintura', 'Limpieza', 'Seguridad', 'Carpintería', 'Herrería', 'Tecnología', 'Otro'];
```

(Se pueden gestionar en Configuración → chips; ver `config-admin.md`.)

## 5. ProveedorFormModal

- Campos: Rubro (`Select`, req), Nombre (req), Contacto (req), Teléfono, Email, Web/Instagram, Observaciones.
- **Validación de Web/Instagram**: no puede contener espacios ni comas (de lo contrario snackbar de warning y no guarda); si no empieza con `http`, se antepone `https://`.
- Guarda con `saveProveedor(payload, isEdit)`.

## 6. Reglas de negocio

- "Contacto" es obligatorio (persona de referencia), aunque teléfono/email sean opcionales.
- El rubro es un valor fijo del config, no libre al crear.

## 7. RLS / Privacidad

- Lectura pública; escritura solo admin en la UI, con registro en `audit_log`. No maneja PII sensible más allá del contacto, pero igual pasa por `sanitizeAudit` (solo enmascara `rut`, `telefono`, `email`).