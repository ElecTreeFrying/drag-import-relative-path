import * as vscode from 'vscode';

import { getAutoImportSetting, setAutoImportSetting } from '../config/settings';
import { showNotification } from '../editor/notification';

interface PlacementQuickPickItem extends vscode.QuickPickItem {
  value: string;
}

// detail strings mirror the enumDescriptions of
// drag-import.preferences.importStatementPlacement in package.json.
const PLACEMENT_OPTIONS: ReadonlyArray<{ value: string; detail: string }> = [
  { value: 'Top', detail: 'Insert before the first line of the file.' },
  { value: 'Bottom', detail: 'Append after the last recognised import / require / @import / @use line. Falls back to line 0 if no import is found.' },
  { value: 'Cursor', detail: 'Insert at the current cursor position.' },
];

export async function executeSetImportPlacement(): Promise<void> {
  const currentValue = getAutoImportSetting<string>('preferences', 'placement') ?? 'Bottom';

  const picked = await vscode.window.showQuickPick(toQuickPickItems(currentValue), {
    placeHolder: 'Set import placement',
    matchOnDetail: true,
  });
  if (!picked) {
    return;
  }

  await setAutoImportSetting('preferences', 'placement', picked.value);
  return showNotification('placement-saved', { placement: picked.value });
}

function toQuickPickItems(currentValue: string): PlacementQuickPickItem[] {
  const items: PlacementQuickPickItem[] = [];
  let currentIdx = -1;
  for (const option of PLACEMENT_OPTIONS) {
    const isCurrent = option.value === currentValue;
    if (isCurrent) {
      currentIdx = items.length;
    }
    items.push({
      label: option.value,
      description: isCurrent ? '$(check) Current' : undefined,
      detail: option.detail,
      value: option.value,
    });
  }
  if (currentIdx > 0) {
    const [current] = items.splice(currentIdx, 1);
    items.unshift(current);
  }
  return items;
}
