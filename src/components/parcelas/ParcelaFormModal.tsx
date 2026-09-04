import { useEffect, useState } from 'react';
import { useData } from '../../store/DataContext';
import type { Parcela } from '../../lib/types';
import { Button, TextButton } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';

interface Props {
  open: boolean;
  parcela: Parcela | null;
  onClose: () => void;
}

const ESTADOS = [
  { value: 'Habitada', label: 'Habitada' },
  { value: 'Desocupada', label: 'Desocupada' },
  { value: 'En construcción', label: 'En construcción' },
];

export function ParcelaFormModal({ open, parcela, onClose }: Props) {
  const isEdit = !!parcela;
  const { saveParcela } = useData();
  const [numero, setNumero] = useState('');
  const [rol, setRol] = useState('');
  const [metros, setMetros] = useState('');
  const [estado, setEstado] = useState('');

  useEffect(() => {
    if (!open) return;
    setNumero(parcela?.numero ?? '');
    setRol(parcela?.rol ?? '');
    setMetros(parcela?.metros ?? '');
    setEstado(parcela?.estado ?? '');
  }, [open, parcela]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!numero) return;
    const payload: Partial<Parcela> = {
      numero,
      rol,
      metros,
      estado,
    };
    if (isEdit && parcela) payload.id = parcela.id;
    const ok = await saveParcela(payload, isEdit);
    if (ok) onClose();
  }

  return (
    <Modal
      open={open}
      title={isEdit ? 'Editar Parcela' : 'Agregar Parcela'}
      onClose={onClose}
      footer={
        <>
          <TextButton onClick={onClose}>Cancelar</TextButton>
          <Button type="submit" form="parcelaForm">{isEdit ? 'Actualizar' : 'Guardar'}</Button>
        </>
      }
    >
      <form id="parcelaForm" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="parcelaNumero">Número</label>
            <input
              id="parcelaNumero"
              className="field-input"
              name="numero"
              placeholder="Ej: 1, 2A, 15"
              value={numero}
              disabled={isEdit}
              onChange={(e) => setNumero(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="parcelaRol">Rol</label>
            <input
              id="parcelaRol"
              className="field-input"
              name="rol"
              placeholder="Ej: Rol de la propiedad"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="parcelaMetros">Metros²</label>
            <input
              id="parcelaMetros"
              className="field-input"
              type="number"
              name="metros"
              min={0}
              placeholder="Ej: 0"
              value={metros}
              onChange={(e) => setMetros(e.target.value)}
            />
          </div>
          <Select label="Estado" name="estado" value={estado} onChange={setEstado} options={ESTADOS} />
        </div>
      </form>
    </Modal>
  );
}
