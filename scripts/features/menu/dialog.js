import { openDialog } from '../../components/modal.js';
import { listen } from '../../utils/dom.js';

export function openMenuDialog({ onClose, ...options }) {
  const stopListening = listen(window, 'hashchange', () => dialog.close());
  const dialog = openDialog({
    ...options,
    onClose() {
      stopListening();
      onClose?.();
    },
  });
  return dialog;
}
