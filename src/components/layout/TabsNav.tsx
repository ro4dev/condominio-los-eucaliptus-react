import { TABS, type TabId } from './tabs';

interface TabsNavProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

export function TabsNav({ active, onChange }: TabsNavProps) {
  return (
    <nav className="tabs" role="tablist">
      {TABS.map((tab) => (
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
