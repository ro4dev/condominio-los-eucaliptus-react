import { useEffect, useState } from 'react';
import { useData } from '../../store/DataContext';
import { useApp } from '../../store/AppContext';
import type { Noticia } from '../../lib/types';
import { Button, TextButton } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Switch } from '../ui/Switch';

interface Props {
  open: boolean;
  noticia: Noticia | null;
  onClose: () => void;
}

export function NoticiaFormModal({ open, noticia, onClose }: Props) {
  const isEdit = !!noticia;
  const { isAdmin } = useApp();
  const { saveNoticia } = useData();
  const [titulo, setTitulo] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitulo(noticia?.titulo ?? '');
    setFechaHasta(noticia?.fecha_hasta ?? '');
    setDescripcion(noticia?.descripcion ?? '');
    setPinned(!!noticia?.pinned);
  }, [open, noticia]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo || !descripcion) return;
    const payload: Partial<Noticia> = {
      titulo,
      descripcion,
      fecha_hasta: fechaHasta || undefined,
      pinned,
    };
    if (isEdit && noticia) payload.id = noticia.id;
    const ok = await saveNoticia(payload, isEdit);
    if (ok) onClose();
  }

  return (
    <Modal
      open={open}
      title={isEdit ? 'Editar Noticia' : 'Agregar Noticia'}
      onClose={onClose}
      footer={
        <>
          <TextButton onClick={onClose}>Cancelar</TextButton>
          <Button type="submit" form="noticiaForm">{isEdit ? 'Actualizar' : 'Guardar'}</Button>
        </>
      }
    >
      <form id="noticiaForm" onSubmit={handleSubmit}>
        <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="form-group">
            <label htmlFor="noticiaTitulo">Título</label>
            <input
              id="noticiaTitulo"
              className="field-input"
              name="titulo"
              placeholder="Ej: Corte de agua programado"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="noticiaFecha">Vigente hasta</label>
            <input
              id="noticiaFecha"
              className="field-input"
              type="date"
              name="fecha_hasta"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="noticiaDesc">Descripción</label>
          <textarea
            id="noticiaDesc"
            className="field-input"
            name="descripcion"
            rows={3}
            placeholder="Ej: Detalle de la noticia..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
          />
        </div>
        {isAdmin && (
          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <label htmlFor="noticiaPinned" style={{ margin: 0 }}>Destacar en Home</label>
              <Switch id="noticiaPinned" checked={pinned} onChange={setPinned} label="Destacar en Home" />
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
