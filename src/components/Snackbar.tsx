import { useApp } from '../store/AppContext';

const icons = { success: 'check_circle', warning: 'warning', error: 'error', info: 'info' } as const;

export function Snackbar() {
  const { snackbar } = useApp();
  if (!snackbar) return null;
  return (
    <div id="appSnackbar" className="show">
      <span className={'snackbar-icon material-symbols-outlined ' + snackbar.type}>
        {icons[snackbar.type]}
      </span>
      {snackbar.message}
    </div>
  );
}
