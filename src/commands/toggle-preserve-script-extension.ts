import { getAutoImportSetting, setAutoImportSetting } from '../config/settings';
import { showNotification } from '../editor/notification';

export async function executeTogglePreserveScriptExtension(): Promise<void> {
  const current = getAutoImportSetting<boolean>('script', 'preserve') ?? false;
  const next = !current;
  await setAutoImportSetting('script', 'preserve', next);
  showNotification('preserve-script-extension-toggled', { enabled: next });
}
