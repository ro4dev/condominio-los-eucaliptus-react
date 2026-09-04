import { useEffect, useState } from 'react';
import { supabaseClient } from '../../lib/supabase';
import { useApp } from '../../store/AppContext';
import { Button, TextButton } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function LoginModal({ open, onClose }: Props) {
  const { login, signup } = useApp();
  const [modo, setModo] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setModo('login');
    setEmail('');
    setPassword('');
    setError('');
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError('');
    setBusy(true);
    let res: { ok: boolean; error?: string };
    if (modo === 'login') {
      res = await login(email, password);
    } else {
      res = await signup(email, password);
      if (res.ok) {
        setModo('login');
        setBusy(false);
        return;
      }
    }
    setBusy(false);
    if (!res.ok) {
      setError(res.error || 'Ocurrió un error.');
      return;
    }
    onClose();
  }

  if (!supabaseClient) {
    return (
      <Modal open={open} title="Iniciar sesión" onClose={onClose}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-2)' }}>
          La autenticación no está configurada en esta instancia. Para habilitarla, definí{' '}
          <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code> en tu entorno.
        </div>
        <div className="modal-footer">
          <TextButton onClick={onClose}>Cerrar</TextButton>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      title={modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
      onClose={onClose}
      footer={
        <>
          <TextButton onClick={onClose}>Cancelar</TextButton>
          <Button type="submit" form="loginForm" disabled={busy}>
            {modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </Button>
        </>
      }
    >
      <form id="loginForm" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="form-group">
          <label htmlFor="loginEmail">Email</label>
          <input
            id="loginEmail"
            className="field-input"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="loginPassword">Contraseña</label>
          <input
            id="loginPassword"
            className="field-input"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div style={{ color: 'var(--md-sys-color-error)', fontSize: '0.85rem' }}>{error}</div>}
        <button
          type="button"
          className="btn btn-text"
          style={{ alignSelf: 'flex-start', padding: '0.25rem 0', fontSize: '0.85rem' }}
          onClick={() => {
            setError('');
            setModo((m) => (m === 'login' ? 'signup' : 'login'));
          }}
        >
          {modo === 'login' ? '¿No tenés cuenta? Crear cuenta' : '¿Ya tenés cuenta? Iniciar sesión'}
        </button>
      </form>
    </Modal>
  );
}