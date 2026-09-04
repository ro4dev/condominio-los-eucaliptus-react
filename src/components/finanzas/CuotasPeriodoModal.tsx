import { formatMoney, formatPeriodo } from '../../lib/format';
import { esperadoPorPeriodo, recaudadoPorPeriodo, isPagado, sumPagosGasto } from '../../lib/finanzas';
import type { Gasto, Pago, Parcela } from '../../lib/types';
import { useApp } from '../../store/AppContext';
import { Chip } from '../ui/Chip';
import { IconButton, TextButton } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';

interface Props {
  open: boolean;
  onClose: () => void;
  periodo: string | null;
  gastos: Gasto[];
  pagos: Pago[];
  parcelas: Parcela[];
  onRegistrarPago: (gasto: Gasto) => void;
  onEditar: (gasto: Gasto) => void;
  onEliminar: (gasto: Gasto) => void;
}

function parcelName(id: string, parcelas: Parcela[]): string {
  const p = parcelas.find((x) => x.id === id);
  return p ? p.numero : id;
}

export function CuotasPeriodoModal({ open, onClose, periodo, gastos, pagos, parcelas, onRegistrarPago, onEditar, onEliminar }: Props) {
  const { isAdmin } = useApp();
  if (!periodo) return null;

  const esp = esperadoPorPeriodo(periodo, gastos);
  const rec = recaudadoPorPeriodo(periodo, gastos, pagos);
  const pct = esp ? Math.round((rec / esp) * 100) : 0;
  const pctColor = pct >= 90 ? 'var(--color-positive)' : pct >= 60 ? '#f59e0b' : 'var(--md-sys-color-error)';

  const cuotas = gastos
    .filter((g) => g.periodo === periodo)
    .sort((a, b) => {
      const na = parcelName(a.parcela_id, parcelas);
      const nb = parcelName(b.parcela_id, parcelas);
      return na.localeCompare(nb, undefined, { numeric: true });
    });

  return (
    <Modal
      open={open}
      title="Cuotas del periodo"
      onClose={onClose}
      footer={<TextButton onClick={onClose}>Cerrar</TextButton>}
    >
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.8rem' }}>
        <Chip tone="neutral">Periodo {formatPeriodo(periodo)}</Chip>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>
          Esperado <strong style={{ color: 'var(--text)' }}>{formatMoney(esp)}</strong> · Recaudado{' '}
          <strong style={{ color: 'var(--md-sys-color-primary)' }}>{formatMoney(rec)}</strong> ·{' '}
          <strong style={{ color: pctColor }}>{pct}%</strong>
        </span>
      </div>

      {cuotas.length === 0 ? (
        <EmptyState texto="Sin cuotas para este periodo." />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ minWidth: 300 }}>
            <thead>
              <tr><th>Parcela</th><th>Importe</th><th></th></tr>
            </thead>
            <tbody>
              {cuotas.map((g) => {
                const pagado = sumPagosGasto(g.id, pagos);
                const monto = parseFloat(String(g.monto || 0)) || 0;
                const color = isPagado(g, pagos) ? 'var(--color-positive)' : (pagado > 0 ? '#f59e0b' : 'var(--text-muted)');
                return (
                  <tr key={g.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{parcelName(g.parcela_id, parcelas)}</td>
                    <td style={{ fontWeight: 600, color }}>{formatMoney(pagado)}/{formatMoney(monto)}</td>
                    <td style={{ width: '1%', whiteSpace: 'nowrap' }}>
                      <IconButton icon="payments" onClick={() => onRegistrarPago(g)} title="Ver pagos" />
                      {isAdmin && <IconButton icon="edit" onClick={() => onEditar(g)} title="Editar" />}
                      {isAdmin && <IconButton icon="delete" onClick={() => onEliminar(g)} title="Eliminar" className="danger" />}
                    </td>
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
