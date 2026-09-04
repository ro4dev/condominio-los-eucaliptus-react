import { useEffect, useMemo, useState } from 'react';
import { safeUrl } from '../../lib/format';
import type { Documento } from '../../lib/types';
import { useData } from '../../store/DataContext';
import { Button, TextButton } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';

interface Props {
  open: boolean;
  documento: Documento | null;
  onClose: () => void;
}

const DEFAULT_CATS = ['Estatuto', 'Actas', 'Contratos', 'Seguros', 'Planos'];

export function DocumentoFormModal({ open, documento, onClose }: Props) {
  const isEdit = !!documento;
  const { config, saveDocumento } = useData();
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);

  const categorias = useMemo(() => {
    const cats =
      config.categorias_documentos && config.categorias_documentos.length
        ? config.categorias_documentos
        : DEFAULT_CATS;
    return cats.map((c) => ({ value: c, label: c }));
  }, [config.categorias_documentos]);

  useEffect(() => {
    if (!open) return;
    setNombre(documento?.nombre ?? '');
    setCategoria(documento?.categoria ?? '');
    setDescripcion(documento?.descripcion ?? '');
    setArchivo(null);
  }, [open, documento]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre || !categoria || !descripcion) return;
    const payload: Partial<Documento> = {
      nombre,
      categoria,
      descripcion,
    };
    if (archivo) payload.archivo = URL.createObjectURL(archivo);
    if (isEdit && documento) payload.id = documento.id;
    const ok = await saveDocumento(payload, isEdit);
    if (ok) onClose();
  }

  return (
    <Modal
      open={open}
      title={isEdit ? 'Editar Documento' : 'Agregar Documento'}
      onClose={onClose}
      footer={
        <>
          <TextButton onClick={onClose}>Cancelar</TextButton>
          <Button type="submit" form="documentoForm">{isEdit ? 'Actualizar' : 'Guardar'}</Button>
        </>
      }
    >
      <form id="documentoForm" onSubmit={handleSubmit}>
        <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="form-group">
            <label htmlFor="docNombre">Nombre</label>
            <input
              id="docNombre"
              className="field-input"
              name="nombre"
              placeholder="Ej: Acta reunión marzo 2026"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <Select
            label="Categoría"
            name="categoria"
            value={categoria}
            onChange={setCategoria}
            options={categorias}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="docDesc">Descripción</label>
          <textarea
            id="docDesc"
            className="field-input"
            name="descripcion"
            rows={3}
            placeholder="Ej: Resumen del documento..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Archivo</label>
          <input
            className="field-input"
            type="file"
            name="archivo"
            onChange={(e) => setArchivo(e.target.files ? e.target.files[0] : null)}
          />
          {isEdit && documento?.archivo && (
            <a
              href={safeUrl(documento.archivo)}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: '0.8rem', color: 'var(--md-sys-color-primary)' }}
            >
              Ver archivo actual
            </a>
          )}
        </div>
      </form>
    </Modal>
  );
}