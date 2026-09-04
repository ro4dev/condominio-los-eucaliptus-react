import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { getDarkTheme, getDemoMode, setDarkTheme, setDemoMode } from '../lib/appConfig';

export type SnackType = 'success' | 'warning' | 'error' | 'info';

interface AppContextValue {
  isDark: boolean;
  toggleTheme: () => void;
  demoMode: boolean;
  toggleDemoMode: () => void;
  snackbar: { message: string; type: SnackType } | null;
  showSnackbar: (message: string, type?: SnackType) => void;
  /** TEMP: la migración de auth (login/roles) está pendiente. Se asume admin por ahora. */
  isAdmin: boolean;
  currentUserEmail: string | null;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(getDarkTheme);
  const [demoMode, setDemo] = useState<boolean>(getDemoMode);
  const [snackbar, setSnackbar] = useState<{ message: string; type: SnackType } | null>(null);
  const snackTimer = useRef<number | null>(null);

  useEffect(() => {
    document.body.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      setDarkTheme(next);
      return next;
    });
  }, []);

  const toggleDemoMode = useCallback(() => {
    setDemo((prev) => {
      const next = !prev;
      setDemoMode(next);
      return next;
    });
  }, []);

  const showSnackbar = useCallback((message: string, type: SnackType = 'info') => {
    setSnackbar({ message, type });
    if (snackTimer.current) window.clearTimeout(snackTimer.current);
    snackTimer.current = window.setTimeout(() => setSnackbar(null), 3000);
  }, []);

  return (
    <AppContext.Provider
      value={{
        isDark,
        toggleTheme,
        demoMode,
        toggleDemoMode,
        snackbar,
        showSnackbar,
        isAdmin: true,
        currentUserEmail: null,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider');
  return ctx;
}
