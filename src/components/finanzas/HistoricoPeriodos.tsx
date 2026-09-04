import { formatMoney, formatPeriodo } from '../../lib/format';
import { esperadoPorPeriodo, periodosFinanzas, recaudadoPorPeriodo, saldoPeriodo } from '../../lib/finanzas';
import type { Config, Gasto, Movimiento, Pago } from '../../lib/types';
import { useApp } from '../../store/AppContext';
import { EmptyState } from '../ui/EmptyState';
import { IconButton } from '../ui/Button';

interface Props {
  gastos: Gasto[];
  pagos: Pago[];
  flujo: Movimiento[];
  config: Config;
  onVerCuotas: (periodo: string) => void;
  onVerMovimientos: (periodo: string) => void;
  onEditarPeriodo: (periodo: string) => void;
}

function pctColor(pct: number): string {
  return pct >= 90 ? 'var(--color-positive)' : pct >= 60 ? '#f59e0b' : 'var(--md-sys-color-error)';
}

export function HistoricoPeriodos({ gastos, pagos, flujo, config, onVerCuotas, onVerMovimientos, onEditarPeriodo }: Props) {
  const { isAdmin } = useApp();
  const vig = periodosFinanzas(gastos, flujo)[0];
  const periodos = periodosFinanzas(gastos, flujo).filter((p) => p !== vig);

  if (!periodos.length) {
    return (
      <div className="table-wrap">
        <h4>Histórico de períodos</h4>
        <EmptyState texto="Sin otros períodos." />
      </div>
    );
  }

  const periodosConfig = config.periodos || [];

  return (
    <div className="table-wrap">
      <h4>Histórico de períodos</h4>
      <table>
        <thead>
          <tr>
            <th>Período</th>
            {isAdmin && <th>Monto</th>}
            <th>Esperado</th>
            <th>Recaudado</th>
            <th>Saldo</th>
            <th>%</th>
            <th style={{ width: '1%', whiteSpace: 'nowrap' }}></th>
          </tr>
        </thead>
        <tbody>
          {periodos.map((p) => {
            const conf = periodosConfig.find((c) => c.periodo === p) || ({} as { periodo?: string; monto?: number });
            const esp = esperadoPorPeriodo(p, gastos);
            const rec = recaudadoPorPeriodo(p, gastos, pagos);
            const pct = esp ? Math.round((rec / esp) * 100) : 0;
            const sal = saldoPeriodo(p, gastos, flujo, pagos);
            return (
              <tr key={p}>
                <td style={{ fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>{formatPeriodo(p)}</td>
                {isAdmin && (
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {conf.periodo ? formatMoney(conf.monto || 0) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                )}
                <td>{formatMoney(esp)}</td>
                <td>{formatMoney(rec)}</td>
                <td style={{ fontWeight: 600, whiteSpace: 'nowrap', color: sal >= 0 ? 'var(--color-positive)' : 'var(--md-sys-color-error)' }}>
                  {formatMoney(sal)}
                </td>
                <td style={{ fontWeight: 600, color: pctColor(pct) }}>{pct}%</td>
                <td style={{ width: '1%', whiteSpace: 'nowrap' }}>
                  <IconButton icon="receipt_long" onClick={() => onVerCuotas(p)} title="Ver cuotas" />
                  <IconButton icon="swap_vert" onClick={() => onVerMovimientos(p)} title="Ver movimientos" />
                  {isAdmin && <IconButton icon="edit" onClick={() => onEditarPeriodo(p)} title="Editar config" />}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
