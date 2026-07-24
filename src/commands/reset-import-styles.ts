import {
  AutoImportConfigNamespace,
  AutoImportSettingKey,
  inspectAutoImportSetting,
  setAutoImportSetting,
} from '../config/settings';
import { showNotification } from '../editor/notification';

/** A configurable import-style setting addressed by its `(namespace, key)` alias pair. */
interface StyleRef {
  namespace: AutoImportConfigNamespace;
  key: AutoImportSettingKey;
}

/** A captured Global override for one style setting, retained so a reset can be undone. */
interface StyleSnapshot extends StyleRef {
  priorValue: string;
}

/**
 * The twelve configurable import-style settings reset by {@link executeResetImportStyles}. Excludes
 * the three `preserve…FileExtension` booleans (`script`, `stylesheet`, and `latex` graphics),
 * `importStatementPlacement` (owned by `set-import-placement.ts`), and the four dormant single-shape
 * keys (`cssImage`, `scssImage`, `htmlStyleSheet`, `markdown`) — resetting a one-value setting is
 * meaningless.
 */
const RESETTABLE_STYLES: ReadonlyArray<StyleRef> = [
  { namespace: 'script', key: 'javascript' },
  { namespace: 'script', key: 'typescript' },
  { namespace: 'stylesheet', key: 'css' },
  { namespace: 'stylesheet', key: 'scss' },
  { namespace: 'markup', key: 'htmlScript' },
  { namespace: 'markup', key: 'htmlImage' },
  { namespace: 'markup', key: 'htmlVideo' },
  { namespace: 'markup', key: 'htmlAudio' },
  { namespace: 'markup', key: 'markdownImage' },
  { namespace: 'latex', key: 'graphics' },
  { namespace: 'latex', key: 'input' },
  { namespace: 'latex', key: 'bibliography' },
];

/**
 * Resets every customized import-style setting to its `package.json` default by removing the user's
 * Global override. Only settings with an actual Global override are counted and reset; if none are
 * customized, emits an info toast and returns. Otherwise shows a toast carrying an **Undo** action
 * that restores the captured prior values via {@link restoreImportStyles}. Workspace-level
 * overrides are intentionally left untouched — the extension writes only to Global.
 */
export async function executeResetImportStyles(): Promise<void> {
  const customized: StyleSnapshot[] = [];
  for (const ref of RESETTABLE_STYLES) {
    const priorValue = inspectAutoImportSetting<string>(ref.namespace, ref.key)?.globalValue;
    if (priorValue !== undefined) {
      customized.push({ ...ref, priorValue });
    }
  }

  if (customized.length === 0) {
    showNotification('no-styles-to-reset');
    return;
  }

  await Promise.all(customized.map(s => setAutoImportSetting(s.namespace, s.key, undefined)));

  void showNotification('styles-reset', { count: customized.length }).then(action => {
    switch (action) {
      case 'Undo':
        void restoreImportStyles(customized);
        break;
    }
  });
}

/**
 * Restores the captured Global overrides from a reset snapshot, re-writing each prior value, then
 * confirms with an info toast. Exported so the restore path is unit-testable without clicking the
 * Undo toast button (which is a manual-QA boundary).
 */
export async function restoreImportStyles(snapshot: ReadonlyArray<StyleSnapshot>): Promise<void> {
  await Promise.all(snapshot.map(s => setAutoImportSetting(s.namespace, s.key, s.priorValue)));
  showNotification('styles-restored');
}
