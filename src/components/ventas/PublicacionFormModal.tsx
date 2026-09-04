import { useEffect, useState } from 'react';
import { numeroDeParcela, safeUrl } from '../../lib/format';
import { blobURLDemo, subirArchivo } from '../../lib/storage';
import type { Publicacion } from '../../lib/types';
import { useApp } from '../../store/AppContext';
import { useData } from '../../store/DataContext';
import { Button, TextButton } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';

interface Props {
  open: boolean;
  publicacion: Publicacion | null;
  onClose: () => void;
}

export function PublicacionFormModal({ open, publicacion, onClose }: Props) {
  const isEdit = !!publicacion;
  const { parcelas, savePublicacion } = useData();
  const { showSnackbar, demoMode, currentUserEmail } = useApp();
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState<'Producto' | 'Servicio'>('Producto');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [parcelaId, setParcelaId] = useState('');
  const [estado, setEstado] = useState<'Disponible' | 'Vendido'>('Disponible');
  const [contacto, setContacto] = useState('');
  const [foto, setFoto] = useState<File | null>(null);

  const parcelasSelect = parcelas
    .slice()
    .sort((a, b) => numeroDeParcela(a.numero) - numeroDeParcela(b.numero))
    .map((p) => ({ value: p.id, label: p.numero }));

  useEffect(() => {
    if (!open) return;
    setTitulo(publicacion?.titulo ?? '');
    setCategoria((publicacion?.categoria as 'Producto' | 'Servicio') ?? 'Producto');
    setPrecio(publicacion?.precio != null && publicacion?.precio !== '' ? String(publicacion.precio) : '');
    setDescripcion(publicacion?.descripcion ?? '');
    setParcelaId(publicacion?.parcela_id ?? '');
    setEstado((publicacion?.estado as 'Disponible' | 'Vendido') ?? 'Disponible');
    setContacto(publicacion?.contacto ?? '');
    setFoto(null);
  }, [open, publicacion]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo || !categoria) return;
    let fotoValue: string | undefined;
    if (foto) {
      if (demoMode) {
        fotoValue = await blobURLDemo(foto);
      } else {
        const res = await subirArchivo(foto, 'publicaciones', '');
        if (!res.url) {
          showSnackbar(res.error || 'Error al subir archivo.', 'error');
          return;
        }
        fotoValue = res.url;
      }
    }
    const payload: Partial<Publicacion> = {
      titulo,
      categoria,
      descripcion: descripcion || undefined,
      parcela_id: parcelaId || undefined,
      contacto: contacto || undefined,
      estado,
    };
    if (precio !== '') payload.precio = precio;
    if (fotoValue) payload.foto = fotoValue;
    if (!isEdit) payload.usuario = currentUserEmail || 'anónimo';
    if (isEdit && publicacion) payload.id = publicacion.id;
    const ok = await savePublicacion(payload, isEdit);
    if (ok) onClose();
  }

  return (
    <Modal
      open={open}
      title={isEdit ? 'Editar Publicación' : 'Publicar Venta'}
      onClose={onClose}
      footer={
        <>
          <TextButton onClick={onClose}>Cancelar</TextButton>
          <Button type="submit" form="publicacionForm">{isEdit ? 'Actualizar' : 'Publicar'}</Button>
        </>
      }
    >
      <form id="publicacionForm" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="pubTitulo">Título</label>
          <input
            id="pubTitulo"
            className="field-input"
            name="titulo"
            placeholder="Ej: Mesa de comedor en venta"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
        </div>
        <div className="form-row">
          <Select
            label="Categoría"
            name="categoria"
            value={categoria}
            onChange={(v) => setCategoria(v as 'Producto' | 'Servicio')}
            options={[{ value: 'Producto', label: 'Producto' }, { value: 'Servicio', label: 'Servicio' }]}
            required
          />
          <div className="form-group">
            <label htmlFor="pubPrecio">Precio ($)</label>
            <input
              id="pubPrecio"
              className="field-input"
              type="number"
              name="precio"
              min={0}
              placeholder="Ej: 45000"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="pubDesc">Descripción</label>
          <textarea
            id="pubDesc"
            className="field-input"
            name="descripcion"
            rows={3}
            placeholder="Ej: Detalles del producto o servicio..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>
        <div className="form-row">
          <Select
            label="Parcela"
            name="parcela_id"
            value={parcelaId}
            onChange={setParcelaId}
            options={parcelasSelect}
            placeholder={parcelas.length ? 'Sin especificar' : 'Sin parcelas'}
          />
          <Select
            label="Estado"
            name="estado"
            value={estado}
            onChange={(v) => setEstado(v as 'Disponible' | 'Vendido')}
            options={[{ value: 'Disponible', label: 'Disponible' }, { value: 'Vendido', label: 'Vendido' }]}
          />
        </div>
        <div className="form-group">
          <label htmlFor="pubContacto">Contacto</label>
          <input
            id="pubContacto"
            className="field-input"
            name="contacto"
            placeholder="Ej: Parcela 12 - llamar por la tarde"
            value={contacto}
            onChange={(e) => setContacto(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Foto (opcional)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              className="field-input"
              type="file"
              name="foto"
              accept="image/*"
              onChange={(e) => setFoto(e.target.files ? e.target.files[0] : null)}
            />
            {isEdit && publicacion?.foto && safeUrl(publicacion.foto) && (
              <a href={safeUrl(publicacion.foto)} target="_blank" rel="noreferrer" title="Ver foto" style={{ textDecoration: 'none', flexShrink: 0, color: 'var(--md-sys-color-primary)' }}>
                <span className="material-symbols-outlined">image</span>
              </a>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}