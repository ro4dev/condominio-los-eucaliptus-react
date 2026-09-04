import { useState } from 'react';
import { Header } from './components/layout/Header';
import { TabsNav } from './components/layout/TabsNav';
import { ComingSoon } from './components/layout/ComingSoon';
import { TABS, type TabId } from './components/layout/tabs';
import { useApp } from './store/AppContext';
import { FinanzasPage } from './components/finanzas/FinanzasPage';
import { ParcelasPage } from './components/parcelas/ParcelasPage';
import { HomePage } from './components/home/HomePage';
import { NoticiasPage } from './components/noticias/NoticiasPage';
import { DocumentosPage } from './components/documentos/DocumentosPage';
import { ReclamosPage } from './components/reclamos/ReclamosPage';
import { ProveedoresPage } from './components/proveedores/ProveedoresPage';
import { AsambleasPage } from './components/asambleas/AsambleasPage';
import { EncuestasPage } from './components/encuestas/EncuestasPage';
import { VentasPage } from './components/ventas/VentasPage';
import { ConfigPage } from './components/config/ConfigPage';

export default function App() {
  const { isAdmin } = useApp();
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const activeDef = TABS.find((t) => t.id === activeTab) || TABS[0];

  const guard = isAdmin || activeDef.id !== 'config'
    ? activeDef
    : TABS.find((t) => t.id === 'home') || TABS[0];

  function renderPage() {
    switch (guard.id) {
      case 'home':
        return <HomePage />;
      case 'finanzas':
        return <FinanzasPage />;
      case 'parcelas':
        return <ParcelasPage />;
      case 'noticias':
        return <NoticiasPage />;
      case 'documentos':
        return <DocumentosPage />;
      case 'reclamos':
        return <ReclamosPage />;
      case 'proveedores':
        return <ProveedoresPage />;
      case 'asambleas':
        return <AsambleasPage />;
      case 'encuestas':
        return <EncuestasPage />;
      case 'publicaciones':
        return <VentasPage />;
      case 'config':
        return <ConfigPage />;
      default:
        return (
          <div className="tab-content active">
            <ComingSoon label={guard.label} />
          </div>
        );
    }
  }

  return (
    <>
      <Header />
      <div className="container">
        <TabsNav active={activeTab} onChange={setActiveTab} />
        {renderPage()}
      </div>
    </>
  );
}
