import { formatDate, formatMoney, formatPeriodo, mesDeFecha, nl2br, parseFecha } from '../../lib/format';
import { egresosMes } from '../../lib/finanzas';
import type { Movimiento } from '../../lib/types';
import { useApp } from '../../store/AppContext';
import { Chip } from '../ui/Chip';
import { IconButton, TextButton } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';

interface Props {
  open: boolean;
  onClose: () => void;
  periodo: string | null;
  flujo: Movimiento[];
  onEditar?: (m: Movimiento) => void;
  onEliminar?: (m: Movimiento) => void;
}

export function MovimientosPeriodoModal({ open, onClose, periodo, flujo, onEditar, onEliminar }: Props) {
  const { isAdmin } = useApp();
  if (!periodo) return null;
  const ing = flujo
    .filter((f) => f.tipo === 'Ingreso' && mesDeFecha(f.fecha) === periodo)
    .reduce((s, f) => s + (parseFloat(String(f.monto || 0)) || 0), 0);
  const eg = egresosMes(periodo, flujo);
  const movs = flujo
    .filter((f) => mesDeFecha(f.fecha) === periodo)
    .slice()
    .sort((a, b) => parseFecha(b.fecha) - parseFecha(a.fecha));

  return (
    <Modal
      open={open}
      title="Movimientos del periodo"
      onClose={onClose}
      footer={<TextButton onClick={onClose}>Cerrar</TextButton>}
    >
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.8rem' }}>
        <Chip tone="neutral">Periodo {formatPeriodo(periodo)}</Chip>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>
          Ingresos <strong style={{ color: 'var(--color-positive)' }}>{formatMoney(ing)}</strong> · Egresos{' '}
          <strong style={{ color: 'var(--md-sys-color-error)' }}>{formatMoney(eg)}</strong>
        </span>
      </div>

      {movs.length === 0 ? (
        <EmptyState texto="Sin movimientos para este periodo." />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ minWidth: 420 }}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Concepto</th>
                <th>Monto</th>
                {isAdmin && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {movs.map((f) => {
                const color = f.tipo === 'Ingreso' ? 'var(--color-positive)' : 'var(--md-sys-color-error)';
                return (
                  <tr key={f.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(f.fecha)}</td>
                    <td>
                      <Chip tone={f.tipo === 'Ingreso' ? 'positive' : 'error'}>{f.tipo}</Chip>
                    </td>
                    <td>
                      {f.concepto}
                      {f.descripcion && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }} dangerouslySetInnerHTML={{ __html: nl2br(f.descripcion) }} />
                      )}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap', color }}>{formatMoney(parseFloat(String(f.monto)) || 0)}</td>
                    {isAdmin && (
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <IconButton icon="edit" title="Editar" onClick={() => onEditar?.(f)} />
                        <IconButton icon="delete" className="danger" title="Eliminar" onClick={() => onEliminar?.(f)} />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}