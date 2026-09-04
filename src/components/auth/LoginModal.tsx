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
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setEmail('');
    setPassword('');
    setError('');
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError('');
    setBusy(true);
    const res = await login(email, password);
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
      title="Iniciar sesión"
      onClose={onClose}
      footer={
        <>
          <TextButton onClick={onClose}>Cancelar</TextButton>
          <Button type="submit" form="loginForm" disabled={busy}>
            Iniciar sesión
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
      </form>
    </Modal>
  );
}