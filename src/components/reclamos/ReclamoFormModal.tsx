import { useState } from 'react';
import { numeroDeParcela } from '../../lib/format';
import type { Reclamo } from '../../lib/types';
import { useData } from '../../store/DataContext';
import { Button, TextButton } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ReclamoFormModal({ open, onClose }: Props) {
  const { parcelas, saveReclamo } = useData();
  const [tipo, setTipo] = useState<'Reclamo' | 'Sugerencia'>('Reclamo');
  const [parcelaId, setParcelaId] = useState('');
  const [asunto, setAsunto] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const parcelasSelect = parcelas
    .slice()
    .sort((a, b) => numeroDeParcela(a.numero) - numeroDeParcela(b.numero))
    .map((p) => ({ value: p.id, label: p.numero }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!asunto || !descripcion) return;
    const payload: Partial<Reclamo> = {
      tipo,
      parcela_id: parcelaId || null,
      asunto,
      descripcion,
    };
    const ok = await saveReclamo(payload);
    if (ok) onClose();
  }

  return (
    <Modal
      open={open}
      title="Agregar Comentario"
      onClose={onClose}
      footer={
        <>
          <TextButton onClick={onClose}>Cancelar</TextButton>
          <Button type="submit" form="reclamoForm">Guardar</Button>
        </>
      }
    >
      <form id="reclamoForm" onSubmit={handleSubmit}>
        <div className="form-row">
          <Select
            label="Tipo"
            name="tipo"
            value={tipo}
            onChange={(v) => setTipo(v as 'Reclamo' | 'Sugerencia')}
            options={[{ value: 'Reclamo', label: 'Reclamo' }, { value: 'Sugerencia', label: 'Sugerencia' }]}
            required
          />
          <Select
            label="Parcela"
            name="parcela_id"
            value={parcelaId}
            onChange={setParcelaId}
            options={parcelasSelect}
            required
            placeholder={parcelas.length ? 'Seleccionar...' : 'Sin parcelas'}
          />
        </div>
        <div className="form-group">
          <label htmlFor="reclamoAsunto">Asunto</label>
          <input
            id="reclamoAsunto"
            className="field-input"
            name="asunto"
            placeholder="Ej: Ruido excesivo, Fuga de agua"
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="reclamoDesc">Descripción</label>
          <textarea
            id="reclamoDesc"
            className="field-input"
            name="descripcion"
            rows={3}
            placeholder="Ej: Describa el problema o sugerencia..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
          />
        </div>
      </form>
    </Modal>
  );
}