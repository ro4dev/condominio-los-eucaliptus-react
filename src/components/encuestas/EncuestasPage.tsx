import { useMemo, useState } from 'react';
import { escHtml, formatDateCorta, getTimeRemaining, nl2br } from '../../lib/format';
import type { Encuesta } from '../../lib/types';
import { useApp } from '../../store/AppContext';
import { useData } from '../../store/DataContext';
import { Button, IconButton } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { EmptyState } from '../ui/EmptyState';
import { EncuestaFormModal } from './EncuestaFormModal';

type Filtro = 'Abiertas' | 'Cerradas';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#b91c1c', '#8b5cf6', '#ec4899'];

export function EncuestasPage() {
  const { isAdmin } = useApp();
  const { encuestas, encuestas_votos, propietarios, registrarVoto, deleteEncuesta } = useData();
  const [filtro, setFiltro] = useState<Filtro>('Abiertas');
  const [form, setForm] = useState<{ open: boolean; encuesta: Encuesta | null }>({ open: false, encuesta: null });

  const miParcela = useMemo(() => {
    const p = (propietarios || []).find((x) => x.parcela_id);
    return p ? p.parcela_id : '';
  }, [propietarios]);

  const ahora = new Date();

  const data = useMemo(
    () =>
      encuestas
        .map((e) => {
          const opciones = e.alternativas && e.alternativas.length && !(e.alternativas.length === 1 && e.alternativas[0] === '')
            ? e.alternativas
            : ['A favor', 'En contra'];
          const votos = (encuestas_votos || []).filter((v) => v.encuesta_id === e.id);
          const conteo: Record<string, number> = {};
          opciones.forEach((op) => { conteo[op] = 0; });
          votos.forEach((v) => { if (conteo[v.seleccion] !== undefined) conteo[v.seleccion]++; });
          const total = votos.length;
          let cerrada = false;
          if (e.fecha_termino) {
            const f = e.fecha_termino.slice(0, 10).split('-');
            const fin = new Date(+f[0], +f[1] - 1, +f[2], 23, 59, 59);
            cerrada = ahora > fin;
          }
          const miVoto = miParcela ? votos.find((v) => v.parcela_id === miParcela) : null;
          return { encuesta: e, opciones, conteo, total, cerrada, miVoto: miVoto || null };
        })
        .filter((d) => (filtro === 'Abiertas' ? !d.cerrada : d.cerrada))
        .sort((a, b) => {
          const fa = a.encuesta.created_at || '';
          const fb = b.encuesta.created_at || '';
          return fa < fb ? 1 : fa > fb ? -1 : 0;
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [encuestas, encuestas_votos, miParcela, filtro],
  );

  async function votar(e: Encuesta, indice: number, opciones: string[]) {
    const seleccion = opciones[indice];
    if (!seleccion) return;
    if (!miParcela) {
      window.alert('No se encontró una parcela asociada a tu cuenta.');
      return;
    }
    await registrarVoto(e.id, miParcela, seleccion);
  }

  function eliminar(e: Encuesta) {
    if (window.confirm('¿Eliminar esta encuesta? También se eliminarán todos los votos.')) {
      deleteEncuesta(e.id);
    }
  }

  return (
    <div id="tab-encuestas" className="tab-content active">
      {isAdmin && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.8rem' }}>
          <Button icon="add" onClick={() => setForm({ open: true, encuesta: null })}>Agregar Encuesta</Button>
        </div>
      )}

      <div className="filter-chips" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
        {(['Abiertas', 'Cerradas'] as Filtro[]).map((f) => (
          <button
            key={f}
            type="button"
            className={'chip ' + (filtro === f ? 'chip-primary' : 'chip-neutral')}
            style={{ cursor: 'pointer', border: filtro === f ? '1px solid var(--md-sys-color-primary)' : '1px solid transparent' }}
            onClick={() => setFiltro(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {data.length === 0 ? (
        <EmptyState texto="No hay encuestas para mostrar." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {data.map((d) => {
            const e = d.encuesta;
            const quorumAlcanzado = e.quorum ? d.total >= e.quorum : true;
            const fechaPub =
              e.fecha_termino && e.created_at
                ? formatDateCorta(e.created_at) + ' - ' + formatDateCorta(e.fecha_termino)
                : formatDateCorta(e.created_at);
            let infoExtra = '';
            if (e.fecha_termino && !d.cerrada) {
              const remaining = getTimeRemaining(e.fecha_termino);
              if (remaining) infoExtra = 'Termina en: ' + remaining;
            }
            return (
              <div key={e.id} className="card" style={{ margin: 0, opacity: d.cerrada ? 0.7 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <Chip tone={d.cerrada ? 'neutral' : 'primary'}>{d.cerrada ? 'Cerrada' : 'Abierta'}</Chip>
                  <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{fechaPub}</span>
                    {isAdmin && (
                      <span style={{ display: 'flex', flexShrink: 0 }}>
                        <IconButton icon="edit" title="Editar" onClick={() => setForm({ open: true, encuesta: e })} />
                        <IconButton icon="delete" className="danger" title="Eliminar" onClick={() => eliminar(e)} />
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.3rem' }}>{escHtml(e.titulo)}</div>
                {e.descripcion && <div style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: '0.4rem' }}>{nl2br(e.descripcion)}</div>}
                {infoExtra && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>{infoExtra}</div>}

                {d.opciones.map((op, i) => {
                  const count = d.conteo[op];
                  const pct = d.total > 0 ? Math.round((count / d.total) * 100) : 0;
                  const color = COLORS[i % COLORS.length];
                  const esMiVoto = d.miVoto && d.miVoto.seleccion === op;
                  return (
                    <div
                      key={op + i}
                      style={{
                        marginBottom: '0.4rem',
                        ...(esMiVoto ? { background: 'var(--skeleton-1)', padding: '0.3rem 0.5rem', borderRadius: '0.5rem' } : {}),
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                        <span style={esMiVoto ? { fontWeight: 600 } : {}}>{escHtml(op)}{esMiVoto ? ' ✓' : ''}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                          {count} ({pct}%)
                          {!d.cerrada && !d.miVoto && (
                            <button
                              type="button"
                              className="chip chip-primary"
                              style={{ cursor: 'pointer', fontSize: '0.75rem', background: color, border: 'none', color: '#fff' }}
                              onClick={() => votar(e, i, d.opciones)}
                            >
                              Votar
                            </button>
                          )}
                        </span>
                      </div>
                      <div style={{ display: 'flex', height: '6px', borderRadius: '4px', overflow: 'hidden', margin: '0.3rem 0', background: 'var(--skeleton-1)' }}>
                        <div style={{ width: pct + '%', background: color, transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  );
                })}

                {d.miVoto && <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ya votaste</div>}

                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.4rem', marginTop: '0.3rem' }}>
                  {e.quorum ? (
                    <Chip tone={quorumAlcanzado ? 'primary' : 'error'}>
                      Quorum: {d.total}/{e.quorum}{quorumAlcanzado ? ' ✓' : ''}
                    </Chip>
                  ) : null}
                  <Chip tone="neutral">Total: {d.total} votos</Chip>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <EncuestaFormModal
        open={form.open}
        encuesta={form.encuesta}
        onClose={() => setForm({ open: false, encuesta: null })}
      />
    </div>
  );
}