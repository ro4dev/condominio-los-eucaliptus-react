import { copyText } from '../../lib/clipboard';
import { escHtml, safeUrl } from '../../lib/format';
import type { DatosPago } from '../../lib/types';
import { useApp } from '../../store/AppContext';
import { Button, TextButton } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface Props {
  open: boolean;
  onClose: () => void;
  datos: DatosPago | undefined;
  montoTexto?: string | null;
}

const CAMPOS: [keyof DatosPago, string][] = [
  ['banco', 'Banco'],
  ['tipo_cuenta', 'Tipo de cuenta'],
  ['numero_cuenta', 'Número de cuenta'],
  ['rut', 'RUT'],
  ['titular', 'Titular'],
  ['email', 'Email'],
];

export function ComoPagarModal({ open, onClose, datos, montoTexto }: Props) {
  const { showSnackbar } = useApp();
  const d = datos || {};
  const tieneDatos = CAMPOS.some(([k]) => !!d[k]);
  const camposLlenos = CAMPOS.filter(([k]) => !!d[k]);

  async function copiarValor(valor: string) {
    const ok = await copyText(valor);
    showSnackbar(ok ? 'Copiado al portapapeles.' : 'No se pudo copiar.', ok ? 'success' : 'error');
  }

  async function copiarTodos() {
    const allText = camposLlenos.map(([k, l]) => l + ': ' + (d[k] as string)).join('\n');
    if (!allText) return;
    const ok = await copyText(allText);
    showSnackbar(ok ? 'Copiado al portapapeles.' : 'No se pudo copiar.', ok ? 'success' : 'error');
  }

  return (
    <Modal
      open={open}
      title="Cómo pagar tu cuota"
      onClose={onClose}
      footer={
        <>
          <TextButton onClick={onClose}>Cerrar</TextButton>
          {camposLlenos.length > 0 && (
            <Button icon="content_copy" onClick={copiarTodos}>Copiar datos</Button>
          )}
        </>
      }
    >
      {montoTexto && <p style={{ margin: '0 0 0.8rem', fontWeight: 600, color: 'var(--text)' }}>{montoTexto}</p>}

      {!tieneDatos ? (
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Sin datos de pago configurados.</p>
      ) : (
        <>
          {camposLlenos.map(([k, label]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--divider)' }}>
              <span style={{ color: 'var(--text-2)' }}>{label}</span>
              <span
                style={{ cursor: 'pointer', color: 'var(--text)' }}
                title="Tocar para copiar"
                onClick={() => copiarValor(d[k] as string)}
              >
                {escHtml(d[k] as string)}
              </span>
            </div>
          ))}
          {safeUrl(d.qr) && (
            <img
              src={safeUrl(d.qr)}
              alt="Código QR de pago"
              style={{ display: 'block', maxWidth: 180, margin: '0.8rem auto 0' }}
            />
          )}
        </>
      )}
    </Modal>
  );
}
