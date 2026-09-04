import { useState } from 'react';
import { Header } from './components/layout/Header';
import { TabsNav } from './components/layout/TabsNav';
import { ComingSoon } from './components/layout/ComingSoon';
import { TABS, type TabId } from './components/layout/tabs';
import { FinanzasPage } from './components/finanzas/FinanzasPage';
import { ParcelasPage } from './components/parcelas/ParcelasPage';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('finanzas');
  const activeDef = TABS.find((t) => t.id === activeTab) || TABS[1];

  return (
    <>
      <Header />
      <div className="container">
        <TabsNav active={activeTab} onChange={setActiveTab} />
        {activeDef.implemented ? (
          activeDef.id === 'finanzas' ? (
            <FinanzasPage />
          ) : (
            <ParcelasPage />
          )
        ) : (
          <div className="tab-content active">
            <ComingSoon label={activeDef.label} />
          </div>
        )}
      </div>
    </>
  );
}
