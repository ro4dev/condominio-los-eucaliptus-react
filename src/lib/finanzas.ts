import { mesDeFecha, numeroDeParcela } from './format';
import type { Config, CuotaCalculada, Gasto, Movimiento, Pago, Parcela, PeriodoConfig } from './types';

const num = (v: number | string | null | undefined): number => parseFloat(String(v ?? 0)) || 0;

// ── Pagos / estado de pago ──
export function pagosDeGasto(gastoId: string, PAGOS: Pago[]): Pago[] {
  return PAGOS.filter((p) => p.gasto_id === gastoId);
}

export function sumPagosGasto(gastoId: string, PAGOS: Pago[]): number {
  return pagosDeGasto(gastoId, PAGOS).reduce((s, p) => s + num(p.monto), 0);
}

export function pagosDeParcela(parcelaId: string, PAGOS: Pago[]): Pago[] {
  return PAGOS.filter((p) => p.parcela_id === parcelaId);
}

export function pagoLegado(g: Gasto | null | undefined, PAGOS: Pago[]): boolean {
  return !!(g && g.pagado === 'Sí' && !pagosDeGasto(g.id, PAGOS).length);
}

export function isPagado(gasto: Gasto | null | undefined, PAGOS: Pago[]): boolean {
  if (!gasto) return false;
  if (pagoLegado(gasto, PAGOS)) return true;
  const monto = num(gasto.monto);
  if (!monto) return false;
  return sumPagosGasto(gasto.id, PAGOS) >= monto;
}

export function recaudadoGasto(gasto: Gasto | null | undefined, PAGOS: Pago[]): number {
  if (!gasto) return 0;
  const monto = num(gasto.monto);
  if (pagoLegado(gasto, PAGOS)) return monto;
  return Math.min(monto, sumPagosGasto(gasto.id, PAGOS));
}

// ── Esperado / recaudado por periodo ──
export function esperadoPorPeriodo(periodo: string | null | undefined, GASTOS: Gasto[]): number {
  return GASTOS.filter((g) => g.periodo === periodo).reduce((s, g) => s + num(g.monto), 0);
}

export function recaudadoPorPeriodo(periodo: string | null | undefined, GASTOS: Gasto[], PAGOS: Pago[]): number {
  return GASTOS.filter((g) => g.periodo === periodo).reduce((s, g) => s + recaudadoGasto(g, PAGOS), 0);
}

export function pctRecaudado(periodo: string | null | undefined, GASTOS: Gasto[], PAGOS: Pago[]): number {
  const esp = esperadoPorPeriodo(periodo, GASTOS);
  if (!esp) return 0;
  return Math.round((recaudadoPorPeriodo(periodo, GASTOS, PAGOS) / esp) * 100);
}

// ── Config de cuota por periodo ──
export function periodoConfig(periodo: string | null | undefined, CONFIG: Config): PeriodoConfig | null {
  return (CONFIG.periodos || []).find((p) => p.periodo === periodo) || null;
}

export function cuotaDelPeriodo(periodo: string | null | undefined, CONFIG: Config): CuotaCalculada {
  const conf = periodoConfig(periodo, CONFIG);
  if (!conf) return { monto: 0, fondo_reserva: 0, total: 0 };
  const monto = num(conf.monto);
  const fondo = num(conf.fondo_reserva);
  return { monto, fondo_reserva: fondo, total: monto + fondo };
}

export function siguientePeriodo(GASTOS: Gasto[], now = new Date()): string {
  const last = GASTOS.reduce<string | null>((acc, g) => (g.periodo && (!acc || g.periodo > acc) ? g.periodo : acc), null);
  const parts = last ? last.split('-') : null;
  let y: number, m: number;
  if (!parts || parts.length !== 2) {
    y = now.getFullYear();
    m = now.getMonth() + 1;
  } else {
    y = parseInt(parts[0]);
    m = parseInt(parts[1]);
  }
  m++;
  if (m > 12) { m = 1; y++; }
  return y + '-' + String(m).padStart(2, '0');
}

export function avisoAumento(GASTOS: Gasto[], CONFIG: Config): { periodo: string; anterior: number; nuevo: number; pct: number } | null {
  let vigente: string | null = null;
  GASTOS.forEach((g) => {
    if (g.periodo && (!vigente || g.periodo > vigente)) vigente = g.periodo;
  });
  if (!vigente) return null;
  const actual = cuotaDelPeriodo(vigente, CONFIG);
  const futuro = cuotaDelPeriodo(siguientePeriodo(GASTOS), CONFIG);
  if (!futuro.total || futuro.total <= actual.total) return null;
  const pct = actual.total ? Math.round(((futuro.total - actual.total) / actual.total) * 100) : 100;
  return { periodo: siguientePeriodo(GASTOS), anterior: actual.total, nuevo: futuro.total, pct };
}

// ── Finanzas / Balance ──
export function ingresosDerivados(periodo: string | null | undefined, GASTOS: Gasto[], PAGOS: Pago[]): number {
  return recaudadoPorPeriodo(periodo, GASTOS, PAGOS);
}

export function egresosMes(periodo: string | null | undefined, FLUJO: Movimiento[]): number {
  return FLUJO.filter((f) => f.tipo === 'Egreso' && mesDeFecha(f.fecha) === periodo).reduce((s, f) => s + num(f.monto), 0);
}

export function ingresosMes(periodo: string | null | undefined, GASTOS: Gasto[], FLUJO: Movimiento[], PAGOS: Pago[]): number {
  const cuotas = recaudadoPorPeriodo(periodo, GASTOS, PAGOS);
  const manual = FLUJO.filter((f) => f.tipo === 'Ingreso' && mesDeFecha(f.fecha) === periodo).reduce((s, f) => s + num(f.monto), 0);
  return cuotas + manual;
}

export function periodosFinanzas(GASTOS: Gasto[], FLUJO: Movimiento[]): string[] {
  const set: Record<string, boolean> = {};
  GASTOS.forEach((g) => { if (g.periodo) set[g.periodo] = true; });
  FLUJO.forEach((f) => { const m = mesDeFecha(f.fecha); if (m) set[m] = true; });
  return Object.keys(set).sort().reverse();
}

export function saldoPeriodo(periodo: string | null | undefined, GASTOS: Gasto[], FLUJO: Movimiento[], PAGOS: Pago[]): number {
  return ingresosMes(periodo, GASTOS, FLUJO, PAGOS) - egresosMes(periodo, FLUJO);
}

// ── Deuda por parcela ──
export function deudaParcela(parcela_id: string, GASTOS: Gasto[], PAGOS: Pago[]): number {
  let cuotas = 0, pagado = 0;
  GASTOS.forEach((g) => {
    if (g.parcela_id !== parcela_id) return;
    cuotas += num(g.monto);
    if (pagoLegado(g, PAGOS)) pagado += num(g.monto);
  });
  pagado += pagosDeParcela(parcela_id, PAGOS).reduce((s, p) => s + num(p.monto), 0);
  return Math.max(0, cuotas - pagado);
}

export function deudaPorPeriodo(parcela_id: string, GASTOS: Gasto[], PAGOS: Pago[]): { periodo: string; monto: number }[] {
  const cuotas: Record<string, number> = {};
  const pagado: Record<string, number> = {};
  GASTOS.forEach((g) => {
    if (g.parcela_id !== parcela_id) return;
    const p = g.periodo || '';
    cuotas[p] = (cuotas[p] || 0) + num(g.monto);
    if (pagoLegado(g, PAGOS)) pagado[p] = (pagado[p] || 0) + num(g.monto);
  });
  pagosDeParcela(parcela_id, PAGOS).forEach((pg) => {
    const p = pg.periodo || '';
    pagado[p] = (pagado[p] || 0) + num(pg.monto);
  });

  let excedente = 0;
  const res: { periodo: string; monto: number }[] = [];
  Object.keys(cuotas).sort().forEach((p) => {
    const saldo = cuotas[p] - (pagado[p] || 0);
    if (saldo < 0) {
      excedente += -saldo;
    } else if (saldo > 0) {
      res.push({ periodo: p, monto: saldo });
    }
  });
  for (let i = res.length - 1; i >= 0 && excedente > 0; i--) {
    const ab = Math.min(res[i].monto, excedente);
    res[i].monto -= ab;
    excedente -= ab;
  }
  return res.filter((d) => d.monto > 0);
}

export function periodosPendientes(parcela_id: string, GASTOS: Gasto[], PAGOS: Pago[]): string[] {
  return deudaPorPeriodo(parcela_id, GASTOS, PAGOS).map((d) => d.periodo);
}

export function estadoParcelaPago(parcela_id: string, GASTOS: Gasto[], PAGOS: Pago[]): 'Al día' | 'Deudor' {
  return deudaParcela(parcela_id, GASTOS, PAGOS) <= 0 ? 'Al día' : 'Deudor';
}

export function morosos(GASTOS: Gasto[], PARCELAS: Parcela[], PAGOS: Pago[]): { parcela_id: string; numero: string; deuda: number }[] {
  const seen: Record<string, boolean> = {};
  GASTOS.forEach((g) => { if (g.parcela_id) seen[g.parcela_id] = true; });
  return Object.keys(seen)
    .map((pid) => {
      const p = PARCELAS.find((x) => x.id === pid);
      return { parcela_id: pid, numero: p ? p.numero : pid, deuda: deudaParcela(pid, GASTOS, PAGOS) };
    })
    .filter((m) => m.deuda > 0)
    .sort((a, b) => numeroDeParcela(a.numero) - numeroDeParcela(b.numero));
}

// ── Generación de cuotas ──
export function buildCuotasRows(
  data: { periodo: string; monto: number | string; fondo_reserva: number | string },
  GASTOS: Gasto[],
  PARCELAS: Parcela[],
): Partial<Gasto>[] {
  const periodo = String(data.periodo || '');
  const monto = num(data.monto);
  const fondo = num(data.fondo_reserva);
  const parts = periodo.split('-');
  const usadas: Record<string, boolean> = {};
  GASTOS.forEach((g) => { if (g.periodo === periodo) usadas[g.parcela_id] = true; });
  const rows: Partial<Gasto>[] = [];
  PARCELAS.forEach((p) => {
    if (usadas[p.id]) return;
    if (monto > 0) {
      rows.push({
        parcela_id: p.id,
        periodo,
        concepto: 'GC_' + parts[1] + '_' + parts[0],
        monto,
        descripcion: 'Cuota ' + formatPeriodoLocal(periodo),
        pagado: 'No',
      });
    }
    if (fondo > 0) {
      rows.push({
        parcela_id: p.id,
        periodo,
        concepto: 'GC_FR_' + parts[1] + '_' + parts[0],
        monto: fondo,
        descripcion: 'Fondo reserva ' + formatPeriodoLocal(periodo),
        pagado: 'No',
      });
    }
  });
  return rows;
}

function formatPeriodoLocal(p: string): string {
  const parts = p.split('-');
  if (parts.length >= 2) return parts[1] + '/' + parts[0];
  return p;
}
