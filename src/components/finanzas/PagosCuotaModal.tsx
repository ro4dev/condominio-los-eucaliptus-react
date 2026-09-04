import { useState } from 'react';
import { formatDate, formatMoney, formatPeriodo, safeUrl } from '../../lib/format';
import { pagosDeGasto, sumPagosGasto } from '../../lib/finanzas';
import { todayISO } from '../../lib/appConfig';
import { blobURLDemo, subirArchivo } from '../../lib/storage';
import type { Gasto, Parcela, Pago } from '../../lib/types';
import { useApp } from '../../store/AppContext';
import { useData } from '../../store/DataContext';
import { Button, IconButton, TextButton } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface Props {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  gasto: Gasto | null;
  parcelas: Parcela[];
}

function parcelName(id: string, parcelas: Parcela[]): string {
  const p = parcelas.find((x) => x.id === id);
  return p ? p.numero : id;
}

export function PagosCuotaModal({ open, onClose, onBack, gasto, parcelas }: Props) {
  const { isAdmin, showSnackbar, demoMode } = useApp();
  const { pagos, savePago, deletePago } = useData();
  const [showForm, setShowForm] = useState(false);
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(() => todayISO());
  const [comprobante, setComprobante] = useState<File | null>(null);

  if (!gasto) return null;
  const g = gasto;
  const lista = pagosDeGasto(g.id, pagos);
  const pagado = sumPagosGasto(g.id, pagos);
  const montoCuota = parseFloat(String(g.monto || 0)) || 0;
  const falta = Math.max(0, montoCuota - pagado);
  const nombre = parcelName(g.parcela_id, parcelas) + ' — ' + formatPeriodo(g.periodo);

  async function submitPago(e: React.FormEvent) {
    e.preventDefault();
    const m = parseFloat(monto) || 0;
    if (m <= 0) return;
    let comprobanteValue: string | undefined;
    if (comprobante) {
      if (demoMode) {
        comprobanteValue = await blobURLDemo(comprobante);
      } else {
        const res = await subirArchivo(comprobante, 'gastos_comunes', '');
        if (!res.url) {
          showSnackbar(res.error || 'Error al subir archivo.', 'error');
          return;
        }
        comprobanteValue = res.url;
      }
    }
    const payload: Partial<Pago> = {
      gasto_id: g.id,
      parcela_id: g.parcela_id,
      periodo: g.periodo,
      monto: m,
      fecha,
    };
    if (comprobanteValue) payload.comprobante = comprobanteValue;
    const ok = await savePago(payload);
    if (ok) {
      setShowForm(false);
      setMonto('');
      setComprobante(null);
    }
  }

  function eliminarPago(id: string) {
    if (window.confirm('¿Eliminar este pago?')) {
      deletePago(id).then((ok) => {
        if (ok) {
          setShowForm(false);
          onClose();
        }
      });
    }
  }

  return (
    <Modal
      open={open}
      title="Pagos de la cuota"
      onClose={onClose}
      footer={
        <>
          <TextButton onClick={onBack}>← Volver</TextButton>
          {isAdmin && falta > 0 && !showForm && (
            <Button icon="payments" onClick={() => { setMonto(String(falta)); setShowForm(true); }}>
              Registrar pago
            </Button>
          )}
        </>
      }
    >
      {showForm && (
        <form onSubmit={submitPago} style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: '0.6rem' }}>
            Falta <strong style={{ color: 'var(--md-sys-color-error)' }}>{formatMoney(falta)}</strong> por registrar.
          </p>
          <div className="form-row">
            <div className="form-group">
              <label>Monto</label>
              <input className="field-input" type="number" min={0} value={monto} onChange={(e) => setMonto(e.target.value)} required />
            </div>
<div className="form-group">
            <label htmlFor="pagoFechaForm">Fecha</label>
            <input id="pagoFechaForm" className="field-input" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Comprobante (foto)</label>
            <input className="field-input" type="file" name="comprobante" accept="image/*" onChange={(e) => setComprobante(e.target.files ? e.target.files[0] : null)} />
          </div>
        </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button type="submit" icon="payments">Guardar pago</Button>
          </div>
        </form>
      )}

      {lista.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Sin pagos registrados para la cuota de {nombre}.</p>
      ) : (
        <>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', margin: '0 0 0.4rem' }}>
            {nombre} · Cuota <strong>{formatMoney(montoCuota)}</strong> · Total pagado <strong>{formatMoney(pagado)}</strong>
          </p>
          {lista.map((p) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0', borderBottom: '1px solid var(--divider)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: 'var(--text)' }}>{formatMoney(parseFloat(String(p.monto)) || 0)}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{formatDate(p.fecha)}</div>
              </div>
              {safeUrl(p.comprobante) && (
                <a href={safeUrl(p.comprobante)} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  <IconButton icon="receipt" className="primary" title="Ver comprobante" style={{ color: 'var(--md-sys-color-primary)' }} />
                </a>
              )}
              {isAdmin && <IconButton icon="delete" className="danger" onClick={() => eliminarPago(p.id)} title="Eliminar pago" />}
            </div>
          ))}
        </>
      )}
    </Modal>
  );
}
