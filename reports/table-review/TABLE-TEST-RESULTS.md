# Table Test Results

Date: 2026-07-28

## Commands and exact results

| Command                                                                             | Result                                                                                                      |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `npx ng test jrng-ui --watch=false --include='projects/jrng-ui/table/**/*.spec.ts'` | Pass: 14 files, 95 tests                                                                                    |
| `npm run lint`                                                                      | Pass: ESLint exited 0                                                                                       |
| `npm run typecheck`                                                                 | Pass: full-compilation library build and development docs build exited 0                                    |
| `npm run test`                                                                      | Pass: workspace command exited 0; 698 library tests and 28 docs tests reported by the two Vitest projects   |
| `npm run build:docs`                                                                | Pass: production library package and docs application build exited 0                                        |
| `npm run verify:registry`                                                           | Pass: verified public registry for 119 components                                                           |
| `npm run verify:doc-examples`                                                       | Pass: verified 6 file-backed demos and public selectors                                                     |
| `npm run verify:package`                                                            | Pass: package validation exited 0                                                                           |
| `npm run pack:dry-run`                                                              | Pass: 266 files, 460.1 kB packed, 3.2 MB unpacked                                                           |
| Focused Table plus shared Button accessibility specs                                | Pass: 15 files, 106 tests                                                                                   |
| `$env:PLAYWRIGHT_CHANNEL='msedge'; npm run test:e2e:table`                          | Pass: 8 Edge tests: four responsive widths, LTR/RTL frozen scrolling, pointer resize, and column reorder    |
| `$env:PLAYWRIGHT_BROWSER='firefox'; npm run test:e2e:table`                         | Pass: 8 Firefox tests: four responsive widths, LTR/RTL frozen scrolling, pointer resize, and column reorder |

The new `test:e2e:table` command serves the production documentation build and uses Playwright.
`PLAYWRIGHT_CHANNEL` can select an installed Chromium channel, while `PLAYWRIGHT_BROWSER` selects
the engine. Final local runs used Microsoft Edge and Playwright Firefox.

## Added regression coverage

`table-scroll.component.spec.ts` adds seven tests covering:

- viewport ownership, keyboard focus, accessible name, and explicit native-table minimum width;
- non-scrollable overflow behavior;
- valid flexible-height styles;
- logical start/end sticky offsets in RTL;
- dynamic columns and changed table minimum width;
- one nested-field path for render, sort, and filter;
- loading-overlay removal without replacing the scroll viewport.

Existing Table tests cover sorting and `aria-sort`, field/global filters, pagination, selection and
header checkbox state, roving row focus, expansion, editing validation/cancellation, row and column
management, state restoration validation, virtual windowing, loading/empty states, CSV export,
custom templates, multiple table isolation, resize listener cleanup, and disabled interactions.

Additional advanced tests cover Shift+Arrow range selection, Ctrl/Cmd+A, single expansion,
ineligible expansion togglers, `aria-controls`, filter-menu focus restoration, frozen-region
reordering, deduplicated lazy virtual ranges, unloaded virtual placeholders, and per-field AND/OR
constraint groups.

## Static verification

- Table production output is exported through `jrng-ui/table`.
- The generated registry includes the public Table entrypoint and regenerated component metadata.
- Search found no PrimeNG or Optimus import in JRNG Table source.
- No `pTable`, `pSortableColumn`, or PrimeNG `p-` selector was introduced.
- Reports and tests are not copied into the npm package; dry-run contents confirm this.
- The scenario generator supplies the exact HTML string used by both the compiled scenario and
  displayed source metadata.

## Browser-level verification

The browser suite confirms `scrollWidth > clientWidth`, native horizontal movement, no
document-level horizontal overflow at all four required responsive widths, and stable frozen
column edges in LTR and RTL while the table viewport scrolls. These checks pass in Edge and Firefox.
The pointer test also confirms that expand-mode column resizing increases the native table width.
Native drag/drop also confirms the resulting column order in the rendered header.

Row drag/drop geometry, touch momentum, WebKit, and physical high-contrast rendering remain
recommended follow-up coverage.

## Final status

All configured repository checks pass. The focused architecture and interaction changes are
validated at unit, integration, build, package, and Edge/Firefox browser-layout levels.
