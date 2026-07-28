# Table Implementation

Date: 2026-07-28

## Result

The Table keeps one semantic native `<table>` and now has an explicit, stable viewport contract:

```text
j-table host
└─ .j-table
   ├─ toolbar / caption actions
   ├─ bulk and filter state
   ├─ .j-table__scroll (the only overflow owner)
   │  ├─ table.j-table__element
   │  │  ├─ caption
   │  │  ├─ thead
   │  │  ├─ tbody
   │  │  └─ tfoot
   │  └─ loading overlay
   └─ j-paginator
```

No cloned header/body table and no reference-library dependency were introduced.

## Public scroll contract

- `scrollable` defaults to `true`, matching the previous effective overflow behavior. Setting it to
  `false` keeps the structural wrapper but removes overflow-region semantics and scrollbar behavior.
- `tableStyle` applies consumer-provided styles to the native table. A minimum width such as
  `110rem` makes overflow deterministic without a fixed height.
- `tableStyleClass` applies a class to the native table.
- `scrollLabel` names the keyboard-focusable scroll region.
- `scrollHeight` accepts a CSS height or `flex`. Horizontal-only scrolling uses an empty height.
- Column `width`, `minWidth`, and `maxWidth` remain the primary per-column sizing APIs.

## Frozen and resize behavior

Frozen columns share the native scroll table and use logical sticky offsets. Multiple start/end
columns accumulate preceding column widths. `frozenAlign: 'start' | 'end'` follows direction;
`'left' | 'right'` remains supported for compatibility.
Start-side offsets also reserve deterministic widths for leading selection, expansion, lock, and
row-reorder controls, so frozen data columns do not drift before becoming sticky.

Resize uses pointer events, computed minimum/maximum widths, RTL-aware delta, fit-mode neighbor
clamping, and centralized listener cleanup. Expand mode increases the table's max-content width and
therefore naturally creates horizontal overflow.

## Data and interaction corrections

- Nested fields now use one accessor for display, sort, field filter, and global search.
- Scroll mode no longer removes responsive-priority columns at narrow widths.
- Loading marks the native table inert while leaving the viewport itself scrollable.
- Sticky frozen headers have a higher stacking layer and token-driven separator.
- Forced-colors focus/separator behavior and reduced-motion behavior are preserved.
- Shift+Arrow range selection and Ctrl/Cmd+A operate on eligible visible rows without intercepting
  native controls inside cells.
- Expansion supports single/multiple modes, a per-row eligibility predicate, and linked
  `aria-controls`/content IDs.
- Filter menus move focus into the active popup, contain keyboard traversal, close on Escape, and
  restore focus to their trigger.
- Virtual data mode emits deduplicated visible ranges through the existing lazy-load event.
- Lazy virtual slices use `virtualFirst` and `totalRecords` to retain the full scroll geometry;
  unloaded slots render inert skeleton placeholders without entering selection or focus state.
- `filterModel.groups` supports independent per-field AND/OR constraint groups in client
  processing and serialized server queries.
- Column reordering cannot cross start-frozen, regular, or end-frozen regions.

## Documentation

The generated Scroll family now includes Horizontal, Vertical, Horizontal and Vertical, Flexible,
Frozen Rows, Frozen Columns, and Multiple Frozen Columns scenarios. The horizontal scenario uses
13 realistic columns, a `110rem` native-table minimum width, and no fixed vertical height. The
scenario generator remains the single source for both rendered preview and displayed HTML source.

Documentation preview grid/card/surface children now use `max-width: 100%` and `min-width: 0`; the
card keeps visible overflow and the `j-table` viewport owns the scrollbar.
The docs header switches to compact navigation at the same breakpoint as the menu button, avoiding
tablet-width page overflow.

## Browser harness

`npm run test:e2e:table` serves the built SPA and verifies real horizontal overflow and containment
at 320, 375, 768, and 1024px. It also checks physical sticky positions in LTR and RTL. The suite
checks pointer-driven expand resizing against actual table geometry, verifies native column
drag/drop ordering, and passes in Chromium/Edge and Firefox.

## Files changed

- `projects/jrng-ui/table/table.component.ts`
- `projects/jrng-ui/table/table.component.html`
- `projects/jrng-ui/table/table.component.scss`
- `projects/jrng-ui/table/table.types.ts`
- `projects/jrng-ui/table/table-scroll.component.spec.ts`
- `projects/jrng-ui/table/table-enterprise-interactions.spec.ts`
- `projects/jrng-ui/table/table-enterprise.spec.ts`
- `projects/jrng-ui/button/button.component.ts`
- `projects/jrng-ui/button/button.component.html`
- `projects/docs/src/app/demos/table-scenarios/table-scenario-state.ts`
- `projects/docs/src/app/demos/table-scenarios/table-scenarios.generated.ts`
- `projects/docs/src/styles.scss`
- `scripts/generate-table-scenarios.mjs`
- `scripts/serve-static-spa.mjs`
- `scripts/verify-package.mjs` (465 kB packed-package and 310 kB Table-entrypoint budgets)
- `projects/docs/e2e/table-scroll.e2e.spec.ts`
- `playwright.config.ts`
- `package.json`
- `package-lock.json`
- `docs/table.md`
- generated public registry metadata
- `reports/table-review/*`

## Independence statement

PrimeNG and Optimus UI were used to compare behaviors such as scroll ownership, sticky columns,
resize modes, selection state, and documentation scenario coverage. JRNG code, templates, styles,
types, tests, and documentation were implemented independently with JRNG selectors, tokens, and
modular entrypoints.
