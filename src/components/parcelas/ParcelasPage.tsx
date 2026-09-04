import { useState } from 'react';
import { useData } from '../../store/DataContext';
import { useApp } from '../../store/AppContext';
import type { Parcela, Propietario } from '../../lib/types';
import { Button, IconButton } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { EmptyState } from '../ui/EmptyState';
import { ParcelaFormModal } from './ParcelaFormModal';
import { PropietarioFormModal } from './PropietarioFormModal';
import { PropietariosModal } from './PropietariosModal';

function estadoTone(estado: string | undefined): 'positive' | 'warning' | 'neutral' {
  const st = String(estado || '').toLowerCase();
  if (st.indexOf('habit') !== -1) return 'positive';
  if (st.indexOf('construc') !== -1) return 'warning';
  return 'neutral';
}

export function ParcelasPage() {
  const { parcelas, propietarios, deletePropietario } = useData();
  const { isAdmin, showSnackbar } = useApp();

  const [parcelaForm, setParcelaForm] = useState<{ open: boolean; parcela: Parcela | null }>({ open: false, parcela: null });
  const [propForm, setPropForm] = useState<{ open: boolean; propietario: Propietario | null; parcelaIdFija: string | null }>({
    open: false,
    propietario: null,
    parcelaIdFija: null,
  });
  const [propModal, setPropModal] = useState<{ open: boolean; parcela: Parcela | null }>({ open: false, parcela: null });

  function eliminarPropietario(p: Propietario) {
    if (window.confirm('¿Estás seguro de eliminar este propietario? Esta acción no se puede deshacer.')) {
      deletePropietario(p.id);
      showSnackbar('Eliminado.', 'success');
    }
  }

  const sorted = parcelas
    .slice()
    .sort((a, b) => {
      const numA = parseInt((a.numero || '').replace(/\D/g, ''), 10) || 0;
      const numB = parseInt((b.numero || '').replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });

  return (
    <div id="tab-parcelas" className="tab-content active">
      {isAdmin && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.8rem' }}>
          <Button icon="add" onClick={() => setParcelaForm({ open: true, parcela: null })}>Agregar Parcela</Button>
        </div>
      )}

      {sorted.length === 0 ? (
        <EmptyState texto="No hay parcelas registradas." />
      ) : (
        <div className="table-wrap">
          <table style={{ minWidth: 560 }}>
            <thead>
              <tr>
                <th>Parcela</th>
                <th>Rol</th>
                <th>Metros²</th>
                <th>Estado</th>
                <th>Propietarios</th>
                <th style={{ width: '1%', whiteSpace: 'nowrap' }}></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => {
                const props = propietarios.filter((pr) => pr.parcela_id === p.id);
                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text)' }}>{p.numero || ''}</td>
                    <td>{p.rol || '—'}</td>
                    <td>{p.metros ? p.metros + ' m²' : '—'}</td>
                    <td>
                      <Chip tone={estadoTone(p.estado)}>{p.estado}</Chip>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <IconButton
                          icon="groups"
                          title={'Ver propietarios (' + props.length + ')'}
                          style={{ color: 'var(--md-sys-color-primary)' }}
                          onClick={() => setPropModal({ open: true, parcela: p })}
                        />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{props.length}</span>
                      </div>
                    </td>
                    <td style={{ width: '1%', whiteSpace: 'nowrap' }}>
                      {isAdmin && (
                        <IconButton icon="edit" title="Editar" onClick={() => setParcelaForm({ open: true, parcela: p })} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ParcelaFormModal
        open={parcelaForm.open}
        parcela={parcelaForm.parcela}
        onClose={() => setParcelaForm({ open: false, parcela: null })}
      />

      <PropietarioFormModal
        open={propForm.open}
        propietario={propForm.propietario}
        parcelaIdFija={propForm.parcelaIdFija}
        onClose={() => setPropForm({ open: false, propietario: null, parcelaIdFija: null })}
      />

      <PropietariosModal
        open={propModal.open}
        parcela={propModal.parcela}
        propietarios={propietarios}
        onClose={() => setPropModal({ open: false, parcela: null })}
        onAgregar={() => {
          setPropForm({ open: true, propietario: null, parcelaIdFija: propModal.parcela ? propModal.parcela.id : null });
          setPropModal({ open: false, parcela: null });
        }}
        onEditar={(prop) => setPropForm({ open: true, propietario: prop, parcelaIdFija: null })}
        onEliminar={eliminarPropietario}
      />
    </div>
  );
}
