import { useState } from 'react';
import { formatMoney, formatPeriodo } from '../../lib/format';
import {
  cuotaDelPeriodo,
  egresosMes,
  esperadoPorPeriodo,
  morosos,
  pctRecaudado,
  periodosPendientes,
  periodosFinanzas,
  recaudadoPorPeriodo,
} from '../../lib/finanzas';
import type { Gasto } from '../../lib/types';
import { useData } from '../../store/DataContext';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { StatCard } from '../ui/StatCard';
import { ComoPagarModal } from './ComoPagarModal';
import { DeudaModal } from './DeudaModal';
import { PagoFormModal } from './PagoFormModal';

function parcelaNumero(id: string, parcelas: { id: string; numero?: string }[]): string {
  const p = parcelas.find((x) => x.id === id);
  return p ? p.numero || id : id;
}

export function HomePage() {
  const { gastos, pagos, flujo, parcelas, config, loading } = useData();

  const [comoPagar, setComoPagar] = useState(false);
  const [deuda, setDeuda] = useState<{ parcelaId: string; nombre: string } | null>(null);
  const [pago, setPago] = useState<Gasto | null>(null);

  if (loading) {
    return (
      <>
        <section className="stats">
          <div className="skeleton skeleton-stat" />
          <div className="skeleton skeleton-stat" />
          <div className="skeleton skeleton-stat" />
          <div className="skeleton skeleton-stat" />
        </section>
        <div className="skeleton skeleton-card" />
        <div className="skeleton skeleton-card" />
      </>
    );
  }

  const periodos = periodosFinanzas(gastos, flujo);
  const periodo = periodos.length ? periodos[0] : null;

  const esperado = esperadoPorPeriodo(periodo, gastos);
  const recaudado = recaudadoPorPeriodo(periodo, gastos, pagos);
  const egresos = egresosMes(periodo, flujo);
  const cantidadMorosos = morosos(gastos, parcelas, pagos).length;

  const pct = pctRecaudado(periodo, gastos, pagos);
  const fillColor = pct >= 90 ? 'var(--color-positive)' : pct >= 60 ? '#f59e0b' : 'var(--md-sys-color-error)';
  const cuota = cuotaDelPeriodo(periodo, config).monto;

  return (
    <div id="tab-home" className="tab-content active">
      <section className="stats">
        <StatCard label="Esperado (periodo)" value={formatMoney(esperado)} />
        <StatCard label="Recaudado (periodo)" value={formatMoney(recaudado)} tone="blue" />
        <StatCard label="Egresos (periodo)" value={formatMoney(egresos)} tone="red" />
        <StatCard label="Morosos" value={cantidadMorosos} tone={cantidadMorosos > 0 ? 'red' : 'green'} />
      </section>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <div className="card" style={{ flex: '1 1 260px' }}>
          <h4>Recaudación del periodo</h4>
          <p className="progress-label" style={{ marginTop: 0 }}>
            <strong style={{ color: 'var(--text)' }}>Cuota de gasto común:</strong> <strong style={{ color: 'var(--text)' }}>{formatMoney(cuota)}</strong>
            {periodo ? <> <span style={{ color: 'var(--text-muted)' }}>({formatPeriodo(periodo)})</span></> : null}
            {' \u00A0 '}
            <strong style={{ color: 'var(--text)' }}>{formatMoney(recaudado)}</strong> <span style={{ color: 'var(--text-muted)' }}>de {formatMoney(esperado)} recaudados</span>
          </p>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: pct + '%', background: fillColor }} />
          </div>
          <p className="progress-label">{pct}% de las cuotas del periodo pagadas.</p>
        </div>

        <div className="card" style={{ flex: '1 1 260px' }}>
          <h4>Cómo pagar</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: '1rem' }}>
            Transferí tu cuota mensual a la cuenta del condominio.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button icon="payments" onClick={() => setComoPagar(true)}>Ver datos de pago</Button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h4>Parcelas morosas</h4>
        {cantidadMorosos === 0 ? (
          <EmptyState texto="Todas las parcelas están al día." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.6rem' }}>
            {morosos(gastos, parcelas, pagos).map((m) => {
              const pend = periodosPendientes(m.parcela_id, gastos, pagos).length;
              return (
                <div
                  key={m.parcela_id}
                  className="card"
                  style={{ margin: 0, cursor: 'pointer', padding: '0.9rem', border: '1px solid var(--border)' }}
                  onClick={() => setDeuda({ parcelaId: m.parcela_id, nombre: m.numero })}
                >
                  <div style={{ fontWeight: 600, color: 'var(--text)' }}>{m.numero}</div>
                  <div style={{ color: 'var(--md-sys-color-error)', fontWeight: 700 }}>{formatMoney(m.deuda)}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>
                    {pend ? pend + ' periodo' + (pend > 1 ? 's' : '') : ''}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ComoPagarModal
        open={comoPagar}
        onClose={() => setComoPagar(false)}
        datos={config.datos_pago}
        montoTexto={null}
      />

      <DeudaModal
        open={!!deuda}
        parcelaId={deuda ? deuda.parcelaId : null}
        parcelaNombre={deuda ? parcelaNumero(deuda.parcelaId, parcelas) : ''}
        onClose={() => setDeuda(null)}
        onRegistrarPago={(gasto) => {
          setPago(gasto);
          setDeuda(null);
        }}
      />

      <PagoFormModal
        open={!!pago}
        gasto={pago}
        parcelaNombre={pago ? parcelaNumero(pago.parcela_id, parcelas) : ''}
        onClose={() => setPago(null)}
      />
    </div>
  );
}
