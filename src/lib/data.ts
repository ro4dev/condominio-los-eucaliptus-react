import type { Config, Gasto, Movimiento, Noticia, Pago, Parcela, Propietario } from './types';
import { getDemoMode } from './appConfig';
import { supabaseClient } from './supabase';

// Data layer: carga datos desde modo demo (JSON en public/data) o desde Supabase.
// Equivalente a data.js del original, pero reactivo en vez de globals.

type Key = 'GASTOS' | 'PAGOS' | 'FLUJO' | 'PARCELAS' | 'PROPIETARIOS' | 'NOTICIAS'
  | 'RECLAMOS' | 'PROVEEDORES' | 'ASAMBLEAS' | 'ASAMBLEA_ASISTENTES'
  | 'ENCUESTAS' | 'ENCUESTAS_VOTOS' | 'PUBLICACIONES';

const DEMO_FILES: Record<Key, string> = {
  GASTOS: 'data/gastos.json',
  PAGOS: 'data/pagos.json',
  FLUJO: 'data/ingresos_egresos.json',
  PARCELAS: 'data/parcelas.json',
  PROPIETARIOS: 'data/propietarios.json',
  NOTICIAS: 'data/noticias.json',
  RECLAMOS: 'data/reclamos.json',
  PROVEEDORES: 'data/proveedores.json',
  ASAMBLEAS: 'data/asambleas.json',
  ASAMBLEA_ASISTENTES: 'data/asamblea_asistentes.json',
  ENCUESTAS: 'data/encuestas.json',
  ENCUESTAS_VOTOS: 'data/encuestas_votos.json',
  PUBLICACIONES: 'data/publicaciones.json',
};

const TABLE_MAP: Record<Key, string> = {
  GASTOS: 'gastos',
  PAGOS: 'pagos',
  FLUJO: 'flujo',
  PARCELAS: 'parcelas',
  PROPIETARIOS: 'propietarios',
  NOTICIAS: 'noticias',
  RECLAMOS: 'reclamos',
  PROVEEDORES: 'proveedores',
  ASAMBLEAS: 'asambleas',
  ASAMBLEA_ASISTENTES: 'asamblea_asistentes',
  ENCUESTAS: 'encuestas',
  ENCUESTAS_VOTOS: 'encuestas_votos',
  PUBLICACIONES: 'publicaciones',
};

export function datosKeyToTable(key: Key): string {
  return TABLE_MAP[key];
}

export async function loadJson(key: Key): Promise<unknown[]> {
  const demoMode = getDemoMode();
  if (demoMode) {
    const res = await fetch(DEMO_FILES[key], { cache: 'no-store' });
    if (!res.ok) throw new Error('Error cargando ' + key);
    return (await res.json()) as unknown[];
  }
  if (!supabaseClient) return [];
  const table = TABLE_MAP[key];
  const { data, error } = await supabaseClient.from(table).select('*');
  if (error) throw error;
  return (data as unknown[]) || [];
}

export async function loadConfig(): Promise<Config> {
  const demoMode = getDemoMode();
  if (demoMode) {
    const res = await fetch('data/config.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Error cargando config');
    return (await res.json()) as Config;
  }
  if (!supabaseClient) return {};
  const { data, error } = await supabaseClient.from('config').select('key, value');
  if (error) throw error;
  const cfg: Config = {};
  (data as { key: string; value: unknown }[]).forEach((row) => {
    (cfg as Record<string, unknown>)[row.key] = row.value;
  });
  return cfg;
}

export interface FinanzasData {
  gastos: Gasto[];
  pagos: Pago[];
  flujo: Movimiento[];
  parcelas: Parcela[];
  propietarios: Propietario[];
  noticias: Noticia[];
  config: Config;
}

export async function loadFinanzasData(): Promise<FinanzasData> {
  const [gastos, pagos, flujo, parcelas, propietarios, noticias, config] = await Promise.all([
    loadJson('GASTOS'),
    loadJson('PAGOS'),
    loadJson('FLUJO'),
    loadJson('PARCELAS'),
    loadJson('PROPIETARIOS'),
    loadJson('NOTICIAS'),
    loadConfig(),
  ]);
  return {
    gastos: gastos as Gasto[],
    pagos: pagos as Pago[],
    flujo: flujo as Movimiento[],
    parcelas: parcelas as Parcela[],
    propietarios: propietarios as Propietario[],
    noticias: noticias as Noticia[],
    config,
  };
}
