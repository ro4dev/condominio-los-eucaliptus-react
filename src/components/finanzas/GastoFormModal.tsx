import { useEffect, useMemo, useState } from 'react';
import { formatMoney, formatPeriodo, numeroDeParcela } from '../../lib/format';
import { cuotaDelPeriodo } from '../../lib/finanzas';
import { periodOptions } from '../../lib/appConfig';
import { blobURLDemo, subirArchivo } from '../../lib/storage';
import type { Gasto, Parcela } from '../../lib/types';
import { useApp } from '../../store/AppContext';
import { useData } from '../../store/DataContext';
import { Button, TextButton } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Switch } from '../ui/Switch';

interface Props {
  open: boolean;
  onClose: () => void;
  gasto: Gasto | null;
}

function sortParcelas(parcelas: Parcela[]): Parcela[] {
  return parcelas.slice().sort((a, b) => numeroDeParcela(a.numero) - numeroDeParcela(b.numero));
}

export function GastoFormModal({ open, onClose, gasto }: Props) {
  const isEdit = !!gasto;
  const { gastos, parcelas, config, saveGasto } = useData();
  const { showSnackbar, demoMode } = useApp();

  const [periodo, setPeriodo] = useState<string>('');
  const [parcelaId, setParcelaId] = useState<string>('');
  const [monto, setMonto] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [pagado, setPagado] = useState<boolean>(false);
  const [archivo, setArchivo] = useState<File | null>(null);

  useEffect(() => {
    if (!open) return;
    setPeriodo(gasto?.periodo ?? currentDefaultPeriodo());
    setParcelaId(gasto?.parcela_id ?? '');
    setMonto(gasto ? String(gasto.monto ?? '') : '');
    setDescripcion(gasto?.descripcion ?? '');
    setPagado(gasto?.pagado === 'Sí');
    setArchivo(null);
  }, [open, gasto]);

  function currentDefaultPeriodo(): string {
    const opts = periodOptions();
    return opts[opts.length - 1].value;
  }

  const cuota = cuotaDelPeriodo(periodo, config);

  // Parcelas disponibles para crear en el periodo elegido (excluye las que ya tienen gasto)
  const usadasEnPeriodo = useMemo(
    () => new Set(gastos.filter((g) => g.periodo === periodo).map((g) => g.parcela_id)),
    [gastos, periodo],
  );
  const parcelasSelect = useMemo(() => {
    let list = parcelas;
    if (!isEdit) {
      list = parcelas.filter((p) => !usadasEnPeriodo.has(p.id));
    }
    return sortParcelas(list).map((p) => ({ value: p.id, label: p.numero }));
  }, [parcelas, usadasEnPeriodo, isEdit]);

  // Prefill de monto cuando cambia el periodo y no hay monto
  useEffect(() => {
    if (!isEdit && cuota.total && !monto) {
      setMonto(cuota.monto ? String(cuota.monto) : '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo]);

  function concepto(): string {
    if (!periodo || !parcelaId) return '';
    const parcela = parcelas.find((p) => p.id === parcelaId);
    const numero = parcela ? parcela.numero : '';
    const parts = periodo.split('-');
    return 'GC_' + parts[1] + '_' + parts[0] + '_' + numero;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!periodo || !parcelaId || !monto) return;
    let archivoValue: string | undefined;
    if (archivo) {
      if (demoMode) {
        archivoValue = await blobURLDemo(archivo);
      } else {
        const res = await subirArchivo(archivo, 'gastos_comunes', periodo);
        if (!res.url) {
          showSnackbar(res.error || 'Error al subir archivo.', 'error');
          return;
        }
        archivoValue = res.url;
      }
    }
    const payload: Partial<Gasto> = {
      periodo,
      parcela_id: parcelaId,
      monto: parseFloat(monto) || 0,
      descripcion,
      pagado: pagado ? 'Sí' : 'No',
      concepto: concepto(),
    };
    if (archivoValue) payload.archivo = archivoValue;
    if (isEdit && gasto) payload.id = gasto.id;
    const ok = await saveGasto(payload, isEdit);
    if (ok) onClose();
  }

  const hint = cuota.total
    ? 'Cuota de ' + formatPeriodo(periodo) + ': ' + formatMoney(cuota.monto) +
      (cuota.fondo_reserva ? ' + fondo reserva ' + formatMoney(cuota.fondo_reserva) + ' = ' + formatMoney(cuota.total) : '')
    : '';

  return (
    <Modal
      open={open}
      title={isEdit ? 'Editar Gasto' : 'Agregar Gasto'}
      onClose={onClose}
      footer={
        <>
          <TextButton onClick={onClose}>Cancelar</TextButton>
          <Button type="submit" form="gastoForm">{isEdit ? 'Actualizar' : 'Guardar'}</Button>
        </>
      }
    >
      <form id="gastoForm" onSubmit={handleSubmit}>
        <Select
          label="Periodo"
          name="periodo"
          value={periodo}
          onChange={setPeriodo}
          options={periodOptions().map((o) => ({ value: o.value, label: o.label }))}
          required
          style={{ marginBottom: '0.2rem' }}
        />
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 0.6rem' }}>{hint}</div>

        <div className="form-row">
          <Select
            label="Parcela"
            name="parcela_id"
            value={parcelaId}
            onChange={setParcelaId}
            options={parcelasSelect}
            required
            placeholder={isEdit ? '' : 'Sin parcelas disponibles'}
          />
          <div className="form-group">
            <label htmlFor="gastoMonto">Monto</label>
            <input
              id="gastoMonto"
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
        </div>

        <div className="form-group">
          <label htmlFor="gastoDesc">Descripción</label>
          <textarea
            id="gastoDesc"
            className="field-input"
            name="descripcion"
            placeholder="Ej: Detalles del gasto..."
            rows={3}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <label htmlFor="gastoPagado" style={{ margin: 0 }}>Cuota pagada</label>
            <Switch id="gastoPagado" label="Cuota pagada" checked={pagado} onChange={setPagado} />
          </div>
        </div>

        <div className="form-group">
          <label>Comprobante (foto)</label>
          <input
            className="field-input"
            type="file"
            name="archivo"
            accept="image/*"
            onChange={(e) => setArchivo(e.target.files ? e.target.files[0] : null)}
          />
          {isEdit && gasto?.archivo && (
            <a
              href={gasto.archivo}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: '0.8rem', color: 'var(--md-sys-color-primary)' }}
            >
              Ver comprobante
            </a>
          )}
        </div>
      </form>
    </Modal>
  );
}
