import { useEffect, useState } from 'react';
import { useData } from '../../store/DataContext';
import type { Propietario } from '../../lib/types';
import { Button, TextButton } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';

interface Props {
  open: boolean;
  propietario: Propietario | null;
  parcelaIdFija: string | null;
  onClose: () => void;
}

const TIPOS = [
  { value: 'Propietario', label: 'Propietario' },
  { value: 'Inquilino', label: 'Inquilino' },
  { value: 'Administrador', label: 'Administrador' },
];

export function PropietarioFormModal({ open, propietario, parcelaIdFija, onClose }: Props) {
  const isEdit = !!propietario;
  const { parcelas, savePropietario } = useData();
  const [parcelaId, setParcelaId] = useState('');
  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [tipo, setTipo] = useState('');

  const parcelaFija = parcelaIdFija || (isEdit ? propietario!.parcela_id : null);
  const numeroParcelaFija = parcelas.find((p) => p.id === parcelaFija)?.numero ?? '';
  const listaParcelas = parcelas
    .slice()
    .sort((a, b) => a.numero.localeCompare(b.numero, undefined, { numeric: true }))
    .map((p) => ({ value: p.id, label: p.numero }));

  useEffect(() => {
    if (!open) return;
    setParcelaId(parcelaFija ?? '');
    setNombre(propietario?.nombre_completo ?? '');
    setRut(propietario?.rut ?? '');
    setTelefono(propietario?.telefono ?? '');
    setEmail(propietario?.email ?? '');
    setTipo(propietario?.tipo ?? '');
  }, [open, propietario, parcelaFija]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre || !email || !parcelaId) return;
    const payload: Partial<Propietario> = {
      parcela_id: parcelaId,
      nombre_completo: nombre,
      rut,
      telefono,
      email,
      tipo: (tipo || 'Propietario') as Propietario['tipo'],
    };
    if (isEdit && propietario) payload.id = propietario.id;
    const ok = await savePropietario(payload, isEdit);
    if (ok) onClose();
  }

  return (
    <Modal
      open={open}
      title={isEdit ? 'Editar Propietario' : 'Agregar Propietario'}
      onClose={onClose}
      footer={
        <>
          <TextButton onClick={onClose}>Cancelar</TextButton>
          <Button type="submit" form="propForm">{isEdit ? 'Actualizar' : 'Guardar'}</Button>
        </>
      }
    >
      <form id="propForm" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="propNombre">Nombre completo</label>
          <input
            id="propNombre"
            className="field-input"
            name="nombre_completo"
            placeholder="Ej: Juan Pérez"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="propRut">RUT</label>
            <input
              id="propRut"
              className="field-input"
              name="rut"
              placeholder="Ej: 12.345.678-9"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              required
            />
          </div>
          {parcelaFija ? (
            <div className="form-group">
              <label>Parcela</label>
              <input className="field-input" value={numeroParcelaFija || parcelaFija || ''} disabled />
            </div>
          ) : (
            <Select label="Parcela" name="parcela_id" value={parcelaId} onChange={setParcelaId} options={listaParcelas} required placeholder="Seleccionar parcela" />
          )}
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="propTel">Teléfono</label>
            <input
              id="propTel"
              className="field-input"
              type="tel"
              name="telefono"
              placeholder="Ej: +56 9 1234 5678"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="propEmail">Email</label>
            <input
              id="propEmail"
              className="field-input"
              type="email"
              name="email"
              placeholder="Ej: correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <Select label="Tipo" name="tipo" value={tipo} onChange={setTipo} options={TIPOS} />
      </form>
    </Modal>
  );
}
