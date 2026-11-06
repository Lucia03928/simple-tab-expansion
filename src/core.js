// Tab expansion and contraction with column-aware positioning.
//
// Design note: We treat a tab as advancing to the next multiple of tabWidth,
// not as replacing the tab with a fixed number of spaces. This is what terminal
// emulators and editors do, and it is the only behaviour that keeps columns
// aligned when text before the tab has a non-zero width. The cost is that the
// number of spaces a tab produces depends on where the tab starts, so
// expansion is not a simple string replace.
//
// The library works line by line. Tabs never cross a newline boundary, which
// matches how every editor and terminal behaves and keeps the column counter
// from leaking between lines.

/**
 * Expand tabs in a single line to spaces using column-aware positioning.
 *
 * @param {string} line - The input line. Must not contain newline characters.
 * @param {number} tabWidth - Number of columns between tab stops. Must be a positive integer.
 * @returns {string} The line with every tab replaced by the number of spaces needed to reach the next tab stop.
 */
export function expandLine(line, tabWidth) {
  if (!Number.isInteger(tabWidth) || tabWidth <= 0) {
    throw new RangeError('tabWidth must be a positive integer');
  }
  let out = '';
  let column = 0;
  for (const ch of line) {
    if (ch === '\t') {
      const spaces = tabWidth - (column % tabWidth);
      out += ' '.repeat(spaces);
      column += spaces;
    } else {
      out += ch;
      column += 1;
    }
  }
  return out;
}

/**
 * Expand tabs in a multi-line string to spaces using column-aware positioning.
 * Newlines are preserved verbatim. Tabs never cross a newline, so each line is
 * processed independently and the column counter resets at every line break.
 *
 * @param {string} text - The input text, possibly containing '\n' or '\r\n'.
 * @param {number} tabWidth - Number of columns between tab stops. Must be a positive integer.
 * @returns {string} The expanded text.
 */
export function expandTabs(text, tabWidth) {
  if (!Number.isInteger(tabWidth) || tabWidth <= 0) {
    throw new RangeError('tabWidth must be a positive integer');
  }
  // Split on newline but keep the newline characters so we can rejoin exactly.
  // We use a regex that matches either '\r\n' or '\n' so CRLF survives untouched.
  const parts = text.split(/(\r\n|\n)/);
  let out = '';
  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i];
    if (part === '\r\n' || part === '\n') {
      out += part;
    } else {
      out += expandLine(part, tabWidth);
    }
  }
  return out;
}

/**
 * Contract runs of spaces in a single line into tabs.
 *
 * A run of spaces is replaced by tabs only when doing so reaches the next tab
 * stop exactly. The leading partial run before the first tab stop is left as
 * spaces, because a tab cannot represent a partial advance without overshooting
 * the original column. This is the inverse of expandLine for lines whose spaces
 * came from expandLine, and it is the only rule that round-trips cleanly.
 *
 * @param {string} line - The input line. Must not contain newline characters.
 * @param {number} tabWidth - Number of columns between tab stops. Must be a positive integer.
 * @returns {string} The line with eligible space runs replaced by tabs.
 */
export function contractLine(line, tabWidth) {
  if (!Number.isInteger(tabWidth) || tabWidth <= 0) {
    throw new RangeError('tabWidth must be a positive integer');
  }
  let out = '';
  let column = 0;
  let i = 0;
  while (i < line.length) {
    const ch = line[i];
    if (ch === ' ') {
      let run = 0;
      while (i + run < line.length && line[i + run] === ' ') {
        run += 1;
      }
      // Emit tabs for every full tab stop we can cross, then spaces for the rest.
      let remaining = run;
      while (remaining > 0) {
        const toStop = tabWidth - (column % tabWidth);
        if (remaining >= toStop) {
          out += '\t';
          column += toStop;
          remaining -= toStop;
        } else {
          out += ' '.repeat(remaining);
          column += remaining;
          remaining = 0;
        }
      }
      i += run;
    } else {
      out += ch;
      column += 1;
      i += 1;
    }
  }
  return out;
}

/**
 * Contract runs of spaces in a multi-line string into tabs.
 * Newlines are preserved verbatim and each line is processed independently.
 *
 * @param {string} text - The input text, possibly containing '\n' or '\r\n'.
 * @param {number} tabWidth - Number of columns between tab stops. Must be a positive integer.
 * @returns {string} The contracted text.
 */
export function contractTabs(text, tabWidth) {
  if (!Number.isInteger(tabWidth) || tabWidth <= 0) {
    throw new RangeError('tabWidth must be a positive integer');
  }
  const parts = text.split(/(\r\n|\n)/);
  let out = '';
  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i];
    if (part === '\r\n' || part === '\n') {
      out += part;
    } else {
      out += contractLine(part, tabWidth);
    }
  }
  return out;
}
