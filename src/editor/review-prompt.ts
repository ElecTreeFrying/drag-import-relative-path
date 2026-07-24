import * as vscode from 'vscode';

import { getAutoImportSetting } from '../config/settings';
import { showNotification } from './notification';

/**
 * Deep link to the running extension's own Marketplace review tab, built from its runtime identity
 * rather than a hardcoded id. This module is mirrored verbatim into the sibling drag-import extension,
 * whose sync applies namespace sweeps only — a literal `itemName` would survive the sweep and send that
 * extension's users to this listing's review page.
 */
function buildReviewUrl(extensionId: string): string {
  return `https://marketplace.visualstudio.com/items?itemName=${extensionId}&ssr=false#review-details`;
}

/** `globalState` key holding the lifetime count of successful import gestures. */
const IMPORT_COUNT_KEY = 'autoImport.successfulImports';

/** `globalState` key holding the count at which the prompt may next fire; `Infinity` once silenced. */
const NEXT_PROMPT_AT_KEY = 'autoImport.nextReviewPromptAt';

/**
 * Gestures required before the first prompt. High enough that only a habitual user ever sees it —
 * someone who has imported this many times has demonstrably gotten value and is a fair person to ask.
 */
const FIRST_PROMPT_THRESHOLD = 25;

/** Gestures added before re-asking someone who chose **Not now**. Deliberately far out — one snooze, not a nag cycle. */
const SNOOZE_INTERVAL = 175;

/** Sentinel stored in `NEXT_PROMPT_AT_KEY` once the user opts out permanently. */
const NEVER = Number.MAX_SAFE_INTEGER;

/**
 * The extension's global memento, stashed at activation. Module-local rather than threaded through
 * every command signature: the counter is incidental to import generation, and `activate()` is the
 * only place holding an `ExtensionContext`.
 */
let globalState: vscode.Memento | undefined;

/** The running extension's `publisher.name` id, captured alongside the memento. Feeds {@link buildReviewUrl}. */
let extensionId = '';

/** Captures the global memento so {@link recordSuccessfulImport} can persist across sessions. Called once from `activate`. */
export function initReviewPrompt(context: vscode.ExtensionContext): void {
  globalState = context.globalState;
  extensionId = context.extension.id;
}

/**
 * Records one successful import gesture and, on crossing the threshold, asks for a Marketplace review.
 *
 * Counts **gestures, not files** — a multi-file paste or drop inserts one stacked block and counts once,
 * so a single Explorer multi-select can't fast-forward someone to the prompt.
 *
 * The toast is scheduled off the current turn rather than awaited: the command flow returns void and the
 * drop flow is mid-drag, and neither should block on a notification the user may ignore.
 */
export function recordSuccessfulImport(): void {
  if (!globalState) {
    return;
  }

  const count = globalState.get<number>(IMPORT_COUNT_KEY, 0) + 1;
  void globalState.update(IMPORT_COUNT_KEY, count);

  if (count < globalState.get<number>(NEXT_PROMPT_AT_KEY, FIRST_PROMPT_THRESHOLD)) {
    return;
  }

  // Read late — a user who disabled the setting after installing should never see the prompt, even
  // though their counter kept advancing.
  if (getAutoImportSetting<boolean>('preferences', 'requestReview') === false) {
    return;
  }

  // Silence before showing, not after: if the window closes while the toast is up, the prompt is spent
  // rather than re-firing on the next import.
  void globalState.update(NEXT_PROMPT_AT_KEY, NEVER);

  setTimeout(() => void promptForReview(count), 0);
}

/** Shows the review toast and dispatches on the chosen button. Labels are byte-synced with `notification.ts`. */
async function promptForReview(count: number): Promise<void> {
  const action = await showNotification('review-request', { count });

  switch (action) {
    case 'Rate It':
      void vscode.env.openExternal(vscode.Uri.parse(buildReviewUrl(extensionId)));
      return;
    case 'Not Now':
      void globalState!.update(NEXT_PROMPT_AT_KEY, count + SNOOZE_INTERVAL);
      return;
    default:
      // Both **Never Ask Again** and dismissing the toast outright leave the `NEVER` sentinel written
      // above in place. Treating a dismissal as a no is deliberate — someone who ignored the ask
      // should not be asked twice.
      return;
  }
}

/** Clears both counters. Test-only seam — nothing in the extension resets a user's review state. */
export function resetReviewPromptState(): Thenable<void> {
  if (!globalState) {
    return Promise.resolve();
  }
  return Promise.all([
    globalState.update(IMPORT_COUNT_KEY, undefined),
    globalState.update(NEXT_PROMPT_AT_KEY, undefined),
  ]).then(() => undefined);
}

/** Reads the lifetime gesture count. Test-only seam. */
export function getSuccessfulImportCount(): number {
  return globalState ? globalState.get<number>(IMPORT_COUNT_KEY, 0) : 0;
}

/**
 * Drops the captured memento, returning the module to its pre-`initReviewPrompt` inert state so
 * `recordSuccessfulImport` early-returns. Test-only seam: lets a test file restore the singleton it
 * installed, so a later-loading file's import gestures don't advance a stale counter.
 */
export function deinitReviewPromptForTest(): void {
  globalState = undefined;
  extensionId = '';
}
