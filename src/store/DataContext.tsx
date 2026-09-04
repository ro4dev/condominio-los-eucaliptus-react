import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadFinanzasData, type FinanzasData } from '../lib/data';
import { supabaseClient } from '../lib/supabase';
import { getDemoMode, generateUUID } from '../lib';
import type { Config, Gasto, Pago, Parcela, Propietario } from '../lib/types';
import { useApp } from './AppContext';

export interface GastoSave extends Partial<Gasto> {}

interface DataContextValue extends FinanzasData {
  loading: boolean;
  reload: () => Promise<void>;
  saveGasto: (data: GastoSave, isEdit: boolean) => Promise<boolean>;
  deleteGasto: (id: string) => Promise<void>;
  savePago: (data: Partial<Pago>) => Promise<boolean>;
  deletePago: (id: string) => Promise<void>;
  savePeriodos: (periodos: Config['periodos']) => Promise<boolean>;
  generarCuotas: (periodo: string, monto: number | string, fondo: number | string) => Promise<number>;
  saveParcela: (data: Partial<Parcela>, isEdit: boolean) => Promise<boolean>;
  deleteParcela: (id: string) => Promise<void>;
  savePropietario: (data: Partial<Propietario>, isEdit: boolean) => Promise<boolean>;
  deletePropietario: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { showSnackbar } = useApp();
  const [data, setData] = useState<FinanzasData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const demoMode = getDemoMode();

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const d = await loadFinanzasData();
      setData(d);
    } catch (e) {
      console.error('Error cargando datos', e);
      showSnackbar('Error al cargar los datos.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    reload();
  }, [reload]);

  const saveGasto = useCallback(
    async (payload: GastoSave, isEdit: boolean): Promise<boolean> => {
      if (!data) return false;
      if (demoMode) {
        if (isEdit && payload.id) {
          setData({
            ...data,
            gastos: data.gastos.map((g) => (g.id === payload.id ? { ...g, ...payload } : g)),
          });
          showSnackbar('Actualizado correctamente.', 'success');
        } else {
          const nuevo: Gasto = {
            ...(payload as Partial<Gasto>),
            id: generateUUID(),
          } as Gasto;
          setData({ ...data, gastos: [...data.gastos, nuevo] });
          showSnackbar('Guardado correctamente.', 'success');
        }
        return true;
      }
      if (!supabaseClient) return false;
      if (isEdit && payload.id) {
        const { error } = await supabaseClient.from('gastos').update(payload).eq('id', payload.id);
        if (error) { showSnackbar('Error: ' + error.message, 'error'); return false; }
      } else {
        const { error } = await supabaseClient.from('gastos').insert(payload);
        if (error) { showSnackbar('Error: ' + error.message, 'error'); return false; }
      }
      await reload();
      showSnackbar(isEdit ? 'Actualizado correctamente.' : 'Guardado correctamente.', 'success');
      return true;
    },
    [data, demoMode, reload, showSnackbar],
  );

  const deleteGasto = useCallback(
    async (id: string): Promise<void> => {
      if (!data) return;
      if (demoMode) {
        setData({ ...data, gastos: data.gastos.filter((g) => g.id !== id) });
        showSnackbar('Eliminado (demo).', 'success');
        return;
      }
      if (!supabaseClient) return;
      const { error } = await supabaseClient.from('gastos').delete().eq('id', id);
      if (error) { showSnackbar('Error: ' + error.message, 'error'); return; }
      await reload();
      showSnackbar('Eliminado correctamente.', 'success');
    },
    [data, demoMode, reload, showSnackbar],
  );

  const savePago = useCallback(
    async (payload: Partial<Pago>): Promise<boolean> => {
      if (!data) return false;
      if (demoMode) {
        const nuevo: Pago = { ...payload, id: generateUUID() } as Pago;
        setData({ ...data, pagos: [...data.pagos, nuevo] });
        showSnackbar('Pago registrado (demo).', 'success');
        return true;
      }
      if (!supabaseClient) return false;
      const insert = { ...payload, monto: parseFloat(String(payload.monto)) || 0 };
      const { error } = await supabaseClient.from('pagos').insert(insert);
      if (error) { showSnackbar('Error: ' + error.message, 'error'); return false; }
      await reload();
      showSnackbar('Pago registrado.', 'success');
      return true;
    },
    [data, demoMode, reload, showSnackbar],
  );

  const deletePago = useCallback(
    async (id: string): Promise<void> => {
      if (!data) return;
      if (demoMode) {
        setData({ ...data, pagos: data.pagos.filter((p) => p.id !== id) });
        showSnackbar('Pago eliminado (demo).', 'success');
        return;
      }
      if (!supabaseClient) return;
      const { error } = await supabaseClient.from('pagos').delete().eq('id', id);
      if (error) { showSnackbar('Error: ' + error.message, 'error'); return; }
      await reload();
      showSnackbar('Pago eliminado.', 'success');
    },
    [data, demoMode, reload, showSnackbar],
  );

  const savePeriodos = useCallback(
    async (periodos: Config['periodos']): Promise<boolean> => {
      if (!data) return false;
      if (demoMode) {
        setData({ ...data, config: { ...data.config, periodos } });
        return true;
      }
      if (!supabaseClient) return false;
      const { error } = await supabaseClient.from('config').upsert({ key: 'periodos', value: periodos });
      if (error) { showSnackbar('Error: ' + error.message, 'error'); return false; }
      return true;
    },
    [data, demoMode, showSnackbar],
  );

  const generarCuotas = useCallback(
    async (periodo: string, monto: number | string, fondo: number | string): Promise<number> => {
      if (!data) return 0;
      if (demoMode) {
        const filas = data.gastos.filter((g) => g.periodo === periodo).map((g) => g.parcela_id);
        const m = parseFloat(String(monto)) || 0;
        const f = parseFloat(String(fondo)) || 0;
        const parts = periodo.split('-');
        const nuevas: Gasto[] = [];
        data.parcelas.forEach((p) => {
          if (filas.includes(p.id)) return;
          if (m > 0) nuevas.push({
            id: generateUUID(),
            parcela_id: p.id,
            periodo,
            concepto: 'GC_' + parts[1] + '_' + parts[0],
            monto: m,
            descripcion: 'Cuota ' + parts[1] + '/' + parts[0],
            pagado: 'No',
          } as Gasto);
          if (f > 0) nuevas.push({
            id: generateUUID(),
            parcela_id: p.id,
            periodo,
            concepto: 'GC_FR_' + parts[1] + '_' + parts[0],
            monto: f,
            descripcion: 'Fondo reserva ' + parts[1] + '/' + parts[0],
            pagado: 'No',
          } as Gasto);
        });
        if (nuevas.length) setData({ ...data, gastos: [...data.gastos, ...nuevas] });
        return nuevas.length;
      }
      return 0;
    },
    [data],
  );

  const saveParcela = useCallback(
    async (payload: Partial<Parcela>, isEdit: boolean): Promise<boolean> => {
      if (!data) return false;
      if (demoMode) {
        if (isEdit && payload.id) {
          setData({ ...data, parcelas: data.parcelas.map((p) => (p.id === payload.id ? { ...p, ...payload } : p)) });
        } else {
          const nuevo: Parcela = { ...(payload as Partial<Parcela>), id: generateUUID() } as Parcela;
          setData({ ...data, parcelas: [...data.parcelas, nuevo] });
        }
        showSnackbar(isEdit ? 'Parcela actualizada.' : 'Parcela agregada.', 'success');
        return true;
      }
      if (!supabaseClient) return false;
      if (isEdit && payload.id) {
        const { error } = await supabaseClient.from('parcelas').update(payload).eq('id', payload.id);
        if (error) { showSnackbar('Error: ' + error.message, 'error'); return false; }
      } else {
        const { error } = await supabaseClient.from('parcelas').insert(payload);
        if (error) { showSnackbar('Error: ' + error.message, 'error'); return false; }
      }
      await reload();
      showSnackbar(isEdit ? 'Parcela actualizada.' : 'Parcela agregada.', 'success');
      return true;
    },
    [data, demoMode, reload, showSnackbar],
  );

  const deleteParcela = useCallback(
    async (id: string): Promise<void> => {
      if (!data) return;
      if (demoMode) {
        setData({ ...data, parcelas: data.parcelas.filter((p) => p.id !== id) });
        showSnackbar('Parcela eliminada (demo).', 'success');
        return;
      }
      if (!supabaseClient) return;
      const { error } = await supabaseClient.from('parcelas').delete().eq('id', id);
      if (error) { showSnackbar('Error: ' + error.message, 'error'); return; }
      await reload();
      showSnackbar('Parcela eliminada.', 'success');
    },
    [data, demoMode, reload, showSnackbar],
  );

  const savePropietario = useCallback(
    async (payload: Partial<Propietario>, isEdit: boolean): Promise<boolean> => {
      if (!data) return false;
      if (demoMode) {
        if (isEdit && payload.id) {
          setData({ ...data, propietarios: data.propietarios.map((p) => (p.id === payload.id ? { ...p, ...payload } : p)) });
        } else {
          const nuevo: Propietario = { ...(payload as Partial<Propietario>), id: generateUUID() } as Propietario;
          setData({ ...data, propietarios: [...data.propietarios, nuevo] });
        }
        showSnackbar(isEdit ? 'Propietario actualizado.' : 'Propietario agregado.', 'success');
        return true;
      }
      if (!supabaseClient) return false;
      if (isEdit && payload.id) {
        const { error } = await supabaseClient.from('propietarios').update(payload).eq('id', payload.id);
        if (error) { showSnackbar('Error: ' + error.message, 'error'); return false; }
      } else {
        const { error } = await supabaseClient.from('propietarios').insert(payload);
        if (error) { showSnackbar('Error: ' + error.message, 'error'); return false; }
      }
      await reload();
      showSnackbar(isEdit ? 'Propietario actualizado.' : 'Propietario agregado.', 'success');
      return true;
    },
    [data, demoMode, reload, showSnackbar],
  );

  const deletePropietario = useCallback(
    async (id: string): Promise<void> => {
      if (!data) return;
      if (demoMode) {
        setData({ ...data, propietarios: data.propietarios.filter((p) => p.id !== id) });
        showSnackbar('Propietario eliminado (demo).', 'success');
        return;
      }
      if (!supabaseClient) return;
      const { error } = await supabaseClient.from('propietarios').delete().eq('id', id);
      if (error) { showSnackbar('Error: ' + error.message, 'error'); return; }
      await reload();
      showSnackbar('Propietario eliminado.', 'success');
    },
    [data, demoMode, reload, showSnackbar],
  );

  const value = useMemo<DataContextValue>(() => {
    return {
      gastos: data?.gastos ?? [],
      pagos: data?.pagos ?? [],
      flujo: data?.flujo ?? [],
      parcelas: data?.parcelas ?? [],
      propietarios: data?.propietarios ?? [],
      config: data?.config ?? {},
      loading,
      reload,
      saveGasto,
      deleteGasto,
      savePago,
      deletePago,
      savePeriodos,
      generarCuotas,
      saveParcela,
      deleteParcela,
      savePropietario,
      deletePropietario,
    };
  }, [data, loading, reload, saveGasto, deleteGasto, savePago, deletePago, savePeriodos, generarCuotas, saveParcela, deleteParcela, savePropietario, deletePropietario]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData debe usarse dentro de DataProvider');
  return ctx;
}
