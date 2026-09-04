import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { getDarkTheme, getDemoMode, setDarkTheme, setDemoMode } from '../lib/appConfig';
import { supabaseClient } from '../lib/supabase';

export type SnackType = 'success' | 'warning' | 'error' | 'info';

interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AppContextValue {
  isDark: boolean;
  toggleTheme: () => void;
  demoMode: boolean;
  toggleDemoMode: () => void;
  snackbar: { message: string; type: SnackType } | null;
  showSnackbar: (message: string, type?: SnackType) => void;
  /** In demo mode se asume admin (no hay login). En producción, según role del usuario. */
  isAdmin: boolean;
  currentUserEmail: string | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(getDarkTheme);
  const [demoMode, setDemo] = useState<boolean>(getDemoMode);
  const [snackbar, setSnackbar] = useState<{ message: string; type: SnackType } | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(true);
  const snackTimer = useRef<number | null>(null);

  useEffect(() => {
    document.body.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    if (!supabaseClient) return;
    const applyUser = (user: { email?: string | null; app_metadata?: Record<string, unknown> } | null) => {
      setCurrentUserEmail(user?.email ?? null);
      setIsAdmin(user?.app_metadata?.role === 'admin');
    };
    supabaseClient.auth.getSession().then(({ data }) => {
      applyUser(data.session?.user ?? null);
    });
    const { data: sub } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      applyUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (demoMode) {
      setIsAdmin(true);
      return;
    }
    if (!supabaseClient) {
      setIsAdmin(false);
      return;
    }
    supabaseClient.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      setCurrentUserEmail(user?.email ?? null);
      setIsAdmin(user?.app_metadata?.role === 'admin');
    });
  }, [demoMode]);

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

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!supabaseClient) return { ok: false, error: 'Auth no configurada (faltan VITE_SUPABASE_URL/ANON_KEY).' };
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return { ok: false, error: 'Email o contraseña incorrectos' };
      }
      return { ok: false, error: error.message };
    }
    return { ok: true };
  }, []);

  const signup = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!supabaseClient) return { ok: false, error: 'Auth no configurada (faltan VITE_SUPABASE_URL/ANON_KEY).' };
    const { error } = await supabaseClient.auth.signUp({ email, password });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    if (supabaseClient) await supabaseClient.auth.signOut();
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
        isAdmin,
        currentUserEmail,
        login,
        signup,
        logout,
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