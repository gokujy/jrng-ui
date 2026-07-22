# Component Parity Audit

Date: 2026-07-06. Scope: flagship, most feature-rich components (representative of
library-wide gaps). Verdicts compare JRNG UI's current implementation against the
documented API of a leading reference Angular UI library.

## Summary matrix

| Component    | Parity          | Biggest missing features                                                                                                  |
| ------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Table        | **Medium-High** | Virtual scroll, row grouping, multi-level header groups, radio + meta/shift range selection, filter match-modes/operators |
| Select       | **Medium**      | Multiple selection, working virtual scroll (stub only), editable, lazy load, checkmark, filter match-modes                |
| MultiSelect  | **Medium**      | Virtual scroll, option grouping, selection limit, lazy load, overlay portal, per-chip remove, header/footer templates     |
| Tree         | **Medium**      | Checkbox cascade/indeterminate, select-all, virtual scroll, drag-drop, context menu, controllable `expandedKeys`          |
| Autocomplete | **Medium**      | Multiple selection, virtual scroll, item/group templating, loading state, `showClear`                                     |
| Date-picker  | **Low-Medium**  | Time picker, integrated range/multiple selection, multi-month, inline mode, real i18n, `appendTo`                         |

Overall: JRNG covers **everyday use** of each component well (forms/CVA, a11y,
keyboard nav, core interactions) but trails on **advanced/scale features**.
Date-picker was the weakest; Table is the strongest.

## Recurring cross-cutting gaps (fix once, benefit many)

These appear across most components and are the highest-leverage fixes:

1. **Virtual scrolling** — missing/stubbed in table, select, multiselect, tree,
   autocomplete. A `jrng-ui/virtual-scroller` entrypoint exists but wasn't wired into
   the overlay/list components. _Highest recurring gap._
2. **Overlay portaling (`appendTo="body"`)** — dropdown components used plain in-flow
   absolute positioning; `appendTo` was a dead input. Causes clipping inside
   `overflow:hidden`/dialogs. Needs a shared overlay service.
3. **Rich templating slots** — header/footer/group/empty/loader/icon templates; JRNG
   typically exposes only an item template (or none).
4. **Filter match-modes & multi-field filter** — select/multiselect/table/tree filter
   with `contains`-only, single-field, no match-mode/operator support.
5. **Multiple selection** — select and autocomplete are single-only.
6. **Grouping** — multiselect lacks option grouping; table lacks row grouping.

## Component-specific highlights

- **Table:** add virtual scroll, row grouping (subheader + rowspan), grouped column
  headers, radio/range selection, menu filters with match-modes.
- **Date-picker:** add time picker (`showTime`/`hourFormat`/seconds), unify range +
  multiple into the main component, multi-month, inline mode, locale-driven month/day
  names + `firstDayOfWeek`, honor `appendTo`.
- **Tree:** checkbox parent↔child cascade + indeterminate, select-all header,
  controllable `expandedKeys`, drag-drop, context menu.

## Progress (2026-07-07)

- ✅ **Overlay portaling** — shared `JOverlayService` (flip/fit/reposition) in
  `jrng-ui/core`; adopted by `select`, `multiselect`, `autocomplete`, `date-picker`.
  Remaining: `menu`, `popover`, etc.
- ✅ **Virtual scrolling** — `scrollToIndex` added; wired into `select` and
  `multiselect`. Remaining: `tree`, `table`.
- ✅ **Filter match-modes** — shared `jMatchesFilter`/`jFilterBy` in core; adopted by
  `select`, `multiselect`. Remaining: `table`, `tree`, multi-field `filterBy`.
- ✅ **Runtime theming + preset library** — `jrng-ui/theming` (`JThemeService`, 6 presets).
- ✅ **Date-picker** — i18n, `appendTo`, time picker, inline, range + multiple. Remaining: multi-month.
- ⏳ Remaining: tree checkbox cascade, table row grouping, wider audit of the long tail.

## Recommended fix order (by leverage)

1. ~~Shared overlay/portal service~~ ✅
2. **Wire virtual scroll** into remaining lists + table.
3. **Filter match-modes** → table, tree.
4. **Multiple selection** for autocomplete.
5. ~~Date-picker feature push~~ ✅ (multi-month remains)
6. **Tree** checkbox cascade + expandedKeys.
7. **Templating slots** pass across overlay components.

> Note: this audit covers 6 flagship components. The recurring gaps almost
> certainly generalize to sibling components (e.g. listbox, select, mega-menu).
> Extend the audit per component as they are worked (see `ROADMAP.md`).
