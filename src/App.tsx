import { useState } from 'react';
import { Header } from './components/layout/Header';
import { TabsNav } from './components/layout/TabsNav';
import { ComingSoon } from './components/layout/ComingSoon';
import { TABS, type TabId } from './components/layout/tabs';
import { FinanzasPage } from './components/finanzas/FinanzasPage';
import { ParcelasPage } from './components/parcelas/ParcelasPage';
import { HomePage } from './components/home/HomePage';
import { NoticiasPage } from './components/noticias/NoticiasPage';
import { DocumentosPage } from './components/documentos/DocumentosPage';
import { ReclamosPage } from './components/reclamos/ReclamosPage';
import { ProveedoresPage } from './components/proveedores/ProveedoresPage';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const activeDef = TABS.find((t) => t.id === activeTab) || TABS[0];

  function renderPage() {
    switch (activeDef.id) {
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
      default:
        return (
          <div className="tab-content active">
            <ComingSoon label={activeDef.label} />
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
