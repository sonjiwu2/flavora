import { showToast } from '../../components/toast.js';
import { onStorageFailure } from '../../core/storage.js';

const STORAGE_FAILURE_MESSAGE =
  'Не удалось сохранить изменения в браузере — они действуют до закрытия вкладки.';

export function initStorageNotice() {
  let alreadyShown = false;
  onStorageFailure(() => {
    if (alreadyShown) return;
    alreadyShown = true;
    showToast(STORAGE_FAILURE_MESSAGE);
  });
}
