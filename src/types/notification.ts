export type NotificationType =
  | 'same-file-path'
  | 'not-supported'
  | 'no-active-editor'
  | 'no-file-to-copy'
  | 'no-extension'
  | 'empty-clipboard'
  | 'source-not-found'
  | 'copy-success'
  | 'no-configurable-style'
  | 'default-style-saved'
  | 'placement-saved'
  | 'preserve-script-extension-toggled'
  | 'styles-reset'
  | 'no-styles-to-reset'
  | 'styles-restored'
  /** The one-time Marketplace-review ask; raised by `editor/review-prompt.ts`, not a command. */
  | 'review-request';
