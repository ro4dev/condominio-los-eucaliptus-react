import { useMemo, useState } from 'react';
import { escHtml, formatDate, nl2br } from '../../lib/format';
import type { Asamblea } from '../../lib/types';
import { useApp } from '../../store/AppContext';
import { useData } from '../../store/DataContext';
import { Button, IconButton } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { EmptyState } from '../ui/EmptyState';
import { AsambleaFormModal } from './AsambleaFormModal';

type Filtro = 'Todos' | 'Ordinaria' | 'Extraordinaria';

const FILTROS: { id: Filtro; label: string }[] = [
  { id: 'Todos', label: 'Todos' },
  { id: 'Ordinaria', label: 'Ordinarias' },
  { id: 'Extraordinaria', label: 'Extraordinarias' },
];

export function AsambleasPage() {
  const { isAdmin } = useApp();
  const { asambleas, asamblea_asistentes, parcelas, deleteAsamblea } = useData();
  const [filtro, setFiltro] = useState<Filtro>('Todos');
  const [form, setForm] = useState<{ open: boolean; asamblea: Asamblea | null }>({ open: false, asamblea: null });

  const asistentesDe = useMemo(
    () => (id: string) => (asamblea_asistentes || []).filter((a) => a.asamblea_id === id).map((a) => a.parcela_id),
    [asamblea_asistentes],
  );

  function numeroParcela(id: string): string {
    const p = parcelas.find((x) => x.id === id);
    return p ? p.numero : '';
  }

  const mostrar = asambleas
    .filter((a) => filtro === 'Todos' || a.tipo === filtro)
    .slice()
    .sort((a, b) => {
      const fa = `${a.fecha}T00:00:00`;
      const fb = `${b.fecha}T00:00:00`;
      return fa < fb ? 1 : fa > fb ? -1 : 0;
    });

  function eliminar(a: Asamblea) {
    if (window.confirm('¿Eliminar esta asamblea? Se perderán todos los datos y asistentes asociados. Esta acción no se puede deshacer.')) {
      deleteAsamblea(a.id);
    }
  }

  return (
    <div id="tab-asambleas" className="tab-content active">
      {isAdmin && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.8rem' }}>
          <Button icon="add" onClick={() => setForm({ open: true, asamblea: null })}>Agregar Asamblea</Button>
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
        <EmptyState texto="No hay asambleas." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {mostrar.map((a) => {
            const asistentes = asistentesDe(a.id);
            const ordenadas = asistentes
              .map((pid) => ({ pid, num: numeroParcela(pid) }))
              .filter((x) => x.num)
              .sort((x, y) => {
                const nx = parseInt(x.num.replace(/\D/g, '')) || 0;
                const ny = parseInt(y.num.replace(/\D/g, '')) || 0;
                return nx - ny;
              });
            return (
              <div key={a.id} className="card" style={{ margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <Chip tone={a.tipo === 'Extraordinaria' ? 'warning' : 'primary'}>{escHtml(a.tipo)}</Chip>
                  <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(a.fecha)}</span>
                    {isAdmin && (
                      <span style={{ display: 'flex', flexShrink: 0 }}>
                        <IconButton icon="edit" title="Editar" onClick={() => setForm({ open: true, asamblea: a })} />
                        <IconButton icon="delete" className="danger" title="Eliminar" onClick={() => eliminar(a)} />
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.2rem' }}>Temario</div>
                <div style={{ fontSize: '0.85rem', marginBottom: '0.6rem' }}>{nl2br(a.temario)}</div>
                {a.acuerdos && (
                  <>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.2rem' }}>Acuerdos</div>
                    <div style={{ fontSize: '0.85rem', marginBottom: '0.4rem' }}>{nl2br(a.acuerdos)}</div>
                  </>
                )}
                {ordenadas.length > 0 && (
                  <div style={{ marginTop: '0.4rem' }}>
                    <strong style={{ fontSize: '0.85rem' }}>Asistentes:</strong>
                    <div style={{ marginTop: '0.3rem', display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
                      {ordenadas.map((x) => (
                        <span
                          key={x.pid}
                          style={{
                            display: 'inline-block',
                            background: 'var(--skeleton-1)',
                            color: 'var(--text-2)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.8rem',
                          }}
                        >
                          {escHtml(x.num)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AsambleaFormModal
        open={form.open}
        asamblea={form.asamblea}
        asistentesIds={form.asamblea ? asistentesDe(form.asamblea.id) : []}
        onClose={() => setForm({ open: false, asamblea: null })}
      />
    </div>
  );
}