import * as vscode from 'vscode';

const { freeze } = Object;

const AUTO_IMPORT_CONFIG = freeze({
  preferences: freeze({
    namespace: 'drag-import.preferences',
    settings: freeze({
      placement: 'importStatementPlacement',
      requestReview: 'requestReview',
    }),
  }),
  script: freeze({
    namespace: 'drag-import.importStatement.script',
    settings: freeze({
      preserve: 'preserveScriptFileExtension',
      javascript: 'javascriptImportStyle',
      typescript: 'typescriptImportStyle',
    }),
  }),
  stylesheet: freeze({
    namespace: 'drag-import.importStatement.styleSheet',
    settings: freeze({
      preserve: 'preserveStylesheetFileExtension',
      css: 'cssImportStyle',
      cssImage: 'cssImageImportStyle',
      scss: 'scssImportStyle',
      scssImage: 'scssImageImportStyle',
    }),
  }),
  markup: freeze({
    namespace: 'drag-import.importStatement.markup',
    settings: freeze({
      htmlScript: 'htmlScriptImportStyle',
      htmlImage: 'htmlImageImportStyle',
      htmlVideo: 'htmlVideoImportStyle',
      htmlAudio: 'htmlAudioImportStyle',
      htmlStyleSheet: 'htmlStyleSheetImportStyle',
      markdown: 'markdownImportStyle',
      markdownImage: 'markdownImageImportStyle',
    }),
  }),
  latex: freeze({
    namespace: 'drag-import.importStatement.latex',
    settings: freeze({
      preserve: 'preserveGraphicsFileExtension',
      graphics: 'graphicsImportStyle',
      input: 'inputImportStyle',
      bibliography: 'bibliographyImportStyle',
    }),
  }),
});

export type AutoImportConfigNamespace =
  | 'preferences'
  | 'script'
  | 'stylesheet'
  | 'markup'
  | 'latex';

type SettingsKeyMap = {
  preferences: 'placement' | 'requestReview';
  script: 'preserve' | 'javascript' | 'typescript';
  stylesheet: 'preserve' | 'css' | 'cssImage' | 'scss' | 'scssImage';
  markup: 'htmlScript' | 'htmlImage' | 'htmlVideo' | 'htmlAudio'
        | 'htmlStyleSheet' | 'markdown' | 'markdownImage';
  latex: 'preserve' | 'graphics' | 'input' | 'bibliography';
};

export type AutoImportSettingKey = SettingsKeyMap[AutoImportConfigNamespace];

export function getAutoImportSetting<T = unknown, N extends AutoImportConfigNamespace = AutoImportConfigNamespace>(
  namespaceKey: N,
  settingKey: SettingsKeyMap[N]
): T | undefined {
  const { namespace, settings } = AUTO_IMPORT_CONFIG[namespaceKey];
  const configuration = vscode.workspace.getConfiguration(namespace);
  const settingProperty = (settings as Record<string, string>)[settingKey];
  return configuration.get<T>(settingProperty);
}

export function setAutoImportSetting<T = unknown, N extends AutoImportConfigNamespace = AutoImportConfigNamespace>(
  namespaceKey: N,
  settingKey: SettingsKeyMap[N],
  value: T,
  target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Global,
): Thenable<void> {
  const { namespace, settings } = AUTO_IMPORT_CONFIG[namespaceKey];
  const configuration = vscode.workspace.getConfiguration(namespace);
  const settingProperty = (settings as Record<string, string>)[settingKey];
  return configuration.update(settingProperty, value, target);
}

/**
 * Reads the full inspection record for a setting (declared default vs. per-target overrides) so
 * callers can distinguish a user override from the `package.json` default — a distinction
 * `getAutoImportSetting` collapses, since `.get()` already falls back to the default. Resolves the
 * backing property through the same `AUTO_IMPORT_CONFIG` alias map as the get/set helpers.
 */
export function inspectAutoImportSetting<T = unknown, N extends AutoImportConfigNamespace = AutoImportConfigNamespace>(
  namespaceKey: N,
  settingKey: SettingsKeyMap[N],
) {
  const { namespace, settings } = AUTO_IMPORT_CONFIG[namespaceKey];
  const configuration = vscode.workspace.getConfiguration(namespace);
  const settingProperty = (settings as Record<string, string>)[settingKey];
  return configuration.inspect<T>(settingProperty);
}
