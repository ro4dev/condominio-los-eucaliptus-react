import { TABS, type TabId } from './tabs';
import { useApp } from '../../store/AppContext';
import { Icon } from '../ui/Icon';

interface NavigationDrawerProps {
  open: boolean;
  active: TabId;
  onChange: (tab: TabId) => void;
  onClose: () => void;
}

function DrawerHeader() {
  return (
    <div className="drawer-header">
      <p className="drawer-title">CONDOMINIO EUCALIPTUS</p>
      <p className="drawer-subtitle">Control de gastos comunes</p>
    </div>
  );
}

export function NavigationDrawer({ open, active, onChange, onClose }: NavigationDrawerProps) {
  const { isAdmin } = useApp();
  const tabs = isAdmin ? TABS : TABS.filter((t) => t.id !== 'config');

  return (
    <aside className={'drawer' + (open ? ' drawer-open' : '')} aria-label="Menú principal" inert={!open}>
      <DrawerHeader />
      <nav className="drawer-nav">
        {tabs.map((tab) => (
          <DrawerItem key={tab.id} tab={tab} active={active === tab.id} onSelect={() => { onChange(tab.id); onClose(); }} />
        ))}
      </nav>
    </aside>
  );
}

function DrawerItem({ tab, active, onSelect }: { tab: (typeof TABS)[number]; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      className={'drawer-item' + (active ? ' active' : '')}
      aria-current={active ? 'page' : undefined}
      onClick={onSelect}
    >
      <Icon name={tab.icon} size={22} />
      <span>{tab.label}</span>
    </button>
  );
}