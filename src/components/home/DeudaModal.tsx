import { formatMoney, formatPeriodo } from '../../lib/format';
import { deudaParcela, deudaPorPeriodo, sumPagosGasto } from '../../lib/finanzas';
import type { Gasto, Pago } from '../../lib/types';
import { useApp } from '../../store/AppContext';
import { useData } from '../../store/DataContext';
import { Button, TextButton } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface Props {
  open: boolean;
  parcelaId: string | null;
  parcelaNombre: string;
  onClose: () => void;
  onRegistrarPago: (gasto: Gasto) => void;
}

function gastoObjetivo(parcelaId: string, gastos: Gasto[], pagos: Pago[]): Gasto | null {
  const detalle = deudaPorPeriodo(parcelaId, gastos, pagos);
  if (!detalle.length) return null;
  const periodo = detalle[0].periodo;
  const restos = gastos
    .filter((g) => g.parcela_id === parcelaId && g.periodo === periodo)
    .map((g) => ({ g, restante: Math.max(0, (parseFloat(String(g.monto || 0)) || 0) - sumPagosGasto(g.id, pagos)) }));
  if (!restos.length) return null;
  const target = restos.reduce((a, b) => (b.restante > a.restante ? b : a));
  return target.restante > 0 ? target.g : null;
}

export function DeudaModal({ open, parcelaId, parcelaNombre, onClose, onRegistrarPago }: Props) {
  const { isAdmin } = useApp();
  const { gastos, pagos } = useData();
  if (!open || !parcelaId) return null;

  const detalle = deudaPorPeriodo(parcelaId, gastos, pagos);
  const total = deudaParcela(parcelaId, gastos, pagos);

  let body;
  if (!detalle.length) {
    body = (
      <div>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Esta parcela está al día.</p>
        {total === 0 ? null : <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>Tiene saldo a favor que se aplicará a futuros periodos.</p>}
      </div>
    );
  } else {
    body = (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', paddingBottom: '0.4rem', borderBottom: '1px solid var(--divider)' }}>
          <span>Periodo</span>
          <span>Deuda</span>
        </div>
        {detalle.map((d) => (
          <div key={d.periodo} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--divider)' }}>
            <span style={{ color: 'var(--text)' }}>{d.periodo ? formatPeriodo(d.periodo) : 'Sin periodo'}</span>
            <span style={{ color: 'var(--text-2)' }}>{formatMoney(d.monto)}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.7rem', fontWeight: 700, color: 'var(--text)' }}>
          <span>Total</span>
          <span style={{ color: 'var(--md-sys-color-error)' }}>{formatMoney(total)}</span>
        </div>
      </>
    );
  }

  const gastoObj = gastoObjetivo(parcelaId, gastos, pagos);

  return (
    <Modal
      open={open}
      title={'Deuda de ' + parcelaNombre}
      onClose={onClose}
      footer={
        <>
          <TextButton onClick={onClose}>Cerrar</TextButton>
          {isAdmin && gastoObj && (
            <Button icon="payments" onClick={() => onRegistrarPago(gastoObj)}>Registrar pago</Button>
          )}
        </>
      }
    >
      {body}
    </Modal>
  );
}
