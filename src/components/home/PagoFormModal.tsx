import { useEffect, useState } from 'react';
import { todayISO } from '../../lib/appConfig';
import { formatMoney, formatPeriodo } from '../../lib/format';
import { sumPagosGasto } from '../../lib/finanzas';import type { Gasto } from '../../lib/types';
import { useData } from '../../store/DataContext';
import { Button, TextButton } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface Props {
  open: boolean;
  gasto: Gasto | null;
  parcelaNombre: string;
  onClose: () => void;
}

export function PagoFormModal({ open, gasto, parcelaNombre, onClose }: Props) {
  const { pagos, savePago } = useData();
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(() => todayISO());

  useEffect(() => {
    if (!open || !gasto) return;
    const pagado = sumPagosGasto(gasto.id, pagos);
    const montoCuota = parseFloat(String(gasto.monto || 0)) || 0;
    const restante = Math.max(0, montoCuota - pagado);
    setMonto(restante > 0 ? String(restante) : '');
    setFecha(todayISO());
  }, [open, gasto, pagos]);

  if (!gasto) return null;
  const g = gasto;

  const montoCuota = parseFloat(String(g.monto || 0)) || 0;
  const pagado = sumPagosGasto(g.id, pagos);
  const restante = Math.max(0, montoCuota - pagado);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const m = parseFloat(monto) || 0;
    if (m <= 0) return;
    const ok = await savePago({
      gasto_id: g.id,
      parcela_id: g.parcela_id,
      periodo: g.periodo,
      monto: m,
      fecha,
    });
    if (ok) onClose();
  }

  return (
    <Modal
      open={open}
      title="Registrar pago"
      onClose={onClose}
      footer={
        <>
          <TextButton onClick={onClose}>Cancelar</TextButton>
          <Button type="submit" form="homePagoForm">Guardar</Button>
        </>
      }
    >
      <form id="homePagoForm" onSubmit={submit}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: '0.8rem' }}>
          Cuota de <strong>{parcelaNombre}</strong> — {formatPeriodo(g.periodo)}: <strong>{formatMoney(montoCuota)}</strong>
          {pagado > 0 && <> · Pagado <strong>{formatMoney(pagado)}</strong></>}
          {restante > 0 && <> · Falta <strong style={{ color: 'var(--md-sys-color-error)' }}>{formatMoney(restante)}</strong></>}
        </p>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="homePagoMonto">Monto</label>
            <input id="homePagoMonto" className="field-input" type="number" min={0} name="monto" value={monto} onChange={(e) => setMonto(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="homePagoFecha">Fecha</label>
            <input id="homePagoFecha" className="field-input" type="date" name="fecha" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
          </div>
        </div>
      </form>
    </Modal>
  );
}
