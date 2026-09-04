import { useEffect, useMemo, useState } from 'react';
import { todayISO } from '../../lib/appConfig';
import { safeUrl } from '../../lib/format';
import { blobURLDemo, subirArchivo } from '../../lib/storage';
import type { Movimiento } from '../../lib/types';
import { useApp } from '../../store/AppContext';
import { useData } from '../../store/DataContext';
import { Button, TextButton } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';

interface Props {
  open: boolean;
  movimiento: Movimiento | null;
  onClose: () => void;
}

export function FlujoFormModal({ open, movimiento, onClose }: Props) {
  const isEdit = !!movimiento;
  const { config, saveFlujo } = useData();
  const { showSnackbar, demoMode } = useApp();
  const [tipo, setTipo] = useState<'Ingreso' | 'Egreso'>('Ingreso');
  const [fecha, setFecha] = useState(() => todayISO());
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [comprobante, setComprobante] = useState<File | null>(null);

  const conceptos = useMemo(() => {
    const list = (config.conceptos_flujo || []).filter((c) => c !== 'Cuotas' && c !== 'Fondo reserva');
    if (isEdit && movimiento?.concepto && !list.includes(movimiento.concepto)) {
      list.push(movimiento.concepto);
    }
    return list.map((c) => ({ value: c, label: c }));
  }, [config.conceptos_flujo, isEdit, movimiento]);

  useEffect(() => {
    if (!open) return;
    setTipo(movimiento?.tipo ?? 'Ingreso');
    setFecha(movimiento?.fecha ?? todayISO());
    setConcepto(movimiento?.concepto ?? '');
    setMonto(movimiento ? String(movimiento.monto ?? '') : '');
    setDescripcion(movimiento?.descripcion ?? '');
    setComprobante(null);
  }, [open, movimiento]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!conceptos.length) {
      showSnackbar('Primero debes configurar los conceptos en la pestaña Configuración.', 'warning');
      return;
    }
    if (!tipo || !fecha || !concepto || !monto || !descripcion) return;
    let comprobanteValue: string | undefined;
    if (comprobante) {
      const folder = fecha.slice(0, 7) + '-' + tipo;
      if (demoMode) {
        comprobanteValue = await blobURLDemo(comprobante);
      } else {
        const res = await subirArchivo(comprobante, 'ingresos_egresos', folder);
        if (!res.url) {
          showSnackbar(res.error || 'Error al subir archivo.', 'error');
          return;
        }
        comprobanteValue = res.url;
      }
    }
    const payload: Partial<Movimiento> = {
      tipo,
      fecha,
      concepto,
      monto: parseFloat(monto) || 0,
      descripcion,
    };
    if (comprobanteValue) payload.comprobante = comprobanteValue;
    if (isEdit && movimiento) payload.id = movimiento.id;
    const ok = await saveFlujo(payload, isEdit);
    if (ok) onClose();
  }

  return (
    <Modal
      open={open}
      title={isEdit ? 'Editar Movimiento' : 'Agregar Movimiento'}
      onClose={onClose}
      footer={
        <>
          <TextButton onClick={onClose}>Cancelar</TextButton>
          <Button type="submit" form="flujoForm">{isEdit ? 'Actualizar' : 'Guardar'}</Button>
        </>
      }
    >
      <form id="flujoForm" onSubmit={handleSubmit}>
        <div className="form-row">
          <Select
            label="Tipo"
            name="tipo"
            value={tipo}
            onChange={(v) => setTipo(v as 'Ingreso' | 'Egreso')}
            options={[{ value: 'Ingreso', label: 'Ingreso' }, { value: 'Egreso', label: 'Egreso' }]}
            required
          />
          <div className="form-group">
            <label htmlFor="flujoFecha">Fecha</label>
            <input id="flujoFecha" className="field-input" type="date" name="fecha" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
          </div>
        </div>
        <Select
          label="Concepto"
          name="concepto"
          value={concepto}
          onChange={setConcepto}
          options={conceptos}
          required
          placeholder={conceptos.length ? 'Seleccionar...' : 'Sin conceptos configurados'}
        />
        <div className="form-group">
          <label htmlFor="flujoMonto">Monto</label>
          <input
            id="flujoMonto"
            className="field-input"
            type="number"
            name="monto"
            min={0}
            placeholder="Ej: 0"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="flujoDesc">Descripción</label>
          <textarea
            id="flujoDesc"
            className="field-input"
            name="descripcion"
            rows={3}
            placeholder="Ej: Detalles del movimiento..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Comprobante (foto)</label>
          <div className="comprobante-row" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              className="field-input"
              type="file"
              name="comprobante"
              accept="image/*"
              onChange={(e) => setComprobante(e.target.files ? e.target.files[0] : null)}
            />
            {isEdit && movimiento?.comprobante && safeUrl(movimiento.comprobante) && (
              <a
                href={safeUrl(movimiento.comprobante)}
                target="_blank"
                rel="noreferrer"
                title="Ver comprobante"
                style={{ textDecoration: 'none', flexShrink: 0, color: 'var(--md-sys-color-primary)' }}
              >
                <span className="material-symbols-outlined">receipt</span>
              </a>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}