import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { formatMoney, formatPeriodo } from '../../lib/format';
import { recaudadoGasto } from '../../lib/finanzas';
import type { Gasto, Pago } from '../../lib/types';
import { useChartColors } from './useChartColors';

export function RecaudadoChart({ gastos, pagos }: { gastos: Gasto[]; pagos: Pago[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);
  const colors = useChartColors();

  useEffect(() => {
    if (!canvasRef.current) return;
    const grupos: Record<string, { esp: number; rec: number }> = {};
    gastos.forEach((r) => {
      const p = r.periodo || 'Sin periodo';
      grupos[p] = grupos[p] || { esp: 0, rec: 0 };
      grupos[p].esp += parseFloat(String(r.monto || 0)) || 0;
      grupos[p].rec += recaudadoGasto(r, pagos);
    });
    const periodos = Object.keys(grupos).sort();
    const labels = periodos.map(formatPeriodo);

    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Esperado', data: periodos.map((p) => grupos[p].esp), borderColor: colors.muted, borderWidth: 2, borderDash: [5, 5], pointBackgroundColor: colors.muted, pointRadius: 3, pointHoverRadius: 5, tension: 0.3, fill: false },
          { label: 'Recaudado', data: periodos.map((p) => grupos[p].rec), borderColor: colors.primary, borderWidth: 2, pointBackgroundColor: colors.primary, pointRadius: 3, pointHoverRadius: 5, tension: 0.3, fill: '-1' },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: colors.text, boxWidth: 12, padding: 12, font: { size: 11 } } },
          tooltip: { callbacks: { label: (ctx) => ctx.dataset.label + ': ' + formatMoney(ctx.parsed.y as number) } },
        },
        scales: {
          x: { ticks: { color: colors.text }, grid: { color: colors.grid } },
          y: { beginAtZero: true, ticks: { color: colors.text, callback: (v) => formatMoney(v as number) }, grid: { color: colors.grid } },
        },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [gastos, pagos, colors]);

  return <canvas ref={canvasRef} />;
}
