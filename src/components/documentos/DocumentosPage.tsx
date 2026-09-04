import { useMemo, useState } from 'react';
import { escHtml, formatDate, nl2br, safeUrl } from '../../lib/format';
import type { Documento } from '../../lib/types';
import { useApp } from '../../store/AppContext';
import { useData } from '../../store/DataContext';
import { Button, IconButton, TextButton } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { Modal } from '../ui/Modal';
import { DocumentoFormModal } from './DocumentoFormModal';

const DEFAULT_CATS = ['Estatuto', 'Actas', 'Contratos', 'Seguros', 'Planos'];
const ICONS: Record<string, string> = {
  Estatuto: 'book',
  Actas: 'description',
  Contratos: 'contract',
  Seguros: 'shield',
  Planos: 'map',
};

export function DocumentosPage() {
  const { isAdmin } = useApp();
  const { documentos, config, deleteDocumento } = useData();
  const [filtro, setFiltro] = useState<string>('Todos');
  const [form, setForm] = useState<{ open: boolean; documento: Documento | null }>({ open: false, documento: null });
  const [verDesc, setVerDesc] = useState<Documento | null>(null);

  const categorias = useMemo(() => {
    const cats =
      config.categorias_documentos && config.categorias_documentos.length
        ? config.categorias_documentos
        : DEFAULT_CATS;
    return ['Todos', ...cats];
  }, [config.categorias_documentos]);

  const mostrar = documentos
    .filter((d) => filtro === 'Todos' || d.categoria === filtro)
    .slice()
    .sort((a, b) => {
      const fa = parseFecha(a.fecha || a.created_at);
      const fb = parseFecha(b.fecha || b.created_at);
      return fb - fa;
    });

  function parseFecha(s?: string | null): number {
    if (!s) return 0;
    const str = String(s);
    if (str.indexOf('T') !== -1) {
      const p = str.slice(0, 10).split('-');
      return +new Date(+p[0], +p[1] - 1, +p[2]);
    }
    const q = str.split('/');
    if (q.length === 3) return +new Date(+q[2], +q[1] - 1, +q[0]);
    return 0;
  }

  function eliminar(d: Documento) {
    if (window.confirm('¿Estás seguro de eliminar este documento? Esta acción no se puede deshacer.')) {
      deleteDocumento(d.id);
    }
  }

  return (
    <div id="tab-documentos" className="tab-content active">
      {isAdmin && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.8rem' }}>
          <Button icon="add" onClick={() => setForm({ open: true, documento: null })}>Agregar Documento</Button>
        </div>
      )}

      <div className="filter-chips" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
        {categorias.map((c) => (
          <button
            key={c}
            type="button"
            className={'chip ' + (filtro === c ? 'chip-primary' : 'chip-neutral')}
            style={{ cursor: 'pointer', border: filtro === c ? '1px solid var(--md-sys-color-primary)' : '1px solid transparent' }}
            onClick={() => setFiltro(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {mostrar.length === 0 ? (
        <EmptyState texto="No hay documentos en esta categoría." />
      ) : (
        <div className="docs-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {mostrar.map((d) => {
            const icon = ICONS[d.categoria || ''] || 'description';
            const fecha = formatDate(d.fecha || d.created_at);
            return (
              <div key={d.id} className="card" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span
                  aria-hidden
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '0.75rem',
                    background: 'var(--md-sys-color-primary-container)',
                    color: 'var(--md-sys-color-on-primary-container)',
                    flexShrink: 0,
                  }}
                  title={d.categoria || 'Documento'}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.4rem' }}>{icon}</span>
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {escHtml(d.nombre)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {escHtml(d.categoria || '')}
                    {d.categoria ? ' · ' : ''}
                    {fecha}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0rem', flexShrink: 0, alignItems: 'center' }}>
                  {isAdmin && (
                    <>
                      <IconButton icon="edit" title="Editar" onClick={() => setForm({ open: true, documento: d })} />
                      <IconButton icon="delete" className="danger" title="Eliminar" onClick={() => eliminar(d)} />
                    </>
                  )}
                  {d.descripcion && (
                    <IconButton icon="info" title="Ver descripción" onClick={() => setVerDesc(d)} />
                  )}
                  {safeUrl(d.archivo) && (
                    <a
                      href={safeUrl(d.archivo)}
                      title="Ver documento"
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: 'none', color: 'var(--text-2)' }}
                    >
                      <IconButton icon="description" title="Ver documento" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DocumentoFormModal
        open={form.open}
        documento={form.documento}
        onClose={() => setForm({ open: false, documento: null })}
      />

      <Modal
        open={!!verDesc}
        title="Descripción"
        onClose={() => setVerDesc(null)}
        footer={<TextButton onClick={() => setVerDesc(null)}>Cerrar</TextButton>}
      >
        <div style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{nl2br(verDesc?.descripcion)}</div>
      </Modal>
    </div>
  );
}