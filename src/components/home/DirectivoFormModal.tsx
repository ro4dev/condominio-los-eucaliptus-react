import { useEffect, useState } from 'react';
import type { Directivo } from '../../lib/types';
import { useData } from '../../store/DataContext';
import { Button, TextButton } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';

interface Props {
  open: boolean;
  directivo: Directivo | null;
  onClose: () => void;
}

const CARGOS: { value: string; label: string }[] = [
  { value: 'Presidente', label: 'Presidente' },
  { value: 'Secretario', label: 'Secretario' },
  { value: 'Tesorero', label: 'Tesorero' },
  { value: 'Otro', label: 'Otro' },
];

export function DirectivoFormModal({ open, directivo, onClose }: Props) {
  const isEdit = !!directivo;
  const { saveDirectivo } = useData();
  const [nombre, setNombre] = useState('');
  const [cargo, setCargo] = useState('Presidente');
  const [cargoOtro, setCargoOtro] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [extra, setExtra] = useState('');

  useEffect(() => {
    if (!open) return;
    const d = directivo || null;
    setNombre(d?.nombre ?? '');
    const c = d?.cargo ?? '';
    if (CARGOS.some((o) => o.value === c)) {
      setCargo(c);
      setCargoOtro('');
    } else {
      setCargo('Otro');
      setCargoOtro(c);
    }
    setTelefono(d?.telefono ?? '');
    setEmail(d?.email ?? '');
    setExtra(d?.extra ?? '');
  }, [open, directivo]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cargoFinal = cargo === 'Otro' ? cargoOtro.trim() : cargo;
    if (!nombre.trim() || !cargoFinal) return;
    const payload: Partial<Directivo> = {
      nombre: nombre.trim(),
      cargo: cargoFinal,
      telefono: telefono.trim() || undefined,
      email: email.trim() || undefined,
      extra: extra.trim() || undefined,
    };
    if (isEdit && directivo) payload.id = directivo.id;
    const ok = await saveDirectivo(payload, isEdit);
    if (ok) onClose();
  }

  return (
    <Modal
      open={open}
      title={isEdit ? 'Editar directivo' : 'Agregar directivo'}
      onClose={onClose}
      footer={
        <>
          <TextButton onClick={onClose}>Cancelar</TextButton>
          <Button type="submit" form="directivoForm">{isEdit ? 'Actualizar' : 'Guardar'}</Button>
        </>
      }
    >
      <form id="directivoForm" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="directivoNombre">Nombre</label>
            <input
              id="directivoNombre"
              className="field-input"
              type="text"
              name="nombre"
              placeholder="Ej: María González"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <Select
            label="Cargo"
            name="cargo"
            value={cargo}
            onChange={(v) => setCargo(v)}
            options={CARGOS}
            required
          />
        </div>
        {cargo === 'Otro' && (
          <div className="form-group">
            <label htmlFor="directivoCargoOtro">Especificar cargo</label>
            <input
              id="directivoCargoOtro"
              className="field-input"
              type="text"
              name="cargoOtro"
              placeholder="Ej: Director"
              value={cargoOtro}
              onChange={(e) => setCargoOtro(e.target.value)}
              required
            />
          </div>
        )}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="directivoTelefono">Teléfono</label>
            <input
              id="directivoTelefono"
              className="field-input"
              type="tel"
              name="telefono"
              placeholder="+56 9 1234 5678"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="directivoEmail">Correo</label>
            <input
              id="directivoEmail"
              className="field-input"
              type="email"
              name="email"
              placeholder="nombre@correo.cl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="directivoExtra">Extra</label>
          <input
            id="directivoExtra"
            className="field-input"
            type="text"
            name="extra"
            placeholder="Parcela 12 u otra información"
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}