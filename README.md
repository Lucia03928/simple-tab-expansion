# simple-tab-expansion

Expands and contracts tabs to spaces with configurable tab width and column-aware positioning.

```js
import { expandTabs, contractTabs } from './src/index.js';

const source = 'a\tb\ncd\te';
const expanded = expandTabs(source, 4);
// 'a   b\ncd  e'

const back = contractTabs(expanded, 4);
// 'a\tb\ncd\te'
```

The package exports four functions:

- `expandLine(line, tabWidth)` — expands tabs in one line.
- `expandTabs(text, tabWidth)` — expands tabs across a multi-line string.
- `contractLine(line, tabWidth)` — contracts eligible space runs in one line.
- `contractTabs(text, tabWidth)` — contracts eligible space runs across a multi-line string.

`tabWidth` must be a positive integer; anything else throws a `RangeError`.

## Why this exists

The obvious way to expand a tab is `line.replace(/\t/g, ' '.repeat(tabWidth))`. That is wrong whenever a tab does not start at column 0: a tab is a move to the next tab stop, not a fixed number of spaces. A line like `ab\tx` with width 4 should become `ab  x`, not `ab    x`. This library tracks the column as it walks the line so tabs land on the correct stops.

The trade-off is that expansion is no longer a single string replacement; it is a per-character scan. That costs a little speed but is the only way to get column alignment right, which is the whole point.

## The awkward edge

Contraction is not a perfect inverse of expansion for arbitrary input. A run of spaces is only turned into a tab when it reaches the next tab stop exactly; a partial run such as two leading spaces at width 4 stays as spaces, because a tab would overshoot the original column. Expansion followed by contraction round-trips exactly, but contraction of hand-written text may leave some spaces in place. That is intentional: the alternative would silently move text to the right.

Newlines are preserved verbatim, including `\r\n`, and tabs never cross a line boundary.
