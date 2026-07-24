import * as vscode from 'vscode';
import * as path from 'path';

import { getAutoImportSetting, setAutoImportSetting } from '../config/settings';
import { filterCopyablePaths, getFilePathInfo, getFilePathInfoFromPaths, parseClipboardPaths } from '../editor/file-path-info';
import { clearNotifications, showNotification } from '../editor/notification';
import { isStyleBlockContext } from '../editor/placement';
import { isPairSupported } from '../gating';
import { buildImportSnippetVariants, ImportSnippetVariant } from '../snippets/variants';

interface ImportStyleQuickPickItem extends vscode.QuickPickItem {
  setting: NonNullable<ImportSnippetVariant['setting']>;
}

export async function executeSetDefaultImportStyle(): Promise<void> {
  clearNotifications();

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return showNotification('no-active-editor');
  }

  const clipboardPaths = parseClipboardPaths(await vscode.env.clipboard.readText());
  const info = clipboardPaths.length > 1
    ? getFilePathInfoFromPaths(selectPrimaryClipboardPath(clipboardPaths, editor.document.uri.fsPath), editor.document.uri.fsPath)
    : await getFilePathInfo();
  const { sourceFilePath, destinationFilePath, sourceFileExt, destinationFileExt } = info;

  const trimmedSource = sourceFilePath.trim();
  if (trimmedSource === '' || !path.isAbsolute(trimmedSource)) {
    return showNotification('empty-clipboard');
  }
  // Extensionless sources are admitted only into a Markdown destination (as a link). Into `.md` the
  // flow continues and the fixed link shape yields a `no-configurable-style` toast below.
  if (path.extname(trimmedSource) === '' && destinationFileExt !== '.md') {
    return showNotification('no-extension', { basename: path.basename(sourceFilePath) });
  }

  if (sourceFilePath.toLowerCase() === destinationFilePath.toLowerCase()) {
    return showNotification('same-file-path');
  }

  try {
    await vscode.workspace.fs.stat(vscode.Uri.file(sourceFilePath));
  } catch {
    return showNotification('source-not-found', { basename: path.basename(sourceFilePath) });
  }

  // Inside an SFC `<style>` block a stylesheet source exposes the configurable CSS/SCSS styles;
  // elsewhere it is a fixed side-effect shape (→ the no-configurable-style guard below). Computed from
  // the primary member (this flow is single-pair).
  const insideStyleBlock = isStyleBlockContext(
    editor.document.getText(),
    destinationFileExt,
    [ sourceFileExt ],
    editor.selection.anchor.line,
  );

  const variants = await buildImportSnippetVariants(info, insideStyleBlock);

  const isEmptyVariantSet =
    variants.length === 0
    || variants[0].snippetText === ''
    || variants[0].snippetText === '\n';

  if (!isPairSupported(info) || isEmptyVariantSet) {
    return showNotification('not-supported', { sourceExt: sourceFileExt, destinationExt: destinationFileExt });
  }

  if (variants.length === 1 || variants[0].setting === undefined) {
    return showNotification('no-configurable-style', { sourceExt: sourceFileExt, destinationExt: destinationFileExt });
  }

  const { namespace, key } = variants[0].setting;
  const currentValue = getAutoImportSetting<string>(namespace, key);

  const picked = await vscode.window.showQuickPick(toQuickPickItems(variants, currentValue), {
    placeHolder: 'Set default import style',
    matchOnDescription: true,
  });
  if (!picked) {
    return;
  }

  await setAutoImportSetting(picked.setting.namespace, picked.setting.key, picked.setting.value);
  return showNotification('default-style-saved', { description: picked.setting.value });
}

function toQuickPickItems(
  variants: ImportSnippetVariant[],
  currentValue: string | undefined,
): ImportStyleQuickPickItem[] {
  const items: ImportStyleQuickPickItem[] = [];
  let currentIdx = -1;
  for (const v of variants) {
    if (!v.setting) {
      continue;
    }
    const isCurrent = v.setting.value === currentValue;
    if (isCurrent) {
      currentIdx = items.length;
    }
    items.push({
      label: v.label,
      description: isCurrent ? '$(check) Current default' : v.description,
      setting: v.setting,
    });
  }
  if (currentIdx > 0) {
    const [current] = items.splice(currentIdx, 1);
    items.unshift(current);
  }
  return items;
}

/**
 * A multi-selection clipboard reduces to one member for the persist flow (single-pair by design):
 * the first copyable member that isn't the destination itself, else the first copyable member,
 * else the first line — so the single-path failure toasts stay specific to what was selected.
 */
function selectPrimaryClipboardPath(clipboardPaths: string[], destinationFilePath: string): string {
  const copyable = filterCopyablePaths(clipboardPaths);
  return copyable.find(candidate => candidate.toLowerCase() !== destinationFilePath.toLowerCase())
    ?? copyable[0]
    ?? clipboardPaths[0];
}
