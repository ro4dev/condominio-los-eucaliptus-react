import { useState } from 'react';
import { todayISO } from '../../lib/appConfig';
import { escHtml, formatDate, nl2br, safeUrl } from '../../lib/format';
import type { Noticia } from '../../lib/types';
import { useApp } from '../../store/AppContext';
import { useData } from '../../store/DataContext';
import { Button, IconButton } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { NoticiaFormModal } from './NoticiaFormModal';

type Filtro = 'vigentes' | 'destacadas' | 'no_vigentes' | 'todas';

const FILTROS: { id: Filtro; label: string }[] = [
  { id: 'vigentes', label: 'Vigentes' },
  { id: 'destacadas', label: 'Destacadas' },
  { id: 'no_vigentes', label: 'No vigentes' },
  { id: 'todas', label: 'Todas' },
];

function parseFecha(s?: string | number): number {
  if (s === undefined || s === null || s === '') return 0;
  if (typeof s === 'number') return s;
  return new Date(String(s).slice(0, 10) + 'T00:00:00').getTime() || 0;
}

export function NoticiasPage() {
  const { isAdmin } = useApp();
  const { noticias, deleteNoticia, toggleNoticiaPinned } = useData();
  const [filtro, setFiltro] = useState<Filtro>('vigentes');
  const [form, setForm] = useState<{ open: boolean; noticia: Noticia | null }>({ open: false, noticia: null });

  const hoy = todayISO();

  function filterNoticias(n: Noticia): boolean {
    const esActiva = !n.fecha_hasta || n.fecha_hasta >= hoy;
    switch (filtro) {
      case 'vigentes':
        return esActiva;
      case 'no_vigentes':
        return !esActiva;
      case 'destacadas':
        return !!n.pinned;
      case 'todas':
      default:
        return true;
    }
  }

  const mostrar = noticias
    .filter(filterNoticias)
    .slice()
    .sort((a, b) => parseFecha(b.fecha || b.created_at) - parseFecha(a.fecha || a.created_at));

  function eliminar(n: Noticia) {
    if (window.confirm('¿Estás seguro de eliminar esta noticia? Esta acción no se puede deshacer.')) {
      deleteNoticia(n.id);
    }
  }

  return (
    <div id="tab-noticias" className="tab-content active">
      {isAdmin && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.8rem' }}>
          <Button icon="add" onClick={() => setForm({ open: true, noticia: null })}>Agregar Noticia</Button>
        </div>
      )}

      <div className="filter-chips" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={'chip ' + (filtro === f.id ? 'chip-primary' : 'chip-neutral')}
            style={{ cursor: 'pointer', border: filtro === f.id ? '1px solid var(--md-sys-color-primary)' : '1px solid transparent' }}
            onClick={() => setFiltro(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {mostrar.length === 0 ? (
        <EmptyState texto="No hay noticias." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {mostrar.map((n) => (
            <div key={n.id} className="card" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <h4 style={{ margin: 0, flex: 1 }}>{escHtml(n.titulo)}</h4>
                {isAdmin && (
                  <IconButton
                    icon="push_pin"
                    title={n.pinned ? 'Despinneear' : 'Pinneear en Home'}
                    style={{ color: n.pinned ? 'var(--md-sys-color-primary)' : 'var(--text-muted)' }}
                    onClick={() => toggleNoticiaPinned(n.id)}
                  />
                )}
                <span style={{ margin: 0, whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {formatDate(n.fecha || n.created_at)}
                </span>
                {isAdmin && (
                  <span style={{ display: 'flex', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                    <IconButton icon="edit" title="Editar" onClick={() => setForm({ open: true, noticia: n })} />
                    <IconButton icon="delete" className="danger" title="Eliminar" onClick={() => eliminar(n)} />
                  </span>
                )}
              </div>
              <div style={{ marginTop: '0.4rem' }}>{nl2br(n.descripcion)}</div>
              {safeUrl(n.archivo) && (
                <a href={safeUrl(n.archivo)} target="_blank" rel="noreferrer" style={{ color: 'var(--md-sys-color-primary)', fontSize: '0.85rem' }}>
                  Ver archivo adjunto
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <NoticiaFormModal
        open={form.open}
        noticia={form.noticia}
        onClose={() => setForm({ open: false, noticia: null })}
      />
    </div>
  );
}
