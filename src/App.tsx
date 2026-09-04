import { useState } from 'react';
import { Header } from './components/layout/Header';
import { TabsNav } from './components/layout/TabsNav';
import { ComingSoon } from './components/layout/ComingSoon';
import { TABS, type TabId } from './components/layout/tabs';
import { FinanzasPage } from './components/finanzas/FinanzasPage';
import { ParcelasPage } from './components/parcelas/ParcelasPage';
import { HomePage } from './components/home/HomePage';

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
