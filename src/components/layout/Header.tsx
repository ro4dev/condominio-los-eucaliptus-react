import { useApp } from '../../store/AppContext';
import { IconButton } from '../ui/Button';
import { Button } from '../ui/Button';

export function Header() {
  const { isDark, toggleTheme, demoMode, toggleDemoMode } = useApp();
  return (
    <header>
      <div className="header-inner">
        <div>
          <h1>CONDOMINIO EUCALIPTUS</h1>
          <p>Control de gastos comunes</p>
        </div>
        <div className="header-actions">
          <Button
            onClick={toggleDemoMode}
            icon="science"
            className="btn-text"
            style={{ padding: '0.5rem 0.75rem' }}
          >
            {demoMode ? 'Salir de modo demo' : 'Ir a modo demo'}
          </Button>
          <IconButton
            icon={isDark ? 'light_mode' : 'dark_mode'}
            onClick={toggleTheme}
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
          />
        </div>
      </div>
    </header>
  );
}
