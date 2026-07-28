# Table Test Results

Date: 2026-07-28

## Commands and exact results

| Command                                                                             | Result                                                                                                    |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `npx ng test jrng-ui --watch=false --include='projects/jrng-ui/table/**/*.spec.ts'` | Pass: 14 files, 87 tests                                                                                  |
| `npm run lint`                                                                      | Pass: ESLint exited 0                                                                                     |
| `npm run typecheck`                                                                 | Pass: full-compilation library build and development docs build exited 0                                  |
| `npm run test`                                                                      | Pass: workspace command exited 0; 690 library tests and 28 docs tests reported by the two Vitest projects |
| `npm run build:docs`                                                                | Pass: production library package and docs application build exited 0                                      |
| `npm run verify:registry`                                                           | Pass: verified public registry for 119 components                                                         |
| `npm run verify:doc-examples`                                                       | Pass: verified 6 file-backed demos and public selectors                                                   |
| `npm run verify:package`                                                            | Pass: package validation exited 0                                                                         |
| `npm run pack:dry-run`                                                              | Pass: 266 files, 456.9 kB packed, 3.2 MB unpacked                                                         |

No `e2e`, Playwright, Cypress, or WebDriver command/configuration exists in this repository.

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

## Static verification

- Table production output is exported through `jrng-ui/table`.
- The generated registry includes the public Table entrypoint and regenerated component metadata.
- Search found no PrimeNG or Optimus import in JRNG Table source.
- No `pTable`, `pSortableColumn`, or PrimeNG `p-` selector was introduced.
- Reports and tests are not copied into the npm package; dry-run contents confirm this.
- The scenario generator supplies the exact HTML string used by both the compiled scenario and
  displayed source metadata.

## Browser-level gap

JSDOM cannot prove `scrollWidth > clientWidth`, pixel-perfect sticky alignment, physical scrollbar
visibility, pointer drag geometry, touch momentum, or page-level overflow at 320/375/768/1024px.
Those checks remain required before claiming full browser stability. Recommended follow-up:

1. Add Playwright as the repository-standard e2e harness.
2. Serve the production docs build and open `/docs/components#table`.
3. Assert the horizontal scenario viewport has `scrollWidth > clientWidth`, `documentElement`
   does not overflow, sticky columns retain their bounding edge in LTR/RTL, and resize/reorder work.
4. Run at 320, 375, 768, 1024, and desktop widths in Chromium plus one non-Chromium engine.

## Final status

All configured repository checks pass. The focused architecture and interaction changes are
validated at unit/integration/build/package level. Full real-browser completion is not claimed
because the required e2e infrastructure is absent.
