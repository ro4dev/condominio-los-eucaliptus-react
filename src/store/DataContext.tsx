import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadFinanzasData, type FinanzasData } from '../lib/data';
import { supabaseClient } from '../lib/supabase';
import { getDemoMode, generateUUID, sanitizeAudit } from '../lib';
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
  const { showSnackbar, currentUserEmail } = useApp();
  const [data, setData] = useState<FinanzasData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const demoMode = getDemoMode();

  const logAudit = useCallback(
    async (tabla: string, accion: 'INSERT' | 'UPDATE' | 'DELETE', registro?: unknown) => {
      const r = (registro || {}) as unknown as Record<string, unknown>;
      const entry = {
        tabla,
        accion,
        registro_id: r.id != null ? String(r.id) : null,
        datos: sanitizeAudit(r),
        usuario: currentUserEmail || 'anónimo',
      };
      if (demoMode) {
        setData((prev) =>
          prev
            ? { ...prev, audit_log: [{ ...entry, created_at: new Date().toISOString() }, ...prev.audit_log] }
            : prev,
        );
        return;
      }
      if (!supabaseClient) return;
      const { error } = await supabaseClient.from('audit_log').insert(entry);
      if (error) console.error('logAudit:', error);
    },
    [currentUserEmail, demoMode],
  );

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
          const actualizado = data.gastos.map((g) => (g.id === payload.id ? { ...g, ...payload } : g));
          setData({ ...data, gastos: actualizado });
          showSnackbar('Actualizado correctamente.', 'success');
          await logAudit('gastos', 'UPDATE', actualizado.find((g) => g.id === payload.id) );
        } else {
          const nuevo: Gasto = {
            ...(payload as Partial<Gasto>),
            id: generateUUID(),
          } as Gasto;
          setData({ ...data, gastos: [...data.gastos, nuevo] });
          showSnackbar('Guardado correctamente.', 'success');
          await logAudit('gastos', 'INSERT', nuevo );
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
      await logAudit('gastos', isEdit ? 'UPDATE' : 'INSERT', payload );
      await reload();
      showSnackbar(isEdit ? 'Actualizado correctamente.' : 'Guardado correctamente.', 'success');
      return true;
    },
    [data, demoMode, reload, showSnackbar, logAudit],
  );

  const deleteGasto = useCallback(
    async (id: string): Promise<void> => {
      if (!data) return;
      if (demoMode) {
        setData({ ...data, gastos: data.gastos.filter((g) => g.id !== id) });
        showSnackbar('Eliminado (demo).', 'success');
        await logAudit('gastos', 'DELETE', { id });
        return;
      }
      if (!supabaseClient) return;
      const { error } = await supabaseClient.from('gastos').delete().eq('id', id);
      if (error) { showSnackbar('Error: ' + error.message, 'error'); return; }
      await logAudit('gastos', 'DELETE', { id });
      await reload();
      showSnackbar('Eliminado correctamente.', 'success');
    },
    [data, demoMode, reload, showSnackbar, logAudit],
  );

  const savePago = useCallback(
    async (payload: Partial<Pago>): Promise<boolean> => {
      if (!data) return false;
      if (demoMode) {
        const nuevo: Pago = { ...payload, id: generateUUID() } as Pago;
        setData({ ...data, pagos: [...data.pagos, nuevo] });
        showSnackbar('Pago registrado (demo).', 'success');
        await logAudit('pagos', 'INSERT', nuevo );
        return true;
      }
      if (!supabaseClient) return false;
      const insert = { ...payload, monto: parseFloat(String(payload.monto)) || 0 };
      const { error } = await supabaseClient.from('pagos').insert(insert);
      if (error) { showSnackbar('Error: ' + error.message, 'error'); return false; }
      await logAudit('pagos', 'INSERT', insert );
      await reload();
      showSnackbar('Pago registrado.', 'success');
      return true;
    },
    [data, demoMode, reload, showSnackbar, logAudit],
  );

  const deletePago = useCallback(
    async (id: string): Promise<void> => {
      if (!data) return;
      if (demoMode) {
        setData({ ...data, pagos: data.pagos.filter((p) => p.id !== id) });
        showSnackbar('Pago eliminado (demo).', 'success');
        await logAudit('pagos', 'DELETE', { id });
        return;
      }
      if (!supabaseClient) return;
      const { error } = await supabaseClient.from('pagos').delete().eq('id', id);
      if (error) { showSnackbar('Error: ' + error.message, 'error'); return; }
      await logAudit('pagos', 'DELETE', { id });
      await reload();
      showSnackbar('Pago eliminado.', 'success');
    },
    [data, demoMode, reload, showSnackbar, logAudit],
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
          const actualizado = data.parcelas.map((p) => (p.id === payload.id ? { ...p, ...payload } : p));
          setData({ ...data, parcelas: actualizado });
          await logAudit('parcelas', 'UPDATE', actualizado.find((p) => p.id === payload.id) );
        } else {
          const nuevo: Parcela = { ...(payload as Partial<Parcela>), id: generateUUID() } as Parcela;
          setData({ ...data, parcelas: [...data.parcelas, nuevo] });
          await logAudit('parcelas', 'INSERT', nuevo );
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
      await logAudit('parcelas', isEdit ? 'UPDATE' : 'INSERT', payload );
      await reload();
      showSnackbar(isEdit ? 'Parcela actualizada.' : 'Parcela agregada.', 'success');
      return true;
    },
    [data, demoMode, reload, showSnackbar, logAudit],
  );

  const deleteParcela = useCallback(
    async (id: string): Promise<void> => {
      if (!data) return;
      if (demoMode) {
        setData({ ...data, parcelas: data.parcelas.filter((p) => p.id !== id) });
        showSnackbar('Parcela eliminada (demo).', 'success');
        await logAudit('parcelas', 'DELETE', { id });
        return;
      }
      if (!supabaseClient) return;
      const { error } = await supabaseClient.from('parcelas').delete().eq('id', id);
      if (error) { showSnackbar('Error: ' + error.message, 'error'); return; }
      await logAudit('parcelas', 'DELETE', { id });
      await reload();
      showSnackbar('Parcela eliminada.', 'success');
    },
    [data, demoMode, reload, showSnackbar, logAudit],
  );

  const savePropietario = useCallback(
    async (payload: Partial<Propietario>, isEdit: boolean): Promise<boolean> => {
      if (!data) return false;
      if (demoMode) {
        if (isEdit && payload.id) {
          const actualizado = data.propietarios.map((p) => (p.id === payload.id ? { ...p, ...payload } : p));
          setData({ ...data, propietarios: actualizado });
          await logAudit('propietarios', 'UPDATE', actualizado.find((p) => p.id === payload.id) );
        } else {
          const nuevo: Propietario = { ...(payload as Partial<Propietario>), id: generateUUID() } as Propietario;
          setData({ ...data, propietarios: [...data.propietarios, nuevo] });
          await logAudit('propietarios', 'INSERT', nuevo );
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
      await logAudit('propietarios', isEdit ? 'UPDATE' : 'INSERT', payload );
      await reload();
      showSnackbar(isEdit ? 'Propietario actualizado.' : 'Propietario agregado.', 'success');
      return true;
    },
    [data, demoMode, reload, showSnackbar, logAudit],
  );

  const deletePropietario = useCallback(
    async (id: string): Promise<void> => {
      if (!data) return;
      if (demoMode) {
        setData({ ...data, propietarios: data.propietarios.filter((p) => p.id !== id) });
        showSnackbar('Propietario eliminado (demo).', 'success');
        await logAudit('propietarios', 'DELETE', { id });
        return;
      }
      if (!supabaseClient) return;
      const { error } = await supabaseClient.from('propietarios').delete().eq('id', id);
      if (error) { showSnackbar('Error: ' + error.message, 'error'); return; }
      await logAudit('propietarios', 'DELETE', { id });
      await reload();
      showSnackbar('Propietario eliminado.', 'success');
    },
    [data, demoMode, reload, showSnackbar, logAudit],
  );

  const saveNoticia = useCallback(
    async (payload: Partial<Noticia>, isEdit: boolean): Promise<boolean> => {
      if (!data) return false;
      if (demoMode) {
        if (isEdit && payload.id) {
          const actualizado = data.noticias.map((n) => (n.id === payload.id ? { ...n, ...payload } : n));
          setData({ ...data, noticias: actualizado });
          await logAudit('noticias', 'UPDATE', actualizado.find((n) => n.id === payload.id) );
        } else {
          const nuevo: Noticia = { ...(payload as Partial<Noticia>), id: generateUUID() } as Noticia;
          setData({ ...data, noticias: [...data.noticias, nuevo] });
          await logAudit('noticias', 'INSERT', nuevo );
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
      await logAudit('noticias', isEdit ? 'UPDATE' : 'INSERT', payload );
      await reload();
      showSnackbar(isEdit ? 'Noticia actualizada.' : 'Noticia creada.', 'success');
      return true;
    },
    [data, demoMode, reload, showSnackbar, logAudit],
  );

  const deleteNoticia = useCallback(
    async (id: string): Promise<void> => {
      if (!data) return;
      if (demoMode) {
        setData({ ...data, noticias: data.noticias.filter((n) => n.id !== id) });
        showSnackbar('Noticia eliminada (demo).', 'success');
        await logAudit('noticias', 'DELETE', { id });
        return;
      }
      if (!supabaseClient) return;
      const { error } = await supabaseClient.from('noticias').delete().eq('id', id);
      if (error) { showSnackbar('Error: ' + error.message, 'error'); return; }
      await logAudit('noticias', 'DELETE', { id });
      await reload();
      showSnackbar('Noticia eliminada.', 'success');
    },
    [data, demoMode, reload, showSnackbar, logAudit],
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
          const actualizado = data.documentos.map((d) => (d.id === payload.id ? { ...d, ...payload } : d));
          setData({ ...data, documentos: actualizado });
          await logAudit('documentos', 'UPDATE', actualizado.find((d) => d.id === payload.id) );
        } else {
          const nuevo: Documento = { ...(payload as Partial<Documento>), id: generateUUID() } as Documento;
          setData({ ...data, documentos: [...data.documentos, nuevo] });
          await logAudit('documentos', 'INSERT', nuevo );
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
      await logAudit('documentos', isEdit ? 'UPDATE' : 'INSERT', payload );
      await reload();
      showSnackbar(isEdit ? 'Documento actualizado.' : 'Documento agregado.', 'success');
      return true;
    },
    [data, demoMode, reload, showSnackbar, logAudit],
  );

  const deleteDocumento = useCallback(
    async (id: string): Promise<void> => {
      if (!data) return;
      if (demoMode) {
        setData({ ...data, documentos: data.documentos.filter((d) => d.id !== id) });
        showSnackbar('Documento eliminado (demo).', 'success');
        await logAudit('documentos', 'DELETE', { id });
        return;
      }
      if (!supabaseClient) return;
      const { error } = await supabaseClient.from('documentos').delete().eq('id', id);
      if (error) { showSnackbar('Error: ' + error.message, 'error'); return; }
      await logAudit('documentos', 'DELETE', { id });
      await reload();
      showSnackbar('Documento eliminado.', 'success');
    },
    [data, demoMode, reload, showSnackbar, logAudit],
  );

  const saveReclamo = useCallback(
    async (payload: Partial<Reclamo>): Promise<boolean> => {
      if (!data) return false;
      if (demoMode) {
        const nuevo: Reclamo = { ...(payload as Partial<Reclamo>), id: generateUUID() } as Reclamo;
        setData({ ...data, reclamos: [...data.reclamos, nuevo] });
        showSnackbar('Comentario enviado (demo).', 'success');
        await logAudit('reclamos', 'INSERT', nuevo );
        return true;
      }
      if (!supabaseClient) return false;
      const { error } = await supabaseClient.from('reclamos').insert(payload);
      if (error) { showSnackbar('Error: ' + error.message, 'error'); return false; }
      await logAudit('reclamos', 'INSERT', payload );
      await reload();
      showSnackbar('Comentario enviado.', 'success');
      return true;
    },
    [data, demoMode, reload, showSnackbar, logAudit],
  );

  const deleteReclamo = useCallback(
    async (id: string): Promise<void> => {
      if (!data) return;
      if (demoMode) {
        setData({ ...data, reclamos: data.reclamos.filter((r) => r.id !== id) });
        showSnackbar('Comentario eliminado (demo).', 'success');
        await logAudit('reclamos', 'DELETE', { id });
        return;
      }
      if (!supabaseClient) return;
      const { error } = await supabaseClient.from('reclamos').delete().eq('id', id);
      if (error) { showSnackbar('Error: ' + error.message, 'error'); return; }
      await logAudit('reclamos', 'DELETE', { id });
      await reload();
      showSnackbar('Comentario eliminado.', 'success');
    },
    [data, demoMode, reload, showSnackbar, logAudit],
  );

  const saveProveedor = useCallback(
    async (payload: Partial<Proveedor>, isEdit: boolean): Promise<boolean> => {
      if (!data) return false;
      if (demoMode) {
        if (isEdit && payload.id) {
          const actualizado = data.proveedores.map((p) => (p.id === payload.id ? { ...p, ...payload } : p));
          setData({ ...data, proveedores: actualizado });
          await logAudit('proveedores', 'UPDATE', actualizado.find((p) => p.id === payload.id) );
        } else {
          const nuevo: Proveedor = { ...(payload as Partial<Proveedor>), id: generateUUID() } as Proveedor;
          setData({ ...data, proveedores: [...data.proveedores, nuevo] });
          await logAudit('proveedores', 'INSERT', nuevo );
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
      await logAudit('proveedores', isEdit ? 'UPDATE' : 'INSERT', payload );
      await reload();
      showSnackbar(isEdit ? 'Proveedor actualizado.' : 'Proveedor agregado.', 'success');
      return true;
    },
    [data, demoMode, reload, showSnackbar, logAudit],
  );

  const deleteProveedor = useCallback(
    async (id: string): Promise<void> => {
      if (!data) return;
      if (demoMode) {
        setData({ ...data, proveedores: data.proveedores.filter((p) => p.id !== id) });
        showSnackbar('Proveedor eliminado (demo).', 'success');
        await logAudit('proveedores', 'DELETE', { id });
        return;
      }
      if (!supabaseClient) return;
      const { error } = await supabaseClient.from('proveedores').delete().eq('id', id);
      if (error) { showSnackbar('Error: ' + error.message, 'error'); return; }
      await logAudit('proveedores', 'DELETE', { id });
      await reload();
      showSnackbar('Proveedor eliminado.', 'success');
    },
    [data, demoMode, reload, showSnackbar, logAudit],
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
        await logAudit('asambleas', payload.id ? 'UPDATE' : 'INSERT', asambleas[asambleas.length - 1] );
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
      await logAudit('asambleas', payload.id ? 'UPDATE' : 'INSERT', { ...payload, id: asambleaId });
      await reload();
      showSnackbar(payload.id ? 'Asamblea actualizada.' : 'Asamblea guardada.', 'success');
      return true;
    },
    [data, demoMode, reload, showSnackbar, logAudit],
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
        await logAudit('asambleas', 'DELETE', { id });
        return;
      }
      if (!supabaseClient) return;
      await supabaseClient.from('asamblea_asistentes').delete().eq('asamblea_id', id);
      const { error } = await supabaseClient.from('asambleas').delete().eq('id', id);
      if (error) { showSnackbar('Error: ' + error.message, 'error'); return; }
      await logAudit('asambleas', 'DELETE', { id });
      await reload();
      showSnackbar('Asamblea eliminada.', 'success');
    },
    [data, demoMode, reload, showSnackbar, logAudit],
  );

  const saveEncuesta = useCallback(
    async (payload: Partial<Encuesta>, isEdit: boolean): Promise<boolean> => {
      if (!data) return false;
      if (demoMode) {
        if (isEdit && payload.id) {
          const actualizado = data.encuestas.map((e) => (e.id === payload.id ? { ...e, ...payload } : e));
          setData({ ...data, encuestas: actualizado });
          await logAudit('encuestas', 'UPDATE', actualizado.find((e) => e.id === payload.id) );
        } else {
          const nueva: Encuesta = { ...(payload as Partial<Encuesta>), id: generateUUID() } as Encuesta;
          setData({ ...data, encuestas: [...data.encuestas, nueva] });
          await logAudit('encuestas', 'INSERT', nueva );
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
      await logAudit('encuestas', isEdit ? 'UPDATE' : 'INSERT', payload );
      await reload();
      showSnackbar(isEdit ? 'Encuesta actualizada.' : 'Encuesta creada.', 'success');
      return true;
    },
    [data, demoMode, reload, showSnackbar, logAudit],
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
        await logAudit('encuestas', 'DELETE', { id });
        return;
      }
      if (!supabaseClient) return;
      await supabaseClient.from('encuestas_votos').delete().eq('encuesta_id', id);
      const { error } = await supabaseClient.from('encuestas').delete().eq('id', id);
      if (error) { showSnackbar('Error: ' + error.message, 'error'); return; }
      await logAudit('encuestas', 'DELETE', { id });
      await reload();
      showSnackbar('Encuesta eliminada.', 'success');
    },
    [data, demoMode, reload, showSnackbar, logAudit],
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
          const actualizado = data.publicaciones.map((p) => (p.id === payload.id ? { ...p, ...payload } : p));
          setData({ ...data, publicaciones: actualizado });
          await logAudit('publicaciones', 'UPDATE', actualizado.find((p) => p.id === payload.id) );
        } else {
          const nueva: Publicacion = {
            ...(payload as Partial<Publicacion>),
            id: generateUUID(),
            usuario: currentUserEmail || 'anónimo',
          } as Publicacion;
          setData({ ...data, publicaciones: [...data.publicaciones, nueva] });
          await logAudit('publicaciones', 'INSERT', nueva );
        }
        showSnackbar(isEdit ? 'Publicación actualizada.' : 'Publicación publicada.', 'success');
        return true;
      }
      if (!supabaseClient) return false;
      if (isEdit && payload.id) {
        const { error } = await supabaseClient.from('publicaciones').update(payload).eq('id', payload.id);
        if (error) { showSnackbar('Error: ' + error.message, 'error'); return false; }
      } else {
        const insert = { ...payload };
        if (!insert.usuario) insert.usuario = currentUserEmail || 'anónimo';
        const { error } = await supabaseClient.from('publicaciones').insert(insert);
        if (error) { showSnackbar('Error: ' + error.message, 'error'); return false; }
        await logAudit('publicaciones', 'INSERT', insert );
      }
      if (isEdit) await logAudit('publicaciones', 'UPDATE', payload );
      await reload();
      showSnackbar(isEdit ? 'Publicación actualizada.' : 'Publicación publicada.', 'success');
      return true;
    },
    [data, demoMode, reload, showSnackbar, currentUserEmail, logAudit],
  );

  const deletePublicacion = useCallback(
    async (id: string): Promise<void> => {
      if (!data) return;
      if (demoMode) {
        setData({ ...data, publicaciones: data.publicaciones.filter((p) => p.id !== id) });
        showSnackbar('Publicación eliminada (demo).', 'success');
        await logAudit('publicaciones', 'DELETE', { id });
        return;
      }
      if (!supabaseClient) return;
      const { error } = await supabaseClient.from('publicaciones').delete().eq('id', id);
      if (error) { showSnackbar('Error: ' + error.message, 'error'); return; }
      await logAudit('publicaciones', 'DELETE', { id });
      await reload();
      showSnackbar('Publicación eliminada.', 'success');
    },
    [data, demoMode, reload, showSnackbar, logAudit],
  );

  const saveConfigValue = useCallback(
    async (key: keyof Config, value: unknown): Promise<boolean> => {
      if (!data) return false;
      const existed = Object.prototype.hasOwnProperty.call(data.config, key);
      if (demoMode) {
        setData({ ...data, config: { ...data.config, [key]: value } });
        await logAudit('config', existed ? 'UPDATE' : 'INSERT', { key, value });
        return true;
      }
      if (!supabaseClient) return false;
      const { error } = await supabaseClient.from('config').upsert({ key, value });
      if (error) { showSnackbar('Error: ' + error.message, 'error'); return false; }
      await logAudit('config', existed ? 'UPDATE' : 'INSERT', { key, value });
      return true;
    },
    [data, demoMode, showSnackbar, logAudit],
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
      audit_log: data?.audit_log ?? [],
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
