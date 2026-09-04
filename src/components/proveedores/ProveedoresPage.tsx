import { useState } from 'react';
import { escHtml, safeUrl } from '../../lib/format';
import type { Proveedor } from '../../lib/types';
import { useApp } from '../../store/AppContext';
import { useData } from '../../store/DataContext';
import { Button, IconButton } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { EmptyState } from '../ui/EmptyState';
import { ProveedorFormModal } from './ProveedorFormModal';

export function ProveedoresPage() {
  const { isAdmin } = useApp();
  const { proveedores, deleteProveedor } = useData();
  const [form, setForm] = useState<{ open: boolean; proveedor: Proveedor | null }>({ open: false, proveedor: null });

  function eliminar(p: Proveedor) {
    if (window.confirm('¿Estás seguro de eliminar este proveedor? Esta acción no se puede deshacer.')) {
      deleteProveedor(p.id);
    }
  }

  return (
    <div id="tab-proveedores" className="tab-content active">
      {isAdmin && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.8rem' }}>
          <Button icon="add" onClick={() => setForm({ open: true, proveedor: null })}>Agregar Proveedor</Button>
        </div>
      )}

      {proveedores.length === 0 ? (
        <EmptyState texto="No hay proveedores registrados." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.8rem' }}>
          {proveedores.map((p) => (
            <div key={p.id} className="card" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <Chip tone="primary">{escHtml(p.rubro)}</Chip>
                {isAdmin && (
                  <span style={{ display: 'flex', flexShrink: 0 }}>
                    <IconButton icon="edit" title="Editar" onClick={() => setForm({ open: true, proveedor: p })} />
                    <IconButton icon="delete" className="danger" title="Eliminar" onClick={() => eliminar(p)} />
                  </span>
                )}
              </div>
              <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.3rem' }}>{escHtml(p.nombre)}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9rem' }}>
                {p.contacto && (
                  <div><span className="material-symbols-outlined" style={{ fontSize: '1.1rem', verticalAlign: 'middle' }}>person</span> {escHtml(p.contacto)}</div>
                )}
                {p.telefono && (
                  <div>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', verticalAlign: 'middle' }}>phone</span>{' '}
                    <a href={'tel:' + escHtml(p.telefono)} style={{ color: 'var(--md-sys-color-primary)', textDecoration: 'none' }}>{escHtml(p.telefono)}</a>
                  </div>
                )}
                {p.email && (
                  <div>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', verticalAlign: 'middle' }}>mail</span>{' '}
                    <a href={'mailto:' + escHtml(p.email)} style={{ color: 'var(--md-sys-color-primary)', textDecoration: 'none' }}>{escHtml(p.email)}</a>
                  </div>
                )}
                {p.web_instagram && (
                  <div>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', verticalAlign: 'middle' }}>language</span>{' '}
                    {safeUrl(p.web_instagram) ? (
                      <a href={safeUrl(p.web_instagram)} target="_blank" rel="noreferrer" style={{ color: 'var(--md-sys-color-primary)', textDecoration: 'none' }}>{escHtml(p.web_instagram)}</a>
                    ) : escHtml(p.web_instagram)}
                  </div>
                )}
                {p.observaciones && <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.3rem' }}>{escHtml(p.observaciones)}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      <ProveedorFormModal
        open={form.open}
        proveedor={form.proveedor}
        onClose={() => setForm({ open: false, proveedor: null })}
      />
    </div>
  );
}