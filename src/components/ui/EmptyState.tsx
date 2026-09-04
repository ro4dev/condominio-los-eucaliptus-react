import { Icon } from '../ui/Icon';

export function EmptyState({ texto }: { texto: string }) {
  return (
    <div className="empty-state">
      <Icon name="inbox" />
      <p>{texto}</p>
    </div>
  );
}
