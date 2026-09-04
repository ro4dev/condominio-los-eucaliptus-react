import { useMemo, useState } from 'react';
import { escHtml, formatMoney, nl2br } from '../../lib/format';
import type { Publicacion } from '../../lib/types';
import { useApp } from '../../store/AppContext';
import { useData } from '../../store/DataContext';
import { Button, IconButton } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { EmptyState } from '../ui/EmptyState';
import { Modal } from '../ui/Modal';
import { PublicacionFormModal } from './PublicacionFormModal';

type FiltroCat = 'todas' | 'Producto' | 'Servicio';
type FiltroEstado = 'todos' | 'Disponible' | 'Vendido';

export function VentasPage() {
  const { isAdmin } = useApp();
  const { publicaciones, parcelas, deletePublicacion } = useData();
  const [cat, setCat] = useState<FiltroCat>('todas');
  const [estado, setEstado] = useState<FiltroEstado>('Disponible');
  const [form, setForm] = useState<{ open: boolean; publicacion: Publicacion | null }>({ open: false, publicacion: null });
  const [verFoto, setVerFoto] = useState<Publicacion | null>(null);

  function numeroParcela(id?: string): string {
    if (!id) return '';
    const p = parcelas.find((x) => x.id === id);
    return p ? p.numero : '';
  }

  const mostrar = useMemo(
    () =>
      publicaciones
        .filter((p) => (cat === 'todas' || p.categoria === cat) && (estado === 'todos' || p.estado === estado))
        .slice()
        .sort((a, b) => {
          const fa = a.created_at || '';
          const fb = b.created_at || '';
          return fa < fb ? 1 : fa > fb ? -1 : 0;
        }),
    [publicaciones, cat, estado],
  );

  function eliminar(p: Publicacion) {
    if (window.confirm('¿Estás seguro de eliminar esta publicación? Esta acción no se puede deshacer.')) {
      deletePublicacion(p.id);
    }
  }

  return (
    <div id="tab-publicaciones" className="tab-content active">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.8rem' }}>
        <Button icon="add" onClick={() => setForm({ open: true, publicacion: null })}>Publicar Venta</Button>
      </div>

      <div className="filter-chips" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
        {([['todas', 'Todas'], ['Producto', 'Productos'], ['Servicio', 'Servicios']] as [FiltroCat, string][]).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={'chip ' + (cat === id ? 'chip-primary' : 'chip-neutral')}
            style={{ cursor: 'pointer', border: cat === id ? '1px solid var(--md-sys-color-primary)' : '1px solid transparent' }}
            onClick={() => setCat(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="filter-chips" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
        {([['todos', 'Todos'], ['Disponible', 'Disponibles'], ['Vendido', 'Vendidos']] as [FiltroEstado, string][]).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={'chip ' + (estado === id ? 'chip-primary' : 'chip-neutral')}
            style={{ cursor: 'pointer', border: estado === id ? '1px solid var(--md-sys-color-primary)' : '1px solid transparent' }}
            onClick={() => setEstado(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {mostrar.length === 0 ? (
        <EmptyState texto="No hay publicaciones con estos filtros." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.8rem' }}>
          {mostrar.map((p) => (
            <div key={p.id} className="card" style={{ margin: 0, overflow: 'hidden', padding: 0, opacity: p.estado === 'Vendido' ? 0.7 : 1 }}>
              <div style={{ background: 'var(--skeleton-1)', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: p.foto ? 'pointer' : 'default' }}>
                {p.foto ? (
                  <img
                    src={escHtml(p.foto)}
                    alt={escHtml(p.titulo)}
                    loading="lazy"
                    onClick={() => setVerFoto(p)}
                    title="Ver imagen completa"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>image_not_supported</span>
                    Sin imagen
                  </span>
                )}
              </div>
              <div style={{ padding: '0.8rem 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Chip tone={p.categoria === 'Servicio' ? 'neutral' : 'primary'}>{escHtml(p.categoria)}</Chip>
                    <Chip tone={p.estado === 'Vendido' ? 'neutral' : 'positive'}>{escHtml(p.estado)}</Chip>
                  </div>
                  {isAdmin && (
                    <span style={{ display: 'flex', flexShrink: 0 }}>
                      <IconButton icon="edit" title="Editar" onClick={() => setForm({ open: true, publicacion: p })} />
                      <IconButton icon="delete" className="danger" title="Eliminar" onClick={() => eliminar(p)} />
                    </span>
                  )}
                </div>
                <div style={{ fontWeight: 600 }}>{escHtml(p.titulo)}</div>
                {p.descripcion && <div style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>{nl2br(p.descripcion)}</div>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.4rem', fontSize: '0.9rem' }}>
                  {p.precio !== null && p.precio !== undefined && p.precio !== '' && (
                    <div style={{ fontWeight: 600, color: 'var(--md-sys-color-primary)' }}>{formatMoney(p.precio)}</div>
                  )}
                  {p.parcela_id && (
                    <div><span className="material-symbols-outlined" style={{ fontSize: '1rem', verticalAlign: 'middle' }}>location_on</span> {escHtml(numeroParcela(p.parcela_id))}</div>
                  )}
                  {p.contacto && (
                    <div><span className="material-symbols-outlined" style={{ fontSize: '1rem', verticalAlign: 'middle' }}>phone</span> {escHtml(p.contacto)}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!verFoto}
        title={verFoto ? escHtml(verFoto.titulo) : ''}
        onClose={() => setVerFoto(null)}
      >
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {verFoto?.foto && (
            <img
              src={escHtml(verFoto.foto)}
              alt={escHtml(verFoto.titulo)}
              style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '0.75rem', objectFit: 'contain' }}
            />
          )}
        </div>
      </Modal>

      <PublicacionFormModal
        open={form.open}
        publicacion={form.publicacion}
        onClose={() => setForm({ open: false, publicacion: null })}
      />
    </div>
  );
}