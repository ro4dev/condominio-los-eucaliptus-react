import { formatMoney, formatPeriodo } from '../../lib/format';
import { egresosMes, esperadoPorPeriodo, periodosFinanzas, recaudadoPorPeriodo, saldoPeriodo, siguientePeriodo } from '../../lib/finanzas';
import type { Gasto, Movimiento, Pago } from '../../lib/types';
import { useApp } from '../../store/AppContext';
import { Button, IconButton } from '../ui/Button';
import { StatCard } from '../ui/StatCard';

interface Props {
  gastos: Gasto[];
  pagos: Pago[];
  flujo: Movimiento[];
  onGenerarCuotas: (periodo: string) => void;
  onVerCuotas: (periodo: string) => void;
  onVerMovimientos: (periodo: string) => void;
  onEditarPeriodo: (periodo: string) => void;
}

export function PeriodoEnCurso({ gastos, pagos, flujo, onGenerarCuotas, onVerCuotas, onVerMovimientos, onEditarPeriodo }: Props) {
  const { isAdmin } = useApp();
  const periodos = periodosFinanzas(gastos, flujo);
  const p = periodos.length ? periodos[0] : null;
  if (!p) return null;

  const esp = esperadoPorPeriodo(p, gastos);
  const rec = recaudadoPorPeriodo(p, gastos, pagos);
  const pct = esp ? Math.round((rec / esp) * 100) : 0;
  const eg = egresosMes(p, flujo);
  const sal = saldoPeriodo(p, gastos, flujo, pagos);
  const fillColor = pct >= 90 ? 'var(--color-positive)' : pct >= 60 ? '#f59e0b' : 'var(--md-sys-color-error)';
  const next = siguientePeriodo(gastos);

  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
        <h4 style={{ margin: 0 }}>
          Periodo en curso — <span style={{ fontWeight: 400, color: 'var(--text-2)' }}>{formatPeriodo(p)}</span>
        </h4>
        {isAdmin && <IconButton icon="edit" onClick={() => onEditarPeriodo(p)} title="Editar config del período" />}
      </div>

      <section className="stats" style={{ marginBottom: '0.8rem' }}>
        <StatCard label="Esperado" value={formatMoney(esp)} />
        <StatCard label="Recaudado" value={formatMoney(rec)} tone="blue" />
        <StatCard label="Egresos" value={formatMoney(eg)} tone="red" />
        <StatCard label="Saldo" value={formatMoney(sal)} tone={sal >= 0 ? 'green' : 'red'} />
      </section>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: Math.min(100, pct) + '%', background: fillColor }} />
      </div>
      <p className="progress-label">{pct}% de las cuotas del periodo pagadas</p>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        {isAdmin && (
          <Button icon="check_circle" onClick={() => onGenerarCuotas(next)}>Cerrar periodo</Button>
        )}
        <Button icon="receipt_long" onClick={() => onVerCuotas(p)}>Cuotas</Button>
        <Button icon="swap_vert" onClick={() => onVerMovimientos(p)}>Movimientos</Button>
      </div>
    </div>
  );
}
