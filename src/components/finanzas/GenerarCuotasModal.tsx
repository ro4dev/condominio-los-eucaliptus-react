import { useEffect, useState } from 'react';
import { formatMoney } from '../../lib/format';
import { cuotaDelPeriodo, siguientePeriodo } from '../../lib/finanzas';
import { periodOptions } from '../../lib/appConfig';
import { useData } from '../../store/DataContext';
import { useApp } from '../../store/AppContext';
import { Button, TextButton } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';

interface Props {
  open: boolean;
  onClose: () => void;
  titulo?: string;
  periodoInicial?: string | null;
  fijo?: boolean;
}

export function GenerarCuotasModal({ open, onClose, titulo, periodoInicial, fijo = false }: Props) {
  const { gastos, config, generarCuotas } = useData();
  const { showSnackbar, demoMode } = useApp();
  const [periodo, setPeriodo] = useState<string>('');
  const [monto, setMonto] = useState<string>('');
  const [fondo, setFondo] = useState<string>('');

  useEffect(() => {
    if (!open) return;
    const p = periodoInicial || siguientePeriodo(gastos);
    setPeriodo(p);
    setMonto('');
    setFondo('');
  }, [open, periodoInicial, gastos]);

  function cuotaBase(p: string) {
    let cuota = cuotaDelPeriodo(p, config);
    if (!cuota.total) {
      const parts = p.split('-');
      let y = parseInt(parts[0]);
      let m = parseInt(parts[1]) - 1;
      if (m < 1) { m = 12; y--; }
      cuota = cuotaDelPeriodo(y + '-' + String(m).padStart(2, '0'), config);
    }
    return cuota;
  }

  useEffect(() => {
    if (!open || !periodo) return;
    const cuota = cuotaBase(periodo);
    setMonto(cuota.monto ? String(cuota.monto) : '');
    setFondo(cuota.fondo_reserva ? String(cuota.fondo_reserva) : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo, open]);

  const cuotaTotal = cuotaBase(periodo).total;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!periodo) return;
    const count = await generarCuotas(periodo, monto, fondo);
    if (count < 0) return;
    const sufijo = demoMode ? ' (demo).' : '.';
    showSnackbar(
      count ? 'Se generaron ' + count + ' cuotas' + sufijo : 'Todas las parcelas ya tienen cuota para este periodo.',
      count ? 'success' : 'warning',
    );
    onClose();
  }

  const intro = fijo
    ? 'Las parcelas que ya tengan cuota en ese periodo no se modifican.'
    : 'Crea una cuota por parcela para el periodo seleccionado. Las parcelas que ya tengan cuota en ese periodo no se modifican.';

  return (
    <Modal
      open={open}
      title={titulo || 'Nuevo periodo'}
      onClose={onClose}
      footer={
        <>
          <TextButton onClick={onClose}>Cancelar</TextButton>
          <Button type="submit" form="genForm" icon="check_circle">Crear</Button>
        </>
      }
    >
      <form id="genForm" onSubmit={handleSubmit}>
        <p style={{ margin: '0 0 0.8rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{intro}</p>

        {!fijo && (
          <Select
            label="Periodo"
            name="periodo"
            value={periodo}
            onChange={setPeriodo}
            options={periodOptions().map((o) => ({ value: o.value, label: o.label }))}
            required
          />
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="genMonto">Gasto común</label>
            <input id="genMonto" className="field-input" type="number" name="monto" min={0} value={monto} onChange={(e) => setMonto(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="genFondo">Fondo reserva</label>
            <input id="genFondo" className="field-input" type="number" name="fondo_reserva" min={0} value={fondo} onChange={(e) => setFondo(e.target.value)} />
          </div>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {cuotaTotal ? 'Total por parcela: ' + formatMoney(cuotaTotal) : ''}
        </div>
      </form>
    </Modal>
  );
}
