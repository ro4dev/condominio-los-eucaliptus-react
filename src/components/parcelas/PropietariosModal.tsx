import { safeUrl } from '../../lib/format';
import type { Parcela, Propietario } from '../../lib/types';
import { useApp } from '../../store/AppContext';
import { Button, IconButton, TextButton } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Icon } from '../ui/Icon';

interface Props {
  open: boolean;
  parcela: Parcela | null;
  propietarios: Propietario[];
  onClose: () => void;
  onAgregar: () => void;
  onEditar: (prop: Propietario) => void;
  onEliminar: (prop: Propietario) => void;
}

export function PropietariosModal({ open, parcela, propietarios, onClose, onAgregar, onEditar, onEliminar }: Props) {
  const { isAdmin } = useApp();
  if (!parcela) return null;
  const props = propietarios.filter((p) => p.parcela_id === parcela.id);

  return (
    <Modal
      open={open}
      title={'Propietarios de ' + (parcela.numero || parcela.id)}
      onClose={onClose}
      footer={
        <>
          <TextButton onClick={onClose}>Cerrar</TextButton>
          {isAdmin && <Button icon="person_add" onClick={onAgregar}>Agregar</Button>}
        </>
      }
    >
      {props.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
          No hay propietarios registrados para esta parcela.
        </div>
      ) : (
        props.map((p, j) => (
          <div key={p.id} style={{ padding: '0.8rem 0', borderTop: j > 0 ? '1px solid var(--divider)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>{p.nombre_completo || '—'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-2)' }}>{p.tipo || ''}</div>
              </div>
              {isAdmin && (
                <div style={{ display: 'flex', flexShrink: 0, alignItems: 'center' }}>
                  <IconButton icon="edit" onClick={() => onEditar(p)} title="Editar" />
                  <IconButton icon="delete" className="danger" onClick={() => onEliminar(p)} title="Eliminar" />
                </div>
              )}
            </div>
            <div style={{ marginTop: '0.3rem', fontSize: '0.8rem', color: 'var(--text-2)' }}>
              {p.telefono && (
                <div>
                  <Icon name="call" style={{ verticalAlign: 'middle', fontSize: '1rem' }} />
                  {' '}
                  <a href={'tel:' + safeUrl(p.telefono)} style={{ color: 'var(--md-sys-color-primary)', textDecoration: 'none' }}>{p.telefono}</a>
                </div>
              )}
              {p.email && (
                <div>
                  <Icon name="mail" style={{ verticalAlign: 'middle', fontSize: '1rem' }} />
                  {' '}
                  <a href={'mailto:' + safeUrl(p.email)} style={{ color: 'var(--md-sys-color-primary)', textDecoration: 'none' }}>{p.email}</a>
                </div>
              )}
              {p.rut && (
                <div>
                  <Icon name="badge" style={{ verticalAlign: 'middle', fontSize: '1rem' }} />
                  {' '}RUT: {p.rut}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </Modal>
  );
}
