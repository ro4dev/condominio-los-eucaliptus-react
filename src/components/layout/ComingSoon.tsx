import { Icon } from '../ui/Icon';

export function ComingSoon({ label }: { label: string }) {
  return (
    <div className="empty-state" style={{ marginTop: '1rem' }}>
      <Icon name="construction" />
      <p>
        La pestaña <strong>{label}</strong> se migrará a React en futuras iteraciones.
        Por ahora podés explorar el módulo de Finanzas.
      </p>
    </div>
  );
}
