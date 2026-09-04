import { useEffect, useState } from 'react';
import { formatPeriodo } from '../../lib/format';
import { siguientePeriodo } from '../../lib/finanzas';
import { periodOptions } from '../../lib/appConfig';
import { useData } from '../../store/DataContext';
import { useApp } from '../../store/AppContext';
import { Button, TextButton } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';

interface Props {
  open: boolean;
  onClose: () => void;
  periodo: string | null; // null => agregar periodo
}

export function PeriodoModal({ open, onClose, periodo }: Props) {
  const isEdit = !!periodo;
  const { gastos, config, savePeriodos } = useData();
  const { showSnackbar } = useApp();

  const [p, setP] = useState<string>('');
  const [monto, setMonto] = useState<string>('');
  const [fondo, setFondo] = useState<string>('');

  useEffect(() => {
    if (!open) return;
    const target = periodo || siguientePeriodo(gastos);
    setP(target);
    const conf = (config.periodos || []).find((c) => c.periodo === target) || ({} as { monto?: number; fondo_reserva?: number });
    setMonto(conf.monto != null ? String(conf.monto) : '');
    setFondo(conf.fondo_reserva != null ? String(conf.fondo_reserva) : '');
  }, [open, periodo, gastos, config]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const periodos = (config.periodos || []).slice();
    if (isEdit && periodo) {
      const idx = periodos.findIndex((c) => c.periodo === periodo);
      if (idx === -1) return;
      periodos[idx] = { periodo, monto: parseFloat(monto) || 0, fondo_reserva: parseFloat(fondo) || 0 };
    } else {
      if (!p) { showSnackbar('Seleccioná un periodo.', 'warning'); return; }
      if (periodos.some((c) => c.periodo === p)) { showSnackbar('Ese periodo ya está configurado.', 'warning'); return; }
      periodos.push({ periodo: p, monto: parseFloat(monto) || 0, fondo_reserva: parseFloat(fondo) || 0 });
    }
    periodos.sort((a, b) => (a.periodo < b.periodo ? 1 : -1));
    const ok = await savePeriodos(periodos);
    if (ok) {
      showSnackbar(isEdit ? 'Periodo actualizado.' : 'Periodo agregado.', 'success');
      onClose();
    }
  }

  return (
    <Modal
      open={open}
      title={isEdit ? 'Editar periodo' : 'Agregar periodo'}
      onClose={onClose}
      footer={
        <>
          <TextButton onClick={onClose}>Cancelar</TextButton>
          <Button type="submit" form="periodoForm">Guardar</Button>
        </>
      }
    >
      <form id="periodoForm" onSubmit={handleSubmit}>
        {!isEdit && (
          <Select
            label="Periodo"
            name="periodo"
            value={p}
            onChange={setP}
            options={periodOptions(-6, 12).map((o) => ({ value: o.value, label: o.label }))}
            required
          />
        )}
        {isEdit && (
          <p style={{ fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.8rem' }}>{formatPeriodo(periodo)}</p>
        )}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="perMonto">Gasto común</label>
            <input id="perMonto" className="field-input" type="number" name="monto" min={0} value={monto} onChange={(e) => setMonto(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="perFondo">Fondo reserva</label>
            <input id="perFondo" className="field-input" type="number" name="fondo_reserva" min={0} value={fondo} onChange={(e) => setFondo(e.target.value)} />
          </div>
        </div>
      </form>
    </Modal>
  );
}
