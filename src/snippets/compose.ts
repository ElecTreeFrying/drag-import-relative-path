// Pure string composition for multi-file drops — no `vscode` import, so it is Node-testable.
//
// A drop of several files produces several import snippets. VS Code links tab stops that share a
// number (typing in one updates all), so naively concatenating snippets — each authored with `$1`
// — would chain every import's placeholder together. These helpers renumber each statement's tab
// stops past the previous ones, then assemble the block, keeping every import's placeholder
// independent. A single-statement join is byte-identical to the pre-multi-file single-drop output.

/** A statement rewritten with offset tab stops, plus its original (pre-offset) maximum tab-stop number. */
interface ShiftedStatement {
  value: string;
  maxStop: number;
}

/**
 * Renumbers every tab stop in `value` by `offset`, returning the rewritten string and the original
 * (pre-offset) maximum tab-stop number — so a caller chaining statements advances its running offset
 * by exactly that max. Handles both `${N:default}` placeholders (default text preserved) and bare
 * `$N` tab stops. A tab-stop-free statement yields `maxStop: 0`, so it consumes no offset.
 */
export function shiftTabStops(value: string, offset: number): ShiftedStatement {
  let maxStop = 0;
  const shifted = value.replace(/\$\{(\d+)(?=[:|}])|\$(\d+)/g, (_match, braced, bare) => {
    const original = Number(braced ?? bare);
    if (original > maxStop) {
      maxStop = original;
    }
    const renumbered = original + offset;
    return braced !== undefined ? `\${${renumbered}` : `$${renumbered}`;
  });
  return { value: shifted, maxStop };
}

/**
 * Assembles N import statements into one insertable block: each statement's tab stops are offset
 * past the previous statements' so they stay independent, each statement's first line is prefixed
 * with `indentation`, statements are joined by newlines, and the block ends with one trailing
 * newline. A single statement renders as `indentation + value + '\n'` — byte-identical to the
 * single-drop output, so the N === 1 path keeps the legacy behaviour exactly.
 */
export function joinImportStatements(values: string[], indentation: string): string {
  let offset = 0;
  const lines = values.map(value => {
    const { value: shifted, maxStop } = shiftTabStops(value, offset);
    offset += maxStop;
    return indentation + shifted;
  });
  return lines.join('\n') + '\n';
}
