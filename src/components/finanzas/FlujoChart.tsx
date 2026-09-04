import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { formatMoney, formatPeriodo, mesDeFecha } from '../../lib/format';
import { egresosMes, ingresosMes } from '../../lib/finanzas';
import type { Gasto, Movimiento, Pago } from '../../lib/types';
import { useChartColors } from './useChartColors';

export function FlujoChart({ gastos, flujo, pagos }: { gastos: Gasto[]; flujo: Movimiento[]; pagos: Pago[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);
  const colors = useChartColors();

  useEffect(() => {
    if (!canvasRef.current) return;
    const meses: Record<string, boolean> = {};
    flujo.forEach((f) => { const m = mesDeFecha(f.fecha); if (m) meses[m] = true; });
    gastos.forEach((g) => { if (g.periodo) meses[g.periodo] = true; });
    const keys = Object.keys(meses).sort();

    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: keys.map(formatPeriodo),
        datasets: [
          { label: 'Ingresos', data: keys.map((k) => ingresosMes(k, gastos, flujo, pagos)), borderColor: colors.positive, borderWidth: 2, pointBackgroundColor: colors.positive, pointRadius: 3, pointHoverRadius: 5, tension: 0.3, fill: false },
          { label: 'Egresos', data: keys.map((k) => egresosMes(k, flujo)), borderColor: colors.negative, borderWidth: 2, pointBackgroundColor: colors.negative, pointRadius: 3, pointHoverRadius: 5, tension: 0.3, fill: false },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: colors.text, boxWidth: 12, padding: 12, font: { size: 11 } } } },
        scales: {
          x: { ticks: { color: colors.text }, grid: { color: colors.grid } },
          y: { beginAtZero: true, ticks: { color: colors.text, callback: (v) => formatMoney(v as number) }, grid: { color: colors.grid } },
        },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [gastos, flujo, pagos, colors]);

  return <canvas ref={canvasRef} />;
}
