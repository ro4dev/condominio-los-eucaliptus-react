import { useEffect, useMemo, useState } from 'react';
import type { Proveedor } from '../../lib/types';
import { useApp } from '../../store/AppContext';
import { useData } from '../../store/DataContext';
import { Button, TextButton } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';

interface Props {
  open: boolean;
  proveedor: Proveedor | null;
  onClose: () => void;
}

const DEFAULT_RUBROS = ['Jardinería', 'Plomería', 'Electricidad', 'Albañilería', 'Pintura', 'Limpieza', 'Seguridad', 'Carpintería', 'Herrería', 'Tecnología', 'Otro'];

export function ProveedorFormModal({ open, proveedor, onClose }: Props) {
  const isEdit = !!proveedor;
  const { config, saveProveedor } = useData();
  const { showSnackbar } = useApp();
  const [rubro, setRubro] = useState('');
  const [nombre, setNombre] = useState('');
  const [contacto, setContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [webInstagram, setWebInstagram] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const rubros = useMemo(() => {
    const list = config.rubros_proveedores && config.rubros_proveedores.length ? config.rubros_proveedores : DEFAULT_RUBROS;
    return list.map((r) => ({ value: r, label: r }));
  }, [config.rubros_proveedores]);

  useEffect(() => {
    if (!open) return;
    setRubro(proveedor?.rubro ?? '');
    setNombre(proveedor?.nombre ?? '');
    setContacto(proveedor?.contacto ?? '');
    setTelefono(proveedor?.telefono ?? '');
    setEmail(proveedor?.email ?? '');
    setWebInstagram(proveedor?.web_instagram ?? '');
    setObservaciones(proveedor?.observaciones ?? '');
  }, [open, proveedor]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rubro || !nombre || !contacto) return;
    let web = webInstagram;
    if (web) {
      if (/[\s,]/.test(web)) {
        showSnackbar('El campo Web/Instagram contiene caracteres inválidos (espacios, comas).', 'warning');
        return;
      }
      if (web.indexOf('http') !== 0) web = 'https://' + web;
    }
    const payload: Partial<Proveedor> = {
      rubro,
      nombre,
      contacto,
      telefono,
      email,
      web_instagram: web,
      observaciones,
    };
    if (isEdit && proveedor) payload.id = proveedor.id;
    const ok = await saveProveedor(payload, isEdit);
    if (ok) onClose();
  }

  return (
    <Modal
      open={open}
      title={isEdit ? 'Editar Proveedor' : 'Agregar Proveedor'}
      onClose={onClose}
      footer={
        <>
          <TextButton onClick={onClose}>Cancelar</TextButton>
          <Button type="submit" form="proveedorForm">{isEdit ? 'Actualizar' : 'Guardar'}</Button>
        </>
      }
    >
      <form id="proveedorForm" onSubmit={handleSubmit}>
        <div className="form-row">
          <Select
            label="Rubro"
            name="rubro"
            value={rubro}
            onChange={setRubro}
            options={rubros}
            required
            placeholder="Seleccionar..."
          />
          <div className="form-group">
            <label htmlFor="provNombre">Nombre</label>
            <input
              id="provNombre"
              className="field-input"
              name="nombre"
              placeholder="Ej: Nombre del proveedor o empresa"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="provContacto">Contacto</label>
          <input
            id="provContacto"
            className="field-input"
            name="contacto"
            placeholder="Ej: Nombre de la persona de contacto"
            value={contacto}
            onChange={(e) => setContacto(e.target.value)}
            required
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="provTelefono">Teléfono</label>
            <input
              id="provTelefono"
              className="field-input"
              type="tel"
              name="telefono"
              placeholder="Ej: +56 9 1234 5678"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="provEmail">Email</label>
            <input
              id="provEmail"
              className="field-input"
              type="email"
              name="email"
              placeholder="Ej: correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="provWeb">Web/Instagram</label>
          <input
            id="provWeb"
            className="field-input"
            name="web_instagram"
            placeholder="Ej: https://..."
            value={webInstagram}
            onChange={(e) => setWebInstagram(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="provObs">Observaciones</label>
          <textarea
            id="provObs"
            className="field-input"
            name="observaciones"
            rows={3}
            placeholder="Ej: Notas adicionales sobre el proveedor..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}