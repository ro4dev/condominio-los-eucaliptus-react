import { useEffect, useState } from 'react';
import { numeroDeParcela } from '../../lib/format';
import type { Asamblea, Parcela } from '../../lib/types';
import { useData } from '../../store/DataContext';
import { Button, TextButton } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';

interface Props {
  open: boolean;
  asamblea: Asamblea | null;
  asistentesIds: string[];
  onClose: () => void;
}

export function AsambleaFormModal({ open, asamblea, asistentesIds, onClose }: Props) {
  const isEdit = !!asamblea;
  const { parcelas, saveAsamblea } = useData();
  const [fecha, setFecha] = useState('');
  const [tipo, setTipo] = useState<'Ordinaria' | 'Extraordinaria'>('Ordinaria');
  const [temario, setTemario] = useState('');
  const [acuerdos, setAcuerdos] = useState('');
  const [sel, setSel] = useState<string[]>([]);

  const parcelasOrdenadas: Parcela[] = parcelas
    .slice()
    .sort((a, b) => numeroDeParcela(a.numero) - numeroDeParcela(b.numero));

  useEffect(() => {
    if (!open) return;
    setFecha(asamblea?.fecha ?? '');
    setTipo((asamblea?.tipo as 'Ordinaria' | 'Extraordinaria') ?? 'Ordinaria');
    setTemario(asamblea?.temario ?? '');
    setAcuerdos(asamblea?.acuerdos ?? '');
    setSel(asistentesIds ?? []);
  }, [open, asamblea, asistentesIds]);

  function toggle(pid: string) {
    setSel((prev) => (prev.includes(pid) ? prev.filter((x) => x !== pid) : [...prev, pid]));
  }

  function toggleAll() {
    const all = parcelasOrdenadas.map((p) => p.id);
    const allSelected = all.every((id) => sel.includes(id));
    setSel(allSelected ? [] : all);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fecha || !temario) return;
    const payload: Partial<Asamblea> = {
      fecha,
      tipo,
      temario,
      acuerdos: acuerdos || undefined,
    };
    if (isEdit && asamblea) payload.id = asamblea.id;
    const ok = await saveAsamblea(payload, sel);
    if (ok) onClose();
  }

  return (
    <Modal
      open={open}
      title={isEdit ? 'Editar Asamblea' : 'Agregar Asamblea'}
      onClose={onClose}
      footer={
        <>
          <TextButton onClick={onClose}>Cancelar</TextButton>
          <Button type="submit" form="asambleaForm">{isEdit ? 'Actualizar' : 'Guardar'}</Button>
        </>
      }
    >
      <form id="asambleaForm" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="asambleaFecha">Fecha</label>
            <input
              id="asambleaFecha"
              className="field-input"
              type="date"
              name="fecha"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
          </div>
          <Select
            label="Tipo"
            name="tipo"
            value={tipo}
            onChange={(v) => setTipo(v as 'Ordinaria' | 'Extraordinaria')}
            options={[{ value: 'Ordinaria', label: 'Ordinaria' }, { value: 'Extraordinaria', label: 'Extraordinaria' }]}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="asambleaTemario">Temario</label>
          <textarea
            id="asambleaTemario"
            className="field-input"
            name="temario"
            rows={3}
            placeholder="Ej: Puntos a tratar en la asamblea"
            value={temario}
            onChange={(e) => setTemario(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="asambleaAcuerdos">Acuerdos</label>
          <textarea
            id="asambleaAcuerdos"
            className="field-input"
            name="acuerdos"
            rows={3}
            placeholder="Ej: Decisiones tomadas..."
            value={acuerdos}
            onChange={(e) => setAcuerdos(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Asistentes</label>
          <div style={{ marginBottom: '0.3rem' }}>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); toggleAll(); }}
              style={{ color: 'var(--md-sys-color-primary)', fontSize: '0.8rem' }}
            >
              Seleccionar todas
            </a>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {parcelasOrdenadas.map((p) => {
              const active = sel.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  className={'chip ' + (active ? 'chip-primary' : 'chip-neutral')}
                  style={{ cursor: 'pointer', border: active ? '1px solid var(--md-sys-color-primary)' : '1px solid transparent' }}
                  onClick={() => toggle(p.id)}
                >
                  {String(p.numero)}
                </button>
              );
            })}
          </div>
        </div>
      </form>
    </Modal>
  );
}