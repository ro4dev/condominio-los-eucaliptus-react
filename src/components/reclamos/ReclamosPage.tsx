import { useState } from 'react';
import { escHtml, formatDate, nl2br } from '../../lib/format';
import type { Reclamo } from '../../lib/types';
import { useApp } from '../../store/AppContext';
import { useData } from '../../store/DataContext';
import { Button, IconButton } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { EmptyState } from '../ui/EmptyState';
import { ReclamoFormModal } from './ReclamoFormModal';

type Filtro = 'todos' | 'Reclamo' | 'Sugerencia';

const FILTROS: { id: Filtro; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'Reclamo', label: 'Reclamos' },
  { id: 'Sugerencia', label: 'Sugerencias' },
];

export function ReclamosPage() {
  const { isAdmin } = useApp();
  const { reclamos, parcelas, deleteReclamo } = useData();
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [form, setForm] = useState(false);

  function numeroParcela(id?: string | null): string {
    if (!id) return 'Anónimo';
    const p = parcelas.find((x) => x.id === id);
    return p ? p.numero : 'Parcela';
  }

  const mostrar = reclamos
    .filter((r) => filtro === 'todos' || r.tipo === filtro)
    .slice()
    .sort((a, b) => {
      const fa = a.fecha || a.created_at || '';
      const fb = b.fecha || b.created_at || '';
      return fa < fb ? 1 : fa > fb ? -1 : 0;
    });

  function eliminar(r: Reclamo) {
    if (window.confirm('¿Estás seguro de eliminar este comentario? Esta acción no se puede deshacer.')) {
      deleteReclamo(r.id);
    }
  }

  return (
    <div id="tab-reclamos" className="tab-content active">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.8rem' }}>
        <Button icon="add" onClick={() => setForm(true)}>Agregar Comentario</Button>
      </div>

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
        <EmptyState texto="No hay comentarios." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {mostrar.map((r) => (
            <div key={r.id} className="card" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <Chip tone={r.tipo === 'Sugerencia' ? 'positive' : 'error'}>{escHtml(r.tipo)}</Chip>
                <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(r.fecha || r.created_at)}</span>
                  {isAdmin && (
                    <IconButton icon="delete" className="danger" title="Eliminar" onClick={() => eliminar(r)} />
                  )}
                </div>
              </div>
              <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{escHtml(r.asunto)}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-2)', marginBottom: '0.4rem' }}>{nl2br(r.descripcion)}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{numeroParcela(r.parcela_id)}</div>
            </div>
          ))}
        </div>
      )}

      <ReclamoFormModal open={form} onClose={() => setForm(false)} />
    </div>
  );
}