import { useMemo, useState } from 'react';
import { useApp } from '../../store/AppContext';
import { useData } from '../../store/DataContext';
import { Button, TextButton } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { AuditSection } from './AuditSection';

type ChipKey = 'categorias_documentos' | 'rubros_proveedores' | 'conceptos_flujo';

function tituloChips(key: ChipKey): string {
  if (key === 'categorias_documentos') return 'Categorías de Documentos';
  if (key === 'rubros_proveedores') return 'Rubros de Proveedores';
  return 'Conceptos de Ingresos/Egresos';
}

function placeholderChips(key: ChipKey): string {
  if (key === 'categorias_documentos') return 'Ej: Actas';
  if (key === 'rubros_proveedores') return 'Ej: Electricidad';
  return 'Ej: Mantenimiento';
}

export function ConfigPage() {
  const { isAdmin } = useApp();
  const {
    config,
    documentos,
    proveedores,
    flujo,
    parcelas,
    saveConfigValue,
    saveParcela,
  } = useData();

  const [pago, setPago] = useState(config.datos_pago || {});
  const [parcCantidad, setParcCantidad] = useState(
    config.parcelas_cantidad != null ? String(config.parcelas_cantidad) : '',
  );
  const [parcPrefijo, setParcPrefijo] = useState(config.parcelas_prefijo ?? '');
  const [modal, setModal] = useState<{ key: ChipKey; open: boolean } | null>(null);
  const [valAdd, setValAdd] = useState('');

  const usados = useMemo(
    () => ({
      categorias_documentos: Array.from(new Set((documentos || []).map((d) => d.categoria || '').filter(Boolean))),
      rubros_proveedores: Array.from(new Set((proveedores || []).map((p) => p.rubro || '').filter(Boolean))),
      conceptos_flujo: Array.from(new Set((flujo || []).map((f) => f.concepto || '').filter(Boolean))),
    }),
    [documentos, proveedores, flujo],
  );

  function chips(key: ChipKey): string[] {
    return config[key] || [];
  }

  async function agregarChip(key: ChipKey, val: string) {
    const v = val.trim();
    if (!v) return;
    const actual = chips(key);
    if (actual.includes(v)) {
      window.alert('Ya existe ese elemento.');
      return;
    }
    await saveConfigValue(key, [...actual, v]);
  }

  function removerChip(key: ChipKey, val: string) {
    if (usados[key].includes(val)) return;
    if (window.confirm('¿Eliminar "' + val + '"?')) {
      saveConfigValue(key, chips(key).filter((c) => c !== val));
    }
  }

  async function guardarDatosPago() {
    await saveConfigValue('datos_pago', pago);
  }

  async function aplicarParcelas() {
    const cantidad = parseInt(parcCantidad, 10);
    const prefijo = parcPrefijo.trim();
    if (!prefijo) { window.alert('Ingresá un prefijo.'); return; }
    if (!cantidad || cantidad < 1) { window.alert('Ingresá una cantidad válida.'); return; }

    const prefijoAnterior = config.parcelas_prefijo ?? '';
    const existentes = new Set(parcelas.map((p) => p.numero));

    if (prefijo !== prefijoAnterior) {
      for (const p of parcelas) {
        const m = p.numero.match(/^(\D+)\s+(\d+)$/);
        if (m && m[1] === prefijoAnterior) {
          const nuevo = prefijo + ' ' + m[2];
          if (!existentes.has(nuevo)) {
            await saveParcela({ id: p.id, numero: nuevo }, true);
          }
        }
      }
    }

    const trasRename = new Set(parcelas.map((p) => p.numero));
    if (prefijo !== prefijoAnterior) {
      for (const p of parcelas) {
        const m = p.numero.match(/^(\D+)\s+(\d+)$/);
        if (m && m[1] === prefijoAnterior) {
          trasRename.delete(p.numero);
          trasRename.add(prefijo + ' ' + m[2]);
        }
      }
    }

    let creadas = 0;
    for (let i = 1; i <= cantidad; i++) {
      const nombre = prefijo + ' ' + i;
      if (!trasRename.has(nombre)) {
        await saveParcela({ numero: nombre, metros: '0', estado: 'Sin asignar' }, false);
        creadas++;
      }
    }

    await saveConfigValue('parcelas_cantidad', cantidad);
    await saveConfigValue('parcelas_prefijo', prefijo);
    window.alert(creadas ? 'Parcelas actualizadas (' + creadas + ' creadas).' : 'Sin cambios.');
  }

  if (!isAdmin) {
    return <div className="tab-content active">No autorizado.</div>;
  }

  return (
    <div id="tab-config" className="tab-content active" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Parcelas */}
      <div className="card" style={{ margin: 0 }}>
        <h4 style={{ margin: '0 0 0.2rem' }}>Parcelas</h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>Cantidad total y nombre de las parcelas</p>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cfgParcelasCantidad">Cantidad</label>
            <input
              id="cfgParcelasCantidad"
              className="field-input"
              type="number"
              min={1}
              placeholder="Ej: 40"
              value={parcCantidad}
              onChange={(e) => setParcCantidad(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="cfgParcelasPrefijo">Prefijo</label>
            <input
              id="cfgParcelasPrefijo"
              className="field-input"
              type="text"
              placeholder="Ej: Terreno"
              value={parcPrefijo}
              onChange={(e) => setParcPrefijo(e.target.value)}
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <Button id="btnAplicarParcelas" onClick={aplicarParcelas}>Crear parcelas</Button>
        </div>
      </div>

      {/* Datos de pago */}
      <div className="card" style={{ margin: 0 }}>
        <h4 style={{ margin: '0 0 0.2rem' }}>Datos de Pago</h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>Cuenta y QR que se muestran en Home → "Cómo pagar"</p>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cfgPagoBanco">Banco</label>
            <input className="field-input" id="cfgPagoBanco" placeholder="Ej: Banco Estado" value={pago.banco ?? ''} onChange={(e) => setPago((p) => ({ ...p, banco: e.target.value }))} />
          </div>
          <div className="form-group">
            <label htmlFor="cfgPagoTipoCuenta">Tipo de cuenta</label>
            <input className="field-input" id="cfgPagoTipoCuenta" placeholder="Ej: CuentaRut" value={pago.tipo_cuenta ?? ''} onChange={(e) => setPago((p) => ({ ...p, tipo_cuenta: e.target.value }))} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cfgPagoNumeroCuenta">Número de cuenta</label>
            <input className="field-input" id="cfgPagoNumeroCuenta" placeholder="Ej: 12-345678-9" value={pago.numero_cuenta ?? ''} onChange={(e) => setPago((p) => ({ ...p, numero_cuenta: e.target.value }))} />
          </div>
          <div className="form-group">
            <label htmlFor="cfgPagoRut">RUT</label>
            <input className="field-input" id="cfgPagoRut" placeholder="Ej: 77.123.456-7" value={pago.rut ?? ''} onChange={(e) => setPago((p) => ({ ...p, rut: e.target.value }))} />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="cfgPagoTitular">Titular</label>
          <input className="field-input" id="cfgPagoTitular" placeholder="Ej: Comunidad Condominio Eucaliptus" value={pago.titular ?? ''} onChange={(e) => setPago((p) => ({ ...p, titular: e.target.value }))} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cfgPagoEmail">Email tesorería</label>
            <input className="field-input" id="cfgPagoEmail" type="email" placeholder="Ej: tesoreria@eucaliptus.cl" value={pago.email ?? ''} onChange={(e) => setPago((p) => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="form-group">
            <label htmlFor="cfgPagoQr">URL imagen QR</label>
            <input className="field-input" id="cfgPagoQr" type="url" placeholder="https://...qr.png" value={pago.qr ?? ''} onChange={(e) => setPago((p) => ({ ...p, qr: e.target.value }))} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <Button onClick={guardarDatosPago}>Guardar</Button>
        </div>
      </div>

      {/* Chips */}
      {(['categorias_documentos', 'rubros_proveedores', 'conceptos_flujo'] as ChipKey[]).map((key) => (
        <div key={key} className="card" style={{ margin: 0 }}>
          <h4 style={{ margin: '0 0 0.2rem' }}>{tituloChips(key)}</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
            {chips(key).length === 0 ? (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sin elementos</span>
            ) : (
              chips(key).map((c) => {
                const inUse = usados[key].includes(c);
                return (
                  <span
                    key={c}
                    title={inUse ? 'En uso (no se puede eliminar)' : undefined}
                    className={'chip ' + (inUse ? 'chip-neutral' : 'chip-primary')}
                    style={inUse ? { opacity: 0.7, cursor: 'not-allowed' } : { cursor: 'pointer' }}
                    onClick={() => !inUse && removerChip(key, c)}
                  >
                    {c}{inUse ? ' 🔒' : ' ✕'}
                  </span>
                );
              })
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.8rem' }}>
            <Button icon="add" onClick={() => { setValAdd(''); setModal({ key, open: true }); }}>Agregar</Button>
          </div>
        </div>
      ))}

      <Modal
        open={!!modal?.open}
        title={'Agregar ' + tituloChips(modal?.key as ChipKey).toLowerCase()}
        onClose={() => setModal(null)}
        footer={
          <>
            <TextButton onClick={() => setModal(null)}>Cancelar</TextButton>
            <Button
              type="submit"
              form="cfgModalForm"
              onClick={() => {
                if (modal) agregarChip(modal.key, valAdd);
                setModal(null);
              }}
            >
              Agregar
            </Button>
          </>
        }
      >
        <form
          id="cfgModalForm"
          onSubmit={(e) => {
            e.preventDefault();
            if (modal) agregarChip(modal.key, valAdd);
            setModal(null);
          }}
        >
          <div className="form-group">
            <label htmlFor="cfgModalInput">Nombre</label>
            <input
              id="cfgModalInput"
              className="field-input"
              placeholder={placeholderChips(modal?.key as ChipKey)}
              value={valAdd}
              onChange={(e) => setValAdd(e.target.value)}
              required
              autoFocus
            />
          </div>
        </form>
      </Modal>

      <AuditSection />

      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        Condominio Los Eucaliptus · {new Date().getFullYear()}
      </div>
    </div>
  );
}