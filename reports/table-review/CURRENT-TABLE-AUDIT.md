# Current Table Audit

Date: 2026-07-28

## Scope and method

The audit covered every file in `projects/jrng-ui/table`, the table scenario generator and generated
documentation, `docs/table.md`, the documentation preview containers, theme tokens, the public
registry, and all Table unit/integration specifications. PrimeNG and Optimus UI were inspected only
for observable behavior and API concepts. No reference implementation code was copied.

Behavioral reference locations:

- `C:\Projects\angular-ui-workspace\primeng-reference\packages\primeng\src\table`
- `C:\Projects\angular-ui-workspace\primeng-reference\apps\showcase\doc\table`
- `C:\Projects\angular-ui-workspace\optimus-ui-reference\packages\optimus-ui\src\table`
- `C:\Projects\angular-ui-workspace\optimus-ui-reference\apps\docs\doc\table`

## Architecture found

The existing component was already a broad, independent JRNG implementation. It used one semantic
native table inside `.j-table__scroll`, with toolbar/bulk controls before the viewport and paginator
after it. This is the correct base architecture and avoids duplicated header/body tables.

The implementation already included client sorting/filtering/pagination, lazy query events,
selection, expansion, editing, grouping, resize/reorder, column visibility, loading/empty states,
CSV export, virtual windowing, state persistence, typed keyed templates, and JRNG token-based
styles. Eighty pre-existing Table tests passed at the start of the audit.

## Confirmed issues

| Severity | Confirmed issue                                                                                                                                                      | Affected files                                                                         | Recommended fix / disposition                                                                                                                        |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Critical | Horizontal overflow existed internally but there was no public `scrollable` switch or `tableStyle` input, so consumers could not reliably force a wide native table. | `table.component.ts`, `table.component.html`, `table.component.scss`                   | Added `scrollable`, `tableStyle`, `tableStyleClass`, and `scrollLabel`; the viewport owns overflow and the table accepts an explicit minimum width.  |
| Critical | The horizontal documentation scenario always set `scrollHeight="18rem"`, so it was actually a combined-scroll example with too few purpose-built columns.            | `generate-table-scenarios.mjs`, generated scenarios, scenario state                    | Added a 13-column customer dataset, a `110rem` table minimum, no vertical height, and the required explanatory note.                                 |
| High     | `scrollHeight="flex"` produced the invalid declaration `max-height: flex`.                                                                                           | `table.component.ts`, `table.component.scss`                                           | Added a dedicated flex-scroll layout that fills a parent with `min-height: 0` and installs no resize observer.                                       |
| High     | Frozen columns used physical `left`/`right`, producing incorrect inline-start/inline-end behavior in RTL.                                                            | `table.component.ts`, `table.component.html`, `table.component.scss`, `table.types.ts` | Replaced offsets with logical inset properties; added `start`/`end` while retaining `left`/`right` aliases.                                          |
| High     | Responsive-priority CSS hid columns at 960/720/480px even when the selected responsive mode was horizontal scrolling.                                                | `table.component.scss`                                                                 | Removed implicit hiding from scroll mode. Narrow tables now retain their columns and scroll.                                                         |
| High     | Nested field paths were rendered, filtered, globally searched, and sorted through inconsistent direct-property paths.                                                | `table.component.ts`                                                                   | Added one nested field resolver and routed display, filtering, global search, and sorting through it.                                                |
| Medium   | The loading overlay covered the scroll viewport as a pointer target.                                                                                                 | `table.component.html`, `table.component.scss`                                         | Made the data table inert while loading and the visual overlay pointer-transparent, preserving viewport scrolling without allowing cell interaction. |
| Medium   | Column resizing ignored CSS min/max widths, used LTR drag delta in RTL, and did not suppress text selection.                                                         | `table.component.ts`, `table.component.scss`                                           | Clamp to computed min/max widths, reverse inline delta in RTL, preserve fit-mode neighbor minimums, and expose an `is-resizing` interaction state.   |
| Medium   | Frozen headers shared paint order with regular sticky headers and lacked a semantic separator.                                                                       | `table.component.scss`                                                                 | Raised frozen sticky header stacking and added token-driven inline separators.                                                                       |
| Medium   | Documentation grid/card children did not all declare `min-width: 0`, allowing wide descendants to grow the page grid.                                                | `projects/docs/src/styles.scss`                                                        | Constrained preview grid, card, surface, and projected preview children while leaving overflow visible for the table viewport.                       |
| Medium   | The prose guide contained obsolete examples (`striped`, `responsive`, `cellEditing`).                                                                                | `docs/table.md`                                                                        | Replaced them with current JRNG inputs and added horizontal, vertical, combined, flexible, and frozen guidance.                                      |
| Low      | High-contrast treatment did not explicitly preserve frozen separators and table focus indication.                                                                    | `table.component.scss`                                                                 | Added forced-colors borders and focus outlines.                                                                                                      |

## Container and width findings

- `.j-table`, its host, and the documentation scenario host already had `max-width: 100%` and
  `min-width: 0`.
- `.j-preview-card` already used `overflow: visible`; it did not clip the scrollbar.
- `.j-preview-surface` centered content but needed explicit grid-item shrink constraints.
- The native table used `width: max-content` with `min-width: 100%`; it was not forcibly fixed to
  `width: 100%`.
- Toolbar and paginator were outside the viewport, so neither displaced nor covered the horizontal
  scrollbar.
- Loading overlay positioning was inside the viewport and required the interaction correction
  described above.

## Duplication and inconsistency findings

- Main filtering and `jProcessTableData` remain separate processing paths. They are similar but serve
  component and headless-use cases; consolidating them safely needs a dedicated compatibility pass.
- Template discovery mixes typed directives for keyed templates with legacy named template
  references for toolbar/footer/group/expanded rows. This preserves compatibility but leaves some
  contexts less strongly typed.
- `dataMode="lazy"` is the fully exercised server-side path. The separate `server` value exists in
  types but is not as comprehensively exercised.

## Remaining audit risks

The repository has no configured Playwright, Cypress, WebDriver, or e2e npm command. Layout-dependent
sticky positioning, pointer drag, real scrollbar visibility, touch momentum, and page-width checks
therefore still require a browser test harness before the entire Table surface should be labelled
fully stable. See `TABLE-FEATURE-MATRIX.md` and `TABLE-TEST-RESULTS.md`.
