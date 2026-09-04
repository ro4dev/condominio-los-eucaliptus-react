import { useEffect, useRef, useState } from 'react';
import { useApp } from '../../store/AppContext';
import { IconButton } from '../ui/Button';
import { LoginModal } from '../auth/LoginModal';

export function Header() {
  const { isDark, toggleTheme, demoMode, toggleDemoMode, currentUserEmail, isAdmin, logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen]);

  return (
    <header>
      <div className="header-inner">
        <div>
          <h1>CONDOMINIO EUCALIPTUS</h1>
          <p>Control de gastos comunes</p>
        </div>
        <div className="header-actions">
          <div style={{ position: 'relative' }} ref={menuRef}>
            <IconButton
              icon="account_circle"
              onClick={() => setMenuOpen((o) => !o)}
              title="Menú de usuario"
            />
            {menuOpen && (
              <div
                className="card"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 0.4rem)',
                  minWidth: '200px',
                  zIndex: 50,
                  margin: 0,
                  padding: '0.5rem',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                }}
              >
                <div style={{ fontWeight: 500, fontSize: '0.9rem', padding: '0.5rem 0.6rem' }}>
                  {currentUserEmail || (isAdmin ? 'Administrador (demo)' : 'Invitado')}
                </div>
                {currentUserEmail && isAdmin && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0 0.6rem 0.5rem' }}>
                    Administrador
                  </div>
                )}
                {currentUserEmail && !isAdmin && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0 0.6rem 0.5rem' }}>
                    Propietario
                  </div>
                )}
                <hr style={{ margin: '0.3rem 0', border: 'none', borderTop: '1px solid var(--border)' }} />
                <button
                  type="button"
                  className="btn btn-text"
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '0.5rem 0.6rem', fontSize: '0.9rem' }}
                  onClick={() => {
                    if (currentUserEmail) {
                      logout();
                    } else {
                      setLoginOpen(true);
                    }
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', marginRight: '0.5rem' }}>
                    {currentUserEmail ? 'logout' : 'login'}
                  </span>
                  {currentUserEmail ? 'Cerrar sesión' : 'Iniciar sesión'}
                </button>
                <hr style={{ margin: '0.3rem 0', border: 'none', borderTop: '1px solid var(--border)' }} />
                <button
                  type="button"
                  className="btn btn-text"
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '0.5rem 0.6rem', fontSize: '0.9rem' }}
                  onClick={toggleDemoMode}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', marginRight: '0.5rem' }}>
                    science
                  </span>
                  {demoMode ? 'Salir de modo demo' : 'Ir a modo demo'}
                </button>
                <button
                  type="button"
                  className="btn btn-text"
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '0.5rem 0.6rem', fontSize: '0.9rem' }}
                  onClick={toggleTheme}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', marginRight: '0.5rem' }}>
                    {isDark ? 'light_mode' : 'dark_mode'}
                  </span>
                  {isDark ? 'Modo claro' : 'Modo oscuro'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </header>
  );
}