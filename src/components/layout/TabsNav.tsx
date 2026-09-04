import { TABS, type TabId } from './tabs';
import { useApp } from '../../store/AppContext';

interface TabsNavProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

export function TabsNav({ active, onChange }: TabsNavProps) {
  const { isAdmin } = useApp();
  const tabs = isAdmin ? TABS : TABS.filter((t) => t.id !== 'config');
  return (
    <nav className="tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          className={'tab-btn' + (active === tab.id ? ' active' : '')}
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
