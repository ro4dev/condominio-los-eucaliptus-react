import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadFinanzasData, type FinanzasData } from '../lib/data';
import { supabaseClient } from '../lib/supabase';
import { getDemoMode, generateUUID } from '../lib';
import type { Asamblea, AsambleaAsistente, Config, Documento, Encuesta, Gasto, Noticia, Pago, Parcela, Propietario, Proveedor, Publicacion, Reclamo, VotoEncuesta } from '../lib/types';
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
  saveNoticia: (data: Partial<Noticia>, isEdit: boolean) => Promise<boolean>;
  deleteNoticia: (id: string) => Promise<void>;
  toggleNoticiaPinned: (id: string) => Promise<void>;
  saveDocumento: (data: Partial<Documento>, isEdit: boolean) => Promise<boolean>;
  deleteDocumento: (id: string) => Promise<void>;
  saveReclamo: (data: Partial<Reclamo>) => Promise<boolean>;
  deleteReclamo: (id: string) => Promise<void>;
  saveProveedor: (data: Partial<Proveedor>, isEdit: boolean) => Promise<boolean>;
  deleteProveedor: (id: string) => Promise<void>;
  saveAsamblea: (data: Partial<Asamblea>, asistenteIds: string[]) => Promise<boolean>;
  deleteAsamblea: (id: string) => Promise<void>;
  saveEncuesta: (data: Partial<Encuesta>, isEdit: boolean) => Promise<boolean>;
  deleteEncuesta: (id: string) => Promise<void>;
  registrarVoto: (encuestaId: string, parcelaId: string, seleccion: string) => Promise<boolean>;
  savePublicacion: (data: Partial<Publicacion>, isEdit: boolean) => Promise<boolean>;
  deletePublicacion: (id: string) => Promise<void>;
  saveConfigValue: (key: keyof Config, value: unknown) => Promise<boolean>;
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

  const saveNoticia = useCallback(
    async (payload: Partial<Noticia>, isEdit: boolean): Promise<boolean> => {
      if (!data) return false;
      if (demoMode) {
        if (isEdit && payload.id) {
          setData({ ...data, noticias: data.noticias.map((n) => (n.id === payload.id ? { ...n, ...payload } : n)) });
        } else {
          const nuevo: Noticia = { ...(payload as Partial<Noticia>), id: generateUUID() } as Noticia;
          setData({ ...data, noticias: [...data.noticias, nuevo] });
        }
        showSnackbar(isEdit ? 'Noticia actualizada.' : 'Noticia creada.', 'success');
        return true;
      }
      if (!supabaseClient) return false;
      if (isEdit && payload.id) {
        const { error } = await supabaseClient.from('noticias').update(payload).eq('id', payload.id);
        if (error) { showSnackbar('Error: ' + error.message, 'error'); return false; }
      } else {
        const { error } = await supabaseClient.from('noticias').insert(payload);
        if (error) { showSnackbar('Error: ' + error.message, 'error'); return false; }
      }
      await reload();
      showSnackbar(isEdit ? 'Noticia actualizada.' : 'Noticia creada.', 'success');
      return true;
    },
    [data, demoMode, reload, showSnackbar],
  );

  const deleteNoticia = useCallback(
    async (id: string): Promise<void> => {
      if (!data) return;
      if (demoMode) {
        setData({ ...data, noticias: data.noticias.filter((n) => n.id !== id) });
        showSnackbar('Noticia eliminada (demo).', 'success');
        return;
      }
      if (!supabaseClient) return;
      const { error } = await supabaseClient.from('noticias').delete().eq('id', id);
      if (error) { showSnackbar('Error: ' + error.message, 'error'); return; }
      await reload();
      showSnackbar('Noticia eliminada.', 'success');
    },
    [data, demoMode, reload, showSnackbar],
  );

  const toggleNoticiaPinned = useCallback(
    async (id: string): Promise<void> => {
      const n = data?.noticias.find((x) => x.id === id);
      if (!n) return;
      const pinned = !n.pinned;
      await saveNoticia({ id, pinned }, true);
    },
    [data, saveNoticia],
  );

  const saveDocumento = useCallback(
    async (payload: Partial<Documento>, isEdit: boolean): Promise<boolean> => {
      if (!data) return false;
      if (demoMode) {
        if (isEdit && payload.id) {
          setData({ ...data, documentos: data.documentos.map((d) => (d.id === payload.id ? { ...d, ...payload } : d)) });
        } else {
          const nuevo: Documento = { ...(payload as Partial<Documento>), id: generateUUID() } as Documento;
          setData({ ...data, documentos: [...data.documentos, nuevo] });
        }
        showSnackbar(isEdit ? 'Documento actualizado.' : 'Documento agregado.', 'success');
        return true;
      }
      if (!supabaseClient) return false;
      if (isEdit && payload.id) {
        const { error } = await supabaseClient.from('documentos').update(payload).eq('id', payload.id);
        if (error) { showSnackbar('Error: ' + error.message, 'error'); return false; }
      } else {
        const { error } = await supabaseClient.from('documentos').insert(payload);
        if (error) { showSnackbar('Error: ' + error.message, 'error'); return false; }
      }
      await reload();
      showSnackbar(isEdit ? 'Documento actualizado.' : 'Documento agregado.', 'success');
      return true;
    },
    [data, demoMode, reload, showSnackbar],
  );

  const deleteDocumento = useCallback(
    async (id: string): Promise<void> => {
      if (!data) return;
      if (demoMode) {
        setData({ ...data, documentos: data.documentos.filter((d) => d.id !== id) });
        showSnackbar('Documento eliminado (demo).', 'success');
        return;
      }
      if (!supabaseClient) return;
      const { error } = await supabaseClient.from('documentos').delete().eq('id', id);
      if (error) { showSnackbar('Error: ' + error.message, 'error'); return; }
      await reload();
      showSnackbar('Documento eliminado.', 'success');
    },
    [data, demoMode, reload, showSnackbar],
  );

  const saveReclamo = useCallback(
    async (payload: Partial<Reclamo>): Promise<boolean> => {
      if (!data) return false;
      if (demoMode) {
        const nuevo: Reclamo = { ...(payload as Partial<Reclamo>), id: generateUUID() } as Reclamo;
        setData({ ...data, reclamos: [...data.reclamos, nuevo] });
        showSnackbar('Comentario enviado (demo).', 'success');
        return true;
      }
      if (!supabaseClient) return false;
      const { error } = await supabaseClient.from('reclamos').insert(payload);
      if (error) { showSnackbar('Error: ' + error.message, 'error'); return false; }
      await reload();
      showSnackbar('Comentario enviado.', 'success');
      return true;
    },
    [data, demoMode, reload, showSnackbar],
  );

  const deleteReclamo = useCallback(
    async (id: string): Promise<void> => {
      if (!data) return;
      if (demoMode) {
        setData({ ...data, reclamos: data.reclamos.filter((r) => r.id !== id) });
        showSnackbar('Comentario eliminado (demo).', 'success');
        return;
      }
      if (!supabaseClient) return;
      const { error } = await supabaseClient.from('reclamos').delete().eq('id', id);
      if (error) { showSnackbar('Error: ' + error.message, 'error'); return; }
      await reload();
      showSnackbar('Comentario eliminado.', 'success');
    },
    [data, demoMode, reload, showSnackbar],
  );

  const saveProveedor = useCallback(
    async (payload: Partial<Proveedor>, isEdit: boolean): Promise<boolean> => {
      if (!data) return false;
      if (demoMode) {
        if (isEdit && payload.id) {
          setData({ ...data, proveedores: data.proveedores.map((p) => (p.id === payload.id ? { ...p, ...payload } : p)) });
        } else {
          const nuevo: Proveedor = { ...(payload as Partial<Proveedor>), id: generateUUID() } as Proveedor;
          setData({ ...data, proveedores: [...data.proveedores, nuevo] });
        }
        showSnackbar(isEdit ? 'Proveedor actualizado.' : 'Proveedor agregado.', 'success');
        return true;
      }
      if (!supabaseClient) return false;
      if (isEdit && payload.id) {
        const { error } = await supabaseClient.from('proveedores').update(payload).eq('id', payload.id);
        if (error) { showSnackbar('Error: ' + error.message, 'error'); return false; }
      } else {
        const { error } = await supabaseClient.from('proveedores').insert(payload);
        if (error) { showSnackbar('Error: ' + error.message, 'error'); return false; }
      }
      await reload();
      showSnackbar(isEdit ? 'Proveedor actualizado.' : 'Proveedor agregado.', 'success');
      return true;
    },
    [data, demoMode, reload, showSnackbar],
  );

  const deleteProveedor = useCallback(
    async (id: string): Promise<void> => {
      if (!data) return;
      if (demoMode) {
        setData({ ...data, proveedores: data.proveedores.filter((p) => p.id !== id) });
        showSnackbar('Proveedor eliminado (demo).', 'success');
        return;
      }
      if (!supabaseClient) return;
      const { error } = await supabaseClient.from('proveedores').delete().eq('id', id);
      if (error) { showSnackbar('Error: ' + error.message, 'error'); return; }
      await reload();
      showSnackbar('Proveedor eliminado.', 'success');
    },
    [data, demoMode, reload, showSnackbar],
  );

  const saveAsamblea = useCallback(
    async (payload: Partial<Asamblea>, asistenteIds: string[]): Promise<boolean> => {
      if (!data) return false;
      if (demoMode) {
        let asambleas: Asamblea[];
        if (payload.id) {
          asambleas = data.asambleas.map((a) => (a.id === payload.id ? { ...a, ...payload } : a));
        } else {
          asambleas = [...data.asambleas, { ...(payload as Partial<Asamblea>), id: generateUUID() } as Asamblea];
        }
        const idAsamblea = (asambleas.find((a) => a.id === payload.id) || asambleas[asambleas.length - 1]).id;
        const asistentes = (data.asamblea_asistentes || []).filter((a) => a.asamblea_id !== idAsamblea);
        asistenteIds.forEach((pid) => {
          asistentes.push({ id: generateUUID(), asamblea_id: idAsamblea, parcela_id: pid } as AsambleaAsistente);
        });
        setData({ ...data, asambleas, asamblea_asistentes: asistentes });
        showSnackbar(payload.id ? 'Asamblea actualizada.' : 'Asamblea guardada.', 'success');
        return true;
      }
      if (!supabaseClient) return false;
      let asambleaId = payload.id || '';
      if (asambleaId) {
        const { error } = await supabaseClient.from('asambleas').update(payload).eq('id', asambleaId);
        if (error) { showSnackbar('Error: ' + error.message, 'error'); return false; }
      } else {
        const { data: inserted, error } = await supabaseClient.from('asambleas').insert(payload).select('id').single();
        if (error) { showSnackbar('Error: ' + error.message, 'error'); return false; }
        asambleaId = inserted.id;
      }
      const { error: delErr } = await supabaseClient.from('asamblea_asistentes').delete().eq('asamblea_id', asambleaId);
      if (delErr) { showSnackbar('Error: ' + delErr.message, 'error'); return false; }
      if (asistenteIds.length) {
        const rows = asistenteIds.map((pid) => ({ asamblea_id: asambleaId, parcela_id: pid }));
        const { error: insErr } = await supabaseClient.from('asamblea_asistentes').insert(rows);
        if (insErr) { showSnackbar('Error: ' + insErr.message, 'error'); return false; }
      }
      await reload();
      showSnackbar(payload.id ? 'Asamblea actualizada.' : 'Asamblea guardada.', 'success');
      return true;
    },
    [data, demoMode, reload, showSnackbar],
  );

  const deleteAsamblea = useCallback(
    async (id: string): Promise<void> => {
      if (!data) return;
      if (demoMode) {
        setData({
          ...data,
          asambleas: data.asambleas.filter((a) => a.id !== id),
          asamblea_asistentes: (data.asamblea_asistentes || []).filter((a) => a.asamblea_id !== id),
        });
        showSnackbar('Asamblea eliminada (demo).', 'success');
        return;
      }
      if (!supabaseClient) return;
      await supabaseClient.from('asamblea_asistentes').delete().eq('asamblea_id', id);
      const { error } = await supabaseClient.from('asambleas').delete().eq('id', id);
      if (error) { showSnackbar('Error: ' + error.message, 'error'); return; }
      await reload();
      showSnackbar('Asamblea eliminada.', 'success');
    },
    [data, demoMode, reload, showSnackbar],
  );

  const saveEncuesta = useCallback(
    async (payload: Partial<Encuesta>, isEdit: boolean): Promise<boolean> => {
      if (!data) return false;
      if (demoMode) {
        if (isEdit && payload.id) {
          setData({ ...data, encuestas: data.encuestas.map((e) => (e.id === payload.id ? { ...e, ...payload } : e)) });
        } else {
          const nueva: Encuesta = { ...(payload as Partial<Encuesta>), id: generateUUID() } as Encuesta;
          setData({ ...data, encuestas: [...data.encuestas, nueva] });
        }
        showSnackbar(isEdit ? 'Encuesta actualizada.' : 'Encuesta creada.', 'success');
        return true;
      }
      if (!supabaseClient) return false;
      if (isEdit && payload.id) {
        const { error } = await supabaseClient.from('encuestas').update(payload).eq('id', payload.id);
        if (error) { showSnackbar('Error: ' + error.message, 'error'); return false; }
      } else {
        const { error } = await supabaseClient.from('encuestas').insert(payload);
        if (error) { showSnackbar('Error: ' + error.message, 'error'); return false; }
      }
      await reload();
      showSnackbar(isEdit ? 'Encuesta actualizada.' : 'Encuesta creada.', 'success');
      return true;
    },
    [data, demoMode, reload, showSnackbar],
  );

  const deleteEncuesta = useCallback(
    async (id: string): Promise<void> => {
      if (!data) return;
      if (demoMode) {
        setData({
          ...data,
          encuestas: data.encuestas.filter((e) => e.id !== id),
          encuestas_votos: (data.encuestas_votos || []).filter((v) => v.encuesta_id !== id),
        });
        showSnackbar('Encuesta eliminada (demo).', 'success');
        return;
      }
      if (!supabaseClient) return;
      await supabaseClient.from('encuestas_votos').delete().eq('encuesta_id', id);
      const { error } = await supabaseClient.from('encuestas').delete().eq('id', id);
      if (error) { showSnackbar('Error: ' + error.message, 'error'); return; }
      await reload();
      showSnackbar('Encuesta eliminada.', 'success');
    },
    [data, demoMode, reload, showSnackbar],
  );

  const registrarVoto = useCallback(
    async (encuestaId: string, parcelaId: string, seleccion: string): Promise<boolean> => {
      if (!data) return false;
      if (demoMode) {
        const nuevo: VotoEncuesta = {
          id: generateUUID(),
          encuesta_id: encuestaId,
          parcela_id: parcelaId,
          seleccion,
          created_at: new Date().toISOString(),
        };
        setData({ ...data, encuestas_votos: [...(data.encuestas_votos || []), nuevo] });
        showSnackbar('Voto registrado (demo).', 'success');
        return true;
      }
      if (!supabaseClient) return false;
      const { error } = await supabaseClient.from('encuestas_votos').insert({
        encuesta_id: encuestaId,
        parcela_id: parcelaId,
        seleccion,
      });
      if (error) { showSnackbar('Error: ' + error.message, 'error'); return false; }
      await reload();
      showSnackbar('Voto registrado.', 'success');
      return true;
    },
    [data, demoMode, reload, showSnackbar],
  );

  const savePublicacion = useCallback(
    async (payload: Partial<Publicacion>, isEdit: boolean): Promise<boolean> => {
      if (!data) return false;
      if (demoMode) {
        if (isEdit && payload.id) {
          setData({ ...data, publicaciones: data.publicaciones.map((p) => (p.id === payload.id ? { ...p, ...payload } : p)) });
        } else {
          const nueva: Publicacion = { ...(payload as Partial<Publicacion>), id: generateUUID() } as Publicacion;
          setData({ ...data, publicaciones: [...data.publicaciones, nueva] });
        }
        showSnackbar(isEdit ? 'Publicación actualizada.' : 'Publicación publicada.', 'success');
        return true;
      }
      if (!supabaseClient) return false;
      if (isEdit && payload.id) {
        const { error } = await supabaseClient.from('publicaciones').update(payload).eq('id', payload.id);
        if (error) { showSnackbar('Error: ' + error.message, 'error'); return false; }
      } else {
        const { error } = await supabaseClient.from('publicaciones').insert(payload);
        if (error) { showSnackbar('Error: ' + error.message, 'error'); return false; }
      }
      await reload();
      showSnackbar(isEdit ? 'Publicación actualizada.' : 'Publicación publicada.', 'success');
      return true;
    },
    [data, demoMode, reload, showSnackbar],
  );

  const deletePublicacion = useCallback(
    async (id: string): Promise<void> => {
      if (!data) return;
      if (demoMode) {
        setData({ ...data, publicaciones: data.publicaciones.filter((p) => p.id !== id) });
        showSnackbar('Publicación eliminada (demo).', 'success');
        return;
      }
      if (!supabaseClient) return;
      const { error } = await supabaseClient.from('publicaciones').delete().eq('id', id);
      if (error) { showSnackbar('Error: ' + error.message, 'error'); return; }
      await reload();
      showSnackbar('Publicación eliminada.', 'success');
    },
    [data, demoMode, reload, showSnackbar],
  );

  const saveConfigValue = useCallback(
    async (key: keyof Config, value: unknown): Promise<boolean> => {
      if (!data) return false;
      if (demoMode) {
        setData({ ...data, config: { ...data.config, [key]: value } });
        return true;
      }
      if (!supabaseClient) return false;
      const { error } = await supabaseClient.from('config').upsert({ key, value });
      if (error) { showSnackbar('Error: ' + error.message, 'error'); return false; }
      return true;
    },
    [data, demoMode, showSnackbar],
  );

  const value = useMemo<DataContextValue>(() => {
    return {
      gastos: data?.gastos ?? [],
      pagos: data?.pagos ?? [],
      flujo: data?.flujo ?? [],
      parcelas: data?.parcelas ?? [],
      propietarios: data?.propietarios ?? [],
      noticias: data?.noticias ?? [],
      documentos: data?.documentos ?? [],
      reclamos: data?.reclamos ?? [],
      proveedores: data?.proveedores ?? [],
      asambleas: data?.asambleas ?? [],
      asamblea_asistentes: data?.asamblea_asistentes ?? [],
      encuestas: data?.encuestas ?? [],
      encuestas_votos: data?.encuestas_votos ?? [],
      publicaciones: data?.publicaciones ?? [],
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
      saveNoticia,
      deleteNoticia,
      toggleNoticiaPinned,
      saveDocumento,
      deleteDocumento,
      saveReclamo,
      deleteReclamo,
      saveProveedor,
      deleteProveedor,
      saveAsamblea,
      deleteAsamblea,
      saveEncuesta,
      deleteEncuesta,
      registrarVoto,
      savePublicacion,
      deletePublicacion,
      saveConfigValue,
    };
  }, [data, loading, reload, saveGasto, deleteGasto, savePago, deletePago, savePeriodos, generarCuotas, saveParcela, deleteParcela, savePropietario, deletePropietario, saveNoticia, deleteNoticia, toggleNoticiaPinned, saveDocumento, deleteDocumento, saveReclamo, deleteReclamo, saveProveedor, deleteProveedor, saveAsamblea, deleteAsamblea, saveEncuesta, deleteEncuesta, registrarVoto, savePublicacion, deletePublicacion, saveConfigValue]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData debe usarse dentro de DataProvider');
  return ctx;
}
