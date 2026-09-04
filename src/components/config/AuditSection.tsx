import { useCallback, useEffect, useState } from 'react';
import { escHtml, formatAuditDate } from '../../lib/format';
import { supabaseClient } from '../../lib/supabase';
import type { AuditEntry } from '../../lib/types';
import { useApp } from '../../store/AppContext';
import { useData } from '../../store/DataContext';
import { Button, IconButton } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { Modal } from '../ui/Modal';

const AUDIT_TABLES: { value: string; label: string }[] = [
  { value: 'gastos', label: 'Gastos' },
  { value: 'pagos', label: 'Pagos' },
  { value: 'flujo', label: 'Flujo' },
  { value: 'noticias', label: 'Noticias' },
  { value: 'documentos', label: 'Documentos' },
  { value: 'reclamos', label: 'Reclamos' },
  { value: 'proveedores', label: 'Proveedores' },
  { value: 'asambleas', label: 'Asambleas' },
  { value: 'encuestas', label: 'Encuestas' },
  { value: 'parcelas', label: 'Parcelas' },
  { value: 'propietarios', label: 'Propietarios' },
  { value: 'publicaciones', label: 'Ventas' },
  { value: 'config', label: 'Configuración' },
];

const AUDIT_ACCIONES: Record<string, string> = { INSERT: 'Creó', UPDATE: 'Actualizó', DELETE: 'Eliminó' };
const AUDIT_CHUNK = 20;

function auditTablaLabel(tabla: string): string {
  const t = AUDIT_TABLES.find((x) => x.value === tabla);
  return t ? t.label : tabla;
}

function dotColor(accion: string): string {
  if (accion === 'INSERT') return 'var(--color-positive-bg)';
  if (accion === 'DELETE') return 'var(--md-sys-color-error-container)';
  return 'var(--md-sys-color-primary-container)';
}

export function AuditSection() {
  const { demoMode } = useApp();
  const { audit_log } = useData();
  const [filtro, setFiltro] = useState('todas');
  const [rows, setRows] = useState<AuditEntry[]>([]);
  const [aportadas, setAportadas] = useState(0);
  const [done, setDone] = useState(false);
  const [detalle, setDetalle] = useState<AuditEntry | null>(null);

  useEffect(() => {
    setRows([]);
    setAportadas(0);
    setDone(false);
  }, [filtro, demoMode]);

  const cargar = useCallback(async () => {
    if (done) return;
    if (demoMode) {
      const filtradas = audit_log.filter((e) => filtro === 'todas' || e.tabla === filtro);
      const chunk = filtradas.slice(aportadas, aportadas + AUDIT_CHUNK);
      setRows((r) => r.concat(chunk));
      setAportadas(aportadas + chunk.length);
      setDone(aportadas + chunk.length >= filtradas.length);
      return;
    }
    if (!supabaseClient) {
      setDone(true);
      return;
    }
    let q = supabaseClient.from('audit_log').select('*').order('created_at', { ascending: false });
    if (filtro !== 'todas') q = q.eq('tabla', filtro);
    const res = await q.range(aportadas, aportadas + AUDIT_CHUNK - 1);
    if (res.error) {
      setDone(true);
      return;
    }
    const chunk = (res.data || []) as AuditEntry[];
    setRows((r) => r.concat(chunk));
    setAportadas(aportadas + chunk.length);
    setDone(chunk.length < AUDIT_CHUNK);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoMode, done, filtro, aportadas, audit_log]);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro, demoMode]);

  const totalDemo = demoMode ? audit_log.filter((e) => filtro === 'todas' || e.tabla === filtro).length : 0;

  return (
    <div className="card" style={{ margin: 0 }}>
      <h4 style={{ margin: '0 0 0.2rem' }}>Actividad reciente</h4>
      <div className="filter-chips" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
        <button
          type="button"
          className={'chip ' + (filtro === 'todas' ? 'chip-primary' : 'chip-neutral')}
          style={{ cursor: 'pointer' }}
          onClick={() => setFiltro('todas')}
        >
          Todas
        </button>
        {AUDIT_TABLES.map((t) => (
          <button
            key={t.value}
            type="button"
            className={'chip ' + (filtro === t.value ? 'chip-primary' : 'chip-neutral')}
            style={{ cursor: 'pointer' }}
            onClick={() => setFiltro(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {rows.length === 0 && totalDemo > 0 && (
        <div style={{ padding: '0.8rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Cargando actividad...</div>
      )}

      {rows.length > 0 && (
        <div style={{ marginTop: '0.8rem' }}>
          {rows.map((e, i) => {
            const accion = AUDIT_ACCIONES[e.accion] || e.accion;
            const idTxt = e.registro_id ? String(e.registro_id).slice(0, 8) : '—';
            const color = dotColor(e.accion);
            return (
              <div key={e.id || i} style={{ display: 'flex', gap: '0.8rem', padding: '0.55rem 0', alignItems: 'flex-start' }}>
                <span
                  style={{
                    width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: color, color: 'var(--text-2)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '0.95rem' }}>
                    {e.accion === 'INSERT' ? 'add' : e.accion === 'DELETE' ? 'delete' : 'edit'}
                  </span>
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 500 }}>{escHtml(e.usuario || 'anónimo')}</span>
                    <span style={{ fontSize: '0.72rem', padding: '0.1rem 0.5rem', borderRadius: '999px', fontWeight: 600, background: color }}>
                      {escHtml(accion)}
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--text-2)', fontSize: '0.8rem' }}>{escHtml(auditTablaLabel(e.tabla))}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {escHtml(formatAuditDate(e.created_at))} · registro <code style={{ color: 'var(--text-2)' }}>{escHtml(idTxt)}</code>
                  </div>
                </div>
                {e.datos && Object.keys(e.datos).length > 0 && (
                  <IconButton icon="info" title="Ver datos" onClick={() => setDetalle(e)} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {rows.length === 0 && (demoMode ? totalDemo === 0 : done) && (
        <EmptyState texto="Sin actividad registrada." />
      )}

      {!done && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.6rem' }}>
          <Button onClick={cargar} className="btn-text">Cargar más</Button>
        </div>
      )}

      <Modal open={!!detalle} title="Detalle de actividad" onClose={() => setDetalle(null)}>
        <pre
          style={{
            fontSize: '0.8rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            background: 'var(--skeleton-1)',
            padding: '0.8rem',
            borderRadius: '0.5rem',
            maxHeight: '60vh',
            overflow: 'auto',
            margin: 0,
          }}
        >
          {detalle ? escHtml(JSON.stringify(detalle.datos, null, 2)) : ''}
        </pre>
      </Modal>
    </div>
  );
}