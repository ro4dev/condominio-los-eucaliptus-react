# Encuestas

## 1. Descripción general

Pestaña de votaciones del condominio: un voto por parcela, opción simple "A favor/En contra" o alternativas personalizadas, quorum opcional, resultados con barras de porcentaje y cierre por fecha de término. CRUD solo admin.

ID del tab: `encuestas`
Componente raíz: `src/components/encuestas/EncuestasPage.tsx`

## 2. Componentes

| Archivo | Rol |
|---------|-----|
| `EncuestasPage.tsx` | Listado con filtros, votación y resultados. |
| `EncuestaFormModal.tsx` | Crear/editar encuesta. |

## 3. Filtros y estado

- Abiertas (default) / Cerradas.
- **Cerrada** = `ahora > fecha_termino` (fin del día de término, 23:59:59). Sin `fecha_termino` la encuesta nunca cierra.
- Orden por `created_at` desc.
- Cards cerradas con `opacity: 0.7`.

## 4. Votación

**Identidad**: el voto requiere sesión **y** parcela asociada — `propietarios.find(p => p.email === currentUserEmail)?.parcela_id` (misma convención email↔parcela que Home).

Flujo `votar()`:
1. Sin sesión → snackbar "Debes iniciar sesión para votar."
2. Parcela no encontrada → snackbar de error.
3. `registrarVoto(encuestaId, parcelaId, seleccion)`.

**Un voto por parcela**: prod usa la restricción única de la DB (`encuestas_votos` con `(encuesta_id, parcela_id)` único); el error `23505` devuelve "Ya votaste en esta encuesta." Demo no lo valida (agrega sin verificar).

UI de votación: botón "Votar" por opción (solo si encuesta abierta y sin `miVoto`); la opción con mi voto se resalta (`✓` + fondo `--skeleton-1`). Si ya se votó, footer "Ya votaste".

## 5. Resultados

- Por opción: `conteo` (nº votos) posición y barra `width: pct%` con color cíclico:

```ts
const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#b91c1c', '#8b5cf6', '#ec4899'];
```

- Chip **Quorum**: `d.total/e.quorum` con ✓ si se alcanzó (solo si `quorum` configurado).
- Chip **Total**: `X votos`.
- Si `fecha_termino` está próxima (mismo día), muestra "Termina en: Xh Ym" (`getTimeRemaining`).

## 6. EncuestaFormModal

- Campos: Título (req), Descripción (req), Fecha de término (req en UI), Quorum (mín. votos, opcional).
- **Alternativas**:
  - Crear: checkbox "Con alternativas". Apagado → "A favor"/"En contra" (modo simple). Encendido → lista editable con `+ Alternativa` y eliminar por fila; si quedan vacías, queda "A favor"/"En contra".
  - Editar: muestra las opciones actuales en modo **solo lectura** ("no editable al tener votos").
- Guarda con `saveEncuesta(payload, isEdit)`.

## 7. Reglas de negocio

- Un voto por parcela por encuesta (garantizado por constraint único en prod).
- El quorum es solo visual: no bloquea votar, solo muestra el cumplimiento.
- La votación solo se habilita mientras la encuesta esté abierta.
- La eliminación borra también los votos (`deleteEncuesta` borra `encuestas_votos` y luego `encuestas`).

## 8. RLS / Privacidad

- El voto se inserta con el cliente autenticado; el constraint único previene dobles votos incluso si la UI fallara (manejado en `registrarVoto`).
- CRUD de encuestas: solo admin en la UI, con registro en `audit_log`.