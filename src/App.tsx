import { useEffect, useRef, useState } from 'react';
import { Header } from './components/layout/Header';
import { NavigationDrawer } from './components/layout/NavigationDrawer';
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

const VISTA_PARAM = 'vista';

function tabFromUrl(isAdmin: boolean): TabId {
  const v = new URLSearchParams(window.location.search).get(VISTA_PARAM);
  if (v && TABS.some((t) => t.id === v) && (isAdmin || v !== 'config')) return v as TabId;
  return 'home';
}

export default function App() {
  const { isAdmin } = useApp();
  const [activeTab, setActiveTab] = useState<TabId>(() => tabFromUrl(isAdmin));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const skipPush = useRef(true);
  const activeDef = TABS.find((t) => t.id === activeTab) || TABS[0];

  const guard = isAdmin || activeDef.id !== 'config'
    ? activeDef
    : TABS.find((t) => t.id === 'home') || TABS[0];

  useEffect(() => {
    if (skipPush.current) {
      skipPush.current = false;
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set(VISTA_PARAM, activeTab);
    window.history.pushState({}, '', url);
  }, [activeTab]);

  useEffect(() => {
    const onPop = () => {
      const v = new URLSearchParams(window.location.search).get(VISTA_PARAM);
      if (v && TABS.some((t) => t.id === v)) setActiveTab(v as TabId);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

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
    <div className="app-shell">
      <NavigationDrawer
        open={drawerOpen}
        active={activeTab}
        onChange={setActiveTab}
        onClose={() => setDrawerOpen(false)}
      />
      <div className={'drawer-scrim' + (drawerOpen ? ' visible' : '')} onClick={() => setDrawerOpen(false)} aria-hidden="true" />
      <div className="app-main">
        <Header title={guard.label} onMenuClick={() => setDrawerOpen(true)} />
        <main className="container">{renderPage()}</main>
      </div>
    </div>
  );
}
