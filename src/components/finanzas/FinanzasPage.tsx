import { useState } from 'react';
import { useData } from '../../store/DataContext';
import { useApp } from '../../store/AppContext';
import type { Gasto } from '../../lib/types';
import { RecaudadoChart } from './RecaudadoChart';
import { FlujoChart } from './FlujoChart';
import { PeriodoEnCurso } from './PeriodoEnCurso';
import { HistoricoPeriodos } from './HistoricoPeriodos';
import { CuotasPeriodoModal } from './CuotasPeriodoModal';
import { PagosCuotaModal } from './PagosCuotaModal';
import { MovimientosPeriodoModal } from './MovimientosPeriodoModal';
import { GastoFormModal } from './GastoFormModal';
import { GenerarCuotasModal } from './GenerarCuotasModal';
import { PeriodoModal } from './PeriodoModal';

export function FinanzasPage() {
  const { gastos, pagos, flujo, parcelas, config, loading, deleteGasto } = useData();
  const { showSnackbar } = useApp();

  const [cuotasPeriodo, setCuotasPeriodo] = useState<string | null>(null);
  const [pagosGasto, setPagosGasto] = useState<Gasto | null>(null);
  const [movimientosPeriodo, setMovimientosPeriodo] = useState<string | null>(null);
  const [gastoForm, setGastoForm] = useState<{ open: boolean; gasto: Gasto | null }>({ open: false, gasto: null });
  const [generar, setGenerar] = useState<{ open: boolean; titulo?: string; periodo?: string; fijo?: boolean }>({ open: false });
  const [periodoModal, setPeriodoModal] = useState<{ open: boolean; periodo: string | null }>({ open: false, periodo: null });

  function eliminarGasto(g: Gasto) {
    if (window.confirm('¿Estás seguro de eliminar este gasto? Esta acción no se puede deshacer.')) {
      deleteGasto(g.id);
      showSnackbar('Eliminado (demo).', 'success');
    }
  }

  if (loading) {
    return (
      <>
        <section className="stats" style={{ marginBottom: '1rem' }}>
          <div className="skeleton skeleton-stat" />
          <div className="skeleton skeleton-stat" />
          <div className="skeleton skeleton-stat" />
        </section>
        <div className="skeleton skeleton-card" />
        <div className="skeleton skeleton-row" />
        <div className="skeleton skeleton-row" />
      </>
    );
  }

  return (
    <div id="tab-finanzas" className="tab-content active">
      <section className="charts">
        <div className="chart-box">
          <h3>Recaudado vs Esperado por período</h3>
          <RecaudadoChart gastos={gastos} pagos={pagos} />
        </div>
        <div className="chart-box">
          <h3>Ingresos vs Egresos por mes</h3>
          <FlujoChart gastos={gastos} flujo={flujo} pagos={pagos} />
        </div>
      </section>

      <PeriodoEnCurso
        gastos={gastos}
        pagos={pagos}
        flujo={flujo}
        onGenerarCuotas={(periodo) => setGenerar({ open: true, titulo: 'Cerrar periodo', periodo, fijo: true })}
        onVerCuotas={setCuotasPeriodo}
        onVerMovimientos={setMovimientosPeriodo}
        onEditarPeriodo={(periodo) => setPeriodoModal({ open: true, periodo })}
      />

      <HistoricoPeriodos
        gastos={gastos}
        pagos={pagos}
        flujo={flujo}
        config={config}
        onVerCuotas={setCuotasPeriodo}
        onVerMovimientos={setMovimientosPeriodo}
        onEditarPeriodo={(periodo) => setPeriodoModal({ open: true, periodo })}
      />

      <CuotasPeriodoModal
        open={!!cuotasPeriodo}
        periodo={cuotasPeriodo}
        onClose={() => setCuotasPeriodo(null)}
        gastos={gastos}
        pagos={pagos}
        parcelas={parcelas}
        onRegistrarPago={setPagosGasto}
        onEditar={(g) => setGastoForm({ open: true, gasto: g })}
        onEliminar={eliminarGasto}
      />

      <PagosCuotaModal
        open={!!pagosGasto}
        gasto={pagosGasto}
        onClose={() => setPagosGasto(null)}
        onBack={() => {
          if (pagosGasto) setCuotasPeriodo(pagosGasto.periodo);
          setPagosGasto(null);
        }}
        parcelas={parcelas}
      />

      <MovimientosPeriodoModal
        open={!!movimientosPeriodo}
        periodo={movimientosPeriodo}
        onClose={() => setMovimientosPeriodo(null)}
        flujo={flujo}
      />

      <GastoFormModal
        open={gastoForm.open}
        gasto={gastoForm.gasto}
        onClose={() => setGastoForm({ open: false, gasto: null })}
      />

      <GenerarCuotasModal
        open={generar.open}
        titulo={generar.titulo}
        periodoInicial={generar.periodo}
        fijo={generar.fijo}
        onClose={() => setGenerar({ open: false })}
      />

      <PeriodoModal
        open={periodoModal.open}
        periodo={periodoModal.periodo}
        onClose={() => setPeriodoModal({ open: false, periodo: null })}
      />
    </div>
  );
}
