import * as path from 'path';
import { camelCase, capitalize } from 'lodash';

export function getImportName(relativePath: string) {
  return capitalize(camelCase(path.parse(relativePath).name));
}
